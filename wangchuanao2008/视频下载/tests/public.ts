import { Engine } from "../electron/engine";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
const root = path.resolve("test-artifacts/public");
const e = new Engine(
  path.resolve("resources/bin"),
  path.join(root, "state"),
  path.join(root, "downloads"),
);
const id = e.add(
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
);
const timeout = setTimeout(() => {
  e.shutdown();
  process.exitCode = 1;
}, 120000);
e.on("update", () => {
  const t = e.get(id);
  if (t.status === "completed" || t.status === "failed") {
    clearTimeout(timeout);
    console.log(JSON.stringify(t, null, 2));
    if (t.file) {
      execFileSync(
        e.executable("ffmpeg"),
        ["-v", "error", "-i", t.file, "-f", "null", "-"],
        { stdio: "pipe" },
      );
      fs.writeFileSync(
        path.join(root, "result.json"),
        JSON.stringify(t, null, 2),
      );
    } else process.exitCode = 1;
    e.shutdown();
  }
});
