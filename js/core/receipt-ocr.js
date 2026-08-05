(function (global) {
  "use strict";

  const core = global.NexioCore = global.NexioCore || {};

  const STATES = Object.freeze([
    "idle",
    "choosing",
    "processing-image",
    "recognizing",
    "preview",
    "error",
    "permission-denied",
  ]);

  const TRANSITIONS = Object.freeze({
    idle: ["choosing", "processing-image", "error", "permission-denied"],
    choosing: ["idle", "processing-image", "error", "permission-denied"],
    "processing-image": ["recognizing", "error", "permission-denied", "idle"],
    recognizing: ["preview", "error", "idle"],
    preview: ["idle", "choosing", "processing-image", "error"],
    error: ["idle", "choosing", "processing-image", "permission-denied"],
    "permission-denied": ["idle", "choosing", "processing-image", "error"],
  });

  function transitionState(current, next) {
    if (!STATES.includes(current) || !STATES.includes(next)) return false;
    return current === next || TRANSITIONS[current].includes(next);
  }

  function normalizePermission(value) {
    const status = String(value || "prompt").toLowerCase();
    if (["granted", "limited"].includes(status)) return "granted";
    if (["denied", "restricted"].includes(status)) return "denied";
    return "prompt";
  }

  function normalizeError(error, source = "camera") {
    const raw = String(error?.code || error?.message || error || "").toLowerCase();
    if (/permission|denied|restricted|not authorized/.test(raw)) {
      return { code: "permission-denied", message: `${source === "gallery" ? "Photo library" : "Camera"} access is blocked. Allow access in Android settings and try again.` };
    }
    if (/cancel|canceled|cancelled|user cancelled/.test(raw)) {
      return { code: "cancelled", message: "Receipt selection was cancelled." };
    }
    if (/camera.*unavailable|no camera|not available/.test(raw) && source === "camera") {
      return { code: "camera-unavailable", message: "The camera is unavailable on this device. Choose a receipt from the gallery instead." };
    }
    if (/gallery.*unavailable|photo.*unavailable|pick.*unavailable/.test(raw) && source === "gallery") {
      return { code: "gallery-unavailable", message: "The gallery is unavailable on this device. Try the camera instead." };
    }
    if (/no.?text|empty.?text/.test(raw)) {
      return { code: "no-text", message: "No readable text was found. Flatten the receipt, improve the lighting, and scan again." };
    }
    if (/blur|unreadable|low.?quality/.test(raw)) {
      return { code: "unreadable", message: "The receipt looks blurry or unreadable. Hold the camera steady and scan again." };
    }
    if (/ocr|text recognition|plugin.*unavailable|not implemented|unsupported/.test(raw)) {
      return { code: "ocr-unavailable", message: "Offline receipt recognition is unavailable on this device. You can still enter the transaction manually." };
    }
    return { code: "ocr-error", message: "The receipt could not be read. Check the image and try again." };
  }

  function constrainDimensions(width, height, options = {}) {
    const safeWidth = Math.max(1, Number(width) || 1);
    const safeHeight = Math.max(1, Number(height) || 1);
    const maxDimension = Math.max(320, Number(options.maxDimension) || 2048);
    const maxPixels = Math.max(1024 * 1024, Number(options.maxPixels) || 4_000_000);
    const dimensionScale = Math.min(1, maxDimension / Math.max(safeWidth, safeHeight));
    const pixelScale = Math.min(1, Math.sqrt(maxPixels / (safeWidth * safeHeight)));
    const scale = Math.min(dimensionScale, pixelScale);
    return {
      width: Math.max(1, Math.round(safeWidth * scale)),
      height: Math.max(1, Math.round(safeHeight * scale)),
      scale,
    };
  }

  function enhanceContrast(data, options = {}) {
    if (!data || typeof data.length !== "number") return data;
    const contrast = Math.max(1, Math.min(1.5, Number(options.contrast) || 1.16));
    const saturation = Math.max(0, Math.min(1, Number(options.saturation) || 0.82));
    for (let index = 0; index < data.length; index += 4) {
      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];
      const luminance = (red * 0.2126) + (green * 0.7152) + (blue * 0.0722);
      data[index] = Math.max(0, Math.min(255, ((luminance + ((red - luminance) * saturation) - 128) * contrast) + 128));
      data[index + 1] = Math.max(0, Math.min(255, ((luminance + ((green - luminance) * saturation) - 128) * contrast) + 128));
      data[index + 2] = Math.max(0, Math.min(255, ((luminance + ((blue - luminance) * saturation) - 128) * contrast) + 128));
    }
    return data;
  }

  function detectContentBounds(data, width, height, options = {}) {
    const safeWidth = Math.max(1, Number(width) || 1);
    const safeHeight = Math.max(1, Number(height) || 1);
    if (!data || data.length < safeWidth * safeHeight * 4) return { x: 0, y: 0, width: safeWidth, height: safeHeight };
    const cornerIndexes = [0, safeWidth - 1, (safeHeight - 1) * safeWidth, (safeHeight * safeWidth) - 1];
    const background = cornerIndexes.reduce((sum, pixel) => sum + ((data[pixel * 4] + data[(pixel * 4) + 1] + data[(pixel * 4) + 2]) / 3), 0) / cornerIndexes.length;
    const threshold = Math.max(12, Number(options.threshold) || 24);
    const stride = Math.max(1, Math.floor(Math.min(safeWidth, safeHeight) / 360));
    let left = safeWidth;
    let right = -1;
    let top = safeHeight;
    let bottom = -1;
    for (let y = 0; y < safeHeight; y += stride) {
      for (let x = 0; x < safeWidth; x += stride) {
        const offset = ((y * safeWidth) + x) * 4;
        const luminance = (data[offset] + data[offset + 1] + data[offset + 2]) / 3;
        if (Math.abs(luminance - background) < threshold) continue;
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
    if (right < left || bottom < top) return { x: 0, y: 0, width: safeWidth, height: safeHeight };
    const padding = Math.round(Math.min(safeWidth, safeHeight) * 0.025);
    left = Math.max(0, left - padding);
    top = Math.max(0, top - padding);
    right = Math.min(safeWidth - 1, right + padding);
    bottom = Math.min(safeHeight - 1, bottom + padding);
    const croppedWidth = right - left + 1;
    const croppedHeight = bottom - top + 1;
    if ((croppedWidth * croppedHeight) < (safeWidth * safeHeight * 0.08)) return { x: 0, y: 0, width: safeWidth, height: safeHeight };
    return { x: left, y: top, width: croppedWidth, height: croppedHeight };
  }

  function createDraft(text, parser, options = {}) {
    const extractedText = String(text || "").trim();
    if (!extractedText || typeof parser !== "function") return { text: extractedText, draft: null };
    return { text: extractedText, draft: parser(extractedText, options) || null };
  }

  function createService(options = {}) {
    const camera = options.camera;
    const textRecognition = options.textRecognition;
    const prepareImage = options.prepareImage;
    const settingsPlugin = options.settingsPlugin;
    let generation = 0;
    let activeImage = null;

    async function cleanupImage() {
      if (!activeImage?.cleanup) {
        activeImage = null;
        return;
      }
      const cleanup = activeImage.cleanup;
      activeImage = null;
      try {
        await cleanup();
      } catch (_) {
        // Temporary image cleanup is best-effort and contains no business data.
      }
    }

    async function ensurePermission(source) {
      if (!camera?.checkPermissions || !camera?.requestPermissions) return true;
      const permissionName = source === "camera" ? "camera" : "photos";
      let status = await camera.checkPermissions();
      let permission = normalizePermission(status?.[permissionName]);
      if (permission === "prompt") {
        status = await camera.requestPermissions({ permissions: [permissionName] });
        permission = normalizePermission(status?.[permissionName]);
      }
      if (permission !== "granted") throw normalizeError({ code: "permission-denied" }, source);
      return true;
    }

    async function scan(source, scanOptions = {}) {
      const normalizedSource = source === "gallery" ? "gallery" : "camera";
      if (!camera?.getPhoto) throw normalizeError({ code: `${normalizedSource}-unavailable` }, normalizedSource);
      if (!textRecognition?.processImage) throw normalizeError({ code: "ocr-plugin-unavailable" }, normalizedSource);
      if (typeof prepareImage !== "function") throw normalizeError({ code: "image-processing-unavailable" }, normalizedSource);
      const operation = ++generation;
      await cleanupImage();
      try {
        await ensurePermission(normalizedSource);
        const photo = await camera.getPhoto({
          source: normalizedSource === "camera" ? "CAMERA" : "PHOTOS",
          resultType: "URI",
          quality: 88,
          width: 2048,
          height: 2048,
          correctOrientation: true,
          allowEditing: Boolean(scanOptions.allowEditing),
          saveToGallery: false,
          promptLabelHeader: "Scan receipt",
          promptLabelPhoto: "Choose from gallery",
          promptLabelPicture: "Use camera",
        });
        if (operation !== generation) throw normalizeError({ code: "cancelled" }, normalizedSource);
        scanOptions.onProcessingImage?.();
        const prepared = await prepareImage(photo, { source: normalizedSource });
        if (operation !== generation) {
          await prepared?.cleanup?.();
          throw normalizeError({ code: "cancelled" }, normalizedSource);
        }
        activeImage = prepared;
        scanOptions.onRecognizing?.();
        const result = await textRecognition.processImage({ path: prepared.path, script: "LATIN" });
        if (operation !== generation) throw normalizeError({ code: "cancelled" }, normalizedSource);
        const text = String(result?.text || "").trim();
        if (!text) throw normalizeError({ code: "no-text" }, normalizedSource);
        return {
          text,
          blocks: Array.isArray(result?.blocks) ? result.blocks : [],
          previewUrl: prepared.previewUrl || photo.webPath || photo.path || "",
          width: prepared.width || photo.width || null,
          height: prepared.height || photo.height || null,
          source: normalizedSource,
        };
      } catch (error) {
        if (error?.code && error?.message) throw error;
        throw normalizeError(error, normalizedSource);
      }
    }

    async function cancel() {
      generation += 1;
      await cleanupImage();
      return { cancelled: true };
    }

    async function release() {
      await cleanupImage();
    }

    async function openSettings() {
      if (!settingsPlugin?.openAppSettings) return false;
      try {
        await settingsPlugin.openAppSettings();
        return true;
      } catch (_) {
        return false;
      }
    }

    return Object.freeze({ scan, cancel, release, openSettings });
  }

  core.receiptOcr = Object.freeze({
    STATES,
    transitionState,
    normalizePermission,
    normalizeError,
    constrainDimensions,
    enhanceContrast,
    detectContentBounds,
    createDraft,
    createService,
  });
})(globalThis);
