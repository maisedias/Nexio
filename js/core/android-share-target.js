(function (global) {
  "use strict";

  const core = global.NexioCore = global.NexioCore || {};

  const STATES = Object.freeze([
    "idle",
    "processing",
    "recognizing",
    "preview",
    "error",
  ]);

  function shareError(code, message, details = {}) {
    const error = new Error(message);
    error.code = code;
    Object.assign(error, details);
    return error;
  }

  function contentKind(mimeType, explicitKind) {
    const kind = String(explicitKind || "").toLowerCase();
    const mime = String(mimeType || "").toLowerCase();
    if (["text", "image", "pdf"].includes(kind)) return kind;
    if (mime.startsWith("text/")) return "text";
    if (mime.startsWith("image/")) return "image";
    if (mime === "application/pdf") return "pdf";
    return "unsupported";
  }

  function normalizePayload(value) {
    const source = value?.content || value || {};
    const items = Array.isArray(source.items) ? source.items.filter(Boolean) : [];
    const selected = items[0] || source;
    const kind = contentKind(selected.mimeType, selected.kind);
    return Object.freeze({
      id: String(selected.id || source.id || ""),
      kind,
      mimeType: String(selected.mimeType || ""),
      name: String(selected.name || ""),
      path: String(selected.path || ""),
      text: String(selected.text || source.text || "").trim(),
      size: Math.max(0, Number(selected.size) || 0),
      ignoredCount: Math.max(0, Number(source.ignoredCount) || Math.max(0, items.length - 1)),
      errorCode: String(selected.errorCode || ""),
      errorMessage: String(selected.errorMessage || ""),
    });
  }

  function normalizeError(value) {
    const explicitCode = String(value?.code || "").toLowerCase();
    const raw = String(value?.code || value?.message || value || "").toLowerCase();
    if (/permission|denied|security/.test(raw)) {
      return shareError("permission-denied", "Nexio could not read the shared content. Share it again and keep file access enabled.");
    }
    if (/corrupt|malformed|password|encrypted|pdf/.test(raw)) {
      return shareError("corrupted-pdf", "This PDF could not be opened. Try another copy or share an image of the receipt.");
    }
    if (/unsupported|mime|file type/.test(raw)) {
      return shareError("unsupported-file", "This file type is not supported. Share plain text, an image, or a PDF receipt.");
    }
    if (/missing|empty|no content|not found/.test(raw)) {
      return shareError("missing-content", "No shared content was found. Return to the source app and share it again.");
    }
    if (/no.?text|unreadable|ocr/.test(raw)) {
      return shareError("unreadable-content", "No readable transaction text was found. Try a clearer image or another receipt.");
    }
    if (/parser|transaction/.test(raw)) {
      return shareError("parser-failure", "The transaction details could not be identified. Reprocess the content or enter it manually.", { extractedText: value?.extractedText || "" });
    }
    if (explicitCode === "cancelled") return value;
    if (value?.code && value?.message) return value;
    return shareError("share-processing-error", "The shared content could not be processed. Please try again.");
  }

  function createService(options = {}) {
    const nativeShare = options.nativeShare;
    const receiptOcr = options.receiptOcr;
    const parser = options.parser;
    const inputPipeline = options.inputPipeline || core.financialInput;
    const toWebPath = typeof options.toWebPath === "function" ? options.toWebPath : (path) => path;
    const maxPdfPages = Math.max(1, Number(options.maxPdfPages) || 24);
    let generation = 0;
    let activePayload = null;

    function parseText(text, source) {
      const result = inputPipeline?.createDraft?.(text, parser, {}, { source });
      if (!result?.valid) {
        throw shareError("parser-failure", "The transaction details could not be identified. Reprocess the content or enter it manually.", { extractedText: String(text || "").trim() });
      }
      return result;
    }

    async function recognizeImage(payload, events = {}) {
      if (!receiptOcr?.scanFile) throw shareError("ocr-unavailable", "Offline receipt recognition is unavailable on this device.");
      const result = await receiptOcr.scanFile({
        path: payload.path,
        webPath: toWebPath(payload.path),
      }, {
        source: "shared-image",
        onProcessingImage: () => events.onState?.("processing", "Preparing the shared image..."),
        onRecognizing: () => events.onState?.("recognizing", "Reading the shared image offline..."),
      });
      const parsed = parseText([result.text, payload.text].filter(Boolean).join("\n"), "shared-image");
      return {
        ...parsed,
        content: payload,
        previewUrl: result.previewUrl || toWebPath(payload.path),
        extractedText: parsed.text,
      };
    }

    async function recognizePdf(payload, operation, events = {}) {
      if (!nativeShare?.renderPdfPage || !receiptOcr?.scanFile) {
        throw shareError("pdf-unavailable", "PDF receipt processing is unavailable on this device.");
      }
      const extracted = [];
      let previewUrl = "";
      let pageCount = 0;
      let truncated = false;
      let pageIndex = 0;
      do {
        if (operation !== generation) throw shareError("cancelled", "Shared content processing was cancelled.");
        events.onState?.("processing", `Preparing PDF page ${pageIndex + 1}...`);
        let rendered;
        try {
          rendered = await nativeShare.renderPdfPage({
            id: payload.id,
            path: payload.path,
            page: pageIndex,
            maxDimension: 1800,
          });
        } catch (error) {
          throw normalizeError(error);
        }
        pageCount = Math.max(1, Number(rendered?.pageCount) || 1);
        if (!previewUrl) previewUrl = toWebPath(rendered.path);
        try {
          const result = await receiptOcr.scanFile({
            path: rendered.path,
            webPath: toWebPath(rendered.path),
          }, {
            source: "shared-pdf",
            onRecognizing: () => events.onState?.("recognizing", `Reading PDF page ${pageIndex + 1} of ${pageCount}...`),
          });
          if (result?.text) extracted.push(result.text);
        } catch (error) {
          const normalized = core.receiptOcr?.normalizeError?.(error, "shared-pdf") || error;
          if (!new Set(["no-text", "unreadable"]).has(normalized?.code)) throw normalized;
        } finally {
          if (pageIndex > 0) {
            try {
              await nativeShare.releaseRenderedPage?.({ path: rendered?.path });
            } catch (_) {
              // Native cache cleanup remains best-effort while the first page is retained for preview.
            }
          }
        }
        pageIndex += 1;
        truncated = pageIndex >= maxPdfPages && pageIndex < pageCount;
      } while (pageIndex < pageCount && pageIndex < maxPdfPages);

      const combined = [extracted.join("\n"), payload.text].filter(Boolean).join("\n").trim();
      if (!combined) throw shareError("unreadable-content", "No readable text was found in this PDF receipt.");
      const parsed = parseText(combined, "shared-pdf");
      return {
        ...parsed,
        content: payload,
        previewUrl,
        extractedText: combined,
        pageCount,
        processedPages: pageIndex,
        truncated,
      };
    }

    async function process(value, events = {}) {
      const payload = normalizePayload(value);
      activePayload = payload;
      const operation = ++generation;
      events.onState?.("processing", "Processing shared content locally...");
      try {
        if (payload.errorCode) throw shareError(payload.errorCode, payload.errorMessage || "The shared content could not be opened.");
        if (payload.kind === "unsupported") throw shareError("unsupported-file", "This file type is not supported. Share plain text, an image, or a PDF receipt.");
        if (payload.kind === "text") {
          if (!payload.text) throw shareError("missing-content", "No shared text was found.");
          const parsed = parseText(payload.text, "shared-text");
          return { ...parsed, content: payload, previewUrl: "", extractedText: parsed.text };
        }
        if (!payload.path) throw shareError("missing-content", "The shared file is no longer available. Share it again from the source app.");
        const result = payload.kind === "image"
          ? await recognizeImage(payload, events)
          : await recognizePdf(payload, operation, events);
        if (operation !== generation) throw shareError("cancelled", "Shared content processing was cancelled.");
        return Object.freeze(result);
      } catch (error) {
        if (error?.code === "cancelled") throw error;
        throw normalizeError(error);
      }
    }

    async function pending() {
      if (!nativeShare?.getPendingShare) return null;
      const result = await nativeShare.getPendingShare();
      return result?.content || null;
    }

    async function listen(handler) {
      if (!nativeShare?.addListener) return null;
      return nativeShare.addListener("shareReceived", (event) => handler(event?.content || event));
    }

    async function cancel(options = {}) {
      generation += 1;
      await receiptOcr?.cancel?.();
      if (options.release !== false && activePayload?.id) {
        try {
          await nativeShare?.releaseShare?.({ id: activePayload.id, path: activePayload.path });
        } catch (_) {
          // Shared files live in the cache and may already have been removed by Android.
        }
      }
      if (options.release !== false) activePayload = null;
      return { cancelled: true };
    }

    async function release() {
      return cancel({ release: true });
    }

    return Object.freeze({ process, pending, listen, cancel, release });
  }

  core.androidShareTarget = Object.freeze({
    STATES,
    contentKind,
    normalizePayload,
    normalizeError,
    createService,
  });
})(globalThis);
