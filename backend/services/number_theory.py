"""Теория чисел: НОД, НОК, факторизация, проверка простоты.

Реализация без сторонних библиотек (math.gcd допустим) —
алгоритмы выписаны явно для образовательной защиты.
"""

from functools import reduce
from math import gcd
from typing import List


def _lcm(a: int, b: int) -> int:
    if a == 0 or b == 0:
        return 0
    return abs(a * b) // gcd(a, b)


def list_gcd(nums: List[int]) -> int:
    return reduce(gcd, [abs(n) for n in nums])


def list_lcm(nums: List[int]) -> int:
    return reduce(_lcm, [abs(n) for n in nums])


def factorize(n: int):
    """Каноническое разложение методом пробных делений до √n."""
    if n < 2:
        raise ValueError("Факторизация определена для n >= 2")
    n = abs(n)
    factors: dict = {}
    d = 2
    while d * d <= n:
        while n % d == 0:
            factors[d] = factors.get(d, 0) + 1
            n //= d
        d += 1
    if n > 1:
        factors[n] = factors.get(n, 0) + 1
    return factors


def is_prime(n: int) -> bool:
    """Проверка простоты пробными делениями (n < 10^12 на практике)."""
    if n < 2:
        return False
    if n < 4:
        return True
    if n % 2 == 0:
        return False
    d = 3
    while d * d <= n:
        if n % d == 0:
            return False
        d += 2
    return True


def compute(numbers: List[int], operation: str):
    if not numbers:
        raise ValueError("Список чисел не должен быть пустым")

    if operation == "gcd":
        if any(n == 0 for n in numbers) and len(numbers) > 1 and not all(n == 0 for n in numbers):
            # НОД(0, a) = a — допустимо, оставляем
            pass
        result = list_gcd(numbers)
        return {
            "operation": "gcd",
            "input": numbers,
            "result": result,
            "steps": [
                f"НОД({', '.join(str(x) for x in numbers)}) "
                f"вычислен последовательным применением алгоритма Евклида: gcd(a, b) = gcd(b, a mod b)",
                f"Результат: НОД = {result}",
            ],
        }

    if operation == "lcm":
        result = list_lcm(numbers)
        return {
            "operation": "lcm",
            "input": numbers,
            "result": result,
            "steps": [
                f"НОК({', '.join(str(x) for x in numbers)}) "
                f"вычислен попарно: НОК(a, b) = |a · b| / НОД(a, b)",
                f"Результат: НОК = {result}",
            ],
        }

    if operation == "factorize":
        if len(numbers) != 1:
            raise ValueError("Факторизация работает с одним числом")
        n = numbers[0]
        factors = factorize(n)
        product = " · ".join(
            f"{p}^{e}" if e > 1 else str(p) for p, e in factors.items()
        )
        return {
            "operation": "factorize",
            "input": numbers,
            "result": product,
            "result_factors": factors,
            "steps": [
                f"Метод пробных делений: перебираем d = 2, 3, 4, ... до √n",
                f"Найдено разложение: {abs(n)} = {product}",
            ],
        }

    if operation == "is_prime":
        if len(numbers) != 1:
            raise ValueError("Проверка простоты работает с одним числом")
        n = numbers[0]
        prime = is_prime(n)
        return {
            "operation": "is_prime",
            "input": numbers,
            "result": prime,
            "steps": [
                f"Метод пробных делений: проверяем делимость n = {n} на 2 и нечётные d до √n",
                f"{n} — {'простое' if prime else 'составное'} число",
            ],
        }

    raise ValueError(f"Неизвестная операция: {operation}")
