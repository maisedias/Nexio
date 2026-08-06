(function (global) {
  "use strict";

  const core = global.NexioCore = global.NexioCore || {};

  const STATES = Object.freeze({
    IDLE: "idle",
    LISTENING: "listening",
    PROCESSING: "processing",
    RECOGNIZED: "recognized",
    ERROR: "error",
    PERMISSION_DENIED: "permission-denied",
  });

  const stateTransitions = Object.freeze({
    open: STATES.IDLE,
    start: STATES.LISTENING,
    stop: STATES.PROCESSING,
    recognized: STATES.RECOGNIZED,
    empty: STATES.ERROR,
    error: STATES.ERROR,
    denied: STATES.PERMISSION_DENIED,
    retry: STATES.IDLE,
    cancel: STATES.IDLE,
  });

  function transitionState(currentState, eventName) {
    if (!Object.values(STATES).includes(currentState)) return STATES.IDLE;
    return stateTransitions[eventName] || currentState;
  }

  function transcriptFrom(value) {
    const event = value && typeof value === "object" ? value : {};
    return String(
      event.accumulatedText ||
      event.accumulated ||
      event.matches?.find((match) => String(match || "").trim()) ||
      "",
    ).trim();
  }

  function permissionState(status) {
    return String(status?.speechRecognition || "prompt").toLowerCase();
  }

  function recognitionError(code, message) {
    const error = new Error(message);
    error.code = code;
    return error;
  }

  function normalizeError(value) {
    const source = value && typeof value === "object" ? value : {};
    const rawCode = String(source.code || source.errorCode || "recognition-error").toLowerCase();
    const rawMessage = String(source.message || "").trim();

    if (/permission|not-allowed|denied/.test(rawCode) || /permission|permiss[aã]o/.test(rawMessage.toLowerCase())) {
      return recognitionError("permission-denied", "O acesso ao microfone está bloqueado. Permita o acesso nas configurações do Android e tente novamente.");
    }
    if (/no[-_ ]?speech|speech[-_ ]?timeout|no[-_ ]?match/.test(rawCode)) {
      return recognitionError("no-speech", "Nenhuma fala foi detectada. Tente novamente e fale depois que o microfone começar a ouvir.");
    }
    if (/unavailable|not[-_ ]?present|not[-_ ]?supported|service/.test(rawCode)) {
      return recognitionError("recognition-unavailable", "O reconhecimento de voz não está disponível neste aparelho. Verifique o serviço de voz do Android e tente novamente.");
    }
    if (/cancel|aborted/.test(rawCode)) {
      return recognitionError("cancelled", "Voice recognition was cancelled.");
    }
    return recognitionError("recognition-error", rawMessage || "Não foi possível concluir o reconhecimento de voz. Tente novamente.");
  }

  function createDraft(transcript, parser, options = {}) {
    const text = String(transcript || "").trim();
    const pipelineResult = core.financialInput?.createDraft?.(text, parser, options, { source: "voice" });
    const draft = pipelineResult ? pipelineResult.draft : (text && typeof parser === "function" ? parser(text, options) : null);
    return Object.freeze({ transcript: text, draft, valid: Boolean(draft) });
  }

  function createService(options = {}) {
    const plugin = options.plugin;
    const settingsPlugin = options.settingsPlugin;
    const language = String(options.language || "").trim() || undefined;
    let handles = [];
    let handlers = {};
    let active = false;
    let cancelled = false;
    let lastTranscript = "";
    let settling = null;

    async function removeListeners() {
      const current = handles;
      handles = [];
      await Promise.all(current.map(async (handle) => {
        try {
          await handle?.remove?.();
        } catch (_) {
          // Listener disposal is best-effort after native teardown.
        }
      }));
    }

    function emitTranscript(event) {
      const text = transcriptFrom(event);
      if (!text) return;
      lastTranscript = text;
      handlers.onTranscript?.(text);
    }

    async function readLastTranscript() {
      if (typeof plugin?.getLastPartialResult !== "function") return lastTranscript;
      try {
        const result = await plugin.getLastPartialResult();
        const text = String(result?.text || "").trim() || transcriptFrom(result);
        if (text) lastTranscript = text;
      } catch (_) {
        // The most recent streamed result remains usable when the cache is unavailable.
      }
      return lastTranscript;
    }

    async function finish() {
      if (settling) return settling;
      settling = (async () => {
        active = false;
        const text = await readLastTranscript();
        await removeListeners();
        if (cancelled) {
          handlers.onCancelled?.();
          return { cancelled: true, transcript: "" };
        }
        if (!text) {
          handlers.onEmpty?.();
          return { cancelled: false, transcript: "" };
        }
        handlers.onComplete?.(text);
        return { cancelled: false, transcript: text };
      })();
      try {
        return await settling;
      } finally {
        settling = null;
      }
    }

    async function fail(value) {
      active = false;
      await removeListeners();
      if (cancelled) return;
      handlers.onError?.(normalizeError(value));
    }

    async function addListener(eventName, listener) {
      if (typeof plugin?.addListener !== "function") return;
      const handle = await plugin.addListener(eventName, listener);
      handles.push(handle);
    }

    async function availability() {
      if (!plugin || typeof plugin.available !== "function") return { available: false, onDevice: false };
      const result = await plugin.available();
      if (!result?.available) return { available: false, onDevice: false };
      let onDevice = false;
      if (typeof plugin.isOnDeviceRecognitionAvailable === "function") {
        try {
          onDevice = Boolean((await plugin.isOnDeviceRecognitionAvailable(language ? { language } : undefined))?.available);
        } catch (_) {
          onDevice = false;
        }
      }
      return { available: true, onDevice };
    }

    async function ensurePermission() {
      if (typeof plugin?.checkPermissions !== "function") {
        throw recognitionError("recognition-unavailable", "O reconhecimento de voz não está disponível neste aparelho.");
      }
      let status = await plugin.checkPermissions();
      if (permissionState(status) === "prompt" || permissionState(status) === "prompt-with-rationale") {
        status = await plugin.requestPermissions();
      }
      if (permissionState(status) !== "granted") {
        throw recognitionError("permission-denied", "O acesso ao microfone está bloqueado. Permita o acesso nas configurações do Android e tente novamente.");
      }
      return status;
    }

    async function start(nextHandlers = {}) {
      if (active || settling) await cancel();
      handlers = nextHandlers;
      cancelled = false;
      lastTranscript = "";

      const support = await availability();
      if (!support.available) {
        throw recognitionError("recognition-unavailable", "O reconhecimento de voz não está disponível neste aparelho. Verifique o serviço de voz do Android e tente novamente.");
      }
      await ensurePermission();

      await addListener("partialResults", emitTranscript);
      await addListener("listeningState", (event) => {
        const state = event?.state || event?.status;
        if (state === "started") handlers.onListening?.({ onDevice: support.onDevice });
        if (state === "stoppingListening") handlers.onProcessing?.();
        if (state === "stopped" && !cancelled) void finish();
      });
      await addListener("error", (event) => {
        if (!cancelled) void fail(event);
      });

      active = true;
      handlers.onListening?.({ onDevice: support.onDevice });
      try {
        const result = await plugin.start({
          ...(language ? { language } : {}),
          maxResults: 3,
          popup: false,
          partialResults: true,
          useOnDeviceRecognition: support.onDevice,
          allowForSilence: 7000,
        });
        emitTranscript(result);
        return support;
      } catch (error) {
        active = false;
        await removeListeners();
        throw normalizeError(error);
      }
    }

    async function stop() {
      if (!active) return finish();
      handlers.onProcessing?.();
      try {
        await plugin.stop();
      } catch (error) {
        await fail(error);
        return { cancelled: false, transcript: "" };
      }
      return finish();
    }

    async function cancel() {
      cancelled = true;
      active = false;
      if (typeof plugin?.forceStop === "function") {
        try {
          await plugin.forceStop({ timeout: 800 });
        } catch (_) {
          // Cancellation must remain safe even if native recognition already stopped.
        }
      } else if (typeof plugin?.stop === "function") {
        try {
          await plugin.stop();
        } catch (_) {
          // Cancellation must remain safe even if native recognition already stopped.
        }
      }
      await removeListeners();
      handlers.onCancelled?.();
      return { cancelled: true, transcript: "" };
    }

    async function openSettings() {
      if (typeof settingsPlugin?.openAppSettings !== "function") return false;
      await settingsPlugin.openAppSettings();
      return true;
    }

    return Object.freeze({ availability, ensurePermission, start, stop, cancel, openSettings });
  }

  core.speechRecognition = Object.freeze({
    STATES,
    transitionState,
    transcriptFrom,
    normalizeError,
    createDraft,
    createService,
  });
})(globalThis);
