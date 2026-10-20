package com.musicdown.netease;

import android.content.Context;
import android.content.SharedPreferences;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;

import org.json.JSONObject;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

/** Stores only the minimum NetEase session data, encrypted by a non-exportable Android Keystore key. */
final class AccountStore {
    private static final String PREFS = "encrypted_session";
    private static final String ALIAS = "netease-session-v1";
    private final Context context;
    AccountStore(Context context) { this.context = context.getApplicationContext(); }

    Models.Account load() {
        try {
            String encoded = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString("blob", "");
            if (encoded.isEmpty()) return null;
            byte[] packed = Base64.decode(encoded, Base64.NO_WRAP);
            ByteBuffer buffer = ByteBuffer.wrap(packed);
            byte[] iv = new byte[buffer.getInt()]; buffer.get(iv);
            byte[] encrypted = new byte[buffer.remaining()]; buffer.get(encrypted);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, key(), new GCMParameterSpec(128, iv));
            JSONObject data = new JSONObject(new String(cipher.doFinal(encrypted), StandardCharsets.UTF_8));
            return new Models.Account(data.getString("userId"), data.optString("nickname"), data.getString("MUSIC_U"), data.optString("__csrf"));
        } catch (Exception e) { return null; }
    }

    void save(Models.Account account) throws Exception {
        JSONObject value = new JSONObject(); value.put("userId", account.userId); value.put("nickname", account.nickname);
        value.put("MUSIC_U", account.musicU); value.put("__csrf", account.csrf);
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding"); cipher.init(Cipher.ENCRYPT_MODE, key());
        byte[] encrypted = cipher.doFinal(value.toString().getBytes(StandardCharsets.UTF_8));
        byte[] iv = cipher.getIV(); ByteBuffer packed = ByteBuffer.allocate(4 + iv.length + encrypted.length);
        packed.putInt(iv.length).put(iv).put(encrypted);
        if (!context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString("blob", Base64.encodeToString(packed.array(), Base64.NO_WRAP)).commit())
            throw new IllegalStateException("无法保存加密会话");
    }

    void clear() {
        context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().clear().commit();
        try { KeyStore store = KeyStore.getInstance("AndroidKeyStore"); store.load(null); store.deleteEntry(ALIAS); } catch (Exception ignored) {}
    }

    private SecretKey key() throws Exception {
        KeyStore store = KeyStore.getInstance("AndroidKeyStore"); store.load(null);
        if (store.containsAlias(ALIAS)) return (SecretKey) store.getKey(ALIAS, null);
        KeyGenerator generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
        generator.init(new KeyGenParameterSpec.Builder(ALIAS, KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM).setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setRandomizedEncryptionRequired(true).build());
        return generator.generateKey();
    }
}
