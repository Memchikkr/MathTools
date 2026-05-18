from typing import Union

from core.safe_math import safe_parse


def evaluate_symbolic(expression: str) -> Union[float, str]:
    """Символьное вычисление выражения. Ошибки ввода — ValueError."""
    expr = expression.replace("^", "**")
    result = safe_parse(expr)

    if result.is_number:
        try:
            return float(result)
        except TypeError:
            # комплексное число и т.п.
            return str(result)
    return str(result)


def evaluate_expression(expression: str) -> Union[float, str]:
    return evaluate_symbolic(expression)
