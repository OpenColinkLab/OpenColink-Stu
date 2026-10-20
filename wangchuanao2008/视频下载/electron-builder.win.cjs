const { build } = require("./package.json");

module.exports = {
  ...build,
  extends: null,
  directories: { output: "release-windows-v1.3.0" },
  extraResources: [
    { from: "resources/bin-win-x64", to: "bin" },
    { from: "THIRD_PARTY.md", to: "THIRD_PARTY.md" },
    { from: "resources/binaries-win-x64.json", to: "binaries.json" },
  ],
  win: {
    target: [
      { target: "nsis", arch: ["x64"] },
      { target: "zip", arch: ["x64"] },
    ],
    icon: "resources/icon.ico",
    artifactName: "视频下载器-${version}-windows-${arch}.${ext}",
    signExecutable: false,
    requestedExecutionLevel: "asInvoker",
  },
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    shortcutName: "视频下载器",
    installerLanguages: ["zh_CN"],
    language: "2052",
    runAfterFinish: true,
    deleteAppDataOnUninstall: false,
    artifactName: "视频下载器-${version}-windows-${arch}-安装程序.${ext}",
  },
};
