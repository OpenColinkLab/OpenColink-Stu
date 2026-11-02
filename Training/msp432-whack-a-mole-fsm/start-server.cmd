@echo off
cd /d "%~dp0"

if not exist ".venv\Scripts\python.exe" (
    uv sync --python 3.12.12
    if errorlevel 1 goto :error
)

".venv\Scripts\python.exe" server.py --port 8765
if errorlevel 1 goto :error
goto :eof

:error
echo.
echo Failed to start the MSP432 state-machine tutorial server.
pause
