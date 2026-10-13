package br.com.nexiofinanceiro.app;

import android.content.Intent;
import android.content.Context;
import android.net.Uri;
import android.provider.Settings;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "NexioSettings")
public class NexioSettingsPlugin extends Plugin {
    @PluginMethod
    public void openAppSettings(PluginCall call) {
        Context context = getContext();
        if (context == null) {
            call.reject("context-unavailable", "context-unavailable");
            return;
        }
        try {
            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
            intent.setData(Uri.fromParts("package", context.getPackageName(), null));
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(intent);
            JSObject result = new JSObject();
            result.put("opened", true);
            call.resolve(result);
        } catch (Exception error) {
            call.reject("settings-unavailable", "settings-unavailable", error);
        }
    }
}
