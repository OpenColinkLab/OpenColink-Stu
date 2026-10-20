#define AppName "网易云音乐下载器"
#ifndef AppVersion
#error Build with build_windows.ps1 so AppVersion comes from VERSION
#endif
#define AppExe AppName + ".exe"

[Setup]
AppId={{6FBB639D-DF68-4D57-AE9A-8E6889A5B322}
AppName={#AppName}
AppVersion={#AppVersion}
DefaultDirName={localappdata}\Programs\NeteaseMusicDownloader
DefaultGroupName={#AppName}
UninstallDisplayIcon={app}\{#AppExe}
OutputDir=dist\installer
OutputBaseFilename=网易云音乐下载器-安装程序-Windows-x64
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
SetupArchitecture=x64
CloseApplications=yes

[Languages]
Name: "chinesesimplified"; MessagesFile: "compiler:Languages\ChineseSimplified.isl"

[Tasks]
Name: "desktopicon"; Description: "创建桌面快捷方式"; GroupDescription: "附加任务："; Flags: unchecked

[Files]
Source: "dist\{#AppName}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#AppName}"; Filename: "{app}\{#AppExe}"
Name: "{userdesktop}\{#AppName}"; Filename: "{app}\{#AppExe}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#AppExe}"; Description: "安装完成后启动{#AppName}"; Flags: nowait postinstall skipifsilent
