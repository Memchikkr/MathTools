from fastapi import APIRouter, HTTPException
from services.calc import evaluate_expression
from schemas.calc import CalcRequest, CalcResponse

router = APIRouter(prefix="", tags=["Инженерный калькулятор"])


@router.post("/calculate", response_model=CalcResponse)
async def calculate(request: CalcRequest):
    """Вычисляет математическое выражение."""
    try:
        result = evaluate_expression(request.expression)
        return CalcResponse(expression=request.expression, result=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
