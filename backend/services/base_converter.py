"""Перевод чисел между системами счисления (2..36) с пошаговым выводом."""

_DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz"


def _to_base(n: int, base: int) -> str:
    """Целое n в систему base без знака; знак минус сохраняется отдельно."""
    if n == 0:
        return "0"
    sign = ""
    if n < 0:
        sign = "-"
        n = -n
    digits = []
    while n > 0:
        digits.append(_DIGITS[n % base])
        n //= base
    return sign + "".join(reversed(digits))


def convert(value: str, from_base: int, to_base: int):
    if not 2 <= from_base <= 36 or not 2 <= to_base <= 36:
        raise ValueError("Основание должно быть в диапазоне 2..36")

    value = value.strip()
    if not value:
        raise ValueError("Пустое значение")

    try:
        decimal = int(value, from_base)
    except ValueError:
        raise ValueError(
            f"Невалидное число '{value}' в системе с основанием {from_base}"
        )

    result = _to_base(decimal, to_base)

    steps = []

    # 1) Перевод в десятичную через разложение по степеням основания
    if from_base != 10:
        body = value.lstrip("-").lower()
        n = len(body)
        terms = []
        for i, ch in enumerate(body):
            digit = int(ch, from_base)
            power = n - 1 - i
            terms.append(f"{digit}·{from_base}^{power}")
        sign_prefix = "−" if value.startswith("-") else ""
        steps.append({
            "description": f"Перевод '{value}' из системы {from_base} в десятичную",
            "detail": f"{sign_prefix}({' + '.join(terms)}) = {decimal}",
        })

    # 2) Перевод из десятичной в целевую систему делением в столбик
    if to_base != 10:
        divisions = []
        n = abs(decimal)
        if n == 0:
            divisions.append(f"0 ÷ {to_base} = 0 (остаток 0)")
        else:
            while n > 0:
                rem = n % to_base
                q = n // to_base
                divisions.append(f"{n} ÷ {to_base} = {q} (остаток {_DIGITS[rem]})")
                n = q
        steps.append({
            "description": f"Перевод {decimal} в систему {to_base} последовательным делением",
            "detail": "\n".join(divisions)
            + f"\nЧитаем остатки снизу вверх → {result}",
        })

    common = {
        "bin": _to_base(decimal, 2),
        "oct": _to_base(decimal, 8),
        "dec": str(decimal),
        "hex": _to_base(decimal, 16),
    }

    return {
        "value": value,
        "from_base": from_base,
        "to_base": to_base,
        "result": result,
        "decimal": decimal,
        "steps": steps,
        "common": common,
    }
