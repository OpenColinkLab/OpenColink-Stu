import { _electron as electron } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

async function main() {
const root = fs.mkdtempSync(path.resolve("test-artifacts/youku-public-"));
const app = await electron.launch({
  args: ["."],
  env: {
    ...process.env,
    VD_TEST_STATE: root,
    VD_TEST_DOWNLOADS: path.join(root, "downloads"),
  },
  timeout: 60000,
});
try {
  const page = await app.firstWindow();
  await page.waitForSelector("#video-url");
  const id = await page.evaluate(() =>
    window.downloader.add(
      "https://v.youku.com/v_show/id_XNTA2NTA0MjA1Mg==.html",
      true,
    ),
  );
  await page.locator(".state-ready,.state-failed").first().waitFor({ timeout: 90000 });
  const task = (await page.evaluate(() => window.downloader.snapshot())).tasks.find(
    (item) => item.id === id,
  )!;
  assert.equal(task.status, "ready", task.error + "\n" + task.logs.join("\n"));
  assert(task.duration && task.duration > 500);
  assert(task.heights.includes(360));
  assert(task.thumbnail?.startsWith("http"));
  console.log(
    JSON.stringify({
      title: task.title,
      duration: task.duration,
      heights: task.heights,
      source: task.source,
    }),
  );
  await page.screenshot({ path: "test-artifacts/13-youku-public-metadata.png" });
} finally {
  await app.close();
}
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
