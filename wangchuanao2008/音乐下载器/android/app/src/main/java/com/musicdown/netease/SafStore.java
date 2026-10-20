package com.musicdown.netease;

import static com.musicdown.netease.Models.AppException;

import android.content.ContentResolver;
import android.content.Context;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.net.Uri;
import android.provider.DocumentsContract;

import java.io.File;
import java.io.FileInputStream;
import java.io.OutputStream;
import java.util.HashSet;
import java.util.Set;

final class SafStore {
    private final Context context;
    private final SharedPreferences preferences;
    private final Uri tree;

    SafStore(Context context, Uri tree) {
        this.context = context.getApplicationContext();
        this.preferences = context.getSharedPreferences("downloads", Context.MODE_PRIVATE);
        this.tree = tree;
    }

    Models.Result existing(String key, Models.AudioInfo ignoredInfo) {
        String saved = preferences.getString("uri." + key, "");
        String name = preferences.getString("name." + key, "");
        String source = preferences.getString("source." + key, "");
        if (saved.trim().isEmpty()) return null;
        Uri uri = Uri.parse(saved);
        try (android.content.res.AssetFileDescriptor ignored = context.getContentResolver().openAssetFileDescriptor(uri, "r")) {
            if (ignored != null) {
                Models.AudioInfo info = new Models.AudioInfo(
                        preferences.getString("ext." + key, ""),
                        preferences.getString("codec." + key, "音频"),
                        preferences.getBoolean("lossless." + key, false),
                        preferences.getInt("bitrate." + key, 0),
                        Double.longBitsToDouble(preferences.getLong("duration." + key, Double.doubleToLongBits(0))),
                        preferences.getInt("sampleRate." + key, 0), preferences.getInt("depth." + key, 0),
                        preferences.getInt("channels." + key, 0), preferences.getBoolean("decodable." + key, true));
                return new Models.Result(uri, name, source, info, true);
            }
        } catch (Exception ignored) {
            preferences.edit().remove("uri." + key).remove("name." + key).remove("source." + key).apply();
        }
        return null;
    }

    Models.Result save(File sourceFile, Models.Song song, Models.AudioInfo info,
                       String sourceLabel, String key, Models.Control control) throws AppException {
        ContentResolver resolver = context.getContentResolver();
        String stem = safeName(song.artist + " - " + song.title);
        Set<String> names = childNames(resolver);
        String fileName = stem + "." + info.extension;
        if (names.contains(fileName)) fileName = stem + " [netease-" + song.id + "]." + info.extension;
        int index = 2;
        while (names.contains(fileName)) {
            fileName = stem + " [netease-" + song.id + "-" + index++ + "]." + info.extension;
        }
        String mime = info.mimeType();
        Uri parent = DocumentsContract.buildDocumentUriUsingTree(tree, DocumentsContract.getTreeDocumentId(tree));
        Uri target = null;
        try {
            target = DocumentsContract.createDocument(resolver, parent, mime, fileName);
            if (target == null) throw new AppException("无法在所选目录创建文件");
            try (FileInputStream input = new FileInputStream(sourceFile);
                 OutputStream output = resolver.openOutputStream(target, "w")) {
                if (output == null) throw new AppException("无法写入所选目录");
                byte[] buffer = new byte[128 * 1024];
                int read;
                while ((read = input.read(buffer)) != -1) {
                    MusicApi.checkCancelled(control);
                    output.write(buffer, 0, read);
                }
            }
            preferences.edit().putString("uri." + key, target.toString())
                    .putString("name." + key, fileName).putString("source." + key, sourceLabel)
                    .putString("ext." + key, info.extension).putString("codec." + key, info.codec)
                    .putBoolean("lossless." + key, info.lossless).putInt("bitrate." + key, info.bitrateKbps)
                    .putLong("duration." + key, Double.doubleToRawLongBits(info.durationSeconds))
                    .putInt("sampleRate." + key, info.sampleRateHz).putInt("depth." + key, info.bitDepth)
                    .putInt("channels." + key, info.channels).putBoolean("decodable." + key, info.decodable).apply();
            return new Models.Result(target, fileName, sourceLabel, info, false);
        } catch (AppException e) {
            if (target != null) {
                try { DocumentsContract.deleteDocument(resolver, target); } catch (Exception ignored) {}
            }
            throw e;
        } catch (Exception e) {
            if (target != null) {
                try { DocumentsContract.deleteDocument(resolver, target); } catch (Exception ignored) {}
            }
            throw new AppException("保存文件失败：" + (e.getMessage() == null ? e.getClass().getSimpleName() : e.getMessage()), e);
        }
    }

    private Set<String> childNames(ContentResolver resolver) throws AppException {
        Set<String> names = new HashSet<>();
        try {
            String parentId = DocumentsContract.getTreeDocumentId(tree);
            Uri children = DocumentsContract.buildChildDocumentsUriUsingTree(tree, parentId);
            try (Cursor cursor = resolver.query(children,
                    new String[]{DocumentsContract.Document.COLUMN_DISPLAY_NAME}, null, null, null)) {
                if (cursor != null) while (cursor.moveToNext()) names.add(cursor.getString(0));
            }
            return names;
        } catch (Exception e) {
            throw new AppException("无法读取所选保存目录，请重新选择：" + e.getMessage(), e);
        }
    }

    static String safeName(String value) {
        String result = value.replaceAll("[\\\\/:*?\"<>|\\x00-\\x1f]", "_").replaceAll("[ .]+$", "").trim();
        if (result.isEmpty()) result = "未命名";
        return result.length() > 160 ? result.substring(0, 160) : result;
    }
}
