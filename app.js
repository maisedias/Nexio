(function (global) {
  "use strict";

  function start() {
    if (!global.NexioApp?.bootstrap) {
      throw new Error("Nexio UI failed to initialize before the application bootstrap.");
    }
    global.NexioApp.bootstrap();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})(window);
