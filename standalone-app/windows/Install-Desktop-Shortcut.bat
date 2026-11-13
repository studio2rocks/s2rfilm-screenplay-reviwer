@echo off
setlocal
cd /d "%~dp0.."
set "PROJECT_ROOT=%CD%"
set "VBS_PATH=%PROJECT_ROOT%\windows\Launch-S2RFilm-Studio.vbs"
set "ICON_PATH=%PROJECT_ROOT%\public\icon.ico"

echo ====================================================
echo   S2RFilm Studio Desktop - Windows Desktop Setup
echo ====================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo [ERROR] Node.js 18+ not detected. Please install from https://nodejs.org/
  pause
  exit /b 1
)

if not exist "dist-electron\server.cjs" (
  echo [1/2] Installing dependencies and building desktop bundle...
  call npm install
  call npm run build
)

echo [2/2] Creating Windows Desktop and Start Menu shortcuts...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $desktop = [Environment]::GetFolderPath('Desktop'); $s = $ws.CreateShortcut((Join-Path $desktop 'S2RFilm Studio Desktop.lnk')); $s.TargetPath = 'wscript.exe'; $s.Arguments = '"%VBS_PATH%"'; $s.WorkingDirectory = '%PROJECT_ROOT%'; $s.IconLocation = '%ICON_PATH%'; $s.Description = 'S2RFilm Studio Desktop - Screenplay Reviewer'; $s.Save(); $startMenu = Join-Path $env:APPDATA 'Microsoft\Windows\Start Menu\Programs'; $sm = $ws.CreateShortcut((Join-Path $startMenu 'S2RFilm Studio Desktop.lnk')); $sm.TargetPath = 'wscript.exe'; $sm.Arguments = '"%VBS_PATH%"'; $sm.WorkingDirectory = '%PROJECT_ROOT%'; $sm.IconLocation = '%ICON_PATH%'; $sm.Save()"

echo.
echo [SUCCESS] Shortcut placed on your Desktop: S2RFilm Studio Desktop
echo Launching now...
wscript.exe "%VBS_PATH%"
