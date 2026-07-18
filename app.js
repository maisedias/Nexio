(function () {
  "use strict";

  const STORAGE_KEY = "nexio-finance-state-v1";
  const SESSION_KEY = "nexio-session-email";
  const ONBOARDING_KEY = "nexio-onboarding-complete-v1";
  const LOCAL_USER_EMAIL = "sem-login@nexio.local";
  const incomeStatuses = ["Recebido", "Pendente", "Atrasado"];
  const expenseStatuses = ["Pago", "Pendente", "Atrasado"];
  const fabVisibleViews = new Set(["overview", "transactions", "cashflow", "goals"]);
  const categoryIconOptions = [
    "💼", "🏦", "💳", "💵", "📈", "🧾", "🏠", "🛒", "🍽️", "🚗", "⛽", "🚌",
    "❤️", "💊", "🎓", "🎮", "🎬", "✈️", "🎁", "👕", "📱", "💡", "🛠️", "⭐",
  ];
  const categoryIconByName = {
    Salário: "💼",
    Freelance: "📈",
    Alimentação: "🍽️",
    Casa: "🏠",
    Transporte: "🚗",
    Saúde: "💊",
    Lazer: "🎬",
  };
  const defaultCategories = [
    { id: "cat-salary", name: "Salário", icon: "💼" },
    { id: "cat-freelance", name: "Freelance", icon: "📈" },
    { id: "cat-food", name: "Alimentação", icon: "🍽️" },
    { id: "cat-home", name: "Casa", icon: "🏠" },
    { id: "cat-transport", name: "Transporte", icon: "🚗" },
    { id: "cat-health", name: "Saúde", icon: "💊" },
    { id: "cat-leisure", name: "Lazer", icon: "🎬" },
  ];

  const currencyLocales = {
    BRL: "pt-BR",
    USD: "en-US",
    EUR: "de-DE",
    GBP: "en-GB",
    JPY: "ja-JP",
    ARS: "es-AR",
    CLP: "es-CL",
    MXN: "es-MX",
  };

  const state = {
    store: loadStore(),
    sessionEmail: localStorage.getItem(SESSION_KEY) || "",
    authMode: "login",
    onboardingVisible: localStorage.getItem(ONBOARDING_KEY) !== "true",
    view: "overview",
    editingTransactionId: "",
    editingCategoryId: "",
    editingGoalId: "",
    editingProfileId: "",
    sidebarCollapsed: false,
    filters: {
      description: "",
      category: "all",
      dateFrom: "",
      dateTo: "",
      valueMin: "",
      valueMax: "",
      status: "all",
      sort: "date-desc",
    },
    cashflowMonth: toMonthInput(new Date()),
    cashflowRange: "month",
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
    syncTimer: 0,
    lastStatus: "Local",
  };

  const app = document.getElementById("app");
  const toast = document.getElementById("toast");
  let toastTimer = 0;
  let fabCleanup = null;
  let authMessageTimer = 0;
  let authChartAnimation = 0;
  let dashboardEntranceTimers = [];

  function loadStore() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return {
        users: Array.isArray(parsed.users) ? parsed.users : [],
      };
    } catch (error) {
      return { users: [] };
    }
  }

  function saveStore() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.store));
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
    cloud.client = window.supabase.createClient(config.url, config.anonKey);
    cloud.enabled = true;
    cloud.lastStatus = "Conectando ao Supabase";
    return true;
  }

  async function bootstrap() {
    if (!setupCloudClient()) {
      render();
      return;
    }
    try {
      const { data, error } = await cloud.client.auth.getSession();
      if (error) throw error;
      if (data.session?.user) {
        await loadCloudUserData(data.session.user);
      } else {
        cloud.ready = false;
        cloud.userId = "";
        if (isLocalSession()) {
          cloud.lastStatus = "Sem login: salvo neste aparelho";
        } else {
          state.sessionEmail = "";
          localStorage.removeItem(SESSION_KEY);
          cloud.lastStatus = "Entre para sincronizar";
        }
      }
    } catch (error) {
      cloud.lastStatus = "Falha na sincronização";
      showToast(error.message || "Não foi possível conectar ao Supabase.");
    }
    render();
  }

  function queueCloudSave() {
    const user = currentUser();
    if (!cloud.enabled || !cloud.ready || !cloud.userId || !user || isLocalOnlyUser(user)) return;
    clearTimeout(cloud.syncTimer);
    cloud.syncTimer = setTimeout(() => {
      syncCurrentUserToCloud();
    }, 700);
  }

  async function syncCurrentUserToCloud() {
    if (!cloud.enabled || !cloud.client || !cloud.userId) return;
    const user = currentUser();
    if (!user || isLocalOnlyUser(user)) return;
    try {
      cloud.lastStatus = "Sincronizando";
      updateSyncStatus();
      const payload = sanitizeUserForCloud(user);
      const { error } = await cloud.client
        .from("nexio_user_data")
        .upsert({
          user_id: cloud.userId,
          email: payload.email,
          data: payload,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
      if (error) throw error;
      cloud.lastStatus = `Sincronizado às ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
      updateSyncStatus();
    } catch (error) {
      cloud.lastStatus = "Erro ao sincronizar";
      updateSyncStatus();
      showToast(error.message || "Não consegui salvar no Supabase.");
    }
  }

  async function loadCloudUserData(authUser) {
    const email = normalizeEmail(authUser.email || "");
    if (!email) throw new Error("Conta Supabase sem e-mail.");
    cloud.userId = authUser.id;

    const localUser = state.store.users.find((user) => normalizeEmail(user.email || "") === email);
    const { data, error } = await cloud.client
      .from("nexio_user_data")
      .select("data")
      .eq("user_id", authUser.id)
      .maybeSingle();
    if (error) throw error;

    let nextUser = data?.data?.email ? data.data : null;
    if (nextUser) {
      nextUser.email = email;
      ensureUserShape(nextUser);
      if (localUser) mergeImportedUser(nextUser, sanitizeUserForCloud(localUser));
    } else {
      nextUser = localUser ? sanitizeUserForCloud(localUser) : createUserFromCloudAuth(authUser);
    }

    upsertStoreUser(nextUser);
    cloud.ready = true;
    await syncCurrentUserToCloud();
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
      activeProfileId: profile.id,
      profiles: [profile],
    };
  }

  function sanitizeUserForCloud(user) {
    const clone = JSON.parse(JSON.stringify(user));
    clone.email = normalizeEmail(clone.email || state.sessionEmail);
    delete clone.password;
    ensureUserShape(clone);
    return clone;
  }

  function upsertStoreUser(user) {
    user.email = normalizeEmail(user.email || state.sessionEmail);
    ensureUserShape(user);
    const index = state.store.users.findIndex((item) => normalizeEmail(item.email || "") === user.email);
    if (index >= 0) {
      state.store.users[index] = user;
    } else {
      state.store.users.push(user);
    }
    state.sessionEmail = user.email;
    localStorage.setItem(SESSION_KEY, user.email);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.store));
  }

  function updateSyncStatus() {
    const status = app.querySelector("[data-sync-status]");
    if (!status) return;
    status.textContent = isLocalOnlyUser() ? "Sem login: salvo neste aparelho" : cloud.lastStatus;
  }

  function uid(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function currentUser() {
    return state.store.users.find((user) => normalizeEmail(user.email || "") === normalizeEmail(state.sessionEmail || "")) || null;
  }

  function isLocalSession() {
    return normalizeEmail(state.sessionEmail || "") === LOCAL_USER_EMAIL;
  }

  function isLocalOnlyUser(user = currentUser()) {
    return Boolean(user?.localOnly || normalizeEmail(user?.email || "") === LOCAL_USER_EMAIL);
  }

  function currentProfile() {
    const user = currentUser();
    if (!user) return null;
    return user.profiles.find((profile) => profile.id === user.activeProfileId) || user.profiles[0] || null;
  }

  function ensureUserShape(user) {
    user.name = user.name || "Usuário Nexio";
    user.theme = user.theme || "dark";
    user.currency = user.currency || "BRL";
    user.primaryColor = user.primaryColor || "#5b9cff";
    user.avatar = user.avatar || "";
    user.settings = {
      confirmCriticalActions: true,
      autoLock: false,
      dueDateAlerts: true,
      goalAlerts: true,
      monthlySummary: true,
      ...(user.settings || {}),
    };
    user.profiles = Array.isArray(user.profiles) ? user.profiles : [];
    if (!user.profiles.length) {
      const profile = createProfile("Principal");
      user.profiles.push(profile);
      user.activeProfileId = profile.id;
    }
    user.profiles.forEach(ensureProfileShape);
    if (!user.profiles.some((profile) => profile.id === user.activeProfileId)) {
      user.activeProfileId = user.profiles[0].id;
    }
  }

  function ensureProfileShape(profile) {
    profile.name = profile.name || "Principal";
    profile.transactions = Array.isArray(profile.transactions) ? profile.transactions : [];
    profile.categories = Array.isArray(profile.categories) && profile.categories.length
      ? profile.categories
      : defaultCategories.map((category) => ({ ...category, id: uid("cat") }));
    profile.categories.forEach((category) => {
      if (categoryIconByName[category.name] && /^[A-Z+*?]$/.test(category.icon || "")) {
        category.icon = categoryIconByName[category.name];
      }
    });
    profile.goals = Array.isArray(profile.goals) ? profile.goals : [];
    profile.goals.forEach((goal) => ensureGoalShape(goal, profile));
    profile.imports = Array.isArray(profile.imports) ? profile.imports : [];
  }

  function ensureGoalShape(goal, profile = currentProfile()) {
    goal.id = goal.id || uid("goal");
    goal.name = goal.name || "Meta";
    goal.target = Number(goal.target || 0);
    goal.saved = Number(goal.saved || 0);
    goal.history = normalizeGoalHistory(goal, profile);
    goal.reminders = Array.isArray(goal.reminders) ? goal.reminders : [];
  }

  function normalizeGoalHistory(goal, profile = currentProfile()) {
    const rawHistory = Array.isArray(goal.history) ? goal.history : [];
    const normalized = rawHistory
      .filter((entry) => entry && (entry.tipo || entry.type || Number(entry.valor ?? entry.amount ?? 0) !== 0))
      .map((entry) => normalizeGoalMovement(entry, goal, profile));
    if (!normalized.length && Number(goal.saved || 0) > 0) {
      normalized.push(createGoalMovement({
        tipo: "entrada",
        valor: Number(goal.saved || 0),
        goal,
        profile,
        observacao: "Saldo inicial",
        destino: "Meta",
      }));
    }
    return normalized;
  }

  function normalizeGoalMovement(entry, goal, profile = currentProfile()) {
    const signedAmount = Number(entry.amount ?? entry.valor ?? 0);
    const valor = Math.abs(Number(entry.valor ?? entry.amount ?? 0));
    const tipo = normalizeGoalMovementType(entry.tipo || entry.type || (signedAmount < 0 ? "retirada" : "entrada"));
    const createdAt = entry.criado_em || entry.updatedAt || entry.createdAt || entry.date || new Date().toISOString();
    const createdDate = new Date(createdAt);
    const safeDate = Number.isNaN(createdDate.valueOf()) ? new Date() : createdDate;
    const movement = {
      id: entry.id || uid("goal-move"),
      tipo,
      valor,
      data: entry.data || toDateInput(safeDate),
      hora: entry.hora || safeDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      meta_origem: entry.meta_origem || goal.id,
      meta_destino: entry.meta_destino || "",
      perfil_destino: entry.perfil_destino || "",
      destino: entry.destino || "",
      justificativa: entry.justificativa || "",
      observacao: entry.observacao || entry.note || "Depósito manual",
      usuario_perfil: entry.usuario_perfil || profile?.name || "",
      criado_em: createdAt,
      atualizado_em: entry.atualizado_em || entry.updatedAt || createdAt,
      amount: entry.amount ?? (tipo === "entrada" || tipo === "transferencia_recebida" ? valor : -valor),
      date: entry.date || createdAt,
      note: entry.note || entry.observacao || goalMovementTypeLabel(tipo),
    };
    return movement;
  }

  function normalizeGoalMovementType(type) {
    const value = normalizeText(type).replace(/\s+/g, "_");
    if (["withdraw", "saida", "saída", "retirada"].includes(value)) return "retirada";
    if (["transfer_out", "transferencia", "transferência", "transferencia_enviada", "transferência_enviada"].includes(value)) return "transferencia_enviada";
    if (["transfer_in", "transferencia_recebida", "transferência_recebida"].includes(value)) return "transferencia_recebida";
    return "entrada";
  }

  function goalMovementTypeLabel(tipo) {
    const labels = {
      entrada: "Entrada",
      retirada: "Retirada",
      transferencia_enviada: "Transferencia enviada",
      transferencia_recebida: "Transferencia recebida",
    };
    return labels[normalizeGoalMovementType(tipo)] || "Movimentacao";
  }

  function createGoalMovement({ tipo, valor, goal, profile, destino = "", justificativa = "", observacao = "", metaDestino = "", perfilDestino = "", data = "" }) {
    const now = data ? parseLocalDate(data) : new Date();
    const timestamp = Number.isNaN(now.valueOf()) ? new Date() : now;
    const movementType = normalizeGoalMovementType(tipo);
    const signedAmount = movementType === "entrada" || movementType === "transferencia_recebida" ? Number(valor || 0) : -Number(valor || 0);
    return {
      id: uid("goal-move"),
      tipo: movementType,
      valor: Number(valor || 0),
      data: toDateInput(timestamp),
      hora: timestamp.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      meta_origem: goal?.id || "",
      meta_destino: metaDestino || "",
      perfil_destino: perfilDestino || "",
      destino,
      justificativa,
      observacao: observacao || goalMovementTypeLabel(movementType),
      usuario_perfil: profile?.name || "",
      criado_em: timestamp.toISOString(),
      atualizado_em: new Date().toISOString(),
      amount: signedAmount,
      date: timestamp.toISOString(),
      note: observacao || goalMovementTypeLabel(movementType),
    };
  }

  function createProfile(name) {
    return {
      id: uid("profile"),
      name,
      categories: defaultCategories.map((category) => ({ ...category, id: uid("cat") })),
      transactions: [],
      goals: [],
      imports: [],
    };
  }

  function localUser() {
    let user = state.store.users.find((item) => normalizeEmail(item.email || "") === LOCAL_USER_EMAIL);
    if (!user) {
      const profile = createProfile("Finanças");
      user = {
        id: uid("local-user"),
        name: "Sem login",
        email: LOCAL_USER_EMAIL,
        localOnly: true,
        theme: "dark",
        currency: "BRL",
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
    try {
      if (cloud.enabled && cloud.client) await cloud.client.auth.signOut();
    } catch (error) {
      console.debug("Sessão Supabase não precisava ser encerrada.", error);
    }
    cloud.ready = false;
    cloud.userId = "";
    cloud.lastStatus = "Sem login: salvo neste aparelho";
    const user = localUser();
    state.sessionEmail = user.email;
    localStorage.setItem(SESSION_KEY, user.email);
    saveStore();
    showToast("Modo sem login ativado.");
    render();
  }

  function render() {
    const user = currentUser();
    if (!user) {
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
        balance.textContent = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(target * eased);
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    } else if (balance) {
      balance.textContent = "R$ 12.840,00";
    }

    const showOnboardingScreen = (name) => {
      const shell = app.querySelector(".onboarding-shell");
      shell?.classList.toggle("is-goal-step", name === "goal");
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
      localStorage.setItem("nexio-onboarding-goal-v1", event.currentTarget.dataset.selectedGoal || "Outro");
      showOnboardingScreen("balance");
      window.setTimeout(() => app.querySelector("#onboardingInitialBalance")?.focus(), prefersReducedMotion() ? 0 : 560);
    });
    app.querySelector("[data-onboarding-balance-back]")?.addEventListener("click", () => showOnboardingScreen("goal"));

    const balanceInput = app.querySelector("#onboardingInitialBalance");
    balanceInput?.addEventListener("input", () => {
      const digits = balanceInput.value.replace(/\D/g, "").slice(0, 14);
      const amount = Number(digits || 0) / 100;
      balanceInput.value = amount ? new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount) : "";
      const preview = app.querySelector("[data-wallet-preview]");
      if (preview) {
        preview.textContent = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);
        preview.classList.remove("is-updating");
        void preview.offsetWidth;
        preview.classList.add("is-updating");
      }
    });

    app.querySelector("[data-onboarding-balance-continue]")?.addEventListener("click", () => {
      const digits = balanceInput?.value.replace(/\D/g, "") || "0";
      localStorage.setItem("nexio-onboarding-balance-v1", String(Number(digits) / 100));
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
      localStorage.setItem("nexio-onboarding-import-v1", event.currentTarget.dataset.importChoice || "Importar depois");
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
      if (valuePreview) valuePreview.textContent = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount);
      if (deadlinePreview) deadlinePreview.textContent = firstGoalDeadline?.value ? new Date(`${firstGoalDeadline.value}T12:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).replace(".", "") : "Defina um prazo";
      if (fill) fill.style.width = `${percent}%`;
      if (marker) marker.style.left = `${percent}%`;
      if (percentLabel) percentLabel.textContent = `${percent}%`;
    };
    firstGoalName?.addEventListener("input", updateFirstGoalPreview);
    firstGoalDeadline?.addEventListener("input", updateFirstGoalPreview);
    firstGoalValue?.addEventListener("input", () => {
      const digits = firstGoalValue.value.replace(/\D/g, "").slice(0, 14);
      const amount = Number(digits || 0) / 100;
      firstGoalValue.value = amount ? new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount) : "";
      updateFirstGoalPreview();
    });

    app.querySelector("[data-onboarding-first-goal-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      const amount = Number(firstGoalValue?.value.replace(/\D/g, "") || 0) / 100;
      if (!firstGoalName?.value.trim() || amount <= 0 || !firstGoalDeadline?.value) return;
      localStorage.setItem("nexio-onboarding-first-goal-v1", JSON.stringify({ name: firstGoalName.value.trim(), target: amount, deadline: firstGoalDeadline.value }));
      showOnboardingScreen("complete");
    });

    app.querySelector("[data-enter-nexio]")?.addEventListener("click", () => {
      const user = localUser();
      const profile = user.profiles.find((item) => item.id === user.activeProfileId) || user.profiles[0];
      const initialBalance = Number(localStorage.getItem("nexio-onboarding-balance-v1") || 0);
      const firstGoal = JSON.parse(localStorage.getItem("nexio-onboarding-first-goal-v1") || "null");
      if (initialBalance > 0 && !profile.transactions.some((item) => item.onboardingOpeningBalance)) {
        const incomeCategory = profile.categories.find((category) => normalizeText(category.name).includes("salario")) || profile.categories[0];
        profile.transactions.push({ id: uid("trx"), type: "income", description: "Saldo inicial", amount: initialBalance, date: toDateInput(new Date()), categoryId: incomeCategory?.id || "", status: "Recebido", onboardingOpeningBalance: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      }
      if (firstGoal?.name && firstGoal?.target && firstGoal?.deadline && !profile.goals.some((goal) => goal.onboardingFirstGoal)) {
        profile.goals.push({ id: uid("goal"), name: firstGoal.name, target: Number(firstGoal.target), saved: 0, deadline: firstGoal.deadline, theme: "blue", reminders: [], history: [], onboardingFirstGoal: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      }
      localStorage.setItem(ONBOARDING_KEY, "true");
      state.onboardingVisible = false;
      state.sessionEmail = user.email;
      localStorage.setItem(SESSION_KEY, user.email);
      saveStore();
      app.querySelector(".onboarding-shell")?.classList.add("is-entering-dashboard");
      window.setTimeout(() => {
        document.body.classList.remove("onboarding-active");
        render();
      }, prefersReducedMotion() ? 0 : 720);
    });
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

    if (state.authMode === "register") {
      if (state.store.users.some((user) => user.email === email)) {
        showToast("Já existe uma conta com esse e-mail.");
        return;
      }
      const profile = createProfile("Principal");
      state.store.users.push({
        id: uid("user"),
        name: name || "Usuário Nexio",
        email,
        password,
        theme: "dark",
        currency: "BRL",
        activeProfileId: profile.id,
        profiles: [profile],
      });
      state.sessionEmail = email;
      localStorage.setItem(SESSION_KEY, email);
      saveStore();
      showToast("Conta criada.");
      render();
      return;
    }

    const user = state.store.users.find((item) => normalizeEmail(item.email || "") === email && item.password === password);
    if (!user) {
      showToast("E-mail ou senha não encontrados.");
      return;
    }
    state.sessionEmail = email;
    localStorage.setItem(SESSION_KEY, email);
    showToast("Login realizado.");
    render();
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
        showToast("Conta criada e sincronizada.");
        render();
        return;
      }

      const { data, error } = await cloud.client.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await loadCloudUserData(data.user);
      showToast("Login realizado e dados sincronizados.");
      render();
    } catch (error) {
      showToast(error.message || "Não foi possível acessar pelo Supabase.");
    }
  }

  function renderDashboard() {
    const user = currentUser();
    const profile = currentProfile();
    if (!user || !profile) return;
    applyTheme(user.theme);
    applyPrimaryColor(user.primaryColor);
    app.innerHTML = "";
    app.append(document.getElementById("dashboard-template").content.cloneNode(true));
    app.querySelector(".app-shell")?.classList.toggle("sidebar-is-collapsed", state.sidebarCollapsed);
    renderIcons();

    app.querySelector("[data-active-profile-label]").textContent = profile.name;
    updateTopbarContext();
    bindNavigation();
    bindTopbar();
    bindFloatingActionButton();
    bindTransactionForm();
    bindCategoryForm();
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
    const name = (user?.name || "Nexio").split(" ")[0];
    const initials = initialsFrom(user?.name || profile?.name || "NX");
    const today = formatLongDate(now);

    const greetingLabel = app.querySelector("[data-greeting-label]");
    if (greetingLabel) greetingLabel.textContent = `${greeting}, ${name}`;
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
      if (cloud.enabled) {
        await cloud.client.auth.signOut();
        cloud.ready = false;
        cloud.userId = "";
        cloud.lastStatus = "Sessão encerrada";
      }
      state.sessionEmail = "";
      localStorage.removeItem(SESSION_KEY);
      state.view = "overview";
      showToast("Sessão encerrada.");
      render();
    });
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
    app.querySelector("[data-quick-transaction]").addEventListener("click", () => {
      setView("transactions");
      resetTransactionForm();
      app.querySelector("#transactionDescription").focus();
    });
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
    app.querySelector("[data-notification-read-all]")?.addEventListener("click", () => {
      app.querySelectorAll(".notification-center-item.is-unread").forEach((item) => item.classList.remove("is-unread"));
      const badge = app.querySelector("[data-notification-count]");
      if (badge) badge.textContent = "0";
      showToast("Notificações marcadas como lidas.");
    });
    app.querySelector("[data-notification-list]")?.addEventListener("click", (event) => {
      const action = event.target.closest("[data-notification-view]");
      if (!action) return;
      closeNotificationCenter();
      if (action.dataset.notificationView === "pendencies") showCurrentMonthPendencies();
      else setView(action.dataset.notificationView);
    });
    app.querySelector("[data-notification-center]")?.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      closeNotificationCenter();
      app.querySelector("[data-notification-button]")?.focus();
    });
  }

  function openNotificationCenter() {
    const panel = app.querySelector("[data-notification-center]");
    const backdrop = app.querySelector(".notification-center-backdrop");
    const button = app.querySelector("[data-notification-button]");
    if (!panel || !backdrop) return;
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
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const sameDay = (value, reference) => {
      const date = parseLocalDate(String(value || "").slice(0, 10));
      return !Number.isNaN(date.valueOf()) && date.toDateString() === reference.toDateString();
    };
    const notifications = [];
    const openTransactions = currentMonthOpenTransactions(profile).sort((a, b) => String(a.date).localeCompare(String(b.date)));
    openTransactions.slice(0, 3).forEach((transaction) => {
      const days = daysUntil(transaction.date);
      notifications.push({
        group: days <= 1 ? "Hoje" : "Esta semana",
        tone: days < 0 ? "danger" : "warning",
        icon: days < 0 ? "circle-alert" : "calendar-clock",
        title: days < 0 ? "Conta em atraso" : days === 1 ? "Conta vence amanhã" : "Vencimento próximo",
        description: `${transaction.description} · ${money(Math.abs(Number(transaction.amount || 0)))}`,
        time: days < 0 ? `${Math.abs(days)}d em atraso` : days === 0 ? "Hoje" : `em ${days}d`,
        action: "pendencies",
        actionLabel: "Revisar",
      });
    });
    [...profile.transactions].sort((a, b) => String(b.createdAt || b.date).localeCompare(String(a.createdAt || a.date))).slice(0, 4).forEach((transaction) => {
      const created = transaction.createdAt || transaction.date;
      const isIncome = transaction.type === "income";
      const isSettledIncome = isIncome && transaction.status === "Recebido";
      notifications.push({
        group: sameDay(created, today) ? "Hoje" : sameDay(created, yesterday) ? "Ontem" : "Esta semana",
        tone: isIncome ? "income" : "neutral",
        icon: isIncome ? "circle-dollar-sign" : "receipt-text",
        title: isSettledIncome ? "Receita recebida" : isIncome ? "Receita registrada" : "Movimentação registrada",
        description: `${transaction.description} · ${money(Math.abs(Number(transaction.amount || 0)))}`,
        time: sameDay(created, today) ? "agora" : sameDay(created, yesterday) ? "ontem" : "recente",
        action: "transactions",
        actionLabel: "Ver",
      });
    });
    const mainGoal = [...profile.goals].filter((goal) => Number(goal.target || 0) > 0).sort((a, b) => (Number(b.saved || 0) / Number(b.target || 1)) - (Number(a.saved || 0) / Number(a.target || 1)))[0];
    if (mainGoal) {
      const progress = Math.min(Math.round((Number(mainGoal.saved || 0) / Number(mainGoal.target || 1)) * 100), 100);
      notifications.push({ group: "Esta semana", tone: "goal", icon: "target", title: "Meta atualizada", description: `${mainGoal.name} chegou a ${progress}% do objetivo.`, time: "esta semana", action: "goals", actionLabel: "Acompanhar" });
    }
    notifications.push({ group: "Esta semana", tone: "system", icon: "cloud-check", title: cloud.ready ? "Backup realizado" : "Dados salvos neste dispositivo", description: cloud.ready ? "Suas informações foram sincronizadas com segurança." : "A Nexio mantém uma cópia local atualizada.", time: cloud.ready ? "sincronizado" : "local", action: "settings", actionLabel: "Detalhes" });

    const groups = ["Hoje", "Ontem", "Esta semana"];
    list.innerHTML = groups.map((group) => {
      const items = notifications.filter((item) => item.group === group);
      if (!items.length) return "";
      return `<section class="notification-center-group"><h3>${group}<span>${items.length}</span></h3>${items.map((item) => `
        <article class="notification-center-item is-unread tone-${item.tone}">
          <span class="notification-item-icon"><i data-lucide="${item.icon}" aria-hidden="true"></i></span>
          <div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.description)}</p><small>${escapeHtml(item.time)}</small></div>
          <button class="ghost-action" data-notification-view="${item.action}" type="button">${item.actionLabel}</button>
        </article>`).join("")}</section>`;
    }).join("");
    window.lucide?.createIcons();
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
    fabCleanup = () => {
      document.removeEventListener("click", handleDocumentClick);
      document.removeEventListener("keydown", handleKeydown);
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
    const isVisible = fabVisibleViews.has(state.view);
    dial.hidden = !isVisible;
    dial.classList.toggle("is-visible", isVisible);
    app.querySelector(".app-shell")?.classList.toggle("has-fab", isVisible);
    if (!isVisible) setFabMenuOpen(false);
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
    const enteringTransactions = view === "transactions" && state.view !== "transactions";
    state.view = view;
    const titleMap = {
      overview: "Visão geral",
      transactions: "Transações",
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
    if (enteringTransactions) resetTransactionsMonthToCurrent();
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
    populateStatusSelects();
    updateOverview();
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
  }

  function updateOverdueTransactions(profile) {
    let changed = false;
    profile.transactions.forEach((transaction) => {
      if (applyAutomaticOverdueStatus(transaction)) changed = true;
    });
    return changed;
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
        id: id || uid("trx"),
        type,
        description: app.querySelector("#transactionDescription").value.trim(),
        amount: Number(app.querySelector("#transactionAmount").value),
        date: app.querySelector("#transactionDate").value,
        categoryId: app.querySelector("#transactionCategory").value,
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

      if (!transaction.description || !transaction.amount || !transaction.date || !transaction.categoryId) {
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
        const groupId = uid("parcelas");
        for (let number = 1; number <= count; number += 1) {
          const installment = {
            ...transaction,
            id: uid("trx"),
            description: `${transaction.description} (${number}/${count})`,
            date: addMonthsToDate(transaction.date, number - 1),
            status: transaction.status === "Atrasado" ? "Pendente" : transaction.status,
            installmentGroupId: groupId,
            installmentNumber: number,
            installmentTotal: count,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          applyAutomaticOverdueStatus(installment);
          profile.transactions.push(installment);
        }
        showToast(`${count} parcelas lançadas.`);
      } else {
        profile.transactions.push(transaction);
        showToast("Transação salva.");
      }
      saveStore();
      resetTransactionForm();
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
    if (!transaction || transaction.status !== "Pendente" || !transaction.date) return false;
    if (!isPendingOverdue(transaction.date)) return false;
    transaction.status = "Atrasado";
    transaction.updatedAt = new Date().toISOString();
    return true;
  }

  function isPendingOverdue(date) {
    const today = parseLocalDate(toDateInput(new Date()));
    const launchDate = parseLocalDate(date);
    return Math.floor((today - launchDate) / 86400000) > 0;
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
    const date = parseLocalDate(value);
    const day = date.getDate();
    const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
    const maxDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
    target.setDate(Math.min(day, maxDay));
    return toDateInput(target);
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
    app.querySelector("#categoryName")?.focus();
    app.querySelector("#categoryForm")?.scrollIntoView({ behavior: "smooth", block: "center" });
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

    const month = app.querySelector("#cashflowMonth");
    month.value = state.cashflowMonth;
    month.addEventListener("change", () => {
      state.cashflowMonth = month.value || toMonthInput(new Date());
      state.cashflowRange = "custom";
      syncCashflowRangeButtons();
      drawCashflowCharts();
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

  function bindSettingsForm() {
    app.querySelector("#settingsForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const user = currentUser();
      const profile = currentProfile();
      profile.name = app.querySelector("#settingsProfileName").value.trim() || profile.name;
      user.name = app.querySelector("#settingsUserName").value.trim() || user.name;
      user.theme = app.querySelector("#settingsTheme").value;
      user.currency = app.querySelector("#settingsCurrency").value;
      user.primaryColor = app.querySelector("#settingsPrimaryColor")?.value || user.primaryColor;
      app.querySelectorAll("[data-setting-toggle]").forEach((toggle) => {
        user.settings[toggle.dataset.settingToggle] = toggle.checked;
      });
      saveStore();
      showToast("Configurações salvas.");
      renderDashboard();
      setView("settings");
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
      saveStore();
      showToast("Dados do perfil limpos.");
      refreshAll();
    });
  }

  function exportCurrentUserData() {
    const user = currentUser();
    if (!user) return;
    const box = app.querySelector("[data-export-box]");
    const payload = JSON.stringify(buildExportUser(user), null, 2);
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
    const exported = JSON.parse(JSON.stringify(user));
    ensureUserShape(exported);
    exported.profiles.forEach((profile) => {
      ensureProfileShape(profile);
      profile.goals = profile.goals.map((goal) => {
        ensureGoalShape(goal, profile);
        return {
          ...goal,
          estatisticas: goalHistoryStats(goal, profile),
          historico_movimentacoes: goalHistoryEntries(goal, profile),
        };
      });
    });
    exported.exportedAt = new Date().toISOString();
    exported.exportVersion = "nexio-goals-history-v1";
    return exported;
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
    const imported = JSON.parse(await file.text());
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
    localStorage.setItem(SESSION_KEY, imported.email);
    saveStore();
    showToast("Dados JSON mesclados.");
    render();
  }

  function mergeImportedUser(target, imported) {
    ensureUserShape(target);
    ensureUserShape(imported);
    target.name = target.name || imported.name;
    target.theme = target.theme || imported.theme;
    target.currency = target.currency || imported.currency;
    imported.profiles.forEach((incomingProfile) => {
      ensureProfileShape(incomingProfile);
      let targetProfile = target.profiles.find((profile) => profile.id === incomingProfile.id);
      if (!targetProfile) {
        targetProfile = target.profiles.find((profile) => normalizeText(profile.name) === normalizeText(incomingProfile.name));
      }
      if (!targetProfile) {
        target.profiles.push(incomingProfile);
        return;
      }
      ensureProfileShape(targetProfile);
      mergeUniqueBy(targetProfile.categories, incomingProfile.categories, (item) => normalizeText(item.name));
      mergeUniqueBy(targetProfile.transactions, incomingProfile.transactions, (item) => item.id || `${item.date}|${item.description}|${item.amount}|${item.status}`);
      mergeUniqueBy(targetProfile.goals, incomingProfile.goals, (item) => item.id || normalizeText(item.name));
      mergeUniqueBy(targetProfile.imports, incomingProfile.imports, (item) => item.id || `${item.sourceName}|${item.importedAt}`);
    });
    if (!target.profiles.some((profile) => profile.id === target.activeProfileId)) {
      target.activeProfileId = target.profiles[0]?.id;
    }
  }

  function mergeUniqueBy(targetList, incomingList, keyFn) {
    const keys = new Set(targetList.map(keyFn).filter(Boolean));
    incomingList.forEach((item) => {
      const key = keyFn(item);
      if (key && keys.has(key)) return;
      targetList.push(item);
      if (key) keys.add(key);
    });
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
    const clean = text.replace(/^\uFEFF/, "");
    const delimiter = detectDelimiter(clean);
    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;
    for (let index = 0; index < clean.length; index += 1) {
      const char = clean[index];
      const next = clean[index + 1];
      if (char === '"' && quoted && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = !quoted;
      } else if (char === delimiter && !quoted) {
        row.push(cell.trim());
        cell = "";
      } else if ((char === "\n" || char === "\r") && !quoted) {
        if (char === "\r" && next === "\n") index += 1;
        row.push(cell.trim());
        if (row.some(Boolean)) rows.push(row);
        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }
    row.push(cell.trim());
    if (row.some(Boolean)) rows.push(row);
    return rows;
  }

  function detectDelimiter(text) {
    const firstLine = text.split(/\r?\n/).find((line) => line.trim()) || "";
    const candidates = [";", ",", "\t", "|"];
    return candidates
      .map((delimiter) => ({ delimiter, count: firstLine.split(delimiter).length }))
      .sort((a, b) => b.count - a.count)[0].delimiter;
  }

  function transactionsFromTableRows(rows) {
    if (!rows.length) return [];
    const headerIndex = findHeaderRow(rows);
    const headers = rows[headerIndex].map(canonicalHeader);
    const dataRows = rows.slice(headerIndex + 1);
    return dataRows.map((row) => transactionFromRow(row, headers)).filter(Boolean);
  }

  function findHeaderRow(rows) {
    let best = 0;
    let score = -1;
    rows.slice(0, 8).forEach((row, index) => {
      const rowScore = row.map(canonicalHeader).filter((header) => header !== "ignore").length;
      if (rowScore > score) {
        best = index;
        score = rowScore;
      }
    });
    return score > 0 ? best : 0;
  }

  function transactionFromRow(row, headers) {
    const valueByHeader = {};
    headers.forEach((header, index) => {
      if (header !== "ignore" && row[index] !== undefined && row[index] !== "") valueByHeader[header] = row[index];
    });
    if (!Object.keys(valueByHeader).length && row.length >= 3) {
      valueByHeader.date = row[0];
      valueByHeader.description = row[1];
      valueByHeader.amount = row[2];
    }

    const incomeAmount = parseImportedNumber(valueByHeader.incomeAmount);
    const expenseAmount = parseImportedNumber(valueByHeader.expenseAmount);
    let amount = parseImportedNumber(valueByHeader.amount);
    let type = inferTransactionType(valueByHeader.type, valueByHeader.status, amount);
    if (incomeAmount) {
      amount = incomeAmount;
      type = "income";
    }
    if (expenseAmount) {
      amount = expenseAmount;
      type = "expense";
    }
    if (!amount) return null;
    const date = parseImportedDate(valueByHeader.date);
    if (!date) return null;
    if (amount < 0) {
      type = "expense";
      amount = Math.abs(amount);
    }
    return {
      type,
      description: cleanImportedText(valueByHeader.description || valueByHeader.memo || "Transação importada"),
      amount,
      date,
      category: cleanImportedText(valueByHeader.category || "Importado"),
      status: cleanImportedText(valueByHeader.status || ""),
      installmentNumber: parseInteger(valueByHeader.installmentNumber),
      installmentTotal: parseInteger(valueByHeader.installmentTotal),
    };
  }

  function canonicalHeader(value) {
    const key = normalizeText(value);
    if (["descricao", "description", "historico", "lancamento", "transacao", "detalhes", "memo"].some((item) => key.includes(item))) return "description";
    if (["valor", "amount", "total", "quantia", "value"].some((item) => key === item || key.includes(item))) return "amount";
    if (["data", "date", "vencimento", "dt"].some((item) => key === item || key.includes(item))) return "date";
    if (["categoria", "category", "grupo"].some((item) => key.includes(item))) return "category";
    if (["status", "situacao"].some((item) => key.includes(item))) return "status";
    if (["tipo", "type", "natureza", "movimento"].some((item) => key.includes(item))) return "type";
    if (["total parcelas", "qtd parcelas", "qtde parcelas", "quantidade parcelas", "parcelas"].some((item) => key.includes(item))) return "installmentTotal";
    if (["parcela", "n parcela", "numero parcela", "num parcela"].some((item) => key.includes(item))) return "installmentNumber";
    if (["entrada", "entradas", "receita", "receitas", "credito", "credit"].some((item) => key === item || key.includes(item))) return "incomeAmount";
    if (["saida", "saidas", "despesa", "despesas", "debito", "debit"].some((item) => key === item || key.includes(item))) return "expenseAmount";
    return "ignore";
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
    const pdfjsLib = await import("./assets/pdf.min.mjs");
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
    if (value === undefined || value === null || value === "") return "";
    if (!Number.isNaN(Number(value)) && Number(value) > 20000) {
      const date = new Date(Math.round((Number(value) - 25569) * 86400 * 1000));
      return toDateInput(new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    }
    const text = String(value).trim();
    const iso = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
    const local = text.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/);
    if (local) {
      const year = local[3].length === 2 ? `20${local[3]}` : local[3];
      return `${year}-${local[2].padStart(2, "0")}-${local[1].padStart(2, "0")}`;
    }
    const parsed = new Date(text);
    return Number.isNaN(parsed.getTime()) ? "" : toDateInput(parsed);
  }

  function parseImportedNumber(value) {
    if (value === undefined || value === null || value === "") return 0;
    if (typeof value === "number") return value;
    let text = String(value).trim();
    const negative = /^-/.test(text) || /^\(.*\)$/.test(text);
    text = text.replace(/[^\d,.-]/g, "");
    const lastComma = text.lastIndexOf(",");
    const lastDot = text.lastIndexOf(".");
    if (lastComma > -1 && lastDot > -1) {
      text = lastComma > lastDot ? text.replace(/\./g, "").replace(",", ".") : text.replace(/,/g, "");
    } else if (lastComma > -1) {
      text = text.replace(/\./g, "").replace(",", ".");
    } else {
      text = text.replace(/,/g, "");
    }
    const number = Number(text);
    if (Number.isNaN(number)) return 0;
    return negative ? -Math.abs(number) : number;
  }

  function parseInteger(value) {
    const number = Number(String(value || "").replace(/\D/g, ""));
    return Number.isFinite(number) ? number : 0;
  }

  function inferTransactionType(typeText, statusText, amount) {
    const text = normalizeText(`${typeText || ""} ${statusText || ""}`);
    if (["despesa", "saida", "debito", "debit", "expense", "pago"].some((item) => text.includes(item))) return "expense";
    if (["receita", "entrada", "credito", "credit", "income", "recebido"].some((item) => text.includes(item))) return "income";
    return Number(amount) < 0 ? "expense" : "income";
  }

  function normalizeImportedStatus(status, type) {
    const key = normalizeText(status);
    const allowed = type === "income" ? incomeStatuses : expenseStatuses;
    const match = allowed.find((item) => normalizeText(item) === key);
    return match || (type === "income" ? "Recebido" : "Pago");
  }

  function fileExtension(name) {
    return String(name || "").split(".").pop().toLowerCase();
  }

  function cleanImportedText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function normalizeText(value) {
    return cleanImportedText(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
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
    const settledMonthTransactions = monthTransactions.filter(isSettledTransaction);
    const pendingMonthTransactions = monthTransactions.filter(isOpenTransaction);
    const monthIncome = sum(settledMonthTransactions.filter((item) => item.type === "income"), "amount");
    const monthExpense = sum(settledMonthTransactions.filter((item) => item.type === "expense"), "amount");
    const pendingIncome = sum(pendingMonthTransactions.filter((item) => item.type === "income"), "amount");
    const pendingExpense = sum(pendingMonthTransactions.filter((item) => item.type === "expense"), "amount");
    const pendingImpact = pendingIncome - pendingExpense;
    const balance = calculateBalance(profile.transactions);
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
    updateNotificationBadge(pendingMonthTransactions.length);
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
            <div class="list-meta">${escapeHtml(category.name)} · ${friendlyTransactionDate(transaction.date)}</div>
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
      }));

      const row = document.createElement("tr");
      row.className = "table-empty-row";
      const cell = document.createElement("td");
      cell.className = "table-empty-cell";
      cell.colSpan = 7;
      cell.append(emptyState({
        icon: "receipt-text",
        title: "Nenhuma movimentação registrada.",
        description: "Cadastre sua primeira receita ou despesa para começar seu controle financeiro.",
        actionLabel: "Nova Transação",
        action: openTransactionComposer,
      }));
      row.append(cell);
      tbody.append(row);
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
        <button class="icon-button" data-duplicate-transaction="${transaction.id}" type="button" aria-label="Duplicar transação ${escapeHtml(transaction.description)}" title="Duplicar"><i data-lucide="copy" aria-hidden="true"></i></button>
        <button class="icon-button" data-delete-transaction="${transaction.id}" type="button" aria-label="Excluir transação ${escapeHtml(transaction.description)}" title="Excluir"><i data-lucide="trash-2" aria-hidden="true"></i></button>
      </div>
    `;
  }

  function transactionSubtitle(transaction) {
    return transaction.installmentGroupId
      ? `Parcela ${transaction.installmentNumber || 1}/${transaction.installmentTotal || 1}`
      : (transaction.type === "income" ? "Receita avulsa" : "Despesa avulsa");
  }

  function transactionShortDate(value) {
    const date = parseLocalDate(value);
    if (Number.isNaN(date.valueOf())) return "Sem data";
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");
  }

  function statusBadge(transaction) {
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
      const weekday = date.toLocaleDateString("pt-BR", { weekday: "long" });
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
            <div><span>Parcelamento</span><strong>${transaction.installmentGroupId ? `${transaction.installmentNumber || 1} de ${transaction.installmentTotal || 1}` : "À vista"}</strong></div>
            <div><span>Banco</span><strong>${escapeHtml(bank.name || "Não informado")}</strong></div>
            <div><span>Data</span><strong>${friendlyTransactionDate(transaction.date)}</strong></div>
          </section>
        </div>
        <footer class="transaction-detail-actions">
          <button class="primary-action" data-detail-edit type="button"><i data-lucide="pencil" aria-hidden="true"></i><span>Editar</span></button>
          <button class="ghost-action" data-detail-duplicate type="button"><i data-lucide="copy" aria-hidden="true"></i><span>Duplicar</span></button>
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
    drawer.querySelector("[data-detail-duplicate]").addEventListener("click", () => { closeTransactionDetail(true); duplicateTransaction(id); });
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
    const income = sum(rows.filter((transaction) => transaction.type === "income"), "amount");
    const expense = sum(rows.filter((transaction) => transaction.type === "expense"), "amount");
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
    const pageText = total ? `Mostrando ${start}–${end} de ${plural(total, "transação", "transações")}` : "Nenhuma transação para exibir";
    if (summary) summary.textContent = plural(total, "transação encontrada", "transações encontradas");
    if (pageSummary) pageSummary.textContent = pageText;
    if (secondaryPageSummary) secondaryPageSummary.textContent = pageText;
    if (pageLabel) pageLabel.textContent = `Página ${state.transactionPage} de ${totalPages}`;
    if (prev) prev.disabled = state.transactionPage <= 1 || !total;
    if (next) next.disabled = state.transactionPage >= totalPages || !total;
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
    selected.forEach((transaction) => profile.transactions.push(createTransactionDuplicate(transaction)));
    state.selectedTransactionIds.clear();
    saveStore();
    showToast(`${selected.length} ${selected.length === 1 ? "transação duplicada" : "transações duplicadas"}.`);
    refreshAll();
  }

  function deleteSelectedTransactions() {
    const profile = currentProfile();
    const ids = new Set(profile.transactions.filter((transaction) => state.selectedTransactionIds.has(transaction.id)).map((transaction) => transaction.id));
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
    const count = rows.length;
    const filterLabel = describeActiveTransactionFilters();
    if (!confirm(`Excluir ${count} ${count === 1 ? "transação filtrada" : "transações filtradas"}?\n\nFiltro: ${filterLabel}`)) return;
    const ids = new Set(rows.map((transaction) => transaction.id));
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
    return parts.length ? parts.join(", ") : "todas as transações visíveis";
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
    if (!transaction || transaction.status === status) return;
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

  function updateNotificationBadge(count) {
    const badge = app.querySelector("[data-notification-count]");
    const button = app.querySelector("[data-notification-button]");
    if (!badge || !button) return;
    badge.textContent = String(count);
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
    const filters = state.filters;
    const searchTerm = normalizeText(filters.description || "");
    let rows = [...profile.transactions].filter((transaction) => {
      const descriptionMatches = !searchTerm || transactionSearchText(transaction).includes(searchTerm);
      const hasCategory = profile.categories.some((category) => category.id === transaction.categoryId);
      const categoryMatches = filters.category === "all" ||
        (filters.category === "uncategorized" ? !hasCategory : transaction.categoryId === filters.category);
      const fromMatches = !filters.dateFrom || transaction.date >= filters.dateFrom;
      const toMatches = !filters.dateTo || transaction.date <= filters.dateTo;
      const minMatches = !filters.valueMin || transaction.amount >= Number(filters.valueMin);
      const maxMatches = !filters.valueMax || transaction.amount <= Number(filters.valueMax);
      const statusMatches = filters.status === "all" ||
        (filters.status === "open" ? isOpenTransaction(transaction) : transaction.status === filters.status);
      return descriptionMatches && categoryMatches && fromMatches && toMatches && minMatches && maxMatches && statusMatches;
    });

    const sorters = {
      "date-desc": (a, b) => b.date.localeCompare(a.date),
      "date-asc": (a, b) => a.date.localeCompare(b.date),
      "amount-desc": (a, b) => b.amount - a.amount,
      "amount-asc": (a, b) => a.amount - b.amount,
      "description-asc": (a, b) => a.description.localeCompare(b.description),
      "description-desc": (a, b) => b.description.localeCompare(a.description),
      "category-asc": (a, b) => findCategory(a.categoryId).name.localeCompare(findCategory(b.categoryId).name),
      "category-desc": (a, b) => findCategory(b.categoryId).name.localeCompare(findCategory(a.categoryId).name),
      "status-asc": (a, b) => a.status.localeCompare(b.status),
      "status-desc": (a, b) => b.status.localeCompare(a.status),
    };
    rows.sort(sorters[filters.sort] || sorters["date-desc"]);
    return rows;
  }

  function transactionSearchText(transaction) {
    const category = findCategory(transaction.categoryId);
    return normalizeText([
      transaction.description,
      category.name,
      category.icon,
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
    state.editingTransactionId = id;
    app.querySelector("#transactionId").value = transaction.id;
    app.querySelector(`input[name="type"][value="${transaction.type}"]`).checked = true;
    populateStatusSelects();
    app.querySelector("#transactionDescription").value = transaction.description;
    app.querySelector("#transactionAmount").value = transaction.amount;
    app.querySelector("#transactionDate").value = transaction.date;
    app.querySelector("#transactionCategory").value = transaction.categoryId;
    app.querySelector("#transactionStatus").value = transaction.status;
    app.querySelector("#transactionInstallmentsEnabled").checked = false;
    app.querySelector("#transactionInstallmentCount").value = transaction.installmentTotal || 2;
    updateInstallmentControls();
    app.querySelector("[data-transaction-form-mode]").textContent = transaction.installmentGroupId ? "Editando parcela" : "Editando lançamento";
    setButtonText("[data-save-transaction]", "Atualizar transação");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function duplicateTransaction(id) {
    const profile = currentProfile();
    const transaction = profile.transactions.find((item) => item.id === id);
    if (!transaction) return;
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
    const copy = {
      ...transaction,
      id: uid("trx"),
      description: `${transaction.description} (cópia)`,
      installmentGroupId: undefined,
      installmentNumber: undefined,
      installmentTotal: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides,
    };
    return copy;
  }

  function deleteTransaction(id) {
    const profile = currentProfile();
    const transaction = profile.transactions.find((item) => item.id === id);
    if (!transaction) return;
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
    setButtonText("[data-save-transaction]", "Salvar transação");
    state.editingTransactionId = "";
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
      const used = profile.transactions.some((transaction) => transaction.categoryId === category.id);
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
        if (profile.transactions.some((transaction) => transaction.categoryId === button.dataset.deleteCategory)) {
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
      if (sort === "name-asc") return a.name.localeCompare(b.name, "pt-BR");
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
    return goal.target ? Math.min(Math.round((Number(goal.saved || 0) / Number(goal.target || 1)) * 100), 100) : 0;
  }

  function goalMonthlyNeed(goal) {
    const remaining = Math.max(Number(goal.target || 0) - Number(goal.saved || 0), 0);
    return remaining / Math.max(daysUntil(goal.deadline) / 30, 1);
  }

  function goalVisualStatus(goal, forecast = null) {
    if (Number(goal.saved || 0) >= Number(goal.target || 0)) return "is-complete";
    if (daysUntil(goal.deadline) < 0) return "is-late";
    if (forecast?.status === "is-on-track") return "is-on-track";
    return "is-risk";
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
    return (goal.history || [])
      .map((entry) => normalizeGoalMovement(entry, goal, profile))
      .sort((a, b) => new Date(b.criado_em || b.date) - new Date(a.criado_em || a.date));
  }

  function goalHistoryStats(goal, profile = currentProfile()) {
    const stats = {
      entradas: 0,
      retiradas: 0,
      transferenciasEnviadas: 0,
      transferenciasRecebidas: 0,
      saldoHistorico: 0,
      saldoAtual: Number(goal.saved || 0),
      count: 0,
      ultimaMovimentacao: "",
    };
    goalHistoryEntries(goal, profile).forEach((entry) => {
      const value = Number(entry.valor || Math.abs(entry.amount || 0));
      stats.count += 1;
      if (!stats.ultimaMovimentacao) stats.ultimaMovimentacao = entry.criado_em || entry.date || "";
      if (entry.tipo === "entrada") stats.entradas += value;
      if (entry.tipo === "retirada") stats.retiradas += value;
      if (entry.tipo === "transferencia_enviada") stats.transferenciasEnviadas += value;
      if (entry.tipo === "transferencia_recebida") stats.transferenciasRecebidas += value;
      stats.saldoHistorico += entry.tipo === "entrada" || entry.tipo === "transferencia_recebida" ? value : -value;
    });
    stats.saldoHistorico = Number(stats.saldoHistorico.toFixed(2));
    return stats;
  }

  function goalHistoryPreview(goal, profile = currentProfile()) {
    return goalHistoryEntries(goal, profile);
  }

  function goalMovementClass(tipo) {
    const movementType = normalizeGoalMovementType(tipo);
    if (movementType === "entrada" || movementType === "transferencia_recebida") return "is-positive";
    return "is-negative";
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
    if (!amount || amount <= 0) {
      showToast("Digite um valor para adicionar.");
      return;
    }
    const profile = currentProfile();
    const goal = profile.goals.find((item) => item.id === id);
    if (!goal) return;
    const wasComplete = Number(goal.saved || 0) >= Number(goal.target || 0);
    goal.saved = Number((goal.saved + amount).toFixed(2));
    goal.updatedAt = new Date().toISOString();
    goal.history = normalizeGoalHistory(goal, profile);
    goal.history.push(createGoalMovement({
      tipo: "entrada",
      valor: amount,
      goal,
      profile,
      destino: "Meta",
      observacao: "Aporte",
    }));
    saveStore();
    showToast(goalInsight(goal, amount));
    refreshAll();
    if (!wasComplete && Number(goal.saved || 0) >= Number(goal.target || 0)) {
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
    const finalDestination = destination === "custom" ? customDestination : destination;
    if (!amount || amount <= 0) {
      showToast("Digite um valor valido para retirar.");
      return;
    }
    if (amount > Number(goal.saved || 0)) {
      showToast("A retirada nao pode ultrapassar o saldo da meta.");
      return;
    }
    if (!finalDestination) {
      showToast("Informe o destino do dinheiro.");
      return;
    }
    if (!justification) {
      showToast("Informe uma justificativa para a retirada.");
      return;
    }
    goal.saved = Number((Number(goal.saved || 0) - amount).toFixed(2));
    goal.updatedAt = new Date().toISOString();
    goal.history = normalizeGoalHistory(goal, profile);
    goal.history.push(createGoalMovement({
      tipo: "retirada",
      valor: amount,
      goal,
      profile,
      destino: finalDestination,
      justificativa: justification,
      observacao: observation || "Retirada",
      data: date || toDateInput(new Date()),
    }));
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
    if (!amount || amount <= 0) {
      showToast("Digite um valor valido para transferir.");
      return;
    }
    if (amount > Number(goal.saved || 0)) {
      showToast("A transferencia nao pode ultrapassar o saldo da meta.");
      return;
    }
    if (!targetId) {
      showToast("Escolha um destino para a transferencia.");
      return;
    }
    if (!justification) {
      showToast("Informe uma justificativa para a transferencia.");
      return;
    }

    let targetGoal = null;
    let targetProfile = null;
    if (targetType === "goal") {
      targetGoal = profile.goals.find((item) => item.id === targetId && item.id !== id);
      if (!targetGoal) {
        showToast("Meta de destino nao encontrada.");
        return;
      }
    } else {
      targetProfile = user?.profiles.find((item) => item.id === targetId);
      if (!targetProfile) {
        showToast("Perfil de destino nao encontrado.");
        return;
      }
    }
    const targetGoalWasComplete = targetGoal
      ? Number(targetGoal.saved || 0) >= Number(targetGoal.target || 0)
      : false;

    goal.saved = Number((Number(goal.saved || 0) - amount).toFixed(2));
    goal.updatedAt = new Date().toISOString();
    goal.history = normalizeGoalHistory(goal, profile);

    if (targetType === "goal") {
      targetGoal.saved = Number((Number(targetGoal.saved || 0) + amount).toFixed(2));
      targetGoal.updatedAt = new Date().toISOString();
      targetGoal.history = normalizeGoalHistory(targetGoal, profile);
      goal.history.push(createGoalMovement({
        tipo: "transferencia_enviada",
        valor: amount,
        goal,
        profile,
        destino: `Meta: ${targetGoal.name}`,
        justificativa: justification,
        observacao: "Transferencia para meta",
        metaDestino: targetGoal.id,
      }));
      const received = createGoalMovement({
        tipo: "transferencia_recebida",
        valor: amount,
        goal: targetGoal,
        profile,
        destino: `Origem: ${goal.name}`,
        justificativa: justification,
        observacao: "Transferencia recebida",
        metaDestino: targetGoal.id,
      });
      received.meta_origem = goal.id;
      targetGoal.history.push(received);
      showToast("Transferencia entre metas concluida.");
    } else {
      ensureProfileShape(targetProfile);
      const movement = createGoalMovement({
        tipo: "transferencia_enviada",
        valor: amount,
        goal,
        profile,
        destino: `Perfil: ${targetProfile.name}`,
        justificativa: justification,
        observacao: "Transferencia para perfil",
        perfilDestino: targetProfile.id,
      });
      goal.history.push(movement);
      const category = ensureGoalTransferCategory(targetProfile);
      targetProfile.transactions.push({
        id: uid("trx"),
        type: "income",
        description: `Transferencia da meta ${goal.name}`,
        amount: Number(amount),
        date: toDateInput(new Date()),
        categoryId: category.id,
        status: "Recebido",
        goalMovementId: movement.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      showToast("Transferencia para perfil registrada.");
    }

    closeGoalMoneyModal();
    saveStore();
    refreshAll();
    if (targetGoal && !targetGoalWasComplete && Number(targetGoal.saved || 0) >= Number(targetGoal.target || 0)) {
      requestAnimationFrame(() => celebrateGoalCompletion(targetGoal));
    }
  }

  function ensureGoalTransferCategory(profile) {
    const name = "Transferencia de meta";
    let category = profile.categories.find((item) => normalizeText(item.name) === normalizeText(name));
    if (!category) {
      category = { id: uid("cat"), name, icon: "+" };
      profile.categories.push(category);
    }
    return category;
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

  function openTransferComposer() {
    setView("goals");
    const goals = currentProfile().goals || [];
    const fundedGoal = goals.find((goal) => Number(goal.saved || 0) > 0);
    const targetGoal = fundedGoal || goals[0];

    if (!targetGoal) {
      openGoalComposer();
      showToast("Crie uma meta para transferir valores.");
      return;
    }

    const transferButton = [...app.querySelectorAll("[data-transfer-goal]")]
      .find((button) => button.dataset.transferGoal === targetGoal.id);
    transferButton?.scrollIntoView({ behavior: "smooth", block: "center" });
    transferButton?.focus();

    if (!fundedGoal) {
      showToast("Adicione saldo a uma meta para fazer uma transferencia.");
      return;
    }

    openGoalMoneyModal("transfer", fundedGoal.id, 0);
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
      insights.forEach((text) => {
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
    const settledTransactions = profile.transactions.filter(isSettledTransaction);
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
    const totals = new Map();
    transactions
      .filter((transaction) => transaction.type === "expense")
      .forEach((transaction) => {
        totals.set(transaction.date, (totals.get(transaction.date) || 0) + Number(transaction.amount || 0));
      });
    return [...totals.entries()]
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => b.total - a.total)[0] || null;
  }

  function highestTransaction(transactions) {
    return [...transactions].sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))[0] || null;
  }

  function categorySpendingComparison(transactions, currentMonth) {
    const previousMonth = parseLocalDate(`${currentMonth.value}-01`);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const previousValue = toMonthInput(previousMonth);
    const totals = new Map();
    transactions
      .filter((transaction) => transaction.type === "expense")
      .forEach((transaction) => {
        const month = toMonthInput(parseLocalDate(transaction.date));
        if (month !== currentMonth.value && month !== previousValue) return;
        const key = transaction.categoryId || "uncategorized";
        const entry = totals.get(key) || { current: 0, previous: 0 };
        if (month === currentMonth.value) entry.current += Number(transaction.amount || 0);
        if (month === previousValue) entry.previous += Number(transaction.amount || 0);
        totals.set(key, entry);
      });

    return [...totals.entries()]
      .map(([categoryId, entry]) => {
        if (!entry.previous) return null;
        const delta = entry.current - entry.previous;
        const percent = Math.round((Math.abs(delta) / entry.previous) * 100);
        return {
          categoryName: findCategory(categoryId).name,
          delta,
          percent,
        };
      })
      .filter((entry) => entry && entry.percent >= 5)
      .sort((a, b) => b.percent - a.percent)[0] || null;
  }

  function bestSavingMonth(transactions) {
    return lastMonths(6)
      .map((month) => {
        const income = monthlyTotal(transactions, month.value, "income");
        const expense = monthlyTotal(transactions, month.value, "expense");
        return { ...month, result: income - expense };
      })
      .filter((month) => month.result > 0)
      .sort((a, b) => b.result - a.result)[0] || null;
  }

  function bestExtraGoalContribution(goals) {
    const contributions = goals.flatMap((goal) => (goal.history || [])
      .filter((entry) => Number(entry.amount || 0) > 0 && normalizeText(entry.note || "") !== "saldo inicial")
      .map((entry) => ({
        goalName: goal.name,
        amount: Number(entry.amount || 0),
        date: entry.date || goal.updatedAt || goal.createdAt || new Date().toISOString(),
      })));
    if (contributions.length < 2) return null;
    const average = sum(contributions, "amount") / contributions.length;
    const best = contributions
      .filter((entry) => entry.amount > average)
      .sort((a, b) => b.amount - a.amount || String(b.date).localeCompare(String(a.date)))[0];
    return best ? { ...best, average } : null;
  }

  function goalInsight(goal, amount) {
    const progress = Math.min(Math.round((goal.saved / goal.target) * 100), 100);
    const contributions = (goal.history || [])
      .filter((entry) => Number(entry.amount || 0) > 0 && normalizeText(entry.note || "") !== "saldo inicial");
    const previous = contributions.slice(0, -1);
    const average = previous.length ? sum(previous, "amount") / previous.length : 0;
    if (average && amount > average) {
      return `🚀 Você guardou ${money(amount)} em ${goal.name}, acima da sua média de ${money(average)}. Continue nesse ritmo.`;
    }
    if (progress >= 100) return `🎉 Meta concluída. Você adicionou ${money(amount)} e fechou ${goal.name}.`;
    if (progress >= 75) return `🚀 Ótimo avanço: ${goal.name} chegou a ${progress}%. Falta pouco.`;
    if (progress >= 40) return `📈 ${goal.name} ganhou força: ${progress}% da meta já está guardado.`;
    return `💰 ${money(amount)} adicionados em ${goal.name}. O progresso agora está em ${progress}%.`;
  }

  function renderProfilesLegacy() {
    const user = currentUser();
    const box = app.querySelector("[data-profile-list]");
    box.innerHTML = "";
    user.profiles.forEach((profile) => {
      const balance = calculateBalance(profile.transactions);
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
    const totalBalance = user.profiles.reduce((total, profile) => total + calculateBalance(profile.transactions), 0);
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
      if (sort === "balance-desc") return calculateBalance(b.transactions) - calculateBalance(a.transactions);
      if (sort === "name-asc") return a.name.localeCompare(b.name, "pt-BR");
      if (sort === "used-desc") return profileUsageScore(b) - profileUsageScore(a);
      return (latestProfileActivityDate(b)?.getTime() || 0) - (latestProfileActivityDate(a)?.getTime() || 0);
    };
  }

  function profileUsageScore(profile) {
    return profile.transactions.length + profile.goals.length + (profile.imports || []).length;
  }

  function profileCard(profile, user) {
    const balance = calculateBalance(profile.transactions);
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
    const clone = JSON.parse(JSON.stringify(source));
    clone.id = uid("profile");
    clone.name = `${source.name} cópia`;
    clone.transactions = clone.transactions.map((transaction) => ({ ...transaction, id: uid("trx"), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
    clone.goals = clone.goals.map((goal) => ({
      ...goal,
      id: uid("goal"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: (goal.history || []).map((entry) => ({ ...entry, id: uid("goal-move") })),
    }));
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
    const payload = {
      exportedAt: new Date().toISOString(),
      exportVersion: "nexio-profile-v1",
      profile: JSON.parse(JSON.stringify(profile)),
    };
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

  function renderProfileStatsChart(profiles) {
    const canvas = document.getElementById("profileStatsChart");
    if (!canvas) return;
    const months = lastMonths(6);
    const income = months.map((month) => profiles.reduce((total, profile) => total + monthlyTotal(profile.transactions, month.value, "income"), 0));
    const expense = months.map((month) => profiles.reduce((total, profile) => total + monthlyTotal(profile.transactions, month.value, "expense"), 0));
    const net = income.map((value, index) => value - expense[index]);
    drawGroupedBarChart(canvas.getContext("2d"), canvas, {
      labels: months.map((month) => month.label),
      series: [
        { label: "Receitas", values: income, color: cssVar("--income") },
        { label: "Despesas", values: expense, color: cssVar("--expense") },
      ],
    });
    setAnimatedMoney("[data-profiles-stats-income]", income.reduce((a, b) => a + b, 0));
    setAnimatedMoney("[data-profiles-stats-expense]", expense.reduce((a, b) => a + b, 0));
    setAnimatedMoney("[data-profiles-stats-balance]", net.reduce((a, b) => a + b, 0));
    updateChartSummary(canvas, `Nos últimos 6 meses, receitas consolidadas somam ${money(income.reduce((a, b) => a + b, 0))}, despesas somam ${money(expense.reduce((a, b) => a + b, 0))} e saldo líquido soma ${money(net.reduce((a, b) => a + b, 0))}.`);
  }

  function profileActivityLabel(profile) {
    const latest = latestProfileActivityDate(profile);
    if (!latest) return "Sem atividade recente";
    return `Último acesso ${latest.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).replace(".", "")}`;
  }

  function latestProfileActivityDate(profile) {
    const dates = [
      ...profile.transactions.map((transaction) => transaction.updatedAt || transaction.createdAt || transaction.date),
      ...profile.goals.map((goal) => goal.updatedAt || goal.createdAt || goal.deadline),
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
    return latest.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");
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
    const colorInput = app.querySelector("#settingsPrimaryColor");
    if (colorInput) colorInput.value = user.primaryColor || "#5b9cff";
    syncSettingsThemePreview(user.theme);
    app.querySelectorAll("[data-setting-toggle]").forEach((toggle) => {
      toggle.checked = Boolean(user.settings?.[toggle.dataset.settingToggle]);
    });
    const avatar = app.querySelector("[data-settings-avatar]");
    if (avatar) {
      avatar.textContent = user.avatar ? "" : initialsFrom(user.name);
      avatar.style.backgroundImage = user.avatar ? `url("${user.avatar}")` : "";
      avatar.classList.toggle("has-image", Boolean(user.avatar));
    }
    const sessionType = app.querySelector("[data-settings-session-type]");
    if (sessionType) sessionType.textContent = isLocalOnlyUser(user) ? "Dados protegidos neste aparelho" : "Conta sincronizada com autenticação";
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
    const labels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul"];
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
    profile.transactions.forEach((transaction) => {
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
      dense: true,
    });
    updateChartSummary(dailyCanvas, `No mês selecionado, entradas ${isForecast ? "previstas" : "realizadas"} somam ${money(income.reduce((a, b) => a + b, 0))} e saídas ${isForecast ? "previstas" : "realizadas"} somam ${money(expense.reduce((a, b) => a + b, 0))}.`);

    let running = calculateCashflowBalance(profile.transactions.filter((transaction) => transaction.date < `${month}-01`));
    const evolution = labels.map((_, index) => {
      running += income[index] - expense[index];
      return running;
    });
    drawLineChart(balanceCanvas.getContext("2d"), balanceCanvas, evolution, {
      labels,
      lineColor: cssVar("--primary"),
      fillColor: `rgba(${cssVar("--primary-rgb")}, .14)`,
      gridColor: cssVar("--line"),
      labelColor: cssVar("--muted"),
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
        gridColor: cssVar("--line"),
        labelColor: cssVar("--muted"),
        moneyLabels: true,
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

    const upcoming = profile.transactions
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
    const today = parseLocalDate(toDateInput(new Date()));
    const target = parseLocalDate(date);
    return Math.round((target - today) / 86400000);
  }

  function buildCashflowForecast(profile, count = 14) {
    const today = parseLocalDate(toDateInput(new Date()));
    let running = calculateCashflowBalance(profile.transactions.filter((transaction) => transaction.date < toDateInput(today)));
    const labels = [];
    const fullLabels = [];
    const values = [];
    let hasData = false;
    for (let index = 0; index < count; index += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      const dateInput = toDateInput(date);
      const daily = profile.transactions.filter((transaction) => transaction.date === dateInput && isCashflowTransactionIncluded(transaction));
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
    return new Date(year, monthIndex - 1, 1).toLocaleDateString("pt-BR", { month: "long" });
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
    return profile.transactions.reduce((totals, transaction) => {
      if (toMonthInput(parseLocalDate(transaction.date)) !== month) return totals;
      if (!isCashflowTransactionIncluded(transaction)) return totals;
      const amount = Number(transaction.amount || 0);
      if (transaction.type === "income") totals.income += amount;
      if (transaction.type === "expense") totals.expense += amount;
      return totals;
    }, { income: 0, expense: 0 });
  }

  function shiftMonthValue(month, offset) {
    const [year, monthNumber] = month.split("-").map(Number);
    return toMonthInput(new Date(year, monthNumber - 1 + offset, 1));
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
    const monthTransactions = profile.transactions.filter((transaction) => toMonthInput(parseLocalDate(transaction.date)) === month);
    const open = monthTransactions.filter(isOpenTransaction);
    const pendingIncome = sum(open.filter((transaction) => transaction.type === "income"), "amount");
    const pendingExpense = sum(open.filter((transaction) => transaction.type === "expense"), "amount");
    note.textContent = open.length
      ? `Mês histórico: mostra apenas Pago/Recebido. Pendências fora do gráfico: a receber ${money(pendingIncome)} · a pagar ${money(pendingExpense)}.`
      : "Mês histórico: mostra apenas movimentos pagos e recebidos.";
  }

  function isForecastCashflowMonth(month) {
    return month >= toMonthInput(new Date());
  }

  function isCashflowTransactionIncluded(transaction) {
    const month = toMonthInput(parseLocalDate(transaction.date));
    return isForecastCashflowMonth(month) || isSettledTransaction(transaction);
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
    const size = resizeCanvas(canvas);
    ctx = size.ctx;
    const width = size.width;
    const height = size.height;
    const padding = { top: 34, right: 24, bottom: 42, left: 62 };
    ctx.clearRect(0, 0, width, height);
    const allValues = config.series.flatMap((series) => series.values);
    const max = Math.max(...allValues, 1) * 1.14;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    drawGrid(ctx, width, height, padding, max);
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
      if (!config.dense || index % Math.ceil(config.labels.length / 10) === 0) {
        ctx.fillStyle = cssVar("--muted");
        ctx.font = "12px Inter, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(label, padding.left + index * groupWidth + groupWidth / 2, height - 16);
      }
    });

    let legendX = padding.left;
    config.series.forEach((series) => {
      const x = legendX;
      ctx.fillStyle = series.color;
      roundRect(ctx, x, 14, 12, 12, 3);
      ctx.fill();
      ctx.fillStyle = cssVar("--muted");
      ctx.font = "12px Inter, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(series.label, x + 18, 24);
      legendX += Math.max(ctx.measureText(series.label).width + 48, 92);
    });
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
      if (options.dense && index % Math.ceil(options.labels.length / 10) !== 0) return;
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
    let badge = canvas.closest(".panel, .goal-evolution-panel")?.querySelector(`[data-chart-comparison="${canvas.id || "goal"}"]`);
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "chart-comparison-indicator";
      badge.dataset.chartComparison = canvas.id || "goal";
      const heading = canvas.closest(".panel")?.querySelector(".panel-heading") || canvas.parentElement;
      heading?.append(badge);
    }
    if (!badge) return;
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
      ctx.fillText(options.moneyLabels ? compactMoney(value) : Math.round(value), padding.left - 10, y + 4);
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

  function resizeCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(Math.round(rect.width || canvas.clientWidth || 640), 300);
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
    const profile = currentProfile();
    return profile.categories.find((category) => category.id === id) || { name: "Sem categoria", icon: "?" };
  }

  function calculateBalance(transactions) {
    return transactions.reduce((total, transaction) => {
      if (!isSettledTransaction(transaction)) return total;
      const amount = Number(transaction.amount || 0);
      return total + (transaction.type === "income" ? amount : -amount);
    }, 0);
  }

  function calculateProjectedBalance(transactions) {
    return transactions.reduce((total, transaction) => {
      const amount = Number(transaction.amount || 0);
      return total + (transaction.type === "income" ? amount : -amount);
    }, 0);
  }

  function calculateCashflowBalance(transactions) {
    return transactions.reduce((total, transaction) => {
      if (!isCashflowTransactionIncluded(transaction)) return total;
      const amount = Number(transaction.amount || 0);
      return total + (transaction.type === "income" ? amount : -amount);
    }, 0);
  }

  function monthlyTotal(transactions, month, type) {
    return transactions
      .filter((transaction) => transaction.type === type && isSettledTransaction(transaction) && toMonthInput(parseLocalDate(transaction.date)) === month)
      .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);
  }

  function isSettledTransaction(transaction) {
    return (transaction.type === "income" && transaction.status === "Recebido") ||
      (transaction.type === "expense" && transaction.status === "Pago");
  }

  function isOpenTransaction(transaction) {
    return transaction.status === "Pendente" || transaction.status === "Atrasado";
  }

  function currentMonthOpenTransactions(profile) {
    if (!profile) return [];
    const month = currentCalendarMonth();
    return profile.transactions.filter((transaction) => isInCalendarMonth(transaction.date, month) && isOpenTransaction(transaction));
  }

  function currentCalendarMonth(date = new Date()) {
    return {
      value: toMonthInput(date),
      start: toDateInput(new Date(date.getFullYear(), date.getMonth(), 1)),
      end: toDateInput(new Date(date.getFullYear(), date.getMonth() + 1, 0)),
    };
  }

  function isInCalendarMonth(value, month) {
    const date = toDateInput(parseLocalDate(value));
    return date >= month.start && date <= month.end;
  }

  function lastMonths(count) {
    const now = new Date();
    return Array.from({ length: count }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - index), 1);
      return {
        value: toMonthInput(date),
        label: date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
      };
    });
  }

  function daysInMonth(month) {
    const [year, monthIndex] = month.split("-").map(Number);
    return new Date(year, monthIndex, 0).getDate();
  }

  function daysUntil(date) {
    const today = parseLocalDate(toDateInput(new Date()));
    const target = parseLocalDate(date);
    return Math.ceil((target - today) / 86400000);
  }

  function sum(items, key) {
    return items.reduce((total, item) => total + Number(item[key] || 0), 0);
  }

  function money(value) {
    const user = currentUser();
    const currency = user?.currency || "BRL";
    return new Intl.NumberFormat(currencyLocales[currency] || "pt-BR", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "JPY" || currency === "CLP" ? 0 : 2,
    }).format(Number(value || 0));
  }

  function compactMoney(value) {
    const absolute = Math.abs(value);
    if (absolute >= 1000000) return `${money(value / 1000000)} mi`;
    if (absolute >= 1000) return `${money(value / 1000)} mil`;
    return money(value);
  }

  function formatDate(value) {
    return parseLocalDate(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  }

  function formatLongDate(value) {
    return value.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  function formatMonthYear(value) {
    const date = parseLocalDate(`${value}-01`);
    const month = date.toLocaleDateString("pt-BR", { month: "long" });
    return `${month.charAt(0).toUpperCase() + month.slice(1)}/${date.getFullYear()}`;
  }

  function parseLocalDate(value) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day || 1);
  }

  function toDateInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function toMonthInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }

  function normalizeEmail(value) {
    return value.trim().toLowerCase();
  }

  function plural(count, singular, pluralLabel) {
    return `${count} ${count === 1 ? singular : pluralLabel}`;
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
    return type === "income" ? incomeStatuses : expenseStatuses;
  }

  function settledStatusFor(type) {
    return type === "income" ? "Recebido" : "Pago";
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
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3200);
  }

  window.addEventListener("resize", () => {
    if (currentUser()) {
      drawMonthlyFlowChart();
      drawCashflowCharts();
    } else {
      drawAuthChart();
    }
  });

  bootstrap();
})();
