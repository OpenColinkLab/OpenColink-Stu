@echo off
setlocal
REM ===========================================================================
REM  scripts\run_app.cmd
REM  One click start for the EBAZ4205: reset PS, ps7_init, program PL, run app.
REM
REM  USAGE
REM    run_app.cmd
REM        Program THIS project (default):
REM            <project>\run\Led_Shell_Top.bit
REM            <project>\run\led_shell.elf
REM            <project>\run\ps7_init.tcl
REM
REM    run_app.cmd  D:\other_project
REM        Program another project: auto-find the first *.bit and *.elf inside
REM        D:\other_project\run  (or D:\other_project itself) and use
REM        ps7_init.tcl from the same folder.
REM
REM    run_app.cmd  my.bit  my.elf  [my_ps7_init.tcl]  [entry]
REM        Fully explicit.  entry defaults to 0x00100000.
REM
REM  RULES for another project
REM    1) bit / elf / ps7_init.tcl must come from the SAME hardware project
REM       (same block design), otherwise DDR + MIO are configured for the
REM       wrong design and the board looks dead.
REM    2) the elf must be linked at the same entry address (default 0x00100000).
REM    3) close Vivado's Hardware Manager before running this: the script
REM       kills hw_server.exe and restarts it.
REM
REM  The stock EBAZ4205 has no PL oscillator: FCLK_CLK0 comes from the PS, so
REM  ps7_init has to run before the bitstream is loaded (Vivado "Program Device"
REM  alone would leave the PL without a clock).
REM ===========================================================================
set VIVADO_BIN=C:\Xilinx\Vivado\2018.3\bin
set XSCT_BIN=C:\Xilinx\SDK\2018.3\bin
set OBJCOPY=C:\Xilinx\SDK\2018.3\gnu\aarch32\nt\gcc-arm-none-eabi\bin\arm-none-eabi-objcopy.exe
set HEREDIR=%~dp0
set DEFAULT_RUN=%~dp0..\run

set BIT=
set ELF=
set PSINIT=
set ENTRY=
set MODE=

if "%~1"=="" goto use_default
if "%~2"=="" goto use_dir
goto use_files

:use_default
set MODE=default project
set RUN=%DEFAULT_RUN%
set BIT=%RUN%\Led_Shell_Top.bit
set ELF=%RUN%\led_shell.elf
set PSINIT=%RUN%\ps7_init.tcl
goto resolve

:use_dir
set MODE=project folder
if exist "%~1\run" (set RUN=%~1\run) else (set RUN=%~1)
for %%F in ("%RUN%\*.bit") do if not defined BIT set BIT=%%~fF
for %%F in ("%RUN%\*.elf") do if not defined ELF set ELF=%%~fF
set PSINIT=%RUN%\ps7_init.tcl
goto resolve

:use_files
set MODE=explicit files
set BIT=%~1
set ELF=%~2
for %%F in ("%~2") do set RUN=%%~dpF
if "%~3"=="" (set PSINIT=%RUN%ps7_init.tcl) else (set PSINIT=%~3)
set ENTRY=%~4
goto resolve

:resolve
if "%ELF%"=="" (
    echo ERROR: no .elf found in "%RUN%"
    pause
    exit /b 1
)
set BIN=%ELF:.elf=.bin%
if "%ENTRY%"=="" set ENTRY=0x00100000

echo =====================================================
echo  EBAZ4205 : program PL + run application
echo  mode     : %MODE%
echo =====================================================
echo  bit      : %BIT%
echo  elf      : %ELF%
echo  bin      : %BIN%
echo  ps7_init : %PSINIT%
echo  entry    : %ENTRY%
echo.

if not exist "%BIT%" (
    echo ERROR: bitstream not found: "%BIT%"
    echo        run:  vivado -mode batch -source scripts\build_project.tcl
    pause
    exit /b 1
)
if not exist "%ELF%" (
    echo ERROR: elf not found: "%ELF%"
    echo        run:  xsct scripts\build_sdk.tcl
    pause
    exit /b 1
)
if not exist "%PSINIT%" (
    echo ERROR: ps7_init.tcl not found: "%PSINIT%"
    echo        it must be exported from the same hardware project as the .bit
    pause
    exit /b 1
)

REM ---- elf -> flat binary ------------------------------------------------
REM  "dow" of an ELF fails on this board (Code 16 / Invalid context /
REM  MMU page translation fault), so run_app.tcl downloads a flat binary
REM  with "dow -data" and then sets PC by hand.
if not exist "%OBJCOPY%" (
    echo ERROR: arm-none-eabi-objcopy not found:
    echo        %OBJCOPY%
    pause
    exit /b 1
)
echo [0/2] elf -^> bin ...
"%OBJCOPY%" -O binary "%ELF%" "%BIN%"
if errorlevel 1 (
    echo ERROR: objcopy failed.
    pause
    exit /b 1
)

REM ---- downloader on the USB bus? ----
pnputil /enum-devices /connected 2>nul | findstr /I "VID_0403" >nul
if errorlevel 1 (
    echo [WARN] FT232H downloader is NOT on the USB bus.
    echo        Unplug it, wait 5 s, plug it back, then run this again.
    echo.
)

set BOARD_BIT=%BIT%
set BOARD_BIN=%BIN%
set BOARD_ELF=%ELF%
set BOARD_PSINIT=%PSINIT%
set BOARD_ENTRY=%ENTRY%

echo [1/2] restarting hw_server ...
taskkill /F /IM hw_server.exe >nul 2>&1
timeout /t 2 /nobreak >nul
start "" /B "%VIVADO_BIN%\hw_server.bat"
timeout /t 8 /nobreak >nul

echo [2/2] XSCT : rst -system -> ps7_init -> program PL -> run application ...
call "%XSCT_BIN%\xsct.bat" "%HEREDIR%run_app.tcl"

echo.
echo =====================================================
echo  If you saw PS_INIT + FPGA + APPLICATION RUNNING above,
echo  open the serial terminal at 115200 8N1 and type: help
echo =====================================================
pause
endlocal
