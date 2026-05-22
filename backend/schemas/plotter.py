from pydantic import BaseModel, Field
from typing import List, Optional


class PlotterRequest(BaseModel):
    expression: str
    variable: str = "x"
    x_min: float = -10
    x_max: float = 10
    points: int = Field(default=200, ge=10, le=2000)
    include_derivative: bool = True
    include_integral: bool = True


class PlotterResponse(BaseModel):
    x: List[float]
    f: List[Optional[float]]
    df: Optional[List[Optional[float]]] = None
    integral: Optional[List[Optional[float]]] = None
    derivative_latex: Optional[str] = None
    integral_latex: Optional[str] = None
