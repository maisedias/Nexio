(function (global) {
  "use strict";

  const ui = global.NexioUI = global.NexioUI || {};
  ui.tablet = Object.freeze({
    name: "tablet",
    minWidth: 768,
    maxWidth: 1199,
    render(sharedRender) {
      ui.applyLayoutMode("tablet");
      return sharedRender();
    },
  });
})(window);
