import sys
import os
from pathlib import Path


def _user_data_dir(app_name: str) -> Path:
    """Каталог пользовательских данных по соглашениям ОС."""
    if sys.platform == "win32":
        base = os.environ.get("APPDATA") or (Path.home() / "AppData" / "Roaming")
        return Path(base) / app_name
    if sys.platform == "darwin":
        return Path.home() / "Library" / "Application Support" / app_name
    base = os.environ.get("XDG_DATA_HOME") or (Path.home() / ".local" / "share")
    return Path(base) / app_name


if getattr(sys, "frozen", False):
    # PyInstaller — пишем в пользовательский каталог данных
    BASE_DIR = _user_data_dir("MathTools")
else:
    BASE_DIR = Path(__file__).parent.parent

# Создаём папку если не существует
BASE_DIR.mkdir(parents=True, exist_ok=True)

DB_PATH = BASE_DIR / "mathtools.db"
