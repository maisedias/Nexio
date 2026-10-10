"use strict";

const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const childProcess = require("node:child_process");

const root = path.resolve(__dirname, "..");
const destination = path.join(root, "android-web");
const files = [
  "index.html",
  "styles.css",
  "nexio-v2.css",
  "app.js",
  "i18n.js",
  "mobile-capacitor.js",
  "supabase-config.js",
  "politica-de-privacidade.html",
  "excluir-conta.html",
];
const directories = ["assets", "css", "js", "vendor"];

function git(...args) {
  return childProcess.execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function androidVersion() {
  const source = fs.readFileSync(path.join(root, "android", "app", "build.gradle"), "utf8");
  const code = Number(source.match(/\bversionCode\s+(\d+)/)?.[1]);
  const name = source.match(/\bversionName\s+["']([^"']+)["']/)?.[1];
  if (!Number.isInteger(code) || code < 1 || !name) throw new Error("Versão Android inválida em android/app/build.gradle.");
  return { code, name };
}

function cleanDestination() {
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(destination)) {
    if (entry === "nexio-logo.png") continue;
    fs.rmSync(path.join(destination, entry), { recursive: true, force: true });
  }
}

function copy(relativePath) {
  const source = path.join(root, relativePath);
  if (!fs.existsSync(source)) throw new Error(`Asset Web obrigatório ausente: ${relativePath}`);
  fs.cpSync(source, path.join(destination, relativePath), { recursive: true });
}

function assetRevision(relativePath) {
  const assetPath = path.join(destination, relativePath);
  if (!fs.existsSync(assetPath)) return null;
  return crypto.createHash("sha256").update(fs.readFileSync(assetPath)).digest("hex").slice(0, 12);
}

function versionedAssetUrl(url) {
  if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith("//") || url.startsWith("#")) return url;
  const [relativePath, fragment = ""] = url.split("#", 2);
  const cleanPath = relativePath.split("?", 1)[0];
  const revision = assetRevision(cleanPath);
  if (!revision) return url;
  return `${cleanPath}?v=${revision}${fragment ? `#${fragment}` : ""}`;
}

function fingerprintGeneratedAssets() {
  const indexPath = path.join(destination, "index.html");
  const stylesPath = path.join(destination, "styles.css");
  const styles = fs.readFileSync(stylesPath, "utf8").replace(
    /(@import\s+url\(["'])(.*?)(["']\))/gi,
    (_, prefix, url, suffix) => `${prefix}${versionedAssetUrl(url)}${suffix}`,
  );
  fs.writeFileSync(stylesPath, styles, "utf8");

  const index = fs.readFileSync(indexPath, "utf8").replace(
    /(<(?:link|script)\b[^>]*?\b(?:href|src)=")(.*?)(")/gi,
    (_, prefix, url, suffix) => `${prefix}${versionedAssetUrl(url)}${suffix}`,
  );
  fs.writeFileSync(indexPath, index, "utf8");
}

function buildMetadata() {
  const commit = git("rev-parse", "HEAD");
  const commitTimestamp = git("show", "-s", "--format=%cI", "HEAD");
  const dirty = Boolean(git("status", "--porcelain", "--untracked-files=no"));
  const version = androidVersion();
  return Object.freeze({
    versionName: version.name,
    versionCode: version.code,
    commit,
    buildTimestamp: commitTimestamp,
    releaseId: `${version.name}+${version.code}.${commit.slice(0, 12)}`,
    dirty,
  });
}

cleanDestination();
files.forEach(copy);
directories.forEach(copy);

const metadata = buildMetadata();
const generatedIndexPath = path.join(destination, "index.html");
const generatedIndex = fs.readFileSync(generatedIndexPath, "utf8").replace(
  "    <script src=\"supabase-config.js\"></script>",
  "    <script src=\"release-metadata.js\"></script>\n    <script src=\"supabase-config.js\"></script>",
);
fs.writeFileSync(generatedIndexPath, generatedIndex, "utf8");
fingerprintGeneratedAssets();
fs.writeFileSync(
  path.join(destination, "release-metadata.js"),
  `globalThis.__NEXIO_RELEASE__ = Object.freeze(${JSON.stringify({
    ...metadata,
    assetRevisions: Object.freeze({
      index: assetRevision("index.html"),
      styles: assetRevision("styles.css"),
      components: assetRevision("css/components.css"),
      ui: assetRevision("js/ui/shared-ui.js"),
      bridge: assetRevision("mobile-capacitor.js"),
    }),
  })});\n`,
  "utf8",
);

process.stdout.write(`Android Web assets: ${metadata.releaseId}${metadata.dirty ? " (working tree com alterações)" : ""}\n`);
