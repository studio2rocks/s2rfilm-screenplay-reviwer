#!/usr/bin/env python3
"""
Duplicates the S2RFilm Screenplay Reviewer into a brand-new standalone desktop application
("S2RFilm Studio Desktop") packaged for both macOS and Windows:
  - Pre-builds dist/ and self-contained dist-electron/server.cjs (boots in <0.3s with Node alone)
  - Embeds self-contained runtime directly inside mac/S2RFilm Studio Desktop.app/Contents/Resources/app
  - Includes Electron + electron-builder configuration for native .dmg (macOS) and .exe (Windows)
  - Includes resilient health-checked Windows .bat/.vbs and macOS .app/.command launchers
"""
import json
import os
import shutil
import stat
import subprocess
import zipfile

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
STANDALONE_DIR = os.path.join(WORKSPACE_ROOT, 'standalone-app')
PUBLIC_DIR = os.path.join(WORKSPACE_ROOT, 'public')

def write_text(path: str, content: str, executable: bool = False):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(content)
    if executable:
        st = os.stat(path)
        os.chmod(path, st.st_mode | stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)

def create_standalone_package_json() -> str:
    pkg = {
        "name": "s2rfilm-studio-desktop",
        "productName": "S2RFilm Studio Desktop",
        "version": "1.0.0",
        "private": True,
        "description": "Standalone Mac & Windows Desktop Application for S2RFilm Screenplay Reviewer & Hollywood Coverage Studio.",
        "main": "electron/main.cjs",
        "type": "module",
        "author": "S2RFilm Studio",
        "license": "Apache-2.0",
        "scripts": {
            "dev": "tsx server.ts",
            "build:web": "vite build",
            "build:server": "esbuild server.ts --bundle --platform=node --format=cjs --outfile=dist-electron/server.cjs --external:vite",
            "build": "npm run build:web && npm run build:server",
            "start": "node dist-electron/server.cjs",
            "electron:dev": "concurrently -k \"tsx server.ts\" \"wait-on http://localhost:3000 && cross-env ELECTRON_DEV=1 electron .\"",
            "electron:start": "npm run build && electron .",
            "build:mac": "npm run build && electron-builder --mac",
            "build:win": "npm run build && electron-builder --win",
            "build:all": "npm run build && electron-builder -mw",
            "lint": "tsc --noEmit"
        },
        "dependencies": {
            "@google/genai": "^2.4.0",
            "@tailwindcss/vite": "^4.3.3",
            "@vitejs/plugin-react": "^6.1.1",
            "docx": "^9.15.3",
            "dotenv": "^17.2.3",
            "express": "^4.21.2",
            "jszip": "^3.10.2",
            "lucide-react": "^0.546.0",
            "mammoth": "^1.13.0",
            "motion": "^12.23.24",
            "react": "^19.0.1",
            "react-dom": "^19.0.1",
            "vite": "^8.3.0"
        },
        "devDependencies": {
            "@types/express": "^4.17.21",
            "@types/node": "^22.14.0",
            "@types/react": "^19.3.0",
            "@types/react-dom": "^19.3.0",
            "autoprefixer": "^10.4.21",
            "concurrently": "^9.1.2",
            "cross-env": "^7.0.3",
            "electron": "^35.0.0",
            "electron-builder": "^25.1.8",
            "esbuild": "^0.25.0",
            "tailwindcss": "^4.3.3",
            "tsx": "^4.21.0",
            "typescript": "^7.0.2",
            "wait-on": "^8.0.2"
        }
    }
    return json.dumps(pkg, indent=2) + "\n"

ELECTRON_BUILDER_JSON = """{
  "appId": "com.s2rfilm.studio.desktop",
  "productName": "S2RFilm Studio Desktop",
  "copyright": "Copyright © 2026 S2RFilm Studio",
  "directories": {
    "output": "release-builds"
  },
  "files": [
    "dist/**/*",
    "dist-electron/**/*",
    "electron/**/*",
    "public/pwa-512x512.png",
    "public/icon.ico",
    "package.json"
  ],
  "mac": {
    "category": "public.app-category.productivity",
    "icon": "public/pwa-512x512.png",
    "target": [
      {
        "target": "dmg",
        "arch": ["arm64", "x64"]
      },
      {
        "target": "zip",
        "arch": ["arm64", "x64"]
      }
    ],
    "artifactName": "${productName}-${arch}-${version}.${ext}"
  },
  "win": {
    "icon": "public/icon.ico",
    "target": [
      {
        "target": "nsis",
        "arch": ["x64"]
      },
      {
        "target": "portable",
        "arch": ["x64"]
      }
    ],
    "artifactName": "${productName}-Setup-${version}.${ext}"
  },
  "nsis": {
    "oneClick": false,
    "perMachine": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true,
    "shortcutName": "S2RFilm Studio Desktop",
    "uninstallDisplayName": "S2RFilm Studio Desktop"
  }
}
"""

ELECTRON_MAIN_CJS = """const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = process.env.ELECTRON_DEV === '1';
let mainWindow = null;
let serverInstance = null;

function createApplicationMenu() {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' }
            ]
          }
        ]
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Print / Save PDF',
          accelerator: 'CmdOrCtrl+P',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.print({ printBackground: true });
            }
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [{ type: 'separator' }, { role: 'front' }] : [{ role: 'close' }])
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

async function startEmbeddedBackend() {
  process.env.NODE_ENV = 'production';
  process.env.S2R_STANDALONE = '1';
  process.env.S2R_APP_ROOT = path.join(__dirname, '..');
  process.env.S2R_DIST_DIR = path.join(__dirname, '..', 'dist');

  const bundledServerPath = path.join(__dirname, '..', 'dist-electron', 'server.cjs');
  if (!fs.existsSync(bundledServerPath)) {
    throw new Error(`Bundled server missing at ${bundledServerPath}. Run "npm run build" first.`);
  }

  const serverModule = require(bundledServerPath);
  const startFn = serverModule.startStandaloneServer || (serverModule.default && serverModule.default.startStandaloneServer);
  if (typeof startFn !== 'function') {
    throw new Error('startStandaloneServer export not found in dist-electron/server.cjs');
  }

  const { server, port } = await startFn(0, '127.0.0.1');
  serverInstance = server;
  return `http://127.0.0.1:${port}`;
}

async function createWindow() {
  let targetUrl = 'http://localhost:3000';

  if (!isDev) {
    try {
      targetUrl = await startEmbeddedBackend();
    } catch (err) {
      dialog.showErrorBox('S2RFilm Studio Desktop — Startup Error', err.message || String(err));
      app.quit();
      return;
    }
  }

  const isMac = process.platform === 'darwin';
  const iconPath = isMac
    ? path.join(__dirname, '..', 'public', 'pwa-512x512.png')
    : path.join(__dirname, '..', 'public', 'icon.ico');

  mainWindow = new BrowserWindow({
    width: 1420,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'S2RFilm Studio Desktop',
    backgroundColor: '#09090b',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    trafficLightPosition: isMac ? { x: 14, y: 14 } : undefined,
    autoHideMenuBar: !isMac,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.loadURL(targetUrl);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createApplicationMenu();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (serverInstance && typeof serverInstance.close === 'function') {
    serverInstance.close();
  }
});
"""

ELECTRON_PRELOAD_CJS = """const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('s2rDesktop', {
  isElectron: true,
  platform: process.platform,
  appName: 'S2RFilm Studio Desktop',
  version: '1.0.0'
});
"""

MAC_INFO_PLIST = """<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDisplayName</key>
  <string>S2RFilm Studio Desktop</string>
  <key>CFBundleExecutable</key>
  <string>S2RFilm-Studio</string>
  <key>CFBundleIconFile</key>
  <string>icon.png</string>
  <key>CFBundleIdentifier</key>
  <string>com.s2rfilm.studio.desktop</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>CFBundleName</key>
  <string>S2RFilm Studio Desktop</string>
  <key>CFBundlePackageType</key>
  <string>APPL</string>
  <key>CFBundleShortVersionString</key>
  <string>1.0.0</string>
  <key>CFBundleVersion</key>
  <string>1</string>
  <key>LSMinimumSystemVersion</key>
  <string>11.0</string>
  <key>NSHighResolutionCapable</key>
  <true/>
</dict>
</plist>
"""

MAC_APP_EXECUTABLE = """#!/bin/bash
# Native macOS .app Launcher for S2RFilm Studio Desktop
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RESOURCES_APP="$(cd "$SCRIPT_DIR/../Resources/app" 2>/dev/null && pwd)"
APP_BUNDLE="$(cd "$SCRIPT_DIR/../../.." && pwd)"
PARENT_ROOT="$(cd "$APP_BUNDLE/../.." && pwd)"

# Find Node.js across standard macOS, Homebrew, nvm, volta, and fnm paths
export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.volta/bin:$HOME/.fnm/current/bin:$PATH"
if ! command -v node >/dev/null 2>&1 && [ -d "$HOME/.nvm/versions/node" ]; then
  LATEST_NVM="$(ls -1d "$HOME/.nvm/versions/node"/v* 2>/dev/null | sort -V | tail -n 1)"
  [ -n "$LATEST_NVM" ] && export PATH="$LATEST_NVM/bin:$PATH"
fi

if ! command -v node >/dev/null 2>&1; then
  osascript -e 'display alert "Node.js 18+ Required" message "Please install Node.js (LTS) from https://nodejs.org/ to launch S2RFilm Studio Desktop." as critical'
  exit 1
fi

# Locate project root (prefer self-contained bundle inside .app/Contents/Resources/app)
PROJECT_ROOT=""
for CANDIDATE in \\
  "$RESOURCES_APP" \\
  "$PARENT_ROOT" \\
  "$HOME/Downloads/s2rfilm-studio-mac" \\
  "$HOME/Downloads/s2rfilm-studio-desktop" \\
  "$HOME/Desktop/s2rfilm-studio-mac" \\
  "$HOME/Desktop/s2rfilm-studio-desktop" \\
  "$HOME/Applications/s2rfilm-studio-desktop"; do
  if [ -n "$CANDIDATE" ] && [ -f "$CANDIDATE/dist-electron/server.cjs" -o -f "$CANDIDATE/package.json" ]; then
    PROJECT_ROOT="$CANDIDATE"
    break
  fi
done

if [ -z "$PROJECT_ROOT" ]; then
  osascript -e 'display alert "App Files Missing" message "Could not locate S2RFilm Studio Desktop files. Keep the app inside its unzipped folder or run Install-To-Applications.command." as critical'
  exit 1
fi

cd "$PROJECT_ROOT" || exit 1

# If Electron is installed locally, prefer native Electron window
if [ -x "node_modules/.bin/electron" ] && [ -f "dist-electron/server.cjs" ]; then
  exec ./node_modules/.bin/electron .
fi

PORT=3480
LOG_FILE="/tmp/s2rfilm-studio-desktop.log"

open_app_window() {
  local url="http://127.0.0.1:$PORT"
  if [ -d "/Applications/Google Chrome.app" ]; then
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --app="$url" --new-window >/dev/null 2>&1 &
  elif [ -d "/Applications/Microsoft Edge.app" ]; then
    "/Applications/Microsoft Edge.app/Contents/Microsoft Edge" --app="$url" --new-window >/dev/null 2>&1 &
  elif [ -d "/Applications/Brave Browser.app" ]; then
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser" --app="$url" --new-window >/dev/null 2>&1 &
  else
    open "$url"
  fi
}

# Reuse existing instance if already listening
if curl -sf "http://127.0.0.1:$PORT/api/health" >/dev/null 2>&1; then
  open_app_window
  exit 0
fi

# Start fast zero-dependency bundled server if pre-built (boots in ~0.2s)
if [ -f "dist-electron/server.cjs" ] && [ -d "dist" ]; then
  NODE_ENV=production PORT=$PORT S2R_APP_ROOT="$PROJECT_ROOT" S2R_DIST_DIR="$PROJECT_ROOT/dist" \\
    node dist-electron/server.cjs > "$LOG_FILE" 2>&1 &
  SERVER_PID=$!
else
  if [ ! -d "node_modules" ]; then
    osascript -e 'display notification "Installing dependencies on first launch..." with title "S2RFilm Studio Desktop"'
    npm install > "$LOG_FILE" 2>&1
  fi
  PORT=$PORT npm run dev >> "$LOG_FILE" 2>&1 &
  SERVER_PID=$!
fi

# Wait up to 25 seconds for health endpoint to actually respond before opening browser
READY=0
for i in $(seq 1 100); do
  if curl -sf "http://127.0.0.1:$PORT/api/health" >/dev/null 2>&1; then
    READY=1
    break
  fi
  if ! kill -0 $SERVER_PID 2>/dev/null; then
    break
  fi
  sleep 0.25
done

if [ "$READY" -ne 1 ]; then
  ERR_MSG="$(tail -n 8 "$LOG_FILE" 2>/dev/null | tr '"' "'")"
  osascript -e "display alert \\"Failed to Start Local Studio Server\\" message \\"Could not connect on http://127.0.0.1:$PORT.\\n\\n$ERR_MSG\\" as critical"
  exit 1
fi

open_app_window
wait $SERVER_PID
"""

MAC_INSTALL_COMMAND = """#!/bin/bash
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$DIR/.." && pwd)"

echo "=================================================="
echo "  S2RFilm Studio Desktop — macOS Standalone Setup"
echo "=================================================="
echo ""

export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.volta/bin:$PATH"
if ! command -v node >/dev/null 2>&1 && [ -d "$HOME/.nvm/versions/node" ]; then
  LATEST_NVM="$(ls -1d "$HOME/.nvm/versions/node"/v* 2>/dev/null | sort -V | tail -n 1)"
  [ -n "$LATEST_NVM" ] && export PATH="$LATEST_NVM/bin:$PATH"
fi

if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org/"
  read -p "Press Enter to exit..."
  exit 1
fi

cd "$PROJECT_ROOT"
if [ ! -f "dist-electron/server.cjs" ] || [ ! -d "dist" ]; then
  echo "📦 Installing desktop dependencies & building bundle..."
  npm install
  npm run build
fi

echo "📲 Installing self-contained S2RFilm Studio Desktop.app into ~/Applications..."
DEST_DIR="$HOME/Applications/S2RFilm Studio Desktop.app"
mkdir -p "$HOME/Applications"
rm -rf "$DEST_DIR"
cp -R "$DIR/S2RFilm Studio Desktop.app" "$DEST_DIR"
xattr -dr com.apple.quarantine "$DEST_DIR" 2>/dev/null || true
chmod +x "$DEST_DIR/Contents/MacOS/S2RFilm-Studio"

echo ""
echo "✅ Installed to: $DEST_DIR"
echo "🚀 Launching S2RFilm Studio Desktop..."
open "$DEST_DIR"
"""

MAC_BUILD_DMG_COMMAND = """#!/bin/bash
set -e
DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$DIR/.." && pwd)"

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"
cd "$PROJECT_ROOT"

echo "📦 Installing Electron & dependencies..."
npm install

echo "🎬 Building native macOS .dmg and .app (Apple Silicon & Intel)..."
npm run build:mac

echo ""
echo "✅ Native macOS installers created in: $PROJECT_ROOT/release-builds"
open "$PROJECT_ROOT/release-builds"
"""

WIN_LAUNCHER_BAT = """@echo off
setlocal EnableDelayedExpansion
title S2RFilm Studio Desktop
cd /d "%~dp0.."
set "APP_ROOT=%CD%"
set "PORT=3480"
set "URL=http://127.0.0.1:%PORT%"
set "LOG_FILE=%TEMP%\\s2rfilm-studio-desktop.log"

where node >nul 2>nul
if %errorlevel% neq 0 (
  powershell -NoProfile -Command "Add-Type -AssemblyName PresentationFramework; [System.Windows.MessageBox]::Show('Node.js 18+ is required to run S2RFilm Studio Desktop. Download LTS from https://nodejs.org/', 'S2RFilm Studio Desktop', 'OK', 'Error')"
  exit /b 1
)

rem If Electron binary is already installed, prefer native Electron window
if exist "node_modules\\.bin\\electron.cmd" (
  if exist "dist-electron\\server.cjs" (
    start "" /b cmd /c "node_modules\\.bin\\electron.cmd ."
    exit /b 0
  )
)

rem Check if server is already listening on 127.0.0.1:3480
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r = Invoke-WebRequest -UseBasicParsing -Uri '%URL%/api/health' -TimeoutSec 1; if ($r.StatusCode -eq 200) { exit 0 } } catch { exit 1 }"
if %errorlevel% equ 0 goto :open_browser

rem Fast instant launch via pre-built zero-dependency server.cjs (requires only Node.js)
if exist "dist-electron\\server.cjs" (
  if exist "dist\\index.html" (
    start "S2RFilm-Backend" /b cmd /c "set NODE_ENV=production&& set PORT=%PORT%&& set S2R_APP_ROOT=%APP_ROOT%&& set S2R_DIST_DIR=%APP_ROOT%\\dist&& node dist-electron\\server.cjs > \"%LOG_FILE%\" 2>&1"
    goto :wait_ready
  )
)

rem Fallback: install dependencies if missing and launch tsx dev server
if not exist "node_modules" (
  echo [SETUP] Installing dependencies on first run...
  call npm install > "%LOG_FILE%" 2>&1
)
start "S2RFilm-Backend" /min cmd /c "set PORT=%PORT%&& npm run dev >> \"%LOG_FILE%\" 2>&1"

:wait_ready
echo Waiting for S2RFilm Studio server on %URL% ...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ok=$false; for($i=0; $i -lt 80; $i++){ try { $r = Invoke-WebRequest -UseBasicParsing -Uri '%URL%/api/health' -TimeoutSec 1; if ($r.StatusCode -eq 200) { $ok=$true; break } } catch {}; Start-Sleep -Milliseconds 250 }; if(-not $ok){ exit 1 }"
if %errorlevel% neq 0 (
  powershell -NoProfile -Command "Add-Type -AssemblyName PresentationFramework; $err = if (Test-Path '%LOG_FILE%') { (Get-Content '%LOG_FILE%' -Tail 10) -join \"`n\" } else { 'No log available.' }; [System.Windows.MessageBox]::Show(\"Server failed to start on %URL%.`n`n\" + $err, 'S2RFilm Studio Desktop Error', 'OK', 'Error')"
  exit /b 1
)

:open_browser
where msedge >nul 2>nul
if %errorlevel% equ 0 (
  start "" msedge --app=%URL%
  exit /b 0
)

if exist "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" (
  start "" "%ProgramFiles(x86)%\\Microsoft\\Edge\\Application\\msedge.exe" --app=%URL%
  exit /b 0
)

if exist "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" (
  start "" "%ProgramFiles%\\Microsoft\\Edge\\Application\\msedge.exe" --app=%URL%
  exit /b 0
)

if exist "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" (
  start "" "%ProgramFiles%\\Google\\Chrome\\Application\\chrome.exe" --app=%URL%
  exit /b 0
)

start "" %URL%
exit /b 0
"""

WIN_SILENT_VBS = """' Silent Windows Desktop Launcher (Zero Console Window)
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
winDir = fso.GetParentFolderName(WScript.ScriptFullName)
batPath = fso.BuildPath(winDir, "Launch-S2RFilm-Studio.bat")
WshShell.Run Chr(34) & batPath & Chr(34), 0, False
"""

WIN_INSTALL_SHORTCUT_BAT = """@echo off
setlocal
cd /d "%~dp0.."
set "PROJECT_ROOT=%CD%"
set "VBS_PATH=%PROJECT_ROOT%\\windows\\Launch-S2RFilm-Studio.vbs"
set "ICON_PATH=%PROJECT_ROOT%\\public\\icon.ico"

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

if not exist "dist-electron\\server.cjs" (
  echo [1/2] Installing dependencies and building desktop bundle...
  call npm install
  call npm run build
)

echo [2/2] Creating Windows Desktop and Start Menu shortcuts...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $desktop = [Environment]::GetFolderPath('Desktop'); $s = $ws.CreateShortcut((Join-Path $desktop 'S2RFilm Studio Desktop.lnk')); $s.TargetPath = 'wscript.exe'; $s.Arguments = '\"%VBS_PATH%\"'; $s.WorkingDirectory = '%PROJECT_ROOT%'; $s.IconLocation = '%ICON_PATH%'; $s.Description = 'S2RFilm Studio Desktop - Screenplay Reviewer'; $s.Save(); $startMenu = Join-Path $env:APPDATA 'Microsoft\\Windows\\Start Menu\\Programs'; $sm = $ws.CreateShortcut((Join-Path $startMenu 'S2RFilm Studio Desktop.lnk')); $sm.TargetPath = 'wscript.exe'; $sm.Arguments = '\"%VBS_PATH%\"'; $sm.WorkingDirectory = '%PROJECT_ROOT%'; $sm.IconLocation = '%ICON_PATH%'; $sm.Save()"

echo.
echo [SUCCESS] Shortcut placed on your Desktop: S2RFilm Studio Desktop
echo Launching now...
wscript.exe "%VBS_PATH%"
"""

WIN_BUILD_EXE_BAT = """@echo off
setlocal
cd /d "%~dp0.."

echo ====================================================
echo   Building Native Windows .EXE Installer & Portable
echo ====================================================
echo.

call npm install
if %errorlevel% neq 0 exit /b %errorlevel%

call npm run build:win
if %errorlevel% neq 0 exit /b %errorlevel%

echo.
echo [SUCCESS] Windows installers generated in release-builds\\
explorer release-builds
"""

GITHUB_WORKFLOW_YML = """name: Build S2RFilm Studio Desktop (Mac & Windows)

on:
  workflow_dispatch:
  push:
    tags:
      - 'v*'

jobs:
  build-mac:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run build:mac
      - uses: actions/upload-artifact@v4
        with:
          name: S2RFilm-Studio-Desktop-macOS
          path: release-builds/*.dmg

  build-windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run build:win
      - uses: actions/upload-artifact@v4
        with:
          name: S2RFilm-Studio-Desktop-Windows
          path: release-builds/*.exe
"""

STANDALONE_README = """# S2RFilm Studio Desktop — Standalone Edition (macOS & Windows)

A standalone, monochrome desktop edition of **S2RFilm Screenplay Reviewer & Hollywood Coverage Studio** built with **Electron + Embedded Express + React 19**.

Pre-bundled with zero-dependency `dist/` and `dist-electron/server.cjs` so it boots instantaneously using Node.js alone (no `npm install` required for quick desktop launch).

---

## Quick Launch (Zero Build Required — Boots in <0.3s)

### macOS
1. Open the `mac/` folder.
2. Double-click **`S2RFilm Studio Desktop.app`** directly (or run **`Install-To-Applications.command`** to install it into `~/Applications` and clear macOS quarantine flags).

### Windows
1. Open the `windows/` folder.
2. Double-click **`Install-Desktop-Shortcut.bat`** (creates a native **`S2RFilm Studio Desktop`** icon on your Desktop and Start Menu) or launch **`Launch-S2RFilm-Studio.vbs`** directly.

---

## Building Native `.dmg` (Mac) and `.exe` (Windows) Distributables

To compile single-file installers (`.dmg` for macOS or NSIS Setup `.exe` / Portable `.exe` for Windows) that bundle Electron + Node.js internally:

### Build on macOS
```bash
npm install
npm run build:mac
```
*(Or double-click `mac/Build-Mac-App.command`)*

### Build on Windows
```bat
npm install
npm run build:win
```
*(Or double-click `windows\\Build-Windows-EXE.bat`)*
"""

def transform_server_ts(src_code: str) -> str:
    """Adapts server.ts so it exports startStandaloneServer() for Electron while still supporting CLI execution."""
    src_code = src_code.replace(
        "import { fileURLToPath } from 'url';\n",
        ""
    ).replace(
        "const __filename = fileURLToPath(import.meta.url);\nconst __dirname = path.dirname(__filename);",
        "const __appDir = process.env.S2R_APP_ROOT || process.cwd();"
    ).replace(
        "const PORT = parseInt(process.env.PORT || '3000', 10);",
        "const PORT = parseInt((process.env.PORT || '3000').trim(), 10);"
    ).replace("__dirname", "__appDir")

    marker = "// Setup Vite middleware in dev or static files in production"
    idx = src_code.find(marker)
    if idx == -1:
        return src_code

    new_tail = """// Setup Vite middleware in dev or static files in production
export async function startStandaloneServer(
  customPort?: number,
  host: string = '127.0.0.1'
): Promise<{ server: import('http').Server; port: number }> {
  const isProd = process.env.NODE_ENV === 'production' || process.env.S2R_STANDALONE === '1';

  if (isProd) {
    const distDir = process.env.S2R_DIST_DIR || path.join(__appDir, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  const listenPort = typeof customPort === 'number' ? customPort : PORT;

  return new Promise((resolve, reject) => {
    const server = app.listen(listenPort, host, () => {
      const addr = server.address();
      const activePort = typeof addr === 'object' && addr ? addr.port : listenPort;
      console.log(`🎬 S2RFilm Studio Desktop server listening on http://${host}:${activePort}`);
      resolve({ server, port: activePort });
    });
    server.on('error', reject);
  });
}

// Auto-start when executed directly via CLI (tsx server.ts / node server.cjs)
if (process.env.S2R_STANDALONE !== '1') {
  startStandaloneServer(PORT, '127.0.0.1').catch(err => {
    console.error('Failed to start server:', err);
  });
}
"""
    return src_code[:idx] + new_tail

def transform_app_tsx(src_code: str) -> str:
    return src_code.replace(
        "const [showDownloadBanner, setShowDownloadBanner] = useState<boolean>(true);",
        "const [showDownloadBanner, setShowDownloadBanner] = useState<boolean>(false);"
    )

def transform_header_tsx(src_code: str) -> str:
    return src_code.replace("S2RFilm Reviewer", "S2RFilm Desktop")

def transform_index_html(html_code: str) -> str:
    return html_code.replace(
        "<title>S2RFilm Screenplay Reviewer — Professional Script Coverage & Dramaturgy</title>",
        "<title>S2RFilm Studio Desktop — Standalone Screenplay Reviewer</title>"
    )

def zip_directory(source_dir: str, zip_path: str, root_folder_name: str, extra_filter=None):
    if os.path.exists(zip_path):
        os.remove(zip_path)
    count = 0
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(source_dir):
            dirs[:] = [d for d in dirs if d not in ('node_modules', 'release-builds', '__pycache__')]
            for file in files:
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, source_dir)
                if extra_filter and not extra_filter(rel_path):
                    continue
                arcname = os.path.join(root_folder_name, rel_path)
                zinfo = zipfile.ZipInfo.from_file(full_path, arcname)
                if (
                    file.endswith('.command')
                    or file.endswith('.sh')
                    or 'Contents/MacOS/' in rel_path.replace(os.sep, '/')
                ):
                    zinfo.external_attr = (0o100755 << 16)
                with open(full_path, 'rb') as f:
                    zf.writestr(zinfo, f.read(), compress_type=zipfile.ZIP_DEFLATED)
                count += 1
    return count

def build_standalone_duplicate():
    if os.path.exists(STANDALONE_DIR):
        shutil.rmtree(STANDALONE_DIR)
    os.makedirs(STANDALONE_DIR, exist_ok=True)
    os.makedirs(PUBLIC_DIR, exist_ok=True)

    # 1. Copy src/ cleanly and adapt for standalone desktop
    shutil.copytree(os.path.join(WORKSPACE_ROOT, 'src'), os.path.join(STANDALONE_DIR, 'src'))

    app_tsx_path = os.path.join(STANDALONE_DIR, 'src', 'App.tsx')
    with open(app_tsx_path, 'r', encoding='utf-8') as f:
        write_text(app_tsx_path, transform_app_tsx(f.read()))

    header_tsx_path = os.path.join(STANDALONE_DIR, 'src', 'components', 'Header.tsx')
    with open(header_tsx_path, 'r', encoding='utf-8') as f:
        write_text(header_tsx_path, transform_header_tsx(f.read()))

    # 2. Copy and transform server.ts, index.html, config files
    with open(os.path.join(WORKSPACE_ROOT, 'server.ts'), 'r', encoding='utf-8') as f:
        write_text(os.path.join(STANDALONE_DIR, 'server.ts'), transform_server_ts(f.read()))

    with open(os.path.join(WORKSPACE_ROOT, 'index.html'), 'r', encoding='utf-8') as f:
        write_text(os.path.join(STANDALONE_DIR, 'index.html'), transform_index_html(f.read()))

    for fname in ['tsconfig.json', 'vite.config.ts', '.env.example', '.gitignore']:
        src_file = os.path.join(WORKSPACE_ROOT, fname)
        if os.path.exists(src_file):
            shutil.copy2(src_file, os.path.join(STANDALONE_DIR, fname))

    metadata = {
        "name": "S2RFilm Studio Desktop",
        "description": "Standalone Mac & Windows Desktop Edition of S2RFilm Screenplay Reviewer & Dramaturgy Studio.",
        "requestFramePermissions": [],
        "majorCapabilities": ["MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API"]
    }
    write_text(os.path.join(STANDALONE_DIR, 'metadata.json'), json.dumps(metadata, indent=2) + "\n")

    # 3. Copy monochrome icons
    standalone_pub = os.path.join(STANDALONE_DIR, 'public')
    os.makedirs(standalone_pub, exist_ok=True)
    for icon_name in ['icon.svg', 'pwa-512x512.png', 'apple-touch-icon.png', 'icon.ico']:
        src_icon = os.path.join(PUBLIC_DIR, icon_name)
        if os.path.exists(src_icon):
            shutil.copy2(src_icon, os.path.join(standalone_pub, icon_name))

    # 4. Write Electron & packaging manifests
    write_text(os.path.join(STANDALONE_DIR, 'package.json'), create_standalone_package_json())
    write_text(os.path.join(STANDALONE_DIR, 'electron-builder.json'), ELECTRON_BUILDER_JSON)
    write_text(os.path.join(STANDALONE_DIR, 'electron', 'main.cjs'), ELECTRON_MAIN_CJS)
    write_text(os.path.join(STANDALONE_DIR, 'electron', 'preload.cjs'), ELECTRON_PRELOAD_CJS)
    write_text(os.path.join(STANDALONE_DIR, 'README.md'), STANDALONE_README)
    write_text(os.path.join(STANDALONE_DIR, '.github', 'workflows', 'build-desktop.yml'), GITHUB_WORKFLOW_YML)

    # 5. Pre-compile standalone frontend (dist/) and self-contained backend (dist-electron/server.cjs)
    print("🔨 Pre-building standalone Vite SPA (dist/) and self-contained Express server (dist-electron/server.cjs)...")
    subprocess.run(
        [
            'npx', 'vite', 'build', STANDALONE_DIR,
            '--config', os.path.join(STANDALONE_DIR, 'vite.config.ts'),
            '--outDir', os.path.join(STANDALONE_DIR, 'dist'),
            '--emptyOutDir'
        ],
        cwd=WORKSPACE_ROOT,
        check=True
    )
    subprocess.run(
        [
            'npx', 'esbuild', os.path.join(STANDALONE_DIR, 'server.ts'),
            '--bundle', '--platform=node', '--format=cjs',
            f'--outfile={os.path.join(STANDALONE_DIR, "dist-electron", "server.cjs")}',
            '--external:vite'
        ],
        cwd=WORKSPACE_ROOT,
        check=True
    )

    # 6. Write macOS standalone .app bundle & embed self-contained app inside Contents/Resources/app/
    mac_app_contents = os.path.join(STANDALONE_DIR, 'mac', 'S2RFilm Studio Desktop.app', 'Contents')
    write_text(os.path.join(mac_app_contents, 'Info.plist'), MAC_INFO_PLIST)
    write_text(os.path.join(mac_app_contents, 'MacOS', 'S2RFilm-Studio'), MAC_APP_EXECUTABLE, executable=True)
    mac_res = os.path.join(mac_app_contents, 'Resources')
    os.makedirs(mac_res, exist_ok=True)
    if os.path.exists(os.path.join(PUBLIC_DIR, 'pwa-512x512.png')):
        shutil.copy2(os.path.join(PUBLIC_DIR, 'pwa-512x512.png'), os.path.join(mac_res, 'icon.png'))

    # Embed pre-built dist + dist-electron directly inside .app so dragging .app anywhere still works!
    mac_embedded_app = os.path.join(mac_res, 'app')
    os.makedirs(mac_embedded_app, exist_ok=True)
    shutil.copytree(os.path.join(STANDALONE_DIR, 'dist'), os.path.join(mac_embedded_app, 'dist'))
    shutil.copytree(os.path.join(STANDALONE_DIR, 'dist-electron'), os.path.join(mac_embedded_app, 'dist-electron'))
    shutil.copy2(os.path.join(STANDALONE_DIR, 'package.json'), os.path.join(mac_embedded_app, 'package.json'))

    write_text(os.path.join(STANDALONE_DIR, 'mac', 'Install-To-Applications.command'), MAC_INSTALL_COMMAND, executable=True)
    write_text(os.path.join(STANDALONE_DIR, 'mac', 'Build-Mac-App.command'), MAC_BUILD_DMG_COMMAND, executable=True)

    # 7. Write Windows standalone launchers
    write_text(os.path.join(STANDALONE_DIR, 'windows', 'Launch-S2RFilm-Studio.bat'), WIN_LAUNCHER_BAT)
    write_text(os.path.join(STANDALONE_DIR, 'windows', 'Launch-S2RFilm-Studio.vbs'), WIN_SILENT_VBS)
    write_text(os.path.join(STANDALONE_DIR, 'windows', 'Install-Desktop-Shortcut.bat'), WIN_INSTALL_SHORTCUT_BAT)
    write_text(os.path.join(STANDALONE_DIR, 'windows', 'Build-Windows-EXE.bat'), WIN_BUILD_EXE_BAT)

    # 8. Package into public/ downloadable zips
    all_zip = os.path.join(PUBLIC_DIR, 's2rfilm-studio-desktop.zip')
    c_all = zip_directory(STANDALONE_DIR, all_zip, 's2rfilm-studio-desktop')

    mac_zip = os.path.join(PUBLIC_DIR, 's2rfilm-studio-mac.zip')
    c_mac = zip_directory(
        STANDALONE_DIR,
        mac_zip,
        's2rfilm-studio-mac',
        extra_filter=lambda p: not p.replace(os.sep, '/').startswith('windows/')
    )

    win_zip = os.path.join(PUBLIC_DIR, 's2rfilm-studio-windows.zip')
    c_win = zip_directory(
        STANDALONE_DIR,
        win_zip,
        's2rfilm-studio-windows',
        extra_filter=lambda p: not p.replace(os.sep, '/').startswith('mac/')
    )

    print(f"✅ Duplicated standalone app created at: {STANDALONE_DIR}")
    print(f"📦 Combined Mac + Win Zip: {all_zip} ({c_all} files, {os.path.getsize(all_zip)/1024:.1f} KB)")
    print(f"🍏 macOS Standalone Zip:   {mac_zip} ({c_mac} files, {os.path.getsize(mac_zip)/1024:.1f} KB)")
    print(f"🪟 Windows Standalone Zip: {win_zip} ({c_win} files, {os.path.getsize(win_zip)/1024:.1f} KB)")

if __name__ == '__main__':
    build_standalone_duplicate()
