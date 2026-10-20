import { _electron as electron } from "playwright";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { fixtures } from "./fixtures";
async function main() {
  const root = path.resolve("test-artifacts");
  const temp = fs.mkdtempSync(path.join(root, "ui-"));
  const fixture = await fixtures(path.join(root, "fixtures"));
  const app = await electron.launch({
    args: ["."],
    env: {
      ...process.env,
      VD_TEST_STATE: path.join(temp, "state"),
      VD_TEST_DOWNLOADS: path.join(temp, "视频保存"),
    },
    timeout: 60000,
  });
  const page = await app.firstWindow();
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  try {
    await page.waitForSelector("#video-url");
    await page.getByRole("button", { name: "浅色模式", exact: true }).click();
    await page.waitForFunction(
      () => document.documentElement.dataset.theme === "light",
    );
    await page.waitForTimeout(180);
    await page.screenshot({ path: path.join(root, "01-light-empty.png") });
    await page.getByRole("button", { name: "深色模式", exact: true }).click();
    await page.waitForFunction(
      () => document.documentElement.dataset.theme === "dark",
    );
    await page.waitForTimeout(180);
    await page.screenshot({ path: path.join(root, "02-dark-empty.png") });
    await app.evaluate(({ BrowserWindow }) =>
      BrowserWindow.getAllWindows()[0].setSize(760, 620),
    );
    await page.waitForTimeout(180);
    await page.screenshot({ path: path.join(root, "03-dark-small.png") });
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await app.evaluate(({ BrowserWindow }) =>
      BrowserWindow.getAllWindows()[0].setSize(1140, 820),
    );
    await page.getByRole("button", { name: "浅色模式", exact: true }).click();
    await page.waitForFunction(
      () => document.documentElement.dataset.theme === "light",
    );
    await page.locator("#video-url").fill("无效链接");
    await page.locator("#video-url").press("Enter");
    await page.getByRole("alert").waitFor();
    assert((await page.getByRole("alert").textContent())?.includes("网址"));
    await page.getByRole("button", { name: "关闭提示", exact: true }).click();
    await app.evaluate(
      ({ clipboard }, u) => clipboard.writeText(u),
      fixture.url + "/sample.mp4",
    );
    await page
      .getByRole("button", { name: "从剪贴板粘贴", exact: true })
      .click();
    await page.waitForFunction(
      (u) =>
        (document.getElementById("video-url") as HTMLInputElement).value === u,
      fixture.url + "/sample.mp4",
    );
    await page.getByRole("button", { name: "下载视频", exact: true }).click();
    await page.locator(".state-completed").waitFor({ timeout: 150000 });
    assert(await page.locator(".state-completed .file-path").isVisible());
    await page.waitForTimeout(180);
    await page.screenshot({ path: path.join(root, "04-completed.png") });
    await page.locator("#video-url").fill(fixture.url + "/stream.mpd");
    await page.getByRole("button", { name: "高级选项", exact: true }).click();
    await page.getByRole("button", { name: "解析清晰度", exact: true }).click();
    await page.locator(".state-ready").waitFor({ timeout: 120000 });
    const options = await page
      .getByRole("combobox", { name: "选择清晰度" })
      .locator("option")
      .allTextContents();
    assert.deepEqual(options, ["最佳可用画质", "360p"]);
    await page
      .getByRole("combobox", { name: "选择清晰度" })
      .selectOption("360");
    await page.getByRole("button", { name: "开始下载", exact: true }).click();
    await page.waitForFunction(
      () => document.querySelectorAll(".state-completed").length === 2,
      {},
      { timeout: 150000 },
    );
    await page.locator("#video-url").fill(fixture.url + "/slow.mp4");
    await page.getByRole("button", { name: "下载视频", exact: true }).click();
    await page.locator(".state-downloading").waitFor({ timeout: 120000 });
    await page.waitForTimeout(180);
    await page.screenshot({ path: path.join(root, "05-progress.png") });
    await page.getByRole("button", { name: "取消任务", exact: true }).click();
    await page.locator(".state-cancelled").waitFor();
    await page.waitForTimeout(1800);
    await page
      .locator(".state-cancelled")
      .getByRole("button", { name: "重试", exact: true })
      .click();
    await page.waitForFunction(
      () => document.querySelectorAll(".state-completed").length === 3,
      {},
      { timeout: 150000 },
    );
    await page.locator("#video-url").fill(fixture.url + "/retry.mp4");
    await page.getByRole("button", { name: "下载视频", exact: true }).click();
    await page.locator(".state-failed").waitFor({ timeout: 120000 });
    assert((await page.locator(".task-error").textContent())?.includes("失效"));
    await page.getByText("技术日志", { exact: true }).click();
    await page.waitForTimeout(180);
    await page.screenshot({ path: path.join(root, "06-error-log.png") });
    fixture.allowRetry();
    await page
      .locator(".state-failed")
      .getByRole("button", { name: "重试", exact: true })
      .click();
    await page.waitForFunction(
      () => document.querySelectorAll(".state-completed").length === 4,
      {},
      { timeout: 150000 },
    );
    // Exercise native folder picker through Electron's real IPC with a deterministic test selection.
    const secondDir = path.join(temp, "新保存目录");
    await app.evaluate(({ dialog }, dir) => {
      dialog.showOpenDialog = async () => ({
        canceled: false,
        filePaths: [dir],
      });
    }, secondDir);
    await page.locator(".directory").click();
    await page.waitForFunction(
      (d) => document.querySelector(".directory")?.getAttribute("title") === d,
      secondDir,
    );
    await page.locator("#video-url").fill(fixture.url + "/page");
    await page.getByRole("button", { name: "下载视频", exact: true }).click();
    await page.waitForFunction(
      () => document.querySelectorAll(".state-completed").length === 5,
      {},
      { timeout: 150000 },
    );
    // Verify OS open actions are dispatched with actual completed file paths.
    await app.evaluate(({ shell }) => {
      (globalThis as any).openCalls = [];
      shell.openPath = async (p) => {
        (globalThis as any).openCalls.push(["open", p]);
        return "";
      };
      shell.showItemInFolder = (p) => {
        (globalThis as any).openCalls.push(["folder", p]);
      };
    });
    await page
      .getByRole("button", { name: "打开文件", exact: true })
      .first()
      .click();
    await page
      .getByRole("button", { name: "打开所在文件夹", exact: true })
      .first()
      .click();
    await page
      .getByRole("button", { name: "打开保存文件夹", exact: true })
      .click();
    const calls = await app.evaluate(() => (globalThis as any).openCalls);
    assert.equal(calls.length, 3);
    assert(fs.existsSync(calls[0][1]));
    assert.equal(path.dirname(calls[0][1]), secondDir);
    await page.getByRole("button", { name: "深色模式", exact: true }).click();
    await page.waitForFunction(
      () => document.documentElement.dataset.theme === "dark",
    );
    await page.waitForTimeout(180);
    await page.screenshot({ path: path.join(root, "07-dark-tasks.png") });
    await page.getByRole("button", { name: "使用说明与支持范围" }).click();
    await page.getByRole("dialog").waitFor();
    await page
      .getByRole("button", { name: "关闭说明", exact: true })
      .press("Escape");
    await page.getByRole("button", { name: "下载记录", exact: true }).click();
    assert.equal(await page.locator(".task-card").count(), 5);
    await page
      .getByRole("button", { name: "删除记录", exact: true })
      .first()
      .click();
    await page.waitForFunction(
      () => document.querySelectorAll(".task-card").length === 4,
    );
    assert(fs.existsSync(calls[0][1]));
    await page.getByRole("button", { name: "进行中", exact: true }).click();
    assert(await page.getByText("当前没有进行中的下载任务。").isVisible());
    assert.deepEqual(errors, []);
    await page.waitForTimeout(800);
    console.log("UI 验证通过；状态目录：" + temp);
    fs.writeFileSync(
      path.join(root, "ui-result.json"),
      JSON.stringify({ temp, calls, options, errors }, null, 2),
    );
  } finally {
    await app.close();
    await fixture.close();
  }
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
