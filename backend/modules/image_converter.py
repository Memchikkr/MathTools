from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from typing import List
from services.image_converter import process_images, SUPPORTED_OUTPUT
import io

router = APIRouter(prefix="", tags=["Конвертер изображений"])


@router.post("/image-converter")
async def convert_images(
    files: List[UploadFile] = File(..., description="Загружаемые изображения"),
    target_format: str = Form(
        ..., description=f"Целевой формат: {', '.join(SUPPORTED_OUTPUT)}"
    ),
    quality: int = Form(95, ge=1, le=100, description="Качество для JPEG/WebP (1-100)"),
    background_color: str = Form(
        "white",
        description="Цвет фона для RGBA -> RGB (white/black/red/... или #RRGGBB)",
    ),
):
    """
    Конвертирует несколько изображений в указанный формат и возвращает ZIP-архив.
    Исходные имена сохраняются (меняется расширение), порядок файлов сохраняется.
    """
    try:
        # Проверка целевого формата
        target_format = target_format.lower()
        if target_format not in SUPPORTED_OUTPUT:
            raise HTTPException(
                status_code=422,
                detail=f"Неподдерживаемый формат. Допустимые: {', '.join(SUPPORTED_OUTPUT)}",
            )

        # Читаем все файлы в память (для небольших объёмов — приемлемо)
        file_data = []
        for file in files:
            if file.content_type in {"image/jpeg", "image/png", "image/webp"}:
                content = await file.read()
                file_data.append((content, file.filename))
        # Обрабатываем
        zip_bytes = process_images(file_data, target_format, quality, background_color)
        # Возвращаем ZIP-архив
        zip_filename = f"converted_{target_format}.zip"
        response = StreamingResponse(
            io.BytesIO(zip_bytes), media_type="application/zip"
        )
        response.headers["Content-Disposition"] = f"attachment; filename={zip_filename}"

        return response
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e),
        )
