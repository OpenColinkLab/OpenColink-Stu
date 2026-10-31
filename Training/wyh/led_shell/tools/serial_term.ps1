<#
.SYNOPSIS
    EBAZ4205 板载 letter-shell 的最小串口终端（免安装）。

.DESCRIPTION
    板子上的 shell 通过 PS UART1 (MIO24/MIO25, 115200 8N1) 收发。
    本脚本打开 COM 口：收到的字节直接打印到控制台，键盘输入原样发出，
    并把方向键 / Tab / 退格 / Delete 翻译成 letter-shell 认得的那几个
    32 位键值对应的转义序列（0x1B5B4100 = 上箭头 等）。

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File serial_term.ps1 -List
    powershell -ExecutionPolicy Bypass -File serial_term.ps1 -Port COM5
#>
param(
    [string]$Port,
    [int]$Baud = 115200,
    [switch]$List
)

$ESC = [string][char]27
$CR  = [string][char]13
$LF  = [string][char]10

function Show-Ports {
    $names = @()
    try { $names = [System.IO.Ports.SerialPort]::GetPortNames() } catch { }
    if (-not $names -or $names.Count -eq 0) {
        Write-Host "没有发现任何串口。" -ForegroundColor Yellow
        Write-Host "  1) USB 转 TTL 插上了吗？（板子这边要接 TX / RX / GND）"
        Write-Host "  2) 设备管理器 -> 端口(COM 和 LPT)，看有没有黄色感叹号"
        Write-Host "  3) 本机已装 CH340 驱动（CH341SER.SYS），插上后一般会自动出现 COMx"
    } else {
        Write-Host "可用串口：" -ForegroundColor Green
        foreach ($n in $names) { Write-Host "  $n" }
        Write-Host ("用法: powershell -ExecutionPolicy Bypass -File serial_term.ps1 -Port " + $names[0])
    }
}

if ($List -or -not $Port) { Show-Ports; return }

$sp = $null
try {
    $sp = [System.IO.Ports.SerialPort]::new($Port, $Baud,
            [System.IO.Ports.Parity]::None, 8, [System.IO.Ports.StopBits]::One)
    $sp.ReadTimeout  = 50
    $sp.WriteTimeout = 500
    $sp.DtrEnable = $false      # 板子没有 DTR 复位电路，别乱拉
    $sp.RtsEnable = $false
    $sp.Open()
} catch {
    Write-Host ("打开 " + $Port + " 失败：" + $_.Exception.Message) -ForegroundColor Red
    Write-Host "常见原因：端口号写错 / 被别的终端占用（Xshell、SDK Terminal）/ 驱动没装"
    Write-Host "先看看有哪些口：powershell -ExecutionPolicy Bypass -File serial_term.ps1 -List"
    return
}

Write-Host ("==== 已连接 " + $Port + "  " + $Baud + " 8N1 ====") -ForegroundColor Green
Write-Host "按回车试试；Esc 或 Ctrl+C 退出。方向键 / Tab / 退格 已映射给 letter-shell。" -ForegroundColor DarkGray

# 按键 -> letter-shell 认识的字节序列
$map = @{}
$map['UpArrow']    = $ESC + '[A'    # 0x1B 5B 41
$map['DownArrow']  = $ESC + '[B'    # 0x1B 5B 42
$map['RightArrow'] = $ESC + '[C'    # 0x1B 5B 43
$map['LeftArrow']  = $ESC + '[D'    # 0x1B 5B 44
$map['Tab']        = [string][char]9
$map['Backspace']  = [string][char]127
$map['Delete']     = $ESC + '[3~'
$map['Home']       = $ESC + '[H'
$map['End']        = $ESC + '[F'

$stop = $false
try {
    while (-not $stop) {
        # 1) 板子 -> 屏幕
        try {
            if ($sp.BytesToRead -gt 0) {
                [Console]::Out.Write($sp.ReadExisting())
                [Console]::Out.Flush()
            }
        } catch { }

        # 2) 键盘 -> 板子
        $hasKey = $false
        try { $hasKey = [Console]::KeyAvailable } catch { $hasKey = $false }
        while ($hasKey) {
            $k = [Console]::ReadKey($true)
            if ($k.Key -eq 'Escape') { $stop = $true; break }
            if ($map.ContainsKey([string]$k.Key)) {
                $sp.Write($map[[string]$k.Key])
            } elseif ($k.KeyChar -ne [char]0) {
                $ch = [string]$k.KeyChar
                if ($ch -eq $CR) { $sp.Write($CR) } else { $sp.Write($ch) }
            }
            try { $hasKey = [Console]::KeyAvailable } catch { $hasKey = $false }
        }

        Start-Sleep -Milliseconds 5
    }
} finally {
    if ($sp -and $sp.IsOpen) { $sp.Close() }
    Write-Host ""
    Write-Host "==== 串口已关闭 ====" -ForegroundColor DarkGray
}
