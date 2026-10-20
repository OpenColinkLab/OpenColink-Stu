package com.musicdown.netease;

import android.graphics.Bitmap;
import java.io.File;
import java.io.FileOutputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

final class AudioProcessor {
    private AudioProcessor() {}

    /** Produce a tagged file without altering source samples unless MP3 conversion was requested. */
    static File prepare(File source, Models.AudioInfo info, Models.Song song, Bitmap cover,
                        boolean mp3, Models.Control control) throws Models.AppException {
        if (mp3 && !info.decodable) throw new Models.AppException("臻音全景声尚无可用解码器，不能转换为 MP3");
        String extension = mp3 ? "mp3" : info.extension;
        boolean convert = mp3 && !info.extension.equals("mp3");
        // Desktop also only embeds tags in MP3, FLAC and M4A; other formats remain unchanged.
        if (!mp3 && !(extension.equals("mp3") || extension.equals("flac") || extension.equals("m4a"))) return source;
        File output = null, image = null;
        try {
            output = File.createTempFile("musicdown-tagged-", "." + extension, source.getParentFile());
            if (!mp3 && extension.equals("m4a")) {
                Mp4Tagger.write(source, output, song, cover, control);
                Models.AudioInfo tagged = AudioInspector.inspect(output, control);
                if (!info.codec.equals(tagged.codec) || !DownloadRules.completeDuration(info.durationSeconds, tagged.durationSeconds))
                    throw new Models.AppException("写入 MP4 标签后音频校验失败");
                return output;
            }
            List<String> args = new ArrayList<>(Arrays.asList("-v", "error", "-y", "-i", source.getAbsolutePath()));
            if (cover != null) {
                image = File.createTempFile("musicdown-cover-", ".png", source.getParentFile());
                try (FileOutputStream stream = new FileOutputStream(image)) { cover.compress(Bitmap.CompressFormat.PNG, 100, stream); }
                args.addAll(Arrays.asList("-i", image.getAbsolutePath()));
            }
            args.addAll(Arrays.asList("-map", "0:a:0"));
            if (image != null) args.addAll(Arrays.asList("-map", "1:v:0", "-c:v", "png", "-disposition:v:0", "attached_pic"));
            args.addAll(Arrays.asList("-c:a", convert ? "libmp3lame" : "copy"));
            if (convert) {
                args.addAll(Arrays.asList("-q:a", "2"));
                if (info.channels > 2) args.addAll(Arrays.asList("-ac", "2"));
            }
            if (extension.equals("mp3")) args.addAll(Arrays.asList("-id3v2_version", "3"));
            args.addAll(Arrays.asList("-metadata", "title=" + song.title, "-metadata", "artist=" + song.artist,
                    "-metadata", "album=" + song.album));
            if (extension.equals("m4a")) args.addAll(Arrays.asList("-f", "mp4"));
            args.add(output.getAbsolutePath());
            NativeAudio.process(args.toArray(new String[0]), control);
            Models.AudioInfo verified = AudioInspector.inspect(output, control);
            if (!DownloadRules.completeDuration(info.durationSeconds, verified.durationSeconds))
                throw new Models.AppException("处理后的音频时长不完整，未保存");
            if (!mp3 && !info.codec.equals(verified.codec)) throw new Models.AppException("写入标签改变了音频编码，未保存");
            return output;
        } catch (Models.AppException e) { if (output != null) output.delete(); throw e; }
        catch (Exception e) { if (output != null) output.delete(); throw new Models.AppException("转换或标签写入失败：" + e.getMessage(), e); }
        finally { if (image != null) image.delete(); }
    }
}
