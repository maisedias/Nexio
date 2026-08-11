package br.com.nexiofinanceiro.app;

import android.app.AlertDialog;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;

import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

public class MainActivity extends BridgeActivity {
    private static final String LOCAL_HOST = "localhost";
    private static final int SYSTEM_BAR_COLOR = Color.parseColor("#0B1020");
    private WebView webView;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(NexioSettingsPlugin.class);
        registerPlugin(NexioShareTargetPlugin.class);
        registerPlugin(NexioQuickActionsPlugin.class);
        Window window = getWindow();
        WindowCompat.setDecorFitsSystemWindows(window, false);
        window.setStatusBarColor(SYSTEM_BAR_COLOR);
        window.setNavigationBarColor(SYSTEM_BAR_COLOR);
        window.getDecorView().setBackgroundColor(SYSTEM_BAR_COLOR);

        super.onCreate(savedInstanceState);

        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, window.getDecorView());
        controller.setAppearanceLightStatusBars(false);
        controller.setAppearanceLightNavigationBars(false);

        applySystemBarInsets();

        webView = getBridge().getWebView();
        webView.setBackgroundColor(SYSTEM_BAR_COLOR);
        webView.getSettings().setDomStorageEnabled(true);
        webView.setWebViewClient(new NexioWebViewClient(getBridge()));

    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
            return;
        }

        new AlertDialog.Builder(this)
            .setTitle("Sair do Nexio Financeiro?")
            .setMessage("Deseja fechar o aplicativo?")
            .setNegativeButton("Cancelar", null)
            .setPositiveButton("Sair", (dialog, which) -> finish())
            .show();
    }

    private void applySystemBarInsets() {
        final View content = findViewById(android.R.id.content);
        if (content == null) return;

        ViewCompat.setOnApplyWindowInsetsListener(content, (view, insets) -> {
            Insets statusBars = insets.getInsets(WindowInsetsCompat.Type.statusBars());
            Insets navigationBars = insets.getInsets(WindowInsetsCompat.Type.navigationBars());
            view.setPadding(
                statusBars.left,
                statusBars.top,
                statusBars.right,
                navigationBars.bottom
            );
            return insets;
        });

        ViewCompat.requestApplyInsets(content);
    }

    private final class NexioWebViewClient extends BridgeWebViewClient {
        NexioWebViewClient(Bridge bridge) {
            super(bridge);
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri uri = request.getUrl();
            if (uri == null) return false;

            String scheme = uri.getScheme();
            String host = uri.getHost();
            if (LOCAL_HOST.equals(host) || "capacitor".equals(scheme)) {
                return false;
            }

            if ("http".equals(scheme) || "https".equals(scheme) || "mailto".equals(scheme) || "tel".equals(scheme)) {
                Intent intent = new Intent(Intent.ACTION_VIEW, uri);
                startActivity(intent);
                return true;
            }

            return false;
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            super.onPageFinished(view, url);
            view.evaluateJavascript("document.documentElement.classList.add('is-native-app');document.body.classList.add('capacitor-android')", null);
        }
    }
}
