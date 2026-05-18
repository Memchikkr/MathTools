# build.ps1
$ErrorActionPreference = "Stop"  # останавливаться при любой ошибке

$ROOT = $PSScriptRoot
$VENV_ACTIVATE = "$ROOT\backend\.venv\Scripts\Activate.ps1"
$TARGET_TRIPLE = "x86_64-pc-windows-msvc"

Write-Host "=== 1. Building backend ===" -ForegroundColor Cyan
& $VENV_ACTIVATE
Set-Location "$ROOT\backend"
pyinstaller main.py --onefile --name math-tools-backend `
    --hidden-import=uvicorn.lifespan.on `
    --hidden-import=uvicorn.lifespan.off `
    --hidden-import=uvicorn.protocols.http.auto `
    --hidden-import=uvicorn.protocols.websockets.auto `
    --hidden-import=uvicorn.loops.auto
deactivate
Set-Location $ROOT

Write-Host "=== 2. Copying backend to src-tauri ===" -ForegroundColor Cyan
Copy-Item "$ROOT\backend\dist\math-tools-backend.exe" `
          "$ROOT\src-tauri\math-tools-backend-$TARGET_TRIPLE.exe" `
          -Force

Write-Host "=== 3. Building Tauri app ===" -ForegroundColor Cyan
Set-Location "$ROOT\src-tauri"
cargo tauri build
Set-Location $ROOT

Write-Host "=== Done! ===" -ForegroundColor Green
Write-Host "Installer: $ROOT\src-tauri\target\release\bundle\"