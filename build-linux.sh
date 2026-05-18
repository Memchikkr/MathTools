#!/usr/bin/env bash
# build-linux.sh — сборка portable AppImage (аналог build.ps1 для Linux)
#
# Предполагается, что в системе уже есть:
#   - Python 3.11+ и Poetry (poetry в PATH)
#   - Rust + cargo, cargo-tauri (cargo install tauri-cli --version "^2")
#   - Node.js + npm
#   - системные пакеты Tauri/AppImage (см. README/инструкцию по WSL)
# Запускать на Linux (Ubuntu 22.04 рекомендуется ради старой glibc).

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Триплет берём из rustc, чтобы имя сайдкара совпало с хостом (x86_64/aarch64)
TARGET_TRIPLE="$(rustc -Vv | sed -n 's/^host: //p')"

echo -e "\033[36m=== 1. Building backend ===\033[0m"
cd "$ROOT/backend"
poetry install
poetry run pyinstaller main.py --onefile --name math-tools-backend \
    --hidden-import=uvicorn.lifespan.on \
    --hidden-import=uvicorn.lifespan.off \
    --hidden-import=uvicorn.protocols.http.auto \
    --hidden-import=uvicorn.protocols.websockets.auto \
    --hidden-import=uvicorn.loops.auto
cd "$ROOT"

echo -e "\033[36m=== 2. Copying backend to src-tauri ===\033[0m"
cp -f "$ROOT/backend/dist/math-tools-backend" \
      "$ROOT/src-tauri/math-tools-backend-${TARGET_TRIPLE}"
chmod +x "$ROOT/src-tauri/math-tools-backend-${TARGET_TRIPLE}"

echo -e "\033[36m=== 3. Installing frontend deps ===\033[0m"
cd "$ROOT/frontend"
npm install
cd "$ROOT"

echo -e "\033[36m=== 4. Building Tauri AppImage ===\033[0m"
cd "$ROOT/src-tauri"
cargo tauri build --bundles appimage
cd "$ROOT"

echo -e "\033[32m=== Done! ===\033[0m"
echo "AppImage: $ROOT/src-tauri/target/release/bundle/appimage/"
