from fastapi import APIRouter, HTTPException

from schemas.slae import SlaeRequest, SlaeResponse
from services.slae import solve

router = APIRouter(prefix="", tags=["Решатель СЛАУ"])


@router.post("/slae-solve", response_model=SlaeResponse)
async def slae_solve(request: SlaeRequest):
    """Решение СЛАУ Ax = b методами Гаусса / LU / Якоби / Зейделя."""
    try:
        return solve(
            request.matrix_a,
            request.vector_b,
            request.method,
            request.tolerance,
            request.max_iterations,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
