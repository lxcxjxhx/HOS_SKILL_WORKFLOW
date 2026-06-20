# HOS Skill Install Test Script
$testDir = "$env:TEMP\hos-test-install"
if (Test-Path $testDir) { Remove-Item -Recurse -Force $testDir }
New-Item -ItemType Directory -Path $testDir -Force | Out-Null
Write-Host "Test directory: $testDir" -ForegroundColor Cyan

# Download install-lite.js
Write-Host "`nDownloading install-lite.js from GitHub..." -ForegroundColor Yellow
irm 'https://raw.githubusercontent.com/lxcxjxhx/HOS_SKILL_WORKFLOW/main/00-HOS-Sec-Engine/scripts/install-lite.js' -OutFile "$testDir\install.js" -ErrorAction Stop
Write-Host "Downloaded install.js successfully" -ForegroundColor Green

# Run install in non-interactive mode
Write-Host "`nRunning install..." -ForegroundColor Yellow
node "$testDir\install.js" --target trae --all --global
