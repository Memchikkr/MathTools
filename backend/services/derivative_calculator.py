import sympy as sp
from typing import Tuple

from core.safe_math import safe_parse


def compute_derivative(
    expression: str, variable: str = "x", order: int = 1
) -> Tuple[str, str]:
    """
    Возвращает: (результат_str, результат_latex).
    Ошибки ввода пробрасываются как ValueError.
    """
    var = sp.symbols(variable)
    expr = safe_parse(expression)
    try:
        derivative = sp.diff(expr, var, order)
    except Exception as e:
        raise ValueError(f"Не удалось вычислить производную: {e}")
    return str(derivative), sp.latex(derivative)
