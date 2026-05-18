from pydantic import BaseModel


class IntegralRequest(BaseModel):
    expression: str  # подынтегральная функция, например "x**2 * sin(x)"
    variable: str = "x"  # переменная интегрирования
    lower_limit: str | None = None
    upper_limit: str | None = None


class IntegralResponse(BaseModel):
    expression: str
    result: str  # строковое представление
    result_latex: str  # формат LaTeX для красивого вывода
    numeric_value: float | None = None
