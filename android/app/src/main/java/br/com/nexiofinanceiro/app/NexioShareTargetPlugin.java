package br.com.nexiofinanceiro.app;

import android.content.ContentResolver;
import android.content.Intent;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.pdf.PdfRenderer;
import android.net.Uri;
import android.os.ParcelFileDescriptor;
import android.provider.OpenableColumns;
import android.webkit.MimeTypeMap;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Locale;
import java.util.UUID;

@CapacitorPlugin(name = "NexioShareTarget")
public class NexioShareTargetPlugin extends Plugin {
    private static final String EVENT_SHARE_RECEIVED = "shareReceived";
    private static final String EXTRA_HANDLED = "br.com.nexiofinanceiro.app.SHARE_HANDLED";
    private static final long MAX_SHARED_BYTES = 64L * 1024L * 1024L;
    private final Object pendingLock = new Object();
    private JSObject pendingShare;

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
    public void getPendingShare(PluginCall call) {
        JSObject result = new JSObject();
        synchronized (pendingLock) {
            result.put("content", pendingShare);
            pendingShare = null;
        }
        call.resolve(result);
    }

    @PluginMethod
    public void renderPdfPage(PluginCall call) {
        getBridge().execute(() -> {
            String path = call.getString("path", "");
            int pageIndex = Math.max(0, call.getInt("page", 0));
            int maxDimension = Math.max(640, Math.min(2048, call.getInt("maxDimension", 1800)));
            try {
                File pdf = safeCacheFile(path);
                String id = safeToken(call.getString("id", "share"));
                try (
                    ParcelFileDescriptor descriptor = ParcelFileDescriptor.open(pdf, ParcelFileDescriptor.MODE_READ_ONLY);
                    PdfRenderer renderer = new PdfRenderer(descriptor)
                ) {
                    if (pageIndex >= renderer.getPageCount()) throw new IOException("missing-pdf-page");
                    try (PdfRenderer.Page page = renderer.openPage(pageIndex)) {
                        double scale = Math.min(1d, (double) maxDimension / Math.max(page.getWidth(), page.getHeight()));
                        int width = Math.max(1, (int) Math.round(page.getWidth() * scale));
                        int height = Math.max(1, (int) Math.round(page.getHeight() * scale));
                        Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
                        bitmap.eraseColor(Color.WHITE);
                        page.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY);
                        File output = new File(shareCache(), "share-" + id + "-page-" + pageIndex + ".jpg");
                        try (FileOutputStream stream = new FileOutputStream(output)) {
                            if (!bitmap.compress(Bitmap.CompressFormat.JPEG, 88, stream)) throw new IOException("pdf-render-failed");
                        } finally {
                            bitmap.recycle();
                        }
                        JSObject result = new JSObject();
                        result.put("path", output.getAbsolutePath());
                        result.put("page", pageIndex);
                        result.put("pageCount", renderer.getPageCount());
                        result.put("width", width);
                        result.put("height", height);
                        call.resolve(result);
                    }
                }
            } catch (SecurityException error) {
                call.reject("permission-denied", "permission-denied", error);
            } catch (Exception error) {
                call.reject("corrupted-pdf", "corrupted-pdf", error);
            }
        });
    }

    @PluginMethod
    public void releaseRenderedPage(PluginCall call) {
        getBridge().execute(() -> {
            try {
                File file = safeCacheFile(call.getString("path", ""));
                JSObject result = new JSObject();
                result.put("released", !file.exists() || file.delete());
                call.resolve(result);
            } catch (Exception error) {
                call.resolve(new JSObject().put("released", false));
            }
        });
    }

    @PluginMethod
    public void releaseShare(PluginCall call) {
        getBridge().execute(() -> {
            String id = safeToken(call.getString("id", ""));
            String path = call.getString("path", "");
            boolean released = true;
            try {
                if (!path.isEmpty()) {
                    File original = safeCacheFile(path);
                    released = !original.exists() || original.delete();
                }
                File[] cached = shareCache().listFiles();
                if (cached != null && !id.isEmpty()) {
                    String prefix = "share-" + id + "-page-";
                    for (File file : cached) {
                        if (file.getName().startsWith(prefix) && file.exists()) released = file.delete() && released;
                    }
                }
            } catch (Exception error) {
                released = false;
            }
            call.resolve(new JSObject().put("released", released));
        });
    }

    private void receiveIntent(Intent intent) {
        if (intent == null || intent.getBooleanExtra(EXTRA_HANDLED, false)) return;
        String action = intent.getAction();
        if (!Intent.ACTION_SEND.equals(action) && !Intent.ACTION_SEND_MULTIPLE.equals(action)) return;
        intent.putExtra(EXTRA_HANDLED, true);
        getBridge().execute(() -> {
            try {
                publish(readIntent(intent));
            } catch (SecurityException error) {
                publish(errorPayload("permission-denied", "Nexio could not read the shared file."));
            } catch (IOException error) {
                String code = String.valueOf(error.getMessage()).contains("unsupported") ? "unsupported-file" : "missing-content";
                publish(errorPayload(code, "The shared content could not be copied safely."));
            } catch (Exception error) {
                publish(errorPayload("missing-content", "The shared content is unavailable."));
            }
        });
    }

    @SuppressWarnings("deprecation")
    private JSObject readIntent(Intent intent) throws IOException {
        String suppliedMime = normalizeMime(intent.getType());
        String sharedText = intent.getStringExtra(Intent.EXTRA_TEXT);
        ArrayList<Uri> streams = new ArrayList<>();
        if (Intent.ACTION_SEND_MULTIPLE.equals(intent.getAction())) {
            ArrayList<Uri> values = intent.getParcelableArrayListExtra(Intent.EXTRA_STREAM);
            if (values != null) streams.addAll(values);
        } else {
            Uri stream = intent.getParcelableExtra(Intent.EXTRA_STREAM);
            if (stream != null) streams.add(stream);
        }

        if (streams.isEmpty()) {
            if (sharedText == null || sharedText.trim().isEmpty()) return errorPayload("missing-content", "No shared content was found.");
            if (!suppliedMime.isEmpty() && !suppliedMime.startsWith("text/")) return errorPayload("unsupported-file", "This shared content type is not supported.");
            JSObject textPayload = basePayload("text", suppliedMime.isEmpty() ? "text/plain" : suppliedMime, UUID.randomUUID().toString());
            textPayload.put("text", sharedText.trim());
            textPayload.put("ignoredCount", 0);
            return textPayload;
        }

        Uri uri = streams.get(0);
        ContentResolver resolver = getContext().getContentResolver();
        String mime = normalizeMime(resolver.getType(uri));
        if (mime.isEmpty()) mime = suppliedMime;
        String name = displayName(resolver, uri);
        if (mime.isEmpty()) mime = mimeFromName(name);
        String kind = kindForMime(mime);
        if ("unsupported".equals(kind)) return errorPayload("unsupported-file", "Share plain text, an image, or a PDF receipt.");

        String id = UUID.randomUUID().toString();
        File cached = copyToCache(resolver, uri, id, name, mime);
        JSObject payload = basePayload(kind, mime, id);
        payload.put("name", name.isEmpty() ? cached.getName() : name);
        payload.put("path", cached.getAbsolutePath());
        payload.put("size", cached.length());
        payload.put("text", sharedText == null ? "" : sharedText.trim());
        payload.put("ignoredCount", Math.max(0, streams.size() - 1));
        return payload;
    }

    private JSObject basePayload(String kind, String mime, String id) {
        JSObject payload = new JSObject();
        payload.put("kind", kind);
        payload.put("mimeType", mime);
        payload.put("id", id);
        return payload;
    }

    private JSObject errorPayload(String code, String message) {
        JSObject payload = basePayload("error", "", UUID.randomUUID().toString());
        payload.put("errorCode", code);
        payload.put("errorMessage", message);
        return payload;
    }

    private void publish(JSObject content) {
        synchronized (pendingLock) {
            pendingShare = content;
        }
        JSObject event = new JSObject();
        event.put("content", content);
        notifyListeners(EVENT_SHARE_RECEIVED, event, true);
    }

    private File copyToCache(ContentResolver resolver, Uri uri, String id, String name, String mime) throws IOException {
        File target = new File(shareCache(), "share-" + safeToken(id) + "-" + safeName(name, mime));
        try (InputStream input = resolver.openInputStream(uri); FileOutputStream output = new FileOutputStream(target)) {
            if (input == null) throw new IOException("missing-content");
            byte[] buffer = new byte[32 * 1024];
            long copied = 0;
            int read;
            while ((read = input.read(buffer)) != -1) {
                copied += read;
                if (copied > MAX_SHARED_BYTES) throw new IOException("unsupported-file-size");
                output.write(buffer, 0, read);
            }
        } catch (IOException error) {
            target.delete();
            throw error;
        }
        return target;
    }

    private File shareCache() throws IOException {
        File directory = new File(getContext().getCacheDir(), "nexio-shares");
        if (!directory.exists() && !directory.mkdirs()) throw new IOException("cache-unavailable");
        return directory;
    }

    private File safeCacheFile(String path) throws IOException {
        if (path == null || path.isEmpty()) throw new IOException("missing-content");
        File root = shareCache().getCanonicalFile();
        File file = new File(path).getCanonicalFile();
        if (!file.getPath().startsWith(root.getPath() + File.separator) || !file.isFile()) throw new SecurityException("invalid-cache-path");
        return file;
    }

    private String displayName(ContentResolver resolver, Uri uri) {
        try (Cursor cursor = resolver.query(uri, new String[]{OpenableColumns.DISPLAY_NAME}, null, null, null)) {
            if (cursor != null && cursor.moveToFirst()) {
                int index = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                if (index >= 0) return String.valueOf(cursor.getString(index));
            }
        } catch (Exception ignored) {
            // A generated safe name is used when the provider exposes no metadata.
        }
        return "";
    }

    private String safeName(String name, String mime) {
        String value = name == null ? "" : name.replaceAll("[^A-Za-z0-9._-]", "_");
        if (value.isEmpty()) {
            String extension = MimeTypeMap.getSingleton().getExtensionFromMimeType(mime);
            value = "shared-content" + (extension == null ? "" : "." + extension);
        }
        return value.length() > 96 ? value.substring(value.length() - 96) : value;
    }

    private String safeToken(String value) {
        return value == null ? "" : value.replaceAll("[^A-Za-z0-9-]", "");
    }

    private String normalizeMime(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT).split(";", 2)[0].trim();
    }

    private String mimeFromName(String name) {
        String extension = MimeTypeMap.getFileExtensionFromUrl(name == null ? "" : name);
        String mime = MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension.toLowerCase(Locale.ROOT));
        return normalizeMime(mime);
    }

    private String kindForMime(String mime) {
        if (mime.startsWith("image/")) return "image";
        if ("application/pdf".equals(mime)) return "pdf";
        if (mime.startsWith("text/")) return "text";
        return "unsupported";
    }
}
