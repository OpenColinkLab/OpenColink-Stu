package com.musicdown.netease;

import android.test.InstrumentationTestCase;
import android.graphics.Bitmap;
import org.json.JSONObject;
import java.io.File;
import java.io.RandomAccessFile;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.Arrays;

/** Real native codec and MP4 tests, without an account or network service. */
public class NativeAudioTest extends InstrumentationTestCase {
    private File directory;
    private final Models.Control control = new Models.Control();
    private final Models.Song song = new Models.Song("test", "测试标题", "测试歌手", "测试专辑", "", 2, "");

    @Override protected void setUp() throws Exception {
        super.setUp();
        directory = new File(getInstrumentation().getTargetContext().getCacheDir(), "native-audio-tests");
        directory.mkdirs();
    }

    @Override protected void tearDown() throws Exception {
        File[] files = directory.listFiles();
        if (files != null) for (File file : files) file.delete();
        directory.delete(); super.tearDown();
    }

    private File tone(String name, String codec, boolean fastStart) throws Exception {
        File file = new File(directory, name);
        java.util.List<String> args = new java.util.ArrayList<>(Arrays.asList("-v", "error", "-y", "-f", "lavfi", "-i",
                "sine=frequency=440:duration=2", "-c:a", codec));
        if (fastStart) args.addAll(Arrays.asList("-movflags", "+faststart"));
        if (name.endsWith(".m4a")) args.addAll(Arrays.asList("-f", "mp4"));
        args.add(file.getAbsolutePath());
        NativeAudio.process(args.toArray(new String[0]), control);
        return file;
    }

    private JSONObject metadata(File file) throws Exception {
        return new JSONObject(NativeAudio.probe(new String[]{"-v", "error", "-show_streams", "-show_format", "-of", "json",
                file.getAbsolutePath()}, control));
    }

    private Bitmap cover() { return Bitmap.createBitmap(16, 16, Bitmap.Config.ARGB_8888); }

    public void testFlacCoverTagsAndMp3Conversion() throws Exception {
        File source = tone("source.flac", "flac", false);
        Models.AudioInfo info = AudioInspector.inspect(source, control);
        assertTrue(info.lossless); assertEquals("FLAC", info.codec);
        File tagged = AudioProcessor.prepare(source, info, song, cover(), false, control);
        JSONObject data = metadata(tagged);
        JSONObject tags = data.getJSONObject("format").getJSONObject("tags");
        assertEquals(song.title, tags.optString("title", tags.optString("TITLE")));
        assertEquals(2, data.getJSONArray("streams").length());
        assertTrue(AudioInspector.inspect(tagged, control).lossless);
        File mp3 = AudioProcessor.prepare(source, info, song, cover(), true, control);
        assertEquals("MP3", AudioInspector.inspect(mp3, control).codec);
        assertEquals(song.artist, metadata(mp3).getJSONObject("format").getJSONObject("tags").getString("artist"));
    }

    public void testM4aTagsPreserveAudioWithMoovBeforeOrAfterMedia() throws Exception {
        for (boolean fastStart : new boolean[]{false, true}) {
            File source = tone(fastStart ? "fast.m4a" : "tail.m4a", "aac", fastStart);
            File tagged = AudioProcessor.prepare(source, AudioInspector.inspect(source, control), song, cover(), false, control);
            assertTrue(Arrays.equals(mediaBytes(source), mediaBytes(tagged)));
            JSONObject tags = metadata(tagged).getJSONObject("format").getJSONObject("tags");
            assertEquals(song.title, tags.getString("title"));
            assertEquals(song.album, tags.getString("album"));
            assertEquals("AAC", AudioInspector.inspect(tagged, control).codec);
        }
    }

    public void testDolbyReportsCodecAndRejectsDowngrade() throws Exception {
        File source = tone("dolby.m4a", "eac3", false);
        Models.AudioInfo info = AudioInspector.inspect(source, control);
        assertEquals("E-AC-3", info.codec); assertFalse(info.lossless);
        assertEquals("", DownloadRules.qualityFailure("dolby", "dolby", "网易云账号音源", info.lossless, info.codec));
    }

    public void testUnknownAv3aPreservesPacketsAndRejectsTruncationAndConversion() throws Exception {
        File source = tone("vivid.m4a", "aac", true);
        byte[] bytes = Files.readAllBytes(source.toPath());
        byte[] old = "mp4a".getBytes(StandardCharsets.US_ASCII);
        boolean replaced = false;
        for (int i = 0; i <= bytes.length - old.length; i++) {
            if (bytes[i] == old[0] && bytes[i+1] == old[1] && bytes[i+2] == old[2] && bytes[i+3] == old[3]) {
                System.arraycopy("av3a".getBytes(StandardCharsets.US_ASCII), 0, bytes, i, 4); replaced = true; break;
            }
        }
        assertTrue(replaced); Files.write(source.toPath(), bytes);
        Models.AudioInfo info = AudioInspector.inspect(source, control);
        assertFalse(info.decodable); assertEquals("AVS3 Audio Vivid (av3a)", info.codec);
        File tagged = AudioProcessor.prepare(source, info, song, cover(), false, control);
        assertTrue(Arrays.equals(mediaBytes(source), mediaBytes(tagged)));
        assertFalse(AudioInspector.inspect(tagged, control).decodable);
        try { AudioProcessor.prepare(source, info, song, null, true, control); fail("conversion accepted unknown codec"); }
        catch (Models.AppException expected) { assertTrue(expected.getMessage().contains("不能转换")); }
        File truncated = new File(directory, "truncated.m4a");
        Files.write(truncated.toPath(), Arrays.copyOf(bytes, bytes.length / 2));
        try { AudioInspector.inspect(truncated, control); fail("accepted truncated packets"); }
        catch (Models.AppException expected) { assertTrue(expected.getMessage(), expected.getMessage().contains("不完整")); }
    }

    private byte[] mediaBytes(File file) throws Exception {
        try (RandomAccessFile stream = new RandomAccessFile(file, "r")) {
            while (stream.getFilePointer() < stream.length()) {
                long start = stream.getFilePointer(), size = stream.readInt() & 0xffffffffL;
                byte[] type = new byte[4]; stream.readFully(type);
                if (size == 1) size = stream.readLong();
                if (size == 0) size = stream.length() - start;
                if (new String(type, StandardCharsets.US_ASCII).equals("mdat")) {
                    byte[] media = new byte[(int)(start + size - stream.getFilePointer())]; stream.readFully(media); return media;
                }
                stream.seek(start + size);
            }
        }
        throw new AssertionError("missing mdat");
    }
}
