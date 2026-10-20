import { BrowserWindow, session, safeStorage, type Session } from "electron";
import fs from "node:fs";
import path from "node:path";
import { EventEmitter } from "node:events";
import type { AuthStatus } from "./types";
import {
  cookieLease,
  isBilibiliURL,
  extractPageState,
  previewReason,
} from "./auth-utils";
export class BilibiliAuth extends EventEmitter {
  readonly ses: Session;
  private window: BrowserWindow | null = null;
  private timer?: NodeJS.Timeout;
  private checking = false;
  private loggingOut = false;
  private generation = 0;
  private cookieDir: string;
  private vault: string;
  status: AuthStatus = {
    state: "logged-out",
    message: "登录有观看权限的账号，下载完整内容",
    remembered: false,
  };
  constructor(private root: string) {
    super();
    this.ses = session.fromPartition("bilibili-auth");
    this.ses.setPermissionRequestHandler((_w, _p, cb) => cb(false));
    this.ses.setPermissionCheckHandler(() => false);
    this.ses.setUserAgent(
      this.ses
        .getUserAgent()
        .replace(/\sElectron\/[^ ]+/g, "")
        .replace(/\svideo-downloader\/[^ ]+/g, ""),
    );
    this.vault = path.join(root, "bilibili-auth.enc");
    this.cookieDir = path.join(root, "auth-tmp");
    fs.mkdirSync(root, { recursive: true });
    fs.rmSync(this.cookieDir, { recursive: true, force: true });
    this.ses.cookies.on("changed", (_e, c) => {
      if (c.name === "SESSDATA") {
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => void this.refresh(), 800);
      }
    });
  }
  private changed() {
    this.emit("update", this.status);
  }
  async restore() {
    try {
      if (fs.existsSync(this.vault) && safeStorage.isEncryptionAvailable()) {
        const cookies = JSON.parse(
          safeStorage.decryptString(fs.readFileSync(this.vault)),
        );
        for (const c of cookies) {
          if (c.expirationDate && c.expirationDate < Date.now() / 1000)
            continue;
          const domain = c.domain.replace(/^\./, "");
          if (domain !== "bilibili.com" && !domain.endsWith(".bilibili.com"))
            continue;
          await this.ses.cookies.set({
            url: `https://${domain}${c.path || "/"}`,
            domain: c.domain,
            path: c.path,
            name: c.name,
            value: c.value,
            secure: c.secure,
            httpOnly: c.httpOnly,
            expirationDate: c.expirationDate,
            sameSite: c.sameSite,
          });
        }
        await this.refresh();
      }
    } catch {
      this.status = {
        state: "logged-out",
        message: "保存的登录状态无法恢复，请重新登录",
        remembered: false,
      };
      this.changed();
    }
  }
  async refresh() {
    if (this.checking || this.loggingOut) return;
    this.checking = true;
    const gen = this.generation;
    try {
      const cookies = await this.ses.cookies.get({ domain: "bilibili.com" });
      if (!cookies.some((c) => c.name === "SESSDATA")) {
        this.status = {
          state: "logged-out",
          message: "尚未登录 B 站",
          remembered: false,
        };
        this.changed();
        return;
      }
      this.status = {
        ...this.status,
        state: "checking",
        message: "正在确认 B 站登录状态",
      };
      this.changed();
      const response = await this.ses.fetch(
        "https://api.bilibili.com/x/web-interface/nav",
        {
          credentials: "include",
          headers: { Referer: "https://www.bilibili.com/" },
          signal: AbortSignal.timeout(15000),
        },
      );
      const result: any = await response.json();
      if (gen !== this.generation) return;
      if (result.code === 0 && result.data?.isLogin) {
        let remembered = false;
        if (safeStorage.isEncryptionAvailable()) {
          try {
            const encrypted = safeStorage.encryptString(
              JSON.stringify(
                await this.ses.cookies.get({ domain: "bilibili.com" }),
              ),
            );
            fs.writeFileSync(this.vault + ".tmp", encrypted, { mode: 0o600 });
            fs.renameSync(this.vault + ".tmp", this.vault);
            remembered = true;
          } catch {}
        }
        this.status = {
          state: "logged-in",
          name: result.data.uname || "B 站用户",
          message: remembered
            ? "已登录 · 登录状态已在本机加密保存"
            : "已登录 · 本次会话有效，未保存登录状态",
          remembered,
        };
        this.window?.close();
      } else {
        this.status = {
          state: "logged-out",
          message: "登录已失效，请重新扫码登录",
          remembered: false,
        };
        fs.rmSync(this.vault, { force: true });
      }
      this.changed();
    } catch {
      if (gen === this.generation) {
        this.status = {
          state: "error",
          message: "暂时无法验证登录，请检查网络后点击刷新",
          remembered: fs.existsSync(this.vault),
        };
        this.changed();
      }
    } finally {
      this.checking = false;
    }
  }
  login() {
    if (this.window) {
      this.window.show();
      this.window.focus();
      return;
    }
    this.window = new BrowserWindow({
      width: 1000,
      height: 760,
      title: "B 站官方登录 · 请自行扫码",
      autoHideMenuBar: true,
      webPreferences: {
        session: this.ses,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });
    const w = this.window;
    w.webContents.on("will-navigate", (e, url) => {
      if (!isBilibiliURL(url)) e.preventDefault();
    });
    w.webContents.on("will-redirect", (e, url) => {
      if (!isBilibiliURL(url)) e.preventDefault();
    });
    w.webContents.setWindowOpenHandler(({ url }) => {
      if (isBilibiliURL(url)) void w.loadURL(url);
      return { action: "deny" };
    });
    w.on("closed", () => {
      this.window = null;
      void this.refresh();
    });
    void w.loadURL("https://passport.bilibili.com/login").catch(() => {
      this.status = {
        state: "error",
        message: "官方登录页加载失败，请检查网络后重新打开",
        remembered: false,
      };
      this.changed();
    });
  }
  async lease(url: string) {
    if (!isBilibiliURL(url)) return { args: [], cleanup: async () => {} };
    const cookies = await this.ses.cookies.get({ domain: "bilibili.com" });
    if (!cookies.some((c) => c.name === "SESSDATA"))
      return { args: [], cleanup: async () => {} };
    return cookieLease(
      this.cookieDir,
      cookies
        .filter((c) => c.domain && c.path)
        .map((c) => ({
          ...c,
          domain: c.domain!,
          path: c.path!,
          secure: !!c.secure,
        })),
    );
  }
  async checkVideo(url: string) {
    if (!isBilibiliURL(url)) return;
    let reason: string | undefined;
    try {
      const response = await this.ses.fetch(url, {
        credentials: "include",
        signal: AbortSignal.timeout(12000),
      });
      if (response.ok) {
        const state = extractPageState(await response.text());
        reason = previewReason(state, this.status.state === "logged-in");
      }
    } catch {
      /* Network/anti-bot failures are handled by yt-dlp; duration check remains mandatory. */
    }
    if (reason) throw new Error("ACCESS: " + reason);
  }
  async logout() {
    this.loggingOut = true;
    this.generation++;
    this.window?.close();
    await this.ses.clearStorageData();
    await this.ses.clearCache();
    fs.rmSync(this.vault, { force: true });
    fs.rmSync(this.vault + ".tmp", { force: true });
    this.status = {
      state: "logged-out",
      message: "已退出，已清除本机登录状态",
      remembered: false,
    };
    this.loggingOut = false;
    this.changed();
  }
  dispose() {
    this.generation++;
    if (this.timer) clearTimeout(this.timer);
    this.ses.cookies.removeAllListeners("changed");
    this.window?.removeAllListeners("closed");
    this.window?.destroy();
  }
}
