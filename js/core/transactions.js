(function (global) {
  "use strict";

  const core = global.NexioCore = global.NexioCore || {};
  const utils = core.utils;
  const finance = core.finance;

  const incomeStatuses = Object.freeze(["Recebido", "Pendente", "Atrasado"]);
  const expenseStatuses = Object.freeze(["Pago", "Pendente", "Atrasado"]);

  function statusesFor(type) {
    return type === "income" ? incomeStatuses : expenseStatuses;
  }

  function settledStatusFor(type) {
    return type === "income" ? "Recebido" : "Pago";
  }

  function isPendingOverdue(date, today = new Date()) {
    const current = utils.parseLocalDate(utils.toDateInput(today));
    const launchDate = utils.parseLocalDate(date);
    return Math.floor((current - launchDate) / 86400000) > 0;
  }

  function applyAutomaticOverdueStatus(transaction, now = new Date()) {
    if (!transaction || transaction.status !== "Pendente" || !transaction.date) return false;
    if (!isPendingOverdue(transaction.date, now)) return false;
    transaction.status = "Atrasado";
    transaction.updatedAt = now.toISOString();
    return true;
  }

  function createInstallments(transaction, count, options = {}) {
    const createId = options.uid || utils.uid;
    const now = options.now || (() => new Date());
    const groupId = createId("parcelas");
    const installments = [];
    for (let number = 1; number <= count; number += 1) {
      const timestamp = now();
      const installment = {
        ...transaction,
        id: createId("trx"),
        description: `${transaction.description} (${number}/${count})`,
        date: utils.addMonthsToDate(transaction.date, number - 1),
        status: transaction.status === "Atrasado" ? "Pendente" : transaction.status,
        installmentGroupId: groupId,
        installmentNumber: number,
        installmentTotal: count,
        createdAt: timestamp.toISOString(),
        updatedAt: timestamp.toISOString(),
      };
      applyAutomaticOverdueStatus(installment, timestamp);
      installments.push(installment);
    }
    return installments;
  }

  function createDuplicate(transaction, overrides = {}, options = {}) {
    const createId = options.uid || utils.uid;
    const now = options.now || new Date();
    return {
      ...transaction,
      id: createId("trx"),
      description: `${transaction.description} (cópia)`,
      installmentGroupId: undefined,
      installmentNumber: undefined,
      installmentTotal: undefined,
      transferId: undefined,
      transferDirection: undefined,
      transferAccountId: undefined,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      ...overrides,
    };
  }

  function filterAndSort(profile, filters, options = {}) {
    const categoryFor = options.findCategory || ((id) => core.categories.find(profile.categories, id));
    const searchText = options.searchText || ((transaction) => [
      transaction.description,
      categoryFor(transaction.categoryId).name,
      transaction.status,
      transaction.amount,
    ].join(" "));
    const searchTerm = utils.normalizeText(filters.description || "");
    const rows = [...profile.transactions].filter((transaction) => {
      const descriptionMatches = !searchTerm || utils.normalizeText(searchText(transaction)).includes(searchTerm);
      const hasCategory = profile.categories.some((category) => category.id === transaction.categoryId);
      const categoryMatches = filters.category === "all" ||
        (filters.category === "uncategorized" ? !hasCategory : transaction.categoryId === filters.category);
      const fromMatches = !filters.dateFrom || transaction.date >= filters.dateFrom;
      const toMatches = !filters.dateTo || transaction.date <= filters.dateTo;
      const minMatches = !filters.valueMin || transaction.amount >= Number(filters.valueMin);
      const maxMatches = !filters.valueMax || transaction.amount <= Number(filters.valueMax);
      const statusMatches = filters.status === "all" ||
        (filters.status === "open" ? finance.isOpenTransaction(transaction) : transaction.status === filters.status);
      const accountMatches = !filters.account || filters.account === "all" || transaction.accountId === filters.account;
      return descriptionMatches && categoryMatches && fromMatches && toMatches && minMatches && maxMatches && statusMatches && accountMatches;
    });

    const sorters = {
      "date-desc": (a, b) => b.date.localeCompare(a.date),
      "date-asc": (a, b) => a.date.localeCompare(b.date),
      "amount-desc": (a, b) => b.amount - a.amount,
      "amount-asc": (a, b) => a.amount - b.amount,
      "description-asc": (a, b) => a.description.localeCompare(b.description),
      "description-desc": (a, b) => b.description.localeCompare(a.description),
      "category-asc": (a, b) => categoryFor(a.categoryId).name.localeCompare(categoryFor(b.categoryId).name),
      "category-desc": (a, b) => categoryFor(b.categoryId).name.localeCompare(categoryFor(a.categoryId).name),
      "status-asc": (a, b) => a.status.localeCompare(b.status),
      "status-desc": (a, b) => b.status.localeCompare(a.status),
    };
    rows.sort(sorters[filters.sort] || sorters["date-desc"]);
    return rows;
  }

  function normalizeImportedStatus(status, type) {
    const key = utils.normalizeText(status);
    const allowed = statusesFor(type);
    const match = allowed.find((item) => utils.normalizeText(item) === key);
    return match || settledStatusFor(type);
  }

  core.transactions = Object.freeze({
    applyAutomaticOverdueStatus,
    createDuplicate,
    createInstallments,
    expenseStatuses,
    filterAndSort,
    incomeStatuses,
    isPendingOverdue,
    normalizeImportedStatus,
    settledStatusFor,
    statusesFor,
  });
})(globalThis);
