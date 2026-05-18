import sympy as sp
from typing import Tuple, Optional


def compute_integral(
    expression: str,
    variable: str = "x",
    lower_limit: Optional[str] = None,
    upper_limit: Optional[str] = None,
) -> Tuple[str, str, Optional[float]]:
    """
    Возвращает: (результат_str, результат_latex, числовое_значение)
    """
    try:
        var = sp.symbols(variable)
        expr = sp.sympify(expression)

        if lower_limit is not None and upper_limit is not None:
            # Определённый интеграл
            lower = sp.sympify(lower_limit)
            upper = sp.sympify(upper_limit)
            integral = sp.integrate(expr, (var, lower, upper))
            numeric = float(integral.evalf()) if not integral.has(sp.Symbol) else None
        else:
            # Неопределённый интеграл
            integral = sp.integrate(expr, var)
            numeric = None

        return str(integral), sp.latex(integral), numeric
    except Exception as e:
        raise Exception(f"Произошла ошибка при вычислении интеграла: {str(e)}")
