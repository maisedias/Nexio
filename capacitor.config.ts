import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "br.com.nexiofinanceiro.app",
  appName: "Nexio Financeiro",
  webDir: "android-web",
  backgroundColor: "#eef7ff",
  appendUserAgent: " NexioFinanceiroAndroid/1.0",
  server: {
    cleartext: false,
    androidScheme: "https",
    allowNavigation: ["nexiofinanceiro.vercel.app"],
    errorPath: "offline.html"
  },
  android: {
    path: "android",
    backgroundColor: "#eef7ff",
    allowMixedContent: false,
    captureInput: true
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1500,
      backgroundColor: "#EEF7FF",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: false,
      splashImmersive: false
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#eef7ff",
      overlaysWebView: false
    }
  }
};

export default config;
