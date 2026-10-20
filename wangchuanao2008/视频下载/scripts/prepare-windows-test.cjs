const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");
const { execFileSync } = require("node:child_process");
const root = path.resolve("test-artifacts/windows-transfer/stage");
fs.rmSync(root, { recursive: true, force: true });
fs.mkdirSync(path.join(root, "tests"), { recursive: true });
fs.mkdirSync(path.join(root, "test-artifacts"), { recursive: true });
fs.cpSync("release-windows-v1.3.0/win-unpacked", path.join(root, "app"), {
  recursive: true,
});
fs.cpSync(
  "node_modules/playwright-core",
  path.join(root, "node_modules/playwright-core"),
  { recursive: true },
);
fs.cpSync(
  "test-artifacts/fixtures",
  path.join(root, "test-artifacts/fixtures"),
  { recursive: true },
);
fs.copyFileSync(
  "tests/windows-e2e.cjs",
  path.join(root, "tests/windows-e2e.cjs"),
);
const fixture = ts.transpileModule(
  fs.readFileSync("tests/fixtures.ts", "utf8"),
  {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  },
).outputText;
fs.writeFileSync(path.join(root, "tests/fixtures.cjs"), fixture);
// Reuse isolated authorization UI suites against the packaged Windows app.
for (const suite of ["auth-e2e", "youku-auth-e2e"]) {
  const auth = fs
    .readFileSync(`tests/${suite}.ts`, "utf8")
    .replace('from "playwright"', 'from "playwright-core"')
    .replace(
      'args: ["."],',
      'executablePath: path.resolve("app/视频下载器.exe"), args: [],',
    )
    .replace(
      "...process.env,",
      '...Object.fromEntries(Object.entries(process.env).filter(([k]) => k !== "ELECTRON_RUN_AS_NODE")),',
    );
  fs.writeFileSync(
    path.join(root, `tests/${suite}.cjs`),
    ts.transpileModule(auth, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    }).outputText,
  );
}
execFileSync("python3", ["scripts/zip-windows-test.py"], {cwd:path.resolve('.')});
console.log("Prepared isolated Windows test archive.");
