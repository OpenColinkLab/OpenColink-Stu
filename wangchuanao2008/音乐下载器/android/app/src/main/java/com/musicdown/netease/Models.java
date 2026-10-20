package com.musicdown.netease;

import android.net.Uri;

import java.util.concurrent.atomic.AtomicBoolean;
import java.util.LinkedHashMap;
import java.util.Map;

final class Models {
    private Models() {}

    static final class AppException extends Exception {
        AppException(String message) { super(message); }
        AppException(String message, Throwable cause) { super(message, cause); }
    }

    static final class Song {
        final String id;
        final String title;
        final String artist;
        final String album;
        final String coverUrl;
        final double durationSeconds;
        final String restriction;
        final Map<String, String> qualities;

        Song(String id, String title, String artist, String album, String coverUrl,
             double durationSeconds, String restriction) {
            this(id, title, artist, album, coverUrl, durationSeconds, restriction, new LinkedHashMap<>());
        }

        Song(String id, String title, String artist, String album, String coverUrl,
             double durationSeconds, String restriction, Map<String, String> qualities) {
            this.id = id;
            this.title = title;
            this.artist = artist;
            this.album = album;
            this.coverUrl = coverUrl;
            this.durationSeconds = durationSeconds;
            this.restriction = restriction;
            this.qualities = qualities;
        }
    }

    static final class Account {
        final String userId;
        final String nickname;
        final String musicU;
        final String csrf;
        Account(String userId, String nickname, String musicU, String csrf) {
            this.userId = userId; this.nickname = nickname; this.musicU = musicU; this.csrf = csrf;
        }
    }

    static final class AudioSource {
        final String url;
        final String label;
        final String requestedLevel;
        final String actualLevel;
        final boolean lossless;

        AudioSource(String url, String label) {
            this(url, label, "", "", false);
        }
        AudioSource(String url, String label, String requestedLevel, String actualLevel, boolean lossless) {
            this.url = url;
            this.label = label;
            this.requestedLevel = requestedLevel;
            this.actualLevel = actualLevel;
            this.lossless = lossless;
        }
    }

    static final class AudioInfo {
        final String extension;
        final String codec;
        final boolean lossless;
        final int bitrateKbps;
        final double durationSeconds;
        final int sampleRateHz;
        final int bitDepth;
        final int channels;
        final boolean decodable;

        AudioInfo(String extension, String codec, boolean lossless,
                  int bitrateKbps, double durationSeconds) {
            this(extension, codec, lossless, bitrateKbps, durationSeconds, 0, 0, 0, true);
        }

        AudioInfo(String extension, String codec, boolean lossless, int bitrateKbps, double durationSeconds,
                  int sampleRateHz, int bitDepth, int channels, boolean decodable) {
            this.sampleRateHz = sampleRateHz; this.bitDepth = bitDepth;
            this.channels = channels; this.decodable = decodable;
            this.extension = extension;
            this.codec = codec;
            this.lossless = lossless;
            this.bitrateKbps = bitrateKbps;
            this.durationSeconds = durationSeconds;
        }

        String display() {
            String rate = bitrateKbps > 0 ? bitrateKbps + " kbps" : "码率未知";
            return codec + " · " + rate + (lossless ? " · 无损" : "")
                    + (sampleRateHz > 0 ? " · " + sampleRateHz + " Hz" : "")
                    + (bitDepth > 0 ? " / " + bitDepth + " bit" : "")
                    + (channels > 0 ? " · " + channels + " 声道" : "")
                    + (!decodable ? " · 未验证解码" : "");
        }

        String mimeType() {
            switch (extension) {
                case "mp3": return "audio/mpeg";
                case "flac": return "audio/flac";
                case "aac": return "audio/aac";
                case "ac3": return "audio/ac3";
                case "eac3": return "audio/eac3";
                case "ogg": return "audio/ogg";
                default: return "audio/mp4";
            }
        }
    }

    static final class Result {
        final Uri uri;
        final String fileName;
        final String sourceLabel;
        final AudioInfo info;
        final boolean existed;

        Result(Uri uri, String fileName, String sourceLabel, AudioInfo info, boolean existed) {
            this.uri = uri;
            this.fileName = fileName;
            this.sourceLabel = sourceLabel;
            this.info = info;
            this.existed = existed;
        }
    }

    static final class Control {
        final AtomicBoolean cancelled = new AtomicBoolean(false);
    }
}
