(function (global) {
  "use strict";

  const core = global.NexioCore = global.NexioCore || {};
  const utils = core.utils;

  function create(name, options = {}) {
    const createId = options.uid || utils.uid;
    return {
      id: createId("profile"),
      name,
      categories: core.categories.createDefaults(createId),
      transactions: [],
      goals: [],
      imports: [],
    };
  }

  function ensureProfileShape(profile, options = {}) {
    const createId = options.uid || utils.uid;
    profile.name = profile.name || "Principal";
    profile.transactions = Array.isArray(profile.transactions) ? profile.transactions : [];
    profile.categories = Array.isArray(profile.categories) && profile.categories.length
      ? profile.categories
      : core.categories.createDefaults(createId);
    core.categories.normalizeCategoryIcons(profile.categories);
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
    user.currency = user.currency || "BRL";
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
    user.profiles.forEach((profile) => ensureProfileShape(profile, options));
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
    clone.transactions = clone.transactions.map((transaction) => ({
      ...transaction,
      id: createId("trx"),
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
    return clone;
  }

  function mergeImportedUser(target, imported, options = {}) {
    const ensureUser = options.ensureUserShape || ((user) => ensureUserShape(user, options));
    const ensureProfile = options.ensureProfileShape || ((profile) => ensureProfileShape(profile, options));
    const normalizeText = options.normalizeText || utils.normalizeText;
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
        target.profiles.push(incomingProfile);
        return;
      }
      ensureProfile(targetProfile);
      utils.mergeUniqueBy(targetProfile.categories, incomingProfile.categories, (item) => normalizeText(item.name));
      utils.mergeUniqueBy(targetProfile.transactions, incomingProfile.transactions, (item) => item.id || `${item.date}|${item.description}|${item.amount}|${item.status}`);
      utils.mergeUniqueBy(targetProfile.goals, incomingProfile.goals, (item) => item.id || normalizeText(item.name));
      utils.mergeUniqueBy(targetProfile.imports, incomingProfile.imports, (item) => item.id || `${item.sourceName}|${item.importedAt}`);
    });
    if (!target.profiles.some((profile) => profile.id === target.activeProfileId)) target.activeProfileId = target.profiles[0]?.id;
    return target;
  }

  core.profiles = Object.freeze({ create, current, currentProfile, duplicate, ensureProfileShape, ensureUserShape, mergeImportedUser });
})(globalThis);
