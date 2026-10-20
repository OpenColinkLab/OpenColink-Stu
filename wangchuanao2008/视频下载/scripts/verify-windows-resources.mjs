import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
const root = path.resolve(process.argv[2] || "resources/bin-win-x64");
const checksums = JSON.parse(
  fs.readFileSync(path.join(root, "checksums.json"), "utf8"),
);
for (const name of ["yt-dlp.exe", "ffmpeg.exe", "ffprobe.exe"]) {
  const bytes = fs.readFileSync(path.join(root, name));
  assert.equal(
    bytes.toString("ascii", 0, 2),
    "MZ",
    name + " 不是 Windows 可执行文件",
  );
  const offset = bytes.readUInt32LE(0x3c);
  assert.equal(bytes.readUInt32LE(offset), 0x4550, name + " PE 标头错误");
  assert.equal(bytes.readUInt16LE(offset + 4), 0x8664, name + " 不是 x64 架构");
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    checksums[name],
    name + " 校验失败",
  );
}
console.log("Windows x64 三个运行组件架构与 SHA-256 检查通过。");
