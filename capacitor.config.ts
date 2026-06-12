import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "br.com.nexiofinanceiro.app",
  appName: "Nexio Financeiro",
  webDir: "android-web",
  backgroundColor: "#0d1411",
  appendUserAgent: " NexioFinanceiroAndroid/1.0",
  server: {
    cleartext: false,
    androidScheme: "https",
    allowNavigation: ["nexiofinanceiro.vercel.app"],
    errorPath: "offline.html"
  },
  android: {
    path: "android",
    backgroundColor: "#0d1411",
    allowMixedContent: false,
    captureInput: true
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 800,
      backgroundColor: "#0D1411",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: false,
      splashImmersive: false
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0d1411",
      overlaysWebView: false
    }
  }
};

export default config;
