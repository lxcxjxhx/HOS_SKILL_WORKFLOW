@echo off
chcp 65001 >nul 2>&1
echo.
echo ========================================
echo   HOS-Sec-Engine Skill Installer
echo ========================================
echo.

set SCRIPT_DIR=%~dp0
set REPO_URL=https://github.com/lxcxjxhx/HOS_SKILL_WORKFLOW

echo Available Skills (22 total):
echo.
echo [Web Security]
echo   1.  web-sqli-001     - SQL Injection WAF Bypass
echo   2.  web-xss-001      - XSS Filter Bypass
echo   3.  web-ssrf-001     - SSRF Detection and Exploitation
echo   4.  web-xxe-001      - XXE Injection
echo   5.  web-upload-001   - File Upload Restriction Bypass
echo   6.  web-rce-001      - Command Injection (RCE)
echo   7.  web-deser-001    - Insecure Deserialization
echo.
echo [API Security]
echo   8.  api-jwt-001      - JWT Attack and Bypass
echo   9.  api-oauth-001    - OAuth 2.0 / OIDC Attacks
echo   10. api-idor-001     - IDOR / BOLA
echo   11. api-ratelimit-001 - Rate Limit Bypass
echo.
echo [Cloud Security]
echo   12. cloud-s3-001     - S3/OSS/COS Misconfiguration
echo   13. cloud-iam-001    - AWS IAM Privilege Escalation
echo   14. cloud-meta-001   - Cloud Instance Metadata (IMDS)
echo.
echo [OS Security]
echo   15. windows-priv-esc-001 - Windows Privilege Escalation
echo   16. linux-priv-esc-001   - Linux Privilege Escalation
echo.
echo [Other]
echo   17. ad-domain-enum-001      - AD Domain Enumeration
echo   18. code-review-java-deser-001 - Java Code Review
echo   19. container-docker-escape-001 - Container Escape
echo   20. k8s-misconfig-001       - Kubernetes Misconfiguration
echo   21. ai-prompt-injection-001 - Prompt Injection
echo   22. mobile-android-apk-001  - Android APK Analysis
echo.
echo ========================================
echo.

:menu
echo Select installation mode:
echo   A - Install ALL skills (22)
echo   W - Install Web Security bundle (7 skills)
echo   P - Install API Security bundle (4 skills)
echo   C - Install Cloud Security bundle (3 skills)
echo   O - Install OS Security bundle (2 skills)
echo   I - Install Intranet bundle (1 skill)
echo   S - Install specific skill(s)
echo   Q - Quit
echo.
set /p MODE="Enter choice: "

set TARGET=trae
echo.
echo Select target editor:
echo   1 - TRAE IDE
echo   2 - Claude Code
echo   3 - Cursor
echo   4 - All editors
echo.
set /p TARGET_CHOICE="Enter choice (default 1): "
if "%TARGET_CHOICE%"=="2" set TARGET=claude-code
if "%TARGET_CHOICE%"=="3" set TARGET=cursor
if "%TARGET_CHOICE%"=="4" set TARGET=all

echo.
set /p GLOBAL="Install globally? (Y/N, default Y): "
set GLOBAL_FLAG=-g
if /I "%GLOBAL%"=="N" set GLOBAL_FLAG=

if /I "%MODE%"=="A" call :installAll
if /I "%MODE%"=="W" call :installBundle web-sqli-001 web-xss-001 web-ssrf-001 web-xxe-001 web-upload-001 web-rce-001 web-deser-001
if /I "%MODE%"=="P" call :installBundle api-jwt-001 api-oauth-001 api-idor-001 api-ratelimit-001
if /I "%MODE%"=="C" call :installBundle cloud-s3-001 cloud-iam-001 cloud-meta-001
if /I "%MODE%"=="O" call :installBundle windows-priv-esc-001 linux-priv-esc-001
if /I "%MODE%"=="I" call :installBundle ad-domain-enum-001
if /I "%MODE%"=="S" goto :specific

echo.
echo ========================================
echo   Installation complete!
echo ========================================
pause
exit /b

:specific
echo.
echo Enter skill IDs separated by comma (e.g., web-sqli-001,api-jwt-001):
set /p SKILL_IDS="Skill IDs: "
call :installFromList %SKILL_IDS%
goto :menu

:installAll
echo Installing ALL 22 skills to %TARGET%...
call :installFromList web-sqli-001,web-xss-001,web-ssrf-001,web-xxe-001,web-upload-001,web-rce-001,web-deser-001,api-jwt-001,api-oauth-001,api-idor-001,api-ratelimit-001,cloud-s3-001,cloud-iam-001,cloud-meta-001,windows-priv-esc-001,linux-priv-esc-001,ad-domain-enum-001,code-review-java-deser-001,container-docker-escape-001,k8s-misconfig-001,ai-prompt-injection-001,mobile-android-apk-001
goto :eof

:installBundle
setlocal enabledelayedexpansion
set SKILLS=%*
echo Installing bundle: %SKILLS%
call :installFromList !SKILLS!
goto :eof

:installFromList
setlocal enabledelayedexpansion
set LIST=%1
for %%S in (!LIST:,= !) do (
    echo.
    echo [Installing] %%S...
    if "%TARGET%"=="all" (
        call :doInstall %%S claude-code
        call :doInstall %%S trae
        call :doInstall %%S cursor
    ) else (
        call :doInstall %%S %TARGET%
    )
)
goto :eof

:doInstall
set SKILL_ID=%1
set EDITOR=%2
echo   -> Installing %SKILL_ID% to %EDITOR%...
npx skills add %REPO_URL% -s %SKILL_ID% -a %EDITOR% %GLOBAL_FLAG% -y
if errorlevel 1 (
    echo   [FAILED] %SKILL_ID% to %EDITOR%
) else (
    echo   [OK] %SKILL_ID% to %EDITOR%
)
goto :eof
