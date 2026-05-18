from pydantic import BaseModel


class DerivativeRequest(BaseModel):
    expression: str  # функция, например "sin(x) * x**2"
    variable: str = "x"  # переменная дифференцирования
    order: int = 1  # порядок производной (1, 2, ...)


class DerivativeResponse(BaseModel):
    expression: str
    result: str  # строковое представление
    result_latex: str  # формат LaTeX
