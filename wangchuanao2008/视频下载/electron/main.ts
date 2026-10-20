import {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  shell,
  clipboard,
  Menu,
  nativeTheme,
} from "electron";
import path from "node:path";
import fs from "node:fs";
import { BilibiliAuth } from "./auth";
import { YoukuAuth } from "./youku-auth";
import { isBilibiliURL, isYoukuURL } from "./auth-utils";
import { Engine } from "./engine";
import type { Settings } from "./types";
let win: BrowserWindow | null = null;
let engine: Engine;
let auth: BilibiliAuth;
let youkuAuth: YoukuAuth;
if (process.env.VD_TEST_STATE)
  app.setPath("userData", process.env.VD_TEST_STATE);
const lock = app.requestSingleInstanceLock();
if (!lock) app.quit();
else {
  app.on("second-instance", () => {
    win?.show();
    win?.focus();
  });
  app.whenReady().then(() => {
    engine = new Engine(
      app.isPackaged
        ? path.join(process.resourcesPath, "bin")
        : path.join(
            app.getAppPath(),
            process.platform === "win32"
              ? "resources/bin-win-x64"
              : "resources/bin",
          ),
      app.getPath("userData"),
      process.env.VD_TEST_DOWNLOADS ||
        path.join(app.getPath("downloads"), "视频下载器"),
    );
    auth = new BilibiliAuth(app.getPath("userData"));
    youkuAuth = new YoukuAuth(app.getPath("userData"));
    let lastAccount: string | undefined;
    auth.on("update", () => {
      if (
        auth.status.state === "logged-in" &&
        auth.status.name !== lastAccount
      ) {
        lastAccount = auth.status.name;
        engine.refreshAuthorization();
      } else if (auth.status.state === "logged-out") lastAccount = undefined;
      engine.auth = auth.status;
      engine.changed();
    });
    let lastYoukuLogin = false;
    youkuAuth.on("update", () => {
      const loggedIn = youkuAuth.status.state === "logged-in";
      if (loggedIn && !lastYoukuLogin)
        engine.refreshAuthorization(isYoukuURL);
      lastYoukuLogin = loggedIn;
      engine.youkuAuth = youkuAuth.status;
      engine.changed();
    });
    engine.authorize = (url) =>
      isYoukuURL(url) ? youkuAuth.lease(url) : auth.lease(url);
    engine.checkAccess = (url) => auth.checkVideo(url);
    void auth.restore();
    void youkuAuth.restore();
    nativeTheme.themeSource = engine.settings.theme;
    const handle = (name: string, fn: (...args: any[]) => any) =>
      ipcMain.handle(name, (event, ...args) => {
        if (
          event.sender !== win?.webContents ||
          event.senderFrame !== win.webContents.mainFrame
        )
          throw new Error("无效请求");
        return fn(...args);
      });
    handle("snapshot", () => engine.snapshot());
    handle("login", async () => {
      if (auth.status.state === "logged-in") {
        for (const t of engine.tasks)
          if (isBilibiliURL(t.url)) engine.cancel(t.id);
        await auth.logout();
      }
      auth.login();
    });
    handle("refreshAuth", () => auth.refresh());
    handle("youkuLogin", async () => {
      if (youkuAuth.status.state === "logged-in") {
        for (const t of engine.tasks)
          if (isYoukuURL(t.url)) engine.cancel(t.id);
        await youkuAuth.logout();
      }
      youkuAuth.login();
    });
    handle("youkuRefreshAuth", () => youkuAuth.refresh());
    handle("youkuLogout", async () => {
      for (const t of engine.tasks)
        if (isYoukuURL(t.url)) engine.cancel(t.id);
      await youkuAuth.logout();
    });
    handle("logout", async () => {
      for (const t of engine.tasks)
        if (isBilibiliURL(t.url)) engine.cancel(t.id);
      await auth.logout();
    });
    handle("add", (url, inspect) => {
      if (typeof url !== "string" || url.length > 16000)
        throw new Error("网址过长或格式错误");
      return engine.add(url, !!inspect);
    });
    handle("start", (id, q) => engine.start(id, q));
    handle("cancel", (id) => engine.cancel(id));
    handle("retry", (id) => engine.retry(id));
    handle("remove", (id) => engine.remove(id));
    handle("chooseDirectory", async () => {
      const r = await dialog.showOpenDialog(win!, {
        title: "选择视频保存位置",
        defaultPath: engine.settings.directory,
        properties: ["openDirectory", "createDirectory"],
      });
      if (r.canceled) return null;
      await engine.setDirectory(r.filePaths[0]);
      return r.filePaths[0];
    });
    handle("theme", (theme: Settings["theme"]) => {
      if (!["system", "light", "dark"].includes(theme)) return;
      engine.settings.theme = theme;
      nativeTheme.themeSource = theme;
      engine.changed();
    });
    handle("paste", () => clipboard.readText());
    handle("folder", async () => {
      await engine.checkDirectory(engine.settings.directory);
      const err = await shell.openPath(engine.settings.directory);
      if (err) throw new Error(err);
    });
    handle("open", async (id, folder) => {
      const t = engine.get(id);
      if (t.status !== "completed" || !t.file)
        throw new Error("此视频尚未下载完成");
      if (!fs.existsSync(t.file))
        throw new Error("文件已被移动或删除，请重新下载。");
      if (folder) shell.showItemInFolder(t.file);
      else {
        const err = await shell.openPath(t.file);
        if (err)
          throw new Error("无法打开文件，请使用支持此格式的视频播放器。");
      }
    });
    engine.on("update", (s) => {
      if (!win?.isDestroyed()) win?.webContents.send("update", s);
    });
    Menu.setApplicationMenu(
      Menu.buildFromTemplate([
        {
          label: "视频下载器",
          submenu: [
            {
              label: "关于视频下载器",
              click: () =>
                dialog.showMessageBox(win!, {
                  message: "视频下载器 1.3.1",
                  detail:
                    "内置 yt-dlp 与 FFmpeg。支持公开可访问的视频页面及视频直链。仅下载您有权保存的内容。",
                }),
            },
            { type: "separator" },
            { label: "退出视频下载器", role: "quit" },
          ],
        },
        {
          label: "编辑",
          submenu: [
            { label: "撤销", role: "undo" },
            { label: "重做", role: "redo" },
            { type: "separator" },
            { label: "剪切", role: "cut" },
            { label: "复制", role: "copy" },
            { label: "粘贴", role: "paste" },
            { label: "全选", role: "selectAll" },
          ],
        },
        {
          label: "窗口",
          submenu: [
            { label: "最小化", role: "minimize" },
            { label: "缩放", role: "zoom" },
            { label: "关闭窗口", role: "close" },
          ],
        },
      ]),
    );
    createWindow();
    app.on("activate", () => {
      if (!win) createWindow();
      else win.show();
    });
  });
  app.on("before-quit", () => {
    auth?.dispose();
    youkuAuth?.dispose();
    engine?.shutdown();
  });
  app.on("window-all-closed", () => app.quit());
}
function createWindow() {
  win = new BrowserWindow({
    width: 1140,
    height: 820,
    minWidth: 760,
    minHeight: 620,
    title: "视频下载器",
    ...(process.platform === "darwin"
      ? {
          titleBarStyle: "hiddenInset" as const,
          trafficLightPosition: { x: 22, y: 22 },
        }
      : { titleBarStyle: "default" as const, autoHideMenuBar: true }),
    backgroundColor: nativeTheme.shouldUseDarkColors ? "#141816" : "#f6f7f4",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
  win.webContents.on("will-navigate", (e) => e.preventDefault());
  win.on("close", (e) => {
    if (
      engine.tasks.some((t) =>
        [
          "pending",
          "queued",
          "parsing",
          "downloading",
          "merging",
          "verifying",
        ].includes(t.status),
      )
    ) {
      const choice = dialog.showMessageBoxSync(win!, {
        type: "question",
        title: "还有下载正在进行",
        message: "退出将停止当前下载",
        detail: "下载记录会保留，下次打开可点击重试。",
        buttons: ["继续下载", "退出"],
        defaultId: 0,
        cancelId: 0,
      });
      if (choice === 0) e.preventDefault();
    }
  });
  win.on("closed", () => {
    win = null;
    app.quit();
  });
  void win.loadFile(path.join(__dirname, "../dist/index.html"));
}
