import shutil
import subprocess
import sys
import tempfile
from pathlib import Path
from typing import Optional


def _find_libreoffice() -> Optional[str]:
    """Ищет исполняемый файл LibreOffice кроссплатформенно."""
    for name in ("soffice", "libreoffice"):
        found = shutil.which(name)
        if found:
            return found

    if sys.platform == "win32":
        candidates = [
            r"C:\Program Files\LibreOffice\program\soffice.exe",
            r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
        ]
    elif sys.platform == "darwin":
        candidates = ["/Applications/LibreOffice.app/Contents/MacOS/soffice"]
    else:
        candidates = ["/usr/bin/soffice", "/usr/local/bin/soffice"]

    for c in candidates:
        if Path(c).exists():
            return c
    return None


def _convert_with_word(docx_path: str, out_pdf_path: str) -> bool:
    """Конвертация через Microsoft Word (только Windows/macOS, если Word установлен)."""
    if sys.platform not in ("win32", "darwin"):
        return False
    try:
        import docx2pdf

        docx2pdf.convert(docx_path, out_pdf_path)
    except Exception:
        return False
    out = Path(out_pdf_path)
    return out.exists() and out.stat().st_size > 0


def _convert_with_libreoffice(docx_path: str, out_dir: str) -> Optional[str]:
    """Конвертация через LibreOffice headless (Windows/macOS/Linux)."""
    soffice = _find_libreoffice()
    if not soffice:
        return None

    # Отдельный профиль, чтобы конвертация работала даже при открытом LibreOffice
    profile_dir = Path(out_dir) / "lo_profile"
    try:
        subprocess.run(
            [
                soffice,
                f"-env:UserInstallation={profile_dir.as_uri()}",
                "--headless",
                "--convert-to",
                "pdf",
                "--outdir",
                out_dir,
                docx_path,
            ],
            check=True,
            capture_output=True,
            timeout=120,
        )
    except Exception:
        return None

    produced = Path(out_dir) / (Path(docx_path).stem + ".pdf")
    return str(produced) if produced.exists() else None


def convert_docx_to_pdf(input_data: bytes, original_filename: str) -> tuple[bytes, str]:
    """
    Конвертирует .docx (байты) в PDF.

    Движок выбирается автоматически:
    1. Microsoft Word (Windows/macOS, если установлен) — быстрее и точнее.
    2. LibreOffice headless (любая ОС, если установлен) — кроссплатформенно.
    3. Иначе — понятная ошибка с инструкцией.

    Возвращает (PDF_байты, новое_имя_файла).
    """
    if not original_filename.lower().endswith(".docx"):
        raise ValueError(
            f"Файл '{original_filename}' не является .docx документом. Поддерживается только формат .docx."
        )

    if not input_data:
        raise ValueError(f"Файл '{original_filename}' пуст.")

    tmp_dir = tempfile.mkdtemp()
    try:
        tmp_docx = Path(tmp_dir) / "input.docx"
        tmp_docx.write_bytes(input_data)
        tmp_pdf = Path(tmp_dir) / "input.pdf"

        if _convert_with_word(str(tmp_docx), str(tmp_pdf)):
            pdf_bytes = tmp_pdf.read_bytes()
        else:
            produced = _convert_with_libreoffice(str(tmp_docx), tmp_dir)
            if produced:
                pdf_bytes = Path(produced).read_bytes()
            else:
                raise RuntimeError(
                    f"Не удалось сконвертировать '{original_filename}'. "
                    "Установите Microsoft Word (Windows/macOS) или LibreOffice "
                    "(любая ОС, https://www.libreoffice.org/download/) и повторите."
                )

        new_filename = Path(original_filename).stem + ".pdf"
        return pdf_bytes, new_filename
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)
