import io
import img2pdf
from pathlib import Path
from typing import List, Tuple

SUPPORTED_INPUT = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tiff", ".ico"}


_PAGE_SIZES_MM = {
    "A4":     (210,   297),
    "A3":     (297,   420),
    "A5":     (148,   210),
    "B5":     (176,   250),
    "letter": (215.9, 279.4),
    "legal":  (215.9, 355.6),
}

_FIT_MODES = {
    "into":   img2pdf.FitMode.into,
    "fill":   img2pdf.FitMode.fill,
    "exact":  img2pdf.FitMode.exact,
    "shrink": img2pdf.FitMode.shrink,
}


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
            raise ValueError(f"{filename}: {str(e)}")

    if not prepared_images:
        raise ValueError(
            "Нет поддерживаемых изображений. "
            + ("; ".join(errors) if errors else "")
        )

    # Настройки img2pdf
    kwargs = {}
    if page_size != "auto":
        if page_size not in _PAGE_SIZES_MM:
            raise ValueError(f"Неизвестный размер страницы: {page_size}")
        if fit not in _FIT_MODES:
            raise ValueError(f"Неизвестный режим вписывания: {fit}")
        w_mm, h_mm = _PAGE_SIZES_MM[page_size]
        kwargs["layout_fun"] = img2pdf.get_layout_fun(
            pagesize=(img2pdf.mm_to_pt(w_mm), img2pdf.mm_to_pt(h_mm)),
            fit=_FIT_MODES[fit],
        )
    if rotation != 0:
        kwargs["rotation"] = rotation

    try:
        # Конвертируем все изображения в один PDF
        pdf_bytes = img2pdf.convert(prepared_images, **kwargs)
        return pdf_bytes
    except Exception as e:
        raise ValueError(f"Ошибка создания PDF: {str(e)}")
