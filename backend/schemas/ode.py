from pydantic import BaseModel, Field
from typing import List, Optional


class OdeRequest(BaseModel):
    expression: str = Field(..., description="f(x, y) — правая часть y' = f(x, y)")
    x_min: float = 0
    x_max: float = 1
    y0: float = 1
    steps: int = Field(default=50, ge=1, le=10000)


class OdeResponse(BaseModel):
    x: List[float]
    euler: List[Optional[float]]
    rk4: List[Optional[float]]
