import sympy as sp
from typing import Tuple, Optional

from core.safe_math import safe_parse


def compute_integral(
    expression: str,
    variable: str = "x",
    lower_limit: Optional[str] = None,
    upper_limit: Optional[str] = None,
) -> Tuple[str, str, Optional[float]]:
    """
    Возвращает: (результат_str, результат_latex, числовое_значение).
    """
    var = sp.symbols(variable)
    expr = safe_parse(expression)

    try:
        if lower_limit is not None and upper_limit is not None:
            lower = safe_parse(lower_limit)
            upper = safe_parse(upper_limit)
            integral = sp.integrate(expr, (var, lower, upper))
            numeric = (
                float(integral.evalf()) if not integral.has(sp.Symbol) else None
            )
        else:
            integral = sp.integrate(expr, var)
            numeric = None
    except ValueError:
        raise
    except Exception as e:
        raise ValueError(f"Не удалось вычислить интеграл: {e}")

    return str(integral), sp.latex(integral), numeric
