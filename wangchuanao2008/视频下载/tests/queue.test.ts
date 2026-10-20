import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { Engine } from "../electron/engine";
const tick = () => new Promise<void>((r) => setImmediate(r));
function harness() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "vd-queue-"));
  const e = new Engine(path.resolve("resources/bin"), root, root);
  const gates = new Map<string, { ok: () => void; fail: () => void }[]>();
  const downloads: string[] = [];
  const finish = new Map<string, () => void>();
  let running = 0,
    peak = 0;
  e.parse = async (t) => {
    running++;
    peak = Math.max(peak, running);
    try {
      await new Promise<void>((ok, fail) => {
        const list = gates.get(t.id) || [];
        list.push({ ok, fail: () => fail(new Error("Unsupported URL")) });
        gates.set(t.id, list);
      });
      t.title = "标题-" + t.id;
      t.thumbnail = "https://example.com/cover.jpg";
      t.heights = [720];
      t.duration = 60;
    } finally {
      running--;
    }
  };
  e.download = async (t) => {
    downloads.push(t.id);
    t.status = "downloading";
    e.changed();
    await new Promise<void>((r) => finish.set(t.id, r));
    if (t.status !== ("cancelled" as string)) t.status = "completed";
  };
  const resolve = async (id: string, fail = false) => {
    const g = gates.get(id)!.shift()!;
    fail ? g.fail() : g.ok();
    await tick();
  };
  return {
    e,
    gates,
    downloads,
    finish,
    resolve,
    peak: () => peak,
    close: async () => {
      e.shutdown();
      for (const list of gates.values()) for (const g of list) g.ok();
      for (const f of finish.values()) f();
      await tick();
      fs.rmSync(root, { recursive: true, force: true });
    },
  };
}
test("解析最多并发两项；后解析先完成不插队；下载期间后续卡片已有标题封面", async () => {
  const h = harness();
  try {
    const a = h.e.add("https://example.com/a");
    const b = h.e.add("https://example.com/b");
    const c = h.e.add("https://example.com/c");
    assert.equal(h.e.get(c).status, "pending");
    assert.equal(h.peak(), 2);
    await h.resolve(b);
    assert.equal(h.e.get(b).status, "queued");
    assert(h.e.get(b).thumbnail);
    assert.equal(h.downloads.length, 0);
    await h.resolve(a);
    assert.deepEqual(h.downloads, [a]);
    await h.resolve(c);
    assert.equal(h.e.get(c).status, "queued");
    assert.match(h.e.get(c).title, /标题/);
    assert.equal(h.e.get(a).status, "downloading");
    h.finish.get(a)!();
    await tick();
    assert.deepEqual(h.downloads, [a, b]);
    h.finish.get(b)!();
    await tick();
    assert.deepEqual(h.downloads, [a, b, c]);
    assert.equal(h.peak(), 2);
  } finally {
    await h.close();
  }
});
test("取消与立即重试不会复活旧解析结果；失败任务不会阻塞后续任务", async () => {
  const h = harness();
  try {
    const a = h.e.add("https://example.com/a");
    const b = h.e.add("https://example.com/b");
    h.e.cancel(a);
    h.e.retry(a);
    assert.equal(h.e.get(a).status, "pending");
    await h.resolve(a);
    assert.equal(h.e.get(a).status, "parsing");
    assert.equal(h.e.get(a).title, "正在读取视频信息");
    await h.resolve(b);
    assert.equal(h.downloads.length, 0);
    await h.resolve(a, true);
    assert.equal(h.e.get(a).status, "failed");
    assert.deepEqual(h.downloads, [b]);
    const c = h.e.add("https://example.com/c");
    h.e.cancel(c);
    h.e.remove(c);
    await h.resolve(c);
    assert(!h.e.tasks.some((t) => t.id === c));
  } finally {
    await h.close();
  }
});
test("手动画质选择不阻塞自动下载；认证变化使等待任务重新解析", async () => {
  const h = harness();
  try {
    const manual = h.e.add("https://www.bilibili.com/video/manual", true);
    const next = h.e.add("https://example.com/next");
    await h.resolve(manual);
    assert.equal(h.e.get(manual).status, "ready");
    await h.resolve(next);
    assert.deepEqual(h.downloads, [next]);
    h.e.refreshAuthorization();
    assert.equal(h.e.get(manual).status, "parsing");
    await h.resolve(manual);
    assert.equal(h.e.get(manual).status, "ready");
    h.e.start(manual, 720);
    h.finish.get(next)!();
    await tick();
    assert.deepEqual(h.downloads, [next, manual]);
  } finally {
    await h.close();
  }
});
test("长时间排队的任务下载前重新解析，依然受并发上限限制", async () => {
  const h = harness();
  try {
    const a = h.e.add("https://example.com/a");
    const b = h.e.add("https://example.com/b");
    await h.resolve(a);
    await h.resolve(b);
    h.e.get(b).parsedAt = Date.now() - 360000;
    h.finish.get(a)!();
    await tick();
    assert.equal(h.e.get(b).status, "parsing");
    assert.deepEqual(h.downloads, [a]);
    await h.resolve(b);
    assert.deepEqual(h.downloads, [a, b]);
    assert(h.peak() <= 2);
  } finally {
    await h.close();
  }
});
