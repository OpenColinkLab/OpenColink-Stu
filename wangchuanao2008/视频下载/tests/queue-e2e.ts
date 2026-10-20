import { _electron as electron } from "playwright";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { fixtures } from "./fixtures";
async function main() {
  const root = fs.mkdtempSync(path.resolve("test-artifacts/queue-ui-"));
  const fixture = await fixtures(path.resolve("test-artifacts/fixtures"));
  const executablePath = process.env.VD_PACKAGED_EXE;
  const app = await electron.launch({
    ...(executablePath ? { executablePath, args: [] } : { args: ["."] }),
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
    const add = async (u: string) => {
      await page.locator("#video-url").fill(u);
      await page.getByRole("button", { name: "下载视频", exact: true }).click();
    };
    await add(fixture.url + "/hold.mp4");
    await page.locator(".state-downloading").waitFor({ timeout: 90000 });
    for (const suffix of ["a", "b", "c"])
      await add(fixture.url + "/page-" + suffix);
    await page.waitForFunction(
      () => document.querySelectorAll(".state-queued").length === 3,
      undefined,
      { timeout: 15000 },
    );
    assert.equal(await page.locator(".state-downloading").count(), 1);
    for (const card of await page.locator(".state-queued").all()) {
      assert.match(await card.locator("h3").innerText(), /公开测试视频/);
      await card.locator("img").waitFor();
      assert(
        await card
          .locator("img")
          .evaluate((img: any) => img.complete && img.naturalWidth > 0),
      );
    }
    await page.screenshot({
      path: "test-artifacts/11-queue-prefetch.png",
      fullPage: true,
    });
    await page.getByRole("button", { name: "深色模式", exact: true }).click();
    await app.evaluate(({ BrowserWindow }) =>
      BrowserWindow.getAllWindows()[0].setSize(760, 620),
    );
    await page.waitForTimeout(200);
    assert(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.screenshot({
      path: "test-artifacts/12-queue-dark-small.png",
      fullPage: true,
    });
    await page
      .locator(".state-queued")
      .filter({ hasText: "page-c" })
      .getByRole("button", { name: "取消任务", exact: true })
      .click();
    await page
      .locator(".state-downloading")
      .getByRole("button", { name: "取消任务", exact: true })
      .click();
    await page.waitForFunction(
      () => document.querySelectorAll(".state-completed").length === 2,
      undefined,
      { timeout: 90000 },
    );
    assert.equal(await page.locator(".state-cancelled").count(), 2);
    console.log(
      "真实队列界面验证通过：首个文件下载期间，后续三个任务已显示标题和封面；取消不影响剩余任务。",
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
