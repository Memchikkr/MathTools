"""Сервис плоттера: строит таблицы значений f(x), f'(x) и первообразной.

Использует core.safe_math.safe_parse для безопасного разбора выражения,
затем sympy.lambdify для быстрого численного вычисления в точках.
"""

import math
import sympy as sp

from core.safe_math import safe_parse


def _sanitize(values):
    """NaN/Inf -> None (JSON их не сериализует напрямую)."""
    out = []
    for v in values:
        try:
            fv = float(v)
        except Exception:
            out.append(None)
            continue
        if math.isnan(fv) or math.isinf(fv):
            out.append(None)
        else:
            out.append(fv)
    return out


def _evaluate(expr, var, xs):
    """Лямбдифицируем выражение и считаем в точках, NaN на ошибках."""
    func = sp.lambdify(var, expr, modules=["math"])
    values = []
    for x in xs:
        try:
            values.append(func(x))
        except Exception:
            values.append(float("nan"))
    return values


def build_plot(
    expression: str,
    variable: str = "x",
    x_min: float = -10,
    x_max: float = 10,
    points: int = 200,
    include_derivative: bool = True,
    include_integral: bool = True,
):
    if x_max <= x_min:
        raise ValueError("x_max должен быть больше x_min")

    var = sp.symbols(variable)
    expr = safe_parse(expression)

    step = (x_max - x_min) / (points - 1)
    xs = [x_min + i * step for i in range(points)]

    f_vals = _evaluate(expr, var, xs)

    derivative_latex = None
    df_vals = None
    if include_derivative:
        df_expr = sp.diff(expr, var)
        derivative_latex = sp.latex(df_expr)
        df_vals = _evaluate(df_expr, var, xs)

    integral_latex = None
    int_vals = None
    if include_integral:
        try:
            int_expr = sp.integrate(expr, var)
            integral_latex = sp.latex(int_expr)
            int_vals = _evaluate(int_expr, var, xs)
        except Exception:
            # не у всех функций есть символьная первообразная
            integral_latex = None
            int_vals = None

    return {
        "x": xs,
        "f": _sanitize(f_vals),
        "df": _sanitize(df_vals) if df_vals is not None else None,
        "integral": _sanitize(int_vals) if int_vals is not None else None,
        "derivative_latex": derivative_latex,
        "integral_latex": integral_latex,
    }
