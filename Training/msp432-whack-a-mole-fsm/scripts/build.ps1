param(
    [switch]$TestOnly
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$build = Join-Path $root "build"
$testBuild = Join-Path $build "test"
$vsWhereCandidates = @(
    "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe",
    "$env:ProgramFiles\Microsoft Visual Studio\Installer\vswhere.exe"
)
$vsWhere = $vsWhereCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
$vsInstall = $null

if ($vsWhere) {
    $vsInstall = & $vsWhere -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
}

if (-not $vsInstall) {
    $fallback = "C:\Program Files (x86)\Microsoft Visual Studio\18\BuildTools"
    if (Test-Path -LiteralPath $fallback) {
        $vsInstall = $fallback
    }
}

if (-not $vsInstall) {
    throw "Visual Studio Build Tools with the x64 C toolchain were not found"
}

$vsDevCmd = Join-Path $vsInstall "Common7\Tools\VsDevCmd.bat"

if (-not (Test-Path -LiteralPath $vsDevCmd)) {
    throw "VsDevCmd.bat was not found at $vsDevCmd"
}

New-Item -ItemType Directory -Path $build -Force | Out-Null
New-Item -ItemType Directory -Path $testBuild -Force | Out-Null

$dllCommand = @(
    "cd /d `"$root`"",
    "call `"$vsDevCmd`" -arch=x64 -host_arch=x64 >nul",
    "cl /nologo /std:c11 /utf-8 /W4 /WX /LD /I c/include /D_CRT_SECURE_NO_WARNINGS c/src/sol_fsm.c c/src/whack_a_mole.c /Fe:build/wam.dll /Fo:build/"
) -join " && "

if (-not $TestOnly) {
    & cmd.exe /d /c $dllCommand
    if ($LASTEXITCODE -ne 0) {
        throw "DLL build failed with exit code $LASTEXITCODE"
    }
}

$testCommand = @(
    "cd /d `"$root`"",
    "call `"$vsDevCmd`" -arch=x64 -host_arch=x64 >nul",
    "cl /nologo /std:c11 /utf-8 /W4 /WX /I c/include /D_CRT_SECURE_NO_WARNINGS c/src/sol_fsm.c c/src/whack_a_mole.c c/tests/test_game.c /Fe:build/test/test_game.exe /Fo:build/test/"
) -join " && "

& cmd.exe /d /c $testCommand
if ($LASTEXITCODE -ne 0) {
    throw "C test build failed with exit code $LASTEXITCODE"
}

& (Join-Path $testBuild "test_game.exe")
if ($LASTEXITCODE -ne 0) {
    throw "C tests failed with exit code $LASTEXITCODE"
}

if (-not $TestOnly) {
    Write-Output "Built $(Join-Path $build 'wam.dll')"
}
Write-Output "C tests passed."
