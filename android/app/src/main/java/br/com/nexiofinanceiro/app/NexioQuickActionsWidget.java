package br.com.nexiofinanceiro.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;

public class NexioQuickActionsWidget extends AppWidgetProvider {
    private static final int REQUEST_NEW_EXPENSE = 4101;
    private static final int REQUEST_VOICE_ENTRY = 4102;

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.nexio_quick_actions_widget);
            views.setOnClickPendingIntent(
                R.id.widget_new_expense,
                quickAction(context, NexioQuickActionsPlugin.ACTION_NEW_EXPENSE, REQUEST_NEW_EXPENSE)
            );
            views.setOnClickPendingIntent(
                R.id.widget_voice_entry,
                quickAction(context, NexioQuickActionsPlugin.ACTION_VOICE_ENTRY, REQUEST_VOICE_ENTRY)
            );
            manager.updateAppWidget(appWidgetId, views);
        }
    }

    private PendingIntent quickAction(Context context, String action, int requestCode) {
        Intent intent = new Intent(context, MainActivity.class);
        intent.setAction(action);
        intent.putExtra(NexioQuickActionsPlugin.EXTRA_SOURCE, "widget");
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        return PendingIntent.getActivity(
            context,
            requestCode,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
    }
}
