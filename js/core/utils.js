(function (global) {
  "use strict";

  const core = global.NexioCore = global.NexioCore || {};

  function uid(prefix, now = Date.now(), random = Math.random()) {
    return `${prefix}-${now.toString(36)}-${random.toString(36).slice(2, 8)}`;
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

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function parseLocalDate(value) {
    const [year, month, day] = String(value || "").split("-").map(Number);
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

  function addMonthsToDate(value, months) {
    const date = parseLocalDate(value);
    const day = date.getDate();
    const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
    const maxDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
    target.setDate(Math.min(day, maxDay));
    return toDateInput(target);
  }

  function shiftMonthValue(month, offset) {
    const [year, monthNumber] = String(month).split("-").map(Number);
    return toMonthInput(new Date(year, monthNumber - 1 + offset, 1));
  }

  function daysInMonth(month) {
    const [year, monthIndex] = String(month).split("-").map(Number);
    return new Date(year, monthIndex, 0).getDate();
  }

  function daysUntil(date, today = new Date()) {
    const start = parseLocalDate(toDateInput(today));
    const target = parseLocalDate(date);
    return Math.ceil((target - start) / 86400000);
  }

  function lastMonths(count, locale = "pt-BR", now = new Date()) {
    return Array.from({ length: count }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - index), 1);
      return {
        value: toMonthInput(date),
        label: date.toLocaleDateString(locale, { month: "short" }).replace(".", ""),
      };
    });
  }

  function daysBetweenToday(date, today = new Date()) {
    const start = parseLocalDate(toDateInput(today));
    const target = parseLocalDate(date);
    return Math.round((target - start) / 86400000);
  }

  function sum(items, key) {
    return items.reduce((total, item) => total + Number(item[key] || 0), 0);
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

  function parseInteger(value) {
    const number = Number(String(value || "").replace(/\D/g, ""));
    return Number.isFinite(number) ? number : 0;
  }

  function fileExtension(name) {
    return String(name || "").split(".").pop().toLowerCase();
  }

  function plural(count, singular, pluralLabel) {
    return `${count} ${count === 1 ? singular : pluralLabel}`;
  }

  core.utils = Object.freeze({
    addMonthsToDate,
    cleanImportedText,
    currentCalendarMonth,
    daysBetweenToday,
    daysInMonth,
    daysUntil,
    fileExtension,
    isInCalendarMonth,
    lastMonths,
    mergeUniqueBy,
    normalizeEmail,
    normalizeText,
    parseInteger,
    parseLocalDate,
    plural,
    shiftMonthValue,
    sum,
    toDateInput,
    toMonthInput,
    uid,
  });
})(globalThis);
