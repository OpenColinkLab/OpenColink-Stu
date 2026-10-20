import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { Engine, validateURL, friendlyError } from "../electron/engine";
import { fixtures } from "./fixtures";
const base = path.resolve("test-artifacts");
fs.mkdirSync(base, { recursive: true });
async function wait(fn: () => boolean, timeout = 90000) {
  const start = Date.now();
  while (!fn()) {
    if (Date.now() - start > timeout) throw new Error("等待任务超时");
    await new Promise((r) => setTimeout(r, 100));
  }
}
test("拒绝命令、危险协议、账号密码；分类用户可操作错误", () => {
  for (const url of [
    "file:///tmp/a",
    "https://user:pw@a.com",
    "--exec ls",
    "javascript:alert(1)",
    "无效链接",
  ])
    assert.throws(() => validateURL(url));
  assert.equal(
    validateURL(" https://example.com/a.mp4 "),
    "https://example.com/a.mp4",
  );
  assert.match(friendlyError("ENOSPC"), /空间不足/);
  assert.match(friendlyError("HTTP 403"), /登录/);
  assert.match(friendlyError("Unsupported URL"), /提取视频/);
  assert.match(friendlyError("connection timed out"), /网络/);
  assert.match(friendlyError("Permission denied"), /权限/);
});
test("真实引擎：直链、分离音视频、清晰度、取消、失败重试、队列与持久化", async () => {
  const fixture = await fixtures(path.join(base, "fixtures"));
  const dir = fs.mkdtempSync(path.join(base, "engine-"));
  const engine = new Engine(
    path.resolve("resources/bin"),
    path.join(dir, "state"),
    path.join(dir, "downloads"),
  );
  try {
    assert.equal(engine.dependencies.ok, true);
    const id = engine.add(fixture.url + "/sample.mp4");
    const second = engine.add(fixture.url + "/stream.mpd");
    await wait(
      () =>
        ["completed", "failed"].includes(engine.get(id).status) &&
        ["completed", "failed"].includes(engine.get(second).status),
    );
    for (const task of [engine.get(id), engine.get(second)]) {
      assert.equal(task.status, "completed", task.logs.join("\n"));
      const p = JSON.parse(
        execFileSync(
          engine.executable("ffprobe"),
          ["-v", "error", "-show_streams", "-of", "json", task.file!],
          { encoding: "utf8" },
        ),
      );
      assert(p.streams.some((s: any) => s.codec_type === "video"));
      assert(p.streams.some((s: any) => s.codec_type === "audio"));
      assert.equal(path.dirname(task.file!), engine.settings.directory);
      execFileSync(
        engine.executable("ffmpeg"),
        ["-v", "error", "-i", task.file!, "-f", "null", "-"],
        { stdio: "pipe" },
      );
    }
    assert.match(engine.get(second).file!, /\.mkv$/);
    const inspect = engine.add(fixture.url + "/stream.mpd", true);
    await wait(() => ["ready", "failed"].includes(engine.get(inspect).status));
    assert.deepEqual(engine.get(inspect).heights, [360]);
    assert.throws(() => engine.start(inspect, 2160));
    engine.start(inspect, 360);
    await wait(() =>
      ["completed", "failed"].includes(engine.get(inspect).status),
    );
    assert.equal(
      engine.get(inspect).status,
      "completed",
      engine.get(inspect).logs.join("\n"),
    );
    const cancel = engine.add(fixture.url + "/slow.mp4");
    await wait(() => engine.get(cancel).status === "downloading");
    engine.cancel(cancel);
    await new Promise((r) => setTimeout(r, 1800));
    assert.equal(engine.get(cancel).status, "cancelled");
    engine.retry(cancel);
    await wait(() =>
      ["completed", "failed"].includes(engine.get(cancel).status),
    );
    assert.equal(
      engine.get(cancel).status,
      "completed",
      engine.get(cancel).logs.join("\n"),
    );
    const retry = engine.add(fixture.url + "/retry.mp4");
    await wait(() => engine.get(retry).status === "failed");
    assert.match(engine.get(retry).error!, /失效/);
    fixture.allowRetry();
    engine.retry(retry);
    await wait(() =>
      ["completed", "failed"].includes(engine.get(retry).status),
    );
    assert.equal(engine.get(retry).status, "completed");
    const duplicate = engine.add(fixture.url + "/sample.mp4");
    await wait(() =>
      ["completed", "failed"].includes(engine.get(duplicate).status),
    );
    assert.notEqual(engine.get(duplicate).file, engine.get(id).file);
    assert(fs.existsSync(engine.get(id).file!));
    await engine.setDirectory(path.join(dir, "第二个保存目录"));
    engine.settings.theme = "dark";
    engine.shutdown();
    const reload = new Engine(engine.bin, engine.stateDir, "/tmp/unused");
    assert.equal(reload.tasks.length, engine.tasks.length);
    assert.equal(reload.settings.directory, engine.settings.directory);
    assert.equal(reload.settings.theme, "dark");
    reload.shutdown();
    console.log("测试文件保存在", dir);
  } finally {
    engine.shutdown();
    await fixture.close();
  }
});
