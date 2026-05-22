from fastapi import APIRouter, HTTPException

from schemas.ode import OdeRequest, OdeResponse
from services.ode import solve_ode

router = APIRouter(prefix="", tags=["Решатель ОДУ"])


@router.post("/ode-solve", response_model=OdeResponse)
async def ode_solve(request: OdeRequest):
    """Решает y' = f(x, y), y(x_min) = y0 явным Эйлером и РК4."""
    try:
        return solve_ode(
            request.expression,
            request.x_min,
            request.x_max,
            request.y0,
            request.steps,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
