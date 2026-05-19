from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from typing import List, Optional
import io
from services.pdf_converter import convert_images_to_pdf

router = APIRouter(prefix="", tags=["Конвертер в PDF"])


@router.post("/pdf-converter")
async def convert_to_pdf(
    files: List[UploadFile] = File(
        ..., description="Изображения для объединения в PDF (порядок сохраняется)"
    ),
    page_size: Optional[str] = Form(
        "auto", description="Размер страницы: auto, A4, letter, A3 и др."
    ),
    fit: Optional[str] = Form(
        "into", description="Режим вписывания: into, fill, shrink, exact"
    ),
    rotation: Optional[int] = Form(
        0, description="Поворот изображения: 0, 90, 180, 270"
    ),
):
    """
    Конвертирует список изображений в один PDF-файл.
    Порядок страниц соответствует порядку загрузки файлов.
    Поддерживаемые форматы: jpg, png, webp, bmp, tiff, ico.
    """
    try:
        # Проверяем, что файлы загружены
        if not files:
            raise HTTPException(status_code=422, detail="Не загружено ни одного файла")

        # Читаем все файлы
        file_data = []
        for file in files:
            content = await file.read()
            file_data.append((content, file.filename))

        # Конвертируем
        pdf_bytes = convert_images_to_pdf(file_data, page_size, fit, rotation)

        # Возвращаем PDF
        pdf_filename = "converted.pdf"
        response = StreamingResponse(
            io.BytesIO(pdf_bytes), media_type="application/pdf"
        )
        response.headers["Content-Disposition"] = f"attachment; filename={pdf_filename}"

        return response
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
