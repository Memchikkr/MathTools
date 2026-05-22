"""Решение задачи Коши y' = f(x, y), y(x0) = y0 двумя методами:
явный Эйлер и классический Рунге-Кутта 4-го порядка (РК4).
"""

import math
import sympy as sp

from core.safe_math import safe_parse


def _make_f(expression: str):
    """Парсим f(x, y) и компилируем в обычную числовую функцию."""
    x, y = sp.symbols("x y")
    expr = safe_parse(expression)
    func = sp.lambdify((x, y), expr, modules=["math"])

    def safe_f(xv, yv):
        try:
            return float(func(xv, yv))
        except Exception:
            return float("nan")

    return safe_f


def euler(f, x0: float, x1: float, y0: float, n: int):
    h = (x1 - x0) / n
    xs = [x0 + i * h for i in range(n + 1)]
    ys = [y0]
    for i in range(n):
        ys.append(ys[-1] + h * f(xs[i], ys[-1]))
    return xs, ys


def rk4(f, x0: float, x1: float, y0: float, n: int):
    h = (x1 - x0) / n
    xs = [x0 + i * h for i in range(n + 1)]
    ys = [y0]
    for i in range(n):
        xi = xs[i]
        yi = ys[-1]
        k1 = f(xi, yi)
        k2 = f(xi + h / 2, yi + h * k1 / 2)
        k3 = f(xi + h / 2, yi + h * k2 / 2)
        k4 = f(xi + h, yi + h * k3)
        ys.append(yi + h * (k1 + 2 * k2 + 2 * k3 + k4) / 6)
    return xs, ys


def _sanitize(values):
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


def solve_ode(expression: str, x_min: float, x_max: float, y0: float, steps: int):
    if x_max <= x_min:
        raise ValueError("x_max должен быть больше x_min")
    if steps < 1:
        raise ValueError("Количество шагов должно быть >= 1")

    f = _make_f(expression)
    xs, e_ys = euler(f, x_min, x_max, y0, steps)
    _, r_ys = rk4(f, x_min, x_max, y0, steps)
    return {
        "x": xs,
        "euler": _sanitize(e_ys),
        "rk4": _sanitize(r_ys),
    }
