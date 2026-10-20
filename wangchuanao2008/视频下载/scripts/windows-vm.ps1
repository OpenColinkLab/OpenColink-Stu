# Run inside the existing Windows VM. All files stay in a dedicated test folder.
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$root = Join-Path $env:LOCALAPPDATA ('VideoDownloader-Test-1.3.0-' + [guid]::NewGuid().ToString('N').Substring(0,8))
New-Item -ItemType Directory -Force $root | Out-Null
Invoke-WebRequest 'http://10.211.55.2:18765/windows-test.zip' -OutFile (Join-Path $root 'windows-test.zip')
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::ExtractToDirectory((Join-Path $root 'windows-test.zip'), $root)
Set-Location $root
$env:ELECTRON_RUN_AS_NODE = '1'
$exe = (Get-ChildItem (Join-Path $root 'app') -Filter '*.exe' | Select-Object -First 1).FullName
& $exe (Join-Path $root 'tests\windows-e2e.cjs') 2>&1 | Out-File -LiteralPath (Join-Path $root 'result.log') -Encoding UTF8
$code = $LASTEXITCODE
if ($code -eq 0) {
  & $exe (Join-Path $root 'tests\youku-auth-e2e.cjs') 2>&1 | Out-File -LiteralPath (Join-Path $root 'result.log') -Encoding UTF8 -Append
  $code = $LASTEXITCODE
}
$upload = New-Object Net.WebClient
$upload.UploadFile('http://10.211.55.2:18765/results/result.log', 'POST', (Join-Path $root 'result.log')) | Out-Null
Get-ChildItem (Join-Path $root 'test-artifacts') -Recurse -Filter 'windows-*.png' | ForEach-Object {
  $upload.UploadFile(('http://10.211.55.2:18765/results/' + $_.Name), 'POST', $_.FullName) | Out-Null
}
Get-Content -LiteralPath (Join-Path $root 'result.log') -Encoding UTF8
exit $code
