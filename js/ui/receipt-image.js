(function (global) {
  "use strict";

  const ui = global.NexioUI = global.NexioUI || {};

  function loadImage(source) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("unreadable-image"));
      image.src = source;
    });
  }

  function canvasBlob(canvas, quality = 0.84) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("image-processing-unavailable"));
      }, "image/jpeg", quality);
    });
  }

  function blobBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || "").split(",")[1] || "");
      reader.onerror = () => reject(new Error("image-processing-unavailable"));
      reader.readAsDataURL(blob);
    });
  }

  function createProcessor(options = {}) {
    const filesystem = options.filesystem;
    const receiptCore = options.receiptCore;

    async function prepare(photo) {
      const source = photo?.webPath || photo?.path;
      if (!source) throw new Error("image-processing-unavailable");
      let image;
      try {
        image = await loadImage(source);
      } finally {
        await photo?.cleanup?.();
      }
      const dimensions = receiptCore.constrainDimensions(image.naturalWidth, image.naturalHeight);
      const working = document.createElement("canvas");
      working.width = dimensions.width;
      working.height = dimensions.height;
      const workingContext = working.getContext("2d", { alpha: false, willReadFrequently: true });
      if (!workingContext) throw new Error("image-processing-unavailable");
      workingContext.fillStyle = "#ffffff";
      workingContext.fillRect(0, 0, working.width, working.height);
      workingContext.drawImage(image, 0, 0, working.width, working.height);

      const pixels = workingContext.getImageData(0, 0, working.width, working.height);
      const bounds = receiptCore.detectContentBounds(pixels.data, working.width, working.height);
      const output = document.createElement("canvas");
      output.width = bounds.width;
      output.height = bounds.height;
      const outputContext = output.getContext("2d", { alpha: false, willReadFrequently: true });
      if (!outputContext) throw new Error("image-processing-unavailable");
      outputContext.fillStyle = "#ffffff";
      outputContext.fillRect(0, 0, output.width, output.height);
      outputContext.drawImage(working, bounds.x, bounds.y, bounds.width, bounds.height, 0, 0, output.width, output.height);
      const outputPixels = outputContext.getImageData(0, 0, output.width, output.height);
      receiptCore.enhanceContrast(outputPixels.data);
      outputContext.putImageData(outputPixels, 0, 0);

      const blob = await canvasBlob(output);
      const previewUrl = URL.createObjectURL(blob);
      if (!filesystem?.writeFile || !filesystem?.getUri) {
        return {
          path: previewUrl,
          blob,
          previewUrl,
          width: output.width,
          height: output.height,
          async cleanup() { URL.revokeObjectURL(previewUrl); },
        };
      }

      const data = await blobBase64(blob);
      const path = `nexio-receipts/receipt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
      await filesystem.writeFile({ path, data, directory: "CACHE", recursive: true });
      const local = await filesystem.getUri({ path, directory: "CACHE" });
      return {
        path: local.uri,
        blob,
        previewUrl,
        width: output.width,
        height: output.height,
        async cleanup() {
          URL.revokeObjectURL(previewUrl);
          try {
            await filesystem.deleteFile?.({ path, directory: "CACHE" });
          } catch (_) {
            // Cache cleanup is best-effort; no receipt data is persisted in the Nexio store.
          }
        },
      };
    }

    return Object.freeze({ prepare });
  }

  ui.receiptImage = Object.freeze({ createProcessor });
})(globalThis);
