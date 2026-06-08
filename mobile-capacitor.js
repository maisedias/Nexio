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
      await StatusBar?.setBackgroundColor?.({ color: "#eef7ff" });
      await StatusBar?.setStyle?.({ style: "LIGHT" });
    } catch (error) {
      console.debug("StatusBar indisponivel", error);
    }

    try {
      await SplashScreen?.hide?.();
    } catch (error) {
      console.debug("SplashScreen indisponivel", error);
    }

    try {
      const status = await Network?.getStatus?.();
      if (status) document.documentElement.classList.toggle("is-offline", !status.connected);
      Network?.addListener?.("networkStatusChange", (nextStatus) => {
        document.documentElement.classList.toggle("is-offline", !nextStatus.connected);
      });
    } catch (error) {
      console.debug("Network indisponivel", error);
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
    } catch (error) {
      console.debug("App back button indisponivel", error);
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
