"""Решение СЛАУ четырьмя методами с пошаговой трассировкой для Гаусса."""

import numpy as np


def _check_square(A: np.ndarray):
    if A.ndim != 2 or A.shape[0] != A.shape[1]:
        raise ValueError(f"Матрица A должна быть квадратной, получено {A.shape}")


def _check_consistent(A: np.ndarray, b: np.ndarray):
    if A.shape[0] != b.shape[0]:
        raise ValueError(
            f"Размеры A {A.shape} и b ({b.shape[0]}) не согласованы"
        )


def _round_matrix(M: np.ndarray, digits: int = 6):
    return np.round(M, digits).tolist()


def gauss(A: np.ndarray, b: np.ndarray):
    """Метод Гаусса с частичным выбором главного элемента и снимками шагов."""
    n = A.shape[0]
    aug = np.hstack([A, b.reshape(-1, 1)]).astype(float)
    steps = [{
        "description": "Исходная расширенная матрица [A | b]",
        "matrix": _round_matrix(aug),
    }]

    # прямой ход
    for i in range(n):
        # выбор главного элемента в столбце i, начиная со строки i
        pivot = i + int(np.argmax(np.abs(aug[i:, i])))
        if abs(aug[pivot, i]) < 1e-14:
            raise ValueError("Матрица вырождена, метод Гаусса не применим")
        if pivot != i:
            aug[[i, pivot]] = aug[[pivot, i]]
            steps.append({
                "description": f"Перестановка строк {i + 1} и {pivot + 1} (главный элемент)",
                "matrix": _round_matrix(aug),
            })
        for j in range(i + 1, n):
            if aug[j, i] != 0:
                k = aug[j, i] / aug[i, i]
                aug[j] = aug[j] - k * aug[i]
                steps.append({
                    "description": f"Строка {j + 1} − ({round(k, 6)}) · строка {i + 1}",
                    "matrix": _round_matrix(aug),
                })

    # обратный ход
    x = np.zeros(n)
    for i in range(n - 1, -1, -1):
        x[i] = (aug[i, -1] - aug[i, i + 1:n] @ x[i + 1:n]) / aug[i, i]

    steps.append({
        "description": "Обратный ход: вычислены значения x_i из верхнетреугольной системы",
        "matrix": None,
    })
    return x, steps


def lu_solve(A: np.ndarray, b: np.ndarray):
    """LU-разложение без перестановок (Дулитл) + два хода подстановки."""
    n = A.shape[0]
    L = np.eye(n)
    U = A.astype(float).copy()
    for i in range(n):
        if abs(U[i, i]) < 1e-14:
            raise ValueError(
                "LU-разложение требует ненулевых ведущих миноров. "
                "Попробуйте метод Гаусса (с выбором главного элемента)."
            )
        for j in range(i + 1, n):
            L[j, i] = U[j, i] / U[i, i]
            U[j] = U[j] - L[j, i] * U[i]

    steps = [
        {"description": "Матрица L (нижнетреугольная)", "matrix": _round_matrix(L)},
        {"description": "Матрица U (верхнетреугольная)", "matrix": _round_matrix(U)},
    ]

    # Прямая подстановка Ly = b
    y = np.zeros(n)
    for i in range(n):
        y[i] = b[i] - L[i, :i] @ y[:i]
    # Обратная подстановка Ux = y
    x = np.zeros(n)
    for i in range(n - 1, -1, -1):
        x[i] = (y[i] - U[i, i + 1:] @ x[i + 1:]) / U[i, i]
    return x, steps


def jacobi(A: np.ndarray, b: np.ndarray, tol: float, max_iter: int):
    """Итерационный метод Якоби."""
    n = A.shape[0]
    diag = np.diag(A).astype(float)
    if np.any(np.abs(diag) < 1e-14):
        raise ValueError("На главной диагонали есть нуль — метод Якоби не применим")
    R = A - np.diagflat(diag)
    x = np.zeros(n)
    for k in range(1, max_iter + 1):
        x_new = (b - R @ x) / diag
        if np.linalg.norm(x_new - x, ord=np.inf) < tol:
            return x_new, [], k
        x = x_new
    raise ValueError(f"Метод Якоби не сошёлся за {max_iter} итераций (достижимая точность {tol})")


def seidel(A: np.ndarray, b: np.ndarray, tol: float, max_iter: int):
    """Итерационный метод Гаусса-Зейделя (in-place обновления)."""
    n = A.shape[0]
    x = np.zeros(n)
    for k in range(1, max_iter + 1):
        x_new = x.copy()
        for i in range(n):
            if abs(A[i, i]) < 1e-14:
                raise ValueError("На главной диагонали есть нуль — метод Зейделя не применим")
            s1 = A[i, :i] @ x_new[:i]
            s2 = A[i, i + 1:] @ x[i + 1:]
            x_new[i] = (b[i] - s1 - s2) / A[i, i]
        if np.linalg.norm(x_new - x, ord=np.inf) < tol:
            return x_new, [], k
        x = x_new
    raise ValueError(f"Метод Зейделя не сошёлся за {max_iter} итераций (достижимая точность {tol})")


def solve(matrix_a, vector_b, method: str, tolerance: float, max_iterations: int):
    A = np.array(matrix_a, dtype=float)
    b = np.array(vector_b, dtype=float).flatten()
    _check_square(A)
    _check_consistent(A, b)

    cond = float(np.linalg.cond(A))

    if method == "gauss":
        x, steps = gauss(A.copy(), b.copy())
        iterations = None
    elif method == "lu":
        x, steps = lu_solve(A, b)
        iterations = None
    elif method == "jacobi":
        x, steps, iterations = jacobi(A, b, tolerance, max_iterations)
    elif method == "seidel":
        x, steps, iterations = seidel(A, b, tolerance, max_iterations)
    else:
        raise ValueError(f"Неизвестный метод: {method}")

    return {
        "solution": x.tolist(),
        "condition_number": cond,
        "iterations": iterations,
        "steps": steps,
    }
