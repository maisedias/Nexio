(function (global) {
  "use strict";

  const ui = global.NexioUI = global.NexioUI || {};
  ui.mobile = Object.freeze({
    name: "mobile",
    maxWidth: 767,
    render(sharedRender) {
      ui.applyLayoutMode("mobile");
      return sharedRender();
    },
  });

  ui.rendererForWidth = function rendererForWidth(width) {
    if (width >= ui.desktop.minWidth) return ui.desktop;
    if (width >= ui.tablet.minWidth) return ui.tablet;
    return ui.mobile;
  };
})(window);
