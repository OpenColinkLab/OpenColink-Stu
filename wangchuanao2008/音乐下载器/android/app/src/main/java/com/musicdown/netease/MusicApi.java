package com.musicdown.netease;

import static com.musicdown.netease.Models.AppException;
import static com.musicdown.netease.Models.AudioSource;
import static com.musicdown.netease.Models.Song;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.annotation.SuppressLint;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URI;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Locale;
import java.security.MessageDigest;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;

final class MusicApi {
    private static final String USER_AGENT = "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/124 Mobile Safari/537.36";
    private static final String REFERER = "https://music.163.com/";
    private static final String ALTERNATE = "https://music-api.gdstudio.xyz/api.php";
    static final String[] QUALITY_ORDER = QualityCatalog.LEVELS;
    static final String[] QUALITY_NAMES = QualityCatalog.NAMES;
    private static final String EAPI_PATH = "/api/song/enhance/player/url/v1";
    private static final String EAPI_URL = "https://interface3.music.163.com/eapi/song/enhance/player/url/v1";
    private static final String[] AUTO_LEVELS = {"jymaster", "hires", "lossless", "exhigh", "higher", "standard"};

    private MusicApi() {}

    static String resolveShareUrl(String original, Models.Control control) throws AppException {
        String current = original;
        try {
            URI first = URI.create(current);
            if (!"163cn.tv".equalsIgnoreCase(first.getHost())) return current;
            for (int i = 0; i < 8; i++) {
                checkCancelled(control);
                HttpURLConnection connection = open(current, false, 18_000);
                int code = connection.getResponseCode();
                if (code == 301 || code == 302 || code == 303 || code == 307 || code == 308) {
                    String location = connection.getHeaderField("Location");
                    connection.disconnect();
                    if (location == null || location.trim().isEmpty()) throw new AppException("短链接缺少跳转地址");
                    current = URI.create(current).resolve(location).toString();
                    String host = URI.create(current).getHost();
                    if (host != null && !host.equalsIgnoreCase("163cn.tv") &&
                            !(host.equalsIgnoreCase("music.163.com") || host.equalsIgnoreCase("y.music.163.com"))) {
                        throw new AppException("短链接跳转到了不支持的平台");
                    }
                } else {
                    if (code >= 400) throw new AppException("短链接跳转失败：HTTP " + code);
                    connection.disconnect();
                    return current;
                }
            }
            throw new AppException("短链接跳转次数过多");
        } catch (AppException e) {
            throw e;
        } catch (IOException | IllegalArgumentException e) {
            throw new AppException("短链接跳转失败：" + friendly(e), e);
        }
    }

    static Song song(String id, Models.Control control) throws AppException {
        String endpoint = "https://music.163.com/api/song/detail/?ids=" + encode("[" + id + "]");
        try {
            JSONObject root = getJson(endpoint, control);
            JSONArray songs = root.optJSONArray("songs");
            if (songs == null || songs.length() == 0) throw new AppException("网易云歌曲不存在或链接已失效");
            JSONObject raw = songs.getJSONObject(0);
            JSONObject album = raw.optJSONObject("album");
            JSONArray artists = raw.optJSONArray("artists");
            StringBuilder artist = new StringBuilder();
            if (artists != null) {
                for (int i = 0; i < artists.length(); i++) {
                    String name = artists.optJSONObject(i) == null ? "" : artists.optJSONObject(i).optString("name");
                    if (!name.trim().isEmpty()) {
                        if (artist.length() > 0) artist.append('、');
                        artist.append(name);
                    }
                }
            }
            String cover = album == null ? "" : album.optString("picUrl", "");
            if (cover.contains("music.126.net")) cover += (cover.contains("?") ? "&" : "?") + "param=300y300";
            int fee = raw.optInt("fee", 0);
            String restriction = fee == 1 || fee == 4 ? "需要会员或购买" : "";
            return new Song(id, raw.optString("name", id), artist.length() == 0 ? "未知歌手" : artist.toString(),
                    album == null ? "" : album.optString("name", ""), cover,
                    raw.optLong("duration", 0) / 1000.0, restriction);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException("网易云歌曲信息解析失败：" + friendly(e), e);
        }
    }

    static Map<String, String> qualityCatalog(String songId, Models.Control control) throws AppException {
        JSONObject root = getJson("https://music.163.com/api/song/music/detail/get?songId=" + encode(songId), control);
        JSONObject data = root.optJSONObject("data");
        if (root.optInt("code", -1) != 200 || data == null) throw new AppException("网易云音质目录响应无效，可点击重试");
        Map<String, Object> fields = new LinkedHashMap<>();
        for (String field : QualityCatalog.FIELDS) if (data.has(field)) {
            Object value = data.opt(field); fields.put(field, JSONObject.NULL.equals(value) ? null : value);
        }
        if (data.has("sks")) fields.put("sks", data.opt("sks"));
        try { return QualityCatalog.parse(fields); }
        catch (IllegalArgumentException e) { throw new AppException(e.getMessage() + "，可点击重试", e); }
    }

    static Models.Account validateSession(String musicU, String csrf) throws AppException {
        if (musicU == null || musicU.isEmpty()) throw new AppException("网易云网页未返回有效登录会话");
        HttpURLConnection connection = null;
        try {
            connection = open("https://music.163.com/api/nuser/account/get", true, 20_000);
            connection.setRequestProperty("Cookie", "MUSIC_U=" + musicU + (csrf == null || csrf.isEmpty() ? "" : "; __csrf=" + csrf));
            int code = connection.getResponseCode(); if (code >= 400) throw new AppException("网易云账号校验 HTTP " + code);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            try (InputStream in = connection.getInputStream()) { byte[] b = new byte[8192]; int n; while ((n = in.read(b)) != -1) out.write(b, 0, n); }
            JSONObject root = new JSONObject(new String(out.toByteArray(), StandardCharsets.UTF_8));
            JSONObject profile = root.optJSONObject("profile");
            if (profile == null) throw new AppException("登录状态无效或已过期，请重新登录官网");
            return AccountSessionRules.verified(musicU, csrf, profile.optString("userId"), profile.optString("nickname"));
        } catch (AppException e) { throw e; }
        catch (Exception e) { throw new AppException("网易云账号校验失败：" + friendly(e), e); }
        finally { if (connection != null) connection.disconnect(); }
    }

    static List<AudioSource> memberSources(Song song, Models.Account account, String quality,
                                            Models.Control control) throws AppException {
        int target = Arrays.asList(QUALITY_ORDER).indexOf(quality);
        if (target < 0 && !quality.equals("auto")) throw new AppException("未知音质选项");
        if (target >= 3 && (account == null || account.musicU.isEmpty())) throw new AppException("所选音质需要先扫码登录有相应权益的网易云账号");
        List<String> levels = quality.equals("auto")
                ? (account == null ? Arrays.asList("exhigh", "higher", "standard") : Arrays.asList(AUTO_LEVELS))
                : java.util.Collections.singletonList(quality);
        List<String> errors = new ArrayList<>();
        AudioSource fallback = null;
        List<AudioSource> dolby = new ArrayList<>();
        for (String level : levels) for (boolean effect : level.equals("dolby") ? new boolean[]{false, true} : new boolean[]{false}) {
            checkCancelled(control);
            try {
                JSONObject item = playerItem(song.id, level, account, control, effect);
                JSONObject trial = item.optJSONObject("freeTimeTrialPrivilege");
                if (DownloadRules.isTrial(present(item.opt("freeTrialInfo")), present(item.opt("trialInfo")), trial == null ? 0 : trial.optInt("type"))) {
                    errors.add("网易云仅返回试听片段"); continue;
                }
                String url = item.optString("url", "");
                String actual = effect ? "dolby" : item.optString("level", "");
                if (!isNeteaseAudio(url)) { errors.add("网易云没有返回可用的原站音频地址"); continue; }
                if (!quality.equals("auto") && !level.equals(actual)) {
                    errors.add("请求" + qualityName(level) + "，网易云实际只提供" + qualityName(actual)); continue;
                }
                if (quality.equals("auto") && !Arrays.asList(AUTO_LEVELS).contains(actual)) {
                    errors.add("网易云返回了不在自动音质范围内的档位：" + actual); continue;
                }
                String label = account == null ? "网易云官方音源 · " : "网易云账号音源 · ";
                AudioSource source = new AudioSource(url, label + qualityName(actual), level, actual,
                        Arrays.asList("lossless", "hires", "jymaster", "jyeffect").contains(actual));
                if (level.equals("dolby")) {
                    if (!dolby.stream().anyMatch(candidate -> candidate.url.equals(url))) dolby.add(source);
                } else if (!quality.equals("auto") || actual.equals(level)) return java.util.Collections.singletonList(source);
                else if (fallback == null || Arrays.asList(AUTO_LEVELS).indexOf(actual) < Arrays.asList(AUTO_LEVELS).indexOf(fallback.actualLevel)) fallback = source;
            } catch (AppException e) { if (control.cancelled.get()) throw e; errors.add(e.getMessage()); }
        }
        if (!dolby.isEmpty()) return dolby;
        if (fallback != null) return java.util.Collections.singletonList(fallback);
        throw new AppException(errors.isEmpty() ? "网易云没有返回可用音频" : String.join("；", errors));
    }

    private static boolean present(Object value) { return value != null && value != JSONObject.NULL && !Boolean.FALSE.equals(value); }

    @SuppressLint("GetInstance")
    private static JSONObject playerItem(String id, String level, Models.Account account, Models.Control control, boolean dolbyEffect) throws AppException {
        try {
            JSONObject header = new JSONObject();
            header.put("os", "pc"); header.put("appver", "8.0.0");
            header.put("requestId", System.currentTimeMillis() + "_" + (int)(Math.random() * 10000));
            if (account != null) { header.put("MUSIC_U", account.musicU); header.put("__csrf", account.csrf); }
            JSONObject payload = new JSONObject(); payload.put("ids", "[" + id + "]"); payload.put("level", dolbyEffect ? "hires" : level);
            payload.put("encodeType", level.equals("dolby") ? "mp4" : "flac"); payload.put("header", header);
            if (dolbyEffect) payload.put("effect", "dolby");
            if (level.equals("sky")) payload.put("immerseType", "c51");
            String raw = payload.toString();
            String digest = md5(("nobody" + EAPI_PATH + "use" + raw + "md5forencrypt").getBytes(StandardCharsets.UTF_8));
            String message = EAPI_PATH + "-36cd479b6b5-" + raw + "-36cd479b6b5-" + digest;
            byte[] bytes = message.getBytes(StandardCharsets.UTF_8);
            int pad = 16 - (bytes.length % 16); byte[] padded = Arrays.copyOf(bytes, bytes.length + pad);
            Arrays.fill(padded, bytes.length, padded.length, (byte)pad);
            // NetEase's EAPI wire protocol specifies AES-ECB with PKCS padding.
            Cipher cipher = Cipher.getInstance("AES/ECB/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec("e82ckenh8dichen8".getBytes(StandardCharsets.US_ASCII), "AES"));
            String params = hex(cipher.doFinal(padded));
            HttpURLConnection connection = open(EAPI_URL, true, 20_000);
            try {
                connection.setRequestMethod("POST"); connection.setDoOutput(true);
                connection.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
                String cookie = "os=pc; appver=8.0.0; requestId=" + header.getString("requestId");
                if (account != null) cookie += "; MUSIC_U=" + account.musicU + "; __csrf=" + account.csrf;
                connection.setRequestProperty("Cookie", cookie);
                byte[] form = ("params=" + params).getBytes(StandardCharsets.UTF_8);
                try (java.io.OutputStream output = connection.getOutputStream()) { output.write(form); }
                int code = connection.getResponseCode(); if (code >= 400) throw new AppException("网易云音质接口 HTTP " + code);
                ByteArrayOutputStream out = new ByteArrayOutputStream();
                try (InputStream in = connection.getInputStream()) { byte[] buf = new byte[8192]; int n; while ((n = in.read(buf)) != -1) { checkCancelled(control); out.write(buf, 0, n); } }
                JSONObject root = new JSONObject(new String(out.toByteArray(), StandardCharsets.UTF_8));
                if (root.optInt("code", 200) != 200) throw new AppException("网易云音质接口拒绝请求：" + root.optString("message", root.optString("code")));
                JSONArray items = root.optJSONArray("data");
                if (items == null || items.length() == 0) throw new AppException("网易云音质接口未返回歌曲数据");
                return items.getJSONObject(0);
            } finally { connection.disconnect(); }
        } catch (AppException e) { throw e; }
        catch (Exception e) { throw new AppException("网易云音质接口失败：" + friendly(e), e); }
    }

    private static String md5(byte[] value) throws Exception {
        byte[] result = MessageDigest.getInstance("MD5").digest(value); return hex(result).toLowerCase(Locale.ROOT);
    }
    private static String hex(byte[] value) { StringBuilder b = new StringBuilder(value.length * 2); for (byte x : value) b.append(String.format(Locale.ROOT, "%02X", x & 255)); return b.toString(); }
    private static String qualityName(String level) { int i = Arrays.asList(QUALITY_ORDER).indexOf(level); return i < 0 ? (level.isEmpty() ? "未知音质" : level) : QUALITY_NAMES[i]; }

    static List<AudioSource> primary(Song song) {
        List<AudioSource> result = new ArrayList<>();
        result.add(new AudioSource("https://music.163.com/song/media/outer/url?id=" + encode(song.id) + ".mp3", "公开音源"));
        return result;
    }

    static List<AudioSource> alternate(Song song, Models.Control control) throws AppException {
        List<AudioSource> result = new ArrayList<>();
        String firstError = "";
        int[] rates = {999, 320, 128};
        String[] labels = {"无损", "320K", "128K"};
        for (int i = 0; i < rates.length; i++) {
            checkCancelled(control);
            String url = ALTERNATE + "?types=url&source=netease&id=" + encode(song.id) + "&br=" + rates[i];
            try {
                JSONObject data = getJson(url, control);
                String audio = data.optString("url", "");
                if (isNeteaseAudio(audio)) {
                    result.add(new AudioSource(audio, "网易云 · GD Studio 备用接口 · " + labels[i]));
                }
            } catch (AppException e) {
                if (firstError.isEmpty()) firstError = e.getMessage();
            }
        }
        if (result.isEmpty()) {
            throw new AppException("备用接口未返回完整音频地址" + (firstError.isEmpty() ? "" : "；" + firstError));
        }
        return result;
    }

    static Bitmap cover(String url, Models.Control control) {
        if (url == null || url.trim().isEmpty()) return null;
        try {
            HttpURLConnection connection = open(url, true, 12_000);
            try {
                if (connection.getResponseCode() >= 400) return null;
                try (InputStream in = connection.getInputStream(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                    byte[] buffer = new byte[32 * 1024];
                    int read;
                    while ((read = in.read(buffer)) != -1 && out.size() <= 2_000_000) {
                        checkCancelled(control);
                        out.write(buffer, 0, read);
                    }
                    byte[] bytes = out.toByteArray();
                    return bytes.length > 2_000_000 ? null : BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
                }
            } finally {
                connection.disconnect();
            }
        } catch (Exception ignored) {
            return null;
        }
    }

    static HttpURLConnection open(String address, boolean redirects, int timeout) throws IOException {
        HttpURLConnection connection = (HttpURLConnection) new URL(address).openConnection();
        connection.setInstanceFollowRedirects(redirects);
        connection.setConnectTimeout(timeout);
        connection.setReadTimeout(timeout);
        connection.setRequestProperty("User-Agent", USER_AGENT);
        connection.setRequestProperty("Referer", REFERER);
        connection.setRequestProperty("Accept", "*/*");
        return connection;
    }

    static void checkCancelled(Models.Control control) throws AppException {
        if (control != null && control.cancelled.get()) throw new AppException("已取消");
    }

    private static JSONObject getJson(String url, Models.Control control) throws AppException {
        HttpURLConnection connection = null;
        try {
            checkCancelled(control);
            connection = open(url, true, 20_000);
            int code = connection.getResponseCode();
            if (code >= 400) throw new AppException("接口返回 HTTP " + code);
            try (InputStream in = connection.getInputStream(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
                byte[] buffer = new byte[16 * 1024];
                int read;
                while ((read = in.read(buffer)) != -1) {
                    checkCancelled(control);
                    out.write(buffer, 0, read);
                }
                return new JSONObject(new String(out.toByteArray(), StandardCharsets.UTF_8));
            }
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            throw new AppException("网络请求失败：" + friendly(e), e);
        } finally {
            if (connection != null) connection.disconnect();
        }
    }

    private static boolean isNeteaseAudio(String value) {
        try {
            URI uri = URI.create(value);
            String host = uri.getHost();
            return "https".equalsIgnoreCase(uri.getScheme()) && host != null &&
                    (host.equals("music.126.net") || host.endsWith(".music.126.net"));
        } catch (Exception e) {
            return false;
        }
    }

    private static String encode(String value) {
        try { return URLEncoder.encode(value, "UTF-8"); }
        catch (java.io.UnsupportedEncodingException impossible) { return value; }
    }

    private static String friendly(Throwable error) {
        String message = error.getMessage();
        return message == null || message.trim().isEmpty() ? error.getClass().getSimpleName() : message;
    }
}
