(function (global) {
  "use strict";

  const core = global.NexioCore = global.NexioCore || {};
  const utils = core.utils;

  function create(name, options = {}) {
    const createId = options.uid || utils.uid;
    const profile = {
      id: createId("profile"),
      name,
      categories: core.categories.createDefaults(createId),
      transactions: [],
      goals: [],
      imports: [],
      budgets: [],
      notificationState: core.notifications?.createState?.() || undefined,
    };
    core.accounts.normalizeProfile(profile, options);
    return profile;
  }

  function ensureProfileShape(profile, options = {}) {
    const createId = options.uid || utils.uid;
    profile.name = profile.name || "Principal";
    profile.transactions = Array.isArray(profile.transactions) ? profile.transactions : [];
    core.accounts.normalizeProfile(profile, options);
    profile.categories = Array.isArray(profile.categories) && profile.categories.length
      ? profile.categories
      : core.categories.createDefaults(createId);
    core.categories.normalizeCategoryIcons(profile.categories);
    core.budgets.normalizeProfile(profile);
    core.notifications?.normalizeProfile?.(profile);
    profile.goals = Array.isArray(profile.goals) ? profile.goals : [];
    profile.goals.forEach((goal) => core.goals.ensureShape(goal, profile, options));
    profile.imports = Array.isArray(profile.imports) ? profile.imports : [];
    return profile;
  }

  function ensureUserShape(user, options = {}) {
    const preferredLanguage = options.preferredLanguage || (() => "pt");
    const supportedLanguage = options.supportedLanguage || ((language) => language || "pt");
    user.name = user.name || "Usuário Nexio";
    user.theme = user.theme || "dark";
    const currency = String(user.currency || "BRL").trim().toUpperCase();
    user.currency = core.finance.currencyLocales[currency] ? currency : "BRL";
    user.language = supportedLanguage(user.language || options.storedLanguage || preferredLanguage());
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
      const profile = create("Principal", options);
      user.profiles.push(profile);
      user.activeProfileId = profile.id;
    }
    user.profiles.forEach((profile) => ensureProfileShape(profile, { ...options, currency: user.currency }));
    if (!user.profiles.some((profile) => profile.id === user.activeProfileId)) {
      user.activeProfileId = user.profiles[0].id;
    }
    return user;
  }

  function current(store, sessionEmail) {
    const email = utils.normalizeEmail(sessionEmail || "");
    return store.users.find((user) => utils.normalizeEmail(user.email || "") === email) || null;
  }

  function currentProfile(user) {
    if (!user) return null;
    return user.profiles.find((profile) => profile.id === user.activeProfileId) || user.profiles[0] || null;
  }

  function duplicate(profile, options = {}) {
    const createId = options.uid || utils.uid;
    const clone = JSON.parse(JSON.stringify(profile));
    clone.id = createId("profile");
    clone.name = `${profile.name} cópia`;
    const accountIdMap = new Map();
    clone.accounts = (clone.accounts || []).map((account) => {
      const nextId = createId("account");
      accountIdMap.set(account.id, nextId);
      return { ...account, id: nextId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    });
    clone.defaultAccountId = accountIdMap.get(clone.defaultAccountId) || clone.accounts[0]?.id;
    const transferIdMap = new Map();
    clone.transactions = clone.transactions.map((transaction) => ({
      ...transaction,
      id: createId("trx"),
      accountId: accountIdMap.get(transaction.accountId) || clone.defaultAccountId,
      transferId: transaction.transferId
        ? (transferIdMap.get(transaction.transferId) || (() => {
          const nextId = createId("transfer");
          transferIdMap.set(transaction.transferId, nextId);
          return nextId;
        })())
        : undefined,
      transferAccountId: transaction.transferAccountId
        ? (accountIdMap.get(transaction.transferAccountId) || "")
        : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    clone.goals = clone.goals.map((goal) => ({
      ...goal,
      id: createId("goal"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: (goal.history || []).map((entry) => ({ ...entry, id: createId("goal-move") })),
    }));
    const usedBudgetIds = new Set((clone.budgets || []).map((budget) => budget.id).filter(Boolean));
    clone.budgets = (clone.budgets || []).map((budget) => {
      const baseId = createId("budget");
      let nextId = baseId;
      let suffix = 2;
      while (!nextId || usedBudgetIds.has(nextId)) {
        nextId = `${baseId || "budget"}-${suffix}`;
        suffix += 1;
      }
      usedBudgetIds.add(nextId);
      return {
        ...budget,
        id: nextId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });
    clone.notificationState = core.notifications?.createState?.({
      preferences: clone.notificationState?.preferences,
    }) || clone.notificationState;
    return clone;
  }

  function mergeImportedUser(target, imported, options = {}) {
    const ensureUser = options.ensureUserShape || ((user) => ensureUserShape(user, options));
    const ensureProfile = options.ensureProfileShape || ((profile) => ensureProfileShape(profile, options));
    const normalizeText = options.normalizeText || utils.normalizeText;
    const createId = options.uid || utils.uid;
    const uniqueImportedId = (prefix, used) => {
      const baseId = createId(prefix);
      let candidate = baseId;
      let suffix = 2;
      while (used.has(candidate)) {
        candidate = `${baseId}-${suffix}`;
        suffix += 1;
      }
      used.add(candidate);
      return candidate;
    };
    ensureUser(target);
    ensureUser(imported);
    target.name = target.name || imported.name;
    target.theme = target.theme || imported.theme;
    target.currency = target.currency || imported.currency;
    imported.profiles.forEach((incomingProfile) => {
      ensureProfile(incomingProfile);
      let targetProfile = target.profiles.find((profile) => profile.id === incomingProfile.id);
      if (!targetProfile) targetProfile = target.profiles.find((profile) => normalizeText(profile.name) === normalizeText(incomingProfile.name));
      if (!targetProfile) {
        core.budgets.sanitizeImportedProfile(incomingProfile, { ...options, uid: createId });
        target.profiles.push(incomingProfile);
        return;
      }
      ensureProfile(targetProfile);
      const categoryIdMap = new Map();
      const usedCategoryIds = new Set(targetProfile.categories.map((category) => category.id).filter(Boolean));
      incomingProfile.categories.forEach((incomingCategory) => {
        const byName = targetProfile.categories.find((category) => normalizeText(category.name) === normalizeText(incomingCategory.name));
        const byId = targetProfile.categories.find((category) => category.id === incomingCategory.id);
        const existing = byName || (byId && normalizeText(byId.name) === normalizeText(incomingCategory.name) ? byId : null);
        if (existing) {
          categoryIdMap.set(incomingCategory.id, existing.id);
          return;
        }
        const category = JSON.parse(JSON.stringify(incomingCategory));
        if (!category.id || usedCategoryIds.has(category.id)) category.id = uniqueImportedId("cat", usedCategoryIds);
        else usedCategoryIds.add(category.id);
        targetProfile.categories.push(category);
        categoryIdMap.set(incomingCategory.id, category.id);
      });
      const accountIdMap = new Map();
      incomingProfile.accounts.forEach((incomingAccount) => {
        const byId = targetProfile.accounts.find((account) => account.id === incomingAccount.id);
        const byName = targetProfile.accounts.find((account) => normalizeText(account.name) === normalizeText(incomingAccount.name));
        const existing = byId || byName;
        if (existing) {
          accountIdMap.set(incomingAccount.id, existing.id);
          return;
        }
        const account = JSON.parse(JSON.stringify(incomingAccount));
        account.currency = targetProfile.accounts[0]?.currency || account.currency;
        targetProfile.accounts.push(account);
        accountIdMap.set(incomingAccount.id, account.id);
      });
      const targetAccountIds = new Set(targetProfile.accounts.map((account) => account.id));
      incomingProfile.transactions.forEach((transaction) => {
        if (categoryIdMap.has(transaction.categoryId)) transaction.categoryId = categoryIdMap.get(transaction.categoryId);
        transaction.accountId = accountIdMap.get(transaction.accountId) ||
          (targetAccountIds.has(transaction.accountId) ? transaction.accountId : targetProfile.defaultAccountId);
        if (transaction.transferAccountId) {
          transaction.transferAccountId = accountIdMap.get(transaction.transferAccountId) ||
            (targetAccountIds.has(transaction.transferAccountId) ? transaction.transferAccountId : "");
        }
      });
      const existingTransactionIds = new Set(targetProfile.transactions.map((transaction) => transaction.id).filter(Boolean));
      const usedTransferIds = new Set(targetProfile.transactions.map((transaction) => transaction.transferId).filter(Boolean));
      const transferGroups = new Map();
      incomingProfile.transactions.filter((transaction) => transaction.transferId).forEach((transaction) => {
        const group = transferGroups.get(transaction.transferId) || [];
        group.push(transaction);
        transferGroups.set(transaction.transferId, group);
      });
      transferGroups.forEach((group, transferId) => {
        const alreadyImported = group.every((transaction) => targetProfile.transactions.some((existing) => (
          existing.id === transaction.id && existing.transferId === transferId
        )));
        if (alreadyImported || !usedTransferIds.has(transferId)) {
          usedTransferIds.add(transferId);
          return;
        }
        const nextTransferId = uniqueImportedId("transfer", usedTransferIds);
        group.forEach((transaction) => {
          transaction.transferId = nextTransferId;
          if (existingTransactionIds.has(transaction.id)) {
            transaction.id = uniqueImportedId("trx", existingTransactionIds);
          } else {
            existingTransactionIds.add(transaction.id);
          }
        });
      });
      utils.mergeUniqueBy(targetProfile.transactions, incomingProfile.transactions, (item) => item.id || `${item.date}|${item.description}|${item.amount}|${item.status}`);
      utils.mergeUniqueBy(targetProfile.goals, incomingProfile.goals, (item) => item.id || normalizeText(item.name));
      utils.mergeUniqueBy(targetProfile.imports, incomingProfile.imports, (item) => item.id || `${item.sourceName}|${item.importedAt}`);
      core.budgets.importInto(targetProfile, incomingProfile.budgets, { ...options, uid: createId, categoryIdMap });
      core.notifications?.importState?.(targetProfile, incomingProfile.notificationState);
    });
    if (!target.profiles.some((profile) => profile.id === target.activeProfileId)) target.activeProfileId = target.profiles[0]?.id;
    return target;
  }

  core.profiles = Object.freeze({ create, current, currentProfile, duplicate, ensureProfileShape, ensureUserShape, mergeImportedUser });
})(globalThis);
