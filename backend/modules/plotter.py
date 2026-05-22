from fastapi import APIRouter, HTTPException

from schemas.plotter import PlotterRequest, PlotterResponse
from services.plotter import build_plot

router = APIRouter(prefix="", tags=["Плоттер функций"])


@router.post("/plotter", response_model=PlotterResponse)
async def plot(request: PlotterRequest):
    """Строит таблицы значений f, f', первообразной в [x_min; x_max]."""
    try:
        return build_plot(
            request.expression,
            request.variable,
            request.x_min,
            request.x_max,
            request.points,
            request.include_derivative,
            request.include_integral,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
