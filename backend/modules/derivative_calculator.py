from fastapi import APIRouter, HTTPException
from schemas.derivative_calculator import DerivativeRequest, DerivativeResponse
from services.derivative_calculator import compute_derivative

router = APIRouter(prefix="", tags=["Калькулятор производных"])


@router.post("/derivative-calculate", response_model=DerivativeResponse)
async def calculate_derivative(request: DerivativeRequest):
    try:
        result, latex_result = compute_derivative(
            request.expression, request.variable, request.order
        )
        return DerivativeResponse(
            expression=request.expression, result=result, result_latex=latex_result
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
