@echo off
REM ??????????? PS -> ps7_init -> ??PL -> ??? elf ???
REM ?????un ?????? build_project.tcl / build_sdk.tcl ???????????setlocal
set VIVADO_BIN=C:\Xilinx\Vivado\2018.3\bin
set XSCT_BIN=C:\Xilinx\SDK\2018.3\bin
cd /d "%~dp0.."

if not exist "run\Led_Shell_Top.bit" (
    echo [ERR] run\Led_Shell_Top.bit missing, run build_project.tcl first
    pause & exit /b 1
)
if not exist "run\led_shell.elf" (
    echo [ERR] run\led_shell.elf missing, run build_sdk.tcl first
    pause & exit /b 1
)
if not exist "run\ps7_init.tcl" (
    echo [ERR] run\ps7_init.tcl missing, run build_project.tcl first
    pause & exit /b 1
)

REM FT232H ??? USB ???????????JTAG??????????pnputil /enum-devices /connected 2>nul | findstr /I "VID_0403" >nul
if errorlevel 1 echo [WARN] FT232H not found on USB, unplug and replug it

set BOARD_BIT=%CD%\run\Led_Shell_Top.bit
set BOARD_ELF=%CD%\run\led_shell.elf
set BOARD_PSINIT=%CD%\run\ps7_init.tcl

REM FTDI ??????????????hw_server ?????????????taskkill /F /IM hw_server.exe >nul 2>&1
timeout /t 2 /nobreak >nul
start "" /B "%VIVADO_BIN%\hw_server.bat"
timeout /t 8 /nobreak >nul

call "%XSCT_BIN%\xsct.bat" "%~dp0run_app.tcl"
echo.
echo If you saw PS_INIT + FPGA + APPLICATION RUNNING, open the serial port
echo at 115200 8N1 and type: help
pause
