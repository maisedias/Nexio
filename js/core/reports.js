(function (global) {
  "use strict";

  const core = global.NexioCore = global.NexioCore || {};
  const utils = core.utils;

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

  function canonicalHeader(value) {
    const key = utils.normalizeText(value);
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

  function parseImportedDate(value) {
    if (value === undefined || value === null || value === "") return "";
    if (!Number.isNaN(Number(value)) && Number(value) > 20000) {
      const date = new Date(Math.round((Number(value) - 25569) * 86400 * 1000));
      return utils.toDateInput(new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
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
    return Number.isNaN(parsed.getTime()) ? "" : utils.toDateInput(parsed);
  }

  function parseImportedNumber(value) {
    if (value === undefined || value === null || value === "") return 0;
    if (typeof value === "number") return value;
    let text = String(value).trim().replace(/[^\d,().-]/g, "");
    const negative = text.includes("-") || (text.startsWith("(") && text.endsWith(")"));
    text = text.replace(/[()-]/g, "");
    const comma = text.lastIndexOf(",");
    const dot = text.lastIndexOf(".");
    if (comma > dot) text = text.replace(/\./g, "").replace(",", ".");
    else if (dot > comma && comma >= 0) text = text.replace(/,/g, "");
    else if (comma >= 0) text = text.replace(",", ".");
    const number = Number(text);
    return Number.isFinite(number) ? (negative ? -Math.abs(number) : number) : 0;
  }

  function inferTransactionType(typeText, statusText, amount) {
    const text = utils.normalizeText(`${typeText || ""} ${statusText || ""}`);
    if (["despesa", "saida", "debito", "debit", "expense", "pago"].some((item) => text.includes(item))) return "expense";
    if (["receita", "entrada", "credito", "credit", "income", "recebido"].some((item) => text.includes(item))) return "income";
    return Number(amount) < 0 ? "expense" : "income";
  }

  function transactionFromRow(row, headers) {
    const valueByHeader = {};
    headers.forEach((header, index) => {
      if (header !== "ignore" && row[index] !== undefined && row[index] !== "") valueByHeader[header] = row[index];
    });
    if (!Object.keys(valueByHeader).length && row.length >= 3) {
      valueByHeader.date = row[0]; valueByHeader.description = row[1]; valueByHeader.amount = row[2];
    }
    const incomeAmount = parseImportedNumber(valueByHeader.incomeAmount);
    const expenseAmount = parseImportedNumber(valueByHeader.expenseAmount);
    let amount = parseImportedNumber(valueByHeader.amount);
    let type = inferTransactionType(valueByHeader.type, valueByHeader.status, amount);
    if (incomeAmount) { amount = incomeAmount; type = "income"; }
    if (expenseAmount) { amount = expenseAmount; type = "expense"; }
    if (!amount) return null;
    const date = parseImportedDate(valueByHeader.date);
    if (!date) return null;
    if (amount < 0) { type = "expense"; amount = Math.abs(amount); }
    return {
      type,
      description: utils.cleanImportedText(valueByHeader.description || valueByHeader.memo || "Transação importada"),
      amount,
      date,
      category: utils.cleanImportedText(valueByHeader.category || "Importado"),
      status: utils.cleanImportedText(valueByHeader.status || ""),
      installmentNumber: utils.parseInteger(valueByHeader.installmentNumber),
      installmentTotal: utils.parseInteger(valueByHeader.installmentTotal),
    };
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

  function transactionsFromTableRows(rows) {
    if (!rows.length) return [];
    const headerIndex = findHeaderRow(rows);
    const headers = rows[headerIndex].map(canonicalHeader);
    return rows.slice(headerIndex + 1).map((row) => transactionFromRow(row, headers)).filter(Boolean);
  }

  function peakExpenseDay(transactions) {
    const totals = new Map();
    transactions.filter((transaction) => transaction.type === "expense" && !transaction.transferId).forEach((transaction) => {
      totals.set(transaction.date, (totals.get(transaction.date) || 0) + Number(transaction.amount || 0));
    });
    return [...totals.entries()].map(([date, total]) => ({ date, total })).sort((a, b) => b.total - a.total)[0] || null;
  }

  function highestTransaction(transactions) {
    return transactions.filter((transaction) => !transaction.transferId).sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))[0] || null;
  }

  function categorySpendingComparison(transactions, currentMonth, findCategory) {
    const previousMonth = utils.parseLocalDate(`${currentMonth.value}-01`);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    const previousValue = utils.toMonthInput(previousMonth);
    const totals = new Map();
    transactions.filter((transaction) => transaction.type === "expense" && !transaction.transferId).forEach((transaction) => {
      const month = utils.toMonthInput(utils.parseLocalDate(transaction.date));
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
        return { categoryName: findCategory(categoryId).name, delta, percent: Math.round((Math.abs(delta) / entry.previous) * 100) };
      })
      .filter((entry) => entry && entry.percent >= 5)
      .sort((a, b) => b.percent - a.percent)[0] || null;
  }

  function bestSavingMonth(transactions, months) {
    return months
      .map((month) => ({
        ...month,
        result: core.finance.monthlyTotal(transactions, month.value, "income") - core.finance.monthlyTotal(transactions, month.value, "expense"),
      }))
      .filter((month) => month.result > 0)
      .sort((a, b) => b.result - a.result)[0] || null;
  }

  function bestExtraGoalContribution(goals) {
    const contributions = goals.flatMap((goal) => (goal.history || [])
      .filter((entry) => Number(entry.amount || 0) > 0 && utils.normalizeText(entry.note || "") !== "saldo inicial")
      .map((entry) => ({ goalName: goal.name, amount: Number(entry.amount || 0), date: entry.date || goal.updatedAt || goal.createdAt || new Date().toISOString() })));
    if (contributions.length < 2) return null;
    const average = utils.sum(contributions, "amount") / contributions.length;
    const best = contributions.filter((entry) => entry.amount > average)
      .sort((a, b) => b.amount - a.amount || String(b.date).localeCompare(String(a.date)))[0];
    return best ? { ...best, average } : null;
  }

  function buildExportUser(user, options) {
    const sanitized = core.storage.sanitizeSensitiveData(user);
    const exported = JSON.parse(JSON.stringify(sanitized));
    options.ensureUserShape(exported);
    exported.profiles.forEach((profile) => {
      options.ensureProfileShape(profile);
      profile.goals = profile.goals.map((goal) => {
        options.ensureGoalShape(goal, profile);
        return {
          ...goal,
          estatisticas: options.goalHistoryStats(goal, profile),
          historico_movimentacoes: options.goalHistoryEntries(goal, profile),
        };
      });
    });
    exported.exportedAt = (options.now || new Date()).toISOString();
    exported.exportVersion = "nexio-goals-history-v1";
    return core.storage.sanitizeSensitiveData(exported);
  }

  function buildExportProfile(profile, options = {}) {
    const sanitized = core.storage.sanitizeSensitiveData(profile);
    return core.storage.sanitizeSensitiveData({
      exportedAt: (options.now || new Date()).toISOString(),
      exportVersion: "nexio-profile-v1",
      profile: JSON.parse(JSON.stringify(sanitized)),
    });
  }

  function filterExportProfileByAccount(profile, accountId) {
    if (!profile?.accounts?.some((account) => account.id === accountId)) return profile;
    const transferIds = new Set(profile.transactions
      .filter((transaction) => transaction.accountId === accountId && transaction.transferId)
      .map((transaction) => transaction.transferId));
    profile.transactions = profile.transactions.filter((transaction) => (
      transaction.accountId === accountId || transferIds.has(transaction.transferId)
    ));
    const requiredAccountIds = new Set([accountId]);
    profile.transactions.forEach((transaction) => {
      requiredAccountIds.add(transaction.accountId);
      if (transaction.transferAccountId) requiredAccountIds.add(transaction.transferAccountId);
    });
    profile.accounts = profile.accounts.filter((account) => requiredAccountIds.has(account.id));
    profile.defaultAccountId = accountId;
    return profile;
  }

  function monthlyBudgetReport(profile, month, options = {}) {
    const result = core.budgets.summary(profile, month, options);
    if (!result.ok) return result;
    return {
      ...result,
      rows: result.items.map((item) => ({
        categoryId: item.budget.categoryId,
        category: item.category?.name || "Categoria removida",
        limit: item.limit,
        spent: item.spent,
        committed: item.committed,
        remaining: item.remainingCommitted,
        percent: item.committedPercent,
        status: item.statusLabel,
      })),
    };
  }

  function transactionReport(transactions, options = {}) {
    const categoryFor = options.findCategory || ((id) => ({ name: id || "Sem categoria" }));
    const rows = (transactions || []).filter((transaction) => !transaction.transferId);
    const categories = new Map();
    const statuses = new Map();
    let income = 0;
    let expense = 0;

    rows.forEach((transaction) => {
      const amount = Number(transaction.amount || 0);
      if (transaction.type === "income") income += amount;
      else expense += amount;

      const category = categoryFor(transaction.categoryId) || { name: "Sem categoria" };
      const categoryName = category.name || "Sem categoria";
      const categoryEntry = categories.get(categoryName) || { category: categoryName, income: 0, expense: 0, total: 0 };
      categoryEntry[transaction.type === "income" ? "income" : "expense"] += amount;
      categoryEntry.total += amount;
      categories.set(categoryName, categoryEntry);

      const status = transaction.status || "Sem status";
      statuses.set(status, (statuses.get(status) || 0) + 1);
    });

    return {
      count: rows.length,
      income,
      expense,
      balance: income - expense,
      categories: [...categories.values()].sort((a, b) => b.total - a.total || a.category.localeCompare(b.category)),
      statuses: [...statuses.entries()].map(([status, count]) => ({ status, count })).sort((a, b) => b.count - a.count || a.status.localeCompare(b.status)),
    };
  }

  core.reports = Object.freeze({
    canonicalHeader,
    bestExtraGoalContribution,
    bestSavingMonth,
    buildExportProfile,
    buildExportUser,
    categorySpendingComparison,
    detectDelimiter,
    findHeaderRow,
    filterExportProfileByAccount,
    highestTransaction,
    inferTransactionType,
    monthlyBudgetReport,
    transactionReport,
    parseDelimitedRows,
    parseImportedDate,
    parseImportedNumber,
    peakExpenseDay,
    transactionFromRow,
    transactionsFromTableRows,
  });
})(globalThis);
