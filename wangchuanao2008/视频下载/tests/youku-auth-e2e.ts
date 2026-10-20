import { _electron as electron } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

async function main() {
  const root = fs.mkdtempSync(path.resolve("test-artifacts/youku-auth-ui-"));
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
    await page.getByRole("button", { name: "优酷", exact: true }).click();
    await page.getByRole("button", { name: "登录 优酷" }).click();
    await page.waitForTimeout(400);
    const security = await app.evaluate(({ BrowserWindow }) => {
      const window = BrowserWindow.getAllWindows().find((candidate) =>
        candidate.webContents.getURL().includes("www.youku.com"),
      )!;
      const preferences = (window.webContents as any).getLastWebPreferences();
      return {
        nodeIntegration: preferences.nodeIntegration,
        contextIsolation: preferences.contextIsolation,
        sandbox: preferences.sandbox,
        preload: preferences.preload,
      };
    });
    assert.equal(security.nodeIntegration, false);
    assert.equal(security.contextIsolation, true);
    assert.equal(security.sandbox, true);
    assert(!security.preload);
    await app.evaluate(async ({ session }) => {
      await session.fromPartition("youku-auth").cookies.set({
        url: "https://www.youku.com/",
        domain: ".youku.com",
        path: "/",
        secure: true,
        httpOnly: true,
        name: "P_sck",
        value: "TEST_YOUKU_NOT_A_REAL_LOGIN",
        expirationDate: Date.now() / 1000 + 3600,
      });
    });
    await page.getByText(/优酷官网仍显示未登录/).waitFor({ timeout: 20000 });
    assert(!fs.existsSync(path.join(root, "youku-auth.enc")));
    const snapshot = await page.evaluate(() => window.downloader.snapshot());
    assert.equal(snapshot.youkuAuth.state, "logged-out");
    assert(!JSON.stringify(snapshot).includes("TEST_YOUKU"));
    const vault = path.join(root, "youku-auth.enc");
    assert(!fs.existsSync(vault));
    await page.screenshot({ path: "test-artifacts/11-youku-account-light.png" });
    await page.getByRole("button", { name: "深色模式" }).click();
    await page.waitForTimeout(250);
    await page.screenshot({ path: "test-artifacts/12-youku-account-dark.png" });
    await app.evaluate(({ BrowserWindow }) => {
      const main = BrowserWindow.getAllWindows().find((window) =>
        window.webContents.getURL().startsWith("file:"),
      )!;
      main.setSize(760, 620);
    });
    await page.waitForTimeout(250);
    await page.screenshot({ path: "test-artifacts/14-youku-account-minimum.png" });
    await page.evaluate(() => window.downloader.youkuLogout());
    await page.getByText("已退出，已清除本机优酷登录信息").waitFor();
    assert(!fs.existsSync(vault));
    assert.equal(
      (
        await app.evaluate(async ({ session }) =>
          session.fromPartition("youku-auth").cookies.get({ domain: "youku.com" }),
        )
      ).length,
      0,
    );
    console.log("优酷登录窗口隔离、虚构 Cookie 不再误报登录、退出清除测试通过");
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
