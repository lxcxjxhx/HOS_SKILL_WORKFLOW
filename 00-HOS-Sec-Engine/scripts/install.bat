@echo off
title HOS Skills Installer

echo.
echo +------------------------------------------+
echo ^|    HOS Skills Installer                  ^|
echo ^|    Supports: Trae / Claude Code / Cursor ^|
echo +------------------------------------------+
echo.

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [Error] Node.js not found
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do echo [OK] Node.js %%i
echo.

set SCRIPT_DIR=%TEMP%\hos-skills-installer-%RANDOM%
mkdir "%SCRIPT_DIR%" >nul 2>&1

echo [1/2] Downloading installer...
powershell -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/lxcxjxhx/HOS_SKILL_WORKFLOW/main/00-HOS-Sec-Engine/scripts/install-lite.js' -OutFile '%SCRIPT_DIR%\install-lite.js'" 2>nul
if not exist "%SCRIPT_DIR%\install-lite.js" (
    echo [Error] Download failed
    pause
    exit /b 1
)

echo [2/2] Starting installer...
echo.
node "%SCRIPT_DIR%\install-lite.js" %*
echo.
pause
