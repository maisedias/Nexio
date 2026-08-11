"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const packageJson = JSON.parse(read("package.json"));
const packageLock = JSON.parse(read("package-lock.json"));
const index = read("index.html");
const config = read("capacitor.config.ts");
const gradle = read("android/app/build.gradle");
const mainActivity = read("capacitor-overrides/android/MainActivity.java");
const builder = read("scripts/build-android-web.js");
const vercel = JSON.parse(read("vercel.json"));
let checks = 0;

function check(callback) {
  callback();
  checks += 1;
}

check(() => {
  assert.match(packageJson.scripts["android:sync"], /^npm run android:web && npx cap sync android/);
  assert.match(packageJson.scripts["android:build:apk"], /^npm run android:sync/);
  assert.match(packageJson.scripts["android:build:aab"], /^npm run android:sync/);
});

check(() => {
  assert.match(config, /webDir:\s*"android-web"/);
  assert.doesNotMatch(config, /server\.url|allowNavigation|nexiofinanceiro\.vercel\.app/);
});

check(() => {
  assert.match(builder, /release-metadata\.js/);
  assert.match(builder, /rev-parse", "HEAD/);
  assert.match(builder, /versionCode/);
  assert.match(builder, /buildTimestamp/);
});

check(() => {
  assert.match(gradle, /versionCode\s+5/);
  assert.match(gradle, /versionName\s+"1\.0\.5"/);
  assert.match(gradle, /NEXIO_ANDROID_KEYSTORE_FILE/);
  assert.match(gradle, /verifyReleaseSigning/);
  assert.doesNotMatch(gradle, /storePassword\s+["'][^"']+["']/);
});

check(() => {
  assert.match(mainActivity, /LOCAL_HOST\s*=\s*"localhost"/);
  assert.doesNotMatch(mainActivity, /nexiofinanceiro\.vercel\.app|OFFLINE_URL|ConnectivityManager/);
});

check(() => {
  assert.match(index, /vendor\/supabase\/supabase\.js/);
  assert.match(index, /vendor\/lucide\/lucide\.min\.js/);
  assert.doesNotMatch(index, /cdn\.jsdelivr\.net|unpkg\.com/);
});

check(() => {
  const headers = Object.fromEntries(vercel.headers[0].headers.map(({ key, value }) => [key, value]));
  assert.match(headers["Content-Security-Policy"], /frame-ancestors 'none'/);
  assert.equal(headers["X-Content-Type-Options"], "nosniff");
  assert.ok(headers["Referrer-Policy"]);
  assert.ok(headers["Permissions-Policy"]);
});

check(() => {
  assert.equal(packageJson.devDependencies["@capacitor/assets"], undefined);
  assert.equal(packageJson.devDependencies["@capacitor/cli"], "8.5.0");
  assert.deepEqual(packageJson.overrides, { "brace-expansion": "5.0.9", tar: "7.5.22", uuid: "11.1.1" });
});

check(() => {
  assert.equal(packageLock.packages["node_modules/tar"].version, "7.5.22");
  assert.equal(packageLock.packages["node_modules/uuid"].version, "11.1.1");
  const brace = packageLock.packages["node_modules/brace-expansion"] || packageLock.packages["node_modules/glob/node_modules/brace-expansion"];
  assert.equal(brace.version, "5.0.9");
});

check(() => {
  const productionSources = ["app.js", "i18n.js", "mobile-capacitor.js"];
  const walk = (directory) => fs.readdirSync(path.join(root, directory), { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(relative) : (entry.name.endsWith(".js") ? [relative] : []);
  });
  productionSources.push(...walk("js"));
  for (const file of productionSources) assert.doesNotMatch(read(file), /console\.debug\s*\(/, file);
});

check(() => {
  assert.ok(fs.existsSync(path.join(root, "vendor/supabase/supabase.js")));
  assert.ok(fs.existsSync(path.join(root, "vendor/lucide/lucide.min.js")));
  for (const core of ["lstm", "simd-lstm", "relaxedsimd-lstm"]) {
    assert.ok(fs.existsSync(path.join(root, `vendor/tesseract/tesseract-core-${core}.wasm.js`)));
  }
});

check(() => {
  assert.match(read(".gitignore"), /android\/signing\.properties/);
  assert.match(read(".gitignore"), /android-web\/\*/);
});

console.log(`Release readiness tests passed: ${checks}/${checks}.`);
