import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
if (process.platform !== "darwin" || process.arch !== "arm64")
  throw new Error(
    "此脚本内置的是 macOS ARM64 组件。Windows 构建需要同架构的 yt-dlp.exe、ffmpeg.exe 和 ffprobe.exe。",
  );
const records = JSON.parse(fs.readFileSync("resources/binaries.json", "utf8"));
fs.mkdirSync("resources/bin", { recursive: true });
for (const record of records) {
  const response = await fetch(record.url);
  if (!response.ok)
    throw new Error(`下载失败 ${response.status}: ${record.url}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (createHash("sha256").update(bytes).digest("hex") !== record.sha256)
    throw new Error(`校验不一致：${record.name}`);
  const file = path.join("resources", record.archive);
  fs.writeFileSync(file, bytes);
  fs.mkdirSync(record.destination, { recursive: true });
  execFileSync("unzip", ["-oq", file, "-d", record.destination]);
  fs.chmodSync(record.executable, 0o755);
  console.log("已准备 " + record.name);
}
