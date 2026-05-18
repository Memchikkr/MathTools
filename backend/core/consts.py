import sys
import os
from pathlib import Path

if getattr(sys, "frozen", False):
    # PyInstaller — пишем в AppData пользователя
    BASE_DIR = Path(os.environ.get("APPDATA", Path.home())) / "MathTools"
else:
    BASE_DIR = Path(__file__).parent.parent

# Создаём папку если не существует
BASE_DIR.mkdir(parents=True, exist_ok=True)

DB_PATH = BASE_DIR / "mathtools.db"
