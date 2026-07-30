(function (global) {
  "use strict";

  const core = global.NexioCore = global.NexioCore || {};
  const utils = core.utils;

  const currencyLocales = Object.freeze({
    BRL: "pt-BR", USD: "en-US", EUR: "de-DE", GBP: "en-GB",
    JPY: "ja-JP", ARS: "es-AR", CLP: "es-CL", MXN: "es-MX",
  });

  function isSettledTransaction(transaction) {
    return (transaction.type === "income" && transaction.status === "Recebido") ||
      (transaction.type === "expense" && transaction.status === "Pago");
  }

  function isOpenTransaction(transaction) {
    return transaction.status === "Pendente" || transaction.status === "Atrasado";
  }

  function isForecastCashflowMonth(month, now = new Date()) {
    return month >= utils.toMonthInput(now);
  }

  function isCashflowTransactionIncluded(transaction, now = new Date()) {
    const month = utils.toMonthInput(utils.parseLocalDate(transaction.date));
    return isForecastCashflowMonth(month, now) || isSettledTransaction(transaction);
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

  function calculateCashflowBalance(transactions, now = new Date()) {
    return transactions.reduce((total, transaction) => {
      if (!isCashflowTransactionIncluded(transaction, now)) return total;
      const amount = Number(transaction.amount || 0);
      return total + (transaction.type === "income" ? amount : -amount);
    }, 0);
  }

  function monthlyTotal(transactions, month, type) {
    return transactions
      .filter((transaction) => !transaction.transferId && transaction.type === type && isSettledTransaction(transaction) && utils.toMonthInput(utils.parseLocalDate(transaction.date)) === month)
      .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);
  }

  function currentMonthOpenTransactions(profile, date = new Date()) {
    if (!profile) return [];
    const month = utils.currentCalendarMonth(date);
    return profile.transactions.filter((transaction) => utils.isInCalendarMonth(transaction.date, month) && isOpenTransaction(transaction));
  }

  function cashflowTotalsForMonth(profile, month, now = new Date()) {
    return profile.transactions.reduce((totals, transaction) => {
      if (transaction.transferId) return totals;
      if (utils.toMonthInput(utils.parseLocalDate(transaction.date)) !== month) return totals;
      if (!isCashflowTransactionIncluded(transaction, now)) return totals;
      const amount = Number(transaction.amount || 0);
      if (transaction.type === "income") totals.income += amount;
      if (transaction.type === "expense") totals.expense += amount;
      return totals;
    }, { income: 0, expense: 0 });
  }

  function formatMoney(value, currency = "BRL") {
    return new Intl.NumberFormat(currencyLocales[currency] || "pt-BR", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "JPY" || currency === "CLP" ? 0 : 2,
    }).format(Number(value || 0));
  }

  core.finance = Object.freeze({
    calculateBalance,
    calculateCashflowBalance,
    calculateProjectedBalance,
    cashflowTotalsForMonth,
    currencyLocales,
    currentMonthOpenTransactions,
    formatMoney,
    isCashflowTransactionIncluded,
    isForecastCashflowMonth,
    isOpenTransaction,
    isSettledTransaction,
    monthlyTotal,
  });
})(globalThis);
