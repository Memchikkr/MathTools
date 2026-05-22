from pydantic import BaseModel, Field
from typing import List, Optional


class SlaeRequest(BaseModel):
    matrix_a: List[List[float]] = Field(..., description="Квадратная матрица коэффициентов A")
    vector_b: List[float] = Field(..., description="Вектор правых частей b")
    method: str = Field(..., description="gauss | lu | jacobi | seidel")
    tolerance: float = 1e-9
    max_iterations: int = 1000


class SlaeStep(BaseModel):
    description: str
    matrix: Optional[List[List[float]]] = None


class SlaeResponse(BaseModel):
    solution: List[float]
    condition_number: float
    iterations: Optional[int] = None
    steps: List[SlaeStep] = []
