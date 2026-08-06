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
      return shareError("permission-denied", "O Nexio não conseguiu ler o conteúdo compartilhado. Compartilhe novamente e mantenha o acesso ao arquivo permitido.");
    }
    if (/corrupt|malformed|password|encrypted|pdf/.test(raw)) {
      return shareError("corrupted-pdf", "Não foi possível abrir este PDF. Tente outra cópia ou compartilhe uma imagem do comprovante.");
    }
    if (/unsupported|mime|file type/.test(raw)) {
      return shareError("unsupported-file", "Este tipo de arquivo não é compatível. Compartilhe texto simples, uma imagem ou um comprovante em PDF.");
    }
    if (/missing|empty|no content|not found/.test(raw)) {
      return shareError("missing-content", "Nenhum conteúdo compartilhado foi encontrado. Volte ao aplicativo de origem e compartilhe novamente.");
    }
    if (/no.?text|unreadable|ocr/.test(raw)) {
      return shareError("unreadable-content", "Nenhum texto de lançamento legível foi encontrado. Tente uma imagem mais nítida ou outro comprovante.");
    }
    if (/parser|transaction/.test(raw)) {
      return shareError("parser-failure", "Não foi possível identificar os detalhes do lançamento. Reprocesse o conteúdo ou preencha manualmente.", { extractedText: value?.extractedText || "" });
    }
    if (explicitCode === "cancelled") return value;
    if (value?.code && value?.message) return value;
    return shareError("share-processing-error", "Não foi possível processar o conteúdo compartilhado. Tente novamente.");
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
        throw shareError("parser-failure", "Não foi possível identificar os detalhes do lançamento. Reprocesse o conteúdo ou preencha manualmente.", { extractedText: String(text || "").trim() });
      }
      return result;
    }

    async function recognizeImage(payload, events = {}) {
      if (!receiptOcr?.scanFile) throw shareError("ocr-unavailable", "O reconhecimento local de comprovantes não está disponível neste aparelho.");
      const result = await receiptOcr.scanFile({
        path: payload.path,
        webPath: toWebPath(payload.path),
      }, {
        source: "shared-image",
        onProcessingImage: () => events.onState?.("processing", "Preparando a imagem compartilhada..."),
        onRecognizing: () => events.onState?.("recognizing", "Lendo a imagem compartilhada localmente..."),
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
        throw shareError("pdf-unavailable", "O processamento de comprovantes em PDF não está disponível neste aparelho.");
      }
      const extracted = [];
      let previewUrl = "";
      let pageCount = 0;
      let truncated = false;
      let pageIndex = 0;
      do {
        if (operation !== generation) throw shareError("cancelled", "Shared content processing was cancelled.");
        events.onState?.("processing", `Preparando a página ${pageIndex + 1} do PDF...`);
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
            onRecognizing: () => events.onState?.("recognizing", `Lendo a página ${pageIndex + 1} de ${pageCount} do PDF...`),
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
      if (!combined) throw shareError("unreadable-content", "Nenhum texto legível foi encontrado neste comprovante em PDF.");
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
      events.onState?.("processing", "Processando o conteúdo compartilhado localmente...");
      try {
        if (payload.errorCode) throw shareError(payload.errorCode, payload.errorMessage || "Não foi possível abrir o conteúdo compartilhado.");
        if (payload.kind === "unsupported") throw shareError("unsupported-file", "Este tipo de arquivo não é compatível. Compartilhe texto simples, uma imagem ou um comprovante em PDF.");
        if (payload.kind === "text") {
          if (!payload.text) throw shareError("missing-content", "Nenhum texto compartilhado foi encontrado.");
          const parsed = parseText(payload.text, "shared-text");
          return { ...parsed, content: payload, previewUrl: "", extractedText: parsed.text };
        }
        if (!payload.path) throw shareError("missing-content", "O arquivo compartilhado não está mais disponível. Compartilhe-o novamente pelo aplicativo de origem.");
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
