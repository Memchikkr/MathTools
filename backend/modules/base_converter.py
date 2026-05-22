from fastapi import APIRouter, HTTPException

from schemas.base_converter import BaseConvertRequest, BaseConvertResponse
from services.base_converter import convert

router = APIRouter(prefix="", tags=["Конвертер систем счисления"])


@router.post("/base-convert", response_model=BaseConvertResponse)
async def base_convert(request: BaseConvertRequest):
    """Перевод числа между системами счисления 2..36 с пошаговым выводом."""
    try:
        return convert(request.value, request.from_base, request.to_base)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
