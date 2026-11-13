@echo off
setlocal EnableDelayedExpansion
title S2RFilm Studio Desktop
cd /d "%~dp0.."
set "APP_ROOT=%CD%"
set "PORT=3480"
set "URL=http://127.0.0.1:%PORT%"
set "LOG_FILE=%TEMP%\s2rfilm-studio-desktop.log"

where node >nul 2>nul
if %errorlevel% neq 0 (
  powershell -NoProfile -Command "Add-Type -AssemblyName PresentationFramework; [System.Windows.MessageBox]::Show('Node.js 18+ is required to run S2RFilm Studio Desktop. Download LTS from https://nodejs.org/', 'S2RFilm Studio Desktop', 'OK', 'Error')"
  exit /b 1
)

rem If Electron binary is already installed, prefer native Electron window
if exist "node_modules\.bin\electron.cmd" (
  if exist "dist-electron\server.cjs" (
    start "" /b cmd /c "node_modules\.bin\electron.cmd ."
    exit /b 0
  )
)

rem Check if server is already listening on 127.0.0.1:3480
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r = Invoke-WebRequest -UseBasicParsing -Uri '%URL%/api/health' -TimeoutSec 1; if ($r.StatusCode -eq 200) { exit 0 } } catch { exit 1 }"
if %errorlevel% equ 0 goto :open_browser

rem Fast instant launch via pre-built zero-dependency server.cjs (requires only Node.js)
if exist "dist-electron\server.cjs" (
  if exist "dist\index.html" (
    start "S2RFilm-Backend" /b cmd /c "set NODE_ENV=production&& set PORT=%PORT%&& set S2R_APP_ROOT=%APP_ROOT%&& set S2R_DIST_DIR=%APP_ROOT%\dist&& node dist-electron\server.cjs > "%LOG_FILE%" 2>&1"
    goto :wait_ready
  )
)

rem Fallback: install dependencies if missing and launch tsx dev server
if not exist "node_modules" (
  echo [SETUP] Installing dependencies on first run...
  call npm install > "%LOG_FILE%" 2>&1
)
start "S2RFilm-Backend" /min cmd /c "set PORT=%PORT%&& npm run dev >> "%LOG_FILE%" 2>&1"

:wait_ready
echo Waiting for S2RFilm Studio server on %URL% ...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ok=$false; for($i=0; $i -lt 80; $i++){ try { $r = Invoke-WebRequest -UseBasicParsing -Uri '%URL%/api/health' -TimeoutSec 1; if ($r.StatusCode -eq 200) { $ok=$true; break } } catch {}; Start-Sleep -Milliseconds 250 }; if(-not $ok){ exit 1 }"
if %errorlevel% neq 0 (
  powershell -NoProfile -Command "Add-Type -AssemblyName PresentationFramework; $err = if (Test-Path '%LOG_FILE%') { (Get-Content '%LOG_FILE%' -Tail 10) -join "`n" } else { 'No log available.' }; [System.Windows.MessageBox]::Show("Server failed to start on %URL%.`n`n" + $err, 'S2RFilm Studio Desktop Error', 'OK', 'Error')"
  exit /b 1
)

:open_browser
where msedge >nul 2>nul
if %errorlevel% equ 0 (
  start "" msedge --app=%URL%
  exit /b 0
)

if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
  start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app=%URL%
  exit /b 0
)

if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
  start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app=%URL%
  exit /b 0
)

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
  start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app=%URL%
  exit /b 0
)

start "" %URL%
exit /b 0
