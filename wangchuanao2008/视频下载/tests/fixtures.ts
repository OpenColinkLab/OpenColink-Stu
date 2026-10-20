import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import { execFileSync } from "node:child_process";
export async function fixtures(root: string) {
  fs.mkdirSync(root, { recursive: true });
  const ff =
    process.env.VD_TEST_FFMPEG ||
    path.resolve(
      process.platform === "win32"
        ? "resources/bin-win-x64/ffmpeg.exe"
        : "resources/bin/ffmpeg",
    );
  if (!fs.existsSync(path.join(root, "sample.mp4")))
    execFileSync(
      ff,
      [
        "-y",
        "-f",
        "lavfi",
        "-i",
        "testsrc2=size=640x360:rate=24",
        "-f",
        "lavfi",
        "-i",
        "sine=frequency=440:sample_rate=44100",
        "-t",
        "6",
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        "-movflags",
        "+faststart",
        path.join(root, "sample.mp4"),
      ],
      { stdio: "ignore" },
    );
  if (!fs.existsSync(path.join(root, "stream.mpd")))
    execFileSync(
      ff,
      [
        "-y",
        "-i",
        path.join(root, "sample.mp4"),
        "-map",
        "0:v",
        "-map",
        "0:a",
        "-c",
        "copy",
        "-seg_duration",
        "2",
        "-adaptation_sets",
        "id=0,streams=v id=1,streams=a",
        "-f",
        "dash",
        path.join(root, "stream.mpd"),
      ],
      { stdio: "ignore" },
    );
  const cover = path.join(root, "poster.jpg");
  if (!fs.existsSync(cover))
    execFileSync(
      ff,
      ["-y", "-i", path.join(root, "sample.mp4"), "-frames:v", "1", cover],
      { stdio: "ignore" },
    );
  let failRetry = true;
  const server = http.createServer((req, res) => {
    let pathname = decodeURIComponent(
      new URL(req.url!, "http://localhost").pathname,
    );
    if (pathname === "/retry.mp4" && failRetry) {
      res.writeHead(404);
      res.end();
      return;
    }
    if (
      pathname === "/retry.mp4" ||
      pathname === "/slow.mp4" ||
      pathname === "/hold.mp4"
    )
      pathname = "/sample.mp4";
    const file = path.join(root, path.basename(pathname));
    if (pathname === "/page" || pathname.startsWith("/page-")) {
      res.setHeader("Content-Type", "text/html");
      res.end(
        `<html><head><title>公开测试视频 ${pathname}</title></head><body><video controls poster="/poster.jpg" src="/sample.mp4"></video></body></html>`,
      );
      return;
    }
    if (pathname === "/poster.jpg") {
      res.setHeader("Content-Type", "image/jpeg");
      fs.createReadStream(file).pipe(res);
      return;
    }
    if (!fs.existsSync(file)) {
      res.writeHead(404);
      res.end();
      return;
    }
    const size = fs.statSync(file).size;
    res.setHeader(
      "Content-Type",
      file.endsWith(".mpd")
        ? "application/dash+xml"
        : file.endsWith(".mp4")
          ? "video/mp4"
          : "application/octet-stream",
    );
    res.setHeader("Content-Length", size);
    if (req.method === "HEAD") {
      res.end();
      return;
    }
    if (req.url === "/slow.mp4" || req.url === "/hold.mp4") {
      const data = fs.readFileSync(file);
      let p = 0;
      const timer = setInterval(
        () => {
          if (p >= data.length) {
            clearInterval(timer);
            res.end();
            return;
          }
          res.write(data.subarray(p, p + 16000));
          p += 16000;
        },
        req.url === "/hold.mp4" ? Number(process.env.VD_TEST_HOLD_INTERVAL || 250) : 80,
      );
      res.on("close", () => clearInterval(timer));
    } else fs.createReadStream(file).pipe(res);
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const address = server.address() as { port: number };
  return {
    url: `http://127.0.0.1:${address.port}`,
    allowRetry: () => {
      failRetry = false;
    },
    close: () => new Promise<void>((r) => server.close(() => r())),
  };
}
