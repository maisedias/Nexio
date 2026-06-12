(function () {
  "use strict";

  const STORAGE_KEY = "nexio-finance-state-v1";
  const SESSION_KEY = "nexio-session-email";
  const LOCAL_USER_EMAIL = "sem-login@nexio.local";
  const incomeStatuses = ["Recebido", "Pendente", "Atrasado"];
  const expenseStatuses = ["Pago", "Pendente", "Atrasado"];
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
    view: "overview",
    editingTransactionId: "",
    editingCategoryId: "",
    editingGoalId: "",
    editingProfileId: "",
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
    selectedTransactionIds: new Set(),
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
    profile.imports = Array.isArray(profile.imports) ? profile.imports : [];
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
      renderAuth();
      return;
    }
    ensureUserShape(user);
    applyTheme(user.theme);
    renderDashboard();
  }

  function renderAuth() {
    document.body.classList.remove("theme-light", "menu-open");
    document.body.classList.add("theme-dark");
    app.innerHTML = "";
    app.append(document.getElementById("auth-template").content.cloneNode(true));
    const shell = app.querySelector(".auth-shell");
    shell.classList.toggle("is-register", state.authMode === "register");
    app.querySelectorAll("[data-auth-mode]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.authMode === state.authMode);
      button.addEventListener("click", () => {
        state.authMode = button.dataset.authMode;
        renderAuth();
      });
    });
    app.querySelector("[data-auth-submit]").textContent = state.authMode === "login" ? "Entrar" : "Criar conta";
    app.querySelector("#authForm").addEventListener("submit", handleAuth);
    app.querySelector("[data-use-without-login]").addEventListener("click", enterLocalMode);
    drawAuthChart();
  }

  function renderIcons() {
    if (window.lucide?.createIcons) {
      window.lucide.createIcons();
    }
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
    app.innerHTML = "";
    app.append(document.getElementById("dashboard-template").content.cloneNode(true));
    renderIcons();

    app.querySelector("[data-today-label]").textContent = formatLongDate(new Date());
    app.querySelector("[data-active-profile-label]").textContent = profile.name;
    bindNavigation();
    bindTopbar();
    bindTransactionForm();
    bindCategoryForm();
    bindFilters();
    bindBulkStatusControls();
    bindTransactionListControls();
    bindGoalForm();
    bindProfileForm();
    bindSettingsForm();
    refreshAll();
  }

  function bindNavigation() {
    const menuButton = app.querySelector("[data-mobile-menu]");
    const menuBackdrop = app.querySelector("[data-menu-backdrop]");
    const closeMobileMenu = () => {
      document.body.classList.remove("menu-open");
      menuButton.setAttribute("aria-expanded", "false");
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
    user.profiles.forEach((profile) => {
      const option = document.createElement("option");
      option.value = profile.id;
      option.textContent = profile.name;
      option.selected = profile.id === user.activeProfileId;
      select.append(option);
    });
    select.addEventListener("change", () => {
      user.activeProfileId = select.value;
      state.selectedTransactionIds.clear();
      saveStore();
      showToast("Perfil alterado.");
      renderDashboard();
    });
    app.querySelector("[data-quick-transaction]").addEventListener("click", () => {
      setView("transactions");
      resetTransactionForm();
      app.querySelector("#transactionDescription").focus();
    });
    app.querySelector("[data-quick-profile]").addEventListener("click", () => {
      setView("profiles");
      resetProfileForm();
      app.querySelector("#profileName").focus();
    });
  }

  function setView(view) {
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
      button.classList.toggle("is-active", button.dataset.view === view);
    });
    app.querySelectorAll("[data-view-panel]").forEach((panel) => {
      panel.classList.toggle("is-visible", panel.dataset.viewPanel === view);
    });
    if (view === "cashflow") drawCashflowCharts();
    if (view === "overview") drawMonthlyFlowChart();
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

  function resetCategoryForm() {
    const form = app.querySelector("#categoryForm");
    if (!form) return;
    form.reset();
    app.querySelector("#categoryId").value = "";
    app.querySelector("#categoryIcon").value = categoryIconOptions[0];
    app.querySelector("[data-save-category]").textContent = "+";
    state.editingCategoryId = "";
    syncCategoryIconPicker();
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
        renderTransactionsTable();
      });
      input.addEventListener("change", () => {
        state.filters[key] = input.value;
        renderTransactionsTable();
      });
    });

    const month = app.querySelector("#cashflowMonth");
    month.value = state.cashflowMonth;
    month.addEventListener("change", () => {
      state.cashflowMonth = month.value || toMonthInput(new Date());
      drawCashflowCharts();
    });
  }

  function bindGoalForm() {
    app.querySelector("#goalForm").addEventListener("submit", (event) => {
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
        history: [{ amount: initial, date: new Date().toISOString(), note: "Saldo inicial" }],
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
        goal.history = previous.history || [];
        goal.reminders = previous.reminders || [];
        goal.updatedAt = new Date().toISOString();
        if (previous.saved !== initial) {
          goal.history.push({
            amount: initial - previous.saved,
            date: new Date().toISOString(),
            note: "Ajuste manual",
          });
        }
        profile.goals[existingIndex] = goal;
        showToast("Objetivo atualizado.");
      } else {
        profile.goals.push(goal);
        showToast("Objetivo criado.");
      }
      saveStore();
      resetGoalForm();
      refreshAll();
    });
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
      renderDashboard();
      setView("profiles");
    });
    app.querySelector("[data-reset-profile-form]").addEventListener("click", () => {
      resetProfileForm();
      app.querySelector("#profileName").focus();
    });
  }

  function resetProfileForm() {
    const form = app.querySelector("#profileForm");
    if (!form) return;
    form.reset();
    app.querySelector("#profileId").value = "";
    app.querySelector("[data-save-profile]").textContent = "Criar perfil";
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
      saveStore();
      showToast("Configurações salvas.");
      renderDashboard();
      setView("settings");
    });

    app.querySelector("[data-export-data]").addEventListener("click", () => {
      const user = currentUser();
      const box = app.querySelector("[data-export-box]");
      const payload = JSON.stringify(user, null, 2);
      box.textContent = payload;
      const blob = new Blob([payload], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `nexio-${normalizeEmail(user.email)}.json`;
      link.click();
      URL.revokeObjectURL(link.href);
      showToast("Dados exportados.");
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
    const goalsSaved = sum(profile.goals, "saved");
    const goalsTarget = sum(profile.goals, "target");
    const goalProgress = goalsTarget ? Math.round((goalsSaved / goalsTarget) * 100) : 0;

    app.querySelector("[data-balance-total]").textContent = money(balance);
    app.querySelector("[data-month-income]").textContent = money(monthIncome);
    app.querySelector("[data-month-expense]").textContent = money(monthExpense);
    app.querySelector("[data-active-goals]").textContent = goalsActive.length;
    app.querySelector("[data-income-count]").textContent = plural(settledMonthTransactions.filter((item) => item.type === "income").length, "lançamento", "lançamentos");
    app.querySelector("[data-expense-count]").textContent = plural(settledMonthTransactions.filter((item) => item.type === "expense").length, "lançamento", "lançamentos");
    app.querySelector("[data-goals-progress]").textContent = `${Math.min(goalProgress, 100)}% guardado`;
    app.querySelector("[data-balance-trend]").textContent = balance >= 0 ? "Saldo positivo no período." : "Saldo pede atenção.";
    app.querySelector("[data-pending-month-label]").textContent = `Resumo de pendências - ${formatMonthYear(currentMonth.value)}`;
    app.querySelector("[data-pending-income]").textContent = money(pendingIncome);
    app.querySelector("[data-pending-expense]").textContent = money(pendingExpense);
    app.querySelector("[data-pending-impact]").textContent = money(pendingImpact);
    app.querySelector("[data-projected-balance]").textContent = money(balance + pendingImpact);
    updatePendingTone(app.querySelector("[data-pending-impact-card]"), app.querySelector("[data-pending-impact-icon]"), pendingImpact);
    updatePendingTone(app.querySelector("[data-projected-balance-card]"), app.querySelector("[data-projected-balance-icon]"), balance + pendingImpact);

    app.querySelector("[data-cash-income]").textContent = money(monthIncome);
    app.querySelector("[data-cash-expense]").textContent = money(monthExpense);
    app.querySelector("[data-cash-result]").textContent = money(monthIncome - monthExpense);
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
      box.append(emptyState("Nenhum movimento pago ou recebido no mês atual."));
      return;
    }
    transactions.forEach((transaction) => {
      const category = findCategory(transaction.categoryId);
      const item = document.createElement("article");
      item.className = "list-item";
      item.innerHTML = `
        <div class="list-main">
          <span class="category-dot">${escapeHtml(category.icon)}</span>
          <div>
            <div class="list-title">${escapeHtml(transaction.description)}</div>
            <div class="list-meta">${escapeHtml(category.name)} · ${formatDate(transaction.date)}</div>
          </div>
        </div>
        <strong class="${transaction.type === "income" ? "amount-income" : "amount-expense"}">${transaction.type === "income" ? "+" : "-"}${money(transaction.amount)}</strong>
      `;
      box.append(item);
    });
  }

  function renderTransactionsTable() {
    const tbody = app.querySelector("[data-transactions-table]");
    const rows = getFilteredTransactions();
    tbody.innerHTML = "";
    if (!rows.length) {
      const row = document.createElement("tr");
      row.innerHTML = '<td colspan="7"><div class="empty-state">Nenhuma transação encontrada.</div></td>';
      tbody.append(row);
      updateTransactionSelectionControls(rows);
      updateSortButtons();
      return;
    }
    rows.forEach((transaction) => {
      const category = findCategory(transaction.categoryId);
      const checked = state.selectedTransactionIds.has(transaction.id) ? " checked" : "";
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="select-column"><input data-select-transaction="${transaction.id}" type="checkbox" aria-label="Selecionar ${escapeHtml(transaction.description)}"${checked} /></td>
        <td>
          <strong>${escapeHtml(transaction.description)}</strong>
          <div class="list-meta">${transaction.type === "income" ? "Receita" : "Despesa"}${installmentLabel(transaction)}</div>
        </td>
        <td><span class="category-dot">${escapeHtml(category.icon)}</span> ${escapeHtml(category.name)}</td>
        <td>${formatDate(transaction.date)}</td>
        <td><strong class="${transaction.type === "income" ? "amount-income" : "amount-expense"}">${transaction.type === "income" ? "+" : "-"}${money(transaction.amount)}</strong></td>
        <td>${statusSelect(transaction)}</td>
        <td>
          <div class="row-actions">
            <button class="icon-button" data-edit-transaction="${transaction.id}" type="button" title="Editar">✎</button>
            <button class="icon-button" data-duplicate-transaction="${transaction.id}" type="button" title="Duplicar">⧉</button>
            <button class="icon-button" data-delete-transaction="${transaction.id}" type="button" title="Excluir">×</button>
          </div>
        </td>
      `;
      tbody.append(row);
    });

    tbody.querySelectorAll("[data-edit-transaction]").forEach((button) => {
      button.addEventListener("click", () => editTransaction(button.dataset.editTransaction));
    });
    tbody.querySelectorAll("[data-duplicate-transaction]").forEach((button) => {
      button.addEventListener("click", () => duplicateTransaction(button.dataset.duplicateTransaction));
    });
    tbody.querySelectorAll("[data-delete-transaction]").forEach((button) => {
      button.addEventListener("click", () => deleteTransaction(button.dataset.deleteTransaction));
    });
    tbody.querySelectorAll("[data-inline-status]").forEach((select) => {
      select.addEventListener("change", () => updateTransactionStatus(select.dataset.inlineStatus, select.value));
    });
    tbody.querySelectorAll("[data-select-transaction]").forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          state.selectedTransactionIds.add(checkbox.dataset.selectTransaction);
        } else {
          state.selectedTransactionIds.delete(checkbox.dataset.selectTransaction);
        }
        updateTransactionSelectionControls(rows);
      });
    });
    updateTransactionSelectionControls(rows);
    updateSortButtons();
  }

  function bindBulkStatusControls() {
    const month = app.querySelector("#bulkStatusMonth");
    const button = app.querySelector("[data-bulk-status-apply]");
    if (!month || !button) return;
    month.value = toMonthInput(new Date());
    button.addEventListener("click", applyBulkStatusUpdate);
  }

  function bindTransactionListControls() {
    app.querySelector("[data-delete-selected-transactions]").addEventListener("click", deleteSelectedTransactions);
    app.querySelector("[data-delete-filtered-transactions]").addEventListener("click", deleteFilteredTransactions);
    app.querySelector("[data-select-all-transactions]").addEventListener("change", (event) => {
      const rows = getFilteredTransactions();
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
        syncFilterInputs();
        renderTransactionsTable();
      });
    });
    updateSortButtons();
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

  function updateTransactionSelectionControls(rows = getFilteredTransactions()) {
    const visibleIds = rows.map((transaction) => transaction.id);
    const visibleSelected = visibleIds.filter((id) => state.selectedTransactionIds.has(id));
    const selectAll = app.querySelector("[data-select-all-transactions]");
    if (selectAll) {
      selectAll.checked = Boolean(visibleIds.length && visibleSelected.length === visibleIds.length);
      selectAll.indeterminate = Boolean(visibleSelected.length && visibleSelected.length < visibleIds.length);
    }
    const button = app.querySelector("[data-delete-selected-transactions]");
    if (button) {
      const count = state.selectedTransactionIds.size;
      button.disabled = !count;
      button.textContent = count ? `Excluir selecionadas (${count})` : "Excluir selecionadas";
    }
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
    if (filters.description) parts.push(`descrição contém "${filters.description}"`);
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
    let rows = [...profile.transactions].filter((transaction) => {
      const descriptionMatches = transaction.description.toLowerCase().includes(filters.description.toLowerCase().trim());
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
    app.querySelector("[data-save-transaction]").textContent = "Atualizar transação";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function duplicateTransaction(id) {
    const profile = currentProfile();
    const transaction = profile.transactions.find((item) => item.id === id);
    if (!transaction) return;
    profile.transactions.push({
      ...transaction,
      id: uid("trx"),
      description: `${transaction.description} (cópia)`,
      installmentGroupId: undefined,
      installmentNumber: undefined,
      installmentTotal: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    saveStore();
    showToast("Transação duplicada.");
    refreshAll();
  }

  function deleteTransaction(id) {
    const profile = currentProfile();
    const transaction = profile.transactions.find((item) => item.id === id);
    if (!transaction) return;
    if (!confirm(`Excluir "${transaction.description}"?`)) return;
    profile.transactions = profile.transactions.filter((item) => item.id !== id);
    state.selectedTransactionIds.delete(id);
    saveStore();
    showToast("Transação excluída.");
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
    app.querySelector("[data-save-transaction]").textContent = "Salvar transação";
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
    profile.categories.forEach((category) => {
      const used = profile.transactions.some((transaction) => transaction.categoryId === category.id);
      const item = document.createElement("div");
      item.className = "list-item";
      item.innerHTML = `
        <div class="list-main">
          <span class="category-dot">${escapeHtml(category.icon)}</span>
          <div>
            <div class="list-title">${escapeHtml(category.name)}</div>
            <div class="list-meta">${used ? "Em uso" : "Disponível"}</div>
          </div>
        </div>
        <div class="row-actions">
          <button class="icon-button" data-edit-category="${category.id}" type="button" title="Editar">✎</button>
          <button class="icon-button" data-delete-category="${category.id}" type="button" title="Excluir">×</button>
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
  }

  function editCategory(id) {
    const category = currentProfile().categories.find((item) => item.id === id);
    if (!category) return;
    state.editingCategoryId = id;
    app.querySelector("#categoryId").value = category.id;
    app.querySelector("#categoryIcon").value = category.icon;
    app.querySelector("#categoryName").value = category.name;
    app.querySelector("[data-save-category]").textContent = "✓";
    syncCategoryIconPicker();
    app.querySelector("#categoryName").focus();
  }

  function renderGoals() {
    const profile = currentProfile();
    const goals = profile.goals;
    const saved = sum(goals, "saved");
    const target = sum(goals, "target");
    const active = goals.filter((goal) => goal.saved < goal.target);
    app.querySelector("[data-goals-saved]").textContent = money(saved);
    app.querySelector("[data-goals-overall]").textContent = `${target ? Math.min(Math.round((saved / target) * 100), 100) : 0}%`;
    app.querySelector("[data-goals-active-count]").textContent = active.length;

    const goalList = app.querySelector("[data-goal-list]");
    goalList.innerHTML = "";
    if (!goals.length) {
      goalList.append(emptyState("Nenhuma meta criada."));
    } else {
      goals.forEach((goal) => goalList.append(goalCard(goal)));
    }
    renderInsights();
  }

  function goalCard(goal) {
    const progress = Math.min(goal.saved / goal.target, 1);
    const remaining = Math.max(goal.target - goal.saved, 0);
    const card = document.createElement("article");
    card.className = "goal-card";
    card.dataset.theme = goal.theme;
    card.style.setProperty("--progress", `${Math.round(progress * 100)}%`);
    card.innerHTML = `
      <div class="goal-top">
        <div>
          <h3>${escapeHtml(goal.name)}</h3>
          <div class="list-meta">Prazo: ${formatDate(goal.deadline)}</div>
        </div>
        <span class="pill">${Math.round(progress * 100)}%</span>
      </div>
      <div class="progress-track"><div class="progress-fill"></div></div>
      <div class="goal-stats">
        <div class="goal-stat"><span>Guardado</span><strong>${money(goal.saved)}</strong></div>
        <div class="goal-stat"><span>Falta</span><strong>${money(remaining)}</strong></div>
      </div>
      <form class="goal-contribute" data-contribute-goal="${goal.id}">
        <input type="number" min="0.01" step="0.01" placeholder="Adicionar valor" required />
        <button class="primary-action compact" type="submit">Adicionar</button>
      </form>
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
    card.querySelector("[data-edit-goal]").addEventListener("click", () => editGoal(goal.id));
    card.querySelector("[data-remind-goal]").addEventListener("click", () => createReminder(goal.id));
    card.querySelector("[data-delete-goal]").addEventListener("click", () => deleteGoal(goal.id));
    return card;
  }

  function contributeGoal(id, amount) {
    if (!amount || amount <= 0) {
      showToast("Digite um valor para adicionar.");
      return;
    }
    const goal = currentProfile().goals.find((item) => item.id === id);
    if (!goal) return;
    goal.saved = Number((goal.saved + amount).toFixed(2));
    goal.updatedAt = new Date().toISOString();
    goal.history = goal.history || [];
    goal.history.push({ amount, date: new Date().toISOString(), note: "Aporte" });
    saveStore();
    showToast(goalInsight(goal, amount));
    refreshAll();
  }

  function editGoal(id) {
    const goal = currentProfile().goals.find((item) => item.id === id);
    if (!goal) return;
    app.querySelector("#goalId").value = goal.id;
    app.querySelector("#goalName").value = goal.name;
    app.querySelector("#goalTarget").value = goal.target;
    app.querySelector("#goalInitial").value = goal.saved;
    app.querySelector("#goalDeadline").value = goal.deadline;
    app.querySelector("#goalTheme").value = goal.theme;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetGoalForm() {
    app.querySelector("#goalForm").reset();
    app.querySelector("#goalId").value = "";
    app.querySelector("#goalInitial").value = 0;
  }

  function createReminder(id) {
    const goal = currentProfile().goals.find((item) => item.id === id);
    if (!goal) return;
    const date = prompt("Data do lembrete (AAAA-MM-DD):", toDateInput(new Date()));
    if (!date) return;
    const text = prompt("Mensagem do lembrete:", `Adicionar valor em ${goal.name}`);
    if (!text) return;
    goal.reminders = goal.reminders || [];
    goal.reminders.push({ id: uid("reminder"), date, text });
    saveStore();
    showToast("Lembrete salvo na meta.");
    refreshAll();
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
    const box = app.querySelector("[data-insight-list]");
    const profile = currentProfile();
    box.innerHTML = "";
    const insights = buildInsights(profile);
    insights.forEach((text) => {
      const item = document.createElement("div");
      item.className = "insight-item";
      item.innerHTML = text;
      box.append(item);
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

  function renderProfiles() {
    const user = currentUser();
    const box = app.querySelector("[data-profile-list]");
    box.innerHTML = "";
    user.profiles.forEach((profile) => {
      const item = document.createElement("article");
      item.className = `profile-item ${profile.id === user.activeProfileId ? "is-active" : ""}`;
      item.innerHTML = `
        <div>
          <div class="list-title">${escapeHtml(profile.name)}</div>
          <div class="list-meta">${plural(profile.transactions.length, "transação", "transações")} · ${plural(profile.goals.length, "meta", "metas")}</div>
        </div>
        <div class="profile-actions">
          <button class="ghost-action" data-use-profile="${profile.id}" type="button">Usar</button>
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

  function renderSettings() {
    const user = currentUser();
    const profile = currentProfile();
    app.querySelector("#settingsProfileName").value = profile.name;
    app.querySelector("#settingsUserName").value = user.name;
    app.querySelector("#settingsTheme").value = user.theme;
    app.querySelector("#settingsCurrency").value = user.currency;
    updateSyncStatus();
    renderImportHistory(profile);
  }

  function renderImportHistory(profile) {
    const box = app.querySelector("[data-import-history]");
    if (!box) return;
    box.innerHTML = "";
    const imports = [...(profile.imports || [])].sort((a, b) => String(b.importedAt).localeCompare(String(a.importedAt))).slice(0, 8);
    if (!imports.length) {
      const item = document.createElement("div");
      item.className = "empty-state";
      item.textContent = "Nenhuma importação salva neste perfil.";
      box.append(item);
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
    drawLineChart(ctx, canvas, values, {
      labels: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul"],
      lineColor: cssVar("--primary"),
      fillColor: `rgba(${cssVar("--primary-rgb")}, .16)`,
      gridColor: `rgba(${cssVar("--primary-rgb")}, .12)`,
      labelColor: cssVar("--muted"),
      moneyLabels: false,
    });
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
  }

  function drawCashflowCharts() {
    const dailyCanvas = document.getElementById("dailyFlowChart");
    const balanceCanvas = document.getElementById("balanceEvolutionChart");
    if (!dailyCanvas || !balanceCanvas) return;

    const profile = currentProfile();
    const month = state.cashflowMonth || toMonthInput(new Date());
    const days = daysInMonth(month);
    const labels = Array.from({ length: days }, (_, index) => String(index + 1));
    const income = Array(days).fill(0);
    const expense = Array(days).fill(0);
    const isForecast = isForecastCashflowMonth(month);
    updateCashflowModeLabels(isForecast);
    updateCashflowModeNote(profile, month, isForecast);
    profile.transactions.forEach((transaction) => {
      if (toMonthInput(parseLocalDate(transaction.date)) !== month) return;
      if (!isCashflowTransactionIncluded(transaction)) return;
      const day = parseLocalDate(transaction.date).getDate() - 1;
      const amount = Number(transaction.amount || 0);
      if (transaction.type === "income") income[day] += amount;
      if (transaction.type === "expense") expense[day] += amount;
    });

    drawGroupedBarChart(dailyCanvas.getContext("2d"), dailyCanvas, {
      labels,
      series: [
        { label: "Entradas", values: income, color: cssVar("--income") },
        { label: "Saídas", values: expense, color: cssVar("--expense") },
      ],
      dense: true,
    });

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
    });

    app.querySelector("[data-cash-income]").textContent = money(income.reduce((a, b) => a + b, 0));
    app.querySelector("[data-cash-expense]").textContent = money(expense.reduce((a, b) => a + b, 0));
    app.querySelector("[data-cash-result]").textContent = money(income.reduce((a, b) => a + b, 0) - expense.reduce((a, b) => a + b, 0));
  }

  function updateCashflowModeLabels(isForecast) {
    const labels = isForecast
      ? {
        income: "Entradas previstas",
        expense: "Saídas previstas",
        result: "Resultado previsto",
        evolution: "Evolução prevista",
      }
      : {
        income: "Entradas realizadas",
        expense: "Saídas realizadas",
        result: "Resultado realizado",
        evolution: "Evolução realizada",
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

  function drawGroupedBarChart(ctx, canvas, config) {
    const size = resizeCanvas(canvas);
    ctx = size.ctx;
    const width = size.width;
    const height = size.height;
    const padding = { top: 34, right: 24, bottom: 42, left: 62 };
    ctx.clearRect(0, 0, width, height);
    const allValues = config.series.flatMap((series) => series.values);
    const max = Math.max(...allValues, 1);
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    drawGrid(ctx, width, height, padding, max);
    const groupWidth = chartWidth / config.labels.length;
    const barWidth = Math.max(4, Math.min(26, (groupWidth - 10) / config.series.length));

    config.labels.forEach((label, index) => {
      config.series.forEach((series, seriesIndex) => {
        const value = series.values[index];
        const x = padding.left + index * groupWidth + groupWidth / 2 - (barWidth * config.series.length) / 2 + seriesIndex * barWidth;
        const barHeight = (value / max) * chartHeight;
        const y = padding.top + chartHeight - barHeight;
        ctx.fillStyle = series.color;
        roundRect(ctx, x, y, barWidth - 2, barHeight, 5);
        ctx.fill();
      });
      if (!config.dense || index % Math.ceil(config.labels.length / 10) === 0) {
        ctx.fillStyle = cssVar("--muted");
        ctx.font = "12px Poppins, sans-serif";
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
      ctx.font = "12px Poppins, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(series.label, x + 18, 24);
      legendX += Math.max(ctx.measureText(series.label).width + 48, 92);
    });
  }

  function drawLineChart(ctx, canvas, values, options) {
    const size = resizeCanvas(canvas);
    ctx = size.ctx;
    const width = size.width;
    const height = size.height;
    const padding = { top: 30, right: 24, bottom: 42, left: options.moneyLabels ? 82 : 62 };
    ctx.clearRect(0, 0, width, height);
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 1);
    const range = max - min || 1;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    drawGrid(ctx, width, height, padding, max, min, options);

    const points = values.map((value, index) => {
      const x = padding.left + (chartWidth / Math.max(values.length - 1, 1)) * index;
      const y = padding.top + chartHeight - ((value - min) / range) * chartHeight;
      return { x, y };
    });

    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.lineTo(points[points.length - 1]?.x || padding.left, padding.top + chartHeight);
    ctx.lineTo(points[0]?.x || padding.left, padding.top + chartHeight);
    ctx.closePath();
    ctx.fillStyle = options.fillColor;
    ctx.fill();

    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.strokeStyle = options.lineColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    points.forEach((point, index) => {
      if (options.dense && index % Math.ceil(points.length / 12) !== 0) return;
      ctx.fillStyle = options.lineColor;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    options.labels.forEach((label, index) => {
      if (options.dense && index % Math.ceil(options.labels.length / 10) !== 0) return;
      const x = padding.left + (chartWidth / Math.max(options.labels.length - 1, 1)) * index;
      ctx.fillStyle = options.labelColor;
      ctx.font = "12px Poppins, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(label, x, height - 16);
    });
  }

  function drawGrid(ctx, width, height, padding, max, min = 0, options = {}) {
    const chartHeight = height - padding.top - padding.bottom;
    const steps = 4;
    ctx.strokeStyle = options.gridColor || cssVar("--line");
    ctx.lineWidth = 1;
    ctx.fillStyle = options.labelColor || cssVar("--muted");
    ctx.font = "12px Poppins, sans-serif";
    ctx.textAlign = "right";
    for (let index = 0; index <= steps; index += 1) {
      const y = padding.top + (chartHeight / steps) * index;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      const value = max - ((max - min) / steps) * index;
      ctx.fillText(options.moneyLabels ? compactMoney(value) : Math.round(value), padding.left - 10, y + 4);
    }
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
    return `<select class="status-select ${statusClass(transaction.status)}" data-inline-status="${escapeHtml(transaction.id)}" aria-label="Alterar status">${options}</select>`;
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

  function emptyState(text) {
    const element = document.createElement("div");
    element.className = "empty-state";
    element.textContent = text;
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
