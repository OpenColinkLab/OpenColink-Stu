package com.musicdown.netease;

import com.arthenica.ffmpegkit.FFmpegKit;
import com.arthenica.ffmpegkit.FFprobeKit;
import com.arthenica.ffmpegkit.Session;
import com.arthenica.ffmpegkit.ReturnCode;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

/** Local-file processing only; arguments are passed as an array, never a shell command. */
final class NativeAudio {
    private NativeAudio() {}

    static String probe(String[] arguments, Models.Control control) throws Models.AppException {
        CountDownLatch done = new CountDownLatch(1);
        Session session = FFprobeKit.executeWithArgumentsAsync(arguments, completed -> done.countDown());
        return waitFor(session, done, control, 120);
    }

    static void process(String[] arguments, Models.Control control) throws Models.AppException {
        CountDownLatch done = new CountDownLatch(1);
        Session session = FFmpegKit.executeWithArgumentsAsync(arguments, completed -> done.countDown());
        waitFor(session, done, control, 600);
    }

    private static String waitFor(Session session, CountDownLatch done, Models.Control control, int seconds)
            throws Models.AppException {
        long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(seconds);
        try {
            while (!done.await(150, TimeUnit.MILLISECONDS)) {
                if (control.cancelled.get() || System.nanoTime() > deadline) {
                    session.cancel();
                    // Wait for native code to close its files before callers clean up temporary output.
                    done.await();
                    throw new Models.AppException(control.cancelled.get() ? "已取消" : "音频处理超时");
                }
            }
            MusicApi.checkCancelled(control);
            if (!ReturnCode.isSuccess(session.getReturnCode()))
                throw new Models.AppException("音频处理失败：" + brief(session.getOutput()));
            return session.getOutput();
        } catch (InterruptedException e) {
            session.cancel(); Thread.currentThread().interrupt();
            throw new Models.AppException("音频处理已中断", e);
        }
    }

    private static String brief(String value) {
        if (value == null || value.trim().isEmpty()) return "编码或容器不受支持";
        return value.length() <= 400 ? value.trim() : value.substring(value.length() - 400).trim();
    }
}
