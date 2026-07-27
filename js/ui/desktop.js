(function (global) {
  "use strict";

  const ui = global.NexioUI = global.NexioUI || {};
  ui.desktop = Object.freeze({
    name: "desktop",
    minWidth: 1200,
    render(sharedRender) {
      ui.applyLayoutMode("desktop");
      return sharedRender();
    },
  });
})(window);
