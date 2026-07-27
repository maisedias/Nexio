(function (global) {
  "use strict";

  const core = global.NexioCore = global.NexioCore || {};

  const iconOptions = Object.freeze([
    "💼", "🏦", "💳", "💵", "📈", "🧾", "🏠", "🛒", "🍽️", "🚗", "⛽", "🚌",
    "❤️", "💊", "🎓", "🎮", "🎬", "✈️", "🎁", "👕", "📱", "💡", "🛠️", "⭐",
  ]);

  const iconByName = Object.freeze({
    "Salário": "💼",
    Freelance: "📈",
    "Alimentação": "🍽️",
    Casa: "🏠",
    Transporte: "🚗",
    "Saúde": "💊",
    Lazer: "🎬",
  });

  const defaults = Object.freeze([
    { id: "cat-salary", name: "Salário", icon: "💼" },
    { id: "cat-freelance", name: "Freelance", icon: "📈" },
    { id: "cat-food", name: "Alimentação", icon: "🍽️" },
    { id: "cat-home", name: "Casa", icon: "🏠" },
    { id: "cat-transport", name: "Transporte", icon: "🚗" },
    { id: "cat-health", name: "Saúde", icon: "💊" },
    { id: "cat-leisure", name: "Lazer", icon: "🎬" },
  ]);

  function createDefaults(uid) {
    return defaults.map((category) => ({ ...category, id: uid("cat") }));
  }

  function normalizeCategoryIcons(categories) {
    categories.forEach((category) => {
      if (iconByName[category.name] && /^[A-Z+*?]$/.test(category.icon || "")) {
        category.icon = iconByName[category.name];
      }
    });
    return categories;
  }

  function find(categories, id) {
    return categories.find((category) => category.id === id) || { name: "Sem categoria", icon: "?" };
  }

  function ensureGoalTransferCategory(profile, uid, normalizeText) {
    const name = "Transferencia de meta";
    let category = profile.categories.find((item) => normalizeText(item.name) === normalizeText(name));
    if (!category) {
      category = { id: uid("cat"), name, icon: "+" };
      profile.categories.push(category);
    }
    return category;
  }

  core.categories = Object.freeze({
    createDefaults,
    defaults,
    ensureGoalTransferCategory,
    find,
    iconByName,
    iconOptions,
    normalizeCategoryIcons,
  });
})(globalThis);
