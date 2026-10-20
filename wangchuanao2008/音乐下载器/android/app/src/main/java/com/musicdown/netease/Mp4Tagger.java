package com.musicdown.netease;

import android.graphics.Bitmap;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.RandomAccessFile;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

/** Edit only MP4 metadata; preserve unknown sample entries such as AV3A and all media bytes. */
final class Mp4Tagger {
    private static final int MAX_MOOV = 16 * 1024 * 1024;
    private Mp4Tagger() {}

    static void write(File source, File target, Models.Song song, Bitmap cover, Models.Control control)
            throws Exception {
        try (RandomAccessFile input = new RandomAccessFile(source, "r");
             RandomAccessFile output = new RandomAccessFile(target, "rw")) {
            long moovStart = -1, moovEnd = -1;
            byte[] moov = null;
            for (long position = 0; position < input.length();) {
                input.seek(position);
                long size = Integer.toUnsignedLong(input.readInt());
                byte[] type = new byte[4]; input.readFully(type);
                int header = 8;
                if (size == 1) { size = input.readLong(); header = 16; }
                if (size == 0) size = input.length() - position;
                if (size < header || size > input.length() - position) throw new Models.AppException("MP4 容器长度无效");
                if (new String(type, StandardCharsets.ISO_8859_1).equals("moov")) {
                    if (moov != null || size > MAX_MOOV) throw new Models.AppException("MP4 元数据过大或重复");
                    moovStart = position; moovEnd = position + size;
                    byte[] payload = new byte[(int)size - header]; input.readFully(payload);
                    moov = replaceTags(payload, song, cover);
                }
                position += size;
            }
            if (moov == null) throw new Models.AppException("MP4 缺少 moov 元数据");
            long delta = moov.length - (moovEnd - moovStart);
            adjustOffsets(moov, 8, moov.length, moovEnd, delta);
            output.setLength(0);
            input.seek(0); copy(input, output, moovStart, control);
            output.write(moov); input.seek(moovEnd);
            copy(input, output, input.length() - moovEnd, control);
        }
    }

    private static byte[] replaceTags(byte[] payload, Models.Song song, Bitmap cover) throws Exception {
        ByteArrayOutputStream tags = new ByteArrayOutputStream();
        tags.write(atom("©nam", data(1, song.title.getBytes(StandardCharsets.UTF_8))));
        tags.write(atom("©ART", data(1, song.artist.getBytes(StandardCharsets.UTF_8))));
        tags.write(atom("©alb", data(1, song.album.getBytes(StandardCharsets.UTF_8))));
        if (cover != null) {
            ByteArrayOutputStream png = new ByteArrayOutputStream();
            cover.compress(Bitmap.CompressFormat.PNG, 100, png);
            tags.write(atom("covr", data(14, png.toByteArray())));
        }
        byte[] ilst = atom("ilst", tags.toByteArray());
        byte[] handler = atom("hdlr", new byte[]{0,0,0,0, 0,0,0,0, 'm','d','i','r', 'a','p','p','l', 0,0,0,0, 0,0,0,0, 0});
        byte[] meta = atom("meta", concat(new byte[4], handler, ilst));
        ByteArrayOutputStream result = new ByteArrayOutputStream();
        boolean found = false;
        for (int position = 0; position < payload.length;) {
            int size = size(payload, position, payload.length);
            String type = type(payload, position);
            if (type.equals("udta")) {
                ByteArrayOutputStream udta = new ByteArrayOutputStream();
                for (int child = position + 8; child < position + size;) {
                    int childSize = size(payload, child, position + size);
                    if (!type(payload, child).equals("meta")) udta.write(payload, child, childSize);
                    child += childSize;
                }
                udta.write(meta); result.write(atom("udta", udta.toByteArray())); found = true;
            } else result.write(payload, position, size);
            position += size;
        }
        if (!found) result.write(atom("udta", meta));
        return atom("moov", result.toByteArray());
    }

    private static void adjustOffsets(byte[] bytes, int begin, int end, long boundary, long delta) throws Exception {
        ByteBuffer buffer = ByteBuffer.wrap(bytes).order(ByteOrder.BIG_ENDIAN);
        for (int p = begin; p < end;) {
            int length = size(bytes, p, end); String type = type(bytes, p);
            if (type.equals("stco") || type.equals("co64")) {
                if (length < 16) throw new Models.AppException("MP4 分块偏移无效");
                long count = Integer.toUnsignedLong(buffer.getInt(p + 12)); int width = type.equals("stco") ? 4 : 8;
                if (count > (length - 16) / width) throw new Models.AppException("MP4 分块表不完整");
                for (int i = 0; i < count; i++) {
                    int at = p + 16 + i * width;
                    long offset = width == 4 ? Integer.toUnsignedLong(buffer.getInt(at)) : buffer.getLong(at);
                    if (offset >= boundary) {
                        offset += delta;
                        if (offset < 0 || (width == 4 && offset > 0xffffffffL)) throw new Models.AppException("MP4 偏移超出范围");
                        if (width == 4) buffer.putInt(at, (int)offset); else buffer.putLong(at, offset);
                    }
                }
            } else if (Arrays.asList("trak", "mdia", "minf", "stbl").contains(type))
                adjustOffsets(bytes, p + 8, p + length, boundary, delta);
            p += length;
        }
    }

    private static int size(byte[] bytes, int p, int end) throws Exception {
        if (end - p < 8) throw new Models.AppException("MP4 元数据截断");
        long size = Integer.toUnsignedLong(ByteBuffer.wrap(bytes, p, 4).getInt());
        if (size < 8 || size > end - p) throw new Models.AppException("不支持的 MP4 元数据长度");
        return (int)size;
    }
    private static String type(byte[] bytes, int p) { return new String(bytes, p + 4, 4, StandardCharsets.ISO_8859_1); }
    private static byte[] atom(String type, byte[] payload) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        out.write(ByteBuffer.allocate(4).putInt(payload.length + 8).array());
        out.write(type.getBytes(StandardCharsets.ISO_8859_1)); out.write(payload); return out.toByteArray();
    }
    private static byte[] data(int type, byte[] value) throws Exception { return atom("data", concat(ByteBuffer.allocate(8).putInt(type).putInt(0).array(), value)); }
    private static byte[] concat(byte[]... arrays) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream(); for (byte[] a : arrays) out.write(a); return out.toByteArray();
    }
    private static void copy(RandomAccessFile in, RandomAccessFile out, long count, Models.Control control) throws Exception {
        byte[] bytes = new byte[128 * 1024];
        while (count > 0) {
            MusicApi.checkCancelled(control);
            int read = in.read(bytes, 0, (int)Math.min(bytes.length, count));
            if (read < 0) throw new Models.AppException("MP4 媒体数据截断");
            out.write(bytes, 0, read); count -= read;
        }
    }
}
