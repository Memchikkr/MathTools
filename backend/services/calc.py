import sympy as sp
from typing import Union, Any


def evaluate_symbolic(expression: str) -> Union[float, str, None]:
    """
    Символьное вычисление с помощью SymPy.
    Возвращает (результат, сообщение об ошибке)
    """
    expr = expression.replace("^", "**")
    try:
        result = sp.sympify(expr)
        # Если результат — число, конвертируем в float
        if result.is_number:
            return float(result)
        # Иначе возвращаем строковое представление формулы
        return str(result)
    except sp.SympifyError as e:
        raise Exception(f"Ошибка синтаксиса: {str(e)}")
    except Exception as e:
        raise Exception(f"Ошибка вычисления: {str(e)}")


def evaluate_expression(expression: str) -> Any:
    """
    Главная функция вычисления.
    """
    return evaluate_symbolic(expression)
