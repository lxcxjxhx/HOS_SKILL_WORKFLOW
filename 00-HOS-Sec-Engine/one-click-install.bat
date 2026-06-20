@echo off
title HOS Skills One-Click Installer

echo.
echo ==========================================
echo     HOS-Sec-Engine Skill Installer
echo     28+ Security Skills for AI Editors
echo     Supports: Trae / Claude Code / Cursor
echo ==========================================
echo.

REM Check node
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js first.
    echo Download: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do echo [OK] Node.js %%i
echo.

REM Download and run install-lite.js
set SCRIPT_DIR=%TEMP%\hos-skills-installer-%RANDOM%
mkdir "%SCRIPT_DIR%" >nul 2>&1

echo [1/2] Downloading installer...
powershell -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/lxcxjxhx/HOS_SKILL_WORKFLOW/main/00-HOS-Sec-Engine/scripts/install-lite.js' -OutFile '%SCRIPT_DIR%\install-lite.js'" 2>nul
if not exist "%SCRIPT_DIR%\install-lite.js" (
    echo [ERROR] Download failed. Check your network.
    pause
    exit /b 1
)

echo [OK] Installer downloaded
echo.
echo [2/2] Installing skills...
echo.

node "%SCRIPT_DIR%\install-lite.js" --target trae --global --all

echo.
echo ==========================================
echo     Installation Complete
echo     Describe security scenarios in your IDE
echo     and skills will be auto-matched
echo ==========================================
echo.

REM Cleanup
rmdir /s /q "%SCRIPT_DIR%" >nul 2>&1

pause

