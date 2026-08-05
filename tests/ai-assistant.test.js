"use strict";

const assert = require("node:assert/strict");
const path = require("node:path");
const { test } = require("node:test");

global.window = global;
require(path.join(__dirname, "..", "js", "core", "ai-assistant.js"));

const { parseTransaction } = global.NexioCore.aiAssistant;
const fixedNow = new Date(2026, 7, 5, 12, 0, 0, 0);
const parse = (sentence) => parseTransaction(sentence, { now: fixedNow });

test("01. parses an expense draft without saving it", () => {
  const draft = parse("I spent 58 reais at Supermercado BH using my credit card.");
  assert.deepEqual(draft, {
    type: "expense",
    amount: 58,
    currency: "BRL",
    category: "Market",
    description: "Supermercado BH",
    paymentMethod: "Credit Card",
    account: null,
    date: "2026-08-05",
  });
});

test("02. parses an income draft", () => {
  const draft = parse("I received 1200 reais from a freelance project via Pix.");
  assert.equal(draft.type, "income");
  assert.equal(draft.amount, 1200);
  assert.equal(draft.description, "freelance project");
});

test("03. recognizes market purchases", () => {
  assert.equal(parse("I paid 42 reais at the grocery store with cash.").category, "Market");
});

test("04. recognizes fuel expenses", () => {
  assert.equal(parse("I spent 200 reais on fuel at Shell using Pix.").category, "Fuel");
});

test("05. recognizes salary income", () => {
  const draft = parse("I received 3500 reais as salary via Pix.");
  assert.deepEqual([draft.type, draft.category, draft.description], ["income", "Salary", "Salary"]);
});

test("06. recognizes Pix", () => {
  assert.equal(parse("I paid 25 reais at Padaria Central via Pix.").paymentMethod, "Pix");
});

test("07. recognizes credit card", () => {
  assert.equal(parse("I spent 58 reais at Supermercado BH using my credit card.").paymentMethod, "Credit Card");
});

test("08. recognizes debit card", () => {
  assert.equal(parse("I paid 35 reais at Farmacia Vida using my debit card.").paymentMethod, "Debit Card");
});

test("09. recognizes cash", () => {
  assert.equal(parse("I spent 18 reais at Cafe Central using cash.").paymentMethod, "Cash");
});

test("10. rejects an invalid sentence", () => {
  assert.equal(parseTransaction("Maybe something happened yesterday.", { now: fixedNow }), null);
  assert.equal(parseTransaction("I spent money at the market.", { now: fixedNow }), null);
});
