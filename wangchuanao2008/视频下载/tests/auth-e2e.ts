import { _electron as electron } from "playwright";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
async function main() {
  const root = fs.mkdtempSync(path.resolve("test-artifacts/auth-ui-"));
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
    await app.evaluate(async ({ session }) => {
      const s = session.fromPartition("bilibili-auth");
      await s.protocol.handle("https", (req) =>
        req.url.includes("/x/web-interface/nav")
          ? new Response(
              JSON.stringify({
                code: 0,
                data: { isLogin: true, uname: "测试账号" },
              }),
              { headers: { "Content-Type": "application/json" } },
            )
          : new Response(
              '<html lang="zh-CN"><title>官方登录隔离测试</title><body>登录界面测试替身</body></html>',
              { headers: { "Content-Type": "text/html" } },
            ),
      );
    });
    await page.getByRole("button", { name: "登录 B 站", exact: true }).click();
    await page.waitForTimeout(300);
    const security = await app.evaluate(({ BrowserWindow }) => {
      const w = BrowserWindow.getAllWindows().find((w) =>
        w.webContents.getURL().includes("passport.bilibili.com"),
      )!;
      const p = (w.webContents as any).getLastWebPreferences();
      return {
        node: p.nodeIntegration,
        sandbox: p.sandbox,
        isolated: p.contextIsolation,
        preload: p.preload,
      };
    });
    assert.equal(security.node, false);
    assert.equal(security.sandbox, true);
    assert.equal(security.isolated, true);
    assert(!security.preload);
    await app.evaluate(async ({ session }) => {
      await session.fromPartition("bilibili-auth").cookies.set({
        url: "https://www.bilibili.com",
        domain: ".bilibili.com",
        path: "/",
        secure: true,
        httpOnly: true,
        name: "SESSDATA",
        value: "TEST_ONLY_NOT_A_REAL_LOGIN",
        expirationDate: Date.now() / 1000 + 3600,
      });
    });
    await page.getByText("测试账号", { exact: true }).waitFor();
    const status = await page.evaluate(() => window.downloader.snapshot());
    assert.equal(status.auth.state, "logged-in");
    assert(!JSON.stringify(status).includes("TEST_ONLY"));
    const encrypted = path.join(root, "bilibili-auth.enc");
    if (status.auth.remembered) {
      assert(fs.existsSync(encrypted));
      assert(!fs.readFileSync(encrypted).includes(Buffer.from("TEST_ONLY")));
      if (process.platform !== "win32")
        assert.equal(fs.statSync(encrypted).mode & 0o777, 0o600);
      const persisted = await app.evaluate(
        ({ safeStorage }, p) =>
          JSON.parse(safeStorage.decryptString(Buffer.from(p))).some(
            (c: any) => c.name === "SESSDATA",
          ),
        [...fs.readFileSync(encrypted)],
      );
      assert(persisted);
    }
    await page.getByRole("button", { name: "深色模式", exact: true }).click();
    await page.waitForTimeout(250);
    await page.screenshot({ path: "test-artifacts/09-auth-dark.png" });
    await page.getByRole("button", { name: "退出", exact: true }).click();
    await page.getByText("已退出，已清除本机登录状态").waitFor();
    assert(!fs.existsSync(encrypted));
    assert.equal(
      await app.evaluate(
        async ({ session }) =>
          (
            await session
              .fromPartition("bilibili-auth")
              .cookies.get({ domain: "bilibili.com" })
          ).length,
      ),
      0,
    );
    await page.getByRole("button", { name: "浅色模式", exact: true }).click();
    await page.waitForTimeout(200);
    await page.screenshot({ path: "test-artifacts/10-auth-light.png" });
    console.log(
      "授权 UI、隔离窗口、加密保存、状态脱敏和退出清除测试通过（使用测试凭据）",
    );
  } finally {
    await app.close();
  }
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
