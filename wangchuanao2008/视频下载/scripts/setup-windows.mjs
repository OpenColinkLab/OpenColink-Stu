import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { getPath7za } = require("app-builder-lib/out/toolsets/7zip");
const records = JSON.parse(
  fs.readFileSync("resources/binaries-win-x64.json", "utf8"),
);
const cache = path.resolve("resources/windows-downloads");
const bin = path.resolve("resources/bin-win-x64");
fs.mkdirSync(cache, { recursive: true });
fs.mkdirSync(bin, { recursive: true });
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
for (const record of records) {
  const archive = path.join(cache, record.archive);
  if (
    !fs.existsSync(archive) ||
    hash(fs.readFileSync(archive)) !== record.sha256
  ) {
    console.log("下载：" + record.name);
    const response = await fetch(record.url);
    if (!response.ok) throw new Error("下载失败：" + response.status);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (hash(bytes) !== record.sha256)
      throw new Error("组件校验失败：" + record.name);
    fs.writeFileSync(archive, bytes);
  }
  if (record.archive.endsWith(".exe")) {
    fs.copyFileSync(archive, path.join(bin, "yt-dlp.exe"));
  } else {
    const unpack = path.join(cache, "extracted");
    execFileSync(await getPath7za(), ["x", "-y", archive, "-o" + unpack], {
      stdio: "ignore",
    });
    const root = path.join(unpack, "ffmpeg-9.0.2-essentials_build");
    for (const name of ["ffmpeg.exe", "ffprobe.exe"])
      fs.copyFileSync(path.join(root, "bin", name), path.join(bin, name));
    fs.copyFileSync(
      path.join(root, "LICENSE"),
      path.join(bin, "FFmpeg-LICENSE.txt"),
    );
    fs.copyFileSync(
      path.join(root, "README.txt"),
      path.join(bin, "FFmpeg-README.txt"),
    );
  }
  console.log("已校验并准备：" + record.name);
}
fs.writeFileSync(
  path.join(bin, "checksums.json"),
  JSON.stringify(
    Object.fromEntries(
      ["yt-dlp.exe", "ffmpeg.exe", "ffprobe.exe"].map((name) => [
        name,
        hash(fs.readFileSync(path.join(bin, name))),
      ]),
    ),
    null,
    2,
  ) + "\n",
);
