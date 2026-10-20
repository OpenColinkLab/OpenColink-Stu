import { BrowserWindow, safeStorage, session, type Session } from "electron";
import { EventEmitter } from "node:events";
import fs from "node:fs";
import path from "node:path";
import { cookieLease, isYoukuLoginURL, isYoukuURL } from "./auth-utils";
import type { AuthStatus } from "./types";

const domain = "youku.com";
const accountURL = "https://www.youku.com/ku/usc/index";
const allowedCookie = (value: string) => {
  const name = value.replace(/^\./, "");
  return name === domain || name.endsWith("." + domain);
};

/** Isolated official-site sign-in. No password or account token enters the renderer. */
export class YoukuAuth extends EventEmitter {
  readonly ses: Session;
  private window: BrowserWindow | null = null;
  private timer?: NodeJS.Timeout;
  private checking = false;
  private refreshRequested = false;
  private loggingOut = false;
  private generation = 0;
  private vault: string;
  private cookieDir: string;
  status: AuthStatus = {
    state: "logged-out",
    message: "登录优酷账号后，可尝试下载账号有权访问的视频",
    remembered: false,
  };

  constructor(private root: string) {
    super();
    this.ses = session.fromPartition("youku-auth");
    this.ses.setPermissionRequestHandler((_w, _p, callback) => callback(false));
    this.ses.setPermissionCheckHandler(() => false);
    this.ses.setUserAgent(
      this.ses
        .getUserAgent()
        .replace(/\sElectron\/[^ ]+/g, "")
        .replace(/\svideo-downloader\/[^ ]+/g, ""),
    );
    this.vault = path.join(root, "youku-auth.enc");
    this.cookieDir = path.join(root, "auth-tmp-youku");
    fs.mkdirSync(root, { recursive: true });
    fs.rmSync(this.cookieDir, { recursive: true, force: true });
    this.ses.cookies.on("changed", (_event, cookie) => {
      if (!allowedCookie(cookie.domain || "")) return;
      if (!["P_sck", "P_gck", "P_pck_rm", "login_index"].includes(cookie.name))
        return;
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => void this.refresh(), 1200);
    });
  }

  private changed() {
    this.emit("update", this.status);
  }

  private async cookies() {
    return (await this.ses.cookies.get({ domain })).filter((cookie) =>
      allowedCookie(cookie.domain || ""),
    );
  }

  private async verifyOnWebsite(): Promise<"logged-in" | "logged-out" | "unknown"> {
    const probe = new BrowserWindow({
      show: false,
      webPreferences: {
        session: this.ses,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });
    let timeout: NodeJS.Timeout | undefined;
    try {
      await Promise.race([
        probe.loadURL(accountURL),
        new Promise<never>((_, reject) =>
          (timeout = setTimeout(
            () => reject(new Error("account page timeout")),
            15000,
          )),
        ),
      ]);
      // The account page renders its login state after the initial HTML load.
      let text = "";
      for (let attempt = 0; attempt < 8; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        text = await probe.webContents.executeJavaScript(
          "document.body?.innerText || ''",
          true,
        );
        if (/登录后查看会员状态|点击登录|登录\/注册/.test(text))
          return "logged-out";
      }
      return text.length > 200 && /会员|历史播放|个人中心/.test(text)
        ? "logged-in"
        : "unknown";
    } catch (error) {
      if (process.env.VD_TEST_STATE) console.error("优酷登录探测:", String(error));
      return "unknown";
    } finally {
      if (timeout) clearTimeout(timeout);
      probe.destroy();
    }
  }

  async restore() {
    try {
      if (!fs.existsSync(this.vault) || !safeStorage.isEncryptionAvailable())
        return;
      const stored = JSON.parse(
        safeStorage.decryptString(fs.readFileSync(this.vault)),
      );
      if (!Array.isArray(stored)) throw new Error("invalid cookie store");
      for (const cookie of stored) {
        if (
          !cookie.domain ||
          !allowedCookie(cookie.domain) ||
          (cookie.expirationDate && cookie.expirationDate < Date.now() / 1000)
        )
          continue;
        await this.ses.cookies.set({
          url: `https://${cookie.domain.replace(/^\./, "")}${cookie.path || "/"}`,
          domain: cookie.domain,
          path: cookie.path,
          name: cookie.name,
          value: cookie.value,
          secure: cookie.secure,
          httpOnly: cookie.httpOnly,
          expirationDate: cookie.expirationDate,
          sameSite: cookie.sameSite,
        });
      }
      await this.refresh();
    } catch {
      this.status = {
        state: "logged-out",
        message: "保存的优酷登录信息无法恢复，请重新登录",
        remembered: false,
      };
      this.changed();
    }
  }

  async refresh() {
    if (this.loggingOut) return;
    if (this.checking) {
      this.refreshRequested = true;
      return;
    }
    this.checking = true;
    const generation = this.generation;
    try {
      const cookies = await this.cookies();
      if (generation !== this.generation) return;
      if (!cookies.some((cookie) => cookie.name === "P_sck")) {
        this.status = {
          state: "logged-out",
          message: "未检测到优酷登录信息；请在官方窗口完成登录",
          remembered: false,
        };
        fs.rmSync(this.vault, { force: true });
        this.changed();
        return;
      }
      this.status = {
        state: "checking",
        message: "检测到优酷 Cookie，正在确认官网是否仍认为此会话已登录…",
        remembered: fs.existsSync(this.vault),
      };
      this.changed();
      const websiteState = await this.verifyOnWebsite();
      if (generation !== this.generation) return;
      if (websiteState !== "logged-in") {
        this.status = {
          state: websiteState === "logged-out" ? "logged-out" : "error",
          message:
            websiteState === "logged-out"
              ? "优酷官网仍显示未登录。请在官方窗口完成登录，再确认个人中心可查看会员状态。"
              : "暂时无法核实优酷官网登录状态。请检查网络并重新登录。",
          remembered: false,
        };
        fs.rmSync(this.vault, { force: true });
        this.changed();
        return;
      }
      let remembered = false;
      if (safeStorage.isEncryptionAvailable()) {
        try {
          const encrypted = safeStorage.encryptString(JSON.stringify(cookies));
          fs.writeFileSync(this.vault + ".tmp", encrypted, { mode: 0o600 });
          fs.renameSync(this.vault + ".tmp", this.vault);
          remembered = true;
        } catch {
          /* Use the current session without saving credentials in plaintext. */
        }
      }
      this.status = {
        state: "logged-in",
        name: "优酷账号",
        message: remembered
          ? "优酷官网已确认登录，并在本机加密保存；VIP 权限以解析结果为准"
          : "优酷官网已确认登录，仅本次会话有效；VIP 权限以解析结果为准",
        remembered,
      };
      this.changed();
      this.window?.close();
    } catch {
      if (generation === this.generation) {
        this.status = {
          state: "error",
          message: "无法读取优酷登录状态，请重试或重新打开登录窗口",
          remembered: fs.existsSync(this.vault),
        };
        this.changed();
      }
    } finally {
      this.checking = false;
      if (this.refreshRequested && !this.loggingOut) {
        this.refreshRequested = false;
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => void this.refresh(), 600);
      }
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
      title: "优酷官方登录 · 请自行完成登录",
      autoHideMenuBar: true,
      webPreferences: {
        session: this.ses,
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });
    const window = this.window;
    window.webContents.on("did-finish-load", () => {
      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => void this.refresh(), 900);
    });
    window.webContents.on("will-navigate", (event, url) => {
      if (!isYoukuLoginURL(url)) event.preventDefault();
    });
    window.webContents.on("will-redirect", (event, url) => {
      if (!isYoukuLoginURL(url)) event.preventDefault();
    });
    window.webContents.setWindowOpenHandler(({ url }) => {
      if (isYoukuLoginURL(url)) void window.loadURL(url);
      return { action: "deny" };
    });
    window.on("closed", () => {
      this.window = null;
      void this.refresh();
    });
      void window.loadURL(accountURL).catch(() => {
      this.status = {
        state: "error",
        message: "优酷官方页面加载失败，请检查网络后重试",
        remembered: false,
      };
      this.changed();
    });
  }

  async lease(url: string) {
    if (!isYoukuURL(url)) return { args: [], cleanup: async () => {} };
    const cookies = await this.cookies();
    if (!cookies.some((cookie) => cookie.name === "P_sck"))
      return { args: [], cleanup: async () => {} };
    return cookieLease(
      this.cookieDir,
      cookies.map((cookie) => ({
        ...cookie,
        domain: cookie.domain!,
        path: cookie.path || "/",
        secure: !!cookie.secure,
      })),
      domain,
    );
  }

  async logout() {
    this.loggingOut = true;
    this.refreshRequested = false;
    this.generation++;
    this.window?.destroy();
    this.window = null;
    await this.ses.clearStorageData();
    await this.ses.clearCache();
    fs.rmSync(this.vault, { force: true });
    fs.rmSync(this.vault + ".tmp", { force: true });
    this.status = {
      state: "logged-out",
      message: "已退出，已清除本机优酷登录信息",
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
