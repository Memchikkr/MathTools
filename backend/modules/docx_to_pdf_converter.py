from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
import io
from services.docx_to_pdf_converter import convert_docx_to_pdf

router = APIRouter(prefix="", tags=["Конвертер документов в PDF"])


@router.post("/docx-to-pdf-converter")
async def convert_docx_to_pdf_endpoint(
    file: UploadFile = File(..., description="Word документы (.docx) для конвертации")
):
    """
    Конвертирует один или несколько файлов .docx в PDF.
    Порядок файлов в ответе соответствует порядку загрузки.
    """

    try:
        content = await file.read()
        pdf_bytes, new_filename = convert_docx_to_pdf(content, file.filename)
        response = StreamingResponse(
            io.BytesIO(pdf_bytes), media_type="application/pdf"
        )
        response.headers["Content-Disposition"] = f"attachment; filename={new_filename}"
        return response
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
