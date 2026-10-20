import { _electron as electron } from "playwright";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import os from "node:os";
const appPath = path.resolve(process.argv[2] || "视频下载器.app");
const executablePath = path.join(appPath, "Contents/MacOS/视频下载器");
const root = fs.mkdtempSync(path.join(os.tmpdir(), "vd-package-check-"));
const env = {
  ...process.env,
  VD_TEST_STATE: path.join(root, "state"),
  VD_TEST_DOWNLOADS: path.join(root, "downloads"),
};
let app = await electron.launch({ executablePath, args: [], env, timeout: 60000 });
let page = await app.firstWindow();
await page.waitForSelector("#video-url");
assert(await app.evaluate(({ app }) => app.isPackaged));
await page.getByRole("button", { name: "浅色模式", exact: true }).click();
await page
  .locator("#video-url")
  .fill(
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  );
await page.getByRole("button", { name: "下载视频", exact: true }).click();
await page.locator(".state-completed").first().waitFor({ timeout: 150000 });
const snapshot = await page.evaluate(() => window.downloader.snapshot());
const task = snapshot.tasks[0];
assert.equal(task.status, "completed");
assert(fs.existsSync(task.file));
assert(task.thumbnail?.startsWith("data:image/jpeg"));
const bin = path.join(appPath, "Contents/Resources/bin");
const probe = JSON.parse(
  execFileSync(
    path.join(bin, "ffprobe"),
    ["-v", "error", "-show_streams", "-show_format", "-of", "json", task.file],
    { encoding: "utf8" },
  ),
);
assert(probe.streams.some((s) => s.codec_type === "video"));
assert(probe.streams.some((s) => s.codec_type === "audio"));
execFileSync(
  path.join(bin, "ffmpeg"),
  ["-v", "error", "-i", task.file, "-f", "null", "-"],
  { stdio: "pipe" },
);
await page.waitForTimeout(1000);
fs.mkdirSync("test-artifacts", { recursive: true });
await page.screenshot({ path: "test-artifacts/08-packaged-light.png" });
await app.close();
app = await electron.launch({ executablePath, args: [], env, timeout: 60000 });
page = await app.firstWindow();
await page.locator(".state-completed").first().waitFor();
const reopened = await page.evaluate(() => window.downloader.snapshot());
assert(reopened.tasks.some((t) => t.id === task.id && t.file === task.file));
assert.equal(reopened.settings.theme, "light");
await page
  .getByRole("button", { name: "打开所在文件夹", exact: true })
  .first()
  .click();
await page
  .getByRole("button", { name: "打开文件", exact: true })
  .first()
  .click();
await page.waitForTimeout(1000);
fs.writeFileSync(
  "test-artifacts/package-result.json",
  JSON.stringify(
    {
      isPackaged: true,
      task,
      streams: probe.streams.map((s) => ({
        type: s.codec_type,
        codec: s.codec_name,
        width: s.width,
        height: s.height,
      })),
      reopened: true,
    },
    null,
    2,
  ),
);
await app.close();
console.log("打包应用验证通过；实际保存文件：" + task.file);
