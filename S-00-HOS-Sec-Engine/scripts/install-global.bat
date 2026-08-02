@echo off
title HOS-Sec-Engine 全局安装
chcp 65001 >nul
setlocal enabledelayedexpansion

set ENGINE_DIR=%~dp0..
set BIN_NAME=hos-sec-engine

echo.
echo +------------------------------------------+
echo ^|  HOS-Sec-Engine 全局安装                  ^|
echo +------------------------------------------+
echo.

:: --- 检查 Node.js ---
echo [检查] Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 Node.js，请先安装 Node.js ^>= 18.0.0
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do echo   Node.js %%i

:: --- 检查当前目录 ---
echo [检查] 项目完整性...
if not exist "%ENGINE_DIR%\dist\src\cli\index.js" (
    echo [信息] dist 目录不存在，正在构建...
    cd /d "%ENGINE_DIR%"
    call npm run build
    if !errorlevel! neq 0 (
        echo [错误] 构建失败，请检查代码
        pause
        exit /b 1
    )
    echo   ✓ 构建完成
)

:: --- 方式 1: npm link ---
echo.
echo [安装] 通过 npm link 注册全局命令...
cd /d "%ENGINE_DIR%"
call npm link
if %errorlevel% neq 0 (
    echo [警告] npm link 失败，尝试通过 PATH 方式安装...
    goto :path_install
)
echo   ✓ npm link 成功

:: --- 验证 ---
echo.
echo [验证] 测试全局命令...
where "%BIN_NAME%" >nul 2>&1
if %errorlevel% equ 0 (
    echo   ✓ %BIN_NAME% 已注册到 PATH
    echo.
    echo +------------------------------------------+
    echo ^|  安装完成!                                 ^|
    echo ^|  在命令行中运行:                            ^|
    echo ^|    hos-sec-engine help                    ^|
    echo ^|    hos-sec-engine server                  ^|
    echo ^|    hos-sec-engine run                     ^|
    echo +------------------------------------------+
    echo.
    goto :end
)

:path_install
:: --- 方式 2: 添加 PATH ---
echo.
set TARGET_DIR=%USERPROFILE%\.hos-sec-engine\bin
if not exist "%TARGET_DIR%" mkdir "%TARGET_DIR%"

:: 创建 bat 启动器
set BAT_PATH=%TARGET_DIR%\%BIN_NAME%.bat
(
echo @echo off
echo set ENGINE_DIR=%~dp0..\engine
echo node "%%ENGINE_DIR%%\dist\src\cli\index.js" %%*
) > "%BAT_PATH%"

:: 判断当前 PATH 是否已包含目标目录
echo %PATH% | find /i "%TARGET_DIR%" >nul
if %errorlevel% neq 0 (
    echo [配置] 添加 %TARGET_DIR% 到 PATH...
    setx PATH "%PATH%;%TARGET_DIR%" /M >nul 2>&1
    if !errorlevel! equ 0 (
        echo   ✓ 已添加到系统 PATH
        echo   ! 请重启命令行后生效
    ) else (
        echo [信息] 需要管理员权限修改系统 PATH
        echo   手动将以下目录添加到 PATH:
        echo     %TARGET_DIR%
    )
)

echo.
echo +------------------------------------------+
echo ^|  安装完成!                                 ^|
echo ^|  启动器已创建:                              ^|
echo ^|    %BAT_PATH%        ^|
echo ^|  重启命令行后运行:                           ^|
echo ^|    %BIN_NAME% help                        ^|
echo +------------------------------------------+
echo.

:end
endlocal
pause