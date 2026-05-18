from pydantic import BaseModel, Field
from typing import List


class MatrixRequest(BaseModel):
    matrix_a: List[List[int | float]] = Field(..., description="Первая матрица")
    matrix_b: List[List[int | float]] | None = Field(
        None, description="Вторая матрица (для операций, где нужна)"
    )
    operation: str = Field(
        ...,
        description="add, subtract, multiply, transpose, inverse, determinant, eigenvalues_eigenvectors",
    )


class MatrixResponse(BaseModel):
    operation: str
    result: List[List[int | float]] | int | float | None = None
