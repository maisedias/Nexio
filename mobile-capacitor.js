(function () {
  const appOrigin = "https://nexiofinanceiro.vercel.app";
  const appHost = "nexiofinanceiro.vercel.app";

  function capacitorPlugins() {
    return window.Capacitor && window.Capacitor.Plugins ? window.Capacitor.Plugins : {};
  }

  function isNativeApp() {
    return Boolean(
      window.Capacitor?.isNativePlatform?.() ||
        /NexioFinanceiroAndroid/i.test(window.navigator.userAgent)
    );
  }

  function isAndroidNativeApp() {
    const platform = window.Capacitor?.getPlatform?.();
    return isNativeApp() && (platform === "android" || /Android/i.test(window.navigator.userAgent));
  }

  function markNativeState() {
    const nativeApp = isNativeApp();
    const androidApp = isAndroidNativeApp();
    document.documentElement.classList.toggle("is-native-app", nativeApp);
    document.documentElement.classList.toggle("is-android-app", androidApp);
    document.body?.classList.toggle("capacitor-android", androidApp);
    document.documentElement.classList.toggle("is-offline", !window.navigator.onLine);
  }

  async function configureNativeChrome() {
    if (!isNativeApp()) return;
    const { StatusBar, SplashScreen, Network, App } = capacitorPlugins();

    try {
      await StatusBar?.setOverlaysWebView?.({ overlay: false });
      await StatusBar?.setBackgroundColor?.({ color: "#0B1020" });
      await StatusBar?.setStyle?.({ style: "DARK" });
    } catch (_) {
      // The Web UI remains usable when the optional native status bar API is unavailable.
    }

    try {
      await SplashScreen?.hide?.();
    } catch (_) {
      // Capacitor will fall back to its default splash behavior.
    }

    try {
      const status = await Network?.getStatus?.();
      if (status) {
        document.documentElement.classList.toggle("is-offline", !status.connected);
        window.NexioApp?.handleConnectivity?.(status.connected);
      }
      Network?.addListener?.("networkStatusChange", (nextStatus) => {
        document.documentElement.classList.toggle("is-offline", !nextStatus.connected);
        window.NexioApp?.handleConnectivity?.(nextStatus.connected);
      });
    } catch (_) {
      // Browser online/offline events remain the connectivity fallback.
    }

    try {
      App?.addListener?.("backButton", () => {
        if (window.history.length > 1) {
          window.history.back();
          return;
        }
        if (window.confirm("Deseja sair do Nexio Financeiro?")) {
          App.exitApp();
        }
      });
    } catch (_) {
      // Browser history remains the back-navigation fallback.
    }
  }

  function handleExternalLinks(event) {
    if (!isNativeApp()) return;
    const link = event.target.closest?.("a[href]");
    if (!link) return;

    const url = new URL(link.href, appOrigin);
    const isHttp = url.protocol === "http:" || url.protocol === "https:";
    const isInternal = url.hostname === appHost;
    if (!isHttp || isInternal) return;

    event.preventDefault();
    const { Browser } = capacitorPlugins();
    if (Browser?.open) {
      Browser.open({ url: url.href });
    } else {
      window.open(url.href, "_blank", "noopener,noreferrer");
    }
  }

  document.addEventListener("click", handleExternalLinks, true);
  document.addEventListener("DOMContentLoaded", markNativeState);
  window.addEventListener("online", markNativeState);
  window.addEventListener("offline", markNativeState);
  window.addEventListener("load", configureNativeChrome);
  markNativeState();
})();
