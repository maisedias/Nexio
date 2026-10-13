const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const html = read("index.html");
const css = read("nexio-v2.css");
const ui = read("js/ui/shared-ui.js");

assert.match(css, /\.settings-premium \.settings-layout \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\); \}/);
assert.match(css, /\.settings-premium \.settings-data-grid \{ grid-template-columns: repeat\(2, minmax\(0, 1fr\)\); \}/);
assert.match(css, /\.settings-premium \.settings-notifications-card \{[\s\S]*?grid-column: 1 \/ -1;[\s\S]*?grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
assert.match(css, /\.settings-premium \.settings-about-card \{[\s\S]*?grid-column: 1 \/ -1;/);
assert.match(html, /data-export-box aria-live="polite">Gere a exportação para visualizar uma prévia segura dos dados neste espaço\.<\/pre>/);
assert.match(ui, /app\.querySelector\("\[data-export-data\]"\)\.addEventListener\("click", exportCurrentUserData\)/);
assert.match(ui, /if \(box\) box\.textContent = payload;/);

console.log("Settings layout contracts passed.");
