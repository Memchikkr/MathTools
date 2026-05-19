"""Безопасный разбор математических выражений.

sympy.sympify на недоверенном вводе небезопасен (по сути eval с доступом
к builtins). Здесь используется parse_expr с явным namespace только из
разрешённых функций sympy и заблокированными __builtins__ — имена-функции
ограничены белым списком, неизвестные идентификаторы становятся Symbol.
"""

import sympy as sp
from sympy.parsing.sympy_parser import parse_expr, standard_transformations

_ALLOWED = (
    "sin cos tan asin acos atan sinh cosh tanh "
    "exp log sqrt factorial gamma floor ceiling sign "
    "pi E I oo"
).split()

_NAMESPACE = {name: getattr(sp, name) for name in _ALLOWED if hasattr(sp, name)}
_NAMESPACE["ln"] = sp.log
_NAMESPACE["abs"] = sp.Abs
_NAMESPACE["e"] = sp.E

# Служебные конструкторы, которые подставляет parse_expr при трансформациях
# (auto_symbol -> Symbol, auto_number -> Integer/Float/Rational и т.п.).
# Без них parse_expr падает с "name 'Symbol' is not defined".
for _h in ("Symbol", "Integer", "Float", "Rational"):
    _NAMESPACE[_h] = getattr(sp, _h)

# __builtins__: {} закрывает доступ к import/eval/open и т.п.
_GLOBALS = {"__builtins__": {}, **_NAMESPACE}

_MAX_LEN = 1000


def safe_parse(expression: str):
    """Разбирает строку в sympy-выражение. При ошибке — ValueError."""
    if not isinstance(expression, str):
        raise ValueError("Выражение должно быть строкой")

    expression = expression.strip()
    if not expression:
        raise ValueError("Пустое выражение")
    if len(expression) > _MAX_LEN:
        raise ValueError("Слишком длинное выражение")

    try:
        return parse_expr(
            expression,
            global_dict=_GLOBALS,
            transformations=standard_transformations,
            evaluate=True,
        )
    except Exception as e:
        raise ValueError(f"Не удалось разобрать выражение: {e}")
