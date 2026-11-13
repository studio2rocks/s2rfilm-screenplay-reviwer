# S2RFilm Studio Desktop — Standalone Edition (macOS & Windows)

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
*(Or double-click `windows\Build-Windows-EXE.bat`)*
