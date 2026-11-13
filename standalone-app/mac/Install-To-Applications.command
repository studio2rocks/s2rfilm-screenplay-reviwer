#!/bin/bash
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
