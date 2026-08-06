package br.com.nexiofinanceiro.app;

import android.content.Intent;
import android.net.Uri;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.UUID;

@CapacitorPlugin(name = "NexioQuickActions")
public class NexioQuickActionsPlugin extends Plugin {
    public static final String ACTION_VOICE_ENTRY = "br.com.nexiofinanceiro.app.action.VOICE_ENTRY";
    public static final String ACTION_NEW_TRANSACTION = "br.com.nexiofinanceiro.app.action.NEW_TRANSACTION";
    public static final String ACTION_NEW_EXPENSE = "br.com.nexiofinanceiro.app.action.NEW_EXPENSE";
    public static final String ACTION_ASSISTANT = "br.com.nexiofinanceiro.app.action.ASSISTANT";
    public static final String EXTRA_SOURCE = "br.com.nexiofinanceiro.app.extra.SOURCE";
    private static final String EXTRA_HANDLED = "br.com.nexiofinanceiro.app.extra.QUICK_ACTION_HANDLED";
    private static final String EVENT_QUICK_ACTION = "quickAction";
    private final Object pendingLock = new Object();
    private JSObject pendingAction;

    @Override
    public void load() {
        receiveIntent(getActivity() != null ? getActivity().getIntent() : null);
    }

    @Override
    protected void handleOnNewIntent(Intent intent) {
        super.handleOnNewIntent(intent);
        receiveIntent(intent);
    }

    @PluginMethod
    public void getPendingAction(PluginCall call) {
        JSObject result = new JSObject();
        synchronized (pendingLock) {
            result.put("action", pendingAction);
            pendingAction = null;
        }
        call.resolve(result);
    }

    private void receiveIntent(Intent intent) {
        if (intent == null || intent.getBooleanExtra(EXTRA_HANDLED, false)) return;
        String action = actionFromIntent(intent);
        if (action.isEmpty()) return;
        intent.putExtra(EXTRA_HANDLED, true);

        JSObject payload = new JSObject();
        payload.put("id", UUID.randomUUID().toString());
        payload.put("action", action);
        payload.put("source", sourceFromIntent(intent));
        synchronized (pendingLock) {
            pendingAction = payload;
        }
        JSObject event = new JSObject();
        event.put("action", payload);
        notifyListeners(EVENT_QUICK_ACTION, event, true);
    }

    private String actionFromIntent(Intent intent) {
        String action = intent.getAction();
        if (ACTION_VOICE_ENTRY.equals(action)) return "voice-entry";
        if (ACTION_NEW_TRANSACTION.equals(action)) return "new-transaction";
        if (ACTION_NEW_EXPENSE.equals(action)) return "new-expense";
        if (ACTION_ASSISTANT.equals(action)) return "assistant";

        Uri data = intent.getData();
        if (!Intent.ACTION_VIEW.equals(action) || data == null || !"nexio".equalsIgnoreCase(data.getScheme())) return "";
        if (!"acao".equalsIgnoreCase(data.getHost())) return "";
        String path = data.getPath() == null ? "" : data.getPath().toLowerCase();
        if ("/voz".equals(path)) return "voice-entry";
        if ("/novo-lancamento".equals(path)) return "new-transaction";
        if ("/registrar-gasto".equals(path)) return "new-expense";
        if ("/assistente".equals(path)) return "assistant";
        return "";
    }

    private String sourceFromIntent(Intent intent) {
        String source = intent.getStringExtra(EXTRA_SOURCE);
        if (source != null && !source.trim().isEmpty()) return source.trim();
        return Intent.ACTION_VIEW.equals(intent.getAction()) ? "link" : "atalho";
    }
}
