import io
import img2pdf
from pathlib import Path
from typing import List, Tuple

SUPPORTED_INPUT = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff", ".ico"}


def convert_images_to_pdf(
    files_data: List[Tuple[bytes, str]],
    page_size: str = "auto",
    fit: str = "into",
    rotation: int = 0,
) -> Tuple[bytes]:
    """
    Принимает список (байты, имя_файла), возвращает (байты_PDF, список_ошибок).
    Порядок страниц соответствует порядку в списке.
    """
    errors = []
    prepared_images = []

    for _, (data, filename) in enumerate(files_data):
        try:
            # Проверка расширения
            ext = Path(filename).suffix.lower()
            if ext not in SUPPORTED_INPUT:
                errors.append(f"{filename}: неподдерживаемый формат ({ext})")
                continue

            prepared_images.append(io.BytesIO(data))

        except Exception as e:
            raise Exception(f"{filename}: {str(e)}")

    if not prepared_images:
        return b""

    # Настройки img2pdf
    kwargs = {}
    if page_size != "auto":
        # img2pdf поддерживает стандартные размеры: "A4", "letter" и др.
        kwargs["layout_fun"] = img2pdf.get_layout_fun(pagesize=page_size, fit=fit)
    if rotation != 0:
        kwargs["rotation"] = rotation

    try:
        # Конвертируем все изображения в один PDF
        pdf_bytes = img2pdf.convert(prepared_images, **kwargs)
        return pdf_bytes
    except Exception as e:
        raise Exception(f"Ошибка создания PDF: {str(e)}")
