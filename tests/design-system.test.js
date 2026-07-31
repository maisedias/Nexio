const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");

const variables = read("css/variables.css");
const components = read("css/design-system.css");
const legacyComponents = read("css/components.css");
const activeSkin = read("nexio-v2.css");
const renderer = read("js/ui/shared-ui.js");
const manifest = read("styles.css");
const index = read("index.html");

const requiredTokens = [
  "--color-primary",
  "--color-secondary",
  "--color-success",
  "--color-warning",
  "--color-danger",
  "--color-info",
  "--color-background",
  "--color-surface",
  "--color-card",
  "--color-border",
  "--color-text-primary",
  "--color-text-secondary",
  "--color-text-muted",
  "--font-family-sans",
  "--font-size-display-xl",
  "--font-size-heading-xl",
  "--font-size-body-md",
  "--font-size-caption",
  "--line-height-body",
  "--letter-spacing-heading",
  "--space-1",
  "--space-2",
  "--space-3",
  "--space-4",
  "--space-5",
  "--space-6",
  "--space-8",
  "--space-10",
  "--space-12",
  "--space-16",
  "--radius-small",
  "--radius-medium",
  "--radius-large",
  "--radius-extra-large",
  "--radius-pill",
  "--shadow-small",
  "--shadow-medium",
  "--shadow-large",
  "--shadow-extra-large",
  "--transition-fast",
  "--transition-normal",
  "--transition-slow",
  "--curve-standard",
  "--z-sidebar",
  "--z-header",
  "--z-modal",
  "--z-bottom-sheet",
  "--z-fab",
  "--z-toast",
  "--size-touch-target",
  "--input-background",
  "--input-background-hover",
  "--input-background-focus",
  "--input-background-disabled",
  "--input-border",
  "--input-border-hover",
  "--input-border-focus",
  "--input-text",
  "--input-placeholder",
  "--input-option-background",
  "--input-focus-ring",
  "--input-switch-track",
  "--input-switch-thumb",
  "--input-color-scheme",
];

for (const token of requiredTokens) {
  assert.match(variables, new RegExp(`${token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*:`), `Missing token ${token}`);
}

const expectedSpacing = {
  "--space-1": "0.25rem",
  "--space-2": "0.5rem",
  "--space-3": "0.75rem",
  "--space-4": "1rem",
  "--space-5": "1.25rem",
  "--space-6": "1.5rem",
  "--space-8": "2rem",
  "--space-10": "2.5rem",
  "--space-12": "3rem",
  "--space-16": "4rem",
};

for (const [token, value] of Object.entries(expectedSpacing)) {
  assert.match(variables, new RegExp(`${token}:\\s*${value.replace(".", "\\.")}\\s*;`), `${token} must preserve the 4/8-point scale`);
}

assert.match(variables, /--size-touch-target:\s*2\.75rem\s*;/, "Touch targets must be at least 44px");
assert.match(variables, /@media \(min-width: 768px\) and \(max-width: 1199px\)/, "Tablet typography range is missing");
assert.match(variables, /@media \(max-width: 767px\)/, "Mobile typography range is missing");
assert.match(variables, /body\.theme-dark,[\s\S]*?--color-background:/, "Dark-mode token overrides are missing");
assert.match(variables, /--color-primary:\s*var\(--nx-primary\)/, "Semantic primary color must honor the existing user accent");
const darkThemeBlock = variables.match(/body\.theme-dark,[\s\S]*?\n\}/)?.[0] || "";
assert.match(darkThemeBlock, /--color-primary:\s*var\(--nx-primary\)/, "Dark mode must honor the existing user accent");
assert.doesNotMatch(darkThemeBlock, /--nx-primary\s*:/, "Dark mode must not shadow the runtime accent token");
assert.match(darkThemeBlock, /--control-bg:\s*var\(--input-background\)/, "Legacy controls must inherit the dark input surface");
assert.match(darkThemeBlock, /--input-color-scheme:\s*dark\s*;/, "Native form controls must use the dark browser color scheme");
assert.match(components, /\/\* Dark-theme form polish:/, "The shared dark form-control layer is missing");
assert.match(components, /select :is\(option, optgroup\)/, "Native dropdown panels must use design-system tokens");
assert.match(components, /::-webkit-calendar-picker-indicator/, "Native date and time picker indicators must be themed");
assert.match(components, /input:-webkit-autofill/, "Autofilled inputs must retain the themed surface");
assert.match(components, /input:is\(\[type="checkbox"\], \[type="radio"\]\)/, "Choice controls must use the shared theme");

const componentContracts = [
  ".button--primary",
  ".button--secondary",
  ".button--ghost",
  ".button--danger",
  ".button--icon",
  ".button--fab",
  ".card--compact",
  ".card--statistic",
  ".card--interactive",
  ".list-item--compact",
  ".list-item--clickable",
  ".search-input",
  ".currency-input",
  ".checkbox",
  ".radio",
  ".switch",
  ".status-badge",
  ".category-badge",
  ".priority-badge",
  ".tag--success",
  ".tag--warning",
  ".tag--error",
  ".tag--neutral",
  ".avatar--small",
  ".avatar--medium",
  ".avatar--large",
  ".avatar--extra-large",
  ".progress-linear",
  ".progress-circular",
];

for (const selector of componentContracts) {
  assert.ok(components.includes(selector), `Missing component contract ${selector}`);
}

const declared = new Set(
  [...`${variables}\n${components}\n${activeSkin}`.matchAll(/(--[a-zA-Z0-9_-]+)\s*:/g)].map((match) => match[1]),
);
const used = new Set(
  [...`${components}\n${activeSkin}`.matchAll(/var\((--[a-zA-Z0-9_-]+)/g)].map((match) => match[1]),
);
for (const token of used) {
  assert.ok(declared.has(token), `Unresolved custom property ${token}`);
}

for (const [file, css] of [["css/design-system.css", components], ["nexio-v2.css", activeSkin]]) {
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b|rgba?\(/, `${file} contains a hard-coded color`);
  assert.doesNotMatch(
    css,
    /(?:margin|padding|gap|font-size|line-height|letter-spacing|border-radius|box-shadow|transition(?:-duration)?|animation(?:-duration)?|z-index)\s*:[^;]*(?:\d+(?:\.\d+)?(?:px|rem|em|ms|s))/i,
    `${file} contains a non-token visual value`,
  );
}

const stylesIndex = index.indexOf('href="styles.css');
const skinIndex = index.indexOf('href="nexio-v2.css');
const systemIndex = index.indexOf('href="css/design-system.css');
assert.ok(stylesIndex >= 0 && stylesIndex < skinIndex && skinIndex < systemIndex, "Stylesheet cascade order is incorrect");
assert.doesNotMatch(index, /href="docs\/design-system\/tokens\.css/, "Compatibility tokens must not be loaded twice");
assert.ok(
  manifest.indexOf('css/variables.css') > manifest.indexOf('css/animations.css'),
  "Canonical tokens must load after legacy compatibility styles",
);

assert.match(activeSkin, /@media \(max-width: 900px\)[\s\S]*?\.fab-speed-dial\s*\{\s*display:\s*none\s*!important;/, "The mobile layout must expose only the header primary action");
assert.match(activeSkin, /@media \(max-width: 900px\)[\s\S]*?\.app-shell,[\s\S]*?grid-template-columns:\s*1fr;[\s\S]*?\.sidebar,[\s\S]*?position:\s*fixed;[\s\S]*?transform:\s*translateX/, "The single-column shell and off-canvas sidebar must share the same breakpoint");
assert.match(index, /data-selection-bar hidden/, "The zero-selection action bar must start hidden");
assert.match(activeSkin, /\.app-shell \[hidden\]\s*\{\s*display:\s*none\s*!important;/, "Hidden application surfaces must not be forced back into the layout");
assert.match(renderer, /\[toolbar, tableDetails, footer\][\s\S]*?toggleAttribute\("hidden", !total\)/, "Empty transaction lists must hide toolbars, tables, and pagination");
assert.match(index, /categories-panel[^>]*role="dialog"[^>]*hidden/, "Category management must start as a secondary dialog");
assert.match(index, /data-open-category-manager/, "The transaction list must expose category management on demand");
assert.match(activeSkin, /dashboard-flow-panel\.has-empty-chart \.chart-canvas\s*\{\s*display:\s*none;/, "Empty dashboard charts must collapse on mobile");
assert.match(activeSkin, /overview-dashboard \.panel-heading\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\) auto;/, "Dashboard links must remain inside aligned card headers");
assert.match(activeSkin, /transaction-composer-panel[\s\S]*?var\(--safe-area-bottom\)/, "The mobile transaction composer must respect the bottom safe area");
assert.match(activeSkin, /\.app-footer[\s\S]*?var\(--safe-area-bottom\)/, "The compact mobile footer must respect the bottom safe area");
assert.match(activeSkin, /@media \(max-width: 340px\)[\s\S]*?\.topbar\s*\{[\s\S]*?minmax\(0, 1fr\)[\s\S]*?\.topbar-title\s*\{[\s\S]*?min-width:\s*0;[\s\S]*?text-overflow:\s*ellipsis;/, "Narrow mobile headers must reserve actions and truncate the title");
assert.match(legacyComponents, /@media \(max-width: 767px\)[\s\S]*?\.transaction-filters-card,[\s\S]*?\.pagination-controls\s*\{[\s\S]*?min-width:\s*0;[\s\S]*?max-width:\s*100%;/, "Mobile transaction controls must remain inside the panel");
assert.match(legacyComponents, /@media \(max-width: 340px\)[\s\S]*?\.pagination-controls\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/, "Narrow pagination must wrap without clipping either action");
assert.match(renderer, /function hasOpenModalDialog\(\)[\s\S]*?getClientRects\(\)\.length > 0/, "Open modal dialogs must be detected from their rendered state");
assert.match(renderer, /fabVisibleViews\.has\(state\.view\)[^;]*?!hasOpenModalDialog\(\)/, "Open dialogs must hide and disable the floating action button");
assert.match(activeSkin, /@media \(max-width: 900px\)[\s\S]*?\.dashboard-main-grid\s*\{\s*grid-template-columns:\s*minmax\(0, 1fr\);[\s\S]*?\.overview-dashboard \.panel-heading\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\) auto;/, "Mobile dashboard cards must use the full row without collapsing their headings");
assert.match(activeSkin, /overview-dashboard \.panel-heading :where\(\.ghost-action, \.pill\)[\s\S]*?width:\s*auto;[\s\S]*?white-space:\s*nowrap;/, "Dashboard header actions must override global full-width mobile buttons");
assert.match(activeSkin, /cashflow-chart-panel\.has-empty-chart \.chart-canvas\s*\{\s*display:\s*none;/, "Empty cashflow charts must not reserve canvas height on mobile");
assert.match(activeSkin, /cashflow-summary-card strong[\s\S]*?white-space:\s*nowrap;[\s\S]*?overflow-wrap:\s*normal;/, "Cashflow summary amounts must stay on one line");
assert.match(activeSkin, /calendar-day:disabled strong\s*\{\s*display:\s*none;/, "Empty narrow calendar days must omit redundant zero amounts");
assert.match(renderer, /function greetingName\(user\)[\s\S]*?\^sem login\$/, "Guest topbars must reject the local placeholder as a display name");
assert.match(renderer, /greetingLabel\.textContent = name \? `\$\{greeting\}, \$\{name\}` : greeting/, "Guest topbars must use a natural greeting fallback");
assert.match(renderer, /function chartLabelLimit\(width\)[\s\S]*?width < 360/, "Narrow cashflow charts must reduce their visible axis labels");
assert.match(renderer, /responsiveLabels:\s*true/, "Cashflow forecasts must opt into responsive axis labels");
const mobileReleaseBlock = activeSkin.match(/\/\* Mobile release layout \*\/[\s\S]*?(?=@media \(prefers-reduced-motion: reduce\)|$)/)?.[0] || "";
assert.ok(mobileReleaseBlock, "The mobile release layout contract is missing");
assert.doesNotMatch(mobileReleaseBlock, /(^|[;{\s])width:\s*(?:[3-9]\d{2,})px/m, "Mobile release rules must not introduce a fixed width larger than the viewport");

const luminance = (hex) => {
  const channels = hex.match(/[a-f\d]{2}/gi).map((value) => parseInt(value, 16) / 255);
  const linear = channels.map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return (0.2126 * linear[0]) + (0.7152 * linear[1]) + (0.0722 * linear[2]);
};
const contrast = (foreground, background) => {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
};
const assertContrast = (foreground, background, minimum, label) => {
  assert.ok(contrast(foreground, background) >= minimum, `${label} contrast is below ${minimum}:1`);
};

assertContrast("17202e", "f4f6f9", 4.5, "Light primary text/background");
assertContrast("4f5d70", "ffffff", 4.5, "Light secondary text/surface");
assertContrast("697586", "ffffff", 4.5, "Light muted text/surface");
assertContrast("071120", "4f8fff", 4.5, "Light primary button");
assertContrast("ffffff", "c83f4d", 4.5, "Light danger button");
assertContrast("205fbf", "ffffff", 3, "Light focus/surface");
assertContrast("0f7446", "e7f7ef", 4.5, "Light success badge");
assertContrast("805400", "fff5d6", 4.5, "Light warning badge");
assertContrast("a92e3b", "ffebee", 4.5, "Light danger badge");
assertContrast("066d92", "e4f6fc", 4.5, "Light info badge");
assertContrast("f7f9fc", "0b111d", 4.5, "Dark primary text/background");
assertContrast("c2cad6", "141c2a", 4.5, "Dark secondary text/surface");
assertContrast("9aa7b9", "141c2a", 4.5, "Dark muted text/surface");
assertContrast("071120", "4f8fff", 4.5, "Dark primary button");
assertContrast("071120", "e65765", 4.5, "Dark danger button");
assertContrast("8eb8ff", "141c2a", 3, "Dark focus/surface");
assertContrast("4fd18b", "153a2b", 4.5, "Dark success badge");
assertContrast("f2b95f", "3b2d16", 4.5, "Dark warning badge");
assertContrast("ff8993", "452128", 4.5, "Dark danger badge");
assertContrast("38bdf8", "12364a", 4.5, "Dark info badge");

console.log("Design system contract tests passed.");
