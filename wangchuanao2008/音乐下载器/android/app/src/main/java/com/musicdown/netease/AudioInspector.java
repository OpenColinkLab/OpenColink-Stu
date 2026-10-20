package com.musicdown.netease;

import org.json.JSONArray;
import org.json.JSONObject;
import java.io.File;
import java.util.Locale;

/** Uses the same FFprobe checks as the desktop application, including Audio Vivid packet counts. */
final class AudioInspector {
    private AudioInspector() {}

    static Models.AudioInfo inspect(File file) throws Models.AppException {
        return inspect(file, new Models.Control());
    }

    static Models.AudioInfo inspect(File file, Models.Control control) throws Models.AppException {
        try {
            String output = NativeAudio.probe(new String[]{"-v", "error", "-show_streams", "-show_format",
                    "-of", "json", file.getAbsolutePath()}, control);
            JSONObject data = probeJson(output);
            JSONArray streams = data.optJSONArray("streams");
            JSONObject audio = null;
            if (streams != null) for (int i = 0; i < streams.length(); i++) {
                JSONObject stream = streams.getJSONObject(i);
                String type = stream.optString("codec_type");
                if ("audio".equals(type) && audio == null) audio = stream;
                JSONObject disposition = stream.optJSONObject("disposition");
                if ("video".equals(type) && (disposition == null || disposition.optInt("attached_pic") != 1))
                    throw new Models.AppException("服务器返回的内容不是纯音频文件");
            }
            if (audio == null) throw new Models.AppException("文件没有有效音轨");
            JSONObject format = data.optJSONObject("format");
            String container = format == null ? "" : format.optString("format_name");
            String rawCodec = audio.optString("codec_name").toLowerCase(Locale.ROOT);
            String tag = audio.optString("codec_tag_string").toLowerCase(Locale.ROOT);
            boolean vivid = "av3a".equals(tag) && (container.contains("mp4") || container.contains("mov"));
            String codec, extension;
            boolean lossless = false;
            if (vivid) {
                String counted = NativeAudio.probe(new String[]{"-v", "error", "-count_packets", "-show_entries",
                        "stream=index,nb_frames,nb_read_packets", "-of", "json", file.getAbsolutePath()}, control);
                if (counted.toLowerCase(Locale.ROOT).contains("partial file"))
                    throw new Models.AppException("臻音全景声音频包不完整，未保存");
                JSONArray packets = probeJson(counted).getJSONArray("streams");
                long expected = 0, actual = 0;
                for (int i = 0; i < packets.length(); i++) {
                    JSONObject stream = packets.getJSONObject(i);
                    if (stream.optInt("index", -1) == audio.optInt("index", -2)) {
                        expected = number(stream.optString("nb_frames")); actual = number(stream.optString("nb_read_packets"));
                    }
                }
                if (expected <= 0 || expected != actual || counted.toLowerCase(Locale.ROOT).contains("partial file"))
                    throw new Models.AppException("臻音全景声音频包不完整，未保存");
                codec = "AVS3 Audio Vivid (av3a)"; extension = "m4a";
            } else {
                switch (rawCodec) {
                    case "mp3": codec = "MP3"; extension = "mp3"; break;
                    case "flac": codec = "FLAC"; extension = "flac"; lossless = true; break;
                    case "alac": codec = "ALAC"; extension = "m4a"; lossless = true; break;
                    case "aac": codec = "AAC"; extension = "aac"; break;
                    case "ac3": codec = "AC-3"; extension = "ac3"; break;
                    case "eac3": codec = "E-AC-3"; extension = "eac3"; break;
                    case "opus": codec = "Opus"; extension = "ogg"; break;
                    case "vorbis": codec = "Vorbis"; extension = "ogg"; break;
                    default: throw new Models.AppException("暂不支持检测此音频编码：" + rawCodec);
                }
                if (container.contains("mp4") || container.contains("mov")) extension = "m4a";
            }
            double duration = decimal(audio.optString("duration"));
            if (duration <= 0 && format != null) duration = decimal(format.optString("duration"));
            if (duration <= 0) throw new Models.AppException("音频文件没有有效时长");
            long bitrate = number(audio.optString("bit_rate"));
            if (bitrate <= 0 && format != null) bitrate = number(format.optString("bit_rate"));
            int depth = (int)number(audio.optString("bits_per_raw_sample"));
            if (depth <= 0) depth = (int)number(audio.optString("bits_per_sample"));
            return new Models.AudioInfo(extension, codec, lossless, (int)Math.round(bitrate / 1000.0), duration,
                    (int)number(audio.optString("sample_rate")), lossless ? depth : 0,
                    audio.optInt("channels"), !vivid);
        } catch (Models.AppException e) { throw e; }
        catch (Exception e) { throw new Models.AppException("音频文件无法解析：" + e.getMessage(), e); }
    }

    private static long number(String value) { try { return Long.parseLong(value); } catch (Exception e) { return 0; } }
    private static double decimal(String value) { try { return Double.parseDouble(value); } catch (Exception e) { return 0; } }
    // FFmpegKit combines FFprobe JSON and diagnostic logs in getOutput().
    private static JSONObject probeJson(String output) throws Exception {
        int start = output.indexOf('{'), end = output.lastIndexOf('}');
        if (start < 0 || end < start) throw new Models.AppException("音频探测没有有效结果");
        return new JSONObject(output.substring(start, end + 1));
    }
}
