package io.keybase.ossifrage.modules;

import android.content.res.AssetFileDescriptor;
import android.app.DownloadManager;
import java.io.File;
import java.io.IOException;
import android.net.Uri;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationManagerCompat;

import com.facebook.react.BuildConfig;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReactMethod;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.iid.InstanceIdResult;

public class Utils extends ReactContextBaseJavaModule {
    private static final String NAME = "Utils";

    public Utils(final ReactApplicationContext reactContext) { super(reactContext); }

    @Override
    public String getName() { return NAME; }

    private static final String FILE_PREFIX_BUNDLE_ASSET = "bundle-assets://";

    private String normalizePath(String path) {
        if (path == null)
            return null;
        if (!path.matches("\\w+\\:.*"))
            return path;
        if (path.startsWith("file://")) {
            return path.replace("file://", "");
        }

        Uri uri = Uri.parse(path);
        if (path.startsWith(Utils.FILE_PREFIX_BUNDLE_ASSET)) {
            return path;
        } else
            return PathResolver.getRealPathFromURI(this.getReactApplicationContext(), uri);
    }

    private boolean isAsset(String path) {
        return path != null && path.startsWith(Utils.FILE_PREFIX_BUNDLE_ASSET);
    }

    private WritableMap statFile(String path) {
        try {
            path = this.normalizePath(path);
            WritableMap stat = Arguments.createMap();
            if (this.isAsset(path)) {
                String name = path.replace(Utils.FILE_PREFIX_BUNDLE_ASSET, "");
                AssetFileDescriptor fd = this.getReactApplicationContext().getAssets().openFd(name);
                stat.putString("filename", name);
                stat.putString("path", path);
                stat.putString("type", "asset");
                stat.putString("size", String.valueOf(fd.getLength()));
                stat.putInt("lastModified", 0);
            } else {
                File target = new File(path);
                if (!target.exists()) {
                    return null;
                }
                stat.putString("filename", target.getName());
                stat.putString("path", target.getPath());
                stat.putString("type", target.isDirectory() ? "directory" : "file");
                stat.putString("size", String.valueOf(target.length()));
                String lastModified = String.valueOf(target.lastModified());
                stat.putString("lastModified", lastModified);

            }
            return stat;
        } catch (Exception err) {
            return null;
        }
    }

    @ReactMethod
    public void androidAddCompleteDownload(ReadableMap config, Promise promise) {
        DownloadManager dm = (DownloadManager) this.getReactApplicationContext().getSystemService(this.getReactApplicationContext().DOWNLOAD_SERVICE);
        if (config == null || !config.hasKey("path")) {
            promise.reject("EINVAL", "addCompleteDownload config or path missing.");
            return;
        }
        String path = this.normalizePath(config.getString("path"));
        if (path == null) {
            promise.reject("EINVAL", "addCompleteDownload can not resolve URI:" + config.getString("path"));
            return;
        }
        try {
            WritableMap stat = statFile(path);
            dm.addCompletedDownload(
                    config.hasKey("title") ? config.getString("title") : "",
                    config.hasKey("description") ? config.getString("description") : "",
                    true,
                    config.hasKey("mime") ? config.getString("mime") : null,
                    path,
                    Long.valueOf(stat.getString("size")),
                    config.hasKey("showNotification") && config.getBoolean("showNotification")
            );
            promise.resolve(null);
        } catch (Exception ex) {
            promise.reject("EUNSPECIFIED", ex.getLocalizedMessage());
        }
    }

    private void deleteRecursive(File fileOrDirectory) throws IOException {
        if (fileOrDirectory.isDirectory()) {
            File[] files = fileOrDirectory.listFiles();
            if (files == null) {
                throw new NullPointerException("Received null trying to list files of directory '" + fileOrDirectory + "'");
            } else {
                for (File child : files) {
                    deleteRecursive(child);
                }
            }
        }
        boolean result = fileOrDirectory.delete();
        if (!result) {
            throw new IOException("Failed to delete '" + fileOrDirectory + "'");
        }
    }

    @ReactMethod
    public void androidUnlink(String path, Promise promise) {
        try {
            String normalizedPath = this.normalizePath(path);
            this.deleteRecursive(new File(normalizedPath));
            promise.resolve(true);
        } catch (Exception err) {
            promise.reject("EUNSPECIFIED", err.getLocalizedMessage());
        }
    }
}
