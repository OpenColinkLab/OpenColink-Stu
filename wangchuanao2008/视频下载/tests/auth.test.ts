import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  cookieLease,
  netscapeCookies,
  isBilibiliURL,
  isYoukuURL,
  isYoukuLoginURL,
  durationProblem,
  extractPageState,
  previewReason,
  redactLog,
} from "../electron/auth-utils";
import { Engine, friendlyError } from "../electron/engine";
import { fixtures } from "./fixtures";
test("凭据只限 B 站，拒绝伪造域名、过期与换行 Cookie；临时文件权限和清理", async () => {
  assert(isBilibiliURL("https://www.bilibili.com/video/123"));
  assert(!isBilibiliURL("https://bilibili.com.evil.test/"));
  assert(!isBilibiliURL("http://bilibili.com/"));
  const cookies = [
    {
      domain: ".bilibili.com",
      path: "/",
      secure: true,
      httpOnly: true,
      name: "SESSDATA",
      value: "TEST_ONLY",
    },
    {
      domain: ".evil.test",
      path: "/",
      secure: true,
      name: "secret",
      value: "DO_NOT_EXPORT",
    },
    {
      domain: ".bilibili.com",
      path: "/",
      secure: true,
      name: "expired",
      value: "OLD",
      expirationDate: 1,
    },
    {
      domain: ".bilibili.com",
      path: "/",
      secure: true,
      name: "injected",
      value: "BAD\nLINE",
    },
  ];
  const text = netscapeCookies(cookies);
  assert(text.includes("#HttpOnly_.bilibili.com\tTRUE"));
  assert(!text.includes("DO_NOT_EXPORT"));
  assert(!text.includes("OLD"));
  assert(!text.includes("BAD"));
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "vd-auth-test-"));
  const lease = await cookieLease(root, cookies);
  assert.equal(fs.statSync(lease.args[1]).mode & 0o777, 0o600);
  await lease.cleanup();
  assert(!fs.existsSync(lease.args[1]));
  fs.rmdirSync(root);
});
test("原视频与试看时长校验、权限标记和日志脱敏", () => {
  assert(durationProblem(9930.41, 640.16));
  assert(!durationProblem(6, 6.037));
  assert(!durationProblem(undefined, 6));
  assert(!durationProblem(600, 599));
  const state = extractPageState(
    'window.__INITIAL_STATE__ = {"videoData":{"is_upower_exclusive":true,"is_upower_play":false},"text":"}\\\""}; trailing',
  );
  assert(state);
  assert.match(previewReason(state, false)!, /先登录/);
  assert.match(previewReason(state, true)!, /尚未获得/);
  assert(
    !previewReason(
      { videoData: { is_upower_exclusive: true, is_upower_play: true } },
      true,
    ),
  );
  const log = redactLog(
    "SESSDATA=TOP_SECRET https://cdn.test/a.mp4?token=SECRET",
  );
  assert(!log.includes("TOP_SECRET"));
  assert(!log.includes("token="));
  const youkuLog = redactLog("P_sck=PRIVATE _m_h5_tk=TOKEN");
  assert(!youkuLog.includes("PRIVATE"));
  assert(!youkuLog.includes("TOKEN"));
  assert(!redactLog("Cookie: disrd=SECRET; other=ALSO_SECRET").includes("SECRET"));
});
test("优酷链接、登录跳转及 Cookie 与 B 站凭据完全隔离", async () => {
  assert(isYoukuURL("https://v.youku.com/v_show/id_X123.html"));
  assert(isYoukuURL("https://play.tudou.com/v_show/id_X123.html"));
  assert(!isYoukuURL("https://youku.com.evil.test/video"));
  assert(!isYoukuURL("http://v.youku.com/video"));
  assert(isYoukuLoginURL("https://login.taobao.com/"));
  assert(!isYoukuLoginURL("https://login.taobao.com.evil.test/"));
  assert(!isYoukuLoginURL("http://login.taobao.com/"));
  assert.match(
    friendlyError("Youku server reported error -3007: 观看此节目，请先登录！", "https://v.youku.com/v_show/id_X123.html"),
    /优酷服务端仍将此下载请求视为未登录/,
  );
  assert.match(friendlyError("DRM protected media"), /官方离线功能/);
  const cookies = [
    { domain: ".youku.com", path: "/", secure: true, name: "P_sck", value: "TEST_YOUKU" },
    { domain: ".bilibili.com", path: "/", secure: true, name: "SESSDATA", value: "TEST_BILI" },
    { domain: ".youku.com.evil.test", path: "/", secure: true, name: "bad", value: "TEST_EVIL" },
  ];
  const exported = netscapeCookies(cookies, "youku.com");
  assert(exported.includes("TEST_YOUKU"));
  assert(!exported.includes("TEST_BILI"));
  assert(!exported.includes("TEST_EVIL"));
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "vd-youku-auth-"));
  try {
    const lease = await cookieLease(root, cookies, "youku.com");
    assert.equal(fs.statSync(lease.args[1]).mode & 0o777, 0o600);
    assert.equal(fs.readFileSync(lease.args[1], "utf8"), exported);
    await lease.cleanup();
    assert(!fs.existsSync(lease.args[1]));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
test("优酷直连遇到网络错误才尝试系统代理，并清理临时凭据", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "vd-youku-proxy-"));
  const engine = new Engine(path.resolve("resources/bin"), root, root);
  const commands: string[][] = [];
  let cleaned = 0;
  engine.authorize = async () => ({
    args: ["--cookies", "/test/youku.txt"],
    cleanup: async () => { cleaned++; },
  });
  (engine as any).runProcess = async (_task: any, _exe: string, args: string[]) => {
    commands.push(args);
    if (commands.length === 1) throw new Error("SSL connection failed");
    return "ok";
  };
  try {
    const task: any = { id: "youku-test", url: "https://v.youku.com/v_show/id_X123.html", status: "parsing", logs: [] };
    assert.equal(await engine.run(task, engine.executable("yt-dlp"), []), "ok");
    assert.deepEqual(commands[0].slice(0, 4), ["--proxy", "", "--cookies", "/test/youku.txt"]);
    assert.deepEqual(commands[1].slice(0, 2), ["--cookies", "/test/youku.txt"]);
    assert.equal(cleaned, 1);
    assert.match(task.logs.join("\n"), /尝试系统代理/);
  } finally {
    engine.shutdown();
    fs.rmSync(root, { recursive: true, force: true });
  }
});
test("真实下载的短文件必须失败；重试重新解析、另存且不复用试看文件", async () => {
  const base = path.resolve("test-artifacts");
  const fixture = await fixtures(path.join(base, "fixtures"));
  const root = fs.mkdtempSync(path.join(base, "integrity-"));
  const e = new Engine(
    path.resolve("resources/bin"),
    path.join(root, "state"),
    path.join(root, "downloads"),
  );
  const original = e.parse.bind(e);
  let preview = true;
  e.parse = async (t) => {
    await original(t);
    t.expectedDuration = preview ? 100 : 6;
  };
  const wait = async (fn: () => boolean) => {
    const start = Date.now();
    while (!fn()) {
      if (Date.now() - start > 90000) throw new Error("timeout");
      await new Promise((r) => setTimeout(r, 100));
    }
  };
  try {
    const id = e.add(fixture.url + "/sample.mp4");
    await wait(() => ["failed", "completed"].includes(e.get(id).status));
    const t = e.get(id);
    assert.equal(t.status, "failed");
    assert.match(t.error!, /文件不完整/);
    assert.equal(t.expectedDuration, 100);
    assert.equal(t.actualDuration, 6);
    const old = t.file!;
    assert(fs.existsSync(old));
    preview = false;
    e.retry(id);
    await wait(() => ["failed", "completed"].includes(t.status));
    assert.equal(t.status, "completed", t.logs.join("\n"));
    assert.notEqual(t.file, old);
    assert(fs.existsSync(old));
    assert.equal(t.attempt, 1);
  } finally {
    e.shutdown();
    await fixture.close();
  }
});

test("引擎只给 B 站和优酷下载进程传递对应凭据，并在成功或失败后清理", async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "vd-engine-auth-"));
  const e = new Engine(path.resolve("resources/bin"), root, root);
  let supplied = 0,
    cleaned = 0;
  let seen: string[] = [];
  e.authorize = async () => {
    supplied++;
    return {
      args: ["--cookies", "/test/credentials.txt"],
      cleanup: async () => {
        cleaned++;
      },
    };
  };
  (e as any).runProcess = async (_t: any, _exe: string, args: string[]) => {
    seen = args;
    return "ok";
  };
  const t: any = {
    id: "test",
    url: "https://www.bilibili.com/video/test",
    status: "parsing",
  };
  try {
    await e.run(t, e.executable("yt-dlp"), ["--dump-single-json"]);
    assert.equal(supplied, 1);
    assert.deepEqual(seen.slice(0, 2), ["--cookies", "/test/credentials.txt"]);
    assert.equal(cleaned, 1);
    t.url = "https://v.youku.com/v_show/id_X123.html";
    await e.run(t, e.executable("yt-dlp"), []);
    assert.equal(supplied, 2);
    assert.equal(cleaned, 2);
    assert.deepEqual(seen.slice(0, 4), [
      "--proxy",
      "",
      "--cookies",
      "/test/credentials.txt",
    ]);
    t.url = "https://example.com/video";
    await e.run(t, e.executable("yt-dlp"), []);
    assert.equal(supplied, 2);
    t.url = "https://www.bilibili.com/video/test";
    (e as any).runProcess = async () => {
      throw new Error("network failed");
    };
    await assert.rejects(e.run(t, e.executable("yt-dlp"), []));
    assert.equal(cleaned, 3);
  } finally {
    e.shutdown();
    fs.rmSync(root, { recursive: true, force: true });
  }
});
