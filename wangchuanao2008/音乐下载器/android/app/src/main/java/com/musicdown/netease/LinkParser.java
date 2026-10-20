package com.musicdown.netease;

import static com.musicdown.netease.Models.AppException;

import java.net.URI;
import java.net.URLDecoder;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

final class LinkParser {
    private static final Pattern URL = Pattern.compile("https?://[^\\s<>\\\"'，。；;）)\\]】]+", Pattern.CASE_INSENSITIVE);
    private static final Pattern PATH_ID = Pattern.compile("/(?:song|m/song)/(\\d+)");

    private LinkParser() {}

    static List<String> extract(String text) {
        LinkedHashSet<String> result = new LinkedHashSet<>();
        Matcher matcher = URL.matcher(text == null ? "" : text);
        while (matcher.find()) {
            result.add(matcher.group().replaceAll("[.,!?:]+$", ""));
        }
        return new ArrayList<>(result);
    }

    static String songId(String url) throws AppException {
        try {
            URI uri = URI.create(url);
            String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase(Locale.ROOT);
            if (!(host.equals("music.163.com") || host.equals("y.music.163.com"))) {
                throw new AppException("仅支持网易云音乐的歌曲分享链接");
            }
            String combined = (uri.getPath() == null ? "" : uri.getPath()) + "?" +
                    (uri.getQuery() == null ? "" : uri.getQuery()) + "#" +
                    (uri.getFragment() == null ? "" : uri.getFragment());
            if (!combined.contains("song")) {
                throw new AppException("不是网易云音乐单曲链接");
            }
            String id = queryValue(uri.getQuery(), "id");
            String fragment = uri.getFragment();
            if (id.isEmpty() && fragment != null && fragment.contains("?")) {
                id = queryValue(fragment.substring(fragment.indexOf('?') + 1), "id");
            }
            if (id.isEmpty()) {
                Matcher matcher = PATH_ID.matcher(combined);
                if (matcher.find()) id = matcher.group(1);
            }
            if (!id.matches("\\d+")) {
                throw new AppException("歌曲链接缺少有效的歌曲 ID");
            }
            return id;
        } catch (IllegalArgumentException e) {
            throw new AppException("链接格式无效", e);
        }
    }

    private static String queryValue(String query, String name) {
        if (query == null) return "";
        for (String part : query.split("&")) {
            String[] pair = part.split("=", 2);
            if (pair.length == 2 && decode(pair[0]).equals(name)) {
                return decode(pair[1]);
            }
        }
        return "";
    }

    private static String decode(String value) {
        try { return URLDecoder.decode(value, "UTF-8"); }
        catch (UnsupportedEncodingException impossible) { return value; }
    }
}
