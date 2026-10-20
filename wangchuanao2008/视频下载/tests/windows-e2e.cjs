// Runs with the packaged Electron executable in Node mode on Windows.
const { _electron: electron } = require("playwright-core");
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const { fixtures } = require("./fixtures.cjs");
async function main() {
  assert.equal(process.platform, "win32");
  process.env.VD_TEST_HOLD_INTERVAL = "1000";
  const executablePath = path.resolve("app/视频下载器.exe");
  const bin = path.resolve("app/resources/bin");
  process.env.VD_TEST_FFMPEG = path.join(bin, "ffmpeg.exe");
  const root = fs.mkdtempSync(path.resolve("test-artifacts/windows-"));
  const fixture = await fixtures(path.resolve("test-artifacts/fixtures"));
  const env = {
    ...process.env,
    VD_TEST_STATE: root,
    VD_TEST_DOWNLOADS: path.join(root, "中文保存目录"),
  };
  delete env.ELECTRON_RUN_AS_NODE;
  let app;
  const launch = async () => {
    app = await electron.launch({
      executablePath,
      args: [],
      env,
      timeout: 90000,
    });
    const page = await app.firstWindow();
    await page.waitForSelector("#video-url");
    return page;
  };
  try {
    let page = await launch();
    const add = async (suffix) => {
      await page.locator("#video-url").fill(fixture.url + suffix);
      await page.getByRole("button", { name: "下载视频", exact: true }).click();
    };
    await add("/hold.mp4");
    await page.locator(".state-downloading").waitFor({ timeout: 90000 });
    await add("/page-a");
    await add("/page-b");
    await page.waitForFunction(
      () => document.querySelectorAll(".state-queued").length === 2,
      undefined,
      { timeout: 90000 },
    );
    assert.equal(await page.locator(".state-downloading").count(), 1);
    for (const card of await page.locator(".state-queued").all()) {
      assert.match(await card.locator("h3").innerText(), /公开测试视频/);
      assert(
        await card
          .locator("img")
          .evaluate((i) => i.complete && i.naturalWidth > 0),
      );
    }
    await page.screenshot({
      path: path.join(root, "windows-light.png"),
      fullPage: true,
    });
    await page
      .locator(".state-downloading")
      .getByRole("button", { name: "取消任务", exact: true })
      .click();
    await page.waitForFunction(
      () => document.querySelectorAll(".state-completed").length === 2,
      undefined,
      { timeout: 150000 },
    );
    await page
      .locator(".state-cancelled")
      .getByRole("button", { name: "重试", exact: true })
      .click();
    await page.waitForFunction(
      () => document.querySelectorAll(".state-completed").length === 3,
      undefined,
      { timeout: 150000 },
    );
    await add("/stream.mpd");
    await page.waitForFunction(
      () => document.querySelectorAll(".state-completed").length === 4,
      undefined,
      { timeout: 150000 },
    );
    await add("/retry.mp4");
    await page.locator(".state-failed").waitFor({ timeout: 90000 });
    assert.match(await page.locator(".state-failed").innerText(), /失效/);
    fixture.allowRetry();
    await page
      .locator(".state-failed")
      .getByRole("button", { name: "重试", exact: true })
      .click();
    await page.waitForFunction(
      () => document.querySelectorAll(".state-completed").length === 5,
      undefined,
      { timeout: 150000 },
    );
    await page.getByRole("button", { name: "深色模式", exact: true }).click();
    await app.evaluate(({ BrowserWindow }) =>
      BrowserWindow.getAllWindows()[0].setSize(760, 620),
    );
    await page.waitForTimeout(300);
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.screenshot({
      path: path.join(root, "windows-dark-small.png"),
      fullPage: true,
    });
    const snapshot = await page.evaluate(() => window.downloader.snapshot());
    for (const task of snapshot.tasks) {
      assert.equal(task.status, "completed", task.error);
      assert.equal(path.dirname(task.file), env.VD_TEST_DOWNLOADS);
      const data = JSON.parse(
        execFileSync(
          path.join(bin, "ffprobe.exe"),
          ["-v", "error", "-show_streams", "-of", "json", task.file],
          { encoding: "utf8", windowsHide: true },
        ),
      );
      assert(data.streams.some((s) => s.codec_type === "video"));
      assert(data.streams.some((s) => s.codec_type === "audio"));
      execFileSync(
        path.join(bin, "ffmpeg.exe"),
        ["-v", "error", "-i", task.file, "-f", "null", "-"],
        { stdio: "pipe", windowsHide: true },
      );
    }
    assert(snapshot.tasks.some((t) => t.file.endsWith(".mkv")));
    await app.close();
    app = undefined;
    page = await launch();
    await page.waitForFunction(
      () => document.querySelectorAll(".state-completed").length === 5,
    );
    const saved = await page.evaluate(() => window.downloader.snapshot());
    assert.equal(saved.settings.theme, "dark");
    assert.equal(saved.settings.directory, env.VD_TEST_DOWNLOADS);
    console.log(
      "PASS: Windows packaged UI, queue covers, cancel/retry, 404/retry, MP4, DASH merge, audio+video decoding, Chinese paths, themes, resize, persisted history.",
    );
    console.log("Artifacts: " + root);
  } catch (error) {
    if (app) {
      const page = await app.firstWindow();
      console.error(
        JSON.stringify(
          await page.evaluate(() => window.downloader.snapshot()),
          null,
          2,
        ),
      );
      await page.screenshot({
        path: path.join(root, "windows-failure.png"),
        fullPage: true,
      });
      await app.evaluate(({ app }) => app.exit(1)).catch(() => {});
      app = undefined;
    }
    throw error;
  } finally {
    if (app) await app.close();
    await fixture.close();
  }
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
