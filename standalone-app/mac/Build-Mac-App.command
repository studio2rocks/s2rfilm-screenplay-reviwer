#!/bin/bash
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
