@echo off
REM ??Led_Driver ????????????????????????? SIMULATION PASSED
setlocal
set VIVADO_BIN=C:\Xilinx\Vivado\2018.3\bin
cd /d "%~dp0.."

if exist sim_out rmdir /s /q sim_out
mkdir sim_out
cd sim_out

call "%VIVADO_BIN%\xvlog.bat" ..\src\led_driver.v ..\tb\tb_led_driver.v
if errorlevel 1 goto fail
call "%VIVADO_BIN%\xelab.bat" tb_led_driver -s sim
if errorlevel 1 goto fail
call "%VIVADO_BIN%\xsim.bat" sim -runall
if errorlevel 1 goto fail

echo.
echo Simulation finished, the last line should be: SIMULATION PASSED
pause
exit /b 0

:fail
echo Simulation failed, check the logs in sim_out
pause
exit /b 1
