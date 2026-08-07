(function () {
  "use strict";

  const core = window.NexioCore;
  if (!core) throw new Error("NexioCore must load before the UI layer.");
  const ui = window.NexioUI = window.NexioUI || {};

  ui.applyLayoutMode = function applyLayoutMode(mode) {
    document.body.dataset.uiLayout = mode;
    document.body.classList.remove("layout-desktop", "layout-tablet", "layout-mobile");
    document.body.classList.add(`layout-${mode}`);
  };

  const SESSION_KEY = "nexio-session-email";
  const ONBOARDING_KEY = "nexio-onboarding-complete-v1";
  const LANGUAGE_KEY = "nexio-interface-language-v1";
  const LOCAL_USER_EMAIL = "sem-login@nexio.local";
  const AUTH_SERVICE_UNAVAILABLE_MESSAGE = "O serviço de autenticação está indisponível no momento. Tente novamente mais tarde.";
  const SYNC_SERVER_UPDATE_MESSAGE = "A sincronização precisa ser atualizada no servidor. Seus dados continuam salvos neste dispositivo.";
  const readStorage = (key, fallback = "") => core.storage.getValue(localStorage, key, fallback);
  const writeStorage = (key, value) => core.storage.setValue(localStorage, key, value);
  const removeStorage = (key) => core.storage.removeValue(localStorage, key);
  const { incomeStatuses, expenseStatuses } = core.transactions;
  const fabVisibleViews = new Set(["overview", "transactions", "cashflow", "goals"]);
  const categoryIconOptions = core.categories.iconOptions;
  const categoryIconByName = core.categories.iconByName;

  const state = {
    store: { users: [] },
    sessionEmail: "",
    authMode: "login",
    onboardingVisible: core.storage.getValue(localStorage, ONBOARDING_KEY) !== "true",
    view: "overview",
    editingTransactionId: "",
    editingCategoryId: "",
    editingGoalId: "",
    editingProfileId: "",
    editingAccountId: "",
    editingBudgetId: "",
    sidebarCollapsed: false,
    filters: {
      description: "",
      category: "all",
      dateFrom: "",
      dateTo: "",
      valueMin: "",
      valueMax: "",
      status: "all",
      account: "all",
      sort: "date-desc",
    },
    cashflowMonth: toMonthInput(new Date()),
    cashflowRange: "month",
    cashflowAccount: "all",
    exportAccount: "all",
    showInactiveAccounts: false,
    budgetMonth: toMonthInput(new Date()),
    budgetAccount: "all",
    showInactiveBudgets: false,
    notificationFilter: "all",
    goalFilters: {
      query: "",
      status: "all",
      sort: "updated-desc",
    },
    profileFilters: {
      query: "",
      sort: "recent",
    },
    selectedTransactionIds: new Set(),
    transactionPage: 1,
    transactionPageSize: 10,
  };

  const cloud = {
    client: null,
    enabled: false,
    ready: false,
    userId: "",
    lastStatus: "Local",
    lastNotification: "",
  };

  const app = document.getElementById("app");
  const toast = document.getElementById("toast");
  let toastTimer = 0;
  let fabCleanup = null;
  let mobileSurfaceCleanup = null;
  let mobileComposerScrollY = 0;
  let authMessageTimer = 0;
  let authChartAnimation = 0;
  let dashboardEntranceTimers = [];
  let languageObserver = null;
  let activeLanguage = "";
  let pendingAssistantPersonalization = null;
  let personalizationModalReturnFocus = null;
  const personalizationEngines = new Map();
  const translatedTextNodes = new WeakMap();
  const translatedAttributes = new WeakMap();

  const syncCoordinator = core.sync.createCoordinator({
    debounceMs: 700,
    retryDelays: [1000, 3000, 10000],
    getPayload: ({ ownerId }) => {
      const user = currentUser();
      if (!user || isLocalOnlyUser(user) || cloud.userId !== ownerId) {
        throw new Error("Invalid sync owner context.");
      }
      return sanitizeUserForCloud(user);
    },
    save: async ({ ownerId, expectedRevision, payload }) => {
      if (!cloud.enabled || !cloud.ready || !cloud.client || cloud.userId !== ownerId) {
        throw core.sync.createSyncError("blocked", "adapter-not-ready");
      }
      const { data, error } = await cloud.client.rpc("nexio_save_user_data_cas", {
        p_expected_revision: expectedRevision,
        p_data: payload,
      });
      if (error) throw core.sync.classifySupabaseError(error);
      return core.sync.normalizeCasResponse(data);
    },
    persistMeta: (meta) => {
      core.storage.saveSyncMeta(localStorage, meta.ownerId, meta, { guest: meta.guest });
    },
    onStatus: (status) => {
      cloud.lastStatus = syncStatusLabel(status);
      if (status.lastError === SYNC_SERVER_UPDATE_MESSAGE) {
        if (cloud.lastNotification !== SYNC_SERVER_UPDATE_MESSAGE) showToast(SYNC_SERVER_UPDATE_MESSAGE);
        cloud.lastNotification = SYNC_SERVER_UPDATE_MESSAGE;
      } else if (status.status === "synced") {
        cloud.lastNotification = "";
      }
      updateSyncStatus();
      refreshNotificationSurfaces();
    },
  });
  const tabChannel = core.sync.createTabChannel({
    globalObject: window,
    storage: localStorage,
    onMessage: handleCrossTabMessage,
  });

  function syncStatusLabel(status) {
    const labels = {
      idle: "Pronto para sincronizar",
      dirty: "Alterações pendentes",
      scheduled: "Alterações pendentes",
      syncing: "Sincronizando",
      synced: status.lastSuccessAt
        ? `Sincronizado às ${new Date(status.lastSuccessAt).toLocaleTimeString(languageLocale(), { hour: "2-digit", minute: "2-digit" })}`
        : "Sincronizado",
      retrying: "Nova tentativa agendada",
      conflict: "Conflito: revisão necessária",
      blocked: status.lastError === SYNC_SERVER_UPDATE_MESSAGE
        ? SYNC_SERVER_UPDATE_MESSAGE
        : "Sincronização bloqueada",
      offline: status.dirty ? "Offline: alterações pendentes" : "Offline",
      error: "Erro ao sincronizar",
    };
    return status.guest ? "Sem login: salvo neste aparelho" : labels[status.status] || "Local";
  }

  function saveStore() {
    const user = currentUser();
    const owner = syncCoordinator.getStatus();
    if (!user || !owner.ownerId) return;
    const guest = owner.guest || isLocalOnlyUser(user);
    state.store = { users: [core.storage.saveOwnerUser(localStorage, owner.ownerId, user, { guest })] };
    state.sessionEmail = state.store.users[0].email;
    syncCoordinator.markDirty({ schedule: false });
    tabChannel.post("state-changed", { ownerId: owner.ownerId });
    queueCloudSave();
  }

  function cloudConfig() {
    const config = window.NEXIO_SUPABASE || {};
    return {
      url: String(config.url || "").trim(),
      anonKey: String(config.anonKey || "").trim(),
    };
  }

  function setupCloudClient() {
    const config = cloudConfig();
    if (!config.url || !config.anonKey) {
      cloud.lastStatus = "Salvamento local";
      return false;
    }
    if (!window.supabase?.createClient) {
      cloud.lastStatus = "Supabase não carregado";
      return false;
    }
    try {
      cloud.client = window.supabase.createClient(config.url, config.anonKey);
    } catch (error) {
      cloud.client = null;
      cloud.enabled = false;
      cloud.lastStatus = "Supabase indisponível";
      return false;
    }
    cloud.enabled = true;
    cloud.lastStatus = "Conectando ao Supabase";
    return true;
  }

  async function bootstrap() {
    if (!setupCloudClient()) {
      state.sessionEmail = core.storage.clearUnverifiedSession(localStorage, SESSION_KEY, { localOnlyEmail: LOCAL_USER_EMAIL });
      if (isLocalSession()) activateGuestOwner();
      else clearVisibleOwner();
      render();
      return;
    }
    try {
      const { data, error } = await cloud.client.auth.getSession();
      if (error) throw error;
      if (data.session?.user) {
        await loadCloudUserData(data.session.user);
      } else {
        state.sessionEmail = core.storage.clearUnverifiedSession(localStorage, SESSION_KEY, { localOnlyEmail: LOCAL_USER_EMAIL });
        if (isLocalSession()) {
          activateGuestOwner();
        } else {
          clearVisibleOwner();
          cloud.lastStatus = "Entre para sincronizar";
        }
      }
    } catch (error) {
      invalidateVisibleOwner("session-invalidated");
      state.sessionEmail = core.storage.clearUnverifiedSession(localStorage, SESSION_KEY, { localOnlyEmail: LOCAL_USER_EMAIL });
      if (isLocalSession()) activateGuestOwner();
      cloud.lastStatus = "Falha na sincronização";
      showToast(AUTH_SERVICE_UNAVAILABLE_MESSAGE);
    }
    render();
  }

  function queueCloudSave() {
    syncCoordinator.scheduleSave();
  }

  async function loadCloudUserData(authUser) {
    const email = normalizeEmail(authUser.email || "");
    const ownerId = String(authUser.id || "").trim();
    if (!email || !ownerId) throw new Error("Conta Supabase sem identidade válida.");
    const previousOwnerId = syncCoordinator.getStatus().ownerId;
    invalidateVisibleOwner();
    if (previousOwnerId) {
      tabChannel.post("owner-changed", { ownerId, previousOwnerId });
    }

    const local = core.storage.migrateLegacyOwner(localStorage, ownerId, {
      email,
      localOnlyEmail: LOCAL_USER_EMAIL,
    });
    const storedMeta = core.storage.loadSyncMeta(localStorage, ownerId);
    const { data, error } = await cloud.client
      .from("nexio_user_data")
      .select("data, revision")
      .eq("user_id", ownerId)
      .maybeSingle();
    if (error) {
      const syncError = core.sync.classifySupabaseError(error);
      if (syncError.syncReason !== "migration-required") throw syncError;
      const nextUser = local.user || createUserFromCloudAuth(authUser);
      ensureUserShape(nextUser);
      const localGeneration = Math.max(Number(storedMeta.localGeneration) || 0, 1);
      const meta = {
        ...storedMeta,
        dirty: true,
        blocked: true,
        localGeneration,
        lastSuccessfulGeneration: Math.min(
          Number(storedMeta.lastSuccessfulGeneration) || 0,
          localGeneration,
        ),
        remoteRevision: null,
        revisionKnown: false,
      };
      cloud.userId = ownerId;
      syncCoordinator.activateOwner(ownerId, { canSync: false, meta });
      upsertStoreUser(nextUser, { ownerId });
      cloud.ready = false;
      cloud.lastStatus = SYNC_SERVER_UPDATE_MESSAGE;
      if (cloud.lastNotification !== SYNC_SERVER_UPDATE_MESSAGE) showToast(SYNC_SERVER_UPDATE_MESSAGE);
      cloud.lastNotification = SYNC_SERVER_UPDATE_MESSAGE;
      return;
    }

    const remoteRowExists = data !== null && data !== undefined;
    const remoteRevision = remoteRowExists
      ? normalizeRemoteRevision(data.revision)
      : "0";
    const revisionKnown = remoteRevision !== null;

    const reconciliation = core.sync.reconcileBootstrap({
      authUser: { id: ownerId, email },
      localExists: local.exists,
      localUser: local.user,
      remoteRowExists,
      remoteData: data?.data,
    });
    const needsReview = local.reviewRequired === true;
    let nextUser = reconciliation.user;
    if (reconciliation.localBackupCandidate) {
      core.storage.backupOwnerUser(localStorage, ownerId, reconciliation.localBackupCandidate);
    }
    if (!nextUser && !needsReview) nextUser = createUserFromCloudAuth(authUser);
    if (nextUser) ensureUserShape(nextUser);

    const pendingLocal = reconciliation.status === "local" || reconciliation.status === "empty";
    const localGeneration = pendingLocal && !local.migrated
      ? Math.max(Number(storedMeta.localGeneration) || 0, 1)
      : Number(storedMeta.localGeneration) || 0;
    const meta = {
      ...storedMeta,
      dirty: storedMeta.conflict || reconciliation.conflict || (pendingLocal && !local.migrated)
        || (reconciliation.blocked && storedMeta.dirty),
      conflict: storedMeta.conflict || reconciliation.conflict,
      blocked: reconciliation.blocked || needsReview || !revisionKnown,
      remoteRevision: revisionKnown ? remoteRevision : null,
      revisionKnown,
      localGeneration,
      lastSuccessfulGeneration: reconciliation.status === "equivalent"
        ? localGeneration
        : Math.min(Number(storedMeta.lastSuccessfulGeneration) || 0, localGeneration),
    };

    cloud.userId = ownerId;
    syncCoordinator.activateOwner(ownerId, { canSync: false, meta });
    if (nextUser) {
      upsertStoreUser(nextUser, { ownerId });
    } else {
      state.store = { users: [] };
      state.sessionEmail = email;
      core.storage.setSession(localStorage, SESSION_KEY, email);
    }
    cloud.ready = !meta.conflict && !meta.blocked && meta.revisionKnown;
    syncCoordinator.setCanSync(cloud.ready);

    if (meta.conflict) {
      showToast("Existem dados locais e remotos diferentes. A sincronização foi bloqueada para revisão.");
    } else if (reconciliation.reason === "invalid-remote") {
      showToast("Os dados remotos não puderam ser validados. A sincronização foi bloqueada.");
    } else if (needsReview) {
      showToast("A migração local encontrou dados ambíguos e precisa de revisão.");
    } else if (!meta.revisionKnown) {
      cloud.lastStatus = SYNC_SERVER_UPDATE_MESSAGE;
      showToast(SYNC_SERVER_UPDATE_MESSAGE);
    } else if (meta.dirty && !local.migrated) {
      syncCoordinator.scheduleSave();
    }
  }

  function createUserFromCloudAuth(authUser) {
    const email = normalizeEmail(authUser.email || "");
    const profile = createProfile("Principal");
    return {
      id: authUser.id || uid("user"),
      name: authUser.user_metadata?.name || email.split("@")[0] || "Usuário Nexio",
      email,
      theme: "dark",
      currency: "BRL",
      language: preferredLanguage(),
      activeProfileId: profile.id,
      profiles: [profile],
    };
  }

  function sanitizeUserForCloud(user) {
    return core.storage.buildCloudPayload(user, (clone) => {
      ensureUserShape(clone);
      delete clone.email;
      return clone;
    });
  }

  function normalizeRemoteRevision(value) {
    if (typeof value === "number") {
      if (!Number.isSafeInteger(value) || value < 0) return null;
      return core.storage.normalizeSyncRevision(String(value));
    }
    return core.storage.normalizeSyncRevision(value);
  }

  function upsertStoreUser(user, options = {}) {
    user = core.storage.sanitizeSensitiveData(user);
    user.email = normalizeEmail(user.email || state.sessionEmail);
    ensureUserShape(user);
    state.store = { users: [user] };
    state.sessionEmail = user.email;
    core.storage.setSession(localStorage, SESSION_KEY, user.email);
    const owner = syncCoordinator.getStatus();
    core.storage.saveOwnerUser(localStorage, options.ownerId || owner.ownerId, user, { guest: owner.guest });
  }

  function updateSyncStatus() {
    const status = app.querySelector("[data-sync-status]");
    if (!status) return;
    status.textContent = isLocalOnlyUser() ? "Sem login: salvo neste aparelho" : cloud.lastStatus;
  }

  function uid(prefix) {
    return core.utils.uid(prefix);
  }

  function currentUser() {
    return core.profiles.current(state.store, state.sessionEmail);
  }

  function isLocalSession() {
    return normalizeEmail(state.sessionEmail || "") === LOCAL_USER_EMAIL;
  }

  function isLocalOnlyUser(user = currentUser()) {
    return Boolean(user?.localOnly || normalizeEmail(user?.email || "") === LOCAL_USER_EMAIL);
  }

  function currentProfile() {
    return core.profiles.currentProfile(currentUser());
  }

  function ensureUserShape(user) {
    return core.profiles.ensureUserShape(user, {
      uid,
      locale: languageLocale(),
      storedLanguage: readStorage(LANGUAGE_KEY),
      preferredLanguage: preferredBrowserLanguage,
      supportedLanguage,
    });
  }

  function ensureProfileShape(profile) {
    return core.profiles.ensureProfileShape(profile, { uid, locale: languageLocale(), currency: currentUser()?.currency || "BRL" });
  }

  function ensureGoalShape(goal, profile = currentProfile()) {
    return core.goals.ensureShape(goal, profile, { uid, locale: languageLocale() });
  }

  function normalizeGoalHistory(goal, profile = currentProfile()) {
    return core.goals.normalizeHistory(goal, profile, { uid, locale: languageLocale() });
  }

  function normalizeGoalMovement(entry, goal, profile = currentProfile()) {
    return core.goals.normalizeMovement(entry, goal, profile, { uid, locale: languageLocale() });
  }

  function normalizeGoalMovementType(type) {
    return core.goals.normalizeMovementType(type);
  }

  function goalMovementTypeLabel(tipo) {
    return core.goals.movementTypeLabel(tipo);
  }

  function createGoalMovement({ tipo, valor, goal, profile, destino = "", justificativa = "", observacao = "", metaDestino = "", perfilDestino = "", data = "" }) {
    return core.goals.createMovement({ tipo, valor, goal, profile, destino, justificativa, observacao, metaDestino, perfilDestino, data }, { uid, locale: languageLocale() });
  }

  function createProfile(name) {
    return core.profiles.create(name, { uid, currency: currentUser()?.currency || "BRL" });
  }

  function clearVisibleOwner() {
    syncCoordinator.invalidateOwner();
    cloud.ready = false;
    cloud.userId = "";
    state.store = { users: [] };
    state.sessionEmail = "";
    state.view = "overview";
    core.storage.clearSession(localStorage, SESSION_KEY);
  }

  function invalidateVisibleOwner(eventType = "") {
    const previousOwnerId = syncCoordinator.getStatus().ownerId;
    clearVisibleOwner();
    if (eventType && previousOwnerId) {
      tabChannel.post(eventType, { ownerId: previousOwnerId, previousOwnerId });
    }
    return previousOwnerId;
  }

  function activateGuestOwner() {
    const active = syncCoordinator.getStatus();
    if (active.ownerId === "guest" && active.guest) return currentUser();
    const migrated = core.storage.migrateLegacyOwner(localStorage, "guest", {
      guest: true,
      localOnlyEmail: LOCAL_USER_EMAIL,
    });
    const meta = core.storage.loadSyncMeta(localStorage, "guest", { guest: true });
    syncCoordinator.activateOwner("guest", {
      guest: true,
      canSync: false,
      meta: { ...meta, blocked: meta.blocked || migrated.reviewRequired },
    });
    cloud.ready = false;
    cloud.userId = "";
    state.store = { users: migrated.user ? [migrated.user] : [] };
    state.sessionEmail = LOCAL_USER_EMAIL;
    core.storage.setSession(localStorage, SESSION_KEY, LOCAL_USER_EMAIL);
    if (migrated.reviewRequired) {
      showToast("A migração local encontrou dados ambíguos e precisa de revisão.");
    }
    return currentUser();
  }

  function handleCrossTabMessage(message) {
    const active = syncCoordinator.getStatus();
    if (!active.ownerId) return;
    if (message.type === "state-changed" && message.ownerId === active.ownerId) {
      syncCoordinator.markStale();
      cloud.ready = false;
      showToast("Os dados mudaram em outra aba. Recarregue antes de continuar.");
      updateSyncStatus();
      return;
    }
    const invalidatesCurrent = (
      (message.type === "logout" || message.type === "session-invalidated") && message.ownerId === active.ownerId
    ) || (
      message.type === "owner-changed" && message.previousOwnerId === active.ownerId
    );
    if (!invalidatesCurrent) return;
    clearVisibleOwner();
    if (cloud.enabled && cloud.client) cloud.client.auth.signOut().catch(() => {});
    cloud.lastStatus = "Sessão invalidada em outra aba";
    showToast("A sessão foi encerrada ou alterada em outra aba.");
    render();
  }

  function localUser() {
    if (syncCoordinator.getStatus().ownerId !== "guest") activateGuestOwner();
    let user = state.store.users.find((item) => normalizeEmail(item.email || "") === LOCAL_USER_EMAIL);
    if (!user && syncCoordinator.getStatus().blocked) return null;
    if (!user) {
      const profile = createProfile("Finanças");
      user = {
        id: uid("local-user"),
        name: "Sem login",
        email: LOCAL_USER_EMAIL,
        localOnly: true,
        theme: "dark",
        currency: "BRL",
        language: preferredLanguage(),
        activeProfileId: profile.id,
        profiles: [profile],
      };
      state.store.users.push(user);
    }
    user.localOnly = true;
    ensureUserShape(user);
    return user;
  }

  async function enterLocalMode() {
    const previousOwnerId = invalidateVisibleOwner();
    if (previousOwnerId) {
      tabChannel.post("owner-changed", { ownerId: "guest", previousOwnerId });
    }
    const remoteSignOutSucceeded = await core.storage.signOutAndClearSession(
      localStorage,
      SESSION_KEY,
      cloud.enabled && cloud.client ? () => cloud.client.auth.signOut() : null,
    );
    if (!remoteSignOutSucceeded) {
      state.sessionEmail = "";
      cloud.lastStatus = "Falha ao encerrar sessão remota";
      showToast("Não foi possível ativar o modo sem login. Tente novamente.");
      render();
      return;
    }
    cloud.lastStatus = "Sem login: salvo neste aparelho";
    activateGuestOwner();
    const user = localUser();
    if (!user) {
      showToast("Os dados locais precisam de revisão antes de iniciar um novo estado.");
      render();
      return;
    }
    state.sessionEmail = user.email;
    core.storage.setSession(localStorage, SESSION_KEY, user.email);
    saveStore();
    showToast("Modo sem login ativado.");
    render();
  }

  function render() {
    const renderer = ui.rendererForWidth?.(window.innerWidth);
    if (renderer) return renderer.render(renderShared);
    return renderShared();
  }

  function renderShared() {
    const user = currentUser();
    if (!user) {
      const syncStatus = syncCoordinator.getStatus();
      if (syncStatus.ownerId && !syncStatus.guest && syncStatus.blocked) {
        renderAuth();
        return;
      }
      if (state.onboardingVisible) {
        renderOnboarding();
        return;
      }
      renderAuth();
      return;
    }
    ensureUserShape(user);
    applyTheme(user.theme);
    renderDashboard();
  }

  function renderOnboarding() {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.body.classList.remove("theme-light", "menu-open");
    document.body.classList.add("theme-dark", "onboarding-active");
    app.innerHTML = "";
    app.append(document.getElementById("onboarding-template").content.cloneNode(true));
    window.lucide?.createIcons();

    const balance = app.querySelector("[data-onboarding-balance]");
    if (balance && !prefersReducedMotion()) {
      const startedAt = performance.now();
      const target = 12840;
      const animate = (now) => {
        if (!balance.isConnected) return;
        const progress = Math.min((now - startedAt) / 1500, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        balance.textContent = new Intl.NumberFormat(languageLocale(), { style: "currency", currency: "BRL" }).format(target * eased);
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    } else if (balance) {
      balance.textContent = "R$ 12.840,00";
    }

    const showOnboardingScreen = (name) => {
      const shell = app.querySelector(".onboarding-shell");
      shell?.classList.toggle("is-goal-step", name === "goal");
      shell?.classList.toggle("is-complete-step", name === "complete");
      app.querySelectorAll("[data-onboarding-screen]").forEach((screen) => {
        const active = screen.dataset.onboardingScreen === name;
        screen.hidden = !active;
        screen.classList.toggle("is-entering", active);
      });
      app.querySelectorAll("[data-onboarding-dot]").forEach((dot) => dot.classList.toggle("is-active", dot.dataset.onboardingDot === name));
      const footerCopy = app.querySelector("[data-onboarding-footer-copy]");
      if (footerCopy) footerCopy.textContent = name === "goal" ? "Uma escolha hoje. Mais clareza amanhã." : name === "balance" ? "Seu ponto de partida para uma evolução real." : name === "import" ? "Você mantém o controle sobre seus dados." : name === "first-goal" ? "Grandes resultados começam com uma meta clara." : name === "complete" ? "A Nexio está pronta para crescer com você." : "Comece uma nova relação com seu dinheiro.";
    };

    app.querySelector("[data-onboarding-start]")?.addEventListener("click", (event) => {
      event.currentTarget.classList.add("is-pressed");
      window.setTimeout(() => showOnboardingScreen("goal"), prefersReducedMotion() ? 0 : 180);
    });
    app.querySelector("[data-onboarding-back]")?.addEventListener("click", () => showOnboardingScreen("welcome"));

    app.querySelectorAll("[data-onboarding-goal]").forEach((card) => {
      card.addEventListener("click", () => {
        app.querySelectorAll("[data-onboarding-goal]").forEach((item) => {
          const selected = item === card;
          item.classList.toggle("is-selected", selected);
          item.setAttribute("aria-checked", String(selected));
        });
        const continueButton = app.querySelector("[data-onboarding-continue]");
        if (continueButton) {
          continueButton.disabled = false;
          continueButton.dataset.selectedGoal = card.dataset.onboardingGoal;
        }
      });
    });

    app.querySelector("[data-onboarding-continue]")?.addEventListener("click", (event) => {
      writeStorage("nexio-onboarding-goal-v1", event.currentTarget.dataset.selectedGoal || "Outro");
      showOnboardingScreen("balance");
      window.setTimeout(() => app.querySelector("#onboardingInitialBalance")?.focus(), prefersReducedMotion() ? 0 : 560);
    });
    app.querySelector("[data-onboarding-balance-back]")?.addEventListener("click", () => showOnboardingScreen("goal"));

    const balanceInput = app.querySelector("#onboardingInitialBalance");
    balanceInput?.addEventListener("input", () => {
      const digits = balanceInput.value.replace(/\D/g, "").slice(0, 14);
      const amount = Number(digits || 0) / 100;
      balanceInput.value = amount ? new Intl.NumberFormat(languageLocale(), { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount) : "";
      const preview = app.querySelector("[data-wallet-preview]");
      if (preview) {
        preview.textContent = new Intl.NumberFormat(languageLocale(), { style: "currency", currency: "BRL" }).format(amount);
        preview.classList.remove("is-updating");
        void preview.offsetWidth;
        preview.classList.add("is-updating");
      }
    });

    app.querySelector("[data-onboarding-balance-continue]")?.addEventListener("click", () => {
      const digits = balanceInput?.value.replace(/\D/g, "") || "0";
      writeStorage("nexio-onboarding-balance-v1", String(Number(digits) / 100));
      showOnboardingScreen("import");
    });
    app.querySelector("[data-onboarding-import-back]")?.addEventListener("click", () => showOnboardingScreen("balance"));

    app.querySelectorAll("[data-onboarding-import]").forEach((card) => {
      card.addEventListener("click", () => {
        app.querySelectorAll("[data-onboarding-import]").forEach((item) => {
          const selected = item === card;
          item.classList.toggle("is-selected", selected);
          item.setAttribute("aria-checked", String(selected));
        });
        const continueButton = app.querySelector("[data-onboarding-import-continue]");
        if (continueButton) {
          continueButton.disabled = false;
          continueButton.dataset.importChoice = card.dataset.onboardingImport;
        }
      });
    });

    app.querySelector("[data-onboarding-import-continue]")?.addEventListener("click", (event) => {
      writeStorage("nexio-onboarding-import-v1", event.currentTarget.dataset.importChoice || "Importar depois");
      showOnboardingScreen("first-goal");
      window.setTimeout(() => app.querySelector("#onboardingGoalName")?.focus(), prefersReducedMotion() ? 0 : 520);
    });
    app.querySelector("[data-onboarding-first-goal-back]")?.addEventListener("click", () => showOnboardingScreen("import"));

    const firstGoalName = app.querySelector("#onboardingGoalName");
    const firstGoalValue = app.querySelector("#onboardingGoalValue");
    const firstGoalDeadline = app.querySelector("#onboardingGoalDeadline");
    if (firstGoalDeadline) firstGoalDeadline.min = toDateInput(new Date());
    const updateFirstGoalPreview = () => {
      const digits = firstGoalValue?.value.replace(/\D/g, "") || "";
      const amount = Number(digits || 0) / 100;
      const namePreview = app.querySelector("[data-goal-preview-name]");
      const valuePreview = app.querySelector("[data-goal-preview-value]");
      const deadlinePreview = app.querySelector("[data-goal-preview-deadline]");
      const fill = app.querySelector("[data-goal-preview-fill]");
      const marker = app.querySelector("[data-goal-preview-marker]");
      const percentLabel = app.querySelector("[data-goal-preview-percent]");
      const completeness = [Boolean(firstGoalName?.value.trim()), amount > 0, Boolean(firstGoalDeadline?.value)].filter(Boolean).length;
      const percent = completeness === 3 ? 18 : completeness * 5;
      if (namePreview) namePreview.textContent = firstGoalName?.value.trim() || "Minha primeira meta";
      if (valuePreview) valuePreview.textContent = new Intl.NumberFormat(languageLocale(), { style: "currency", currency: "BRL" }).format(amount);
      if (deadlinePreview) deadlinePreview.textContent = firstGoalDeadline?.value ? new Date(`${firstGoalDeadline.value}T12:00:00`).toLocaleDateString(languageLocale(), { day: "2-digit", month: "short", year: "numeric" }).replace(".", "") : "Defina um prazo";
      if (fill) fill.style.width = `${percent}%`;
      if (marker) marker.style.left = `${percent}%`;
      if (percentLabel) percentLabel.textContent = `${percent}%`;
    };
    firstGoalName?.addEventListener("input", updateFirstGoalPreview);
    firstGoalDeadline?.addEventListener("input", updateFirstGoalPreview);
    firstGoalValue?.addEventListener("input", () => {
      const digits = firstGoalValue.value.replace(/\D/g, "").slice(0, 14);
      const amount = Number(digits || 0) / 100;
      firstGoalValue.value = amount ? new Intl.NumberFormat(languageLocale(), { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount) : "";
      updateFirstGoalPreview();
    });

    app.querySelector("[data-onboarding-first-goal-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const amount = Number(firstGoalValue?.value.replace(/\D/g, "") || 0) / 100;
      if (!firstGoalName?.value.trim() || amount <= 0 || !firstGoalDeadline?.value) return;
      writeStorage("nexio-onboarding-first-goal-v1", JSON.stringify({ name: firstGoalName.value.trim(), target: amount, deadline: firstGoalDeadline.value }));
      showOnboardingScreen("complete");
    });

    const finishOnboarding = ({ includeDraftData = false } = {}) => {
      const shell = app.querySelector(".onboarding-shell");
      if (shell?.classList.contains("is-entering-dashboard")) return;
      const user = localUser();
      if (!user) {
        showToast("Os dados locais precisam de revisão antes de concluir o onboarding.");
        return;
      }
      const profile = user.profiles.find((item) => item.id === user.activeProfileId) || user.profiles[0];
      if (includeDraftData) {
        const initialBalance = Number(readStorage("nexio-onboarding-balance-v1") || 0);
        let firstGoal = null;
        try {
          firstGoal = JSON.parse(readStorage("nexio-onboarding-first-goal-v1", "null") || "null");
        } catch (error) {
          console.debug("A meta temporária do onboarding não pôde ser recuperada.", error);
        }
        if (initialBalance > 0 && !profile.transactions.some((item) => item.onboardingOpeningBalance)) {
          const incomeCategory = profile.categories.find((category) => normalizeText(category.name).includes("salario")) || profile.categories[0];
          profile.transactions.push({ id: uid("trx"), type: "income", description: "Saldo inicial", amount: initialBalance, date: toDateInput(new Date()), categoryId: incomeCategory?.id || "", status: "Recebido", onboardingOpeningBalance: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        }
        if (firstGoal?.name && firstGoal?.target && firstGoal?.deadline && !profile.goals.some((goal) => goal.onboardingFirstGoal)) {
          profile.goals.push({ id: uid("goal"), name: firstGoal.name, target: Number(firstGoal.target), saved: 0, deadline: firstGoal.deadline, theme: "blue", reminders: [], history: [], onboardingFirstGoal: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        }
      }
      ["nexio-onboarding-goal-v1", "nexio-onboarding-balance-v1", "nexio-onboarding-import-v1", "nexio-onboarding-first-goal-v1"].forEach(removeStorage);
      writeStorage(ONBOARDING_KEY, "true");
      state.onboardingVisible = false;
      state.sessionEmail = user.email;
      core.storage.setSession(localStorage, SESSION_KEY, user.email);
      saveStore();
      shell?.classList.add("is-entering-dashboard");
      shell?.setAttribute("aria-busy", "true");
      window.setTimeout(() => {
        document.body.classList.remove("onboarding-active");
        render();
      }, prefersReducedMotion() ? 0 : 720);
    };

    app.querySelector("[data-onboarding-skip]")?.addEventListener("click", () => finishOnboarding());
    app.querySelector("[data-enter-nexio]")?.addEventListener("click", () => finishOnboarding({ includeDraftData: true }));
    applyLanguage(preferredLanguage());
  }

  function renderAuth() {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    requestAnimationFrame(() => window.scrollTo({ top: 0, left: 0, behavior: "auto" }));
    document.body.classList.remove("theme-light", "menu-open");
    document.body.classList.remove("onboarding-active");
    document.body.classList.add("theme-dark");
    app.innerHTML = "";
    app.append(document.getElementById("auth-template").content.cloneNode(true));
    const shell = app.querySelector(".auth-shell");
    shell.classList.toggle("is-register", state.authMode === "register");
    app.querySelectorAll("[data-auth-mode]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.authMode === state.authMode);
      button.setAttribute("aria-selected", String(button.dataset.authMode === state.authMode));
      button.addEventListener("click", () => {
        state.authMode = button.dataset.authMode;
        renderAuth();
      });
    });
    app.querySelector("[data-auth-submit]").textContent = state.authMode === "login" ? "Entrar" : "Criar conta";
    app.querySelector("#authForm").addEventListener("submit", handleAuth);
    app.querySelector("[data-use-without-login]").addEventListener("click", enterLocalMode);
    bindAuthExperience();
    bindInlineValidation();
    bindFormFeedbackStates();
    drawAuthChart();
    applyLanguage(preferredLanguage());
  }

  function bindAuthExperience() {
    window.clearInterval(authMessageTimer);
    const messages = ["Economize sem esforço.", "Organize seus cartões.", "Nunca esqueça um vencimento.", "Alcance suas metas."];
    const message = app.querySelector("[data-auth-message]");
    let messageIndex = 0;
    if (message && !prefersReducedMotion()) {
      authMessageTimer = window.setInterval(() => {
        message.classList.add("is-changing");
        window.setTimeout(() => {
          if (!message.isConnected) return;
          messageIndex = (messageIndex + 1) % messages.length;
          message.textContent = messages[messageIndex];
          message.classList.remove("is-changing");
        }, 260);
      }, 4000);
    }

    const submit = app.querySelector("[data-auth-submit]");
    submit?.addEventListener("click", (event) => {
      const rect = submit.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.15;
      const ripple = document.createElement("span");
      ripple.className = "auth-button-ripple";
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      const x = event.clientX || rect.left + rect.width / 2;
      const y = event.clientY || rect.top + rect.height / 2;
      ripple.style.left = `${x - rect.left - size / 2}px`;
      ripple.style.top = `${y - rect.top - size / 2}px`;
      submit.append(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
    });
  }

  function renderIcons() {
    if (window.lucide?.createIcons) {
      window.lucide.createIcons();
    }
  }

  function prefersReducedMotion() {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  }

  function pulseValue(element) {
    if (!element || prefersReducedMotion()) return;
    element.classList.remove("value-updated");
    void element.offsetWidth;
    element.classList.add("value-updated");
  }

  function setAnimatedMoney(selector, value) {
    const element = typeof selector === "string" ? app.querySelector(selector) : selector;
    if (!element) return;
    const target = Number(value || 0);
    if (prefersReducedMotion()) {
      element.textContent = money(target);
      element.dataset.rawValue = String(target);
      return;
    }
    const start = Number(element.dataset.rawValue || 0);
    const token = `${Date.now()}-${Math.random()}`;
    const duration = 780;
    const startedAt = performance.now();
    element.dataset.animationToken = token;
    const step = (now) => {
      if (element.dataset.animationToken !== token) return;
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = money(start + (target - start) * eased);
      if (progress < 1) {
        requestAnimationFrame(step);
        return;
      }
      element.textContent = money(target);
      element.dataset.rawValue = String(target);
      pulseValue(element);
    };
    requestAnimationFrame(step);
  }

  function setAnimatedNumber(selector, value, suffix = "") {
    const element = typeof selector === "string" ? app.querySelector(selector) : selector;
    if (!element) return;
    const target = Number(value || 0);
    if (prefersReducedMotion()) {
      element.textContent = `${target}${suffix}`;
      element.dataset.rawValue = String(target);
      return;
    }
    const start = Number(element.dataset.rawValue || 0);
    const token = `${Date.now()}-${Math.random()}`;
    const duration = 680;
    const startedAt = performance.now();
    element.dataset.animationToken = token;
    const step = (now) => {
      if (element.dataset.animationToken !== token) return;
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = `${Math.round(start + (target - start) * eased)}${suffix}`;
      if (progress < 1) {
        requestAnimationFrame(step);
        return;
      }
      element.textContent = `${target}${suffix}`;
      element.dataset.rawValue = String(target);
      pulseValue(element);
    };
    requestAnimationFrame(step);
  }

  function bindInlineValidation() {
    app.querySelectorAll("input, select, textarea").forEach((control) => {
      if (control.type === "hidden" || control.type === "file") return;
      if (control.dataset.validationBound) return;
      control.dataset.validationBound = "true";
      ["input", "change", "blur"].forEach((eventName) => {
        control.addEventListener(eventName, () => {
          control.dataset.touched = "true";
          validateField(control);
        });
      });
    });
  }

  function bindFormFeedbackStates() {
    app.querySelectorAll("form").forEach((form) => {
      if (form.dataset.feedbackBound) return;
      form.dataset.feedbackBound = "true";
      form.addEventListener("submit", () => {
        if (!form.checkValidity()) return;
        form.classList.add("is-loading");
        form.setAttribute("aria-busy", "true");
        window.setTimeout(() => {
          if (!form.isConnected) return;
          form.classList.remove("is-loading");
          form.removeAttribute("aria-busy");
        }, 650);
      });
      form.addEventListener("reset", () => {
        window.requestAnimationFrame(() => {
          form.querySelectorAll(".is-invalid, .is-success").forEach((item) => {
            item.classList.remove("is-invalid", "is-success");
          });
          form.querySelectorAll(".field-hint").forEach((hint) => {
            hint.textContent = "";
          });
          form.querySelectorAll("[aria-invalid]").forEach((control) => {
            control.setAttribute("aria-invalid", "false");
          });
        });
      });
    });
  }

  function validateField(control) {
    if (!control) return;
    const container = control.closest(".field, .select-shell, .goal-contribute");
    if (!container) return;
    let hint = container.querySelector(".field-hint");
    if (!hint) {
      hint = document.createElement("p");
      hint.className = "field-hint";
      hint.id = `${control.id || control.name || uid("field")}-hint`;
      container.append(hint);
    }
    const shouldValidate = control.required || control.value || control.min || control.max;
    const invalid = shouldValidate && !control.validity.valid;
    const hasValue = control.type === "checkbox" || control.type === "radio" ? control.checked : Boolean(control.value);
    const success = !invalid && control.dataset.touched === "true" && hasValue && control.validity.valid;
    container.classList.toggle("is-invalid", invalid);
    container.classList.toggle("is-success", success);
    control.setAttribute("aria-invalid", String(Boolean(invalid)));
    control.setAttribute("aria-describedby", hint.id);
    if (!invalid) {
      hint.textContent = "";
      return;
    }
    if (control.validity.valueMissing) hint.textContent = "Este campo é obrigatório.";
    else if (control.validity.rangeUnderflow) hint.textContent = `Use um valor a partir de ${control.min}.`;
    else if (control.validity.rangeOverflow) hint.textContent = `Use um valor até ${control.max}.`;
    else if (control.validity.typeMismatch) hint.textContent = "Revise o formato informado.";
    else hint.textContent = "Revise este campo antes de continuar.";
  }

  async function handleAuth(event) {
    event.preventDefault();
    const email = normalizeEmail(app.querySelector("#authEmail").value);
    const password = app.querySelector("#authPassword").value.trim();
    const name = app.querySelector("#authName").value.trim();

    if (!email || !password) {
      showToast("Preencha e-mail e senha.");
      return;
    }

    if (cloud.enabled) {
      await handleCloudAuth(email, password, name);
      return;
    }
    core.storage.clearSession(localStorage, SESSION_KEY);
    state.sessionEmail = "";
    showToast(AUTH_SERVICE_UNAVAILABLE_MESSAGE);
  }

  async function handleCloudAuth(email, password, name) {
    try {
      if (state.authMode === "register") {
        const { data, error } = await cloud.client.auth.signUp({
          email,
          password,
          options: { data: { name: name || "Usuário Nexio" } },
        });
        if (error) throw error;
        let authUser = data.user;
        if (!data.session || !authUser) {
          const login = await cloud.client.auth.signInWithPassword({ email, password });
          if (login.error) {
            showToast("Conta criada. Entre com seu e-mail e senha.");
            state.authMode = "login";
            renderAuth();
            return;
          }
          authUser = login.data.user;
        }
        await loadCloudUserData(authUser);
        if (!new Set(["conflict", "blocked"]).has(syncCoordinator.getStatus().status)) {
          showToast("Conta criada. Dados carregados com segurança.");
        }
        render();
        return;
      }

      const { data, error } = await cloud.client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await loadCloudUserData(data.user);
      if (!new Set(["conflict", "blocked"]).has(syncCoordinator.getStatus().status)) {
        showToast("Login realizado. Dados carregados com segurança.");
      }
      render();
    } catch (error) {
      showToast(AUTH_SERVICE_UNAVAILABLE_MESSAGE);
    }
  }

  function renderDashboard() {
    const user = currentUser();
    const profile = currentProfile();
    if (!user || !profile) return;
    applyTheme(user.theme);
    applyPrimaryColor(user.primaryColor);
    app.innerHTML = "";
    document.body.classList.remove("has-mobile-transaction-composer", "has-category-manager", "has-ai-assistant-modal");
    app.append(document.getElementById("dashboard-template").content.cloneNode(true));
    app.querySelector(".app-shell")?.classList.toggle("sidebar-is-collapsed", state.sidebarCollapsed);
    renderIcons();

    app.querySelector("[data-active-profile-label]").textContent = profile.name;
    updateTopbarContext();
    bindNavigation();
    bindAssistantFlow();
    void bindAndroidQuickActions();
    bindTopbar();
    bindFloatingActionButton();
    bindAccountForms();
    bindBudgetForms();
    bindTransactionForm();
    bindCategoryForm();
    bindMobileTransactionSurfaces();
    bindFilters();
    bindBulkStatusControls();
    bindTransactionListControls();
    bindGoalForm();
    bindProfileForm();
    bindSettingsForm();
    prepareDashboardEntrance();
    refreshAll();
    playDashboardEntrance();
    bindInlineValidation();
    bindFormFeedbackStates();
    applyLanguage(user.language);
  }

  function prepareDashboardEntrance() {
    dashboardEntranceTimers.forEach(window.clearTimeout);
    dashboardEntranceTimers = [];
    const dashboard = app.querySelector(".overview-dashboard");
    if (!dashboard || state.view !== "overview" || prefersReducedMotion()) return;
    dashboard.classList.add("is-dashboard-loading");
    dashboard.setAttribute("aria-busy", "true");
  }

  function playDashboardEntrance() {
    const dashboard = app.querySelector(".overview-dashboard");
    if (!dashboard || !dashboard.classList.contains("is-dashboard-loading")) return;
    const stage = (delay, className) => {
      dashboardEntranceTimers.push(window.setTimeout(() => {
        if (dashboard.isConnected) dashboard.classList.add(className);
      }, delay));
    };
    stage(360, "is-cards-ready");
    stage(650, "is-charts-ready");
    stage(900, "is-lists-ready");
    dashboardEntranceTimers.push(window.setTimeout(() => {
      if (!dashboard.isConnected) return;
      dashboard.classList.remove("is-dashboard-loading");
      dashboard.removeAttribute("aria-busy");
    }, 1180));
  }

  function animateDashboardFilterChange() {
    const dashboard = app.querySelector(".overview-dashboard.is-visible");
    if (!dashboard || prefersReducedMotion()) return;
    dashboard.classList.remove("is-filter-changing");
    void dashboard.offsetWidth;
    dashboard.classList.add("is-filter-changing");
    window.setTimeout(() => dashboard.classList.remove("is-filter-changing"), 320);
  }

  function updateTopbarContext() {
    const user = currentUser();
    const profile = currentProfile();
    const now = new Date();
    const greeting = greetingFor(now);
    const name = greetingName(user);
    const initials = initialsFrom(user?.name || profile?.name || "NX");
    const today = formatLongDate(now);

    const greetingLabel = app.querySelector("[data-greeting-label]");
    if (greetingLabel) greetingLabel.textContent = name ? `${greeting}, ${name}` : greeting;
    const todayLabel = app.querySelector("[data-today-label]");
    if (todayLabel) todayLabel.textContent = today;
    app.querySelectorAll("[data-user-avatar], [data-sidebar-avatar]").forEach((avatar) => {
      avatar.textContent = user?.avatar ? "" : initials;
      avatar.style.backgroundImage = user?.avatar ? `url("${user.avatar}")` : "";
      avatar.classList.toggle("has-image", Boolean(user?.avatar));
    });
    const sidebarName = app.querySelector("[data-sidebar-user-name]");
    if (sidebarName) sidebarName.textContent = user?.name || "Usuário Nexio";
  }

  function greetingFor(date) {
    const hour = date.getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  }

  function greetingName(user) {
    const name = String(user?.name || "").trim();
    if (!name || /^sem login$/i.test(name)) return "";
    return name.split(/\s+/)[0];
  }

  function initialsFrom(value) {
    const parts = String(value || "NX").trim().split(/\s+/).filter(Boolean);
    const initials = parts.length > 1
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`
      : (parts[0] || "NX").slice(0, 2);
    return initials.toUpperCase();
  }

  function bindNavigation() {
    const menuButton = app.querySelector("[data-mobile-menu]");
    const menuBackdrop = app.querySelector("[data-menu-backdrop]");
    const shell = app.querySelector(".app-shell");
    const sidebarToggle = app.querySelector("[data-sidebar-toggle]");
    const closeMobileMenu = () => {
      document.body.classList.remove("menu-open");
      menuButton.setAttribute("aria-expanded", "false");
    };
    const syncSidebarToggle = () => {
      if (!sidebarToggle) return;
      sidebarToggle.setAttribute("aria-label", state.sidebarCollapsed ? "Expandir menu" : "Recolher menu");
      sidebarToggle.title = state.sidebarCollapsed ? "Expandir menu" : "Recolher menu";
      const icon = sidebarToggle.querySelector("i");
      if (icon) {
        icon.dataset.lucide = state.sidebarCollapsed ? "panel-left-open" : "panel-left-close";
      }
      renderIcons();
    };

    app.querySelectorAll("[data-view]").forEach((button) => {
      button.addEventListener("click", () => {
        setView(button.dataset.view);
        closeMobileMenu();
      });
    });
    app.querySelectorAll("[data-view-shortcut]").forEach((button) => {
      button.addEventListener("click", () => setView(button.dataset.viewShortcut));
    });
    app.querySelector("[data-view-pendencies]").addEventListener("click", showCurrentMonthPendencies);
    menuButton.addEventListener("click", () => {
      const isOpen = document.body.classList.toggle("menu-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
    menuBackdrop.addEventListener("click", closeMobileMenu);
    sidebarToggle?.addEventListener("click", () => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      shell?.classList.toggle("sidebar-is-collapsed", state.sidebarCollapsed);
      syncSidebarToggle();
    });
    syncSidebarToggle();
    app.querySelector("[data-logout]").addEventListener("click", async () => {
      const previousOwnerId = invalidateVisibleOwner();
      if (previousOwnerId) tabChannel.post("logout", { ownerId: previousOwnerId });
      render();
      const remoteSignOutSucceeded = await core.storage.signOutAndClearSession(
        localStorage,
        SESSION_KEY,
        cloud.enabled && cloud.client ? () => cloud.client.auth.signOut() : null,
      );
      cloud.lastStatus = remoteSignOutSucceeded ? "Sessão encerrada" : "Sessão local encerrada; falha remota";
      showToast(remoteSignOutSucceeded
        ? "Sessão encerrada."
        : "Sessão local encerrada. Não foi possível confirmar o logout remoto.");
      updateSyncStatus();
    });
  }

  const assistantVoice = {
    service: null,
    state: "idle",
    transcript: "",
    draft: null,
    personalization: null,
    onDevice: false,
    interpretationId: 0,
  };

  const assistantReceipt = {
    service: null,
    state: "idle",
    source: "camera",
    result: null,
    draft: null,
    personalization: null,
    interpretationId: 0,
  };

  const assistantShare = {
    service: null,
    listener: null,
    state: "idle",
    payload: null,
    result: null,
    draft: null,
    personalization: null,
    lastKey: "",
    interpretationId: 0,
  };

  const assistantInterpretation = {
    service: null,
  };

  const externalNavigation = {
    coordinator: null,
    listener: null,
    plugin: null,
  };

  function bindAssistantFlow() {
    const modal = app.querySelector("[data-ai-voice-modal]");
    app.querySelector("[data-open-ai-voice]")?.addEventListener("click", openAssistantVoiceModal);
    app.querySelector("[data-ai-voice-microphone]")?.addEventListener("click", () => {
      if (assistantVoice.state === "listening") void stopAssistantVoiceRecognition();
      else void startAssistantVoiceRecognition();
    });
    app.querySelector("[data-ai-voice-retry]")?.addEventListener("click", () => void retryAssistantVoiceRecognition());
    app.querySelector("[data-ai-open-settings]")?.addEventListener("click", () => void openAssistantMicrophoneSettings());
    app.querySelector("[data-ai-voice-confirm]")?.addEventListener("click", confirmAssistantVoiceDraft);
    app.querySelectorAll("[data-close-ai-voice]").forEach((button) => {
      button.addEventListener("click", () => void closeAssistantVoiceModal());
    });
    modal?.addEventListener("click", (event) => {
      if (event.target === modal) void closeAssistantVoiceModal();
    });
    modal?.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        void closeAssistantVoiceModal();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...modal.querySelectorAll("button:not([disabled])")].filter((element) => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    const receiptModal = app.querySelector("[data-receipt-ocr-modal]");
    app.querySelector("[data-open-receipt-ocr]")?.addEventListener("click", openReceiptOcrModal);
    app.querySelectorAll("[data-receipt-source]").forEach((button) => {
      button.addEventListener("click", () => void scanAssistantReceipt(button.dataset.receiptSource));
    });
    app.querySelectorAll("[data-close-receipt-ocr]").forEach((button) => {
      button.addEventListener("click", () => void closeReceiptOcrModal());
    });
    app.querySelector("[data-receipt-scan-again]")?.addEventListener("click", () => void resetReceiptOcr());
    app.querySelector("[data-receipt-edit]")?.addEventListener("click", () => void scanAssistantReceipt(assistantReceipt.source, { allowEditing: true }));
    app.querySelector("[data-receipt-continue]")?.addEventListener("click", continueReceiptDraft);
    app.querySelector("[data-receipt-open-settings]")?.addEventListener("click", () => void openReceiptSettings());
    receiptModal?.addEventListener("click", (event) => {
      if (event.target === receiptModal) void closeReceiptOcrModal();
    });
    receiptModal?.addEventListener("keydown", (event) => trapAssistantModalFocus(event, receiptModal, closeReceiptOcrModal));

    const sharedModal = app.querySelector("[data-shared-content-modal]");
    app.querySelectorAll("[data-close-shared-content]").forEach((button) => {
      button.addEventListener("click", () => void closeIncomingSharedContent());
    });
    app.querySelector("[data-reprocess-shared-content]")?.addEventListener("click", () => void processIncomingSharedContent(assistantShare.payload));
    app.querySelector("[data-continue-shared-content]")?.addEventListener("click", () => void continueIncomingSharedContent());
    sharedModal?.addEventListener("click", (event) => {
      if (event.target === sharedModal) void closeIncomingSharedContent();
    });
    sharedModal?.addEventListener("keydown", (event) => trapAssistantModalFocus(event, sharedModal, closeIncomingSharedContent));
    void bindIncomingShareTarget();
  }

  function externalNavigationCoordinator() {
    if (externalNavigation.coordinator) return externalNavigation.coordinator;
    const actions = core.externalNavigation?.ACTIONS || {};
    externalNavigation.coordinator = core.externalNavigation?.createCoordinator?.({
      isAuthenticated: () => Boolean(currentUser()),
      hasActiveProfile: () => Boolean(currentUser()?.profiles?.some((profile) => profile.id === currentUser()?.activeProfileId)),
      onAuthenticationRequired: () => showToast("Entre na sua conta ou use o modo sem login para continuar."),
      onProfileRequired: () => showToast("Crie ou selecione um perfil antes de registrar um lançamento."),
      handlers: {
        [actions.ASSISTANT]: async () => setView("assistant"),
        [actions.NEW_TRANSACTION]: async () => openTransactionComposer(),
        [actions.NEW_EXPENSE]: async () => openTransactionComposer("expense"),
        [actions.VOICE_ENTRY]: async () => {
          setView("assistant");
          const modal = app.querySelector("[data-ai-voice-modal]");
          if (!modal || modal.hidden) openAssistantVoiceModal();
          if (["listening", "processing"].includes(assistantVoice.state)) return;
          await startAssistantVoiceRecognition();
        },
      },
    }) || null;
    return externalNavigation.coordinator;
  }

  async function bindAndroidQuickActions() {
    const coordinator = externalNavigationCoordinator();
    const plugin = window.Capacitor?.Plugins?.NexioQuickActions;
    if (!coordinator || !plugin) return;
    externalNavigation.plugin = plugin;
    if (!externalNavigation.listener && typeof plugin.addListener === "function") {
      externalNavigation.listener = await plugin.addListener("quickAction", (event) => {
        void coordinator.receive(event).catch(() => showToast("Não foi possível abrir o atalho solicitado."));
      });
    }
    if (typeof plugin.getPendingAction === "function") {
      const pending = await plugin.getPendingAction();
      if (pending?.action) await coordinator.receive(pending);
    }
    await coordinator.flush();
  }

  function trapAssistantModalFocus(event, modal, close) {
    if (event.key === "Escape") {
      void close();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [...modal.querySelectorAll("button:not([disabled])")].filter((element) => element.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function openAssistantVoiceModal() {
    const modal = app.querySelector("[data-ai-voice-modal]");
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add("has-ai-assistant-modal");
    syncFloatingActionButton();
    assistantVoice.transcript = "";
    assistantVoice.draft = null;
    assistantVoice.personalization = null;
    setAssistantVoiceState("idle");
    requestAnimationFrame(() => modal.querySelector("[data-ai-voice-microphone]")?.focus());
  }

  async function closeAssistantVoiceModal(options = {}) {
    const modal = app.querySelector("[data-ai-voice-modal]");
    const wasOpen = Boolean(modal && !modal.hidden);
    if (assistantVoice.service && ["listening", "processing"].includes(assistantVoice.state)) {
      await assistantVoice.service.cancel();
    }
    assistantVoice.interpretationId += 1;
    assistantInterpretation.service?.cancel?.();
    if (modal) modal.hidden = true;
    document.body.classList.remove("has-ai-assistant-modal");
    syncFloatingActionButton();
    if (wasOpen && options.restoreFocus !== false) app.querySelector("[data-open-ai-voice]")?.focus();
  }

  function assistantSpeechService() {
    if (assistantVoice.service) return assistantVoice.service;
    const plugins = window.Capacitor?.Plugins || {};
    assistantVoice.service = core.speechRecognition?.createService?.({
      plugin: plugins.SpeechRecognition,
      settingsPlugin: plugins.NexioSettings,
      language: window.navigator.language || "pt-BR",
    }) || null;
    return assistantVoice.service;
  }

  function assistantInterpreterService() {
    const user = currentUser();
    if (!cloud.enabled || !cloud.ready || !cloud.client || !cloud.userId || !user || isLocalOnlyUser(user)) return null;
    if (assistantInterpretation.service) return assistantInterpretation.service;
    assistantInterpretation.service = core.aiInterpreter?.createService?.({
      invoke: async (payload, options = {}) => {
        const { data, error } = await cloud.client.auth.getSession();
        if (error || !data.session?.access_token) {
          const unavailable = new Error("Sessão indisponível.");
          unavailable.code = "unauthenticated";
          throw unavailable;
        }
        const response = await fetch("/api/interpret-financial-input", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${data.session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
          signal: options.signal,
        });
        let body = null;
        try {
          body = await response.json();
        } catch {}
        if (!response.ok) {
          const failure = new Error(body?.message || "Interpretação indisponível.");
          failure.code = body?.code || "unavailable";
          failure.status = response.status;
          throw failure;
        }
        return body;
      },
    }) || null;
    return assistantInterpretation.service;
  }

  function assistantPersonalizationEngine(profile = currentProfile()) {
    const ownerId = syncCoordinator.getStatus().ownerId || currentUser()?.id || currentUser()?.email;
    if (!core.personalization || !ownerId || !profile?.id) return null;
    const key = core.personalization.storageKey(ownerId, profile.id);
    if (!key) return null;
    if (!personalizationEngines.has(key)) {
      try {
        const engine = core.personalization.createEngine({ storage: localStorage, ownerId, profileId: profile.id });
        engine.seed(profile.transactions, profile);
        personalizationEngines.set(key, engine);
      } catch {
        return null;
      }
    }
    return personalizationEngines.get(key);
  }

  function personalizeAssistantInterpretation(result, text, source) {
    if (!result?.draft) return result;
    const profile = currentProfile();
    const engine = assistantPersonalizationEngine(profile);
    if (!engine) return { ...result, personalization: null };
    const personalization = engine.suggest(result.draft, profile, { text, source });
    return { ...result, draft: personalization.draft, personalization };
  }

  async function interpretAssistantInput(text, source, localDraft = null) {
    const now = new Date();
    const result = await core.financialInput.interpret(
      text,
      core.aiAssistant?.parseTransaction,
      assistantInterpreterService(),
      {
        now,
        referenceDate: toDateInput(now),
        categories: currentProfile().categories.map((category) => category.name),
        partialParser: core.aiAssistant?.parsePartialTransaction,
      },
      { source, localDraft },
    );
    return personalizeAssistantInterpretation(result, text, source);
  }

  function setAssistantVoiceState(nextState, options = {}) {
    const modal = app.querySelector("[data-ai-voice-modal]");
    if (!modal) return;
    assistantVoice.state = nextState;
    const dialog = modal.querySelector("[data-ai-voice-state]");
    const microphone = modal.querySelector("[data-ai-voice-microphone]");
    const transcript = modal.querySelector("[data-ai-voice-transcript]");
    const status = modal.querySelector("[data-ai-voice-status]");
    const indicator = modal.querySelector("[data-ai-listening-indicator]");
    const retry = modal.querySelector("[data-ai-voice-retry]");
    const settings = modal.querySelector("[data-ai-open-settings]");
    const confirm = modal.querySelector("[data-ai-voice-confirm]");
    const messages = {
      idle: "Pronto para ouvir. O lançamento só será salvo depois que você revisar e confirmar o formulário.",
      listening: assistantVoice.onDevice
        ? "Ouvindo neste aparelho. Toque novamente no microfone quando terminar."
        : "Ouvindo... Toque novamente no microfone quando terminar.",
      processing: options.message || "Processando sua transcrição...",
      recognized: assistantVoice.draft
        ? options.message || "Lançamento identificado. Confirme para abrir o formulário preenchido e revisar."
        : "Não foi possível entender o lançamento. Nada foi alterado.",
      error: options.message || "Não foi possível concluir o reconhecimento de voz. Tente novamente.",
      "permission-denied": "O acesso ao microfone está bloqueado. Abra as configurações do Android, permita o acesso e tente novamente.",
    };
    if (dialog) dialog.dataset.aiVoiceState = nextState;
    if (transcript) {
      transcript.textContent = assistantVoice.transcript ? `“${assistantVoice.transcript}”` : "";
      transcript.hidden = !assistantVoice.transcript;
    }
    if (status) status.textContent = messages[nextState] || messages.idle;
    if (indicator) indicator.hidden = nextState !== "listening";
    if (retry) retry.hidden = !["recognized", "error", "permission-denied"].includes(nextState);
    if (settings) settings.hidden = nextState !== "permission-denied";
    if (confirm) confirm.disabled = nextState !== "recognized" || !assistantVoice.draft;
    if (microphone) {
      const listening = nextState === "listening";
      microphone.disabled = ["processing", "recognized", "permission-denied"].includes(nextState);
      microphone.setAttribute("aria-pressed", String(listening));
      microphone.setAttribute("aria-label", listening ? "Parar reconhecimento de voz" : "Iniciar reconhecimento de voz");
    }
    renderIcons();
  }

  function updateAssistantTranscript(text) {
    assistantVoice.transcript = String(text || "").trim();
    const transcript = app.querySelector("[data-ai-voice-transcript]");
    if (!transcript) return;
    transcript.textContent = assistantVoice.transcript ? `“${assistantVoice.transcript}”` : "";
    transcript.hidden = !assistantVoice.transcript;
  }

  async function recognizeAssistantTranscript(text) {
    updateAssistantTranscript(text);
    const interpretationId = ++assistantVoice.interpretationId;
    setAssistantVoiceState("processing", { message: "Interpretando lançamento..." });
    const result = await interpretAssistantInput(assistantVoice.transcript, "voice");
    if (interpretationId !== assistantVoice.interpretationId || result.strategy === "cancelled") return;
    assistantVoice.draft = result?.draft || null;
    assistantVoice.personalization = result?.personalization || null;
    setAssistantVoiceState("recognized", { message: result.message });
  }

  function handleAssistantVoiceError(error) {
    const normalized = core.speechRecognition?.normalizeError?.(error) || error;
    assistantVoice.draft = null;
    assistantVoice.personalization = null;
    setAssistantVoiceState(normalized?.code === "permission-denied" ? "permission-denied" : "error", {
      message: normalized?.message,
    });
  }

  async function startAssistantVoiceRecognition() {
    const service = assistantSpeechService();
    if (!service) {
      handleAssistantVoiceError({ code: "recognition-unavailable" });
      return;
    }
    assistantVoice.transcript = "";
    assistantVoice.draft = null;
    assistantVoice.personalization = null;
    setAssistantVoiceState("processing", { message: "Verificando a permissão do microfone..." });
    try {
      await service.start({
        onListening: ({ onDevice }) => {
          assistantVoice.onDevice = Boolean(onDevice);
          setAssistantVoiceState("listening");
        },
        onTranscript: updateAssistantTranscript,
        onProcessing: () => setAssistantVoiceState("processing"),
        onComplete: (text) => void recognizeAssistantTranscript(text),
        onEmpty: () => handleAssistantVoiceError({ code: "no-speech" }),
        onError: handleAssistantVoiceError,
      });
    } catch (error) {
      handleAssistantVoiceError(error);
    }
  }

  async function stopAssistantVoiceRecognition() {
    if (!assistantVoice.service) return;
    setAssistantVoiceState("processing");
    await assistantVoice.service.stop();
  }

  async function retryAssistantVoiceRecognition() {
    if (assistantVoice.service) await assistantVoice.service.cancel();
    assistantVoice.interpretationId += 1;
    assistantInterpretation.service?.cancel?.();
    assistantVoice.transcript = "";
    assistantVoice.draft = null;
    setAssistantVoiceState("idle");
    await startAssistantVoiceRecognition();
  }

  async function openAssistantMicrophoneSettings() {
    const opened = await assistantSpeechService()?.openSettings?.();
    if (!opened) {
      setAssistantVoiceState("permission-denied");
      const status = app.querySelector("[data-ai-voice-status]");
      if (status) status.textContent = "Abra as configurações do Android, escolha Nexio Financeiro e permita o acesso ao microfone.";
    }
  }

  function confirmAssistantVoiceDraft() {
    if (!assistantVoice.draft || !assistantVoice.transcript) return;
    prefillTransactionFromAssistant(assistantVoice.draft, assistantVoice.transcript, assistantVoice.personalization);
  }

  function receiptOcrService() {
    if (assistantReceipt.service) return assistantReceipt.service;
    const plugins = window.Capacitor?.Plugins || {};
    const processor = window.NexioUI?.receiptImage?.createProcessor?.({
      filesystem: plugins.Filesystem,
      receiptCore: core.receiptOcr,
    });
    assistantReceipt.service = core.receiptOcr?.createService?.({
      camera: plugins.Camera,
      textRecognition: plugins.TextRecognition,
      settingsPlugin: plugins.NexioSettings,
      prepareImage: processor?.prepare,
    }) || null;
    return assistantReceipt.service;
  }

  function openReceiptOcrModal() {
    const modal = app.querySelector("[data-receipt-ocr-modal]");
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add("has-ai-assistant-modal");
    syncFloatingActionButton();
    assistantReceipt.result = null;
    assistantReceipt.draft = null;
    assistantReceipt.personalization = null;
    setReceiptOcrState("idle");
    requestAnimationFrame(() => modal.querySelector('[data-receipt-source="camera"]')?.focus());
  }

  async function closeReceiptOcrModal(options = {}) {
    const modal = app.querySelector("[data-receipt-ocr-modal]");
    const wasOpen = Boolean(modal && !modal.hidden);
    if (modal) modal.hidden = true;
    document.body.classList.remove("has-ai-assistant-modal");
    syncFloatingActionButton();
    if (assistantReceipt.service) {
      if (["processing-image", "recognizing", "choosing"].includes(assistantReceipt.state)) await assistantReceipt.service.cancel();
      else await assistantReceipt.service.release();
    }
    assistantReceipt.interpretationId += 1;
    assistantInterpretation.service?.cancel?.();
    assistantReceipt.result = null;
    assistantReceipt.draft = null;
    assistantReceipt.personalization = null;
    if (wasOpen && options.restoreFocus !== false) app.querySelector("[data-open-receipt-ocr]")?.focus();
  }

  function setReceiptOcrState(nextState, options = {}) {
    const modal = app.querySelector("[data-receipt-ocr-modal]");
    if (!modal) return;
    assistantReceipt.state = nextState;
    const dialog = modal.querySelector("[data-receipt-state]");
    const sourceOptions = modal.querySelector("[data-receipt-source-options]");
    const processing = modal.querySelector("[data-receipt-processing]");
    const preview = modal.querySelector("[data-receipt-preview]");
    const status = modal.querySelector("[data-receipt-status]");
    const settings = modal.querySelector("[data-receipt-open-settings]");
    const edit = modal.querySelector("[data-receipt-edit]");
    const scanAgain = modal.querySelector("[data-receipt-scan-again]");
    const continueButton = modal.querySelector("[data-receipt-continue]");
    const messages = {
      idle: "Escolha Câmera ou Galeria. A imagem permanece neste aparelho e nada é salvo automaticamente.",
      choosing: `Abrindo ${assistantReceipt.source === "gallery" ? "a galeria" : "a câmera"}...`,
      "processing-image": "Girando, recortando, aprimorando e comprimindo o comprovante localmente...",
      recognizing: options.message || "Lendo o comprovante localmente com reconhecimento de texto...",
      preview: assistantReceipt.draft
        ? options.message || "Comprovante identificado. Revise os detalhes e continue para o formulário editável."
        : "O texto foi encontrado, mas os detalhes estão incompletos. Edite a imagem ou escaneie novamente.",
      error: options.message || "Não foi possível ler o comprovante. Tente outra imagem ou origem.",
      "permission-denied": options.message || "O acesso está bloqueado. Abra as configurações do Android, permita o acesso e tente novamente.",
    };
    if (dialog) dialog.dataset.receiptState = nextState;
    if (sourceOptions) sourceOptions.hidden = !["idle", "error", "permission-denied"].includes(nextState);
    if (processing) processing.hidden = !["choosing", "processing-image", "recognizing"].includes(nextState);
    if (preview) preview.hidden = nextState !== "preview";
    if (status) status.textContent = messages[nextState] || messages.idle;
    if (settings) settings.hidden = nextState !== "permission-denied";
    if (edit) edit.hidden = nextState !== "preview";
    if (scanAgain) scanAgain.hidden = !["preview", "error", "permission-denied"].includes(nextState);
    if (continueButton) continueButton.disabled = nextState !== "preview" || !assistantReceipt.draft;
    renderIcons();
  }

  async function scanAssistantReceipt(source, options = {}) {
    const service = receiptOcrService();
    assistantReceipt.source = source === "gallery" ? "gallery" : "camera";
    assistantReceipt.result = null;
    assistantReceipt.draft = null;
    assistantReceipt.personalization = null;
    if (!service) {
      setReceiptOcrState("error", { message: "O reconhecimento local de comprovantes não está disponível neste aparelho. Você ainda pode registrar o lançamento manualmente." });
      return;
    }
    setReceiptOcrState("choosing");
    try {
      const result = await service.scan(assistantReceipt.source, {
        allowEditing: options.allowEditing,
        onProcessingImage: () => setReceiptOcrState("processing-image"),
        onRecognizing: () => setReceiptOcrState("recognizing"),
      });
      assistantReceipt.result = result;
      const localDraft = core.receiptOcr?.createDraft?.(result.text, core.aiAssistant?.parseTransaction)?.draft || null;
      const interpretationId = ++assistantReceipt.interpretationId;
      setReceiptOcrState("recognizing", { message: "Interpretando lançamento..." });
      const interpretation = await interpretAssistantInput(result.text, "receipt-ocr", localDraft);
      if (interpretationId !== assistantReceipt.interpretationId || interpretation.strategy === "cancelled") return;
      assistantReceipt.draft = interpretation.draft;
      assistantReceipt.personalization = interpretation.personalization || null;
      renderReceiptPreview();
      setReceiptOcrState("preview", { message: interpretation.message });
    } catch (error) {
      const normalized = core.receiptOcr?.normalizeError?.(error, assistantReceipt.source) || error;
      if (normalized?.code === "cancelled") {
        setReceiptOcrState("idle");
        return;
      }
      setReceiptOcrState(normalized?.code === "permission-denied" ? "permission-denied" : "error", {
        message: normalized?.message,
      });
    }
  }

  function renderReceiptPreview() {
    const modal = app.querySelector("[data-receipt-ocr-modal]");
    const draft = assistantReceipt.draft;
    const image = modal?.querySelector("[data-receipt-image]");
    if (image) image.src = assistantReceipt.result?.previewUrl || "";
    const values = {
      amount: draft?.amount ? money(draft.amount) : "Não identificado",
      merchant: draft?.description || "Não identificado",
      payment: assistantPaymentLabel(draft?.paymentMethod) || "Não identificado",
      date: draft?.date || "Não identificada",
      category: assistantCategoryLabel(draft?.category) || "Não identificada",
    };
    Object.entries(values).forEach(([field, value]) => {
      const output = modal?.querySelector(`[data-receipt-detected="${field}"]`);
      if (output) output.textContent = value;
    });
  }

  async function resetReceiptOcr() {
    assistantReceipt.interpretationId += 1;
    assistantInterpretation.service?.cancel?.();
    await assistantReceipt.service?.release?.();
    assistantReceipt.result = null;
    assistantReceipt.draft = null;
    assistantReceipt.personalization = null;
    setReceiptOcrState("idle");
    app.querySelector('[data-receipt-source="camera"]')?.focus();
  }

  async function openReceiptSettings() {
    const opened = await receiptOcrService()?.openSettings?.();
    if (!opened) {
      setReceiptOcrState("permission-denied", {
        message: "Abra as configurações do Android, escolha Nexio Financeiro e permita o acesso à câmera ou às fotos.",
      });
    }
  }

  function continueReceiptDraft() {
    if (!assistantReceipt.draft || !assistantReceipt.result?.text) return;
    prefillTransactionFromAssistant(assistantReceipt.draft, assistantReceipt.result.text, assistantReceipt.personalization);
  }

  function androidShareTargetService() {
    if (assistantShare.service) return assistantShare.service;
    const plugins = window.Capacitor?.Plugins || {};
    if (!plugins.NexioShareTarget) return null;
    const convertFileSrc = window.Capacitor?.convertFileSrc;
    assistantShare.service = core.androidShareTarget?.createService?.({
      nativeShare: plugins.NexioShareTarget,
      receiptOcr: receiptOcrService(),
      parser: core.aiAssistant?.parseTransaction,
      inputPipeline: core.financialInput,
      toWebPath: (path) => typeof convertFileSrc === "function" ? convertFileSrc(path) : path,
    }) || null;
    return assistantShare.service;
  }

  async function bindIncomingShareTarget() {
    const service = androidShareTargetService();
    if (!service) return;
    if (!assistantShare.listener) {
      assistantShare.listener = await service.listen((payload) => {
        void receiveIncomingSharedContent(payload);
      });
    }
    try {
      const pending = await service.pending();
      if (pending) await receiveIncomingSharedContent(pending);
    } catch (error) {
      if (app.querySelector("[data-shared-content-modal]")) {
        await receiveIncomingSharedContent({
          kind: "error",
          errorCode: "missing-content",
          errorMessage: core.androidShareTarget?.normalizeError?.(error)?.message,
        });
      }
    }
  }

  function sharedPayloadKey(payload) {
    const normalized = core.androidShareTarget?.normalizePayload?.(payload);
    return normalized?.id || `${normalized?.kind || "unknown"}:${normalized?.path || normalized?.text || ""}`;
  }

  async function receiveIncomingSharedContent(payload) {
    const key = sharedPayloadKey(payload);
    if (key && key === assistantShare.lastKey && ["processing", "recognizing", "preview"].includes(assistantShare.state)) return;
    if (assistantShare.payload && key !== assistantShare.lastKey) await assistantShare.service?.release?.();
    assistantShare.lastKey = key;
    assistantShare.payload = payload;
    assistantShare.result = null;
    assistantShare.draft = null;
    assistantShare.personalization = null;
    if (!app.querySelector("[data-shared-content-modal]")) return;
    setView("assistant");
    openIncomingSharedContentModal();
    await processIncomingSharedContent(payload);
  }

  function openIncomingSharedContentModal() {
    const modal = app.querySelector("[data-shared-content-modal]");
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add("has-ai-assistant-modal");
    syncFloatingActionButton();
    setIncomingSharedContentState("processing");
    requestAnimationFrame(() => modal.querySelector("[data-close-shared-content]")?.focus());
  }

  function setIncomingSharedContentState(nextState, options = {}) {
    const modal = app.querySelector("[data-shared-content-modal]");
    if (!modal) return;
    assistantShare.state = nextState;
    const dialog = modal.querySelector("[data-shared-content-state]");
    const processing = modal.querySelector("[data-shared-content-processing]");
    const preview = modal.querySelector("[data-shared-content-preview]");
    const status = modal.querySelector("[data-shared-content-status]");
    const reprocess = modal.querySelector("[data-reprocess-shared-content]");
    const continueButton = modal.querySelector("[data-continue-shared-content]");
    const messages = {
      idle: "Aguardando conteúdo compartilhado...",
      processing: options.message || "Processando o conteúdo compartilhado localmente...",
      recognizing: options.message || "Lendo o comprovante compartilhado localmente...",
      preview: assistantShare.draft
        ? options.message || "Conteúdo identificado. Revise os detalhes antes de continuar para o formulário editável."
        : "Não foi possível interpretar o conteúdo compartilhado. Nada foi salvo.",
      error: options.message || "Não foi possível processar o conteúdo compartilhado. Reprocesse ou cancele.",
    };
    if (dialog) dialog.dataset.sharedContentState = nextState;
    if (processing) processing.hidden = !["processing", "recognizing"].includes(nextState);
    if (preview) preview.hidden = nextState !== "preview";
    if (status) status.textContent = messages[nextState] || messages.idle;
    if (reprocess) reprocess.hidden = !["preview", "error"].includes(nextState);
    if (continueButton) continueButton.disabled = nextState !== "preview" || !assistantShare.draft;
    renderIcons();
  }

  async function processIncomingSharedContent(payload) {
    const service = androidShareTargetService();
    if (!service || !payload) {
      setIncomingSharedContentState("error", { message: "O processamento de conteúdo compartilhado do Android não está disponível. Nada foi alterado." });
      return;
    }
    assistantShare.payload = payload;
    assistantShare.result = null;
    assistantShare.draft = null;
    assistantShare.personalization = null;
    setIncomingSharedContentState("processing");
    try {
      const result = await service.process(payload, {
        onState: (stateName, message) => setIncomingSharedContentState(stateName, { message }),
      });
      const interpretationId = ++assistantShare.interpretationId;
      setIncomingSharedContentState("recognizing", { message: "Interpretando lançamento..." });
      const interpretation = await interpretAssistantInput(result.extractedText, "share-target", result.draft);
      if (interpretationId !== assistantShare.interpretationId || interpretation.strategy === "cancelled") return;
      assistantShare.result = { ...result, draft: interpretation.draft };
      assistantShare.draft = interpretation.draft;
      assistantShare.personalization = interpretation.personalization || null;
      renderIncomingSharedContentPreview();
      setIncomingSharedContentState("preview", { message: interpretation.message });
    } catch (error) {
      const normalized = core.androidShareTarget?.normalizeError?.(error) || error;
      if (normalized?.code === "cancelled") return;
      setIncomingSharedContentState("error", { message: normalized?.message });
    }
  }

  function renderIncomingSharedContentPreview() {
    const modal = app.querySelector("[data-shared-content-modal]");
    const result = assistantShare.result;
    const draft = assistantShare.draft;
    const content = result?.content || core.androidShareTarget?.normalizePayload?.(assistantShare.payload);
    const typeLabels = { text: "Texto compartilhado", image: "Imagem de comprovante", pdf: "Comprovante em PDF" };
    const values = {
      type: typeLabels[content?.kind] || "Não identificado",
      file: content?.name || (content?.kind === "text" ? "Não se aplica" : "Arquivo sem nome"),
      merchant: draft?.description || "Não identificado",
      amount: draft?.amount ? money(draft.amount) : "Não identificado",
      payment: assistantPaymentLabel(draft?.paymentMethod) || "Não identificado",
      category: assistantCategoryLabel(draft?.category) || "Não identificada",
    };
    Object.entries(values).forEach(([field, value]) => {
      const output = modal?.querySelector(`[data-shared-detected="${field}"]`);
      if (output) output.textContent = value;
    });
    const thumbnailWrap = modal?.querySelector("[data-shared-thumbnail-wrap]");
    const thumbnail = modal?.querySelector("[data-shared-thumbnail]");
    const showThumbnail = Boolean(result?.previewUrl && ["image", "pdf"].includes(content?.kind));
    if (thumbnailWrap) thumbnailWrap.hidden = !showThumbnail;
    if (thumbnail) {
      if (showThumbnail) thumbnail.src = result.previewUrl;
      else thumbnail.removeAttribute("src");
    }
    const notes = [];
    if (content?.ignoredCount) notes.push(`${content.ignoredCount} ${content.ignoredCount === 1 ? "item compartilhado adicional foi ignorado" : "itens compartilhados adicionais foram ignorados"}. Processe cada um separadamente.`);
    if (result?.truncated) notes.push(`As primeiras ${result.processedPages} de ${result.pageCount} páginas do PDF foram processadas para proteger a memória do aparelho.`);
    const note = modal?.querySelector("[data-shared-content-note]");
    if (note) {
      note.textContent = notes.join(" ");
      note.hidden = !notes.length;
    }
  }

  async function closeIncomingSharedContent(options = {}) {
    const modal = app.querySelector("[data-shared-content-modal]");
    const wasOpen = Boolean(modal && !modal.hidden);
    if (modal) modal.hidden = true;
    document.body.classList.remove("has-ai-assistant-modal");
    syncFloatingActionButton();
    if (assistantShare.service) await assistantShare.service.release();
    assistantShare.interpretationId += 1;
    assistantInterpretation.service?.cancel?.();
    assistantShare.payload = null;
    assistantShare.result = null;
    assistantShare.draft = null;
    assistantShare.personalization = null;
    assistantShare.lastKey = "";
    assistantShare.state = "idle";
    if (wasOpen && options.restoreFocus !== false) app.querySelector("[data-share-target-option]")?.focus?.();
  }

  async function continueIncomingSharedContent() {
    if (!assistantShare.draft || !assistantShare.result?.extractedText) return;
    const draft = assistantShare.draft;
    const extractedText = assistantShare.result.extractedText;
    const personalization = assistantShare.personalization;
    await closeIncomingSharedContent({ restoreFocus: false });
    prefillTransactionFromAssistant(draft, extractedText, personalization);
  }

  function assistantCategoryId(categoryName) {
    const aliases = {
      market: ["market", "mercado", "supermercado", "alimentacao"],
      fuel: ["fuel", "combustivel", "gasolina", "transporte"],
      pharmacy: ["pharmacy", "farmacia", "saude"],
      restaurant: ["restaurant", "restaurante", "alimentacao"],
      bakery: ["bakery", "padaria", "alimentacao"],
      store: ["store", "loja", "compras"],
      transfer: ["transfer", "transferencia", "outros"],
      salary: ["salary", "salario"],
      freelance: ["freelance"],
      income: ["income", "receita", "salario", "freelance"],
      other: ["other", "outros", "casa"],
      home: ["home", "casa"],
      transport: ["transport", "transporte"],
      health: ["health", "saude"],
      leisure: ["leisure", "lazer"],
    };
    const accepted = aliases[normalizeText(categoryName)] || [normalizeText(categoryName)];
    return currentProfile().categories.find((category) => accepted.includes(normalizeText(category.name)))?.id || "";
  }

  function assistantCategoryLabel(categoryName) {
    const labels = {
      market: "Mercado",
      fuel: "Combustível",
      pharmacy: "Farmácia",
      restaurant: "Restaurante",
      bakery: "Padaria",
      store: "Compras",
      transfer: "Transferência",
      salary: "Salário",
      freelance: "Freelance",
      income: "Receita",
      other: "Outros",
      home: "Casa",
      transport: "Transporte",
      health: "Saúde",
      leisure: "Lazer",
    };
    return labels[normalizeText(categoryName)] || String(categoryName || "");
  }

  function assistantPaymentLabel(paymentMethod) {
    const labels = {
      "credit card": "Cartão de crédito",
      "debit card": "Cartão de débito",
      cash: "Dinheiro",
      pix: "Pix",
      ted: "TED",
      doc: "DOC",
      boleto: "Boleto",
      "bank transfer": "Transferência bancária",
    };
    return labels[normalizeText(paymentMethod)] || String(paymentMethod || "");
  }

  function prefillTransactionFromAssistant(draft, sentence, personalization = null) {
    closeReceiptOcrModal({ restoreFocus: false });
    closeAssistantVoiceModal({ restoreFocus: false });
    openTransactionComposer(draft.type);
    const description = app.querySelector("#transactionDescription");
    const amount = app.querySelector("#transactionAmount");
    const date = app.querySelector("#transactionDate");
    const category = app.querySelector("#transactionCategory");
    const account = app.querySelector("#transactionAccount");
    const installmentsEnabledInput = app.querySelector("#transactionInstallmentsEnabled");
    const installmentCountInput = app.querySelector("#transactionInstallmentCount");
    if (description) description.value = draft.description || "";
    if (amount) amount.value = Number.isFinite(draft.amount) ? String(draft.amount) : "";
    if (date) date.value = draft.date || toDateInput(new Date());
    const directCategoryId = currentProfile().categories.some((item) => item.id === draft.categoryId) ? draft.categoryId : "";
    const categoryId = directCategoryId || assistantCategoryId(draft.category);
    if (categoryId && category) category.value = categoryId;
    if (account) {
      const directAccount = currentProfile().accounts.find((item) => item.id === draft.accountId && item.active !== false);
      const requestedAccount = normalizeText(draft.account || "");
      const matchedAccount = directAccount || (requestedAccount
        ? currentProfile().accounts.find((item) => {
          const candidate = normalizeText(item.name || "");
          return item.active !== false && (candidate === requestedAccount || candidate.includes(requestedAccount) || requestedAccount.includes(candidate));
        })
        : null);
      if (matchedAccount) {
        account.value = matchedAccount.id;
      } else {
        const placeholder = new Option("Selecione uma conta para confirmar", "", true, true);
        placeholder.disabled = true;
        account.prepend(placeholder);
        account.value = "";
      }
    }
    if (installmentsEnabledInput && installmentCountInput && Number(draft.installments) > 1) {
      installmentsEnabledInput.checked = true;
      installmentCountInput.value = String(Math.min(60, Number(draft.installments)));
      updateInstallmentControls();
    }
    app.querySelector("[data-transaction-form-mode]").textContent = "Revisar rascunho do Assistente";
    pendingAssistantPersonalization = {
      paymentMethod: draft.paymentMethod || null,
      suggestedFields: personalization?.suggestedFields || {},
    };
    const summary = app.querySelector("[data-ai-draft-summary]");
    if (summary) {
      summary.hidden = false;
      summary.querySelector("[data-ai-draft-transcript]").textContent = sentence;
      const selectedCategory = currentProfile().categories.find((item) => item.id === categoryId);
      summary.querySelector("[data-ai-draft-category]").textContent = selectedCategory?.name || assistantCategoryLabel(draft.category) || "Não identificada";
      summary.querySelector("[data-ai-draft-payment]").textContent = assistantPaymentLabel(draft.paymentMethod) || "Não identificado";
      const suggestion = summary.querySelector("[data-ai-personalization-suggestion]");
      if (suggestion) {
        const labels = { type: "tipo", category: "categoria", paymentMethod: "forma de pagamento", account: "conta" };
        const fields = Object.keys(personalization?.suggestedFields || {}).map((field) => labels[field]).filter(Boolean);
        suggestion.textContent = fields.length
          ? `Sugerido com base nos seus lançamentos anteriores: ${fields.join(", ")}.`
          : "";
        suggestion.hidden = !fields.length;
      }
    }
    renderIcons();
    showToast("Rascunho do Assistente pronto. Revise e confirme antes de salvar.");
  }

  function bindTopbar() {
    const select = app.querySelector("[data-profile-select]");
    const user = currentUser();
    const search = app.querySelector("[data-global-search]");
    user.profiles.forEach((profile) => {
      const option = document.createElement("option");
      option.value = profile.id;
      option.textContent = profile.name;
      option.selected = profile.id === user.activeProfileId;
      select.append(option);
    });
    select.addEventListener("change", () => {
      animateDashboardFilterChange();
      user.activeProfileId = select.value;
      state.selectedTransactionIds.clear();
      saveStore();
      showToast("Perfil alterado.");
      renderDashboard();
    });
    if (search) {
      search.value = state.filters.description;
      search.addEventListener("input", () => {
        state.filters.description = search.value;
        setView("transactions");
        syncFilterInputs();
        renderTransactionsTable();
      });
    }
    app.querySelector("[data-quick-transaction]").addEventListener("click", () => openTransactionComposer());
    app.querySelector("[data-quick-profile]").addEventListener("click", () => {
      openProfileComposer();
    });
    app.querySelector("[data-quick-goal]").addEventListener("click", () => {
      setView("goals");
      resetGoalForm();
      app.querySelector("#goalName").focus();
    });
    app.querySelector("[data-quick-export]").addEventListener("click", exportCurrentUserData);
    app.querySelector("[data-notification-button]").addEventListener("click", openNotificationCenter);
    app.querySelectorAll("[data-notification-close]").forEach((button) => button.addEventListener("click", closeNotificationCenter));
    app.querySelector("[data-notification-read-all]")?.addEventListener("click", markAllNotificationsRead);
    app.querySelector("[data-notifications-read-all]")?.addEventListener("click", markAllNotificationsRead);
    app.querySelector("[data-notification-view-all]")?.addEventListener("click", () => {
      closeNotificationCenter();
      setView("notifications");
    });
    app.querySelector("[data-notification-list]")?.addEventListener("click", handleNotificationClick);
    app.querySelector("[data-notifications-full-list]")?.addEventListener("click", handleNotificationClick);
    app.querySelectorAll("[data-notification-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        state.notificationFilter = button.dataset.notificationFilter || "all";
        renderNotificationsView();
      });
    });
    app.querySelector("[data-notification-center]")?.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeNotificationCenter();
        app.querySelector("[data-notification-button]")?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [...event.currentTarget.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), summary')]
        .filter((element) => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  function openNotificationCenter() {
    const panel = app.querySelector("[data-notification-center]");
    const backdrop = app.querySelector(".notification-center-backdrop");
    const button = app.querySelector("[data-notification-button]");
    if (!panel || !backdrop) return;
    const profile = currentProfile();
    if (profile && core.notifications.markOpened(profile, { today: new Date() })) saveStore();
    renderNotificationCenter();
    panel.hidden = false;
    backdrop.hidden = false;
    requestAnimationFrame(() => {
      panel.classList.add("is-open");
      backdrop.classList.add("is-open");
    });
    panel.setAttribute("aria-hidden", "false");
    button?.setAttribute("aria-expanded", "true");
    document.body.classList.add("has-notification-center");
    panel.querySelector("[data-notification-close]")?.focus();
  }

  function closeNotificationCenter() {
    const panel = app.querySelector("[data-notification-center]");
    const backdrop = app.querySelector(".notification-center-backdrop");
    const button = app.querySelector("[data-notification-button]");
    if (!panel || !backdrop || panel.hidden) return;
    panel.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    button?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("has-notification-center");
    window.setTimeout(() => {
      if (panel.classList.contains("is-open")) return;
      panel.hidden = true;
      backdrop.hidden = true;
    }, prefersReducedMotion() ? 0 : 250);
  }

  function renderNotificationCenter() {
    const list = app.querySelector("[data-notification-list]");
    if (!list) return;
    const profile = currentProfile();
    if (!profile) return;
    try {
      const all = currentNotificationItems();
      const items = core.notifications.panelItems(profile, notificationOptions());
      const unread = all.filter((item) => !item.isRead).length;
      const count = app.querySelector("[data-notification-panel-count]");
      if (count) count.textContent = plural(unread, "não lida", "não lidas");
      list.innerHTML = items.length
        ? items.map(notificationQuickItemHtml).join("")
        : '<div class="notification-empty"><i data-lucide="bell-off" aria-hidden="true"></i><strong>Nenhum alerta ativo.</strong><span>Seus vencimentos e limites estão em dia.</span></div>';
    } catch (error) {
      list.innerHTML = '<div class="notification-empty is-error"><i data-lucide="triangle-alert" aria-hidden="true"></i><strong>Não foi possível atualizar os alertas.</strong><span>Tente novamente em instantes.</span></div>';
    }
    renderIcons();
  }

  function notificationOptions() {
    return {
      today: new Date(),
      money,
      syncStatus: syncCoordinator.getStatus(),
    };
  }

  function currentNotificationItems() {
    const profile = currentProfile();
    return profile ? core.notifications.build(profile, notificationOptions()) : [];
  }

  function notificationQuickItemHtml(item) {
    return `
      <article class="notification-center-item ${item.isRead ? "is-read" : "is-unread"} tone-${item.tone}" data-notification-key="${escapeHtml(item.key)}">
        <span class="notification-item-icon"><i data-lucide="${item.icon}" aria-hidden="true"></i></span>
        <div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.description)}</p><small>${escapeHtml(item.time)} · ${escapeHtml(item.profileName)}</small></div>
        <button class="ghost-action" data-notification-open="${escapeHtml(item.key)}" type="button">${escapeHtml(item.actionLabel)}</button>
      </article>`;
  }

  function renderNotificationsView() {
    const list = app.querySelector("[data-notifications-full-list]");
    const profile = currentProfile();
    if (!list || !profile) return;
    try {
      const all = currentNotificationItems();
      const items = core.notifications.filterItems(all, state.notificationFilter);
      const unread = all.filter((item) => !item.isRead).length;
      const unreadElement = app.querySelector("[data-notifications-unread]");
      const profileElement = app.querySelector("[data-notifications-profile]");
      if (unreadElement) unreadElement.textContent = String(unread);
      if (profileElement) profileElement.textContent = profile.name;
      app.querySelectorAll("[data-notification-filter]").forEach((button) => {
        const selected = button.dataset.notificationFilter === state.notificationFilter;
        button.classList.toggle("is-active", selected);
        button.setAttribute("aria-selected", String(selected));
      });
      list.innerHTML = items.length
        ? items.map(notificationFullItemHtml).join("")
        : '<div class="panel notification-empty"><i data-lucide="bell-off" aria-hidden="true"></i><strong>Nenhuma notificação neste filtro.</strong><span>Os alertas ativos aparecerão aqui automaticamente.</span></div>';
    } catch (error) {
      list.innerHTML = '<div class="panel notification-empty is-error"><i data-lucide="triangle-alert" aria-hidden="true"></i><strong>Não foi possível carregar as notificações.</strong><span>Seus dados financeiros continuam preservados.</span></div>';
    }
    renderIcons();
  }

  function notificationFullItemHtml(item) {
    const value = item.amount === null || item.amount === undefined ? "" : `<span><small>Valor</small><strong>${money(item.amount)}</strong></span>`;
    const category = item.categoryName ? `<span><small>Categoria</small><strong>${escapeHtml(item.categoryName)}</strong></span>` : "";
    const account = item.accountName ? `<span><small>Conta</small><strong>${escapeHtml(item.accountName)}</strong></span>` : "";
    const date = item.date && core.notifications.validDateInput(item.date)
      ? `<span><small>Data</small><strong>${formatDate(item.date)}</strong></span>`
      : "";
    return `
      <article class="panel notification-full-item ${item.isRead ? "is-read" : "is-unread"} tone-${item.tone}" data-notification-key="${escapeHtml(item.key)}">
        <header>
          <span class="notification-item-icon"><i data-lucide="${item.icon}" aria-hidden="true"></i></span>
          <div><span class="notification-type-label">${notificationTypeLabel(item.type)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description)}</p></div>
          <span class="notification-priority priority-${item.priority}">${escapeHtml(item.priorityLabel)}</span>
        </header>
        <div class="notification-detail-grid">${value}${date}${category}${account}<span><small>Perfil</small><strong>${escapeHtml(item.profileName)}</strong></span><span><small>Prazo</small><strong>${escapeHtml(item.time)}</strong></span></div>
        <footer>
          <button class="ghost-action compact" data-notification-toggle-read="${escapeHtml(item.key)}" type="button"><i data-lucide="${item.isRead ? "mail" : "mail-check"}" aria-hidden="true"></i><span>${item.isRead ? "Marcar como não lida" : "Marcar como lida"}</span></button>
          <button class="ghost-action compact" data-notification-dismiss="${escapeHtml(item.key)}" type="button"><i data-lucide="eye-off" aria-hidden="true"></i><span>Dispensar</span></button>
          <details class="notification-snooze-menu"><summary class="ghost-action compact"><i data-lucide="clock-3" aria-hidden="true"></i><span>Adiar</span></summary><div><button data-notification-snooze="${escapeHtml(item.key)}" data-snooze-days="1" type="button">Por 1 dia</button><button data-notification-snooze="${escapeHtml(item.key)}" data-snooze-days="3" type="button">Por 3 dias</button></div></details>
          <button class="primary-action compact" data-notification-open="${escapeHtml(item.key)}" type="button"><span>Abrir item</span><i data-lucide="arrow-up-right" aria-hidden="true"></i></button>
        </footer>
      </article>`;
  }

  function notificationTypeLabel(type) {
    return ({ due: "Vencimento", budget: "Orçamento", goal: "Meta", sync: "Sincronização" })[type] || "Alerta";
  }

  function handleNotificationClick(event) {
    const open = event.target.closest("[data-notification-open]");
    if (open) {
      openNotificationItem(open.dataset.notificationOpen);
      return;
    }
    const toggle = event.target.closest("[data-notification-toggle-read]");
    if (toggle) {
      const item = currentNotificationItems().find((entry) => entry.key === toggle.dataset.notificationToggleRead);
      persistNotificationChange(item && core.notifications.setRead(currentProfile(), item.key, !item.isRead), item?.isRead ? "Notificação marcada como não lida." : "Notificação marcada como lida.");
      return;
    }
    const dismissButton = event.target.closest("[data-notification-dismiss]");
    if (dismissButton) {
      persistNotificationChange(core.notifications.dismiss(currentProfile(), dismissButton.dataset.notificationDismiss), "Notificação dispensada.");
      return;
    }
    const snoozeButton = event.target.closest("[data-notification-snooze]");
    if (snoozeButton) {
      const days = Number(snoozeButton.dataset.snoozeDays);
      persistNotificationChange(core.notifications.snooze(currentProfile(), snoozeButton.dataset.notificationSnooze, days, { today: new Date() }), `Notificação adiada por ${days} ${days === 1 ? "dia" : "dias"}.`);
    }
  }

  function persistNotificationChange(changed, message) {
    if (!changed) return;
    saveStore();
    refreshNotificationSurfaces();
    showToast(message);
  }

  function markAllNotificationsRead() {
    const items = currentNotificationItems();
    persistNotificationChange(core.notifications.markAllRead(currentProfile(), items), "Todas as notificações foram marcadas como lidas.");
  }

  function openNotificationItem(key) {
    const item = currentNotificationItems().find((entry) => entry.key === key);
    if (!item) {
      showToast("Este alerta não está mais ativo.");
      refreshNotificationSurfaces();
      return;
    }
    const changed = core.notifications.setRead(currentProfile(), item.key, true);
    if (changed) saveStore();
    closeNotificationCenter();
    if (item.type === "due") {
      setView("transactions");
      openTransactionDetail(item.transactionId);
    } else if (item.type === "budget") {
      setView("budgets");
      state.budgetMonth = item.date.slice(0, 7);
      renderBudgets();
      openBudgetComposer(item.budgetId);
    } else if (item.type === "goal") {
      setView("goals");
      editGoal(item.goalId);
    } else {
      setView("settings");
    }
    refreshNotificationSurfaces();
  }

  function refreshNotificationSurfaces() {
    const profile = currentProfile();
    if (!profile) {
      updateNotificationBadge({ count: 0, label: "0" });
      return;
    }
    const summary = core.notifications.badge(profile, notificationOptions());
    updateNotificationBadge(summary);
    const panel = app.querySelector("[data-notification-center]");
    if (panel && !panel.hidden) renderNotificationCenter();
    if (state.view === "notifications") renderNotificationsView();
  }

  function bindFloatingActionButton() {
    if (typeof fabCleanup === "function") fabCleanup();
    fabCleanup = null;

    const dial = app.querySelector("[data-fab-dial]");
    const trigger = app.querySelector("[data-fab-trigger]");
    const menu = app.querySelector("[data-fab-menu]");
    if (!dial || !trigger || !menu) return;

    const closeMenu = () => setFabMenuOpen(false);
    const handleDocumentClick = (event) => {
      if (!dial.contains(event.target)) closeMenu();
    };
    const handleKeydown = (event) => {
      if (event.key === "Escape") {
        closeMenu();
        trigger.focus();
      }
    };
    const modalObserver = new MutationObserver((records) => {
      if (records.some((record) => !dial.contains(record.target))) syncFloatingActionButton();
    });

    trigger.addEventListener("click", (event) => {
      createFabRipple(event);
      const nextOpen = !dial.classList.contains("is-open");
      setFabMenuOpen(nextOpen);
      if (nextOpen && event.detail === 0) menu.querySelector("[data-fab-action]")?.focus();
    });

    app.querySelectorAll("[data-fab-action]").forEach((button) => {
      button.addEventListener("click", (event) => {
        createFabRipple(event);
        closeMenu();
        const action = button.dataset.fabAction;
        if (action === "income") openTransactionComposer("income");
        if (action === "expense") openTransactionComposer("expense");
        if (action === "goal") openGoalComposer();
        if (action === "transfer") openTransferComposer();
      });
    });

    document.addEventListener("click", handleDocumentClick);
    document.addEventListener("keydown", handleKeydown);
    window.addEventListener("resize", syncFloatingActionButton);
    modalObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["hidden", "role", "aria-modal"],
      childList: true,
      subtree: true,
    });
    fabCleanup = () => {
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("resize", syncFloatingActionButton);
      modalObserver.disconnect();
    };
    setFabMenuOpen(false);
    syncFloatingActionButton();
  }

  function setFabMenuOpen(isOpen) {
    const dial = app.querySelector("[data-fab-dial]");
    const trigger = app.querySelector("[data-fab-trigger]");
    const menu = app.querySelector("[data-fab-menu]");
    if (!dial || !trigger || !menu) return;
    const wasOpen = dial.classList.contains("is-open");
    dial.classList.toggle("is-open", isOpen);
    if (wasOpen !== isOpen) {
      trigger.classList.remove("is-bouncing");
      void trigger.offsetWidth;
      trigger.classList.add("is-bouncing");
      window.setTimeout(() => trigger.classList.remove("is-bouncing"), 460);
    }
    trigger.setAttribute("aria-expanded", String(isOpen));
    menu.setAttribute("aria-hidden", String(!isOpen));
    menu.querySelectorAll("[data-fab-action]").forEach((button) => {
      button.tabIndex = isOpen ? 0 : -1;
    });
  }

  function syncFloatingActionButton() {
    const dial = app.querySelector("[data-fab-dial]");
    if (!dial) return;
    const isWideViewport = !window.matchMedia("(max-width: 900px)").matches;
    const isVisible = fabVisibleViews.has(state.view) && isWideViewport && !hasOpenModalDialog();
    dial.hidden = !isVisible;
    dial.classList.toggle("is-visible", isVisible);
    app.querySelector(".app-shell")?.classList.toggle("has-fab", isVisible);
    if (!isVisible) setFabMenuOpen(false);
  }

  function hasOpenModalDialog() {
    return Array.from(document.querySelectorAll('[role="dialog"][aria-modal="true"]')).some((dialog) => (
      !dialog.closest("[hidden]") && dialog.getClientRects().length > 0
    ));
  }

  function createFabRipple(event) {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement("span");
    ripple.className = "fab-ripple";
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    const originX = event.clientX || rect.left + rect.width / 2;
    const originY = event.clientY || rect.top + rect.height / 2;
    ripple.style.left = `${originX - rect.left - size / 2}px`;
    ripple.style.top = `${originY - rect.top - size / 2}px`;
    button.append(ripple);
    ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
  }

  function setView(view) {
    setFabMenuOpen(false);
    if (view !== "transactions") {
      closeMobileTransactionComposer();
      closeCategoryManager();
    }
    if (view !== "assistant") {
      closeAssistantVoiceModal({ restoreFocus: false });
      closeReceiptOcrModal({ restoreFocus: false });
      closeIncomingSharedContent({ restoreFocus: false });
    }
    const enteringTransactions = view === "transactions" && state.view !== "transactions";
    const enteringBudgets = view === "budgets" && state.view !== "budgets";
    state.view = view;
    const titleMap = {
      overview: "Visão geral",
      transactions: "Transações",
      accounts: "Contas",
      budgets: "Orçamentos",
      notifications: "Notificações",
      assistant: "Assistente Financeiro",
      cashflow: "Fluxo de caixa",
      goals: "Metas e Objetivos",
      profiles: "Perfis",
      settings: "Configurações",
    };
    app.querySelector("[data-view-title]").textContent = titleMap[view] || "Nexio";
    app.querySelectorAll("[data-view]").forEach((button) => {
      const isActive = button.dataset.view === view;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-current", isActive ? "page" : "false");
    });
    app.querySelectorAll("[data-view-panel]").forEach((panel) => {
      const isActive = panel.dataset.viewPanel === view;
      panel.classList.toggle("is-visible", isActive);
      panel.toggleAttribute("hidden", !isActive);
      panel.setAttribute("aria-hidden", String(!isActive));
    });
    if (view === "cashflow") drawCashflowCharts();
    if (view === "overview") drawMonthlyFlowChart();
    if (view === "notifications") renderNotificationsView();
    if (enteringTransactions) resetTransactionsMonthToCurrent();
    if (enteringBudgets) {
      state.budgetMonth = toMonthInput(new Date());
      const monthPicker = app.querySelector("#budgetMonthPicker");
      if (monthPicker) monthPicker.value = state.budgetMonth;
      renderBudgets();
    }
    syncFloatingActionButton();
  }

  function resetTransactionsMonthToCurrent() {
    const month = currentCalendarMonth();
    state.filters.dateFrom = month.start;
    state.filters.dateTo = month.end;
    state.transactionPage = 1;
    state.selectedTransactionIds.clear();

    const bulkMonth = app.querySelector("#bulkStatusMonth");
    if (bulkMonth) bulkMonth.value = month.value;
    syncFilterInputs();
    renderTransactionsTable();
  }

  function refreshAll() {
    const user = currentUser();
    const profile = currentProfile();
    if (!user || !profile) return;

    ensureProfileShape(profile);
    if (updateOverdueTransactions(profile)) saveStore();
    populateCategorySelects();
    populateAccountSelects();
    populateStatusSelects();
    updateOverview();
    renderAccounts();
    renderDashboardAccounts();
    renderBudgets();
    renderDashboardBudgets();
    renderNotificationsView();
    renderRecentTransactions();
    renderTransactionsTable();
    renderCategories();
    renderGoals();
    renderProfiles();
    renderSettings();
    drawMonthlyFlowChart();
    drawCashflowCharts();
    setView(state.view);
    renderIcons();
    applyLanguage(user.language);
  }

  function updateOverdueTransactions(profile) {
    let changed = false;
    profile.transactions.forEach((transaction) => {
      if (applyAutomaticOverdueStatus(transaction)) changed = true;
    });
    return changed;
  }

  function bindAccountForms() {
    const form = app.querySelector("#accountForm");
    const transferForm = app.querySelector("#accountTransferForm");
    core.accounts.types.forEach((type) => {
      app.querySelector("#accountType")?.append(new Option(core.accounts.typeLabels[type], type));
    });
    if (app.querySelector("#accountCurrency")) app.querySelector("#accountCurrency").value = currentUser()?.currency || "BRL";
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      const profile = currentProfile();
      const user = currentUser();
      const id = app.querySelector("#accountId").value;
      const input = {
        name: app.querySelector("#accountName").value,
        type: app.querySelector("#accountType").value,
        initialBalance: app.querySelector("#accountInitialBalance").value,
        currency: user.currency,
        active: app.querySelector("#accountActive").checked,
        makeDefault: app.querySelector("#accountDefault").checked,
      };
      const result = id
        ? core.accounts.update(profile, id, input, { uid, currency: user.currency })
        : core.accounts.add(profile, input, { uid, currency: user.currency });
      if (!result.ok) {
        showToast(result.error);
        return;
      }
      saveStore();
      showToast(id ? "Conta atualizada." : "Conta criada.");
      resetAccountForm();
      refreshAll();
    });
    app.querySelector("[data-reset-account-form]")?.addEventListener("click", resetAccountForm);
    app.querySelector("[data-new-account]")?.addEventListener("click", () => {
      resetAccountForm();
      app.querySelector("#accountName")?.focus();
    });
    app.querySelector("[data-open-transfer]")?.addEventListener("click", () => openTransferComposer());
    app.querySelectorAll("[data-close-transfer]").forEach((button) => button.addEventListener("click", closeAccountTransfer));
    app.querySelector("[data-transfer-composer]")?.addEventListener("click", (event) => {
      if (event.target === event.currentTarget) closeAccountTransfer();
    });
    app.querySelector("[data-show-inactive-accounts]")?.addEventListener("change", (event) => {
      state.showInactiveAccounts = event.currentTarget.checked;
      renderAccounts();
    });
    transferForm?.addEventListener("submit", (event) => {
      event.preventDefault();
      const profile = currentProfile();
      const transferId = app.querySelector("#accountTransferId").value;
      const input = {
        fromAccountId: app.querySelector("#transferFromAccount").value,
        toAccountId: app.querySelector("#transferToAccount").value,
        amount: app.querySelector("#transferAmount").value,
        date: app.querySelector("#transferDate").value,
        description: app.querySelector("#transferDescription").value,
      };
      const validation = core.accounts.validateTransfer(profile, input);
      if (!validation.ok) {
        showToast(validation.error);
        return;
      }
      input.categoryId = ensureTransferCategory(profile).id;
      const result = transferId
        ? core.accounts.updateTransfer(profile, transferId, input, { uid })
        : core.accounts.createTransfer(profile, input, { uid });
      if (!result.ok) {
        showToast(result.error);
        return;
      }
      saveStore();
      closeAccountTransfer();
      showToast(transferId ? "Transferência atualizada." : "Transferência realizada.");
      refreshAll();
    });
  }

  function resetAccountForm() {
    const form = app.querySelector("#accountForm");
    if (!form) return;
    form.reset();
    app.querySelector("#accountId").value = "";
    app.querySelector("#accountType").value = "checking";
    app.querySelector("#accountInitialBalance").value = "0";
    app.querySelector("#accountCurrency").value = currentUser()?.currency || "BRL";
    app.querySelector("#accountActive").checked = true;
    app.querySelector("[data-account-form-mode]").textContent = "Nova conta";
    app.querySelector("[data-save-account]").textContent = "Salvar conta";
    state.editingAccountId = "";
  }

  function populateAccountSelects() {
    const profile = currentProfile();
    if (!profile) return;
    const validIds = new Set(profile.accounts.map((account) => account.id));
    if (!validIds.has(state.filters.account)) state.filters.account = "all";
    if (!validIds.has(state.cashflowAccount)) state.cashflowAccount = "all";
    if (!validIds.has(state.exportAccount)) state.exportAccount = "all";
    if (!validIds.has(state.budgetAccount)) state.budgetAccount = "all";
    const editing = profile.transactions.find((transaction) => transaction.id === state.editingTransactionId);
    const active = core.accounts.activeAccounts(profile);
    const transactionAccounts = core.accounts.selectableAccounts(profile, editing?.accountId);
    const transactionSelect = app.querySelector("#transactionAccount");
    if (transactionSelect) {
      const selected = transactionSelect.value || editing?.accountId || profile.defaultAccountId;
      transactionSelect.innerHTML = "";
      transactionAccounts.forEach((account) => {
        const label = `${account.name}${account.active === false ? " (inativa)" : ""}`;
        transactionSelect.append(new Option(label, account.id));
      });
      transactionSelect.value = transactionAccounts.some((account) => account.id === selected) ? selected : profile.defaultAccountId;
    }
    const fillAll = (selector, value) => {
      const select = app.querySelector(selector);
      if (!select) return;
      select.innerHTML = "";
      select.append(new Option("Todas as contas", "all"));
      profile.accounts.forEach((account) => select.append(new Option(`${account.name}${account.active === false ? " (inativa)" : ""}`, account.id)));
      select.value = profile.accounts.some((account) => account.id === value) ? value : "all";
    };
    fillAll("#filterAccount", state.filters.account);
    fillAll("#cashflowAccount", state.cashflowAccount);
    fillAll("#exportAccount", state.exportAccount);
    fillAll("#budgetAccount", state.budgetAccount);
    const fillActive = (selector) => {
      const select = app.querySelector(selector);
      if (!select) return;
      const previous = select.value;
      select.innerHTML = "";
      active.forEach((account) => select.append(new Option(account.name, account.id)));
      if (active.some((account) => account.id === previous)) select.value = previous;
    };
    fillActive("#transferFromAccount");
    fillActive("#transferToAccount");
  }

  function renderDashboardAccounts() {
    const profile = currentProfile();
    const box = app.querySelector("[data-dashboard-account-list]");
    if (!profile || !box) return;
    const rows = core.accounts.balances(profile, { includeInactive: false })
      .sort((a, b) => Number(b.account.id === profile.defaultAccountId) - Number(a.account.id === profile.defaultAccountId))
      .slice(0, 4);
    box.innerHTML = rows.map(({ account, balance: value }) => `
      <button class="dashboard-account-item" data-dashboard-account="${escapeHtml(account.id)}" type="button">
        <span><i data-lucide="${accountTypeIcon(account.type)}" aria-hidden="true"></i>${escapeHtml(account.name)}${profile.defaultAccountId === account.id ? " · Padrão" : ""}</span>
        <strong class="${value < 0 ? "amount-expense" : ""}">${money(value)}</strong>
      </button>
    `).join("");
    box.querySelectorAll("[data-dashboard-account]").forEach((button) => button.addEventListener("click", () => {
      state.filters.account = button.dataset.dashboardAccount;
      setView("transactions");
      syncFilterInputs();
      renderTransactionsTable();
    }));
    renderIcons();
  }

  function renderAccounts() {
    try {
      renderAccountsContent();
    } catch (error) {
      const box = app.querySelector("[data-account-list]");
      if (!box) return;
      box.innerHTML = "";
      box.append(emptyState({
        icon: "shield-alert",
        title: "Não foi possível exibir as contas.",
        description: "Seus dados foram preservados. Recarregue a tela e tente novamente.",
      }));
    }
  }

  function renderAccountsContent() {
    const profile = currentProfile();
    const box = app.querySelector("[data-account-list]");
    if (!profile || !box) return;
    const rows = core.accounts.balances(profile, { includeInactive: state.showInactiveAccounts });
    const active = core.accounts.activeAccounts(profile);
    const total = core.accounts.consolidatedBalance(profile, { includeInactive: state.showInactiveAccounts });
    const totalElement = app.querySelector("[data-accounts-total-balance]");
    if (totalElement) {
      totalElement.textContent = money(total);
      setAmountTone(totalElement, total);
    }
    const activeLabel = app.querySelector("[data-accounts-active-count]");
    if (activeLabel) activeLabel.textContent = plural(active.length, "conta ativa", "contas ativas");
    const totalLabel = app.querySelector("[data-accounts-total-label]");
    if (totalLabel) totalLabel.textContent = state.showInactiveAccounts ? "Saldo incluindo contas inativas" : "Saldo ativo consolidado";
    const inactiveToggle = app.querySelector("[data-show-inactive-accounts]");
    if (inactiveToggle) inactiveToggle.checked = state.showInactiveAccounts;
    box.innerHTML = "";
    if (!rows.length) {
      box.append(emptyState({
        icon: "landmark",
        title: "Nenhuma conta disponível.",
        description: "Crie uma conta para começar a separar seus saldos.",
        actionLabel: "Nova conta",
        action: () => app.querySelector("#accountName")?.focus(),
      }));
      return;
    }
    rows.forEach(({ account, balance: value, transactionCount: count }) => {
      const card = document.createElement("article");
      card.className = `account-card${account.active === false ? " is-inactive" : ""}`;
      card.innerHTML = `
        <header><span class="account-card-icon"><i data-lucide="${accountTypeIcon(account.type)}" aria-hidden="true"></i></span><div><h3>${escapeHtml(account.name)}</h3><p>${escapeHtml(core.accounts.typeLabels[account.type] || account.type || "Conta")}</p></div>${profile.defaultAccountId === account.id ? '<span class="pill">Padrão</span>' : ""}</header>
        <div class="account-card-balance"><span>Saldo atual</span><strong class="${value < 0 ? "amount-expense" : ""}">${money(value)}</strong></div>
        <dl><div><dt>Saldo inicial</dt><dd>${money(account.initialBalance)}</dd></div><div><dt>Movimentações</dt><dd>${count}</dd></div><div><dt>Status</dt><dd>${account.active === false ? "Inativa" : "Ativa"}</dd></div></dl>
        <footer>
          <button class="ghost-action compact" data-filter-account="${escapeHtml(account.id)}" type="button">Ver transações</button>
          <button class="icon-button" data-edit-account="${escapeHtml(account.id)}" type="button" aria-label="Editar ${escapeHtml(account.name)}"><i data-lucide="pencil" aria-hidden="true"></i></button>
          <details class="account-action-menu">
            <summary class="icon-button" aria-label="Mais ações para ${escapeHtml(account.name)}"><i data-lucide="more-horizontal" aria-hidden="true"></i></summary>
            <div>
              ${profile.defaultAccountId === account.id || account.active === false ? "" : `<button data-default-account="${escapeHtml(account.id)}" type="button"><i data-lucide="star" aria-hidden="true"></i>Tornar padrão</button>`}
              <button data-toggle-account="${escapeHtml(account.id)}" type="button"><i data-lucide="${account.active === false ? "circle-play" : "circle-pause"}" aria-hidden="true"></i>${account.active === false ? "Ativar" : "Inativar"}</button>
              <button class="danger" data-delete-account="${escapeHtml(account.id)}" type="button"><i data-lucide="trash-2" aria-hidden="true"></i>Excluir</button>
            </div>
          </details>
        </footer>`;
      box.append(card);
    });
    bindAccountActions(box);
    renderIcons();
  }

  function accountTypeIcon(type) {
    return ({ checking: "landmark", savings: "piggy-bank", cash: "banknote", "digital-wallet": "wallet", investment: "chart-no-axes-combined", other: "circle-dollar-sign" })[type] || "wallet-cards";
  }

  function bindAccountActions(box) {
    box.querySelectorAll("[data-filter-account]").forEach((button) => button.addEventListener("click", () => {
      state.filters.account = button.dataset.filterAccount;
      state.transactionPage = 1;
      setView("transactions");
      syncFilterInputs();
      renderTransactionsTable();
    }));
    box.querySelectorAll("[data-edit-account]").forEach((button) => button.addEventListener("click", () => editAccount(button.dataset.editAccount)));
    box.querySelectorAll("[data-default-account]").forEach((button) => button.addEventListener("click", () => {
      const result = core.accounts.setDefault(currentProfile(), button.dataset.defaultAccount);
      if (!result.ok) return showToast(result.error);
      saveStore();
      showToast("Conta padrão atualizada.");
      refreshAll();
    }));
    box.querySelectorAll("[data-toggle-account]").forEach((button) => button.addEventListener("click", () => {
      const profile = currentProfile();
      const account = core.accounts.accountById(profile, button.dataset.toggleAccount);
      if (!account) return;
      const activating = account.active === false;
      if (!activating && !confirm(`Inativar a conta "${account.name}"? Ela continuará disponível em filtros e edições.`)) return;
      const result = core.accounts.setActive(profile, account.id, activating);
      if (!result.ok) return showToast(result.error);
      saveStore();
      showToast(activating ? "Conta ativada." : "Conta inativada.");
      refreshAll();
    }));
    box.querySelectorAll("[data-delete-account]").forEach((button) => button.addEventListener("click", () => {
      const profile = currentProfile();
      const account = core.accounts.accountById(profile, button.dataset.deleteAccount);
      if (!account) return;
      if (!confirm(`Excluir a conta "${account.name}"?`)) return;
      const result = core.accounts.remove(profile, account.id);
      if (!result.ok) return showToast(result.error);
      saveStore();
      showToast("Conta excluída.");
      resetAccountForm();
      refreshAll();
    }));
  }

  function editAccount(accountId) {
    const account = core.accounts.accountById(currentProfile(), accountId);
    if (!account) return;
    state.editingAccountId = account.id;
    app.querySelector("#accountId").value = account.id;
    app.querySelector("#accountName").value = account.name;
    app.querySelector("#accountType").value = core.accounts.types.includes(account.type) ? account.type : "other";
    app.querySelector("#accountInitialBalance").value = account.initialBalance;
    app.querySelector("#accountCurrency").value = account.currency;
    app.querySelector("#accountActive").checked = account.active !== false;
    app.querySelector("#accountDefault").checked = currentProfile().defaultAccountId === account.id;
    app.querySelector("[data-account-form-mode]").textContent = "Editando conta";
    app.querySelector("[data-save-account]").textContent = "Atualizar conta";
    app.querySelector("#accountName")?.focus();
  }

  function ensureTransferCategory(profile) {
    let category = profile.categories.find((item) => normalizeText(item.name) === "transferencias");
    if (!category) {
      category = { id: uid("cat"), name: "Transferências", icon: "↔" };
      profile.categories.push(category);
    }
    return category;
  }

  function openTransferComposer(transferId = "") {
    const profile = currentProfile();
    if (core.accounts.activeAccounts(profile).length < 2) {
      setView("accounts");
      showToast("Crie pelo menos duas contas ativas para transferir.");
      return;
    }
    setView("accounts");
    populateAccountSelects();
    const modal = app.querySelector("[data-transfer-composer]");
    const form = app.querySelector("#accountTransferForm");
    form.reset();
    app.querySelector("#accountTransferId").value = transferId;
    app.querySelector("#transferDate").value = toDateInput(new Date());
    app.querySelector("#transferFromAccount").value = profile.defaultAccountId;
    const firstDestination = core.accounts.activeAccounts(profile).find((account) => account.id !== profile.defaultAccountId);
    if (firstDestination) app.querySelector("#transferToAccount").value = firstDestination.id;
    if (transferId) {
      const pairValidation = core.accounts.validateTransferPair(profile, transferId);
      if (!pairValidation.ok) return showToast(pairValidation.error);
      const expense = pairValidation.outgoing;
      const income = pairValidation.incoming;
      if ([expense.accountId, income.accountId].some((accountId) => core.accounts.accountById(profile, accountId)?.active === false)) {
        return showToast("Ative as duas contas antes de editar esta transferência.");
      }
      app.querySelector("#transferFromAccount").value = expense.accountId;
      app.querySelector("#transferToAccount").value = income.accountId;
      app.querySelector("#transferAmount").value = expense.amount;
      app.querySelector("#transferDate").value = expense.date;
      app.querySelector("#transferDescription").value = expense.description.startsWith("Transferência: ") ? "" : expense.description;
    }
    modal.hidden = false;
    modal.classList.add("is-open");
    document.body.classList.add("has-modal-open");
    app.querySelector("#transferAmount")?.focus();
  }

  function closeAccountTransfer() {
    const modal = app.querySelector("[data-transfer-composer]");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.hidden = true;
    document.body.classList.remove("has-modal-open");
  }

  function bindBudgetForms() {
    const monthPicker = app.querySelector("#budgetMonthPicker");
    if (monthPicker) {
      monthPicker.value = state.budgetMonth;
      monthPicker.addEventListener("change", () => {
        if (!core.budgets.isValidMonth(monthPicker.value)) {
          showToast("Informe um mês válido.");
          monthPicker.value = state.budgetMonth;
          return;
        }
        state.budgetMonth = monthPicker.value;
        renderBudgets();
      });
    }
    app.querySelector("[data-budget-previous-month]")?.addEventListener("click", () => changeBudgetMonth(-1));
    app.querySelector("[data-budget-next-month]")?.addEventListener("click", () => changeBudgetMonth(1));
    app.querySelector("#budgetAccount")?.addEventListener("change", (event) => {
      state.budgetAccount = event.currentTarget.value || "all";
      renderBudgets();
    });
    app.querySelector("[data-show-inactive-budgets]")?.addEventListener("change", (event) => {
      state.showInactiveBudgets = event.currentTarget.checked;
      renderBudgets();
    });
    app.querySelectorAll("[data-new-budget]").forEach((button) => {
      button.addEventListener("click", () => openBudgetComposer());
    });
    app.querySelector("[data-copy-all-budgets]")?.addEventListener("click", copyAllBudgetsToNextMonth);
    app.querySelectorAll("[data-close-budget]").forEach((button) => button.addEventListener("click", closeBudgetComposer));
    app.querySelector("[data-budget-composer]")?.addEventListener("click", (event) => {
      if (event.target === event.currentTarget) closeBudgetComposer();
    });
    app.querySelector("#budgetForm")?.addEventListener("submit", handleBudgetSubmit);
    app.querySelector("[data-budget-list]")?.addEventListener("click", handleBudgetListAction);
    app.querySelector("[data-dashboard-budget-list]")?.addEventListener("click", (event) => {
      if (event.target.closest("[data-new-budget]")) openBudgetComposer();
    });
  }

  function changeBudgetMonth(offset) {
    state.budgetMonth = shiftMonthValue(state.budgetMonth, offset);
    const monthPicker = app.querySelector("#budgetMonthPicker");
    if (monthPicker) monthPicker.value = state.budgetMonth;
    renderBudgets();
  }

  function populateBudgetCategorySelect(selectedId = "") {
    const select = app.querySelector("#budgetCategory");
    if (!select) return;
    const categories = core.budgets.expenseCategories(currentProfile());
    select.innerHTML = "";
    if (!categories.length) {
      select.append(new Option("Nenhuma categoria de despesa disponível", ""));
      select.disabled = true;
      return;
    }
    select.disabled = false;
    select.append(new Option("Selecione uma categoria", ""));
    categories.forEach((category) => select.append(new Option(`${category.icon || "•"} ${category.name}`, category.id)));
    select.value = categories.some((category) => category.id === selectedId) ? selectedId : "";
  }

  function openBudgetComposer(budgetId = "") {
    const profile = currentProfile();
    const budget = budgetId ? core.budgets.budgetById(profile, budgetId) : null;
    state.editingBudgetId = budget?.id || "";
    populateBudgetCategorySelect(budget?.categoryId || "");
    app.querySelector("#budgetId").value = budget?.id || "";
    app.querySelector("#budgetMonth").value = budget?.month || state.budgetMonth;
    app.querySelector("#budgetLimit").value = budget?.limit ?? "";
    app.querySelector("#budgetAlertThreshold").value = budget?.alertThreshold ?? 80;
    app.querySelector("#budgetActive").checked = budget?.active !== false;
    app.querySelector("[data-budget-form-mode]").textContent = budget ? "Editar orçamento" : "Novo orçamento";
    setButtonText("[data-save-budget]", budget ? "Atualizar orçamento" : "Salvar orçamento");
    const modal = app.querySelector("[data-budget-composer]");
    modal.hidden = false;
    modal.classList.add("is-open");
    document.body.classList.add("has-modal-open");
    window.requestAnimationFrame(() => (budget ? app.querySelector("#budgetLimit") : app.querySelector("#budgetCategory"))?.focus());
  }

  function closeBudgetComposer() {
    const modal = app.querySelector("[data-budget-composer]");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.hidden = true;
    document.body.classList.remove("has-modal-open");
    state.editingBudgetId = "";
    app.querySelector("#budgetForm")?.reset();
    if (app.querySelector("#budgetId")) app.querySelector("#budgetId").value = "";
    if (app.querySelector("#budgetAlertThreshold")) app.querySelector("#budgetAlertThreshold").value = "80";
  }

  function handleBudgetSubmit(event) {
    event.preventDefault();
    const profile = currentProfile();
    const budgetId = app.querySelector("#budgetId").value;
    const input = {
      categoryId: app.querySelector("#budgetCategory").value,
      month: app.querySelector("#budgetMonth").value,
      limit: app.querySelector("#budgetLimit").value,
      alertThreshold: app.querySelector("#budgetAlertThreshold").value,
      active: app.querySelector("#budgetActive").checked,
    };
    const result = budgetId
      ? core.budgets.update(profile, budgetId, input, { uid })
      : core.budgets.add(profile, input, { uid });
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    state.budgetMonth = result.budget.month;
    saveStore();
    closeBudgetComposer();
    showToast(budgetId ? "Orçamento atualizado." : "Orçamento criado.");
    refreshAll();
  }

  function handleBudgetListAction(event) {
    const edit = event.target.closest("[data-edit-budget]");
    if (edit) {
      openBudgetComposer(edit.dataset.editBudget);
      return;
    }
    const toggle = event.target.closest("[data-toggle-budget]");
    if (toggle) {
      const profile = currentProfile();
      const budget = core.budgets.budgetById(profile, toggle.dataset.toggleBudget);
      const result = core.budgets.setActive(profile, budget?.id, budget?.active === false, { uid });
      if (!result.ok) return showToast(result.error);
      saveStore();
      showToast(result.budget.active ? "Orçamento reativado." : "Orçamento desativado.");
      refreshAll();
      return;
    }
    const copy = event.target.closest("[data-copy-budget]");
    if (copy) {
      const result = core.budgets.copyNextMonth(currentProfile(), copy.dataset.copyBudget, { uid });
      if (!result.ok) return showToast(result.error);
      if (result.copied) saveStore();
      showToast(result.copied ? "Orçamento copiado para o próximo mês." : "O próximo mês já possui orçamento para esta categoria.");
      refreshAll();
      return;
    }
    const removeButton = event.target.closest("[data-delete-budget]");
    if (removeButton) {
      const profile = currentProfile();
      const budget = core.budgets.budgetById(profile, removeButton.dataset.deleteBudget);
      if (!budget) return showToast("Orçamento não encontrado.");
      if (!confirm("Excluir este orçamento?")) return;
      const result = core.budgets.remove(profile, budget.id);
      if (!result.ok) return showToast(result.error);
      saveStore();
      showToast("Orçamento excluído.");
      refreshAll();
      return;
    }
    if (event.target.closest("[data-new-budget]")) openBudgetComposer();
  }

  function copyAllBudgetsToNextMonth() {
    const result = core.budgets.copyAllNextMonth(currentProfile(), state.budgetMonth, { uid });
    if (!result.ok) return showToast(result.error);
    if (result.copied) saveStore();
    showToast(`${result.copied} copiado(s) e ${result.ignored} ignorado(s).`);
    refreshAll();
  }

  function renderBudgets() {
    const profile = currentProfile();
    const list = app.querySelector("[data-budget-list]");
    if (!profile || !list) return;
    try {
      const activeSummary = core.budgets.summary(profile, state.budgetMonth, { accountId: state.budgetAccount });
      const visibleSummary = core.budgets.summary(profile, state.budgetMonth, {
        accountId: state.budgetAccount,
        includeInactive: state.showInactiveBudgets,
      });
      if (!activeSummary.ok || !visibleSummary.ok) throw new Error(activeSummary.error || visibleSummary.error);
      setAnimatedMoney("[data-budgets-planned]", activeSummary.planned);
      setAnimatedMoney("[data-budgets-spent]", activeSummary.spent);
      setAnimatedMoney("[data-budgets-committed]", activeSummary.committed);
      app.querySelector("[data-budgets-month-label]").textContent = formatMonthYear(state.budgetMonth);
      const monthPicker = app.querySelector("#budgetMonthPicker");
      if (monthPicker) monthPicker.value = state.budgetMonth;
      const inactiveToggle = app.querySelector("[data-show-inactive-budgets]");
      if (inactiveToggle) inactiveToggle.checked = state.showInactiveBudgets;
      renderBudgetAlerts(activeSummary.items);
      renderBudgetReport(activeSummary);
      list.innerHTML = "";
      if (!visibleSummary.items.length) {
        list.append(emptyState({
          icon: "gauge",
          title: state.showInactiveBudgets ? "Nenhum orçamento neste mês." : "Nenhum orçamento ativo neste mês.",
          description: "Crie um limite por categoria para acompanhar seus gastos.",
          actionLabel: "Criar orçamento",
          action: openBudgetComposer,
        }));
        return;
      }
      visibleSummary.items.forEach((item) => list.append(budgetCard(item)));
      renderIcons();
    } catch (error) {
      list.innerHTML = "";
      list.append(emptyState({
        icon: "triangle-alert",
        title: "Não foi possível calcular os orçamentos.",
        description: "Revise os filtros e tente novamente.",
      }));
      renderBudgetAlerts([], "Os orçamentos não puderam ser carregados com segurança.");
    }
  }

  function budgetCard(item) {
    const card = document.createElement("article");
    const inactive = item.budget.active === false;
    const progress = Math.max(0, Math.min(item.committedPercent, 100));
    const remainingLabel = item.remainingCommitted < 0 ? "Excedente" : "Restante";
    const remainingValue = item.remainingCommitted < 0 ? item.exceededBy : item.remainingCommitted;
    card.className = `panel budget-card budget-status-${item.status}${inactive ? " is-inactive" : ""}`;
    card.dataset.budgetId = item.budget.id;
    card.innerHTML = `
      <header class="budget-card-header">
        <span class="budget-category-icon" aria-hidden="true">${escapeHtml(item.category?.icon || "•")}</span>
        <div><h3>${escapeHtml(item.category?.name || "Categoria removida")}</h3><span>${formatMonthYear(item.budget.month)}${inactive ? " · Inativo" : ""}</span></div>
        <span class="budget-status-pill">${escapeHtml(item.statusLabel)}</span>
      </header>
      <div class="budget-card-limit"><span>Limite mensal</span><strong>${money(item.limit)}</strong></div>
      <div class="budget-progress-head"><span>${Math.round(item.committedPercent)}% comprometido</span><span>Alerta em ${item.budget.alertThreshold}%</span></div>
      <div class="budget-progress" role="progressbar" aria-label="Progresso de ${escapeHtml(item.category?.name || "categoria")}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(progress)}"><i style="width:${progress}%"></i></div>
      <div class="budget-card-values">
        <span><small>Gasto</small><strong>${money(item.spent)}</strong></span>
        <span><small>Comprometido</small><strong>${money(item.committed)}</strong></span>
        <span class="${item.remainingCommitted < 0 ? "is-exceeded" : ""}"><small>${remainingLabel}</small><strong>${money(remainingValue)}</strong></span>
      </div>
      <footer class="budget-card-actions">
        <button class="ghost-action compact" data-edit-budget="${item.budget.id}" type="button"><i data-lucide="pencil" aria-hidden="true"></i><span>Editar</span></button>
        <details class="budget-action-menu">
          <summary class="icon-button" aria-label="Ações do orçamento"><i data-lucide="ellipsis" aria-hidden="true"></i></summary>
          <div>
            <button data-toggle-budget="${item.budget.id}" type="button">${inactive ? "Reativar" : "Desativar"}</button>
            <button data-copy-budget="${item.budget.id}" type="button">Copiar para próximo mês</button>
            <button class="is-danger" data-delete-budget="${item.budget.id}" type="button">Excluir</button>
          </div>
        </details>
      </footer>
    `;
    return card;
  }

  function renderBudgetAlerts(items, errorMessage = "") {
    const box = app.querySelector("[data-budget-alerts]");
    if (!box) return;
    box.innerHTML = "";
    if (errorMessage) {
      box.innerHTML = `<article class="budget-alert budget-alert-error"><i data-lucide="triangle-alert" aria-hidden="true"></i><span>${escapeHtml(errorMessage)}</span></article>`;
      renderIcons();
      return;
    }
    items.filter((item) => item.status !== "healthy").forEach((item) => {
      const alert = document.createElement("article");
      alert.className = `budget-alert budget-alert-${item.status}`;
      alert.innerHTML = `<i data-lucide="${item.status === "exceeded" ? "badge-alert" : "gauge"}" aria-hidden="true"></i><span><strong>${escapeHtml(item.category?.name || "Categoria")}: ${escapeHtml(item.statusLabel)}</strong><small>${item.status === "exceeded" ? `Excedente de ${money(item.exceededBy)}.` : `${Math.round(item.committedPercent)}% do limite já está comprometido.`}</small></span>`;
      box.append(alert);
    });
    renderIcons();
  }

  function renderBudgetReport(summary) {
    const body = app.querySelector("[data-budget-report]");
    if (!body) return;
    const report = core.reports.monthlyBudgetReport(currentProfile(), state.budgetMonth, { accountId: state.budgetAccount });
    body.innerHTML = "";
    if (!report.ok || !report.rows.length) {
      body.innerHTML = '<tr><td colspan="7">Nenhum orçamento ativo para este relatório.</td></tr>';
      return;
    }
    report.rows.forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${escapeHtml(row.category)}</td><td>${money(row.limit)}</td><td>${money(row.spent)}</td><td>${money(row.committed)}</td><td class="${row.remaining < 0 ? "amount-expense" : ""}">${money(row.remaining)}</td><td>${Math.round(row.percent)}%</td><td>${escapeHtml(row.status)}</td>`;
      body.append(tr);
    });
  }

  function renderDashboardBudgets() {
    const profile = currentProfile();
    const box = app.querySelector("[data-dashboard-budget-list]");
    if (!profile || !box) return;
    const result = core.budgets.dashboard(profile, toMonthInput(new Date()));
    box.innerHTML = "";
    if (!result.ok || !result.items.length) {
      box.append(emptyState({
        icon: "gauge",
        title: "Nenhum orçamento para este mês.",
        description: "Planeje uma categoria para acompanhar seu limite.",
        actionLabel: "Criar orçamento",
        action: () => {
          setView("budgets");
          openBudgetComposer();
        },
      }));
      return;
    }
    result.items.forEach((item) => {
      const progress = Math.max(0, Math.min(item.committedPercent, 100));
      const row = document.createElement("article");
      row.className = `dashboard-budget-item budget-status-${item.status}`;
      row.innerHTML = `
        <span class="budget-category-icon" aria-hidden="true">${escapeHtml(item.category?.icon || "•")}</span>
        <div><strong>${escapeHtml(item.category?.name || "Categoria")}</strong><small>${money(item.limit)} · ${item.statusLabel}</small><div class="budget-progress"><i style="width:${progress}%"></i></div></div>
        <span><strong>${Math.round(item.committedPercent)}%</strong><small>${item.remainingCommitted < 0 ? `+${money(item.exceededBy)}` : money(item.remainingCommitted)}</small></span>
      `;
      box.append(row);
    });
  }

  function learnPersonalizationAfterSavedTransaction(transaction, profile) {
    const engine = assistantPersonalizationEngine(profile);
    if (!engine || !core.personalization?.learnAfterConfirmation) return;
    core.personalization.learnAfterConfirmation(engine, transaction, profile, {
      confirmed: true,
      saved: true,
      paymentMethod: pendingAssistantPersonalization?.paymentMethod || null,
      confirmedAt: transaction.updatedAt,
    });
  }

  function bindTransactionForm() {
    app.querySelectorAll('input[name="type"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        populateStatusSelects();
        updateTransactionStatusField();
      });
    });
    app.querySelector("#transactionDate").value = toDateInput(new Date());
    app.querySelector("#transactionDate").addEventListener("change", updateTransactionStatusField);
    app.querySelector("#transactionStatus").addEventListener("change", updateTransactionStatusField);
    app.querySelector("#transactionInstallmentsEnabled").addEventListener("change", updateInstallmentControls);
    app.querySelector("[data-reset-transaction-form]").addEventListener("click", resetTransactionForm);
    app.querySelector("#transactionForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const profile = currentProfile();
      const type = app.querySelector('input[name="type"]:checked').value;
      const id = app.querySelector("#transactionId").value;
      const existing = profile.transactions.find((item) => item.id === id) || {};
      const transaction = {
        ...existing,
        id: id || uid("trx"),
        type,
        description: app.querySelector("#transactionDescription").value.trim(),
        amount: Number(app.querySelector("#transactionAmount").value),
        date: app.querySelector("#transactionDate").value,
        categoryId: app.querySelector("#transactionCategory").value,
        accountId: app.querySelector("#transactionAccount").value,
        status: app.querySelector("#transactionStatus").value,
        createdAt: id
          ? existing.createdAt || new Date().toISOString()
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (existing.installmentGroupId) {
        transaction.installmentGroupId = existing.installmentGroupId;
        transaction.installmentNumber = existing.installmentNumber;
        transaction.installmentTotal = existing.installmentTotal;
      }

      if (!transaction.description || !transaction.amount || !transaction.date || !transaction.categoryId || !transaction.accountId) {
        showToast("Preencha todos os dados da transação.");
        return;
      }
      applyAutomaticOverdueStatus(transaction);

      const index = profile.transactions.findIndex((item) => item.id === id);
      if (index >= 0) {
        profile.transactions[index] = transaction;
        showToast("Transação atualizada.");
      } else if (installmentsEnabled()) {
        const count = installmentCount();
        profile.transactions.push(...core.transactions.createInstallments(transaction, count, { uid }));
        showToast(`${count} parcelas lançadas.`);
      } else {
        profile.transactions.push(transaction);
        showToast("Transação salva.");
      }
      saveStore();
      learnPersonalizationAfterSavedTransaction(transaction, profile);
      resetTransactionForm();
      closeMobileTransactionComposer();
      refreshAll();
    });
    updateInstallmentControls();
  }

  function updateTransactionStatusField() {
    const date = app.querySelector("#transactionDate")?.value;
    const status = app.querySelector("#transactionStatus");
    if (installmentsEnabled()) return;
    if (!date || !status || status.value !== "Pendente") return;
    if (isPendingOverdue(date)) {
      status.value = "Atrasado";
      showToast("Status alterado automaticamente para Atrasado.");
    }
  }

  function applyAutomaticOverdueStatus(transaction) {
    return core.transactions.applyAutomaticOverdueStatus(transaction);
  }

  function isPendingOverdue(date) {
    return core.transactions.isPendingOverdue(date);
  }

  function installmentsEnabled() {
    return app.querySelector("#transactionInstallmentsEnabled")?.checked && installmentCount() > 1;
  }

  function installmentCount() {
    return Math.max(2, Math.min(120, Number(app.querySelector("#transactionInstallmentCount")?.value || 2)));
  }

  function updateInstallmentControls() {
    const enabled = app.querySelector("#transactionInstallmentsEnabled")?.checked || false;
    app.querySelector(".installment-box")?.classList.toggle("is-enabled", enabled);
  }

  function addMonthsToDate(value, months) {
    return core.utils.addMonthsToDate(value, months);
  }

  function bindCategoryForm() {
    renderCategoryIconPicker();
    app.querySelector("#categoryForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const profile = currentProfile();
      const id = app.querySelector("#categoryId").value;
      const name = app.querySelector("#categoryName").value.trim();
      const icon = app.querySelector("#categoryIcon").value.trim() || name.charAt(0).toUpperCase();
      if (!name) {
        showToast("Digite o nome da categoria.");
        return;
      }
      if (profile.categories.some((category) => category.id !== id && category.name.toLowerCase() === name.toLowerCase())) {
        showToast("Essa categoria já existe.");
        return;
      }
      const existing = profile.categories.find((category) => category.id === id);
      if (existing) {
        existing.name = name;
        existing.icon = icon;
      } else {
        profile.categories.push({ id: uid("cat"), name, icon });
      }
      resetCategoryForm();
      saveStore();
      showToast(existing ? "Categoria atualizada." : "Categoria criada.");
      refreshAll();
    });
    app.querySelector("[data-reset-category-form]").addEventListener("click", resetCategoryForm);
  }

  function bindMobileTransactionSurfaces() {
    if (typeof mobileSurfaceCleanup === "function") mobileSurfaceCleanup();
    const openCategoryButton = app.querySelector("[data-open-category-manager]");
    const closeTransactionButtons = app.querySelectorAll("[data-close-transaction-composer]");
    const closeCategoryButtons = app.querySelectorAll("[data-close-category-manager]");
    const handleKeydown = (event) => {
      if (event.key !== "Escape") return;
      if (document.body.classList.contains("has-category-manager")) {
        closeCategoryManager();
        openCategoryButton?.focus();
        return;
      }
      if (document.body.classList.contains("has-mobile-transaction-composer")) {
        closeMobileTransactionComposer();
        app.querySelector("[data-quick-transaction]")?.focus();
      }
    };
    const handleResize = () => {
      if (!isCompactTransactionLayout()) closeMobileTransactionComposer();
    };

    openCategoryButton?.addEventListener("click", openCategoryManager);
    closeTransactionButtons.forEach((button) => button.addEventListener("click", closeMobileTransactionComposer));
    closeCategoryButtons.forEach((button) => button.addEventListener("click", closeCategoryManager));
    document.addEventListener("keydown", handleKeydown);
    window.addEventListener("resize", handleResize);
    mobileSurfaceCleanup = () => {
      openCategoryButton?.removeEventListener("click", openCategoryManager);
      closeTransactionButtons.forEach((button) => button.removeEventListener("click", closeMobileTransactionComposer));
      closeCategoryButtons.forEach((button) => button.removeEventListener("click", closeCategoryManager));
      document.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("resize", handleResize);
    };
  }

  function isCompactTransactionLayout() {
    return window.matchMedia("(max-width: 900px)").matches;
  }

  function openMobileTransactionComposer() {
    if (!isCompactTransactionLayout()) return;
    closeCategoryManager();
    const panel = app.querySelector(".transaction-composer-panel");
    const backdrop = app.querySelector(".transaction-composer-backdrop");
    panel?.classList.add("is-mobile-open");
    panel?.setAttribute("role", "dialog");
    panel?.setAttribute("aria-modal", "true");
    panel?.setAttribute("aria-label", "Nova transação");
    if (backdrop) backdrop.hidden = false;
    mobileComposerScrollY = window.scrollY;
    document.body.classList.add("has-mobile-transaction-composer");
    syncFloatingActionButton();
  }

  function closeMobileTransactionComposer() {
    const wasOpen = document.body.classList.contains("has-mobile-transaction-composer");
    const panel = app.querySelector(".transaction-composer-panel");
    panel?.classList.remove("is-mobile-open");
    panel?.removeAttribute("role");
    panel?.removeAttribute("aria-modal");
    panel?.removeAttribute("aria-label");
    const backdrop = app.querySelector(".transaction-composer-backdrop");
    if (backdrop) backdrop.hidden = true;
    document.body.classList.remove("has-mobile-transaction-composer");
    syncFloatingActionButton();
    if (wasOpen && isCompactTransactionLayout()) window.scrollTo(0, mobileComposerScrollY);
  }

  function openCategoryManager() {
    closeMobileTransactionComposer();
    const panel = app.querySelector(".categories-panel");
    const backdrop = app.querySelector(".category-manager-backdrop");
    if (!panel) return;
    panel.hidden = false;
    if (backdrop) backdrop.hidden = false;
    document.body.classList.add("has-category-manager");
    syncFloatingActionButton();
    panel.querySelector("[data-close-category-manager]")?.focus();
  }

  function closeCategoryManager() {
    const panel = app.querySelector(".categories-panel");
    const backdrop = app.querySelector(".category-manager-backdrop");
    if (panel) panel.hidden = true;
    if (backdrop) backdrop.hidden = true;
    document.body.classList.remove("has-category-manager");
    syncFloatingActionButton();
  }

  function setButtonText(selector, text) {
    const button = app.querySelector(selector);
    const label = button?.querySelector("span:last-child");
    if (label) {
      label.textContent = text;
    } else if (button) {
      button.textContent = text;
    }
  }

  function resetCategoryForm() {
    const form = app.querySelector("#categoryForm");
    if (!form) return;
    form.reset();
    app.querySelector("#categoryId").value = "";
    app.querySelector("#categoryIcon").value = categoryIconOptions[0];
    setButtonText("[data-save-category]", "Adicionar");
    state.editingCategoryId = "";
    syncCategoryIconPicker();
  }

  function openCategoryComposer() {
    setView("transactions");
    resetCategoryForm();
    openCategoryManager();
    app.querySelector("#categoryName")?.focus();
  }

  function renderCategoryIconPicker() {
    const box = app.querySelector("[data-category-icon-picker]");
    const input = app.querySelector("#categoryIcon");
    if (!box || !input) return;
    input.value = input.value || categoryIconOptions[0];
    box.innerHTML = "";
    categoryIconOptions.forEach((icon) => {
      const button = document.createElement("button");
      button.className = `icon-choice ${input.value === icon ? "is-active" : ""}`;
      button.type = "button";
      button.textContent = icon;
      button.title = `Usar ${icon}`;
      button.addEventListener("click", () => {
        input.value = icon;
        box.querySelectorAll(".icon-choice").forEach((item) => item.classList.toggle("is-active", item === button));
      });
      box.append(button);
    });
    input.addEventListener("input", () => {
      syncCategoryIconPicker();
    });
  }

  function syncCategoryIconPicker() {
    const box = app.querySelector("[data-category-icon-picker]");
    const input = app.querySelector("#categoryIcon");
    if (!box || !input) return;
    box.querySelectorAll(".icon-choice").forEach((item) => item.classList.toggle("is-active", item.textContent === input.value));
  }

  function bindFilters() {
    const map = {
      filterDescription: "description",
      filterCategory: "category",
      filterDateFrom: "dateFrom",
      filterDateTo: "dateTo",
      filterValueMin: "valueMin",
      filterValueMax: "valueMax",
      filterStatus: "status",
      filterAccount: "account",
      sortTransactions: "sort",
    };
    Object.entries(map).forEach(([id, key]) => {
      const input = app.querySelector(`#${id}`);
      input.value = state.filters[key];
      input.addEventListener("input", () => {
        state.filters[key] = input.value;
        state.transactionPage = 1;
        renderTransactionsTable();
      });
      input.addEventListener("change", () => {
        state.filters[key] = input.value;
        state.transactionPage = 1;
        renderTransactionsTable();
      });
    });
    app.querySelector("[data-clear-transaction-filters]")?.addEventListener("click", () => {
      state.filters = {
        description: "",
        category: "all",
        dateFrom: "",
        dateTo: "",
        valueMin: "",
        valueMax: "",
        status: "all",
        account: "all",
        sort: "date-desc",
      };
      state.transactionPage = 1;
      state.selectedTransactionIds.clear();
      syncFilterInputs();
      renderTransactionsTable();
      showToast("Filtros limpos.");
    });

    const month = app.querySelector("#cashflowMonth");
    month.value = state.cashflowMonth;
    month.addEventListener("change", () => {
      state.cashflowMonth = month.value || toMonthInput(new Date());
      state.cashflowRange = "custom";
      syncCashflowRangeButtons();
      drawCashflowCharts();
    });
    const cashflowAccount = app.querySelector("#cashflowAccount");
    cashflowAccount?.addEventListener("change", () => {
      state.cashflowAccount = cashflowAccount.value || "all";
      drawCashflowCharts();
    });
    const exportAccount = app.querySelector("#exportAccount");
    exportAccount?.addEventListener("change", () => {
      state.exportAccount = exportAccount.value || "all";
    });
    app.querySelectorAll("[data-cashflow-range]").forEach((button) => {
      button.addEventListener("click", () => {
        const range = button.dataset.cashflowRange || "month";
        state.cashflowRange = range;
        if (range === "custom") {
          const input = app.querySelector("#cashflowMonth");
          if (input) {
            input.focus();
            input.showPicker?.();
          }
          syncCashflowRangeButtons();
          drawCashflowCharts();
          return;
        }
        if (range === "next-month") state.cashflowMonth = shiftMonthValue(toMonthInput(new Date()), 1);
        if (range === "today" || range === "7" || range === "15" || range === "30" || range === "month") {
          state.cashflowMonth = toMonthInput(new Date());
        }
        const input = app.querySelector("#cashflowMonth");
        if (input) input.value = state.cashflowMonth;
        syncCashflowRangeButtons();
        drawCashflowCharts();
      });
    });
  }

  function bindGoalForm() {
    const form = app.querySelector("#goalForm");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const profile = currentProfile();
      const id = app.querySelector("#goalId").value;
      const target = Number(app.querySelector("#goalTarget").value);
      const initial = Number(app.querySelector("#goalInitial").value);
      const goal = {
        id: id || uid("goal"),
        name: app.querySelector("#goalName").value.trim(),
        target,
        saved: initial,
        deadline: app.querySelector("#goalDeadline").value,
        theme: app.querySelector("#goalTheme").value,
        reminders: [],
        history: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (!goal.name || !target || !goal.deadline) {
        showToast("Preencha os dados da meta.");
        return;
      }

      const existingIndex = profile.goals.findIndex((item) => item.id === id);
      if (existingIndex >= 0) {
        const previous = profile.goals[existingIndex];
        goal.createdAt = previous.createdAt;
        goal.history = normalizeGoalHistory(previous, profile);
        goal.reminders = previous.reminders || [];
        goal.updatedAt = new Date().toISOString();
        if (previous.saved !== initial) {
          const delta = Number((initial - previous.saved).toFixed(2));
          goal.history.push(createGoalMovement({
            tipo: delta >= 0 ? "entrada" : "retirada",
            valor: Math.abs(delta),
            goal,
            profile,
            destino: delta >= 0 ? "Meta" : "Ajuste manual",
            justificativa: delta < 0 ? "Ajuste manual do saldo da meta" : "",
            observacao: "Ajuste manual",
          }));
        }
        ensureGoalShape(goal, profile);
        profile.goals[existingIndex] = goal;
        showToast("Objetivo atualizado.");
      } else {
        if (initial > 0) {
          goal.history.push(createGoalMovement({
            tipo: "entrada",
            valor: initial,
            goal,
            profile,
            destino: "Meta",
            observacao: "Saldo inicial",
          }));
        }
        ensureGoalShape(goal, profile);
        profile.goals.push(goal);
        showToast("Objetivo criado.");
      }
      saveStore();
      resetGoalForm();
      closeGoalComposer();
      refreshAll();
    });

    app.querySelectorAll("[data-open-goal-composer]").forEach((button) => {
      button.addEventListener("click", openGoalComposer);
    });
    app.querySelectorAll("[data-close-goal-composer]").forEach((button) => {
      button.addEventListener("click", closeGoalComposer);
    });
    app.querySelector("[data-goal-composer]")?.addEventListener("click", (event) => {
      if (event.target === event.currentTarget) closeGoalComposer();
    });

    const search = app.querySelector("[data-goal-search]");
    if (search) {
      search.value = state.goalFilters.query;
      search.addEventListener("input", () => {
        state.goalFilters.query = search.value.trim();
        renderGoals();
      });
    }

    app.querySelectorAll("[data-goal-filter]").forEach((button) => {
      const isActive = button.dataset.goalFilter === state.goalFilters.status;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
      button.addEventListener("click", () => {
        state.goalFilters.status = button.dataset.goalFilter || "all";
        renderGoals();
      });
    });

    const sort = app.querySelector("[data-goal-sort]");
    if (sort) {
      sort.value = state.goalFilters.sort;
      sort.addEventListener("change", () => {
        state.goalFilters.sort = sort.value;
        renderGoals();
      });
    }
  }

  function bindProfileForm() {
    app.querySelector("#profileForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const user = currentUser();
      const id = app.querySelector("#profileId").value;
      const name = app.querySelector("#profileName").value.trim();
      if (!name) {
        showToast("Digite o nome do perfil.");
        return;
      }
      if (id) {
        const profile = user.profiles.find((item) => item.id === id);
        if (profile) profile.name = name;
        showToast("Perfil atualizado.");
      } else {
        const profile = createProfile(name);
        user.profiles.push(profile);
        user.activeProfileId = profile.id;
        showToast("Perfil criado.");
      }
      app.querySelector("#profileForm").reset();
      app.querySelector("#profileId").value = "";
      app.querySelector("[data-save-profile]").textContent = "Criar perfil";
      saveStore();
      closeProfileComposer();
      renderDashboard();
      setView("profiles");
    });

    app.querySelectorAll("[data-open-profile-composer]").forEach((button) => {
      button.addEventListener("click", () => openProfileComposer());
    });
    app.querySelectorAll("[data-close-profile-composer]").forEach((button) => {
      button.addEventListener("click", closeProfileComposer);
    });
    app.querySelector("[data-profile-composer]")?.addEventListener("click", (event) => {
      if (event.target === event.currentTarget) closeProfileComposer();
    });
    app.querySelector("[data-reset-profile-form]")?.addEventListener("click", () => {
      openProfileComposer();
    });

    app.querySelector("[data-profile-import]")?.addEventListener("click", () => app.querySelector("#importDataInput")?.click());
    app.querySelector("[data-profile-export-all]")?.addEventListener("click", exportCurrentUserData);

    const search = app.querySelector("[data-profile-search]");
    if (search) {
      search.value = state.profileFilters.query;
      search.addEventListener("input", () => {
        state.profileFilters.query = search.value.trim();
        renderProfiles();
      });
    }

    const sort = app.querySelector("[data-profile-sort]");
    if (sort) {
      sort.value = state.profileFilters.sort;
      sort.addEventListener("change", () => {
        state.profileFilters.sort = sort.value;
        renderProfiles();
      });
    }
  }

  function resetProfileForm() {
    const form = app.querySelector("#profileForm");
    if (!form) return;
    form.reset();
    app.querySelector("#profileId").value = "";
    app.querySelector("[data-save-profile]").textContent = "Criar perfil";
    const title = app.querySelector("[data-profile-composer-title]");
    if (title) title.textContent = "Novo perfil";
  }

  function openProfileComposer(options = {}) {
    setView("profiles");
    if (!options.editing) resetProfileForm();
    const modal = app.querySelector("[data-profile-composer]");
    if (!modal) return;
    modal.hidden = false;
    modal.classList.add("is-open");
    document.body.classList.add("has-modal-open");
    setTimeout(() => app.querySelector("#profileName")?.focus(), 40);
  }

  function closeProfileComposer() {
    const modal = app.querySelector("[data-profile-composer]");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.hidden = true;
    document.body.classList.remove("has-modal-open");
  }

  function renderAssistantPersonalizationSettings() {
    const engine = assistantPersonalizationEngine();
    const snapshot = engine?.snapshot();
    const toggle = app.querySelector("[data-assistant-personalization-toggle]");
    const count = app.querySelector("[data-assistant-personalization-count]");
    if (toggle) toggle.checked = snapshot?.enabled !== false;
    if (count) {
      const total = snapshot?.records?.length || 0;
      count.textContent = total
        ? `${total} ${total === 1 ? "confirmação local analisada" : "confirmações locais analisadas"}.`
        : "Nenhuma preferência aprendida neste perfil.";
    }
  }

  function openAssistantPersonalizationClearModal() {
    const modal = app.querySelector("[data-assistant-personalization-modal]");
    if (!modal) return;
    personalizationModalReturnFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add("has-ai-assistant-modal");
    syncFloatingActionButton();
    requestAnimationFrame(() => modal.querySelector("[data-confirm-clear-assistant-personalization]")?.focus());
  }

  function closeAssistantPersonalizationClearModal(options = {}) {
    const modal = app.querySelector("[data-assistant-personalization-modal]");
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove("has-ai-assistant-modal");
    syncFloatingActionButton();
    if (options.restoreFocus !== false) personalizationModalReturnFocus?.focus?.();
    personalizationModalReturnFocus = null;
  }

  function clearAssistantPersonalization() {
    const engine = assistantPersonalizationEngine();
    const cleared = engine?.clear() === true;
    closeAssistantPersonalizationClearModal({ restoreFocus: false });
    renderAssistantPersonalizationSettings();
    app.querySelector("[data-clear-assistant-personalization]")?.focus();
    showToast(cleared
      ? "Preferências aprendidas removidas deste perfil. Suas transações foram preservadas."
      : "Não foi possível limpar as preferências neste aparelho.");
  }

  function bindSettingsForm() {
    app.querySelector("#settingsForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const user = currentUser();
      const profile = currentProfile();
      profile.name = app.querySelector("#settingsProfileName").value.trim() || profile.name;
      user.name = app.querySelector("#settingsUserName").value.trim() || user.name;
      user.theme = app.querySelector("#settingsTheme").value;
      user.currency = app.querySelector("#settingsCurrency").value;
      user.language = supportedLanguage(app.querySelector("#settingsLanguage")?.value);
      user.primaryColor = app.querySelector("#settingsPrimaryColor")?.value || user.primaryColor;
      app.querySelectorAll("[data-setting-toggle]").forEach((toggle) => {
        user.settings[toggle.dataset.settingToggle] = toggle.checked;
      });
      const notificationPreferences = {};
      app.querySelectorAll("[data-notification-preference]").forEach((toggle) => {
        notificationPreferences[toggle.dataset.notificationPreference] = toggle.checked;
      });
      notificationPreferences.dueSoonDays = Number(app.querySelector("#notificationDueSoonDays")?.value);
      core.notifications.setPreferences(profile, notificationPreferences);
      const personalizationEngine = assistantPersonalizationEngine(profile);
      const personalizationToggle = app.querySelector("[data-assistant-personalization-toggle]");
      const personalizationSaved = !personalizationEngine
        || personalizationEngine.setEnabled(personalizationToggle?.checked !== false);
      writeStorage(LANGUAGE_KEY, user.language);
      applyLanguage(user.language);
      saveStore();
      showToast(personalizationSaved ? "Configurações salvas." : "Configurações salvas, exceto a preferência local do Assistente.");
      renderDashboard();
      setView("settings");
    });

    const personalizationModal = app.querySelector("[data-assistant-personalization-modal]");
    app.querySelector("[data-clear-assistant-personalization]")?.addEventListener("click", openAssistantPersonalizationClearModal);
    app.querySelectorAll("[data-cancel-clear-assistant-personalization]").forEach((button) => {
      button.addEventListener("click", () => closeAssistantPersonalizationClearModal());
    });
    app.querySelector("[data-confirm-clear-assistant-personalization]")?.addEventListener("click", clearAssistantPersonalization);
    personalizationModal?.addEventListener("click", (event) => {
      if (event.target === personalizationModal) closeAssistantPersonalizationClearModal();
    });
    personalizationModal?.addEventListener("keydown", (event) => {
      trapAssistantModalFocus(event, personalizationModal, closeAssistantPersonalizationClearModal);
    });

    app.querySelector("[data-export-data]").addEventListener("click", exportCurrentUserData);

    app.querySelectorAll("[data-theme-choice]").forEach((button) => {
      button.addEventListener("click", () => {
        const theme = button.dataset.themeChoice;
        app.querySelector("#settingsTheme").value = theme;
        applyTheme(theme);
        applyPrimaryColor(app.querySelector("#settingsPrimaryColor")?.value);
        syncSettingsThemePreview(theme);
      });
    });

    const primaryColorInput = app.querySelector("#settingsPrimaryColor");
    const previewPrimaryColor = (event) => applyPrimaryColor(event.currentTarget.value);
    primaryColorInput?.addEventListener("input", previewPrimaryColor);
    primaryColorInput?.addEventListener("change", previewPrimaryColor);

    app.querySelector("#settingsLanguage")?.addEventListener("change", (event) => {
      applyLanguage(supportedLanguage(event.currentTarget.value));
    });

    app.querySelector("#settingsAvatar")?.addEventListener("change", (event) => {
      const file = event.currentTarget.files?.[0];
      if (!file) return;
      if (file.size > 1024 * 1024) {
        showToast("Escolha uma imagem de até 1 MB.");
        event.currentTarget.value = "";
        return;
      }
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const user = currentUser();
        if (!user) return;
        user.avatar = String(reader.result || "");
        saveStore();
        renderSettings();
        showToast("Avatar atualizado.");
      });
      reader.readAsDataURL(file);
    });

    app.querySelector("#importDataInput").addEventListener("change", handleImport);

    app.querySelector("[data-clear-profile-data]").addEventListener("click", () => {
      const profile = currentProfile();
      if (!confirm(`Limpar todos os dados do perfil "${profile.name}"?`)) return;
      profile.transactions = [];
      profile.goals = [];
      profile.imports = [];
      profile.budgets = [];
      profile.notificationState = core.notifications.createState({
        preferences: profile.notificationState?.preferences,
      });
      saveStore();
      showToast("Dados do perfil limpos.");
      refreshAll();
    });
  }

  function exportCurrentUserData() {
    const user = currentUser();
    if (!user) return;
    const box = app.querySelector("[data-export-box]");
    const exportUser = buildExportUser(user);
    if (state.exportAccount !== "all") {
      const profile = exportUser.profiles.find((item) => item.id === exportUser.activeProfileId);
      if (profile?.accounts.some((account) => account.id === state.exportAccount)) {
        core.reports.filterExportProfileByAccount(profile, state.exportAccount);
      }
    }
    const payload = JSON.stringify(core.storage.sanitizeSensitiveData(exportUser), null, 2);
    if (box) box.textContent = payload;
    const blob = new Blob([payload], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `nexio-${normalizeEmail(user.email)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    showToast("Dados exportados.");
  }

  function buildExportUser(user) {
    return core.reports.buildExportUser(user, {
      ensureUserShape,
      ensureProfileShape,
      ensureGoalShape,
      goalHistoryStats,
      goalHistoryEntries,
    });
  }

  async function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const extension = fileExtension(file.name);
      if (extension === "json" || file.type === "application/json") {
        await importUserData(file);
        return;
      }
      const result = await importTransactionsFile(file, extension);
      if (!result.imported) {
        showToast("Não encontrei transações válidas nesse arquivo.");
        return;
      }
      saveStore();
      refreshAll();
      app.querySelector("[data-export-box]").textContent = result.preview;
      showToast(`Importei ${result.imported} transações.`);
    } catch (error) {
      showToast(error.message || "Não foi possível importar o arquivo.");
    } finally {
      event.target.value = "";
    }
  }

  async function importUserData(file) {
    const imported = core.storage.sanitizeSensitiveData(JSON.parse(await file.text()));
    if (!imported.email || !Array.isArray(imported.profiles)) {
      throw new Error("Arquivo de dados inválido.");
    }
    if (isLocalOnlyUser()) {
      imported.email = LOCAL_USER_EMAIL;
      imported.localOnly = true;
    } else {
      imported.email = cloud.enabled && state.sessionEmail ? state.sessionEmail : normalizeEmail(imported.email);
    }
    const existingIndex = state.store.users.findIndex((user) => normalizeEmail(user.email || "") === imported.email);
    ensureUserShape(imported);
    if (existingIndex >= 0) {
      mergeImportedUser(state.store.users[existingIndex], imported);
    } else {
      state.store.users.push(imported);
    }
    state.sessionEmail = imported.email;
    core.storage.setSession(localStorage, SESSION_KEY, imported.email);
    saveStore();
    showToast("Dados JSON mesclados.");
    render();
  }

  function mergeImportedUser(target, imported) {
    return core.profiles.mergeImportedUser(target, imported, {
      ensureUserShape,
      ensureProfileShape,
      normalizeText,
    });
  }

  function mergeUniqueBy(targetList, incomingList, keyFn) {
    return core.utils.mergeUniqueBy(targetList, incomingList, keyFn);
  }

  async function importTransactionsFile(file, extension) {
    let importedItems = [];
    if (extension === "csv" || file.type.includes("csv") || file.type === "text/plain") {
      importedItems = transactionsFromTableRows(parseDelimitedRows(await file.text()));
    } else if (extension === "xlsx") {
      importedItems = transactionsFromTableRows(await parseXlsxRows(file));
    } else if (extension === "xls") {
      throw new Error("Excel antigo .xls não é suportado. Salve como .xlsx e importe novamente.");
    } else if (extension === "pdf" || file.type === "application/pdf") {
      importedItems = transactionsFromPdfLines(await extractPdfLines(file));
    } else {
      throw new Error("Formato não suportado. Use CSV, XLSX, PDF ou JSON.");
    }
    return addImportedTransactions(importedItems, file.name);
  }

  function addImportedTransactions(items, sourceName) {
    const profile = currentProfile();
    const batchId = uid("import");
    const importedAt = new Date().toISOString();
    let imported = 0;
    let categoriesCreated = 0;
    const transactionIds = [];
    const previewRows = [];
    const addOneTransaction = (item, category, override = {}) => {
      const categoryName = item.category || "Importado";
      const type = item.type === "expense" ? "expense" : "income";
      const transaction = {
        id: uid("trx"),
        type,
        description: override.description || item.description,
        amount: Math.abs(Number(item.amount)),
        date: override.date || item.date,
        categoryId: category.id,
        accountId: core.accounts.resolveAccountId(profile),
        status: normalizeImportedStatus(item.status, type),
        installmentGroupId: override.installmentGroupId || item.installmentGroupId,
        installmentNumber: override.installmentNumber || item.installmentNumber,
        installmentTotal: override.installmentTotal || item.installmentTotal,
        importBatchId: batchId,
        importSourceName: sourceName,
        importedAt,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (!transaction.installmentGroupId) {
        delete transaction.installmentGroupId;
        delete transaction.installmentNumber;
        delete transaction.installmentTotal;
      }
      applyAutomaticOverdueStatus(transaction);
      profile.transactions.push(transaction);
      transactionIds.push(transaction.id);
      previewRows.push(`${formatDate(transaction.date)} | ${transaction.type === "income" ? "Receita" : "Despesa"} | ${transaction.description} | ${money(transaction.amount)}`);
      imported += 1;
    };

    items.forEach((item) => {
      if (!item.description || !item.amount || !item.date) return;
      const categoryName = item.category || "Importado";
      let category = profile.categories.find((candidate) => normalizeText(candidate.name) === normalizeText(categoryName));
      if (!category) {
        category = {
          id: uid("cat"),
          name: categoryName,
          icon: categoryIconByName[categoryName] || "🧾",
        };
        profile.categories.push(category);
        categoriesCreated += 1;
      }
      const installmentTotal = Number(item.installmentTotal || 0);
      const installmentNumber = Number(item.installmentNumber || 0);
      if (installmentTotal > 1 && !installmentNumber) {
        const groupId = uid("parcelas");
        for (let number = 1; number <= installmentTotal; number += 1) {
          addOneTransaction(item, category, {
            date: addMonthsToDate(item.date, number - 1),
            description: `${item.description} (${number}/${installmentTotal})`,
            installmentGroupId: groupId,
            installmentNumber: number,
            installmentTotal,
          });
        }
      } else {
        addOneTransaction(item, category, installmentTotal > 1 ? {
          installmentGroupId: uid("parcelas"),
          installmentNumber: installmentNumber || 1,
          installmentTotal,
        } : {});
      }
    });
    if (imported) {
      profile.imports.push({
        id: batchId,
        sourceName,
        importedAt,
        imported,
        categoriesCreated,
        transactionIds,
      });
    }
    return {
      imported,
      categoriesCreated,
      preview: [
        `Arquivo: ${sourceName}`,
        `Importação salva: ${formatDate(toDateInput(new Date(importedAt)))}`,
        `Transações importadas: ${imported}`,
        `Categorias criadas: ${categoriesCreated}`,
        "",
        ...previewRows.slice(0, 20),
      ].join("\n"),
    };
  }

  function parseDelimitedRows(text) {
    return core.reports.parseDelimitedRows(text);
  }

  function detectDelimiter(text) {
    return core.reports.detectDelimiter(text);
  }

  function transactionsFromTableRows(rows) {
    return core.reports.transactionsFromTableRows(rows);
  }

  function findHeaderRow(rows) {
    return core.reports.findHeaderRow(rows);
  }

  function transactionFromRow(row, headers) {
    return core.reports.transactionFromRow(row, headers);
  }

  function canonicalHeader(value) {
    return core.reports.canonicalHeader(value);
  }

  async function parseXlsxRows(file) {
    const entries = await unzipXlsxEntries(await file.arrayBuffer());
    const workbook = parseXml(entries["xl/workbook.xml"]);
    const rels = parseXml(entries["xl/_rels/workbook.xml.rels"]);
    const sharedStrings = entries["xl/sharedStrings.xml"] ? parseSharedStrings(entries["xl/sharedStrings.xml"]) : [];
    const sheet = localElements(workbook, "sheet")[0];
    if (!sheet) return [];
    const relationId = sheet.getAttribute("r:id") || sheet.getAttribute("id");
    const relation = localElements(rels, "Relationship").find((item) => item.getAttribute("Id") === relationId);
    const target = relation ? relation.getAttribute("Target") : "worksheets/sheet1.xml";
    const sheetPath = `xl/${target.replace(/^\/?xl\//, "")}`;
    const sheetXml = parseXml(entries[sheetPath] || entries["xl/worksheets/sheet1.xml"]);
    return parseSheetRows(sheetXml, sharedStrings);
  }

  async function unzipXlsxEntries(arrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer);
    const view = new DataView(arrayBuffer);
    const decoder = new TextDecoder();
    const eocdOffset = findZipEnd(view);
    const totalEntries = view.getUint16(eocdOffset + 10, true);
    let directoryOffset = view.getUint32(eocdOffset + 16, true);
    const entries = {};
    for (let index = 0; index < totalEntries; index += 1) {
      if (view.getUint32(directoryOffset, true) !== 0x02014b50) break;
      const method = view.getUint16(directoryOffset + 10, true);
      const compressedSize = view.getUint32(directoryOffset + 20, true);
      const nameLength = view.getUint16(directoryOffset + 28, true);
      const extraLength = view.getUint16(directoryOffset + 30, true);
      const commentLength = view.getUint16(directoryOffset + 32, true);
      const localOffset = view.getUint32(directoryOffset + 42, true);
      const name = decoder.decode(bytes.slice(directoryOffset + 46, directoryOffset + 46 + nameLength));
      const localNameLength = view.getUint16(localOffset + 26, true);
      const localExtraLength = view.getUint16(localOffset + 28, true);
      const dataStart = localOffset + 30 + localNameLength + localExtraLength;
      const compressed = bytes.slice(dataStart, dataStart + compressedSize);
      entries[name] = decoder.decode(method === 0 ? compressed : await inflateZipBytes(compressed));
      directoryOffset += 46 + nameLength + extraLength + commentLength;
    }
    return entries;
  }

  function findZipEnd(view) {
    for (let offset = view.byteLength - 22; offset >= Math.max(0, view.byteLength - 66000); offset -= 1) {
      if (view.getUint32(offset, true) === 0x06054b50) return offset;
    }
    throw new Error("Não consegui ler esse arquivo Excel.");
  }

  async function inflateZipBytes(bytes) {
    if (!("DecompressionStream" in window)) {
      throw new Error("Este navegador não suporta importação de Excel compactado.");
    }
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  function parseXml(text) {
    if (!text) throw new Error("Arquivo incompleto.");
    return new DOMParser().parseFromString(text, "application/xml");
  }

  function localElements(root, name) {
    return Array.from(root.getElementsByTagName("*")).filter((element) => element.localName === name);
  }

  function parseSharedStrings(text) {
    return localElements(parseXml(text), "si").map((item) => item.textContent || "");
  }

  function parseSheetRows(sheetXml, sharedStrings) {
    return localElements(sheetXml, "row").map((row) => {
      const values = [];
      localElements(row, "c").forEach((cell, cellIndex) => {
        const ref = cell.getAttribute("r");
        const index = ref ? columnIndex(ref.replace(/\d+/g, "")) : cellIndex;
        const type = cell.getAttribute("t");
        const rawValue = localElements(cell, "v")[0]?.textContent || localElements(cell, "t")[0]?.textContent || "";
        values[index] = type === "s" ? sharedStrings[Number(rawValue)] || "" : rawValue;
      });
      return values.map((value) => value || "");
    }).filter((row) => row.some(Boolean));
  }

  function columnIndex(letters) {
    return letters.split("").reduce((total, letter) => total * 26 + letter.toUpperCase().charCodeAt(0) - 64, 0) - 1;
  }

  async function extractPdfLines(file) {
    const pdfjsLib = await import("../../assets/pdf.min.mjs");
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("assets/pdf.worker.min.mjs", window.location.href).href;
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()), disableWorker: true }).promise;
    const lines = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      lines.push(...linesFromPdfItems(content.items));
    }
    return lines;
  }

  function linesFromPdfItems(items) {
    const positioned = items
      .filter((item) => item.str && item.str.trim())
      .map((item) => ({ text: item.str.trim(), x: item.transform[4], y: item.transform[5] }))
      .sort((a, b) => Math.abs(b.y - a.y) > 3 ? b.y - a.y : a.x - b.x);
    const lines = [];
    positioned.forEach((item) => {
      const line = lines.find((candidate) => Math.abs(candidate.y - item.y) <= 3);
      if (line) line.parts.push(item);
      else lines.push({ y: item.y, parts: [item] });
    });
    return lines.map((line) => line.parts.sort((a, b) => a.x - b.x).map((part) => part.text).join(" ").trim());
  }

  function transactionsFromPdfLines(lines) {
    return lines.map(transactionFromPdfLine).filter(Boolean);
  }

  function transactionFromPdfLine(line) {
    const dateMatch = line.match(/(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}|\d{4}-\d{1,2}-\d{1,2})/);
    if (!dateMatch) return null;
    const date = parseImportedDate(dateMatch[1]);
    if (!date) return null;
    const withoutDate = line.replace(dateMatch[0], " ");
    const moneyMatches = withoutDate.match(/(?:R\$\s*)?\(?-?\d{1,3}(?:[.\s]\d{3})*(?:,\d{2})?\)?|\(?-?\d+(?:[.,]\d{2})\)?/g) || [];
    if (!moneyMatches.length) return null;
    const amountText = moneyMatches[moneyMatches.length - 1];
    const amount = parseImportedNumber(amountText);
    if (!amount) return null;
    const description = cleanImportedText(withoutDate.replace(amountText, " ").replace(/\s{2,}/g, " "));
    return {
      type: inferTransactionType(line, "", amount),
      description: description || "Transação importada do PDF",
      amount: Math.abs(amount),
      date,
      category: "Importado PDF",
      status: "",
    };
  }

  function parseImportedDate(value) {
    return core.reports.parseImportedDate(value);
  }

  function parseImportedNumber(value) {
    return core.reports.parseImportedNumber(value);
  }

  function parseInteger(value) {
    return core.utils.parseInteger(value);
  }

  function inferTransactionType(typeText, statusText, amount) {
    return core.reports.inferTransactionType(typeText, statusText, amount);
  }

  function normalizeImportedStatus(status, type) {
    return core.transactions.normalizeImportedStatus(status, type);
  }

  function fileExtension(name) {
    return core.utils.fileExtension(name);
  }

  function cleanImportedText(value) {
    return core.utils.cleanImportedText(value);
  }

  function normalizeText(value) {
    return core.utils.normalizeText(value);
  }

  function populateCategorySelects() {
    const profile = currentProfile();
    const transactionSelect = app.querySelector("#transactionCategory");
    const filterSelect = app.querySelector("#filterCategory");
    transactionSelect.innerHTML = "";
    filterSelect.innerHTML = '<option value="all">Todas</option><option value="uncategorized">Sem categoria</option>';
    profile.categories.forEach((category) => {
      const label = `${category.icon} ${category.name}`;
      transactionSelect.append(new Option(label, category.id));
      filterSelect.append(new Option(label, category.id));
    });
    filterSelect.value = state.filters.category;
  }

  function populateStatusSelects() {
    const type = app.querySelector('input[name="type"]:checked')?.value || "income";
    const statusSelect = app.querySelector("#transactionStatus");
    const currentValue = statusSelect.value;
    statusSelect.innerHTML = "";
    const statuses = type === "income" ? incomeStatuses : expenseStatuses;
    statuses.forEach((status) => statusSelect.append(new Option(status, status)));
    statusSelect.value = statuses.includes(currentValue) ? currentValue : statuses[0];

    const filter = app.querySelector("#filterStatus");
    if (filter && !filter.options.length) {
      filter.append(new Option("Todos", "all"));
      filter.append(new Option("Pendências", "open"));
      [...new Set([...incomeStatuses, ...expenseStatuses])].forEach((status) => {
        filter.append(new Option(status, status));
      });
      filter.value = state.filters.status;
    }
  }

  function updateOverview() {
    const profile = currentProfile();
    const currentMonth = currentCalendarMonth();
    const monthTransactions = profile.transactions.filter((item) => isInCalendarMonth(item.date, currentMonth));
    const reportableMonthTransactions = monthTransactions.filter((transaction) => !core.accounts.isTransfer(transaction));
    const settledMonthTransactions = reportableMonthTransactions.filter(isSettledTransaction);
    const pendingMonthTransactions = reportableMonthTransactions.filter(isOpenTransaction);
    const monthIncome = sum(settledMonthTransactions.filter((item) => item.type === "income"), "amount");
    const monthExpense = sum(settledMonthTransactions.filter((item) => item.type === "expense"), "amount");
    const pendingIncome = sum(pendingMonthTransactions.filter((item) => item.type === "income"), "amount");
    const pendingExpense = sum(pendingMonthTransactions.filter((item) => item.type === "expense"), "amount");
    const pendingImpact = pendingIncome - pendingExpense;
    const balance = core.accounts.consolidatedBalance(profile);
    const goalsActive = profile.goals.filter((goal) => goal.saved < goal.target);
    const hasAchievedGoal = profile.goals.some((goal) => Number(goal.target || 0) > 0 && Number(goal.saved || 0) >= Number(goal.target || 0));
    const goalsSaved = sum(profile.goals, "saved");
    const goalsTarget = sum(profile.goals, "target");
    const goalProgress = goalsTarget ? Math.round((goalsSaved / goalsTarget) * 100) : 0;
    const projectedBalance = balance + pendingImpact;
    const monthSavings = monthIncome - monthExpense;
    const previousMonthDate = parseLocalDate(`${currentMonth.value}-01`);
    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
    const previousMonthValue = toMonthInput(previousMonthDate);
    const previousSavings = monthlyTotal(profile.transactions, previousMonthValue, "income") -
      monthlyTotal(profile.transactions, previousMonthValue, "expense");
    const savingsDelta = monthSavings - previousSavings;
    const mainGoal = goalsActive
      .filter((goal) => Number(goal.target || 0) > 0)
      .sort((a, b) => (b.saved / b.target) - (a.saved / a.target) || a.deadline.localeCompare(b.deadline))[0] || null;

    setAnimatedMoney("[data-balance-total]", balance);
    setAnimatedMoney("[data-month-income]", monthIncome);
    setAnimatedMoney("[data-month-expense]", monthExpense);
    setAnimatedNumber("[data-active-goals]", goalsActive.length);
    app.querySelector("[data-income-count]").textContent = plural(settledMonthTransactions.filter((item) => item.type === "income").length, "lançamento", "lançamentos");
    app.querySelector("[data-expense-count]").textContent = plural(settledMonthTransactions.filter((item) => item.type === "expense").length, "lançamento", "lançamentos");
    app.querySelector("[data-goals-progress]").textContent = `${Math.min(goalProgress, 100)}% guardado`;
    app.querySelector("[data-balance-trend]").textContent = balance >= 0 ? "Saldo positivo no período." : "Saldo pede atenção.";
    app.querySelector("[data-pending-month-label]").textContent = `Resumo de pendências - ${formatMonthYear(currentMonth.value)}`;
    setAnimatedMoney("[data-pending-income]", pendingIncome);
    setAnimatedMoney("[data-pending-expense]", pendingExpense);
    setAnimatedMoney("[data-pending-impact]", pendingImpact);
    setAnimatedMoney("[data-projected-balance]", projectedBalance);
    setAnimatedMoney("[data-overview-projected-balance]", projectedBalance);
    app.querySelector("[data-projected-balance-trend]").textContent = pendingImpact
      ? `${pendingImpact > 0 ? "↑" : "↓"} ${money(Math.abs(pendingImpact))} em pendências`
      : "Sem impacto pendente no mês";
    setAnimatedMoney("[data-month-savings]", monthSavings);
    app.querySelector("[data-month-savings-trend]").textContent = previousSavings
      ? `${savingsDelta >= 0 ? "↑" : "↓"} ${money(Math.abs(savingsDelta))} vs. mês anterior`
      : "Sem base suficiente no mês anterior";
    setAnimatedNumber("[data-main-goal-progress]", mainGoal
      ? Math.min(Math.round((mainGoal.saved / mainGoal.target) * 100), 100)
      : 0, "%");
    app.querySelector("[data-main-goal-label]").textContent = mainGoal
      ? `${mainGoal.name} · faltam ${money(Math.max(mainGoal.target - mainGoal.saved, 0))}`
      : "Crie uma meta para acompanhar progresso";
    app.querySelector("[data-goal-achieved-indicator]")?.toggleAttribute("hidden", !hasAchievedGoal);
    setAmountTone(app.querySelector("[data-overview-projected-balance]"), projectedBalance);
    setAmountTone(app.querySelector("[data-month-savings]"), monthSavings);
    refreshNotificationSurfaces();
    updatePendingTone(app.querySelector("[data-pending-impact-card]"), app.querySelector("[data-pending-impact-icon]"), pendingImpact);
    updatePendingTone(app.querySelector("[data-projected-balance-card]"), app.querySelector("[data-projected-balance-icon]"), projectedBalance);

    setAnimatedMoney("[data-cash-income]", monthIncome);
    setAnimatedMoney("[data-cash-expense]", monthExpense);
    setAnimatedMoney("[data-cash-result]", monthIncome - monthExpense);
  }

  function renderRecentTransactions() {
    const profile = currentProfile();
    const box = app.querySelector("[data-recent-transactions]");
    const currentMonth = currentCalendarMonth();
    const transactions = [...profile.transactions]
      .filter((transaction) => isInCalendarMonth(transaction.date, currentMonth))
      .filter(isSettledTransaction)
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
      .slice(0, 6);
    box.innerHTML = "";
    if (!transactions.length) {
      box.append(emptyState({
        icon: "wallet-cards",
        title: "Nenhuma movimentação registrada.",
        description: "Cadastre sua primeira receita ou despesa para começar seu controle financeiro.",
        actionLabel: "Nova Transação",
        action: openTransactionComposer,
        compact: true,
      }));
      return;
    }
    transactions.forEach((transaction) => {
      const category = findCategory(transaction.categoryId);
      const item = document.createElement("article");
      item.className = "list-item";
      item.innerHTML = `
        <div class="list-main">
          <span class="category-dot">${escapeHtml(category.icon)}</span>
          ${transactionBankLogoHtml(transaction)}
          <div>
            <div class="list-title">${escapeHtml(transaction.description)}</div>
            <div class="list-meta">${escapeHtml(category.name)} · ${escapeHtml(transactionAccountName(transaction))} · ${friendlyTransactionDate(transaction.date)}</div>
          </div>
        </div>
        <strong class="${transaction.type === "income" ? "amount-income" : "amount-expense"}">${transaction.type === "income" ? "+" : "-"}${money(transaction.amount)}</strong>
      `;
      item.tabIndex = 0;
      item.setAttribute("role", "button");
      item.setAttribute("aria-label", `Ver detalhes de ${transaction.description}`);
      item.addEventListener("click", () => openTransactionDetail(transaction.id));
      item.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") openTransactionDetail(transaction.id);
      });
      box.append(item);
    });
  }

  function renderTransactionsTable() {
    const tbody = app.querySelector("[data-transactions-table]");
    const table = tbody?.closest("table");
    const cardGrid = app.querySelector("[data-transactions-cards]");
    if (!tbody || !cardGrid) return;

    const profileTransactionIds = new Set(currentProfile().transactions.map((transaction) => transaction.id));
    state.selectedTransactionIds.forEach((id) => {
      if (!profileTransactionIds.has(id)) state.selectedTransactionIds.delete(id);
    });

    const rows = getFilteredTransactions();
    const totalPages = Math.max(1, Math.ceil(rows.length / state.transactionPageSize));
    state.transactionPage = Math.min(Math.max(1, state.transactionPage), totalPages);
    const pageRows = getVisibleTransactionPageRows(rows);

    tbody.innerHTML = "";
    cardGrid.innerHTML = "";
    table?.classList.toggle("is-empty", !rows.length);
    updateTransactionSummaryCards(rows);

    if (!rows.length) {
      cardGrid.append(emptyState({
        icon: "receipt-text",
        title: "Nenhuma movimentação registrada.",
        description: "Cadastre sua primeira receita ou despesa para começar seu controle financeiro.",
        actionLabel: "Nova Transação",
        action: openTransactionComposer,
        compact: true,
      }));
      updateTransactionSelectionControls([]);
      updateSortButtons();
      updateTransactionPagination(rows, []);
      renderIcons();
      return;
    }

    pageRows.forEach((transaction, index) => {
      cardGrid.append(transactionCard(transaction, index));
      tbody.append(transactionTableRow(transaction));
    });

    bindTransactionActionControls(app.querySelector(".transaction-list-panel"));
    updateTransactionSelectionControls(pageRows);
    updateTransactionPagination(rows, pageRows);
    updateSortButtons();
    renderIcons();
  }

  function transactionTableRow(transaction) {
    const category = findCategory(transaction.categoryId);
    const checked = state.selectedTransactionIds.has(transaction.id) ? " checked" : "";
    const row = document.createElement("tr");
    row.className = `transaction-row transaction-row-${transaction.type}`;
    row.innerHTML = `
      <td class="select-column" data-label="Selecionar"><input data-select-transaction="${transaction.id}" type="checkbox" aria-label="Selecionar ${escapeHtml(transaction.description)}"${checked} /></td>
      <td data-label="Descrição">
        <strong class="transaction-title">${escapeHtml(transaction.description)}</strong>
        <div class="list-meta">${transactionSubtitle(transaction)}</div>
      </td>
      <td data-label="Categoria"><span class="transaction-category"><span class="category-dot">${escapeHtml(category.icon)}</span> ${escapeHtml(category.name)}</span></td>
      <td data-label="Data">${formatDate(transaction.date)}</td>
      <td data-label="Valor"><strong class="transaction-amount ${transaction.type === "income" ? "amount-income" : "amount-expense"}">${transaction.type === "income" ? "+" : "-"}${money(transaction.amount)}</strong></td>
      <td data-label="Status">${statusBadge(transaction)}</td>
      <td data-label="Ações">${transactionActionButtons(transaction)}</td>
    `;
    return row;
  }

  function transactionCard(transaction, index = 0) {
    const category = findCategory(transaction.categoryId);
    const selected = state.selectedTransactionIds.has(transaction.id);
    const card = document.createElement("article");
    card.className = `transaction-card transaction-card-${transaction.type}${selected ? " is-selected" : ""}`;
    card.style.setProperty("--item-index", index);
    card.innerHTML = `
      <header class="transaction-card-header">
        <div class="transaction-card-title-group">
          <div class="transaction-card-visuals">
            <span class="category-dot">${escapeHtml(category.icon)}</span>
            ${transactionBankLogoHtml(transaction)}
            <span class="transaction-type-badge ${transaction.type === "income" ? "is-income" : "is-expense"}">${transaction.type === "income" ? "Receita" : "Despesa"}</span>
          </div>
          <h3>${escapeHtml(transaction.description)}</h3>
          <p>${friendlyTransactionDate(transaction.date)}${transaction.installmentGroupId ? ` · ${transactionSubtitle(transaction)}` : ""}</p>
        </div>
        <label class="transaction-card-check" aria-label="Selecionar ${escapeHtml(transaction.description)}">
          <input data-select-transaction="${transaction.id}" type="checkbox"${selected ? " checked" : ""} />
        </label>
      </header>
      <div class="transaction-card-body">
        <span><small>Categoria</small><strong><span class="category-dot">${escapeHtml(category.icon)}</span>${escapeHtml(category.name)}</strong></span>
        <span><small>Conta</small><strong>${escapeHtml(transactionAccountName(transaction))}</strong></span>
        <span><small>Data</small><strong>${friendlyTransactionDate(transaction.date)}</strong></span>
        <span class="transaction-card-amount"><small>Valor</small><strong class="${transaction.type === "income" ? "amount-income" : "amount-expense"}">${transaction.type === "income" ? "+" : "-"}${money(transaction.amount)}</strong></span>
      </div>
      <footer class="transaction-card-footer">
        ${statusBadge(transaction)}
        ${transactionActionButtons(transaction)}
      </footer>
    `;
    return card;
  }

  function transactionActionButtons(transaction) {
    return `
      <div class="row-actions">
        <button class="icon-button" data-edit-transaction="${transaction.id}" type="button" aria-label="Editar transação ${escapeHtml(transaction.description)}" title="Editar"><i data-lucide="pencil" aria-hidden="true"></i></button>
        ${transaction.transferId ? "" : `<button class="icon-button" data-duplicate-transaction="${transaction.id}" type="button" aria-label="Duplicar transação ${escapeHtml(transaction.description)}" title="Duplicar"><i data-lucide="copy" aria-hidden="true"></i></button>`}
        <button class="icon-button" data-delete-transaction="${transaction.id}" type="button" aria-label="Excluir transação ${escapeHtml(transaction.description)}" title="Excluir"><i data-lucide="trash-2" aria-hidden="true"></i></button>
      </div>
    `;
  }

  function transactionSubtitle(transaction) {
    const account = transactionAccountName(transaction);
    if (transaction.transferId) return `Transferência · ${account}`;
    const kind = transaction.installmentGroupId
      ? `Parcela ${transaction.installmentNumber || 1}/${transaction.installmentTotal || 1}`
      : (transaction.type === "income" ? "Receita avulsa" : "Despesa avulsa");
    return `${kind} · ${account}`;
  }

  function transactionAccountName(transaction) {
    return core.accounts.accountById(currentProfile(), transaction.accountId)?.name || "Conta principal";
  }

  function transactionShortDate(value) {
    const date = parseLocalDate(value);
    if (Number.isNaN(date.valueOf())) return "Sem data";
    return date.toLocaleDateString(languageLocale(), { day: "2-digit", month: "short" }).replace(".", "");
  }

  function statusBadge(transaction) {
    if (transaction.transferId) return '<span class="transaction-detail-status">Transferência</span>';
    const options = statusOptionsFor(transaction.type)
      .map((status) => `
        <button class="status-option ${statusClass(status)}" data-status-option="${escapeHtml(status)}" data-status-transaction="${escapeHtml(transaction.id)}" type="button"${status === transaction.status ? " aria-current=\"true\"" : ""}>
          <span class="status-dot" aria-hidden="true"></span>${escapeHtml(status)}
        </button>
      `)
      .join("");
    return `
      <details class="status-quick-menu ${statusClass(transaction.status)}">
        <summary aria-label="Alterar status de ${escapeHtml(transaction.description)}"><span class="status-dot" aria-hidden="true"></span>${escapeHtml(transaction.status)}</summary>
        <div class="status-options" role="menu">${options}</div>
      </details>
    `;
  }

  function bindTransactionActionControls(scope) {
    if (!scope) return;
    scope.querySelectorAll("[data-edit-transaction]").forEach((button) => {
      button.addEventListener("click", () => editTransaction(button.dataset.editTransaction));
    });
    scope.querySelectorAll("[data-duplicate-transaction]").forEach((button) => {
      button.addEventListener("click", () => duplicateTransaction(button.dataset.duplicateTransaction));
    });
    scope.querySelectorAll("[data-delete-transaction]").forEach((button) => {
      button.addEventListener("click", () => deleteTransaction(button.dataset.deleteTransaction));
    });
    scope.querySelectorAll("[data-status-option]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        updateTransactionStatus(button.dataset.statusTransaction, button.dataset.statusOption);
      });
    });
    scope.querySelectorAll(".status-quick-menu").forEach((details) => {
      details.addEventListener("toggle", () => {
        if (!details.open) return;
        scope.querySelectorAll(".status-quick-menu[open]").forEach((other) => {
          if (other !== details) other.removeAttribute("open");
        });
      });
    });
    scope.querySelectorAll("[data-select-transaction]").forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          state.selectedTransactionIds.add(checkbox.dataset.selectTransaction);
        } else {
          state.selectedTransactionIds.delete(checkbox.dataset.selectTransaction);
        }
        renderTransactionsTable();
      });
    });
    scope.querySelectorAll(".transaction-card").forEach((card) => {
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `Ver detalhes de ${card.querySelector("h3")?.textContent || "transação"}`);
      const open = (event) => {
        if (event.target.closest("button, input, label, summary, details, a, select")) return;
        const id = card.querySelector("[data-select-transaction]")?.dataset.selectTransaction;
        if (id) openTransactionDetail(id);
      };
      card.addEventListener("click", open);
      card.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        open(event);
      });
    });
  }

  function friendlyTransactionDate(value) {
    const date = parseLocalDate(value);
    const today = parseLocalDate(toDateInput(new Date()));
    const difference = Math.round((today - date) / 86400000);
    if (difference === 0) return "Hoje";
    if (difference === 1) return "Ontem";
    if (difference > 1 && difference < 7) {
      const weekday = date.toLocaleDateString(languageLocale(), { weekday: "long" });
      return weekday.charAt(0).toUpperCase() + weekday.slice(1);
    }
    return formatDate(value);
  }

  function transactionBankDetails(transaction) {
    const bank = transaction.bank && typeof transaction.bank === "object" ? transaction.bank : null;
    return {
      name: bank?.name || transaction.bankName || transaction.banco || (typeof transaction.bank === "string" ? transaction.bank : ""),
      logo: bank?.logo || transaction.bankLogo || transaction.bankLogoUrl || "",
    };
  }

  function transactionObservation(transaction) {
    return transaction.observacao || transaction.observation || transaction.notes || transaction.note || "Nenhuma observação informada.";
  }

  function transactionReceipt(transaction) {
    return transaction.comprovante || transaction.receipt || transaction.receiptUrl || transaction.attachment || "";
  }

  function transactionBankLogoHtml(transaction) {
    const bank = transactionBankDetails(transaction);
    if (!bank.name && !bank.logo) return "";
    const visual = bank.logo
      ? `<img src="${escapeHtml(bank.logo)}" alt="" />`
      : `<span>${escapeHtml((bank.name || "B").slice(0, 2).toUpperCase())}</span>`;
    return `<span class="transaction-bank-logo" title="${escapeHtml(bank.name || "Instituição financeira")}">${visual}</span>`;
  }

  function openTransactionDetail(id) {
    const transaction = currentProfile().transactions.find((item) => item.id === id);
    if (!transaction) return;
    closeTransactionDetail(true);
    const category = findCategory(transaction.categoryId);
    const bank = transactionBankDetails(transaction);
    const receipt = transactionReceipt(transaction);
    const receiptIsLink = /^(https?:|data:|blob:)/i.test(receipt);
    const drawer = document.createElement("div");
    drawer.className = "transaction-detail-backdrop";
    drawer.dataset.transactionDetail = id;
    drawer.innerHTML = `
      <aside class="transaction-detail-drawer" role="dialog" aria-modal="true" aria-labelledby="transactionDetailTitle">
        <header class="transaction-detail-header">
          <div class="transaction-detail-identity">
            <span class="transaction-detail-category" aria-hidden="true">${escapeHtml(category.icon)}</span>
            ${transactionBankLogoHtml(transaction)}
            <div>
              <span>${escapeHtml(category.name)}</span>
              <h2 id="transactionDetailTitle">${escapeHtml(transaction.description)}</h2>
            </div>
          </div>
          <button class="icon-button" data-close-transaction-detail type="button" aria-label="Fechar detalhes"><i data-lucide="x" aria-hidden="true"></i></button>
        </header>
        <div class="transaction-detail-amount ${transaction.type === "income" ? "is-income" : "is-expense"}">
          <span>${transaction.type === "income" ? "Receita" : "Despesa"}</span>
          <strong>${transaction.type === "income" ? "+" : "-"}${money(transaction.amount)}</strong>
          <small>${friendlyTransactionDate(transaction.date)}</small>
        </div>
        <div class="transaction-detail-tags">
          <span class="transaction-type-badge ${transaction.type === "income" ? "is-income" : "is-expense"}">${transaction.type === "income" ? "Receita" : "Despesa"}</span>
          <span class="transaction-detail-status ${statusClass(transaction.status)}">${escapeHtml(transaction.status)}</span>
          ${transaction.installmentGroupId ? `<span class="transaction-detail-installment">Parcela ${transaction.installmentNumber || 1}/${transaction.installmentTotal || 1}</span>` : ""}
        </div>
        <div class="transaction-detail-sections">
          <section>
            <span>Observações</span>
            <p>${escapeHtml(transactionObservation(transaction))}</p>
          </section>
          <section>
            <span>Comprovante</span>
            ${receipt ? (receiptIsLink ? `<a href="${escapeHtml(receipt)}" target="_blank" rel="noopener noreferrer"><i data-lucide="paperclip" aria-hidden="true"></i>Abrir comprovante</a>` : `<p>${escapeHtml(receipt)}</p>`) : `<p>Nenhum comprovante anexado.</p>`}
          </section>
          <section class="transaction-detail-grid">
            <div><span>Categoria</span><strong>${escapeHtml(category.icon)} ${escapeHtml(category.name)}</strong></div>
            <div><span>Conta</span><strong>${escapeHtml(transactionAccountName(transaction))}</strong></div>
            <div><span>Parcelamento</span><strong>${transaction.installmentGroupId ? `${transaction.installmentNumber || 1} de ${transaction.installmentTotal || 1}` : "À vista"}</strong></div>
            <div><span>Banco</span><strong>${escapeHtml(bank.name || "Não informado")}</strong></div>
            <div><span>Data</span><strong>${friendlyTransactionDate(transaction.date)}</strong></div>
          </section>
        </div>
        <footer class="transaction-detail-actions">
          <button class="primary-action" data-detail-edit type="button"><i data-lucide="pencil" aria-hidden="true"></i><span>Editar</span></button>
          ${transaction.transferId ? "" : '<button class="ghost-action" data-detail-duplicate type="button"><i data-lucide="copy" aria-hidden="true"></i><span>Duplicar</span></button>'}
          <button class="danger-action" data-detail-delete type="button"><i data-lucide="trash-2" aria-hidden="true"></i><span>Excluir</span></button>
        </footer>
      </aside>`;
    app.append(drawer);
    document.body.classList.add("has-transaction-detail");
    requestAnimationFrame(() => drawer.classList.add("is-open"));
    drawer.addEventListener("click", (event) => {
      if (event.target === drawer || event.target.closest("[data-close-transaction-detail]")) closeTransactionDetail();
    });
    drawer.querySelector("[data-detail-edit]").addEventListener("click", () => { closeTransactionDetail(true); setView("transactions"); editTransaction(id); });
    drawer.querySelector("[data-detail-duplicate]")?.addEventListener("click", () => { closeTransactionDetail(true); duplicateTransaction(id); });
    drawer.querySelector("[data-detail-delete]").addEventListener("click", () => { closeTransactionDetail(true); deleteTransaction(id); });
    drawer.querySelector("[data-close-transaction-detail]")?.focus();
    renderIcons();
  }

  function closeTransactionDetail(immediate = false) {
    const drawer = app.querySelector("[data-transaction-detail]");
    if (!drawer) return;
    drawer.classList.remove("is-open");
    document.body.classList.remove("has-transaction-detail");
    if (immediate || prefersReducedMotion()) drawer.remove();
    else window.setTimeout(() => drawer.remove(), 280);
  }

  function updateTransactionSummaryCards(rows) {
    const summaryRows = state.filters.account === "all" ? rows.filter((transaction) => !transaction.transferId) : rows;
    const income = sum(summaryRows.filter((transaction) => transaction.type === "income"), "amount");
    const expense = sum(summaryRows.filter((transaction) => transaction.type === "expense"), "amount");
    const balance = income - expense;
    const incomeEl = app.querySelector("[data-transactions-summary-income]");
    const expenseEl = app.querySelector("[data-transactions-summary-expense]");
    const balanceEl = app.querySelector("[data-transactions-summary-balance]");
    const countEl = app.querySelector("[data-transactions-summary-count]");
    if (incomeEl) incomeEl.textContent = money(income);
    if (expenseEl) expenseEl.textContent = money(expense);
    if (balanceEl) {
      balanceEl.textContent = money(balance);
      setAmountTone(balanceEl, balance);
    }
    if (countEl) countEl.textContent = plural(rows.length, "lançamento", "lançamentos");
  }

  function bindBulkStatusControls() {
    const month = app.querySelector("#bulkStatusMonth");
    const button = app.querySelector("[data-bulk-status-apply]");
    if (!month || !button) return;
    month.value = toMonthInput(new Date());
    button.addEventListener("click", applyBulkStatusUpdate);
  }

  function bindTransactionListControls() {
    app.querySelector("[data-delete-selected-transactions]")?.addEventListener("click", deleteSelectedTransactions);
    app.querySelector("[data-delete-filtered-transactions]")?.addEventListener("click", deleteFilteredTransactions);
    app.querySelector("[data-duplicate-selected-transactions]")?.addEventListener("click", duplicateSelectedTransactions);
    app.querySelectorAll("[data-selected-status]").forEach((button) => {
      button.addEventListener("click", () => applySelectedTransactionsStatus(button.dataset.selectedStatus));
    });
    app.querySelector("[data-select-all-transactions]")?.addEventListener("change", (event) => {
      const rows = getVisibleTransactionPageRows();
      if (event.currentTarget.checked) {
        rows.forEach((transaction) => state.selectedTransactionIds.add(transaction.id));
      } else {
        rows.forEach((transaction) => state.selectedTransactionIds.delete(transaction.id));
      }
      renderTransactionsTable();
    });
    app.querySelectorAll("[data-table-sort]").forEach((button) => {
      button.addEventListener("click", () => {
        state.filters.sort = nextSortValue(button.dataset.tableSort);
        state.transactionPage = 1;
        syncFilterInputs();
        renderTransactionsTable();
      });
    });
    app.querySelector("[data-transactions-prev-page]")?.addEventListener("click", () => {
      state.transactionPage = Math.max(1, state.transactionPage - 1);
      renderTransactionsTable();
    });
    app.querySelector("[data-transactions-next-page]")?.addEventListener("click", () => {
      const totalPages = Math.max(1, Math.ceil(getFilteredTransactions().length / state.transactionPageSize));
      state.transactionPage = Math.min(totalPages, state.transactionPage + 1);
      renderTransactionsTable();
    });
    updateSortButtons();
  }

  function getVisibleTransactionPageRows(rows = getFilteredTransactions()) {
    const totalPages = Math.max(1, Math.ceil(rows.length / state.transactionPageSize));
    const page = Math.min(Math.max(1, state.transactionPage), totalPages);
    return rows.slice((page - 1) * state.transactionPageSize, page * state.transactionPageSize);
  }

  function openTransactionComposer(type = "income") {
    setView("transactions");
    resetTransactionForm();
    openMobileTransactionComposer();
    const transactionType = type === "expense" ? "expense" : "income";
    const typeInput = app.querySelector(`input[name="type"][value="${transactionType}"]`);
    if (typeInput) {
      typeInput.checked = true;
      populateStatusSelects();
      updateTransactionStatusField();
    }
    app.querySelector("#transactionDescription")?.focus();
    app.querySelector("#transactionForm")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function updateTransactionPagination(rows, pageRows) {
    const total = rows.length;
    const totalPages = Math.max(1, Math.ceil(total / state.transactionPageSize));
    const start = total ? (state.transactionPage - 1) * state.transactionPageSize + 1 : 0;
    const end = total ? start + pageRows.length - 1 : 0;
    const summary = app.querySelector("[data-transaction-results-summary]");
    const pageSummary = app.querySelector("[data-transaction-page-summary]");
    const secondaryPageSummary = app.querySelector("[data-transaction-page-summary-secondary]");
    const pageLabel = app.querySelector("[data-transactions-page-label]");
    const prev = app.querySelector("[data-transactions-prev-page]");
    const next = app.querySelector("[data-transactions-next-page]");
    const toolbar = app.querySelector(".transaction-list-toolbar");
    const tableDetails = app.querySelector(".transaction-table-details");
    const footer = app.querySelector(".transaction-table-footer");
    const pageText = total ? `Mostrando ${start}–${end} de ${plural(total, "transação", "transações")}` : "Nenhuma transação para exibir";
    if (summary) summary.textContent = plural(total, "transação encontrada", "transações encontradas");
    if (pageSummary) pageSummary.textContent = pageText;
    if (secondaryPageSummary) secondaryPageSummary.textContent = pageText;
    if (pageLabel) pageLabel.textContent = `Página ${state.transactionPage} de ${totalPages}`;
    if (prev) prev.disabled = state.transactionPage <= 1 || !total;
    if (next) next.disabled = state.transactionPage >= totalPages || !total;
    [toolbar, tableDetails, footer].forEach((element) => element?.toggleAttribute("hidden", !total));
  }

  function updateSortButtons() {
    app.querySelectorAll("[data-table-sort]").forEach((button) => {
      const sort = button.dataset.tableSort;
      const opposite = nextSortPair(sort);
      const isActive = state.filters.sort === sort || state.filters.sort === opposite;
      button.classList.toggle("is-active", isActive);
      button.dataset.sortIcon = isActive && state.filters.sort.endsWith("-asc") ? "↑" : isActive ? "↓" : "↕";
    });
  }

  function updateTransactionSelectionControls(rows = getVisibleTransactionPageRows()) {
    const visibleIds = rows.map((transaction) => transaction.id);
    const visibleSelected = visibleIds.filter((id) => state.selectedTransactionIds.has(id));
    const selectedCount = state.selectedTransactionIds.size;
    const selectAll = app.querySelector("[data-select-all-transactions]");
    if (selectAll) {
      selectAll.checked = Boolean(visibleIds.length && visibleSelected.length === visibleIds.length);
      selectAll.indeterminate = Boolean(visibleSelected.length && visibleSelected.length < visibleIds.length);
    }

    const selectionBar = app.querySelector("[data-selection-bar]");
    if (selectionBar) selectionBar.hidden = !selectedCount;
    const selectedLabel = app.querySelector("[data-selected-transactions-label]");
    if (selectedLabel) selectedLabel.textContent = plural(selectedCount, "transação selecionada", "transações selecionadas");

    const deleteButton = app.querySelector("[data-delete-selected-transactions]");
    const duplicateButton = app.querySelector("[data-duplicate-selected-transactions]");
    const statusButtons = app.querySelectorAll("[data-selected-status]");
    [deleteButton, duplicateButton, ...statusButtons].forEach((button) => {
      if (button) button.disabled = !selectedCount;
    });
  }

  function applySelectedTransactionsStatus(status) {
    const profile = currentProfile();
    const ids = new Set(state.selectedTransactionIds);
    let changed = 0;
    profile.transactions.forEach((transaction) => {
      if (!ids.has(transaction.id)) return;
      if (transaction.transferId) return;
      if (!statusOptionsFor(transaction.type).includes(status) || transaction.status === status) return;
      transaction.status = status;
      transaction.updatedAt = new Date().toISOString();
      applyAutomaticOverdueStatus(transaction);
      changed += 1;
    });
    if (!changed) {
      showToast("Nenhuma transação selecionada aceita esse status.");
      return;
    }
    saveStore();
    showToast(`${changed} ${changed === 1 ? "status atualizado" : "status atualizados"}.`);
    refreshAll();
  }

  function duplicateSelectedTransactions() {
    const profile = currentProfile();
    const ids = new Set(state.selectedTransactionIds);
    const selected = profile.transactions.filter((transaction) => ids.has(transaction.id));
    if (!selected.length) return;
    const duplicable = selected.filter((transaction) => !transaction.transferId);
    if (!duplicable.length) return showToast("Transferências devem ser criadas pela ação Transferir.");
    duplicable.forEach((transaction) => profile.transactions.push(createTransactionDuplicate(transaction)));
    state.selectedTransactionIds.clear();
    saveStore();
    showToast(`${duplicable.length} ${duplicable.length === 1 ? "transação duplicada" : "transações duplicadas"}.`);
    refreshAll();
  }

  function deleteSelectedTransactions() {
    const profile = currentProfile();
    const ids = expandTransferTransactionIds(profile, state.selectedTransactionIds);
    const count = ids.size;
    if (!count) return;
    if (!confirm(`Excluir ${count} ${count === 1 ? "transação selecionada" : "transações selecionadas"}?`)) return;
    profile.transactions = profile.transactions.filter((transaction) => !ids.has(transaction.id));
    state.selectedTransactionIds.clear();
    saveStore();
    showToast(`${count} ${count === 1 ? "transação excluída" : "transações excluídas"}.`);
    refreshAll();
  }

  function deleteFilteredTransactions() {
    const profile = currentProfile();
    const rows = getFilteredTransactions();
    if (!rows.length) {
      showToast("Nenhuma transação filtrada para excluir.");
      return;
    }
    const ids = expandTransferTransactionIds(profile, new Set(rows.map((transaction) => transaction.id)));
    const count = ids.size;
    const filterLabel = describeActiveTransactionFilters();
    if (!confirm(`Excluir ${count} ${count === 1 ? "transação filtrada" : "transações filtradas"}?\n\nFiltro: ${filterLabel}`)) return;
    profile.transactions = profile.transactions.filter((transaction) => !ids.has(transaction.id));
    rows.forEach((transaction) => state.selectedTransactionIds.delete(transaction.id));
    saveStore();
    showToast(`${count} ${count === 1 ? "transação excluída" : "transações excluídas"}.`);
    refreshAll();
  }

  function describeActiveTransactionFilters() {
    const filters = state.filters;
    const parts = [];
    if (filters.description) parts.push(`busca contém "${filters.description}"`);
    if (filters.category !== "all") parts.push(`categoria ${filters.category === "uncategorized" ? "Sem categoria" : findCategory(filters.category).name}`);
    if (filters.dateFrom || filters.dateTo) parts.push(`data ${filters.dateFrom || "início"} até ${filters.dateTo || "fim"}`);
    if (filters.valueMin) parts.push(`valor mín. ${money(filters.valueMin)}`);
    if (filters.valueMax) parts.push(`valor máx. ${money(filters.valueMax)}`);
    if (filters.status !== "all") parts.push(`status ${filters.status === "open" ? "Pendências" : filters.status}`);
    if (filters.account !== "all") parts.push(`conta ${core.accounts.accountById(currentProfile(), filters.account)?.name || "selecionada"}`);
    return parts.length ? parts.join(", ") : "todas as transações visíveis";
  }

  function expandTransferTransactionIds(profile, sourceIds) {
    const ids = new Set(sourceIds);
    const transferIds = new Set(profile.transactions.filter((transaction) => ids.has(transaction.id) && transaction.transferId).map((transaction) => transaction.transferId));
    profile.transactions.forEach((transaction) => {
      if (transferIds.has(transaction.transferId)) ids.add(transaction.id);
    });
    return ids;
  }

  function nextSortValue(sort) {
    return state.filters.sort === sort ? nextSortPair(sort) : sort;
  }

  function nextSortPair(sort) {
    const opposite = {
      "date-desc": "date-asc",
      "date-asc": "date-desc",
      "amount-desc": "amount-asc",
      "amount-asc": "amount-desc",
      "description-asc": "description-desc",
      "description-desc": "description-asc",
      "category-asc": "category-desc",
      "category-desc": "category-asc",
      "status-asc": "status-desc",
      "status-desc": "status-asc",
    };
    return opposite[sort] || sort;
  }
  function updateTransactionStatus(id, status) {
    const transaction = currentProfile().transactions.find((item) => item.id === id);
    if (!transaction || transaction.transferId || transaction.status === status) return;
    transaction.status = status;
    transaction.updatedAt = new Date().toISOString();
    applyAutomaticOverdueStatus(transaction);
    saveStore();
    showToast("Status atualizado.");
    refreshAll();
  }

  function applyBulkStatusUpdate() {
    const profile = currentProfile();
    const month = app.querySelector("#bulkStatusMonth").value || toMonthInput(new Date());
    const currentStatus = app.querySelector("#bulkStatusFrom").value;
    const target = app.querySelector("#bulkStatusTo").value;
    let changed = 0;

    profile.transactions.forEach((transaction) => {
      if (transaction.transferId) return;
      if (toMonthInput(parseLocalDate(transaction.date)) !== month) return;
      if (transaction.status !== currentStatus) return;
      const nextStatus = target === "settled" ? settledStatusFor(transaction.type) : target;
      if (!statusOptionsFor(transaction.type).includes(nextStatus) || transaction.status === nextStatus) return;
      transaction.status = nextStatus;
      transaction.updatedAt = new Date().toISOString();
      applyAutomaticOverdueStatus(transaction);
      changed += 1;
    });

    if (!changed) {
      showToast("Nenhuma transação encontrada para esse mês e status.");
      return;
    }
    saveStore();
    showToast(`${changed} ${changed === 1 ? "status atualizado" : "status atualizados"}.`);
    refreshAll();
  }

  function showCurrentMonthPendencies() {
    const month = currentCalendarMonth();
    state.filters = {
      ...state.filters,
      description: "",
      category: "all",
      dateFrom: month.start,
      dateTo: month.end,
      valueMin: "",
      valueMax: "",
      status: "open",
      sort: "date-asc",
    };
    state.transactionPage = 1;
    setView("transactions");
    syncFilterInputs();
    renderTransactionsTable();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updatePendingTone(card, icon, value) {
    if (!card) return;
    card.classList.toggle("pending-positive", value > 0);
    card.classList.toggle("pending-negative", value < 0);
    card.classList.toggle("pending-neutral", value === 0);
    if (icon) icon.textContent = value > 0 ? "↗" : value < 0 ? "↘" : "↔";
  }

  function setAmountTone(element, value) {
    if (!element) return;
    element.classList.toggle("amount-income", value > 0);
    element.classList.toggle("amount-expense", value < 0);
  }

  function updateNotificationBadge(summary) {
    const badge = app.querySelector("[data-notification-count]");
    const button = app.querySelector("[data-notification-button]");
    if (!badge || !button) return;
    const count = Math.max(0, Number(summary?.count ?? summary) || 0);
    const label = summary?.label || (count > 99 ? "99+" : String(count));
    badge.textContent = label;
    badge.toggleAttribute("hidden", count === 0);
    badge.setAttribute("aria-hidden", count > 0 ? "false" : "true");
    button.setAttribute("aria-label", count > 0
      ? `Abrir central de notificações, ${plural(count, "alerta pendente", "alertas pendentes")}`
      : "Abrir central de notificações");
    button.classList.toggle("has-alerts", count > 0);
  }

  function syncFilterInputs() {
    const map = {
      filterDescription: "description",
      filterCategory: "category",
      filterAccount: "account",
      filterDateFrom: "dateFrom",
      filterDateTo: "dateTo",
      filterValueMin: "valueMin",
      filterValueMax: "valueMax",
      filterStatus: "status",
      sortTransactions: "sort",
    };
    Object.entries(map).forEach(([id, key]) => {
      const input = app.querySelector(`#${id}`);
      if (input) input.value = state.filters[key];
    });
  }

  function getFilteredTransactions() {
    const profile = currentProfile();
    return core.transactions.filterAndSort(profile, state.filters, {
      findCategory,
      searchText: transactionSearchText,
    });
  }

  function transactionSearchText(transaction) {
    const category = findCategory(transaction.categoryId);
    return normalizeText([
      transaction.description,
      category.name,
      category.icon,
      transactionAccountName(transaction),
      transaction.status,
      transaction.type === "income" ? "receita entrada recebimento" : "despesa saida pagamento",
      transaction.amount,
      money(transaction.amount),
      formatDate(transaction.date),
      transactionSubtitle(transaction),
      transaction.installmentGroupId ? "parcela parcelamento serie" : "",
    ].join(" "));
  }

  function editTransaction(id) {
    const transaction = currentProfile().transactions.find((item) => item.id === id);
    if (!transaction) return;
    if (transaction.transferId) {
      openTransferComposer(transaction.transferId);
      return;
    }
    state.editingTransactionId = id;
    app.querySelector("#transactionId").value = transaction.id;
    app.querySelector(`input[name="type"][value="${transaction.type}"]`).checked = true;
    populateStatusSelects();
    app.querySelector("#transactionDescription").value = transaction.description;
    app.querySelector("#transactionAmount").value = transaction.amount;
    app.querySelector("#transactionDate").value = transaction.date;
    app.querySelector("#transactionCategory").value = transaction.categoryId;
    populateAccountSelects();
    app.querySelector("#transactionAccount").value = transaction.accountId;
    app.querySelector("#transactionStatus").value = transaction.status;
    app.querySelector("#transactionInstallmentsEnabled").checked = false;
    app.querySelector("#transactionInstallmentCount").value = transaction.installmentTotal || 2;
    updateInstallmentControls();
    app.querySelector("[data-transaction-form-mode]").textContent = transaction.installmentGroupId ? "Editando parcela" : "Editando lançamento";
    setButtonText("[data-save-transaction]", "Atualizar transação");
    openMobileTransactionComposer();
    if (!isCompactTransactionLayout()) window.scrollTo({ top: 0, behavior: "smooth" });
    app.querySelector("#transactionDescription")?.focus();
  }

  function duplicateTransaction(id) {
    const profile = currentProfile();
    const transaction = profile.transactions.find((item) => item.id === id);
    if (!transaction) return;
    if (transaction.transferId) {
      showToast("Transferências devem ser criadas pela ação Transferir.");
      return;
    }
    if (transaction.installmentGroupId) {
      const duplicateSeries = confirm(`"${transaction.description}" faz parte de uma série parcelada.\n\nOK: duplicar toda a série\nCancelar: duplicar somente esta transação`);
      if (duplicateSeries) {
        const series = profile.transactions
          .filter((item) => item.installmentGroupId === transaction.installmentGroupId)
          .sort((a, b) => (a.installmentNumber || 0) - (b.installmentNumber || 0) || a.date.localeCompare(b.date));
        const groupId = uid("parcelas");
        series.forEach((item) => profile.transactions.push(createTransactionDuplicate(item, {
          installmentGroupId: groupId,
          installmentNumber: item.installmentNumber,
          installmentTotal: item.installmentTotal,
        })));
        saveStore();
        showToast(`${series.length} parcelas duplicadas.`);
        refreshAll();
        return;
      }
    }
    profile.transactions.push(createTransactionDuplicate(transaction));
    saveStore();
    showToast("Transação duplicada.");
    refreshAll();
  }

  function createTransactionDuplicate(transaction, overrides = {}) {
    return core.transactions.createDuplicate(transaction, overrides, { uid });
  }

  function deleteTransaction(id) {
    const profile = currentProfile();
    const transaction = profile.transactions.find((item) => item.id === id);
    if (!transaction) return;
    if (transaction.transferId) {
      if (!confirm("Excluir os dois lados desta transferência?")) return;
      const result = core.accounts.deleteTransfer(profile, transaction.transferId);
      if (!result.ok) return showToast(result.error);
      saveStore();
      showToast("Transferência excluída por completo.");
      refreshAll();
      return;
    }
    let ids = new Set([id]);
    if (transaction.installmentGroupId) {
      const choice = prompt(`"${transaction.description}" faz parte de uma série parcelada.\n\n1 - Excluir apenas esta parcela\n2 - Excluir esta e próximas\n3 - Excluir toda a série\n\nDigite 1, 2 ou 3.`);
      if (!choice) return;
      const series = profile.transactions.filter((item) => item.installmentGroupId === transaction.installmentGroupId);
      if (choice === "1") {
        ids = new Set([id]);
      } else if (choice === "2") {
        ids = new Set(series
          .filter((item) => transaction.installmentNumber
            ? (item.installmentNumber || 0) >= transaction.installmentNumber
            : item.date >= transaction.date)
          .map((item) => item.id));
      } else if (choice === "3") {
        ids = new Set(series.map((item) => item.id));
      } else {
        showToast("Opção inválida.");
        return;
      }
    } else if (!confirm(`Excluir "${transaction.description}"?`)) {
      return;
    }
    profile.transactions = profile.transactions.filter((item) => !ids.has(item.id));
    ids.forEach((itemId) => state.selectedTransactionIds.delete(itemId));
    saveStore();
    showToast(`${ids.size} ${ids.size === 1 ? "transação excluída" : "transações excluídas"}.`);
    refreshAll();
  }

  function resetTransactionForm() {
    app.querySelector("#transactionForm").reset();
    app.querySelector("#transactionId").value = "";
    app.querySelector("#transactionDate").value = toDateInput(new Date());
    app.querySelector('input[name="type"][value="income"]').checked = true;
    app.querySelector("#transactionInstallmentsEnabled").checked = false;
    app.querySelector("#transactionInstallmentCount").value = 2;
    app.querySelector("[data-transaction-form-mode]").textContent = "Novo lançamento";
    const assistantSummary = app.querySelector("[data-ai-draft-summary]");
    if (assistantSummary) assistantSummary.hidden = true;
    const personalizationSuggestion = app.querySelector("[data-ai-personalization-suggestion]");
    if (personalizationSuggestion) {
      personalizationSuggestion.hidden = true;
      personalizationSuggestion.textContent = "";
    }
    pendingAssistantPersonalization = null;
    setButtonText("[data-save-transaction]", "Salvar transação");
    state.editingTransactionId = "";
    populateAccountSelects();
    populateStatusSelects();
    updateInstallmentControls();
  }

  function installmentLabel(transaction) {
    if (!transaction.installmentGroupId || !transaction.installmentNumber || !transaction.installmentTotal) return "";
    return ` · Parcela ${transaction.installmentNumber}/${transaction.installmentTotal}`;
  }

  function renderCategories() {
    const profile = currentProfile();
    const box = app.querySelector("[data-category-list]");
    box.innerHTML = "";
    if (!profile.categories.length) {
      box.append(emptyState({
        icon: "tags",
        title: "Nenhuma categoria.",
        description: "Clique em Nova Categoria para começar.",
        actionLabel: "Nova Categoria",
        action: openCategoryComposer,
      }));
      return;
    }
    profile.categories.forEach((category) => {
      const used = profile.transactions.some((transaction) => transaction.categoryId === category.id) ||
        profile.budgets.some((budget) => budget.categoryId === category.id);
      const item = document.createElement("article");
      item.className = `category-card${used ? " is-used" : ""}`;
      item.innerHTML = `
        <div class="category-card-main">
          <span class="category-dot">${escapeHtml(category.icon)}</span>
          <strong>${escapeHtml(category.name)}</strong>
          <small>${used ? "Em uso" : "Disponível"}</small>
        </div>
        <div class="row-actions">
          <button class="icon-button" data-edit-category="${category.id}" type="button" aria-label="Editar categoria ${escapeHtml(category.name)}" title="Editar"><i data-lucide="pencil" aria-hidden="true"></i></button>
          <button class="icon-button" data-delete-category="${category.id}" type="button" aria-label="Excluir categoria ${escapeHtml(category.name)}" title="Excluir"><i data-lucide="trash-2" aria-hidden="true"></i></button>
        </div>
      `;
      box.append(item);
    });
    box.querySelectorAll("[data-edit-category]").forEach((button) => {
      button.addEventListener("click", () => editCategory(button.dataset.editCategory));
    });
    box.querySelectorAll("[data-delete-category]").forEach((button) => {
      button.addEventListener("click", () => {
        const profile = currentProfile();
        if (profile.transactions.some((transaction) => transaction.categoryId === button.dataset.deleteCategory) ||
          profile.budgets.some((budget) => budget.categoryId === button.dataset.deleteCategory)) {
          showToast("Categorias em uso não podem ser excluídas.");
          return;
        }
        profile.categories = profile.categories.filter((category) => category.id !== button.dataset.deleteCategory);
        saveStore();
        showToast("Categoria excluída.");
        refreshAll();
      });
    });
    renderIcons();
  }

  function editCategory(id) {
    const category = currentProfile().categories.find((item) => item.id === id);
    if (!category) return;
    openCategoryManager();
    state.editingCategoryId = id;
    app.querySelector("#categoryId").value = category.id;
    app.querySelector("#categoryIcon").value = category.icon;
    app.querySelector("#categoryName").value = category.name;
    setButtonText("[data-save-category]", "Salvar");
    syncCategoryIconPicker();
    app.querySelector("#categoryName").focus();
  }

  function renderGoalsLegacy() {
    const profile = currentProfile();
    const goals = profile.goals;
    const saved = sum(goals, "saved");
    const target = sum(goals, "target");
    const active = goals.filter((goal) => goal.saved < goal.target);
    setAnimatedMoney("[data-goals-saved]", saved);
    setAnimatedNumber("[data-goals-overall]", target ? Math.min(Math.round((saved / target) * 100), 100) : 0, "%");
    setAnimatedNumber("[data-goals-active-count]", active.length);

    const goalList = app.querySelector("[data-goal-list]");
    goalList.innerHTML = "";
    if (!goals.length) {
      goalList.append(emptyState({
        icon: "target",
        title: "Nenhuma meta criada.",
        description: "Crie objetivos financeiros para acompanhar seu progresso.",
        actionLabel: "Criar Meta",
        action: openGoalComposer,
      }));
    } else {
      goals.forEach((goal) => goalList.append(goalCard(goal)));
    }
    renderInsights();
  }

  function goalCardLegacy(goal) {
    const progress = Math.min(goal.saved / goal.target, 1);
    const progressPercent = Math.round(progress * 100);
    const remaining = Math.max(goal.target - goal.saved, 0);
    const daysLeft = daysUntil(goal.deadline);
    const monthlyNeed = remaining / Math.max(daysLeft / 30, 1);
    const forecast = goalForecast(goal, remaining, daysLeft, monthlyNeed);
    const historyStats = goalHistoryStats(goal);
    const historyItems = goalHistoryPreview(goal);
    const card = document.createElement("article");
    card.className = "goal-card";
    card.dataset.theme = goal.theme;
    card.dataset.status = forecast.status;
    card.style.setProperty("--progress", `${progressPercent}%`);
    card.innerHTML = `
      <div class="goal-top">
        <div class="goal-title-lockup">
          <span class="goal-symbol" aria-hidden="true">${progress >= 1 ? "&#10003;" : "&#9678;"}</span>
          <div>
            <span class="goal-kicker">Projeto financeiro</span>
            <h3>${escapeHtml(goal.name)}</h3>
            <div class="list-meta">Prazo: ${formatDate(goal.deadline)} · ${timeLeftLabel(daysLeft)}</div>
          </div>
        </div>
        <span class="goal-status ${forecast.status}">${forecast.statusLabel}</span>
      </div>
      <div class="goal-progress-block">
        <div class="goal-progress-head">
          <span>Progresso</span>
          <strong>${progressPercent}%</strong>
        </div>
        <div class="progress-track goal-progress-track" role="progressbar" aria-label="Progresso de ${escapeHtml(goal.name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progressPercent}">
          <div class="progress-fill"><span></span></div>
        </div>
      </div>
      <p class="goal-motivation">${escapeHtml(goalMotivation(goal, progress, remaining, daysLeft, monthlyNeed))}</p>
      <div class="goal-stats">
        <div class="goal-stat"><span>Valor guardado</span><strong>${money(goal.saved)}</strong></div>
        <div class="goal-stat"><span>Valor restante</span><strong>${money(remaining)}</strong></div>
        <div class="goal-stat"><span>Dias restantes</span><strong>${goalDaysRemainingLabel(daysLeft)}</strong></div>
        <div class="goal-stat"><span>Ritmo mensal</span><strong>${money(monthlyNeed)}</strong></div>
      </div>
      <div class="goal-forecast ${forecast.status}">
        <span>Previsão</span>
        <strong>${escapeHtml(forecast.label)}</strong>
        <small>${escapeHtml(forecast.detail)}</small>
      </div>
      <div class="goal-ledger-stats" aria-label="Resumo do historico de ${escapeHtml(goal.name)}">
        <div><span>Entradas</span><strong>${money(historyStats.entradas)}</strong></div>
        <div><span>Retiradas</span><strong>${money(historyStats.retiradas)}</strong></div>
        <div><span>Transf. enviadas</span><strong>${money(historyStats.transferenciasEnviadas)}</strong></div>
        <div><span>Transf. recebidas</span><strong>${money(historyStats.transferenciasRecebidas)}</strong></div>
      </div>
      <form class="goal-contribute" data-contribute-goal="${goal.id}">
        <input type="number" min="0.01" step="0.01" placeholder="Valor" aria-label="Valor para movimentar em ${escapeHtml(goal.name)}" required />
        <div class="goal-money-buttons">
          <button class="primary-action compact" type="submit">Adicionar</button>
          <button class="ghost-action compact" data-withdraw-goal="${goal.id}" type="button">Retirar</button>
          <button class="ghost-action compact" data-transfer-goal="${goal.id}" type="button">Transferir</button>
        </div>
      </form>
      <section class="goal-history-panel" aria-label="Historico de movimentacoes de ${escapeHtml(goal.name)}">
        <div class="goal-history-heading">
          <span>Historico</span>
          <strong>${plural(historyStats.count, "movimento", "movimentos")}</strong>
        </div>
        <div class="goal-history-list">
          ${historyItems.length ? historyItems.map(goalHistoryItemHtml).join("") : emptyStateHtml({
            icon: "history",
            title: "Nenhuma movimentação registrada.",
            description: "Quando você adicionar, retirar ou transferir valores, o histórico aparecerá aqui.",
            compact: true,
          })}
        </div>
      </section>
      <div class="goal-actions">
        <button class="ghost-action" data-edit-goal="${goal.id}" type="button">Editar</button>
        <button class="ghost-action" data-remind-goal="${goal.id}" type="button">Lembrete</button>
        <button class="danger-action" data-delete-goal="${goal.id}" type="button">Excluir</button>
      </div>
    `;

    card.querySelector("[data-contribute-goal]").addEventListener("submit", (event) => {
      event.preventDefault();
      const amount = Number(event.currentTarget.querySelector("input").value);
      contributeGoal(goal.id, amount);
    });
    card.querySelector("[data-withdraw-goal]").addEventListener("click", () => {
      const amount = Number(card.querySelector("[data-contribute-goal] input").value || 0);
      openGoalMoneyModal("withdraw", goal.id, amount);
    });
    card.querySelector("[data-transfer-goal]").addEventListener("click", () => {
      const amount = Number(card.querySelector("[data-contribute-goal] input").value || 0);
      openGoalMoneyModal("transfer", goal.id, amount);
    });
    card.querySelector("[data-edit-goal]").addEventListener("click", () => editGoal(goal.id));
    card.querySelector("[data-remind-goal]").addEventListener("click", () => createReminder(goal.id));
    card.querySelector("[data-delete-goal]").addEventListener("click", () => deleteGoal(goal.id));
    return card;
  }

  function renderGoals() {
    const profile = currentProfile();
    const goals = profile.goals;
    const saved = sum(goals, "saved");
    const target = sum(goals, "target");
    const active = goals.filter((goal) => Number(goal.saved || 0) < Number(goal.target || 0));
    const progressPercent = target ? Math.min(Math.round((saved / target) * 100), 100) : 0;
    const remaining = Math.max(target - saved, 0);

    updateGoalsHero({ goals, saved, active, progressPercent, remaining });
    renderGoalsMonthlySummary(goals);
    renderGoalAchievements(goals);
    syncGoalFilterControls();

    const goalList = app.querySelector("[data-goal-list]");
    const visibleGoals = filterAndSortGoals(goals);
    goalList.innerHTML = "";
    if (!goals.length) {
      goalList.append(emptyState({
        icon: "sparkles",
        title: "Seu próximo sonho começa aqui.",
        description: "Crie objetivos financeiros e acompanhe cada avanço com histórico, previsão e conquistas.",
        actionLabel: "Criar primeira meta",
        action: openGoalComposer,
      }));
    } else if (!visibleGoals.length) {
      goalList.append(emptyState({
        icon: "search",
        title: "Nenhuma meta encontrada.",
        description: "Ajuste a pesquisa ou os filtros para visualizar seus objetivos.",
        actionLabel: "Limpar filtros",
        action: clearGoalFilters,
      }));
    } else {
      visibleGoals.forEach((goal) => goalList.append(goalCard(goal)));
    }
    renderGoalEvolutionCharts(visibleGoals);
    renderInsights();
    requestAnimationFrame(renderIcons);
  }

  function goalCard(goal) {
    const progressPercent = goalProgressPercent(goal);
    const progress = progressPercent / 100;
    const remaining = Math.max(Number(goal.target || 0) - Number(goal.saved || 0), 0);
    const daysLeft = daysUntil(goal.deadline);
    const monthlyNeed = goalMonthlyNeed(goal);
    const forecast = goalForecast(goal, remaining, daysLeft, monthlyNeed);
    const historyStats = goalHistoryStats(goal);
    const historyItems = goalHistoryPreview(goal);
    const badges = goalAchievementBadges(goal, historyItems, progressPercent);
    const statusClass = goalVisualStatus(goal, forecast);
    const card = document.createElement("article");
    card.className = "goal-card goal-smart-card";
    card.dataset.goalId = goal.id;
    card.dataset.theme = goal.theme;
    card.dataset.status = statusClass;
    card.style.setProperty("--progress", `${progressPercent}%`);
    card.innerHTML = `
      <div class="goal-top">
        <div class="goal-title-lockup">
          <span class="goal-symbol" aria-hidden="true">${escapeHtml(goalIcon(goal))}</span>
          <div>
            <span class="goal-kicker">Objetivo financeiro</span>
            <h3>${escapeHtml(goal.name)}</h3>
            <div class="list-meta">Prazo: ${formatDate(goal.deadline)} · ${timeLeftLabel(daysLeft)}</div>
          </div>
        </div>
        <span class="goal-status ${statusClass}">${goalStatusLabel(statusClass)}</span>
      </div>
      <div class="goal-progress-block">
        <div class="goal-progress-head">
          <span>Progresso</span>
          <strong>${progressPercent}%</strong>
        </div>
        <div class="progress-track goal-progress-track" role="progressbar" aria-label="Progresso de ${escapeHtml(goal.name)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progressPercent}">
          <div class="progress-fill"><span></span></div>
        </div>
      </div>
      <p class="goal-motivation">${escapeHtml(goalMotivation(goal, progress, remaining, daysLeft, monthlyNeed))}</p>
      ${statusClass === "is-complete" ? `
        <div class="goal-completion-message" role="status">
          <span class="goal-completion-check" aria-hidden="true"><i data-lucide="check"></i></span>
          <div><strong>Parabéns!</strong><span>Você alcançou 100% da meta ${escapeHtml(goal.name)}.</span></div>
        </div>` : ""}
      <div class="goal-stats">
        <div class="goal-stat"><span>Valor economizado</span><strong>${money(goal.saved)}</strong></div>
        <div class="goal-stat"><span>Valor restante</span><strong>${money(remaining)}</strong></div>
        <div class="goal-stat"><span>Tempo restante</span><strong>${goalDaysRemainingLabel(daysLeft)}</strong></div>
        <div class="goal-stat"><span>Ritmo ideal</span><strong>${money(monthlyNeed)}/mês</strong></div>
      </div>
      <div class="goal-card-intelligence">
        <div class="goal-forecast ${statusClass}">
          <span>Previsão de conclusão</span>
          <strong>${escapeHtml(forecast.label)}</strong>
          <small>${escapeHtml(forecast.detail)}</small>
        </div>
        <div class="goal-evolution-panel">
          <span>Evolução</span>
          <canvas class="goal-evolution-chart" data-goal-evolution-chart="${escapeHtml(goal.id)}" height="120" role="img" aria-label="Evolução da meta ${escapeHtml(goal.name)}"></canvas>
        </div>
      </div>
      <div class="goal-badge-list" aria-label="Conquistas da meta">
        ${badges.map((badge) => `<span class="${badge.active ? "is-active" : ""}">${escapeHtml(badge.label)}</span>`).join("")}
      </div>
      <div class="goal-ledger-stats" aria-label="Resumo do histórico de ${escapeHtml(goal.name)}">
        <div><span>Entradas</span><strong>${money(historyStats.entradas)}</strong></div>
        <div><span>Retiradas</span><strong>${money(historyStats.retiradas)}</strong></div>
        <div><span>Transf. enviadas</span><strong>${money(historyStats.transferenciasEnviadas)}</strong></div>
        <div><span>Transf. recebidas</span><strong>${money(historyStats.transferenciasRecebidas)}</strong></div>
      </div>
      <form class="goal-contribute" data-contribute-goal="${goal.id}">
        <input type="number" min="0.01" step="0.01" placeholder="Valor" aria-label="Valor para movimentar em ${escapeHtml(goal.name)}" required />
        <div class="goal-money-buttons">
          <button class="primary-action compact" type="submit">Adicionar Valor</button>
          <button class="ghost-action compact" data-withdraw-goal="${goal.id}" type="button">Retirar Valor</button>
          <button class="ghost-action compact" data-transfer-goal="${goal.id}" type="button">Transferir</button>
        </div>
      </form>
      <section class="goal-history-panel" data-goal-history="${goal.id}" tabindex="-1" aria-label="Histórico de movimentações de ${escapeHtml(goal.name)}">
        <div class="goal-history-heading">
          <span>Histórico</span>
          <strong>${plural(historyStats.count, "movimento", "movimentos")}</strong>
        </div>
        <div class="goal-history-list">
          ${historyItems.length ? historyItems.map(goalHistoryItemHtml).join("") : emptyStateHtml({
            icon: "history",
            title: "Nenhuma movimentação registrada.",
            description: "Quando você adicionar, retirar ou transferir valores, o histórico aparecerá aqui.",
            compact: true,
          })}
        </div>
      </section>
      <div class="goal-actions">
        <button class="ghost-action" data-edit-goal="${goal.id}" type="button">Editar</button>
        <button class="ghost-action" data-focus-goal-history="${goal.id}" type="button">Histórico</button>
        <button class="ghost-action" data-remind-goal="${goal.id}" type="button">Lembrete</button>
        <button class="ghost-action" data-simulate-goal="${goal.id}" type="button">Simular</button>
        <button class="danger-action" data-delete-goal="${goal.id}" type="button">Excluir</button>
      </div>
    `;

    card.querySelector("[data-contribute-goal]").addEventListener("submit", (event) => {
      event.preventDefault();
      const amount = Number(event.currentTarget.querySelector("input").value);
      contributeGoal(goal.id, amount);
    });
    card.querySelector("[data-withdraw-goal]").addEventListener("click", () => {
      const amount = Number(card.querySelector("[data-contribute-goal] input").value || 0);
      openGoalMoneyModal("withdraw", goal.id, amount);
    });
    card.querySelector("[data-transfer-goal]").addEventListener("click", () => {
      const amount = Number(card.querySelector("[data-contribute-goal] input").value || 0);
      openGoalMoneyModal("transfer", goal.id, amount);
    });
    card.querySelector("[data-edit-goal]").addEventListener("click", () => editGoal(goal.id));
    card.querySelector("[data-focus-goal-history]").addEventListener("click", () => focusGoalHistory(goal.id));
    card.querySelector("[data-remind-goal]").addEventListener("click", () => createReminder(goal.id));
    card.querySelector("[data-simulate-goal]").addEventListener("click", () => openGoalSimulationModal(goal.id));
    card.querySelector("[data-delete-goal]").addEventListener("click", () => deleteGoal(goal.id));
    return card;
  }

  function updateGoalsHero({ goals, saved, active, progressPercent, remaining }) {
    setAnimatedMoney("[data-goals-hero-saved]", saved);
    setAnimatedNumber("[data-goals-hero-percent]", progressPercent, "%");
    setAnimatedNumber("[data-goals-hero-active]", active.length);
    setAnimatedMoney("[data-goals-hero-remaining]", remaining);
    const hero = app.querySelector(".goals-hero-panel");
    const progress = app.querySelector("[data-goals-hero-progress]");
    const fill = app.querySelector("[data-goals-hero-fill]");
    const status = app.querySelector("[data-goals-hero-status]");
    const tone = !goals.length ? "empty" : progressPercent >= 75 ? "good" : progressPercent >= 35 ? "warning" : "danger";
    if (hero) {
      hero.dataset.goalsHeroTone = tone;
      hero.style.setProperty("--goals-progress", `${progressPercent}%`);
    }
    if (progress) progress.setAttribute("aria-valuenow", String(progressPercent));
    if (fill) fill.style.width = `${progressPercent}%`;
    if (status) {
      status.textContent = !goals.length
        ? "Crie sua primeira meta"
        : progressPercent >= 75
          ? "Evolução forte"
          : progressPercent >= 35
            ? "Bom caminho"
            : "Começando agora";
    }
  }

  function syncGoalFilterControls() {
    const search = app.querySelector("[data-goal-search]");
    if (search && search.value !== state.goalFilters.query) search.value = state.goalFilters.query;
    app.querySelectorAll("[data-goal-filter]").forEach((button) => {
      const isActive = button.dataset.goalFilter === state.goalFilters.status;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    const sort = app.querySelector("[data-goal-sort]");
    if (sort && sort.value !== state.goalFilters.sort) sort.value = state.goalFilters.sort;
  }

  function clearGoalFilters() {
    state.goalFilters = { query: "", status: "all", sort: "updated-desc" };
    renderGoals();
  }

  function filterAndSortGoals(goals) {
    const query = normalizeText(state.goalFilters.query || "");
    const status = state.goalFilters.status || "all";
    const filtered = goals.filter((goal) => {
      if (query && !normalizeText(goal.name).includes(query)) return false;
      const forecast = goalForecast(goal, Math.max(goal.target - goal.saved, 0), daysUntil(goal.deadline), goalMonthlyNeed(goal));
      const visualStatus = goalVisualStatus(goal, forecast);
      if (status === "all") return true;
      if (status === "active") return visualStatus !== "is-complete";
      if (status === "complete") return visualStatus === "is-complete";
      if (status === "late") return visualStatus === "is-late";
      if (status === "on-track") return visualStatus === "is-on-track";
      return true;
    });
    return filtered.sort(goalComparator(state.goalFilters.sort || "updated-desc"));
  }

  function goalComparator(sort) {
    return (a, b) => {
      const progressA = goalProgressPercent(a);
      const progressB = goalProgressPercent(b);
      if (sort === "name-asc") return a.name.localeCompare(b.name, languageLocale());
      if (sort === "deadline-asc") return String(a.deadline).localeCompare(String(b.deadline));
      if (sort === "target-desc") return Number(b.target || 0) - Number(a.target || 0);
      if (sort === "progress-desc") return progressB - progressA;
      if (sort === "progress-asc") return progressA - progressB;
      if (sort === "saved-desc") return Number(b.saved || 0) - Number(a.saved || 0);
      if (sort === "created-desc") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sort === "created-asc") return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
    };
  }

  function goalProgressPercent(goal) {
    return core.goals.progressPercent(goal);
  }

  function goalMonthlyNeed(goal) {
    return core.goals.monthlyNeed(goal, daysUntil(goal.deadline));
  }

  function goalVisualStatus(goal, forecast = null) {
    return core.goals.visualStatus(goal, daysUntil(goal.deadline), forecast);
  }

  function goalStatusLabel(status) {
    const labels = {
      "is-complete": "Concluída",
      "is-on-track": "No prazo",
      "is-risk": "Atenção",
      "is-late": "Atrasada",
    };
    return labels[status] || "Planejada";
  }

  function goalIcon(goal) {
    const name = normalizeText(goal.name || "");
    if (name.includes("viagem") || name.includes("ferias")) return "🏖";
    if (name.includes("casa") || name.includes("apart")) return "🏠";
    if (name.includes("carro") || name.includes("moto")) return "🚗";
    if (name.includes("reserva") || name.includes("emerg")) return "🛡";
    if (name.includes("estudo") || name.includes("curso")) return "🎓";
    if (Number(goal.saved || 0) >= Number(goal.target || 0)) return "🏆";
    return "🎯";
  }

  function renderGoalsMonthlySummary(goals) {
    const month = toMonthInput(new Date());
    const rows = goals.flatMap((goal) => goalHistoryEntries(goal).map((entry) => ({ goal, entry })))
      .filter(({ entry }) => toMonthInput(parseLocalDate(entry.data || entry.date)) === month);
    const saved = rows
      .filter(({ entry }) => goalMovementClass(entry.tipo) === "is-positive")
      .reduce((total, { entry }) => total + Number(entry.valor || 0), 0);
    const withdrawn = rows
      .filter(({ entry }) => goalMovementClass(entry.tipo) === "is-negative")
      .reduce((total, { entry }) => total + Number(entry.valor || 0), 0);
    const byGoal = new Map();
    rows.forEach(({ goal, entry }) => {
      const signed = goalMovementClass(entry.tipo) === "is-positive" ? Number(entry.valor || 0) : -Number(entry.valor || 0);
      byGoal.set(goal.id, { goal, value: (byGoal.get(goal.id)?.value || 0) + signed });
    });
    const ranked = [...byGoal.values()].sort((a, b) => b.value - a.value);
    setAnimatedMoney("[data-goals-month-saved]", saved);
    setAnimatedMoney("[data-goals-month-withdrawn]", withdrawn);
    setAnimatedMoney("[data-goals-month-net]", saved - withdrawn);
    const top = app.querySelector("[data-goals-month-top]");
    const low = app.querySelector("[data-goals-month-low]");
    if (top) top.textContent = ranked[0]?.goal.name || "Sem dados";
    if (low) low.textContent = ranked.length ? ranked[ranked.length - 1].goal.name : "Sem dados";
  }

  function renderGoalAchievements(goals) {
    const list = app.querySelector("[data-goal-achievements]");
    if (!list) return;
    const totalContributions = goals.reduce((count, goal) => count + goalHistoryEntries(goal).filter((entry) => normalizeGoalMovementType(entry.tipo) === "entrada").length, 0);
    const achievements = [
      { label: "Primeira meta criada", active: goals.length > 0 },
      { label: "Primeiro aporte", active: totalContributions > 0 },
      { label: "50%", active: goals.some((goal) => goalProgressPercent(goal) >= 50) },
      { label: "75%", active: goals.some((goal) => goalProgressPercent(goal) >= 75) },
      { label: "100%", active: goals.some((goal) => goalProgressPercent(goal) >= 100) },
      { label: "Meta concluída", active: goals.some((goal) => Number(goal.saved || 0) >= Number(goal.target || 0)) },
      { label: "10 aportes", active: totalContributions >= 10 },
    ];
    list.innerHTML = achievements.map((item) => `
      <span class="${item.active ? "is-active" : ""}">
        <i data-lucide="${item.active ? "badge-check" : "badge"}" aria-hidden="true"></i>
        ${escapeHtml(item.label)}
      </span>
    `).join("");
  }

  function goalAchievementBadges(goal, historyItems, progressPercent) {
    const contributions = historyItems.filter((entry) => normalizeGoalMovementType(entry.tipo) === "entrada").length;
    return [
      { label: "Primeiro aporte", active: contributions > 0 },
      { label: "50%", active: progressPercent >= 50 },
      { label: "75%", active: progressPercent >= 75 },
      { label: "100%", active: progressPercent >= 100 },
      { label: "10 aportes", active: contributions >= 10 },
    ];
  }

  function renderGoalEvolutionCharts(goals) {
    goals.forEach((goal) => {
      const canvas = app.querySelector(`[data-goal-evolution-chart="${cssEscape(goal.id)}"]`);
      if (!canvas) return;
      const series = goalEvolutionSeries(goal);
      drawLineChart(canvas.getContext("2d"), canvas, series.values, {
        labels: series.labels,
        lineColor: cssVar("--primary"),
        fillColor: colorWithAlpha(cssVar("--primary"), 0.14),
        gridColor: cssVar("--line"),
        labelColor: cssVar("--muted"),
        moneyLabels: true,
        dense: true,
        tooltipLines: (index, value) => [
          `Saldo: ${money(value)}`,
          `Data: ${series.fullLabels[index]}`,
        ],
      });
      updateChartSummary(canvas, `Evolução de ${goal.name}: saldo atual ${money(goal.saved)}.`);
    });
  }

  function goalEvolutionSeries(goal) {
    const entries = goalHistoryEntries(goal).slice().sort((a, b) => new Date(a.criado_em || a.data) - new Date(b.criado_em || b.data));
    const values = [0];
    const labels = ["Início"];
    const fullLabels = ["Início"];
    let running = 0;
    entries.forEach((entry) => {
      running += goalMovementClass(entry.tipo) === "is-positive" ? Number(entry.valor || 0) : -Number(entry.valor || 0);
      values.push(Math.max(running, 0));
      const labelDate = entry.data || toDateInput(new Date(entry.criado_em || new Date()));
      labels.push(formatDate(labelDate).slice(0, 5));
      fullLabels.push(formatDate(labelDate));
    });
    if (values.length === 1) {
      values.push(Number(goal.saved || 0));
      labels.push("Hoje");
      fullLabels.push(formatDate(toDateInput(new Date())));
    }
    return { values, labels, fullLabels };
  }

  function focusGoalHistory(goalId) {
    const panel = app.querySelector(`[data-goal-history="${cssEscape(goalId)}"]`);
    panel?.scrollIntoView({ behavior: "smooth", block: "center" });
    panel?.focus({ preventScroll: true });
  }

  function cssEscape(value) {
    return window.CSS?.escape ? window.CSS.escape(String(value)) : String(value).replace(/["\\]/g, "\\$&");
  }

  function goalForecast(goal, remaining, daysLeft, monthlyNeed) {
    if (remaining <= 0) {
      return {
        status: "is-complete",
        statusLabel: "Concluída",
        label: "Objetivo alcançado",
        detail: "A meta virou conquista. Você pode criar o próximo projeto.",
      };
    }
    if (daysLeft < 0) {
      return {
        status: "is-late",
        statusLabel: "Atenção",
        label: "Replanejar prazo",
        detail: `${money(remaining)} ainda faltam para concluir esta meta.`,
      };
    }

    const createdAt = new Date(goal.createdAt || new Date());
    const elapsedDays = Math.max((new Date() - createdAt) / 86400000, 1);
    const monthlyPace = Number(goal.saved || 0) / Math.max(elapsedDays / 30, 1);
    if (!monthlyPace) {
      return {
        status: "is-waiting",
        statusLabel: "Planejada",
        label: "Aguardando aporte",
        detail: `${money(monthlyNeed)} por mês mantém o prazo saudável.`,
      };
    }

    const forecastDays = Math.ceil((remaining / monthlyPace) * 30);
    const forecastDate = new Date();
    forecastDate.setDate(forecastDate.getDate() + forecastDays);
    const onTrack = forecastDays <= daysLeft;
    const extraPace = Math.max(monthlyNeed - monthlyPace, 0);
    return {
      status: onTrack ? "is-on-track" : "is-risk",
      statusLabel: onTrack ? "No prazo" : "Ajustar ritmo",
      label: onTrack ? "No prazo" : `Prev. ${formatDate(toDateInput(forecastDate))}`,
      detail: onTrack
        ? `${money(monthlyPace)} por mês no ritmo atual.`
        : `Reforce cerca de ${money(extraPace)} por mês para chegar no prazo.`,
    };
  }

  function goalDaysRemainingLabel(days) {
    if (days < 0) return "Vencida";
    if (days === 0) return "Hoje";
    if (days === 1) return "1 dia";
    return `${days} dias`;
  }

  function goalMotivation(goal, progress, remaining, daysLeft, monthlyNeed) {
    if (progress >= 1) return "Meta concluída. Você pode transformar esse avanço em um novo objetivo.";
    if (daysLeft < 0) return `Prazo vencido. Replaneje ${money(remaining)} em aportes menores para recuperar previsibilidade.`;
    if (daysLeft <= 30) return `Falta pouco tempo: ${money(monthlyNeed)} neste mês mantém ${goal.name} no radar.`;
    if (progress >= 0.75) return `Você está perto: ${money(remaining)} separam esta meta da linha de chegada.`;
    return `Ritmo sugerido de ${money(monthlyNeed)} por mês para chegar ao prazo com tranquilidade.`;
  }

  function timeLeftLabel(days) {
    if (days < 0) return "prazo vencido";
    if (days === 0) return "vence hoje";
    if (days === 1) return "falta 1 dia";
    return `faltam ${days} dias`;
  }

  function timeLeftShortLabel(days) {
    if (days < 0) return "Vencida";
    if (days === 0) return "Hoje";
    if (days < 31) return `${days}d`;
    return `${Math.ceil(days / 30)}m`;
  }

  function goalHistoryEntries(goal, profile = currentProfile()) {
    return core.goals.historyEntries(goal, profile, { uid, locale: languageLocale() });
  }

  function goalHistoryStats(goal, profile = currentProfile()) {
    return core.goals.historyStats(goal, profile, { uid, locale: languageLocale() });
  }

  function goalHistoryPreview(goal, profile = currentProfile()) {
    return goalHistoryEntries(goal, profile);
  }

  function goalMovementClass(tipo) {
    return core.goals.movementClass(tipo);
  }

  function goalMovementAmount(entry) {
    const value = Number(entry.valor || Math.abs(entry.amount || 0));
    return `${goalMovementClass(entry.tipo) === "is-positive" ? "+" : "-"} ${money(value)}`;
  }

  function goalMovementDestinationLabel(entry) {
    if (entry.meta_origem && entry.tipo === "transferencia_recebida") {
      const origin = currentProfile().goals.find((item) => item.id === entry.meta_origem);
      if (origin) return `Origem: ${origin.name}`;
    }
    if (entry.meta_destino) {
      const goal = currentProfile().goals.find((item) => item.id === entry.meta_destino);
      if (goal) return `Meta: ${goal.name}`;
    }
    if (entry.perfil_destino) {
      const profile = currentUser()?.profiles.find((item) => item.id === entry.perfil_destino);
      if (profile) return `Perfil: ${profile.name}`;
    }
    return entry.destino || "Meta";
  }

  function goalHistoryItemHtml(entry) {
    const label = goalMovementTypeLabel(entry.tipo);
    const destination = goalMovementDestinationLabel(entry);
    const note = entry.justificativa || entry.observacao || entry.note || "";
    return `
      <article class="goal-history-item ${goalMovementClass(entry.tipo)}">
        <span class="goal-history-icon" aria-hidden="true">${goalMovementClass(entry.tipo) === "is-positive" ? "+" : "-"}</span>
        <div class="goal-history-copy">
          <strong>${escapeHtml(label)}</strong>
          <span>${escapeHtml(destination)}${note ? ` · ${escapeHtml(note)}` : ""}</span>
        </div>
        <div class="goal-history-meta">
          <strong>${goalMovementAmount(entry)}</strong>
          <span>${formatDate(entry.data || entry.date)} ${escapeHtml(entry.hora || "")}</span>
        </div>
      </article>
    `;
  }

  function openGoalMoneyModal(mode, goalId, prefillAmount = 0) {
    const profile = currentProfile();
    const goal = profile.goals.find((item) => item.id === goalId);
    if (!goal) return;
    closeGoalMoneyModal();
    const isTransfer = mode === "transfer";
    const otherGoals = profile.goals.filter((item) => item.id !== goal.id);
    const defaultTransferType = otherGoals.length ? "goal" : "profile";
    const modal = document.createElement("div");
    modal.className = "goal-money-modal-backdrop";
    modal.dataset.goalMoneyModal = "true";
    modal.innerHTML = `
      <section class="goal-money-modal" role="dialog" aria-modal="true" aria-labelledby="goalMoneyTitle">
        <form class="goal-money-form" data-goal-money-form>
          <div class="goal-modal-header">
            <div>
              <span>${isTransfer ? "Transferencia" : "Retirada"}</span>
              <h3 id="goalMoneyTitle">${escapeHtml(goal.name)}</h3>
            </div>
            <button class="icon-button" data-close-goal-money type="button" aria-label="Fechar">x</button>
          </div>
          <div class="goal-modal-balance">
            <span>Disponivel</span>
            <strong>${money(goal.saved)}</strong>
          </div>
          <label class="field">
            <span>Valor</span>
            <input name="amount" type="number" min="0.01" max="${Number(goal.saved || 0)}" step="0.01" value="${prefillAmount > 0 ? prefillAmount : ""}" required />
            <small class="field-hint">O valor nao pode ultrapassar o saldo guardado.</small>
          </label>
          ${isTransfer ? `
            <label class="field">
              <span>Tipo de destino</span>
              <select name="targetType" data-goal-transfer-type>
                <option value="goal"${defaultTransferType === "goal" ? " selected" : ""}>Outra meta</option>
                <option value="profile"${defaultTransferType === "profile" ? " selected" : ""}>Perfil financeiro</option>
              </select>
            </label>
            <label class="field">
              <span>Destino</span>
              <select name="targetId" data-goal-target-select required></select>
              <small class="field-hint" data-goal-target-hint></small>
            </label>
          ` : `
            <label class="field">
              <span>Destino do dinheiro</span>
              <select name="destination" data-withdraw-destination required>
                <option value="">Selecione</option>
                <option value="Conta corrente">Conta corrente</option>
                <option value="Investimento">Investimento</option>
                <option value="Gasto planejado">Gasto planejado</option>
                <option value="Emergencia">Emergencia</option>
                <option value="custom">Outro destino</option>
              </select>
            </label>
            <label class="field is-hidden" data-custom-destination-field>
              <span>Outro destino</span>
              <input name="customDestination" type="text" maxlength="80" />
            </label>
            <label class="field">
              <span>Data</span>
              <input name="movementDate" type="date" value="${toDateInput(new Date())}" required />
            </label>
          `}
          <label class="field">
            <span>Justificativa</span>
            <textarea name="justification" rows="3" placeholder="Explique por que este dinheiro esta saindo da meta" required></textarea>
          </label>
          ${isTransfer ? "" : `
            <label class="field">
              <span>Observação opcional</span>
              <textarea name="observation" rows="2" placeholder="Ex.: emergência médica, ajuste planejado"></textarea>
            </label>
          `}
          <div class="goal-modal-actions">
            <button class="ghost-action" data-close-goal-money type="button">Cancelar</button>
            <button class="primary-action" type="submit">${isTransfer ? "Transferir" : "Confirmar retirada"}</button>
          </div>
        </form>
      </section>
    `;
    document.body.append(modal);
    bindGoalMoneyModalControls(modal, mode, goal);
    modal.querySelector("input[name='amount']")?.focus();
  }

  function bindGoalMoneyModalControls(modal, mode, goal) {
    const closeButtons = modal.querySelectorAll("[data-close-goal-money]");
    closeButtons.forEach((button) => button.addEventListener("click", closeGoalMoneyModal));
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeGoalMoneyModal();
    });
    const destination = modal.querySelector("[data-withdraw-destination]");
    const customField = modal.querySelector("[data-custom-destination-field]");
    destination?.addEventListener("change", () => {
      customField?.classList.toggle("is-hidden", destination.value !== "custom");
      if (destination.value === "custom") customField?.querySelector("input")?.focus();
    });

    const transferType = modal.querySelector("[data-goal-transfer-type]");
    const targetSelect = modal.querySelector("[data-goal-target-select]");
    const hint = modal.querySelector("[data-goal-target-hint]");
    const syncTargets = () => {
      if (!transferType || !targetSelect) return;
      const type = transferType.value;
      const options = type === "goal"
        ? currentProfile().goals.filter((item) => item.id !== goal.id).map((item) => ({ id: item.id, name: item.name }))
        : (currentUser()?.profiles || []).map((item) => ({ id: item.id, name: item.name }));
      targetSelect.innerHTML = options.length
        ? options.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.name)}</option>`).join("")
        : `<option value="">Nenhum destino disponivel</option>`;
      targetSelect.disabled = !options.length;
      if (hint) hint.textContent = type === "goal" ? "Move saldo entre metas sem criar transacao." : "Cria uma receita no perfil escolhido.";
    };
    transferType?.addEventListener("change", syncTargets);
    syncTargets();

    modal.querySelector("[data-goal-money-form]").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const amount = Number(form.elements.amount.value);
      const justification = form.elements.justification.value.trim();
      if (mode === "transfer") {
        transferGoal(goal.id, {
          amount,
          targetType: form.elements.targetType.value,
          targetId: form.elements.targetId.value,
          justification,
        });
      } else {
        withdrawGoal(goal.id, {
          amount,
          destination: form.elements.destination.value,
          customDestination: form.elements.customDestination?.value.trim() || "",
          justification,
          date: form.elements.movementDate?.value || toDateInput(new Date()),
          observation: form.elements.observation?.value.trim() || "",
        });
      }
    });
  }

  function closeGoalMoneyModal() {
    document.querySelector("[data-goal-money-modal]")?.remove();
  }

  function contributeGoal(id, amount) {
    const profile = currentProfile();
    const goal = profile.goals.find((item) => item.id === id);
    if (!goal) return;
    const result = core.goals.contribute(goal, profile, amount, { uid, locale: languageLocale() });
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    saveStore();
    showToast(goalInsight(goal, amount));
    refreshAll();
    if (result.completed) {
      requestAnimationFrame(() => celebrateGoalCompletion(goal));
    }
  }

  function celebrateGoalCompletion(goal) {
    const card = app.querySelector(`[data-goal-id="${cssEscape(goal.id)}"]`);
    if (!card || prefersReducedMotion()) {
      showToast(`Parabéns! Você alcançou a meta ${goal.name}.`);
      return;
    }
    card.classList.add("is-celebrating");
    const confetti = document.createElement("div");
    confetti.className = "goal-confetti";
    confetti.setAttribute("aria-hidden", "true");
    const colors = ["var(--primary)", "var(--income)", "var(--secondary)", "var(--warning)"];
    Array.from({ length: 18 }, (_, index) => {
      const piece = document.createElement("i");
      piece.style.setProperty("--confetti-x", `${8 + ((index * 17) % 84)}%`);
      piece.style.setProperty("--confetti-delay", `${(index % 6) * 45}ms`);
      piece.style.setProperty("--confetti-drift", `${-24 + ((index * 13) % 48)}px`);
      piece.style.setProperty("--confetti-color", colors[index % colors.length]);
      return piece;
    }).forEach((piece) => confetti.append(piece));
    card.append(confetti);
    showToast(`Parabéns! Você alcançou a meta ${goal.name}.`);
    window.setTimeout(() => {
      confetti.remove();
      card.classList.remove("is-celebrating");
    }, 1800);
  }

  function withdrawGoal(id, { amount, destination, customDestination, justification, date, observation }) {
    const profile = currentProfile();
    const goal = profile.goals.find((item) => item.id === id);
    if (!goal) return;
    const result = core.goals.withdraw(goal, profile, { amount, destination, customDestination, justification, date, observation }, { uid, locale: languageLocale() });
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    closeGoalMoneyModal();
    saveStore();
    showToast("Retirada registrada na meta.");
    refreshAll();
  }

  function transferGoal(id, { amount, targetType, targetId, justification }) {
    const user = currentUser();
    const profile = currentProfile();
    const goal = profile.goals.find((item) => item.id === id);
    if (!goal) return;
    const result = core.goals.transfer({ user, profile, goal, amount, targetType, targetId, justification }, {
      uid,
      locale: languageLocale(),
      ensureProfileShape,
      ensureGoalTransferCategory,
    });
    if (!result.ok) {
      showToast(result.error);
      return;
    }
    showToast(result.message);

    closeGoalMoneyModal();
    saveStore();
    refreshAll();
    if (result.targetGoal && !result.targetGoalWasComplete && Number(result.targetGoal.saved || 0) >= Number(result.targetGoal.target || 0)) {
      requestAnimationFrame(() => celebrateGoalCompletion(result.targetGoal));
    }
  }

  function ensureGoalTransferCategory(profile) {
    return core.categories.ensureGoalTransferCategory(profile, uid, normalizeText);
  }

  function editGoal(id) {
    const goal = currentProfile().goals.find((item) => item.id === id);
    if (!goal) return;
    openGoalComposer({ editing: true });
    app.querySelector("#goalId").value = goal.id;
    app.querySelector("#goalName").value = goal.name;
    app.querySelector("#goalTarget").value = goal.target;
    app.querySelector("#goalInitial").value = goal.saved;
    app.querySelector("#goalDeadline").value = goal.deadline;
    app.querySelector("#goalTheme").value = goal.theme;
    app.querySelector("[data-goal-composer-title]").textContent = "Editar meta";
    app.querySelector("#goalName")?.focus();
  }

  function resetGoalForm() {
    app.querySelector("#goalForm").reset();
    app.querySelector("#goalId").value = "";
    app.querySelector("#goalInitial").value = 0;
    const title = app.querySelector("[data-goal-composer-title]");
    if (title) title.textContent = "Nova meta";
  }

  function openGoalComposer(options = {}) {
    setView("goals");
    if (!options.editing) resetGoalForm();
    const modal = app.querySelector("[data-goal-composer]");
    if (!modal) return;
    modal.hidden = false;
    modal.classList.add("is-open");
    document.body.classList.add("has-modal-open");
    setTimeout(() => app.querySelector("#goalName")?.focus(), 40);
  }

  function closeGoalComposer() {
    const modal = app.querySelector("[data-goal-composer]");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.hidden = true;
    document.body.classList.remove("has-modal-open");
  }

  function createReminder(id) {
    const goal = currentProfile().goals.find((item) => item.id === id);
    if (!goal) return;
    closeGoalAuxModal();
    const modal = document.createElement("div");
    modal.className = "goal-money-modal-backdrop goal-aux-modal-backdrop";
    modal.dataset.goalAuxModal = "true";
    modal.innerHTML = `
      <section class="goal-money-modal goal-aux-modal" role="dialog" aria-modal="true" aria-labelledby="goalReminderTitle">
        <form class="goal-money-form" data-goal-reminder-form>
          <div class="goal-modal-header">
            <div>
              <span>Lembrete</span>
              <h3 id="goalReminderTitle">${escapeHtml(goal.name)}</h3>
            </div>
            <button class="icon-button" data-close-goal-aux type="button" aria-label="Fechar">x</button>
          </div>
          <label class="field">
            <span>Frequência</span>
            <select name="type">
              <option value="monthly">Mensal</option>
              <option value="weekly">Semanal</option>
              <option value="specific">Data específica</option>
            </select>
          </label>
          <label class="field">
            <span>Data inicial</span>
            <input name="date" type="date" value="${toDateInput(new Date())}" required />
          </label>
          <label class="field">
            <span>Mensagem</span>
            <textarea name="text" rows="3" required>Adicionar valor em ${escapeHtml(goal.name)}</textarea>
          </label>
          <div class="goal-modal-actions">
            <button class="ghost-action" data-close-goal-aux type="button">Cancelar</button>
            <button class="primary-action" type="submit">Salvar lembrete</button>
          </div>
        </form>
      </section>
    `;
    document.body.append(modal);
    bindGoalAuxModal(modal);
    modal.querySelector("[data-goal-reminder-form]").addEventListener("submit", (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      goal.reminders = goal.reminders || [];
      goal.reminders.push({
        id: uid("reminder"),
        date: form.elements.date.value,
        text: form.elements.text.value.trim(),
        type: form.elements.type.value,
      });
      saveStore();
      closeGoalAuxModal();
      showToast("Lembrete salvo na meta.");
      refreshAll();
    });
  }

  function bindGoalAuxModal(modal) {
    modal.querySelectorAll("[data-close-goal-aux]").forEach((button) => {
      button.addEventListener("click", closeGoalAuxModal);
    });
    modal.addEventListener("click", (event) => {
      if (event.target === modal) closeGoalAuxModal();
    });
  }

  function closeGoalAuxModal() {
    document.querySelector("[data-goal-aux-modal]")?.remove();
  }

  function openGoalSimulationModal(id) {
    const goal = currentProfile().goals.find((item) => item.id === id);
    if (!goal) return;
    closeGoalAuxModal();
    const remaining = Math.max(Number(goal.target || 0) - Number(goal.saved || 0), 0);
    const suggested = Math.max(goalMonthlyNeed(goal), 0);
    const modal = document.createElement("div");
    modal.className = "goal-money-modal-backdrop goal-aux-modal-backdrop";
    modal.dataset.goalAuxModal = "true";
    modal.innerHTML = `
      <section class="goal-money-modal goal-aux-modal" role="dialog" aria-modal="true" aria-labelledby="goalSimulationTitle">
        <form class="goal-money-form" data-goal-simulation-form>
          <div class="goal-modal-header">
            <div>
              <span>Simulação</span>
              <h3 id="goalSimulationTitle">${escapeHtml(goal.name)}</h3>
            </div>
            <button class="icon-button" data-close-goal-aux type="button" aria-label="Fechar">x</button>
          </div>
          <div class="goal-modal-balance">
            <span>Falta hoje</span>
            <strong>${money(remaining)}</strong>
          </div>
          <label class="field">
            <span>Quanto pretende guardar por mês?</span>
            <input name="monthly" type="number" min="0.01" step="0.01" value="${suggested ? suggested.toFixed(2) : ""}" required />
          </label>
          <div class="goal-simulation-result" data-goal-simulation-result>
            Informe um valor para ver a nova previsão sem alterar os dados reais.
          </div>
          <div class="goal-modal-actions">
            <button class="ghost-action" data-close-goal-aux type="button">Fechar</button>
            <button class="primary-action" type="submit">Simular</button>
          </div>
        </form>
      </section>
    `;
    document.body.append(modal);
    bindGoalAuxModal(modal);
    const form = modal.querySelector("[data-goal-simulation-form]");
    const updateSimulation = () => {
      const monthly = Number(form.elements.monthly.value || 0);
      const result = modal.querySelector("[data-goal-simulation-result]");
      if (!monthly || monthly <= 0) {
        result.textContent = "Informe um aporte mensal maior que zero.";
        return;
      }
      const months = Math.ceil(remaining / monthly);
      const projectedDate = new Date();
      projectedDate.setMonth(projectedDate.getMonth() + months);
      const currentDeadline = parseLocalDate(goal.deadline);
      const daysDelta = Math.round((currentDeadline - projectedDate) / 86400000);
      const projectedPercent = Math.min(Math.round(((Number(goal.saved || 0) + monthly) / Number(goal.target || 1)) * 100), 100);
      result.innerHTML = `
        <strong>Nova previsão: ${formatDate(toDateInput(projectedDate))}</strong>
        <span>${months <= 1 ? "Falta apenas 1 aporte." : `Faltam ${months} aportes.`}</span>
        <span>${daysDelta >= 0 ? `Você terminaria ${daysDelta} dias antes do prazo.` : `Você ficaria ${Math.abs(daysDelta)} dias após o prazo.`}</span>
        <span>Novo percentual no próximo aporte: ${projectedPercent}%.</span>
      `;
    };
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      updateSimulation();
    });
    form.elements.monthly.addEventListener("input", updateSimulation);
    updateSimulation();
  }

  function deleteGoal(id) {
    const profile = currentProfile();
    const goal = profile.goals.find((item) => item.id === id);
    if (!goal) return;
    if (!confirm(`Excluir a meta "${goal.name}"?`)) return;
    profile.goals = profile.goals.filter((item) => item.id !== id);
    saveStore();
    showToast("Meta excluída.");
    refreshAll();
  }

  function renderInsights() {
    const profile = currentProfile();
    const insights = buildInsights(profile);
    app.querySelectorAll("[data-insight-list], [data-dashboard-insight-list]").forEach((box) => {
      box.innerHTML = "";
      const visibleInsights = box.matches("[data-dashboard-insight-list]") ? insights.slice(0, 2) : insights;
      visibleInsights.forEach((text) => {
        const item = document.createElement("div");
        item.className = "insight-item";
        item.innerHTML = `
          <span class="insight-orb" aria-hidden="true"><i data-lucide="sparkles"></i></span>
          <div>${text}</div>
        `;
        box.append(item);
      });
      renderIcons();
    });
  }

  function buildInsights(profile) {
    const insights = [];
    const currentMonth = currentCalendarMonth();
    const settledTransactions = profile.transactions.filter((transaction) => isSettledTransaction(transaction) && !transaction.transferId);
    const monthSettled = settledTransactions.filter((transaction) => isInCalendarMonth(transaction.date, currentMonth));
    const monthIncome = sum(monthSettled.filter((transaction) => transaction.type === "income"), "amount");
    const monthExpense = sum(monthSettled.filter((transaction) => transaction.type === "expense"), "amount");
    const monthResult = monthIncome - monthExpense;
    const spendingPeak = peakExpenseDay(monthSettled);
    const topExpense = highestTransaction(monthSettled.filter((transaction) => transaction.type === "expense"));
    const categoryComparison = categorySpendingComparison(settledTransactions, currentMonth);
    const bestSaving = bestSavingMonth(settledTransactions);
    const extraContribution = bestExtraGoalContribution(profile.goals);
    const activeGoals = profile.goals.filter((goal) => goal.saved < goal.target);
    const overdue = activeGoals.filter((goal) => daysUntil(goal.deadline) < 0);
    const close = activeGoals.filter((goal) => goal.saved / goal.target >= 0.75);
    const reminders = activeGoals.flatMap((goal) => (goal.reminders || []).map((reminder) => ({ ...reminder, goal: goal.name })));

    if (spendingPeak) {
      insights.push(`💸 <strong>Dia de maior gasto.</strong> Em ${formatDate(spendingPeak.date)}, saíram ${money(spendingPeak.total)}. Vale revisar esse dia e procurar um ajuste pequeno para o próximo mês.`);
    }
    if (topExpense) {
      const category = findCategory(topExpense.categoryId);
      insights.push(`🔎 <strong>Maior despesa paga.</strong> ${escapeHtml(topExpense.description)} foi o maior movimento de saída do mês: ${money(topExpense.amount)} em ${escapeHtml(category.name)}.`);
    }
    if (categoryComparison) {
      const direction = categoryComparison.delta < 0 ? "menos" : "mais";
      insights.push(`📊 <strong>${escapeHtml(categoryComparison.categoryName)} mudou.</strong> Você gastou ${categoryComparison.percent}% ${direction} nessa categoria em relação ao mês anterior.`);
    }
    if (bestSaving) {
      insights.push(`🏆 <strong>Melhor economia recente.</strong> Em ${bestSaving.label}, você fechou com ${money(bestSaving.result)} de sobra. Esse é um ótimo padrão para tentar repetir.`);
    }
    if (monthResult > 0) {
      insights.push(`💙 <strong>Sobrou dinheiro este mês.</strong> Você está positivo em ${money(monthResult)}. Separar uma parte disso para uma meta acelera seu progresso sem pesar.`);
    } else if (monthExpense > monthIncome && monthIncome > 0) {
      insights.push(`🧭 <strong>Mês pedindo atenção.</strong> As saídas pagas passaram as entradas em ${money(Math.abs(monthResult))}. Um corte pequeno nas maiores despesas já ajuda a virar o jogo.`);
    }
    if (extraContribution) {
      insights.push(`🚀 <strong>Aporte acima da média.</strong> Você guardou ${money(extraContribution.amount)} em ${escapeHtml(extraContribution.goalName)}, acima da sua média de ${money(extraContribution.average)}. Esse é o tipo de avanço que muda o placar.`);
    }
    if (!profile.goals.length) {
      insights.push("💡 <strong>Metas em pausa.</strong> Crie um objetivo para acompanhar aportes, progresso e próximos passos.");
    } else if (!activeGoals.length) {
      insights.push("🎉 <strong>Metas concluídas.</strong> Você zerou seus objetivos ativos. Crie uma nova meta para continuar evoluindo.");
    }
    close.slice(0, 2).forEach((goal) => {
      insights.push(`🎯 <strong>${escapeHtml(goal.name)} está perto.</strong> Falta ${money(goal.target - goal.saved)} para concluir essa meta.`);
    });
    overdue.slice(0, 2).forEach((goal) => {
      insights.push(`⚠️ <strong>${escapeHtml(goal.name)} passou do prazo.</strong> Atualize a data ou divida o valor restante em aportes menores.`);
    });
    activeGoals.slice(0, 3).forEach((goal) => {
      const days = Math.max(daysUntil(goal.deadline), 1);
      const remaining = Math.max(goal.target - goal.saved, 0);
      const monthly = remaining / Math.max(days / 30, 1);
      insights.push(`📈 <strong>${escapeHtml(goal.name)}.</strong> Guardando ${money(monthly)} por mês, você mantém o objetivo em ritmo saudável.`);
    });
    reminders
      .filter((reminder) => reminder.date >= toDateInput(new Date()))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 2)
      .forEach((reminder) => {
        insights.push(`⏰ <strong>Lembrete em ${formatDate(reminder.date)}.</strong> ${escapeHtml(reminder.text)}.`);
      });

    if (!insights.length) {
      insights.push("✨ <strong>Comece seu histórico.</strong> Lance receitas, despesas pagas e aportes nas metas para receber leituras mais certeiras sobre seus hábitos.");
    }

    return insights.slice(0, 8);
  }

  function peakExpenseDay(transactions) {
    return core.reports.peakExpenseDay(transactions);
  }

  function highestTransaction(transactions) {
    return core.reports.highestTransaction(transactions);
  }

  function categorySpendingComparison(transactions, currentMonth) {
    return core.reports.categorySpendingComparison(transactions, currentMonth, findCategory);
  }

  function bestSavingMonth(transactions) {
    return core.reports.bestSavingMonth(transactions, lastMonths(6));
  }

  function bestExtraGoalContribution(goals) {
    return core.reports.bestExtraGoalContribution(goals);
  }

  function goalInsight(goal, amount) {
    return core.goals.insight(goal, amount, money);
  }

  function renderProfilesLegacy() {
    const user = currentUser();
    const box = app.querySelector("[data-profile-list]");
    box.innerHTML = "";
    user.profiles.forEach((profile) => {
      const balance = core.accounts.consolidatedBalance(profile);
      const activeGoals = profile.goals.filter((goal) => goal.saved < goal.target).length;
      const month = currentCalendarMonth();
      const monthIncome = monthlyTotal(profile.transactions, month.value, "income");
      const monthExpense = monthlyTotal(profile.transactions, month.value, "expense");
      const isActive = profile.id === user.activeProfileId;
      const item = document.createElement("article");
      item.className = `profile-item ${isActive ? "is-active" : ""}`;
      item.innerHTML = `
        <div class="profile-bank-face">
          <div class="profile-bank-top">
            <span class="profile-color" aria-hidden="true">${initialsFrom(profile.name)}</span>
            <span class="profile-active-badge">${isActive ? "Perfil ativo" : "Conta"}</span>
          </div>
          <div class="profile-bank-main">
            <span>Saldo disponível</span>
            <strong class="${balance >= 0 ? "amount-income" : "amount-expense"}">${money(balance)}</strong>
          </div>
          <div class="profile-bank-footer">
            <span>${escapeHtml(profile.name)}</span>
            <small>${profileCardCode(profile)}</small>
          </div>
        </div>
        <div class="profile-card-main">
          <div>
            <div class="list-title">${escapeHtml(profile.name)}</div>
            <div class="list-meta">${isActive ? "Em uso agora" : profileActivityLabel(profile)}</div>
          </div>
        </div>
        <div class="profile-card-stats">
          <span><small>Último acesso</small><strong>${escapeHtml(profileLastAccessShort(profile))}</strong></span>
          <span><small>Receitas mês</small><strong class="amount-income">${money(monthIncome)}</strong></span>
          <span><small>Despesas mês</small><strong class="amount-expense">${money(monthExpense)}</strong></span>
          <span><small>Transações</small><strong>${profile.transactions.length}</strong></span>
          <span><small>Metas</small><strong>${activeGoals}/${profile.goals.length}</strong></span>
        </div>
        <div class="profile-actions">
          <button class="primary-action compact" data-use-profile="${profile.id}" type="button">Entrar</button>
          <button class="ghost-action" data-edit-profile="${profile.id}" type="button">Editar</button>
          <button class="danger-action" data-delete-profile="${profile.id}" type="button">Excluir</button>
        </div>
      `;
      box.append(item);
    });

    box.querySelectorAll("[data-use-profile]").forEach((button) => {
      button.addEventListener("click", () => {
        user.activeProfileId = button.dataset.useProfile;
        saveStore();
        showToast("Perfil selecionado.");
        renderDashboard();
        setView("profiles");
      });
    });
    box.querySelectorAll("[data-edit-profile]").forEach((button) => {
      button.addEventListener("click", () => {
        const profile = user.profiles.find((item) => item.id === button.dataset.editProfile);
        app.querySelector("#profileId").value = profile.id;
        app.querySelector("#profileName").value = profile.name;
        app.querySelector("[data-save-profile]").textContent = "Salvar perfil";
      });
    });
    box.querySelectorAll("[data-delete-profile]").forEach((button) => {
      button.addEventListener("click", () => {
        if (user.profiles.length === 1) {
          showToast("Mantenha pelo menos um perfil.");
          return;
        }
        const profile = user.profiles.find((item) => item.id === button.dataset.deleteProfile);
        if (!confirm(`Excluir o perfil "${profile.name}" e seus dados financeiros?`)) return;
        user.profiles = user.profiles.filter((item) => item.id !== profile.id);
        if (user.activeProfileId === profile.id) user.activeProfileId = user.profiles[0].id;
        saveStore();
        showToast("Perfil excluído.");
        renderDashboard();
        setView("profiles");
      });
    });
  }

  function renderProfiles() {
    const user = currentUser();
    const box = app.querySelector("[data-profile-list]");
    if (!user || !box) return;
    syncProfileFilterControls();
    updateProfilesHero(user);
    renderProfileStatsChart(user.profiles);

    const profiles = filterAndSortProfiles(user.profiles);
    box.innerHTML = "";
    if (!user.profiles.length) {
      box.append(emptyState({
        icon: "users",
        title: "Nenhum perfil criado.",
        description: "Crie seu primeiro perfil para separar contas, metas e movimentações financeiras.",
        actionLabel: "Criar primeiro perfil",
        action: openProfileComposer,
      }));
      return;
    }
    if (!profiles.length) {
      box.append(emptyState({
        icon: "search",
        title: "Nenhum perfil encontrado.",
        description: "Ajuste a busca para visualizar seus perfis financeiros.",
        actionLabel: "Limpar busca",
        action: clearProfileFilters,
      }));
      return;
    }
    profiles.forEach((profile) => box.append(profileCard(profile, user)));
    bindProfileCardActions(box, user);
    requestAnimationFrame(renderIcons);
  }

  function updateProfilesHero(user) {
    const active = user.profiles.find((profile) => profile.id === user.activeProfileId) || user.profiles[0];
    const totalBalance = user.profiles.reduce((total, profile) => total + core.accounts.consolidatedBalance(profile), 0);
    const count = app.querySelector("[data-profiles-count]");
    const activeName = app.querySelector("[data-profiles-active-name]");
    if (count) count.textContent = String(user.profiles.length);
    if (activeName) activeName.textContent = active?.name || "Sem perfil";
    setAnimatedMoney("[data-profiles-total-balance]", totalBalance);
  }

  function syncProfileFilterControls() {
    const search = app.querySelector("[data-profile-search]");
    if (search && search.value !== state.profileFilters.query) search.value = state.profileFilters.query;
    const sort = app.querySelector("[data-profile-sort]");
    if (sort && sort.value !== state.profileFilters.sort) sort.value = state.profileFilters.sort;
  }

  function clearProfileFilters() {
    state.profileFilters = { query: "", sort: "recent" };
    renderProfiles();
  }

  function filterAndSortProfiles(profiles) {
    const query = normalizeText(state.profileFilters.query || "");
    return profiles
      .filter((profile) => !query || normalizeText(profile.name).includes(query))
      .sort(profileComparator(state.profileFilters.sort || "recent"));
  }

  function profileComparator(sort) {
    return (a, b) => {
      if (sort === "balance-desc") return core.accounts.consolidatedBalance(b) - core.accounts.consolidatedBalance(a);
      if (sort === "name-asc") return a.name.localeCompare(b.name, languageLocale());
      if (sort === "used-desc") return profileUsageScore(b) - profileUsageScore(a);
      return (latestProfileActivityDate(b)?.getTime() || 0) - (latestProfileActivityDate(a)?.getTime() || 0);
    };
  }

  function profileUsageScore(profile) {
    return profile.transactions.length + profile.goals.length + (profile.imports || []).length + (profile.budgets || []).length;
  }

  function profileCard(profile, user) {
    const balance = core.accounts.consolidatedBalance(profile);
    const activeGoals = profile.goals.filter((goal) => Number(goal.saved || 0) < Number(goal.target || 0)).length;
    const month = currentCalendarMonth();
    const monthIncome = monthlyTotal(profile.transactions, month.value, "income");
    const monthExpense = monthlyTotal(profile.transactions, month.value, "expense");
    const isActive = profile.id === user.activeProfileId;
    const item = document.createElement("article");
    item.className = `profile-item profile-compact-card ${isActive ? "is-active" : ""}`;
    item.dataset.profileId = profile.id;
    item.innerHTML = `
      <div class="profile-card-header">
        <span class="profile-color" aria-hidden="true">${initialsFrom(profile.name)}</span>
        <div class="profile-title-block">
          <h3>${escapeHtml(profile.name)}</h3>
          <span>${isActive ? "Perfil ativo" : "Perfil secundário"}</span>
        </div>
        <span class="profile-active-badge">${isActive ? "Em uso" : "Secundário"}</span>
      </div>
      <div class="profile-balance-row">
        <span>Saldo</span>
        <strong class="${balance >= 0 ? "amount-income" : "amount-expense"}">${money(balance)}</strong>
      </div>
      <div class="profile-card-stats">
        <span><small>Receitas mês</small><strong class="amount-income">${money(monthIncome)}</strong></span>
        <span><small>Despesas mês</small><strong class="amount-expense">${money(monthExpense)}</strong></span>
        <span><small>Transações</small><strong>${profile.transactions.length}</strong></span>
        <span><small>Metas</small><strong>${activeGoals}/${profile.goals.length}</strong></span>
        <span><small>Último acesso</small><strong>${escapeHtml(profileLastAccessShort(profile))}</strong></span>
      </div>
      <div class="profile-actions" aria-label="Ações do perfil ${escapeHtml(profile.name)}">
        <button class="icon-button profile-icon-action" data-use-profile="${profile.id}" type="button" aria-label="Entrar em ${escapeHtml(profile.name)}" title="Entrar"><i data-lucide="log-in" aria-hidden="true"></i></button>
        <button class="icon-button profile-icon-action" data-edit-profile="${profile.id}" type="button" aria-label="Editar ${escapeHtml(profile.name)}" title="Editar"><i data-lucide="pencil" aria-hidden="true"></i></button>
        <button class="icon-button profile-icon-action" data-duplicate-profile="${profile.id}" type="button" aria-label="Duplicar ${escapeHtml(profile.name)}" title="Duplicar"><i data-lucide="copy" aria-hidden="true"></i></button>
        <button class="icon-button profile-icon-action" data-export-profile="${profile.id}" type="button" aria-label="Exportar ${escapeHtml(profile.name)}" title="Exportar"><i data-lucide="download" aria-hidden="true"></i></button>
        <button class="icon-button profile-icon-action danger" data-delete-profile="${profile.id}" type="button" aria-label="Excluir ${escapeHtml(profile.name)}" title="Excluir"><i data-lucide="trash-2" aria-hidden="true"></i></button>
      </div>
    `;
    return item;
  }

  function bindProfileCardActions(box, user) {
    box.querySelectorAll("[data-use-profile]").forEach((button) => {
      button.addEventListener("click", () => {
        user.activeProfileId = button.dataset.useProfile;
        saveStore();
        showToast("Perfil selecionado.");
        renderDashboard();
        setView("profiles");
      });
    });
    box.querySelectorAll("[data-edit-profile]").forEach((button) => {
      button.addEventListener("click", () => {
        const profile = user.profiles.find((item) => item.id === button.dataset.editProfile);
        if (!profile) return;
        openProfileComposer({ editing: true });
        app.querySelector("#profileId").value = profile.id;
        app.querySelector("#profileName").value = profile.name;
        app.querySelector("[data-save-profile]").textContent = "Salvar perfil";
        const title = app.querySelector("[data-profile-composer-title]");
        if (title) title.textContent = "Editar perfil";
      });
    });
    box.querySelectorAll("[data-duplicate-profile]").forEach((button) => {
      button.addEventListener("click", () => duplicateProfile(button.dataset.duplicateProfile));
    });
    box.querySelectorAll("[data-export-profile]").forEach((button) => {
      button.addEventListener("click", () => exportSingleProfile(button.dataset.exportProfile));
    });
    box.querySelectorAll("[data-delete-profile]").forEach((button) => {
      button.addEventListener("click", () => deleteProfileById(button.dataset.deleteProfile));
    });
  }

  function duplicateProfile(id) {
    const user = currentUser();
    const source = user.profiles.find((profile) => profile.id === id);
    if (!source) return;
    const clone = core.profiles.duplicate(source, { uid });
    ensureProfileShape(clone);
    user.profiles.push(clone);
    saveStore();
    showToast("Perfil duplicado.");
    renderDashboard();
    setView("profiles");
  }

  function exportSingleProfile(id) {
    const user = currentUser();
    const profile = user.profiles.find((item) => item.id === id);
    if (!profile) return;
    const payload = core.reports.buildExportProfile(profile);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nexio-perfil-${normalizeText(profile.name).replace(/\s+/g, "-") || "perfil"}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Perfil exportado.");
  }

  function deleteProfileById(id) {
    const user = currentUser();
    if (user.profiles.length === 1) {
      showToast("Mantenha pelo menos um perfil.");
      return;
    }
    const profile = user.profiles.find((item) => item.id === id);
    if (!profile) return;
    if (!confirm(`Excluir o perfil "${profile.name}" e seus dados financeiros?`)) return;
    user.profiles = user.profiles.filter((item) => item.id !== profile.id);
    if (user.activeProfileId === profile.id) user.activeProfileId = user.profiles[0].id;
    saveStore();
    showToast("Perfil excluído.");
    renderDashboard();
    setView("profiles");
  }

  function profileStatsSeries(profiles, months, totalForMonth = monthlyTotal) {
    const income = months.map((month) => profiles.reduce((total, profile) => total + totalForMonth(profile.transactions, month.value, "income"), 0));
    const expense = months.map((month) => profiles.reduce((total, profile) => total + totalForMonth(profile.transactions, month.value, "expense"), 0));
    const net = income.map((value, index) => value - expense[index]);
    const totalIncome = income.reduce((total, value) => total + value, 0);
    const totalExpense = expense.reduce((total, value) => total + value, 0);
    return {
      income,
      expense,
      net,
      totalIncome,
      totalExpense,
      totalBalance: net.reduce((total, value) => total + value, 0),
      hasData: income.some((value) => value !== 0) || expense.some((value) => value !== 0),
    };
  }

  function renderProfileStatsChart(profiles) {
    const canvas = document.getElementById("profileStatsChart");
    if (!canvas) return;
    const months = lastMonths(6);
    const labels = months.map((month) => month.label);
    const stats = profileStatsSeries(profiles, months);
    const panel = canvas.closest(".profiles-stats-panel");
    const emptyState = panel?.querySelector("[data-profiles-chart-empty]");
    const emptyMonths = panel?.querySelector("[data-profiles-chart-empty-months]");
    panel?.classList.toggle("has-empty-chart", !stats.hasData);
    canvas.hidden = !stats.hasData;
    if (emptyState) emptyState.hidden = stats.hasData;
    if (emptyMonths) emptyMonths.textContent = labels.join(" · ");

    if (stats.hasData) {
      drawGroupedBarChart(canvas.getContext("2d"), canvas, {
        labels,
        series: [
          { label: "Receitas", values: stats.income, color: cssVar("--income") },
          { label: "Despesas", values: stats.expense, color: cssVar("--expense") },
        ],
        compact: canvas.getBoundingClientRect().width < 480,
        moneyLabels: true,
        showLegend: false,
      });
    } else {
      cancelAnimationFrame(canvas.__chartAnimationFrame);
      canvas.__chartSeries = null;
      canvas.__chartAreas = [];
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
      updateChartComparisonIndicator(canvas);
    }
    setAnimatedMoney("[data-profiles-stats-income]", stats.totalIncome);
    setAnimatedMoney("[data-profiles-stats-expense]", stats.totalExpense);
    setAnimatedMoney("[data-profiles-stats-balance]", stats.totalBalance);
    updateChartSummary(canvas, `Nos últimos 6 meses, receitas consolidadas somam ${money(stats.totalIncome)}, despesas somam ${money(stats.totalExpense)} e saldo líquido soma ${money(stats.totalBalance)}.`);
  }

  function profileActivityLabel(profile) {
    const latest = latestProfileActivityDate(profile);
    if (!latest) return "Sem atividade recente";
    return `Último acesso ${latest.toLocaleDateString(languageLocale(), { day: "2-digit", month: "short", year: "numeric" }).replace(".", "")}`;
  }

  function latestProfileActivityDate(profile) {
    const dates = [
      ...profile.transactions.map((transaction) => transaction.updatedAt || transaction.createdAt || transaction.date),
      ...profile.goals.map((goal) => goal.updatedAt || goal.createdAt || goal.deadline),
      ...(profile.budgets || []).map((budget) => budget.updatedAt || budget.createdAt),
      ...(profile.imports || []).map((entry) => entry.importedAt),
    ].filter(Boolean);
    return dates
      .map((value) => new Date(value))
      .filter((date) => !Number.isNaN(date.valueOf()))
      .sort((a, b) => b - a)[0] || null;
  }

  function profileLastAccessShort(profile) {
    const latest = latestProfileActivityDate(profile);
    if (!latest) return "Sem registro";
    return latest.toLocaleDateString(languageLocale(), { day: "2-digit", month: "short" }).replace(".", "");
  }

  function profileCardCode(profile) {
    const source = String(profile.id || profile.name || "0000").replace(/\D/g, "");
    const code = source.slice(-4).padStart(4, "0");
    return `•••• ${code}`;
  }

  function renderSettings() {
    const user = currentUser();
    const profile = currentProfile();
    app.querySelector("#settingsProfileName").value = profile.name;
    app.querySelector("#settingsUserName").value = user.name;
    app.querySelector("#settingsTheme").value = user.theme;
    app.querySelector("#settingsCurrency").value = user.currency;
    const languageSelect = app.querySelector("#settingsLanguage");
    if (languageSelect) languageSelect.value = supportedLanguage(user.language);
    const colorInput = app.querySelector("#settingsPrimaryColor");
    if (colorInput) colorInput.value = user.primaryColor || "#5b9cff";
    syncSettingsThemePreview(user.theme);
    renderAssistantPersonalizationSettings();
    app.querySelectorAll("[data-setting-toggle]").forEach((toggle) => {
      toggle.checked = Boolean(user.settings?.[toggle.dataset.settingToggle]);
    });
    core.notifications.normalizeProfile(profile);
    const notificationState = profile.notificationState;
    app.querySelectorAll("[data-notification-preference]").forEach((toggle) => {
      toggle.checked = Boolean(notificationState.preferences[toggle.dataset.notificationPreference]);
    });
    const dueSoonDays = app.querySelector("#notificationDueSoonDays");
    if (dueSoonDays) dueSoonDays.value = String(notificationState.preferences.dueSoonDays);
    const avatar = app.querySelector("[data-settings-avatar]");
    if (avatar) {
      avatar.textContent = user.avatar ? "" : initialsFrom(user.name);
      avatar.style.backgroundImage = user.avatar ? `url("${user.avatar}")` : "";
      avatar.classList.toggle("has-image", Boolean(user.avatar));
    }
    const sessionType = app.querySelector("[data-settings-session-type]");
    if (sessionType) {
      const syncStatus = syncCoordinator.getStatus().status;
      sessionType.textContent = isLocalOnlyUser(user)
        ? "Dados protegidos neste aparelho"
        : syncStatus === "synced"
          ? "Conta autenticada; estado atual confirmado"
          : new Set(["conflict", "blocked"]).has(syncStatus)
            ? "Conta autenticada; sincronização requer revisão"
            : "Conta autenticada; alterações podem estar pendentes";
    }
    const bytes = new Blob([JSON.stringify(buildExportUser(user))]).size;
    const limit = 5 * 1024 * 1024;
    const percent = Math.min((bytes / limit) * 100, 100);
    const storageLabel = app.querySelector("[data-cloud-storage-label]");
    const storageFill = app.querySelector("[data-cloud-storage-fill]");
    const storageStatus = app.querySelector("[data-cloud-storage-status]");
    if (storageLabel) storageLabel.textContent = `${Math.max(1, Math.round(bytes / 1024))} KB de 5 MB`;
    if (storageFill) storageFill.style.width = `${Math.max(percent, 2)}%`;
    if (storageStatus) storageStatus.textContent = isLocalOnlyUser(user) ? "Armazenamento local" : cloud.lastStatus;
    updateSyncStatus();
    renderImportHistory(profile);
  }

  function syncSettingsThemePreview(theme) {
    app.querySelectorAll("[data-theme-choice]").forEach((button) => {
      const selected = button.dataset.themeChoice === theme;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  function renderImportHistory(profile) {
    const box = app.querySelector("[data-import-history]");
    if (!box) return;
    box.innerHTML = "";
    const imports = [...(profile.imports || [])].sort((a, b) => String(b.importedAt).localeCompare(String(a.importedAt))).slice(0, 8);
    if (!imports.length) {
      box.append(emptyState({
        icon: "upload",
        title: "Nenhuma importação salva.",
        description: "Importe CSV, Excel, PDF ou JSON para trazer movimentações para este perfil.",
        actionLabel: "Importar arquivo",
        action: () => app.querySelector("#importDataInput")?.click(),
        compact: true,
      }));
      return;
    }
    imports.forEach((entry) => {
      const item = document.createElement("div");
      item.className = "import-history-item";
      item.innerHTML = `
        <div>
          <strong>${escapeHtml(entry.sourceName || "Importação")}</strong>
          <span>${formatDate(toDateInput(new Date(entry.importedAt || new Date())))} · ${plural(entry.imported || 0, "transação", "transações")}</span>
        </div>
        <span>${plural(entry.categoriesCreated || 0, "categoria", "categorias")}</span>
      `;
      box.append(item);
    });
  }

  function drawAuthChart() {
    const canvas = document.getElementById("authMiniChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const values = [32, 48, 38, 64, 58, 80, 72];
    const labels = Array.from({ length: 7 }, (_, index) => new Date(2026, index, 1).toLocaleDateString(languageLocale(), { month: "short" }).replace(".", ""));
    const balance = app.querySelector("[data-auth-balance]");
    const goals = app.querySelector("[data-auth-goals]");
    cancelAnimationFrame(authChartAnimation);

    const renderFrame = (progress) => {
      const position = (values.length - 1) * progress;
      const completed = Math.floor(position);
      const partial = values.slice(0, completed + 1);
      if (completed < values.length - 1) {
        partial.push(values[completed] + (values[completed + 1] - values[completed]) * (position - completed));
      }
      drawLineChart(ctx, canvas, partial, {
        labels: labels.slice(0, partial.length),
        lineColor: cssVar("--primary"),
        fillColor: `rgba(${cssVar("--primary-rgb")}, .16)`,
        gridColor: `rgba(${cssVar("--primary-rgb")}, .12)`,
        labelColor: cssVar("--muted"),
        moneyLabels: false,
      });
    };

    if (prefersReducedMotion()) {
      renderFrame(1);
      if (balance) balance.textContent = money(12480);
      if (goals) goals.textContent = "4 ativas";
      return;
    }

    const startedAt = performance.now();
    const animate = (now) => {
      if (!canvas.isConnected) return;
      const progress = Math.min((now - startedAt) / 1500, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      renderFrame(eased);
      if (balance) balance.textContent = money(12480 * eased);
      if (goals) goals.textContent = `${Math.min(4, Math.floor(eased * 5))} ativas`;
      if (progress < 1) authChartAnimation = requestAnimationFrame(animate);
    };
    authChartAnimation = requestAnimationFrame(animate);
  }

  function drawMonthlyFlowChart() {
    const canvas = document.getElementById("monthlyFlowChart");
    if (!canvas) return;
    const profile = currentProfile();
    const months = lastMonths(6);
    const income = months.map((month) => monthlyTotal(profile.transactions, month.value, "income"));
    const expense = months.map((month) => monthlyTotal(profile.transactions, month.value, "expense"));
    drawGroupedBarChart(canvas.getContext("2d"), canvas, {
      labels: months.map((month) => month.label),
      series: [
        { label: "Receitas", values: income, color: cssVar("--income") },
        { label: "Despesas", values: expense, color: cssVar("--expense") },
      ],
    });
    updateChartSummary(canvas, `Nos últimos 6 meses, receitas somam ${money(income.reduce((a, b) => a + b, 0))} e despesas somam ${money(expense.reduce((a, b) => a + b, 0))}.`);
    toggleChartEmptyState(canvas, !(income.some(Boolean) || expense.some(Boolean)), {
      icon: "bar-chart-3",
      title: "Sem dados suficientes.",
      description: "Conforme você cadastrar movimentações, os gráficos aparecerão aqui.",
      actionLabel: "Nova Transação",
      action: openTransactionComposer,
    });
  }

  function drawCashflowCharts() {
    const dailyCanvas = document.getElementById("dailyFlowChart");
    const balanceCanvas = document.getElementById("balanceEvolutionChart");
    const forecastCanvas = document.getElementById("cashflowForecastChart");
    if (!dailyCanvas || !balanceCanvas) return;

    const profile = currentProfile();
    const cashflowTransactions = transactionsForCashflow(profile);
    const month = state.cashflowMonth || toMonthInput(new Date());
    const days = daysInMonth(month);
    const labels = Array.from({ length: days }, (_, index) => String(index + 1));
    const income = Array(days).fill(0);
    const expense = Array(days).fill(0);
    const dailyTransactions = Array.from({ length: days }, () => []);
    const isForecast = isForecastCashflowMonth(month);
    syncCashflowRangeButtons();
    updateCashflowModeLabels(isForecast);
    updateCashflowModeNote(profile, month, isForecast);
    cashflowTransactions.forEach((transaction) => {
      if (toMonthInput(parseLocalDate(transaction.date)) !== month) return;
      if (!isDateInCashflowRange(transaction.date, month)) return;
      if (!isCashflowTransactionIncluded(transaction)) return;
      const day = parseLocalDate(transaction.date).getDate() - 1;
      const amount = Number(transaction.amount || 0);
      if (transaction.type === "income") income[day] += amount;
      if (transaction.type === "expense") expense[day] += amount;
      dailyTransactions[day].push(transaction);
    });

    drawGroupedBarChart(dailyCanvas.getContext("2d"), dailyCanvas, {
      labels,
      series: [
        { label: "Entradas", values: income, color: cssVar("--income") },
        { label: "Saídas", values: expense, color: cssVar("--expense") },
      ],
      gridColor: cssVar("--cashflow-chart-grid"),
      labelColor: cssVar("--cashflow-chart-label"),
      dense: true,
    });
    updateChartSummary(dailyCanvas, `No mês selecionado, entradas ${isForecast ? "previstas" : "realizadas"} somam ${money(income.reduce((a, b) => a + b, 0))} e saídas ${isForecast ? "previstas" : "realizadas"} somam ${money(expense.reduce((a, b) => a + b, 0))}.`);

    let running = cashflowInitialBalance(profile) + calculateCashflowBalance(cashflowTransactions.filter((transaction) => transaction.date < `${month}-01`));
    const evolution = labels.map((_, index) => {
      running += income[index] - expense[index];
      return running;
    });
    drawLineChart(balanceCanvas.getContext("2d"), balanceCanvas, evolution, {
      labels,
      lineColor: cssVar("--primary"),
      fillColor: `rgba(${cssVar("--primary-rgb")}, .14)`,
      gridColor: cssVar("--cashflow-chart-grid"),
      labelColor: cssVar("--cashflow-chart-label"),
      moneyLabels: true,
      dense: true,
      tooltipLines: (index, value) => [
        `Saldo do dia: ${money(value)}`,
        `Receitas: ${money(income[index] || 0)}`,
        `Despesas: ${money(expense[index] || 0)}`,
        `Saldo acumulado: ${money(value)}`,
      ],
    });
    updateChartSummary(balanceCanvas, `A evolução do saldo vai de ${money(evolution[0] || 0)} até ${money(evolution[evolution.length - 1] || 0)} no mês selecionado.`);
    const hasCashflowData = income.some(Boolean) || expense.some(Boolean);
    toggleChartEmptyState(dailyCanvas, !hasCashflowData, {
      icon: "bar-chart-3",
      title: "Sem dados suficientes.",
      description: "Conforme você cadastrar movimentações, os gráficos aparecerão aqui.",
      actionLabel: "Nova Transação",
      action: openTransactionComposer,
    });
    toggleChartEmptyState(balanceCanvas, !hasCashflowData, {
      icon: "line-chart",
      title: "Sem dados suficientes.",
      description: "Conforme você cadastrar movimentações, a tendência do saldo aparecerá aqui.",
      actionLabel: "Nova Transação",
      action: openTransactionComposer,
    });

    if (forecastCanvas) {
      const forecast = buildCashflowForecast(profile, 14);
      drawLineChart(forecastCanvas.getContext("2d"), forecastCanvas, forecast.values, {
        labels: forecast.labels,
        lineColor: cssVar("--investment"),
        fillColor: colorWithAlpha(cssVar("--investment"), 0.18),
        gridColor: cssVar("--cashflow-chart-grid"),
        labelColor: cssVar("--cashflow-chart-label"),
        moneyLabels: true,
        responsiveLabels: true,
        tooltipLines: (index, value) => [
          `Data: ${forecast.fullLabels[index]}`,
          `Saldo previsto: ${money(value)}`,
        ],
      });
      updateChartSummary(forecastCanvas, `Nos próximos dias, o saldo previsto vai de ${money(forecast.values[0] || 0)} até ${money(forecast.values[forecast.values.length - 1] || 0)}.`);
      toggleChartEmptyState(forecastCanvas, !forecast.hasData, {
        icon: "line-chart",
        title: "Sem dados suficientes.",
        description: "Conforme houver movimentações futuras, a previsão aparecerá aqui.",
        actionLabel: "Nova Transação",
        action: openTransactionComposer,
      });
    }

    const totalIncome = income.reduce((a, b) => a + b, 0);
    const totalExpense = expense.reduce((a, b) => a + b, 0);
    setAnimatedMoney("[data-cash-income]", totalIncome);
    setAnimatedMoney("[data-cash-expense]", totalExpense);
    setAnimatedMoney("[data-cash-result]", totalIncome - totalExpense);
    updateCashflowAnalytics(profile, month, income, expense, evolution, isForecast);
    renderCashflowPlanner(profile, month, income, expense, evolution, dailyTransactions);
    renderCashflowIntelligence(profile, month, income, expense, evolution, dailyTransactions, isForecast);
  }

  function toggleChartEmptyState(canvas, isEmpty, config) {
    const panel = canvas?.closest(".cashflow-chart-panel, .dashboard-flow-panel");
    if (!panel) return;
    panel.classList.toggle("has-empty-chart", Boolean(isEmpty));
    panel.querySelector("[data-chart-empty-state]")?.remove();
    if (!isEmpty) return;
    const stateElement = emptyState({ ...config, compact: true });
    stateElement.dataset.chartEmptyState = "true";
    canvas.insertAdjacentElement("afterend", stateElement);
  }

  function renderCashflowPlanner(profile, month, income, expense, evolution, dailyTransactions = []) {
    const calendar = app.querySelector("[data-cashflow-calendar]");
    const timeline = app.querySelector("[data-cashflow-timeline]");
    if (!calendar || !timeline) return;

    const todayInput = toDateInput(new Date());
    calendar.innerHTML = "";
    ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].forEach((weekday) => {
      const label = document.createElement("div");
      label.className = "calendar-weekday";
      label.textContent = weekday;
      calendar.append(label);
    });
    const [year, monthNumber] = month.split("-").map(Number);
    const firstWeekday = new Date(year, monthNumber - 1, 1).getDay();
    Array.from({ length: firstWeekday }).forEach(() => {
      const spacer = document.createElement("div");
      spacer.className = "calendar-day is-empty";
      spacer.setAttribute("aria-hidden", "true");
      calendar.append(spacer);
    });
    income.forEach((incomeValue, index) => {
      const day = index + 1;
      const date = `${month}-${String(day).padStart(2, "0")}`;
      const net = incomeValue - expense[index];
      const transactions = dailyTransactions[index] || [];
      const movementCount = transactions.length;
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "calendar-day";
      cell.classList.toggle("is-today", date === todayInput);
      cell.classList.toggle("has-income", incomeValue > 0);
      cell.classList.toggle("has-expense", expense[index] > 0);
      cell.classList.toggle("has-many", movementCount >= 3);
      cell.disabled = !movementCount && incomeValue === 0 && expense[index] === 0;
      cell.title = `${formatDate(date)}: entradas ${money(incomeValue)}, saídas ${money(expense[index])}, saldo ${money(evolution[index] || 0)}.`;
      cell.setAttribute("aria-label", cell.title);
      cell.innerHTML = `
        <div class="calendar-day-top">
          <span>${day}</span>
          <span class="calendar-day-markers" aria-hidden="true">
            ${date === todayInput ? "<i class=\"marker-today\">★</i>" : ""}
            ${incomeValue > 0 ? "<i class=\"marker-income\"></i>" : ""}
            ${expense[index] > 0 ? "<i class=\"marker-expense\"></i>" : ""}
            ${movementCount >= 3 ? "<i class=\"marker-many\"></i>" : ""}
          </span>
        </div>
        <strong class="${net >= 0 ? "amount-income" : "amount-expense"}">${compactMoney(net)}</strong>
        <small>Saldo ${compactMoney(evolution[index] || 0)}</small>
      `;
      cell.addEventListener("click", () => showCashflowDayDetail({
        date,
        income: incomeValue,
        expense: expense[index],
        balance: evolution[index] || 0,
        transactions,
      }));
      calendar.append(cell);
    });

    const upcoming = transactionsForCashflow(profile)
      .filter((transaction) => toMonthInput(parseLocalDate(transaction.date)) === month)
      .filter(isCashflowTransactionIncluded)
      .sort((a, b) => a.date.localeCompare(b.date) || String(a.createdAt).localeCompare(String(b.createdAt)))
      .slice(0, 8);
    timeline.innerHTML = "";
    if (!upcoming.length) {
      timeline.append(emptyState({
        icon: "calendar-clock",
        title: "Sem dados suficientes.",
        description: "Conforme você cadastrar movimentações, a agenda do fluxo de caixa aparecerá aqui.",
        actionLabel: "Nova Transação",
        action: openTransactionComposer,
        compact: true,
      }));
      return;
    }
    upcoming.forEach((transaction) => {
      const item = document.createElement("article");
      const category = findCategory(transaction.categoryId);
      const priority = cashflowPriority(transaction);
      const daysText = cashflowDaysLabel(transaction.date);
      item.className = `timeline-item cashflow-movement-card ${transaction.type === "income" ? "timeline-income" : "timeline-expense"} priority-${priority.level}`;
      item.innerHTML = `
        <span class="timeline-dot" aria-hidden="true">${escapeHtml(category.icon)}</span>
        <div>
          <strong>${escapeHtml(transaction.description)}</strong>
          <span>${escapeHtml(category.name)} · ${daysText}</span>
        </div>
        <span class="timeline-status">${escapeHtml(transaction.status)}</span>
        <em class="${transaction.type === "income" ? "amount-income" : "amount-expense"}">${transaction.type === "income" ? "+" : "-"}${money(transaction.amount)}</em>
        <small class="cashflow-priority-badge">${priority.label}</small>
      `;
      timeline.append(item);
    });
  }

  function renderCashflowIntelligence(profile, month, income, expense, evolution, dailyTransactions, isForecast) {
    const totalIncome = income.reduce((a, b) => a + b, 0);
    const totalExpense = expense.reduce((a, b) => a + b, 0);
    const result = totalIncome - totalExpense;
    const finalBalance = evolution[evolution.length - 1] || 0;
    const minBalance = Math.min(...evolution, finalBalance);
    const firstNegativeIndex = evolution.findIndex((value) => value < 0);
    const monthTransactions = dailyTransactions.flat();
    const openExpenses = monthTransactions.filter((transaction) => transaction.type === "expense" && isOpenTransaction(transaction));
    const overdue = openExpenses.filter((transaction) => transaction.status === "Atrasado" || parseLocalDate(transaction.date) < parseLocalDate(toDateInput(new Date())));
    const nextWeek = openExpenses.filter((transaction) => daysBetweenToday(transaction.date) >= 0 && daysBetweenToday(transaction.date) <= 7);

    const semaphore = app.querySelector("[data-cashflow-semaphore]");
    const semaphoreTitle = app.querySelector("[data-cashflow-semaphore-title]");
    const semaphoreMessage = app.querySelector("[data-cashflow-semaphore-message]");
    if (semaphore && semaphoreTitle && semaphoreMessage) {
      const tone = minBalance < 0 ? "danger" : result < 0 || nextWeek.length >= 3 ? "warning" : "good";
      semaphore.dataset.tone = tone;
      semaphoreTitle.textContent = tone === "danger" ? "Saldo negativo previsto" : tone === "warning" ? "Atenção" : "Saldo confortável";
      semaphoreMessage.textContent = firstNegativeIndex >= 0
        ? `Se nenhuma receita extra entrar, o saldo ficará negativo em ${formatDate(`${month}-${String(firstNegativeIndex + 1).padStart(2, "0")}`)}.`
        : result < 0
          ? "As despesas previstas superam as receitas deste período."
          : "Seu saldo previsto segue positivo no período analisado.";
    }

    const alerts = [];
    if (nextWeek.length) alerts.push(`⚠ Você possui ${plural(nextWeek.length, "conta vencendo", "contas vencendo")} nos próximos 7 dias.`);
    if (result < 0) alerts.push("💰 Receitas previstas não cobrem todas as despesas.");
    if (overdue.length) alerts.push(`🔴 ${plural(overdue.length, "conta atrasada", "contas atrasadas")} exigem atenção.`);
    if (!overdue.length) alerts.push("🎉 Nenhuma conta atrasada neste fluxo.");
    renderTextList("[data-cashflow-alerts]", alerts, "shield-alert");

    const insights = cashflowInsights(profile, month, monthTransactions, result, minBalance, isForecast);
    renderTextList("[data-cashflow-insights]", insights, "sparkles");

    const tips = cashflowTips(profile, month, monthTransactions, minBalance);
    renderTextList("[data-cashflow-tips]", tips, "lightbulb");

    const highlights = app.querySelector("[data-cashflow-daily-highlights]");
    if (highlights) {
      const busiestDay = dailyTransactions
        .map((items, index) => ({ index, count: items.length, income: income[index], expense: expense[index] }))
        .sort((a, b) => b.count - a.count || (b.income + b.expense) - (a.income + a.expense))[0];
      highlights.innerHTML = `
        <span>${isForecast ? "Previsto" : "Realizado"} · ${plural(monthTransactions.length, "movimento", "movimentos")}</span>
        <span>Maior saída: ${money(Math.max(...expense, 0))}</span>
        <span>Dia mais movimentado: ${busiestDay?.count ? String(busiestDay.index + 1).padStart(2, "0") : "sem dados"}</span>
      `;
    }
  }

  function renderTextList(selector, items, icon) {
    const box = app.querySelector(selector);
    if (!box) return;
    box.innerHTML = "";
    items.slice(0, 4).forEach((text) => {
      const item = document.createElement("article");
      item.className = "cashflow-intel-item";
      item.innerHTML = `
        <span aria-hidden="true"><i data-lucide="${escapeHtml(icon)}"></i></span>
        <strong>${escapeHtml(text)}</strong>
      `;
      box.append(item);
    });
    requestAnimationFrame(renderIcons);
  }

  function cashflowInsights(profile, month, transactions, result, minBalance, isForecast) {
    const insights = [];
    const previousTotals = cashflowTotalsForMonth(profile, shiftMonthValue(month, -1));
    const previousResult = previousTotals.income - previousTotals.expense;
    const topExpense = topExpenseCategory(transactions);
    if (topExpense) insights.push(`Sua maior categoria no período foi ${topExpense.name}, com ${money(topExpense.amount)} em saídas.`);
    if (previousTotals.income || previousTotals.expense) {
      const delta = result - previousResult;
      insights.push(`${monthLabel(month)} terá saldo ${delta >= 0 ? "maior" : "menor"} que o mês anterior em ${money(Math.abs(delta))}.`);
    }
    if (minBalance < 0) insights.push(`Reserve pelo menos ${money(Math.abs(minBalance))} para evitar saldo negativo.`);
    if (!insights.length) insights.push(`Conforme você cadastrar movimentações, o Nexio cria leituras para ${isForecast ? "previsão" : "resultado"} do mês.`);
    return insights;
  }

  function cashflowTips(profile, month, transactions, minBalance) {
    const tips = [];
    const topExpense = topExpenseCategory(transactions);
    const upcomingExpense = transactions
      .filter((transaction) => transaction.type === "expense" && isOpenTransaction(transaction))
      .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))[0];
    if (upcomingExpense) tips.push(`Antecipe ou renegocie ${upcomingExpense.description} se quiser aliviar ${monthLabel(month)}.`);
    if (topExpense) tips.push(`Você pode economizar ${money(topExpense.amount * 0.12)} reduzindo gastos em ${topExpense.name}.`);
    if (minBalance < 0) tips.push(`Evite deixar o saldo negativo no dia em que a projeção tocar ${money(minBalance)}.`);
    if (topExpense) tips.push(`Sua maior categoria este mês foi ${topExpense.name}.`);
    if (!tips.length) tips.push("Cadastre receitas e despesas previstas para receber dicas automáticas.");
    return tips;
  }

  function topExpenseCategory(transactions) {
    const totals = new Map();
    transactions
      .filter((transaction) => transaction.type === "expense")
      .forEach((transaction) => {
        const category = findCategory(transaction.categoryId);
        const key = category.name;
        totals.set(key, { name: category.name, amount: (totals.get(key)?.amount || 0) + Number(transaction.amount || 0) });
      });
    return [...totals.values()].sort((a, b) => b.amount - a.amount)[0] || null;
  }

  function cashflowPriority(transaction) {
    const days = daysBetweenToday(transaction.date);
    const amount = Number(transaction.amount || 0);
    if (transaction.status === "Atrasado" || days < 0 || days === 0) return { level: "high", label: "Alta" };
    if (days <= 7 || amount >= 500) return { level: "medium", label: "Média" };
    return { level: "low", label: "Baixa" };
  }

  function cashflowDaysLabel(date) {
    const days = daysBetweenToday(date);
    if (days < 0) return `atrasado há ${Math.abs(days)} dia${Math.abs(days) === 1 ? "" : "s"}`;
    if (days === 0) return "vence hoje";
    if (days === 1) return "vence amanhã";
    return `vence em ${days} dias`;
  }

  function daysBetweenToday(date) {
    return core.utils.daysBetweenToday(date);
  }

  function buildCashflowForecast(profile, count = 14) {
    const today = parseLocalDate(toDateInput(new Date()));
    const cashflowTransactions = transactionsForCashflow(profile);
    let running = cashflowInitialBalance(profile) + calculateCashflowBalance(cashflowTransactions.filter((transaction) => transaction.date < toDateInput(today)));
    const labels = [];
    const fullLabels = [];
    const values = [];
    let hasData = false;
    for (let index = 0; index < count; index += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      const dateInput = toDateInput(date);
      const daily = cashflowTransactions.filter((transaction) => transaction.date === dateInput && isCashflowTransactionIncluded(transaction));
      daily.forEach((transaction) => {
        const amount = Number(transaction.amount || 0);
        running += transaction.type === "income" ? amount : -amount;
        if (amount) hasData = true;
      });
      labels.push(index === 0 ? "Hoje" : index === 1 ? "Amanhã" : `${index}d`);
      fullLabels.push(formatDate(dateInput));
      values.push(running);
    }
    return { labels, fullLabels, values, hasData };
  }

  function showCashflowDayDetail({ date, income, expense, balance, transactions }) {
    document.querySelector("[data-cashflow-day-detail]")?.remove();
    const backdrop = document.createElement("div");
    backdrop.className = "cashflow-day-detail-backdrop";
    backdrop.dataset.cashflowDayDetail = "true";
    const rows = transactions.length
      ? transactions.map((transaction) => {
        const category = findCategory(transaction.categoryId);
        return `
          <article class="cashflow-day-transaction ${transaction.type}">
            <span aria-hidden="true">${escapeHtml(category.icon)}</span>
            <div>
              <strong>${escapeHtml(transaction.description)}</strong>
              <small>${escapeHtml(category.name)} · ${escapeHtml(transaction.status)}</small>
            </div>
            <em class="${transaction.type === "income" ? "amount-income" : "amount-expense"}">${transaction.type === "income" ? "+" : "-"}${money(transaction.amount)}</em>
          </article>
        `;
      }).join("")
      : `<div class="empty-state empty-state-compact"><strong>Nenhuma movimentação neste dia.</strong><span class="empty-state-text">Quando houver entradas ou saídas, elas aparecerão aqui.</span></div>`;
    backdrop.innerHTML = `
      <section class="cashflow-day-detail" role="dialog" aria-modal="true" aria-labelledby="cashflowDayTitle">
        <div class="goal-modal-header">
          <div>
            <span>Detalhe do dia</span>
            <h3 id="cashflowDayTitle">${formatDate(date)}</h3>
          </div>
          <button class="icon-button" data-close-cashflow-day type="button" aria-label="Fechar">x</button>
        </div>
        <div class="cashflow-day-totals">
          <span><small>Entradas</small><strong class="amount-income">${money(income)}</strong></span>
          <span><small>Saídas</small><strong class="amount-expense">${money(expense)}</strong></span>
          <span><small>Saldo</small><strong>${money(balance)}</strong></span>
        </div>
        <div class="cashflow-day-list">${rows}</div>
      </section>
    `;
    document.body.append(backdrop);
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop || event.target.closest("[data-close-cashflow-day]")) backdrop.remove();
    });
  }

  function syncCashflowRangeButtons() {
    app.querySelectorAll("[data-cashflow-range]").forEach((button) => {
      const isActive = button.dataset.cashflowRange === state.cashflowRange;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function monthLabel(month) {
    const [year, monthIndex] = month.split("-").map(Number);
    return new Date(year, monthIndex - 1, 1).toLocaleDateString(languageLocale(), { month: "long" });
  }

  function updateCashflowAnalytics(profile, month, income, expense, evolution, isForecast) {
    const totalIncome = income.reduce((a, b) => a + b, 0);
    const totalExpense = expense.reduce((a, b) => a + b, 0);
    const result = totalIncome - totalExpense;
    const previousTotals = cashflowTotalsForMonth(profile, shiftMonthValue(month, -1));
    const previousResult = previousTotals.income - previousTotals.expense;
    const finalBalance = evolution[evolution.length - 1] || 0;
    const minBalance = Math.min(...evolution, finalBalance);
    const maxBalance = Math.max(...evolution, finalBalance);

    const trend = app.querySelector("[data-cashflow-trend]");
    if (trend) {
      trend.textContent = result >= 0
        ? `${isForecast ? "Previsão" : "Resultado"} positivo: entradas superam saídas em ${money(Math.abs(result))}.`
        : `${isForecast ? "Previsão" : "Resultado"} em atenção: saídas superam entradas em ${money(Math.abs(result))}.`;
    }

    const comparison = app.querySelector("[data-cashflow-comparison]");
    const comparisonBadge = app.querySelector("[data-cashflow-comparison-badge]");
    if (comparison) {
      const hasPreviousBase = previousTotals.income > 0 || previousTotals.expense > 0;
      if (!hasPreviousBase) {
        comparison.textContent = "Sem base no mês anterior para comparação.";
        if (comparisonBadge) comparisonBadge.textContent = "Novo";
      } else {
        const delta = result - previousResult;
        comparison.textContent = delta === 0
          ? "Resultado estável em relação ao mês anterior."
          : `${delta > 0 ? "Melhor" : "Pior"} em ${money(Math.abs(delta))} versus o mês anterior.`;
        if (comparisonBadge) comparisonBadge.textContent = delta > 0 ? "▲ melhor" : delta < 0 ? "▼ pior" : "Estável";
      }
    }

    setAnimatedMoney("[data-cashflow-min-balance]", minBalance);
    setAnimatedMoney("[data-cashflow-max-balance]", maxBalance);

    const riskLabel = app.querySelector("[data-cashflow-risk-label]");
    if (riskLabel) {
      const tone = minBalance < 0 ? "danger" : result < 0 ? "warning" : "good";
      riskLabel.dataset.tone = tone;
      riskLabel.textContent = tone === "danger" ? "Saldo negativo" : tone === "warning" ? "Atenção" : "Confortável";
    }
  }

  function cashflowTotalsForMonth(profile, month) {
    const transactions = transactionsForCashflow(profile);
    return transactions.reduce((totals, transaction) => {
      if (toMonthInput(parseLocalDate(transaction.date)) !== month || !isCashflowTransactionIncluded(transaction)) return totals;
      const amount = Number(transaction.amount || 0);
      if (transaction.type === "income") totals.income += amount;
      if (transaction.type === "expense") totals.expense += amount;
      return totals;
    }, { income: 0, expense: 0 });
  }

  function transactionsForCashflow(profile) {
    if (state.cashflowAccount !== "all") return core.accounts.transactionsFor(profile, state.cashflowAccount);
    const activeIds = new Set(core.accounts.activeAccounts(profile).map((account) => account.id));
    return profile.transactions.filter((transaction) => activeIds.has(transaction.accountId) && !transaction.transferId);
  }

  function cashflowInitialBalance(profile) {
    if (state.cashflowAccount !== "all") {
      return Number(core.accounts.accountById(profile, state.cashflowAccount)?.initialBalance || 0);
    }
    return core.accounts.activeAccounts(profile).reduce((total, account) => total + Number(account.initialBalance || 0), 0);
  }

  function shiftMonthValue(month, offset) {
    return core.utils.shiftMonthValue(month, offset);
  }

  function updateCashflowModeLabels(isForecast) {
    const labels = isForecast
      ? {
        income: "Entradas previstas",
        expense: "Saídas previstas",
        result: "Saldo previsto",
        evolution: "Saldo previsto",
      }
      : {
        income: "Entradas realizadas",
        expense: "Saídas realizadas",
        result: "Saldo realizado",
        evolution: "Saldo realizado",
      };
    app.querySelector("[data-cash-income-label]").textContent = labels.income;
    app.querySelector("[data-cash-expense-label]").textContent = labels.expense;
    app.querySelector("[data-cash-result-label]").textContent = labels.result;
    app.querySelector("[data-cash-evolution-label]").textContent = labels.evolution;
  }

  function updateCashflowModeNote(profile, month, isForecast) {
    const note = app.querySelector("[data-cashflow-mode-note]");
    if (!note) return;
    if (isForecast) {
      note.textContent = "Mês atual ou futuro: considera movimentos pagos, recebidos, pendentes e atrasados.";
      return;
    }
    const monthTransactions = transactionsForCashflow(profile).filter((transaction) => toMonthInput(parseLocalDate(transaction.date)) === month);
    const open = monthTransactions.filter(isOpenTransaction);
    const pendingIncome = sum(open.filter((transaction) => transaction.type === "income"), "amount");
    const pendingExpense = sum(open.filter((transaction) => transaction.type === "expense"), "amount");
    note.textContent = open.length
      ? `Mês histórico: mostra apenas Pago/Recebido. Pendências fora do gráfico: a receber ${money(pendingIncome)} · a pagar ${money(pendingExpense)}.`
      : "Mês histórico: mostra apenas movimentos pagos e recebidos.";
  }

  function isForecastCashflowMonth(month) {
    return core.finance.isForecastCashflowMonth(month);
  }

  function isCashflowTransactionIncluded(transaction) {
    return core.finance.isCashflowTransactionIncluded(transaction);
  }

  function isDateInCashflowRange(date, month) {
    const range = state.cashflowRange || "month";
    if (range === "month" || range === "next-month" || range === "custom") return true;
    const target = parseLocalDate(date);
    const today = parseLocalDate(toDateInput(new Date()));
    if (toMonthInput(target) !== month) return false;
    const span = range === "today" ? 1 : Number(range || 0);
    if (!span) return true;
    const end = new Date(today);
    end.setDate(today.getDate() + span - 1);
    return target >= today && target <= end;
  }

  function updateChartSummary(canvas, summary) {
    if (!canvas || !summary) return;
    canvas.setAttribute("aria-label", summary);
    const summaryNode = app.querySelector(`[data-chart-summary="${canvas.id}"]`);
    if (summaryNode) summaryNode.textContent = summary;
  }

  function chartTooltip() {
    let tooltip = document.querySelector(".chart-tooltip");
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.className = "chart-tooltip";
      tooltip.setAttribute("role", "status");
      document.body.append(tooltip);
    }
    return tooltip;
  }

  function bindChartTooltip(canvas) {
    if (!canvas || canvas.dataset.tooltipBound) return;
    canvas.dataset.tooltipBound = "true";
    canvas.addEventListener("mousemove", (event) => {
      const areas = canvas.__chartAreas || [];
      if (!areas.length) return;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const hit = areas.find((area) => (
        x >= area.x && x <= area.x + area.width &&
        y >= area.y && y <= area.y + area.height
      ));
      const tooltip = chartTooltip();
      if (!hit) {
        tooltip.classList.remove("is-visible");
        return;
      }
      tooltip.innerHTML = `<strong>${escapeHtml(hit.title)}</strong>${hit.lines.map((line) => `<span>${escapeHtml(line)}</span>`).join("")}`;
      tooltip.style.left = `${event.clientX}px`;
      tooltip.style.top = `${event.clientY}px`;
      tooltip.classList.add("is-visible");
    });
    canvas.addEventListener("mouseleave", () => {
      chartTooltip().classList.remove("is-visible");
    });
  }

  function drawGroupedBarChart(ctx, canvas, config) {
    const targetSeries = config.series.map((series) => ({ ...series, values: [...series.values] }));
    const previousSeries = canvas.__chartSeries || targetSeries.map((series) => ({ ...series, values: series.values.map(() => 0) }));
    cancelAnimationFrame(canvas.__chartAnimationFrame);
    if (prefersReducedMotion()) {
      renderGroupedBarChartFrame(ctx, canvas, { ...config, series: targetSeries });
      canvas.__chartSeries = targetSeries;
      updateChartComparisonIndicator(canvas);
      return;
    }
    const startedAt = performance.now();
    const animate = (now) => {
      if (!canvas.isConnected) return;
      const progress = Math.min((now - startedAt) / 620, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const series = targetSeries.map((target, seriesIndex) => ({
        ...target,
        values: target.values.map((value, index) => {
          const start = previousSeries[seriesIndex]?.values[index] ?? 0;
          return start + (value - start) * eased;
        }),
      }));
      renderGroupedBarChartFrame(ctx, canvas, { ...config, series });
      if (progress < 1) canvas.__chartAnimationFrame = requestAnimationFrame(animate);
      else {
        canvas.__chartSeries = targetSeries;
        updateChartComparisonIndicator(canvas);
      }
    };
    canvas.__chartAnimationFrame = requestAnimationFrame(animate);
  }

  function renderGroupedBarChartFrame(ctx, canvas, config) {
    const size = resizeCanvas(canvas, { minWidth: config.compact ? 180 : 300 });
    ctx = size.ctx;
    const width = size.width;
    const height = size.height;
    const padding = config.compact
      ? { top: 12, right: 10, bottom: 34, left: 62 }
      : { top: 34, right: 24, bottom: 42, left: 62 };
    ctx.clearRect(0, 0, width, height);
    const allValues = config.series.flatMap((series) => series.values);
    const max = Math.max(...allValues, 1) * 1.14;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    drawGrid(ctx, width, height, padding, max, 0, config);
    const groupWidth = chartWidth / config.labels.length;
    const barWidth = Math.max(4, Math.min(26, (groupWidth - 10) / config.series.length));
    const areas = [];

    config.labels.forEach((label, index) => {
      const groupLines = [];
      config.series.forEach((series, seriesIndex) => {
        const value = series.values[index];
        groupLines.push(`${series.label}: ${money(value)}`);
        const x = padding.left + index * groupWidth + groupWidth / 2 - (barWidth * config.series.length) / 2 + seriesIndex * barWidth;
        const barHeight = (value / max) * chartHeight;
        const y = padding.top + chartHeight - barHeight;
        const gradient = ctx.createLinearGradient(0, y, 0, padding.top + chartHeight);
        gradient.addColorStop(0, series.color);
        gradient.addColorStop(1, colorWithAlpha(series.color, 0.24));
        ctx.fillStyle = gradient;
        roundRect(ctx, x, y, barWidth - 2, barHeight, 5);
        ctx.fill();
      });
      areas.push({
        x: padding.left + index * groupWidth,
        y: padding.top,
        width: groupWidth,
        height: chartHeight,
        title: label,
        lines: groupLines,
      });
      if (!config.dense || index % Math.ceil(config.labels.length / chartLabelLimit(width)) === 0) {
        ctx.fillStyle = config.labelColor || cssVar("--muted");
        ctx.font = "12px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(label, padding.left + index * groupWidth + groupWidth / 2, height - 16);
      }
    });

    if (config.showLegend !== false) {
      let legendX = padding.left;
      config.series.forEach((series) => {
        const x = legendX;
        ctx.fillStyle = series.color;
        roundRect(ctx, x, 14, 12, 12, 3);
        ctx.fill();
        ctx.fillStyle = config.labelColor || cssVar("--muted");
        ctx.font = "12px Inter, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText(series.label, x + 18, 24);
        legendX += Math.max(ctx.measureText(series.label).width + 48, 92);
      });
    }
    canvas.__chartAreas = areas;
    bindChartTooltip(canvas);
  }

  function drawLineChart(ctx, canvas, values, options) {
    const target = [...values];
    if (canvas.id === "authMiniChart") {
      renderLineChartFrame(ctx, canvas, target, options);
      return;
    }
    const isInitialDraw = !canvas.__chartValues?.length;
    const previous = canvas.__chartValues?.length === target.length ? canvas.__chartValues : target.map(() => 0);
    cancelAnimationFrame(canvas.__chartAnimationFrame);
    if (prefersReducedMotion()) {
      renderLineChartFrame(ctx, canvas, target, options);
      canvas.__chartValues = target;
      updateChartComparisonIndicator(canvas);
      return;
    }
    const startedAt = performance.now();
    const animate = (now) => {
      if (!canvas.isConnected) return;
      const progress = Math.min((now - startedAt) / 720, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const frame = target.map((value, index) => previous[index] + (value - previous[index]) * eased);
      renderLineChartFrame(ctx, canvas, frame, { ...options, drawProgress: isInitialDraw ? eased : 1 });
      if (progress < 1) canvas.__chartAnimationFrame = requestAnimationFrame(animate);
      else {
        canvas.__chartValues = target;
        updateChartComparisonIndicator(canvas);
      }
    };
    canvas.__chartAnimationFrame = requestAnimationFrame(animate);
  }

  function renderLineChartFrame(ctx, canvas, values, options) {
    const size = resizeCanvas(canvas);
    ctx = size.ctx;
    const width = size.width;
    const height = size.height;
    const padding = { top: 30, right: 24, bottom: 42, left: options.moneyLabels ? 82 : 62 };
    ctx.clearRect(0, 0, width, height);
    const rawMin = Math.min(...values, 0);
    const rawMax = Math.max(...values, 1);
    const rawRange = rawMax - rawMin || 1;
    const min = rawMin - rawRange * 0.08;
    const max = rawMax + rawRange * 0.08;
    const range = max - min || 1;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    drawGrid(ctx, width, height, padding, max, min, options);

    const points = values.map((value, index) => {
      const x = padding.left + (chartWidth / Math.max(values.length - 1, 1)) * index;
      const y = padding.top + chartHeight - ((value - min) / range) * chartHeight;
      return { x, y, value, label: options.labels[index] };
    });

    ctx.beginPath();
    drawSmoothPath(ctx, points);
    ctx.lineTo(points[points.length - 1]?.x || padding.left, padding.top + chartHeight);
    ctx.lineTo(points[0]?.x || padding.left, padding.top + chartHeight);
    ctx.closePath();
    const fillGradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    fillGradient.addColorStop(0, options.fillColor || colorWithAlpha(options.lineColor, 0.2));
    fillGradient.addColorStop(1, colorWithAlpha(options.lineColor, 0.02));
    ctx.fillStyle = fillGradient;
    ctx.fill();

    ctx.beginPath();
    drawSmoothPath(ctx, points);
    ctx.strokeStyle = options.lineColor;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const pathLength = Math.max(chartWidth * 1.35, 1);
    const drawProgress = options.drawProgress ?? 1;
    ctx.setLineDash([pathLength]);
    ctx.lineDashOffset = pathLength * (1 - drawProgress);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;

    points.forEach((point, index) => {
      if (options.dense && index % Math.ceil(points.length / 12) !== 0) return;
      if (points.length > 1 && index / (points.length - 1) > drawProgress) return;
      ctx.save();
      ctx.shadowColor = options.lineColor;
      ctx.shadowBlur = 12;
      ctx.fillStyle = options.lineColor;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    options.labels.forEach((label, index) => {
      if ((options.dense || options.responsiveLabels) && index % Math.ceil(options.labels.length / chartLabelLimit(width)) !== 0) return;
      const x = padding.left + (chartWidth / Math.max(options.labels.length - 1, 1)) * index;
      ctx.fillStyle = options.labelColor;
      ctx.font = "12px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(label, x, height - 16);
    });
    canvas.__chartAreas = points.map((point, index) => ({
      x: point.x - 18,
      y: point.y - 24,
      width: 36,
      height: 48,
      title: point.label,
      lines: typeof options.tooltipLines === "function"
        ? options.tooltipLines(index, point.value)
        : [options.moneyLabels ? money(point.value) : String(Math.round(point.value))],
    }));
    bindChartTooltip(canvas);
  }

  function chartLabelLimit(width) {
    if (width < 360) return 4;
    if (width < 480) return 6;
    return 10;
  }

  function updateChartComparisonIndicator(canvas) {
    if (!canvas || canvas.id === "authMiniChart") return;
    const profile = currentProfile();
    if (!profile) return;
    const month = canvas.closest(".cashflow-premium") ? (state.cashflowMonth || toMonthInput(new Date())) : toMonthInput(new Date());
    const previousMonth = shiftMonthValue(month, -1);
    const current = cashflowTotalsForMonth(profile, month);
    const previous = cashflowTotalsForMonth(profile, previousMonth);
    const currentValue = current.income - current.expense;
    const previousValue = previous.income - previous.expense;
    const delta = currentValue - previousValue;
    const percent = previousValue ? Math.round((delta / Math.abs(previousValue)) * 100) : 0;
    const panel = canvas.closest(".panel, .goal-evolution-panel");
    const comparisonSlot = panel?.querySelector(`[data-chart-comparison-slot="${canvas.id || "goal"}"]`);
    let badge = panel?.querySelector(`[data-chart-comparison="${canvas.id || "goal"}"]`);
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "chart-comparison-indicator";
      badge.dataset.chartComparison = canvas.id || "goal";
      const heading = panel?.querySelector(".panel-heading") || canvas.parentElement;
      (comparisonSlot || heading)?.append(badge);
    }
    if (!badge) return;
    if (comparisonSlot && badge.parentElement !== comparisonSlot) comparisonSlot.append(badge);
    badge.classList.toggle("is-negative", delta < 0);
    badge.classList.toggle("is-neutral", !previousValue || delta === 0);
    badge.textContent = !previousValue
      ? "● sem base anterior"
      : `${delta >= 0 ? "▲" : "▼"} ${percent >= 0 ? "+" : ""}${percent}%`;
    badge.title = `Comparação com ${formatMonthYear(previousMonth)}`;
  }

  function drawGrid(ctx, width, height, padding, max, min = 0, options = {}) {
    const chartHeight = height - padding.top - padding.bottom;
    const steps = 4;
    ctx.strokeStyle = options.gridColor || cssVar("--line");
    ctx.lineWidth = 1;
    ctx.fillStyle = options.labelColor || cssVar("--muted");
    ctx.font = "12px Inter, sans-serif";
    ctx.textAlign = "right";
    for (let index = 0; index <= steps; index += 1) {
      const y = padding.top + (chartHeight / steps) * index;
      ctx.beginPath();
      ctx.globalAlpha = 0.38;
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      ctx.globalAlpha = 1;
      const value = max - ((max - min) / steps) * index;
      const label = options.moneyLabels
        ? (options.compact ? compactAxisMoney(value) : compactMoney(value))
        : Math.round(value);
      ctx.fillText(label, padding.left - 10, y + 4);
    }
  }

  function drawSmoothPath(ctx, points) {
    if (!points.length) return;
    ctx.moveTo(points[0].x, points[0].y);
    if (points.length < 3) {
      points.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
      return;
    }
    for (let index = 1; index < points.length - 1; index += 1) {
      const current = points[index];
      const next = points[index + 1];
      const midX = (current.x + next.x) / 2;
      const midY = (current.y + next.y) / 2;
      ctx.quadraticCurveTo(current.x, current.y, midX, midY);
    }
    const previous = points[points.length - 2];
    const last = points[points.length - 1];
    ctx.quadraticCurveTo(previous.x, previous.y, last.x, last.y);
  }

  function colorWithAlpha(color, alpha) {
    const normalized = String(color || "").trim();
    if (/^#[0-9a-f]{6}$/i.test(normalized)) {
      const value = Math.round(Math.min(Math.max(alpha, 0), 1) * 255).toString(16).padStart(2, "0");
      return `${normalized}${value}`;
    }
    return normalized;
  }

  function resizeCanvas(canvas, options = {}) {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(Math.round(rect.width || canvas.clientWidth || 640), Number(options.minWidth) || 300);
    const height = Math.max(Math.round(rect.height || Number(canvas.getAttribute("height") || 280)), 180);
    const ratio = Math.min(Math.max(window.devicePixelRatio || 1, 1), 3);
    const pixelWidth = Math.round(width * ratio);
    const pixelHeight = Math.round(height * ratio);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    return { ctx, width, height, ratio };
  }

  function roundRect(ctx, x, y, width, height, radius) {
    const safeHeight = Math.max(height, 0);
    const safeRadius = Math.min(radius, safeHeight / 2, width / 2);
    ctx.beginPath();
    ctx.moveTo(x + safeRadius, y);
    ctx.arcTo(x + width, y, x + width, y + safeHeight, safeRadius);
    ctx.arcTo(x + width, y + safeHeight, x, y + safeHeight, safeRadius);
    ctx.arcTo(x, y + safeHeight, x, y, safeRadius);
    ctx.arcTo(x, y, x + width, y, safeRadius);
    ctx.closePath();
  }

  function findCategory(id) {
    return core.categories.find(currentProfile().categories, id);
  }

  function calculateBalance(transactions) {
    return core.finance.calculateBalance(transactions);
  }

  function calculateProjectedBalance(transactions) {
    return core.finance.calculateProjectedBalance(transactions);
  }

  function calculateCashflowBalance(transactions) {
    return core.finance.calculateCashflowBalance(transactions);
  }

  function monthlyTotal(transactions, month, type) {
    return core.finance.monthlyTotal(transactions, month, type);
  }

  function isSettledTransaction(transaction) {
    return core.finance.isSettledTransaction(transaction);
  }

  function isOpenTransaction(transaction) {
    return core.finance.isOpenTransaction(transaction);
  }

  function currentMonthOpenTransactions(profile) {
    return core.finance.currentMonthOpenTransactions(profile);
  }

  function currentCalendarMonth(date = new Date()) {
    return core.utils.currentCalendarMonth(date);
  }

  function isInCalendarMonth(value, month) {
    return core.utils.isInCalendarMonth(value, month);
  }

  function lastMonths(count) {
    return core.utils.lastMonths(count, languageLocale());
  }

  function daysInMonth(month) {
    return core.utils.daysInMonth(month);
  }

  function daysUntil(date) {
    return core.utils.daysUntil(date);
  }

  function sum(items, key) {
    return core.utils.sum(items, key);
  }

  function money(value) {
    const user = currentUser();
    const currency = user?.currency || "BRL";
    return core.finance.formatMoney(value, currency);
  }

  function compactMoney(value) {
    const absolute = Math.abs(value);
    if (absolute >= 1000000) return `${money(value / 1000000)} mi`;
    if (absolute >= 1000) return `${money(value / 1000)} mil`;
    return money(value);
  }

  function compactAxisMoney(value) {
    const user = currentUser();
    const currency = user?.currency || "BRL";
    return new Intl.NumberFormat(languageLocale(), {
      style: "currency",
      currency,
      notation: Math.abs(value) >= 1000 ? "compact" : "standard",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatDate(value) {
    return parseLocalDate(value).toLocaleDateString(languageLocale(), { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  function formatLongDate(value) {
    return value.toLocaleDateString(languageLocale(), {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function formatMonthYear(value) {
    const date = parseLocalDate(`${value}-01`);
    const month = date.toLocaleDateString(languageLocale(), { month: "long" });
    return `${month.charAt(0).toUpperCase() + month.slice(1)}/${date.getFullYear()}`;
  }

  function parseLocalDate(value) {
    return core.utils.parseLocalDate(value);
  }

  function toDateInput(date) {
    return core.utils.toDateInput(date);
  }

  function toMonthInput(date) {
    return core.utils.toMonthInput(date);
  }

  function normalizeEmail(value) {
    return core.utils.normalizeEmail(value);
  }

  function plural(count, singular, pluralLabel) {
    return core.utils.plural(count, singular, pluralLabel);
  }

  function statusPill(status) {
    return `<span class="status-pill ${statusClass(status)}">${escapeHtml(status)}</span>`;
  }

  function statusSelect(transaction) {
    const options = statusOptionsFor(transaction.type)
      .map((status) => `<option value="${escapeHtml(status)}"${status === transaction.status ? " selected" : ""}>${escapeHtml(status)}</option>`)
      .join("");
    return `<select class="status-select ${statusClass(transaction.status)}" data-inline-status="${escapeHtml(transaction.id)}" aria-label="Alterar status de ${escapeHtml(transaction.description)}">${options}</select>`;
  }

  function statusOptionsFor(type) {
    return core.transactions.statusesFor(type);
  }

  function settledStatusFor(type) {
    return core.transactions.settledStatusFor(type);
  }

  function statusClass(status) {
    const classMap = {
      Pago: "status-paid",
      Recebido: "status-received",
      Pendente: "status-pending",
      Atrasado: "status-overdue",
    };
    return classMap[status] || "";
  }

  function normalizeEmptyState(input, overrides = {}) {
    const config = typeof input === "string" ? { title: input } : { ...(input || {}) };
    return {
      icon: "sparkles",
      title: "Sem dados suficientes.",
      description: "Quando houver dados suficientes, esta área passa a mostrar contexto e próximos passos.",
      actionLabel: "",
      action: null,
      compact: false,
      ...config,
      ...overrides,
    };
  }

  function emptyStateContent(config) {
    return `
      <span class="empty-state-icon" aria-hidden="true"><i data-lucide="${escapeHtml(config.icon)}"></i></span>
      <strong>${escapeHtml(config.title)}</strong>
      <span class="empty-state-text">${escapeHtml(config.description)}</span>
    `;
  }

  function emptyStateHtml(input, overrides = {}) {
    const config = normalizeEmptyState(input, overrides);
    requestAnimationFrame(renderIcons);
    return `<div class="empty-state${config.compact ? " empty-state-compact" : ""}">${emptyStateContent(config)}</div>`;
  }

  function emptyState(input, overrides = {}) {
    const config = normalizeEmptyState(input, overrides);
    const element = document.createElement("div");
    element.className = `empty-state${config.compact ? " empty-state-compact" : ""}`;
    element.innerHTML = emptyStateContent(config);
    if (config.actionLabel) {
      const button = document.createElement("button");
      button.className = "primary-action compact empty-state-action";
      button.type = "button";
      button.textContent = config.actionLabel;
      if (typeof config.action === "function") button.addEventListener("click", config.action);
      element.append(button);
    }
    requestAnimationFrame(renderIcons);
    return element;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function cssVar(name) {
    return getComputedStyle(document.body).getPropertyValue(name).trim();
  }

  function supportedLanguage(language) {
    const languages = window.NEXIO_I18N?.languages || {};
    return Object.prototype.hasOwnProperty.call(languages, language) ? language : "pt-BR";
  }

  function preferredBrowserLanguage() {
    const browserLanguage = String(navigator.language || "pt-BR").toLowerCase();
    if (browserLanguage.startsWith("en")) return "en";
    if (browserLanguage.startsWith("es")) return "es";
    if (browserLanguage.startsWith("fr")) return "fr";
    if (browserLanguage.startsWith("de")) return "de";
    return "pt-BR";
  }

  function preferredLanguage() {
    return supportedLanguage(currentUser()?.language || readStorage(LANGUAGE_KEY) || preferredBrowserLanguage());
  }

  function languageLocale(language = activeLanguage || preferredLanguage()) {
    const code = supportedLanguage(language);
    return window.NEXIO_I18N?.languages?.[code]?.locale || "pt-BR";
  }

  function translatePhrase(source, language = activeLanguage || preferredLanguage()) {
    const text = String(source ?? "");
    const code = supportedLanguage(language);
    if (code === "pt-BR" || !text) return text;
    const dictionary = window.NEXIO_I18N?.dictionaries?.[code] || {};
    if (dictionary[text]) return dictionary[text];

    const greeting = text.match(/^(Bom dia|Boa tarde|Boa noite),\s*(.+)$/);
    if (greeting) {
      const greetings = {
        en: { "Bom dia": "Good morning", "Boa tarde": "Good afternoon", "Boa noite": "Good evening" },
        es: { "Bom dia": "Buenos días", "Boa tarde": "Buenas tardes", "Boa noite": "Buenas noches" },
        fr: { "Bom dia": "Bonjour", "Boa tarde": "Bonjour", "Boa noite": "Bonsoir" },
        de: { "Bom dia": "Guten Morgen", "Boa tarde": "Guten Tag", "Boa noite": "Guten Abend" },
      };
      return `${greetings[code]?.[greeting[1]] || greeting[1]}, ${greeting[2]}`;
    }

    const synced = text.match(/^Sincronizado às (.+)$/);
    if (synced) {
      const labels = { en: "Synced at", es: "Sincronizado a las", fr: "Synchronisé à", de: "Synchronisiert um" };
      return `${labels[code]} ${synced[1]}`;
    }

    const count = text.match(/^(\d+)\s+(transação|transações|categoria|categorias|meta|metas|ativa|ativas)$/);
    if (count) {
      const amount = Number(count[1]);
      const singular = amount === 1;
      const nouns = {
        en: { transação: "transaction", transações: singular ? "transaction" : "transactions", categoria: "category", categorias: singular ? "category" : "categories", meta: "goal", metas: singular ? "goal" : "goals", ativa: "active", ativas: "active" },
        es: { transação: "transacción", transações: singular ? "transacción" : "transacciones", categoria: "categoría", categorias: singular ? "categoría" : "categorías", meta: "meta", metas: "metas", ativa: "activa", ativas: singular ? "activa" : "activas" },
        fr: { transação: "transaction", transações: "transactions", categoria: "catégorie", categorias: "catégories", meta: "objectif", metas: "objectifs", ativa: "actif", ativas: singular ? "actif" : "actifs" },
        de: { transação: "Transaktion", transações: "Transaktionen", categoria: "Kategorie", categorias: "Kategorien", meta: "Ziel", metas: "Ziele", ativa: "aktiv", ativas: "aktiv" },
      };
      return `${amount} ${nouns[code]?.[count[2]] || count[2]}`;
    }

    const storage = text.match(/^(\d+) KB de 5 MB$/);
    if (storage) {
      const connectors = { en: "of", es: "de", fr: "sur", de: "von" };
      return `${storage[1]} KB ${connectors[code]} 5 MB`;
    }

    const lastAccess = text.match(/^Último acesso (.+)$/);
    if (lastAccess) {
      const labels = { en: "Last accessed", es: "Último acceso", fr: "Dernier accès", de: "Letzter Zugriff" };
      return `${labels[code]} ${lastAccess[1]}`;
    }

    const entries = text.match(/^(\d+) lançamentos?$/);
    if (entries) {
      const labels = { en: Number(entries[1]) === 1 ? "entry" : "entries", es: Number(entries[1]) === 1 ? "registro" : "registros", fr: Number(entries[1]) === 1 ? "opération" : "opérations", de: Number(entries[1]) === 1 ? "Eintrag" : "Einträge" };
      return `${entries[1]} ${labels[code]}`;
    }

    const selected = text.match(/^(\d+) transações selecionadas$/);
    if (selected) {
      const labels = { en: "transactions selected", es: "transacciones seleccionadas", fr: "transactions sélectionnées", de: "Transaktionen ausgewählt" };
      return `${selected[1]} ${labels[code]}`;
    }

    const shown = text.match(/^Mostrando (\d+) transações$/);
    if (shown) {
      const labels = { en: "Showing", es: "Mostrando", fr: "Affichage de", de: "Angezeigt:" };
      return `${labels[code]} ${shown[1]} ${translatePhrase(`${shown[1]} transações`, code).replace(`${shown[1]} `, "")}`;
    }

    const daysLeft = text.match(/^Faltam (\d+) dias$/);
    if (daysLeft) {
      const labels = { en: "days left", es: "días restantes", fr: "jours restants", de: "Tage verbleibend" };
      return `${daysLeft[1]} ${labels[code]}`;
    }

    const days = text.match(/^(\d+) dias$/);
    if (days) {
      const labels = { en: "days", es: "días", fr: "jours", de: "Tage" };
      return `${days[1]} ${labels[code]}`;
    }

    const saved = text.match(/^(\d+(?:[.,]\d+)?)% guardado$/);
    if (saved) {
      const labels = { en: "saved", es: "ahorrado", fr: "épargné", de: "gespart" };
      return `${saved[1]}% ${labels[code]}`;
    }

    const page = text.match(/^Página (\d+)$/);
    if (page) {
      const labels = { en: "Page", es: "Página", fr: "Page", de: "Seite" };
      return `${labels[code]} ${page[1]}`;
    }

    const notifications = text.match(/^Abrir central de notificações, (\d+) alerta(?:s)? pendente(?:s)?$/);
    if (notifications) {
      const labels = {
        en: `Open notifications, ${notifications[1]} pending alert${notifications[1] === "1" ? "" : "s"}`,
        es: `Abrir notificaciones, ${notifications[1]} alerta${notifications[1] === "1" ? "" : "s"} pendiente${notifications[1] === "1" ? "" : "s"}`,
        fr: `Ouvrir les notifications, ${notifications[1]} alerte${notifications[1] === "1" ? "" : "s"} en attente`,
        de: `Benachrichtigungen öffnen, ${notifications[1]} ausstehende Warnung${notifications[1] === "1" ? "" : "en"}`,
      };
      return labels[code];
    }

    const pendingSummary = text.match(/^Resumo de pendências - (.+)$/);
    if (pendingSummary) {
      const labels = { en: "Pending summary", es: "Resumen de pendientes", fr: "Résumé des éléments en attente", de: "Übersicht offener Posten" };
      return `${labels[code]} - ${pendingSummary[1]}`;
    }

    const pendingValue = text.match(/^(.+) em pendências$/);
    if (pendingValue) {
      const labels = { en: "pending", es: "pendientes", fr: "en attente", de: "offen" };
      return `${pendingValue[1]} ${labels[code]}`;
    }

    const chartSummary = text.match(/^Nos últimos 6 meses, receitas somam (.+) e despesas somam (.+)\.$/);
    if (chartSummary) {
      if (code === "en") return `Over the last 6 months, income totals ${chartSummary[1]} and expenses total ${chartSummary[2]}.`;
      if (code === "es") return `En los últimos 6 meses, los ingresos suman ${chartSummary[1]} y los gastos ${chartSummary[2]}.`;
      if (code === "fr") return `Sur les 6 derniers mois, les revenus totalisent ${chartSummary[1]} et les dépenses ${chartSummary[2]}.`;
      return `In den letzten 6 Monaten betrugen die Einnahmen ${chartSummary[1]} und die Ausgaben ${chartSummary[2]}.`;
    }

    return text;
  }

  function translateTextNode(node, language) {
    const current = node.nodeValue || "";
    const trimmed = current.trim();
    if (!trimmed) return;
    const existing = translatedTextNodes.get(node);
    let source = trimmed;
    let leading = current.slice(0, current.indexOf(trimmed));
    let trailing = current.slice(current.indexOf(trimmed) + trimmed.length);
    if (existing && current === existing.rendered) {
      ({ source, leading, trailing } = existing);
    }
    const rendered = `${leading}${translatePhrase(source, language)}${trailing}`;
    translatedTextNodes.set(node, { source, leading, trailing, rendered });
    if (current !== rendered) node.nodeValue = rendered;
  }

  function translateElementAttributes(element, language) {
    const attributeNames = ["placeholder", "title", "aria-label"];
    const records = translatedAttributes.get(element) || {};
    attributeNames.forEach((name) => {
      if (!element.hasAttribute(name)) return;
      const current = element.getAttribute(name) || "";
      const source = records[name] && current === records[name].rendered ? records[name].source : current;
      const rendered = translatePhrase(source, language);
      records[name] = { source, rendered };
      if (current !== rendered) element.setAttribute(name, rendered);
    });
    translatedAttributes.set(element, records);
  }

  function translateSubtree(root, language) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root, language);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE) return;
    translateElementAttributes(root, language);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      if (!node.parentElement?.matches("script, style, textarea")) translateTextNode(node, language);
      node = walker.nextNode();
    }
    root.querySelectorAll("[placeholder], [title], [aria-label]").forEach((element) => translateElementAttributes(element, language));
  }

  function ensureLanguageObserver() {
    if (languageObserver) return;
    languageObserver = new MutationObserver((mutations) => {
      const language = activeLanguage || preferredLanguage();
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => translateSubtree(node, language));
      });
    });
    languageObserver.observe(app, { childList: true, subtree: true });
  }

  function applyLanguage(language = preferredLanguage()) {
    activeLanguage = supportedLanguage(language);
    document.documentElement.lang = languageLocale(activeLanguage);
    translateSubtree(app, activeLanguage);
    ensureLanguageObserver();
  }

  function applyTheme(theme) {
    document.body.classList.toggle("theme-dark", theme === "dark");
    document.body.classList.toggle("theme-light", theme !== "dark");
  }

  function applyPrimaryColor(color) {
    const value = /^#[0-9a-f]{6}$/i.test(color || "") ? color : "#5b9cff";
    const red = parseInt(value.slice(1, 3), 16);
    const green = parseInt(value.slice(3, 5), 16);
    const blue = parseInt(value.slice(5, 7), 16);
    const contrast = document.body.classList.contains("theme-dark") ? "white" : "black";
    document.documentElement.style.setProperty("--nx-primary", value);
    document.documentElement.style.setProperty("--nx-primary-hover", `color-mix(in srgb, ${value} 82%, ${contrast})`);
    document.documentElement.style.setProperty("--nx-focus-ring", `0 0 0 3px color-mix(in srgb, ${value} 18%, transparent)`);
    document.documentElement.style.setProperty("--primary", value);
    document.documentElement.style.setProperty("--primary-rgb", `${red}, ${green}, ${blue}`);
    document.documentElement.style.setProperty("--primary-strong", `color-mix(in srgb, ${value} 78%, ${contrast})`);
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    toast.textContent = translatePhrase(message);
    toast.classList.add("is-visible");
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3200);
  }

  function handleConnectivity(online) {
    syncCoordinator.setOnline(Boolean(online));
  }

  window.addEventListener("online", () => handleConnectivity(true));
  window.addEventListener("offline", () => handleConnectivity(false));

  window.addEventListener("resize", () => {
    const renderer = ui.rendererForWidth?.(window.innerWidth);
    if (renderer) ui.applyLayoutMode(renderer.name);
    if (currentUser()) {
      drawMonthlyFlowChart();
      drawCashflowCharts();
      if (state.view === "profiles") renderProfileStatsChart(currentUser().profiles);
    } else {
      drawAuthChart();
    }
  });

  window.NexioApp = Object.freeze({ bootstrap, handleConnectivity });
})();
