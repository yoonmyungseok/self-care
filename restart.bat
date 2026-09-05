@echo off

if /i "%~1"=="_run_" goto :run

powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0scripts\restart-launch.ps1" -BatPath "%~f0"
exit

:run
chcp 65001 >nul
setlocal EnableDelayedExpansion

cd /d "%~dp0"

set PORT=3000

echo ========================================
echo  Self Care - Dev Server Restart
echo ========================================
echo.

echo [%time%] Stopping process on port %PORT%...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT% " ^| findstr LISTENING') do (
    echo   Killing PID %%a
    taskkill /F /T /PID %%a >nul 2>&1
)

timeout /t 2 /nobreak >nul

echo.
echo [%time%] Starting dev server...
echo   http://localhost:%PORT%
echo   Press Ctrl+C to stop
echo.

call npm run dev

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to start dev server.
    pause
    exit /b 1
)
