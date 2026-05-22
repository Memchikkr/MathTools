from fastapi import APIRouter, HTTPException

from schemas.number_theory import NumberTheoryRequest, NumberTheoryResponse
from services.number_theory import compute

router = APIRouter(prefix="", tags=["Теория чисел"])


@router.post("/number-theory", response_model=NumberTheoryResponse)
async def number_theory(request: NumberTheoryRequest):
    """НОД, НОК, факторизация и проверка простоты."""
    try:
        return compute(request.numbers, request.operation)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
