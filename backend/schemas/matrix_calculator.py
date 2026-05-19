from pydantic import BaseModel, Field
from typing import Any, List


class MatrixRequest(BaseModel):
    matrix_a: List[List[int | float]] = Field(..., description="Первая матрица")
    matrix_b: List[List[int | float]] | None = Field(
        None, description="Вторая матрица (для операций, где нужна)"
    )
    operation: str = Field(
        ...,
        description="add, subtract, multiply, transpose, inverse, determinant, eigen",
    )


class MatrixResponse(BaseModel):
    operation: str
    # result может быть матрицей, числом (определитель) или [значения, векторы] (eigen)
    result: Any | None = None
