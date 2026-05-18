from fastapi import APIRouter, HTTPException
from schemas.integral_calculator import IntegralRequest, IntegralResponse
from services.integral_calculator import compute_integral

router = APIRouter(prefix="", tags=["Калькулятор интегралов"])


@router.post("/integral-calculate", response_model=IntegralResponse)
async def calculate_integral(request: IntegralRequest):
    try:
        result, latex_result, numeric = compute_integral(
            request.expression,
            request.variable,
            request.lower_limit,
            request.upper_limit,
        )
        return IntegralResponse(
            expression=request.expression,
            result=result,
            result_latex=latex_result,
            numeric_value=numeric,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
