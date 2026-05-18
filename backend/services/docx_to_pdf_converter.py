import os
from pathlib import Path
import docx2pdf
import tempfile


def convert_docx_to_pdf(input_data: bytes, original_filename: str) -> tuple[bytes, str]:
    """
    Конвертирует .docx файл (в виде байтов) в PDF, используя Microsoft Word.
    Возвращает (PDF_байты, новое_имя_файла).
    """
    if not original_filename.lower().endswith(".docx"):
        raise ValueError(
            f"Файл '{original_filename}' не является .docx документом. Поддерживается только формат .docx."
        )

    if not input_data:
        raise ValueError(f"Файл '{original_filename}' пуст.")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp_docx_file:
        tmp_docx_file.write(input_data)
        tmp_docx_path = tmp_docx_file.name

    try:
        # Создаем временный файл для PDF
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_pdf_file:
            tmp_pdf_path = tmp_pdf_file.name

        # docx2pdf конвертирует файл по указанному пути
        docx2pdf.convert(tmp_docx_path, tmp_pdf_path)

        # Читаем PDF и возвращаем байты
        pdf_bytes = Path(tmp_pdf_path).read_bytes()
        new_filename = Path(original_filename).stem + ".pdf"

        return pdf_bytes, new_filename
    except Exception as e:
        raise RuntimeError(
            f"Не удалось сконвертировать '{original_filename}'. Убедитесь, что Microsoft Word установлен. Ошибка: {str(e)}"
        )
    finally:
        # Удаляем временные файлы
        os.unlink(tmp_docx_path)
        if "tmp_pdf_path" in locals():
            os.unlink(tmp_pdf_path)
