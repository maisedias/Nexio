(function (global) {
  "use strict";

  const platform = global.NexioPlatform = global.NexioPlatform || {};
  const currentScriptUrl = global.document?.currentScript?.src || "";
  const applicationRoot = currentScriptUrl
    ? new URL("../../", currentScriptUrl).href
    : `${global.location?.origin || ""}/`;
  const IMAGE_TYPES = Object.freeze(["image/jpeg", "image/png", "image/webp"]);
  const IMAGE_EXTENSIONS = Object.freeze(["jpg", "jpeg", "png", "webp"]);
  const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
  const DEFAULT_OCR_TIMEOUT_MS = 60_000;

  function capabilityError(code, message, details = {}) {
    const error = new Error(message);
    error.code = code;
    Object.assign(error, details);
    return error;
  }

  function isNativeRuntime(host = global) {
    try {
      return Boolean(host.Capacitor?.isNativePlatform?.());
    } catch (_) {
      return false;
    }
  }

  function nativePlatform(host = global) {
    if (!isNativeRuntime(host)) return "web";
    try {
      return String(host.Capacitor?.getPlatform?.() || "native");
    } catch (_) {
      return "native";
    }
  }

  function webSpeechConstructor(host = global) {
    return host.SpeechRecognition || host.webkitSpeechRecognition || null;
  }

  function createWebSpeechPlugin(host = global) {
    const Recognition = webSpeechConstructor(host);
    if (typeof Recognition !== "function") return null;
    const listeners = new Map();
    let recognition = null;
    let lastTranscript = "";

    function emit(eventName, payload) {
      for (const listener of listeners.get(eventName) || []) listener(payload);
    }

    async function addListener(eventName, listener) {
      const entries = listeners.get(eventName) || new Set();
      entries.add(listener);
      listeners.set(eventName, entries);
      return Object.freeze({
        async remove() {
          entries.delete(listener);
        },
      });
    }

    async function microphonePermission() {
      if (typeof host.navigator?.permissions?.query !== "function") return "prompt";
      try {
        const result = await host.navigator.permissions.query({ name: "microphone" });
        return ["granted", "denied"].includes(result?.state) ? result.state : "prompt";
      } catch (_) {
        return "prompt";
      }
    }

    async function requestMicrophonePermission() {
      const status = await microphonePermission();
      if (status === "denied") {
        throw capabilityError("permission-denied", "A permissão do microfone foi negada no navegador.", { platform: "web" });
      }
      // SpeechRecognition requests its own microphone permission on start.
      // A separate getUserMedia prompt would duplicate permission UI and can
      // leave browsers waiting even though recognition is already supported.
      return { speechRecognition: "granted" };
    }

    function transcriptFromResults(event) {
      const values = [];
      for (let index = 0; index < (event?.results?.length || 0); index += 1) {
        const value = String(event.results[index]?.[0]?.transcript || "").trim();
        if (value) values.push(value);
      }
      return values.join(" ").replace(/\s+/g, " ").trim();
    }

    async function start(options = {}) {
      if (recognition) {
        try { recognition.abort(); } catch (_) {}
      }
      lastTranscript = "";
      recognition = new Recognition();
      recognition.lang = "pt-BR";
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = Math.max(1, Number(options.maxResults) || 3);
      recognition.onstart = () => emit("listeningState", { state: "started", platform: "web" });
      recognition.onresult = (event) => {
        const text = transcriptFromResults(event);
        if (!text) return;
        lastTranscript = text;
        emit("partialResults", { accumulatedText: text, matches: [text], platform: "web" });
      };
      recognition.onerror = (event) => {
        emit("error", {
          code: event?.error || "recognition-error",
          message: event?.message || "",
          platform: "web",
        });
      };
      recognition.onend = () => {
        recognition = null;
        emit("listeningState", { state: "stopped", platform: "web" });
      };
      try {
        recognition.start();
      } catch (error) {
        recognition = null;
        throw capabilityError("recognition-error", "Não foi possível iniciar o reconhecimento de voz.", { platform: "web", cause: error });
      }
      return { matches: [] };
    }

    async function stop() {
      if (!recognition) return;
      emit("listeningState", { state: "stoppingListening", platform: "web" });
      recognition.stop();
    }

    async function forceStop() {
      if (!recognition) return;
      const current = recognition;
      recognition = null;
      current.abort();
    }

    return Object.freeze({
      addListener,
      async available() { return { available: true }; },
      async isOnDeviceRecognitionAvailable() { return { available: false }; },
      async checkPermissions() { return { speechRecognition: await microphonePermission() }; },
      requestPermissions: requestMicrophonePermission,
      start,
      stop,
      forceStop,
      async getLastPartialResult() { return { text: lastTranscript }; },
    });
  }

  function fileExtension(name) {
    return String(name || "").toLowerCase().split(".").pop() || "";
  }

  function validateImageFile(file, options = {}) {
    if (!file) throw capabilityError("cancelled", "A seleção da imagem foi cancelada.", { platform: "web" });
    if (!Number.isFinite(file.size) || file.size <= 0) {
      throw capabilityError("invalid-file", "A imagem selecionada está vazia ou não pode ser lida.", { platform: "web" });
    }
    const extension = fileExtension(file.name);
    const validType = IMAGE_TYPES.includes(String(file.type || "").toLowerCase());
    const validExtension = IMAGE_EXTENSIONS.includes(extension);
    if ((!validType && file.type) || !validExtension) {
      throw capabilityError("invalid-file", "Escolha uma imagem JPG, JPEG, PNG ou WEBP.", { platform: "web" });
    }
    const maxBytes = Math.max(1024, Number(options.maxBytes) || MAX_IMAGE_BYTES);
    if (file.size > maxBytes) {
      throw capabilityError("file-too-large", "A imagem deve ter no máximo 12 MB.", { platform: "web" });
    }
    return file;
  }

  function createWebFilePicker(options = {}) {
    const host = options.host || global;
    const input = options.input;
    if (!input || typeof input.click !== "function") return null;

    async function getPhoto(request = {}) {
      const cameraIntent = String(request.source || "").toUpperCase() === "CAMERA";
      input.value = "";
      input.accept = IMAGE_TYPES.join(",");
      if (cameraIntent) input.setAttribute?.("capture", "environment");
      else input.removeAttribute?.("capture");

      return new Promise((resolve, reject) => {
        let settled = false;
        let focusTimer = null;
        const cleanup = () => {
          input.removeEventListener?.("change", onChange);
          input.removeEventListener?.("cancel", onCancel);
          host.removeEventListener?.("focus", onFocus);
          if (focusTimer) host.clearTimeout?.(focusTimer);
        };
        const finish = (callback, value) => {
          if (settled) return;
          settled = true;
          cleanup();
          callback(value);
        };
        const onCancel = () => finish(reject, capabilityError("cancelled", "A seleção da imagem foi cancelada.", { platform: "web" }));
        const onChange = () => {
          try {
            const file = validateImageFile(input.files?.[0], options);
            const webPath = host.URL.createObjectURL(file);
            finish(resolve, {
              path: webPath,
              webPath,
              file,
              platform: "web",
              async cleanup() { host.URL.revokeObjectURL(webPath); },
            });
          } catch (error) {
            finish(reject, error);
          }
        };
        const onFocus = () => {
          focusTimer = host.setTimeout?.(() => {
            if (!settled && !input.files?.length) onCancel();
          }, 700);
        };
        input.addEventListener?.("change", onChange, { once: true });
        input.addEventListener?.("cancel", onCancel, { once: true });
        host.addEventListener?.("focus", onFocus, { once: true });
        input.click();
      });
    }

    return Object.freeze({
      async checkPermissions() { return { camera: "granted", photos: "granted" }; },
      async requestPermissions() { return { camera: "granted", photos: "granted" }; },
      getPhoto,
    });
  }

  function createWebTextRecognition(options = {}) {
    const host = options.host || global;
    const assetRoot = String(options.assetRoot || applicationRoot);
    let runtimePromise = null;
    let workerPromise = null;
    let generation = 0;
    const progressListeners = new Set();
    const cancellationHandlers = new Set();
    const timeoutMs = Math.max(10, Number(options.timeoutMs) || DEFAULT_OCR_TIMEOUT_MS);

    function asset(path) {
      return new URL(path, assetRoot).href;
    }

    async function loadRuntime() {
      if (host.Tesseract?.createWorker) return host.Tesseract;
      if (!host.document?.createElement) throw capabilityError("ocr-plugin-unavailable", "OCR Web indisponível.", { platform: "web" });
      if (!runtimePromise) {
        runtimePromise = new Promise((resolve, reject) => {
          const script = host.document.createElement("script");
          script.src = asset("vendor/tesseract/tesseract.min.js");
          script.async = true;
          script.dataset.nexioOcrRuntime = "true";
          script.onload = () => host.Tesseract?.createWorker
            ? resolve(host.Tesseract)
            : reject(capabilityError("ocr-plugin-unavailable", "OCR Web indisponível.", { platform: "web" }));
          script.onerror = () => reject(capabilityError("ocr-plugin-unavailable", "Não foi possível carregar o OCR local.", { platform: "web" }));
          host.document.head.append(script);
        }).catch((error) => {
          runtimePromise = null;
          throw error;
        });
      }
      return runtimePromise;
    }

    async function getWorker() {
      if (!workerPromise) {
        workerPromise = loadRuntime().then((runtime) => runtime.createWorker("por", 1, {
          workerPath: asset("vendor/tesseract/worker.min.js"),
          corePath: asset("vendor/tesseract"),
          langPath: asset("vendor/tesseract/lang"),
          workerBlobURL: false,
          gzip: true,
          logger: (message) => progressListeners.forEach((listener) => listener(message)),
        })).catch((error) => {
          workerPromise = null;
          throw error;
        });
      }
      return workerPromise;
    }

    async function terminateWorker() {
      generation += 1;
      cancellationHandlers.forEach((cancel) => cancel());
      cancellationHandlers.clear();
      const pending = workerPromise;
      workerPromise = null;
      if (!pending) return;
      try {
        const worker = await pending;
        await worker?.terminate?.();
      } catch (_) {
        // A failed or already terminated worker has no durable state.
      }
    }

    async function processImage(request = {}) {
      const source = request.image || request.path;
      if (!source) throw capabilityError("missing-image", "Nenhuma imagem foi selecionada.", { platform: "web" });
      const operation = ++generation;
      const progressListener = typeof request.onProgress === "function" ? request.onProgress : null;
      const timerHost = host.setTimeout ? host : global;
      let timeoutId = null;
      let cancelRecognition = null;
      if (progressListener) progressListeners.add(progressListener);
      try {
        const recognition = (async () => {
          const worker = await getWorker();
          if (operation !== generation) throw capabilityError("cancelled", "A leitura foi cancelada.", { platform: "web" });
          return worker.recognize(source, { rotateAuto: true });
        })();
        const timeout = new Promise((_, reject) => {
          timeoutId = timerHost.setTimeout(() => reject(capabilityError(
            "ocr-timeout",
            "A leitura demorou mais que o esperado e foi interrompida.",
            { platform: "web", timeoutMs },
          )), timeoutMs);
        });
        const cancellation = new Promise((_, reject) => {
          cancelRecognition = () => reject(capabilityError("cancelled", "A leitura foi cancelada.", { platform: "web" }));
          cancellationHandlers.add(cancelRecognition);
        });
        const result = await Promise.race([recognition, timeout, cancellation]);
        if (operation !== generation) throw capabilityError("cancelled", "A leitura foi cancelada.", { platform: "web" });
        return {
          text: String(result?.data?.text || "").trim(),
          blocks: Array.isArray(result?.data?.blocks) ? result.data.blocks : [],
          confidence: Number(result?.data?.confidence) || 0,
          platform: "web",
        };
      } catch (error) {
        if (error?.code === "ocr-timeout") void terminateWorker();
        if (error?.code) throw error;
        throw capabilityError("ocr-error", "Não foi possível ler o comprovante localmente.", { platform: "web", cause: error });
      } finally {
        if (timeoutId !== null) timerHost.clearTimeout(timeoutId);
        if (cancelRecognition) cancellationHandlers.delete(cancelRecognition);
        if (progressListener) progressListeners.delete(progressListener);
      }
    }

    return Object.freeze({
      processImage,
      cancel: terminateWorker,
      release: terminateWorker,
    });
  }

  function detectCapabilities(options = {}) {
    const host = options.host || global;
    const plugins = host.Capacitor?.Plugins || {};
    const native = isNativeRuntime(host);
    const nativeSpeech = native && typeof plugins.SpeechRecognition?.start === "function";
    const webSpeech = typeof webSpeechConstructor(host) === "function";
    const nativeCamera = native && typeof plugins.Camera?.getPhoto === "function";
    const nativeOcr = native && typeof plugins.TextRecognition?.processImage === "function";
    const webPicker = Boolean(options.fileInput?.click);
    const webOcr = Boolean(host.document?.createElement || host.Tesseract?.createWorker);
    return Object.freeze({
      platform: nativePlatform(host),
      native,
      speech: nativeSpeech ? "android" : (webSpeech ? "web" : "unavailable"),
      filePicker: nativeCamera ? "android" : (webPicker ? "web" : "unavailable"),
      ocr: nativeOcr ? "android" : (webOcr ? "web" : "unavailable"),
    });
  }

  function resolveAssistantCapabilities(options = {}) {
    const host = options.host || global;
    const plugins = host.Capacitor?.Plugins || {};
    const detected = detectCapabilities({ host, fileInput: options.fileInput });
    const speechPlugin = detected.speech === "android" ? plugins.SpeechRecognition : createWebSpeechPlugin(host);
    const camera = detected.filePicker === "android"
      ? plugins.Camera
      : createWebFilePicker({ host, input: options.fileInput, maxBytes: options.maxImageBytes });
    const textRecognition = detected.ocr === "android"
      ? plugins.TextRecognition
      : createWebTextRecognition({ host, assetRoot: options.assetRoot });
    return Object.freeze({
      detected,
      speech: Object.freeze({
        provider: detected.speech,
        plugin: speechPlugin,
        settingsPlugin: detected.native ? plugins.NexioSettings : null,
      }),
      receipt: Object.freeze({
        pickerProvider: detected.filePicker,
        ocrProvider: detected.ocr,
        camera,
        textRecognition,
        filesystem: detected.native ? plugins.Filesystem : null,
        settingsPlugin: detected.native ? plugins.NexioSettings : null,
      }),
    });
  }

  Object.assign(platform, {
    IMAGE_TYPES,
    MAX_IMAGE_BYTES,
    DEFAULT_OCR_TIMEOUT_MS,
    capabilityError,
    isNativeRuntime,
    nativePlatform,
    detectCapabilities,
    validateImageFile,
    createWebSpeechPlugin,
    createWebFilePicker,
    createWebTextRecognition,
    resolveAssistantCapabilities,
  });
  Object.freeze(platform);
})(globalThis);
