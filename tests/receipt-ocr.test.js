"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");

global.window = global;
require(path.join(__dirname, "..", "js", "core", "ai-assistant.js"));
require(path.join(__dirname, "..", "js", "core", "receipt-ocr.js"));

const receipt = global.NexioCore.receiptOcr;
const parser = global.NexioCore.aiAssistant.parseTransaction;
const fixedNow = new Date(2026, 7, 5, 12, 0, 0, 0);
const parse = (text) => parser(text, { now: fixedNow });

function serviceHarness(options = {}) {
  const calls = { permissions: [], photos: [], prepared: [], ocr: [], cleanup: 0 };
  const camera = {
    checkPermissions: async () => ({ camera: options.cameraPermission || "granted", photos: options.photosPermission || "granted" }),
    requestPermissions: async ({ permissions }) => {
      calls.permissions.push(permissions);
      const key = permissions[0];
      return { [key]: options.requestedPermission || "granted" };
    },
    getPhoto: async (photoOptions) => {
      calls.photos.push(photoOptions);
      if (options.photoError) throw options.photoError;
      return { path: "file:///raw.jpg", webPath: "capacitor://raw.jpg", width: 3000, height: 2000 };
    },
  };
  const prepareImage = async (photo) => {
    calls.prepared.push(photo);
    if (options.processingError) throw options.processingError;
    return {
      path: "file:///processed.jpg",
      previewUrl: "blob:receipt-preview",
      width: 1600,
      height: 1067,
      cleanup: async () => { calls.cleanup += 1; },
    };
  };
  const textRecognition = {
    processImage: async (ocrOptions) => {
      calls.ocr.push(ocrOptions);
      if (options.ocrError) throw options.ocrError;
      return { text: options.text ?? "Supermercado BH\nTOTAL R$ 58,90\nPIX\n04/08/2026", blocks: [{ text: "Supermercado BH" }] };
    },
  };
  return { calls, camera, prepareImage, textRecognition };
}

test("01. exposes every receipt modal state and valid transitions", () => {
  assert.deepEqual(receipt.STATES, ["idle", "choosing", "processing-image", "recognizing", "preview", "error", "permission-denied"]);
  assert.equal(receipt.transitionState("idle", "choosing"), true);
  assert.equal(receipt.transitionState("processing-image", "recognizing"), true);
  assert.equal(receipt.transitionState("recognizing", "preview"), true);
  assert.equal(receipt.transitionState("idle", "preview"), false);
});

test("02. constrains large images without upscaling small receipts", () => {
  assert.deepEqual(receipt.constrainDimensions(4000, 3000), { width: 2048, height: 1536, scale: 0.512 });
  assert.deepEqual(receipt.constrainDimensions(800, 600), { width: 800, height: 600, scale: 1 });
});

test("03. improves image contrast in place with bounded pixels", () => {
  const data = new Uint8ClampedArray([100, 110, 120, 255, 250, 250, 250, 255]);
  const result = receipt.enhanceContrast(data, { contrast: 1.2, saturation: 0.8 });
  assert.equal(result, data);
  assert.ok([...data].every((value) => value >= 0 && value <= 255));
  assert.notDeepEqual([...data], [100, 110, 120, 255, 250, 250, 250, 255]);
});

test("04. crops uniform empty borders around visible receipt content", () => {
  const width = 20;
  const height = 20;
  const data = new Uint8ClampedArray(width * height * 4).fill(255);
  for (let y = 4; y < 16; y += 1) {
    for (let x = 5; x < 15; x += 1) {
      const offset = ((y * width) + x) * 4;
      data[offset] = 40;
      data[offset + 1] = 40;
      data[offset + 2] = 40;
    }
  }
  const bounds = receipt.detectContentBounds(data, width, height, { threshold: 20 });
  assert.ok(bounds.x <= 5 && bounds.y <= 4);
  assert.ok(bounds.width < width && bounds.height < height);
});

test("05. OCR service processes a camera image and extracts text offline", async () => {
  const harness = serviceHarness();
  const states = [];
  const service = receipt.createService(harness);
  const result = await service.scan("camera", {
    onProcessingImage: () => states.push("processing-image"),
    onRecognizing: () => states.push("recognizing"),
  });
  assert.equal(result.text, "Supermercado BH\nTOTAL R$ 58,90\nPIX\n04/08/2026");
  assert.equal(result.previewUrl, "blob:receipt-preview");
  assert.deepEqual(states, ["processing-image", "recognizing"]);
  assert.equal(harness.calls.photos[0].source, "CAMERA");
  assert.equal(harness.calls.photos[0].correctOrientation, true);
  assert.equal(harness.calls.photos[0].width, 2048);
  assert.deepEqual(harness.calls.ocr[0], { path: "file:///processed.jpg", script: "LATIN" });
  await service.release();
  assert.equal(harness.calls.cleanup, 1);
});

test("06. gallery scan requests photos and enables native editing when asked", async () => {
  const harness = serviceHarness({ photosPermission: "prompt", requestedPermission: "granted" });
  const service = receipt.createService(harness);
  await service.scan("gallery", { allowEditing: true });
  assert.deepEqual(harness.calls.permissions, [["photos"]]);
  assert.equal(harness.calls.photos[0].source, "PHOTOS");
  assert.equal(harness.calls.photos[0].allowEditing, true);
});

test("07. permission denial blocks capture with a friendly recovery error", async () => {
  const harness = serviceHarness({ cameraPermission: "denied" });
  const service = receipt.createService(harness);
  await assert.rejects(service.scan("camera"), (error) => error.code === "permission-denied" && /Android settings/i.test(error.message));
  assert.equal(harness.calls.photos.length, 0);
});

test("08. no text found is reported without crashing", async () => {
  const harness = serviceHarness({ text: "   " });
  const service = receipt.createService(harness);
  await assert.rejects(service.scan("camera"), (error) => error.code === "no-text" && /No readable text/i.test(error.message));
});

test("09. unreadable and unavailable errors provide recovery guidance", () => {
  assert.equal(receipt.normalizeError({ code: "blurry-image" }).code, "unreadable");
  assert.equal(receipt.normalizeError({ code: "camera-unavailable" }, "camera").code, "camera-unavailable");
  assert.equal(receipt.normalizeError({ code: "ocr-plugin-unavailable" }).code, "ocr-unavailable");
});

test("10. cancelled scans invalidate work and clean temporary images", async () => {
  const harness = serviceHarness();
  const service = receipt.createService(harness);
  await service.scan("camera");
  assert.deepEqual(await service.cancel(), { cancelled: true });
  assert.equal(harness.calls.cleanup, 1);
});

test("11. market receipt reuses the financial parser", () => {
  assert.deepEqual(parse("Supermercado BH\nTOTAL R$ 58,90\nPIX\n04/08/2026"), {
    type: "expense",
    amount: 58.9,
    currency: "BRL",
    category: "Market",
    description: "Supermercado BH",
    paymentMethod: "Pix",
    account: null,
    date: "2026-08-04",
  });
  assert.equal(parse("MERCADO CENTRAL\nTOTAL R$ 1.258,90\nPIX").amount, 1258.9);
});

test("12. fuel receipt recognizes credit card", () => {
  const draft = parse("POSTO SHELL\nR$120,00\nCRÉDITO");
  assert.deepEqual([draft.type, draft.amount, draft.category, draft.description, draft.paymentMethod], ["expense", 120, "Fuel", "POSTO SHELL", "Credit Card"]);
});

test("13. Pix receipt recognizes bakery merchant", () => {
  const draft = parse("PADARIA CENTRAL\nTOTAL 35,00 BRL\nPIX");
  assert.deepEqual([draft.category, draft.description, draft.paymentMethod], ["Bakery", "PADARIA CENTRAL", "Pix"]);
});

test("14. debit and cash receipt patterns remain distinct", () => {
  assert.equal(parse("FARMÁCIA VIDA\nTOTAL R$ 42,00\nDÉBITO").paymentMethod, "Debit Card");
  assert.equal(parse("RESTAURANTE SABOR\nTOTAL R$ 35,00\nDINHEIRO").paymentMethod, "Cash");
});

test("15. transfer, TED, DOC and boleto patterns extend existing logic", () => {
  assert.equal(parse("TRANSFERÊNCIA TED\nTOTAL R$ 80,00").paymentMethod, "Bank Transfer");
  assert.equal(parse("LOJA CENTRAL\nTOTAL R$ 99,00\nBOLETO").paymentMethod, "Boleto");
});

test("16. OCR draft integration delegates only to the existing parser", () => {
  let calls = 0;
  const result = receipt.createDraft("POSTO SHELL\nR$120,00\nCRÉDITO", (text) => {
    calls += 1;
    return parser(text, { now: fixedNow });
  });
  assert.equal(calls, 1);
  assert.equal(result.draft.category, "Fuel");
});

test("17. receipt preview and manual confirmation contracts are present", () => {
  const root = path.join(__dirname, "..");
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const renderer = fs.readFileSync(path.join(root, "js", "ui", "shared-ui.js"), "utf8");
  const styles = fs.readFileSync(path.join(root, "nexio-v2.css"), "utf8");
  assert.match(html, /data-open-receipt-ocr/);
  assert.match(html, /data-receipt-source="camera"/);
  assert.match(html, /data-receipt-source="gallery"/);
  assert.match(html, /data-receipt-edit/);
  assert.match(html, /data-receipt-scan-again/);
  assert.match(html, /data-receipt-continue[^>]*disabled/);
  assert.match(html, /data-receipt-detected="amount"[\s\S]*data-receipt-detected="merchant"[\s\S]*data-receipt-detected="payment"[\s\S]*data-receipt-detected="date"[\s\S]*data-receipt-detected="category"/);
  assert.match(renderer, /createDraft\?\.\(result\.text, core\.aiAssistant\?\.parseTransaction\)/);
  assert.match(renderer, /function continueReceiptDraft\(\)[\s\S]*prefillTransactionFromAssistant/);
  assert.match(styles, /receipt-preview[\s\S]*grid-template-columns/);
  assert.match(styles, /@media \(max-width: 420px\)[\s\S]*receipt-source-options/);
});

test("18. native dependencies and local image processing contract are installed", () => {
  const root = path.join(__dirname, "..");
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  const processor = fs.readFileSync(path.join(root, "js", "ui", "receipt-image.js"), "utf8");
  const manifest = fs.readFileSync(path.join(root, "capacitor-overrides", "android", "AndroidManifest.xml"), "utf8");
  const androidPlugins = fs.readFileSync(path.join(root, "android", "app", "capacitor.build.gradle"), "utf8");
  assert.equal(packageJson.dependencies["@capacitor/camera"], "^8.2.2");
  assert.equal(packageJson.dependencies["@capacitor/filesystem"], "^8.1.2");
  assert.equal(packageJson.dependencies["@capacitor-mlkit/text-recognition"], "^8.2.0");
  assert.match(processor, /constrainDimensions/);
  assert.match(processor, /detectContentBounds/);
  assert.match(processor, /enhanceContrast/);
  assert.match(processor, /directory: "CACHE"/);
  assert.doesNotMatch(processor, /localStorage|saveStore|fetch\([^)]*https?:/);
  assert.match(manifest, /android\.permission\.CAMERA/);
  assert.match(androidPlugins, /capacitor-mlkit-text-recognition/);
});

console.log("Receipt OCR tests passed: 18/18.");
