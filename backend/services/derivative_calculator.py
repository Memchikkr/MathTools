import sympy as sp
from typing import Tuple


def compute_derivative(
    expression: str, variable: str = "x", order: int = 1
) -> Tuple[str, str]:
    """
    Возвращает: (результат_str, результат_latex)
    """
    try:
        var = sp.symbols(variable)
        expr = sp.sympify(expression)
        derivative = sp.diff(expr, var, order)
        return str(derivative), sp.latex(derivative)
    except Exception as e:
        raise Exception(f"Произошла ошибка при вычислении производной: {str(e)}")
