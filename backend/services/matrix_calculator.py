import numpy as np
from typing import List


def parse_matrix(matrix: List[List[int | float]]) -> np.ndarray:
    """Преобразует список списков в numpy array."""
    try:
        return np.array(matrix, dtype=float)
    except Exception as e:
        raise ValueError(f"Ошибка преобразования матрицы: {e}")


def add_matrices(A: np.ndarray, B: np.ndarray) -> np.ndarray:
    if A.shape != B.shape:
        raise ValueError("Матрицы должны быть одинаковой размерности для сложения")
    return A + B


def subtract_matrices(A: np.ndarray, B: np.ndarray) -> np.ndarray:
    if A.shape != B.shape:
        raise ValueError("Матрицы должны быть одинаковой размерности для вычитания")
    return A - B


def multiply_matrices(A: np.ndarray, B: np.ndarray) -> np.ndarray:
    if A.shape[1] != B.shape[0]:
        raise ValueError(
            f"Несоответствие размерностей: {A.shape} и {B.shape}. Количество столбцов A должно равняться количеству строк B"
        )
    return np.dot(A, B)


def transpose_matrix(A: np.ndarray) -> np.ndarray:
    return A.T


def inverse_matrix(A: np.ndarray) -> np.ndarray:
    if A.shape[0] != A.shape[1]:
        raise ValueError("Обратная матрица существует только для квадратных матриц")
    if np.linalg.det(A) == 0:
        raise ValueError(
            "Матрица вырождена (детерминант = 0), обратная матрица не существует"
        )
    return np.linalg.inv(A)


def _to_num(z):
    """Комплексное с ~нулевой мнимой частью -> float, иначе -> строка."""
    z = complex(z)
    return float(z.real) if abs(z.imag) < 1e-12 else str(z)


def eigenvalues_eigenvectors(matrix: np.ndarray) -> List[list]:
    """Собственные значения и векторы. Комплексные значения -> строки."""
    if matrix.shape[0] != matrix.shape[1]:
        raise ValueError(f"Матрица не квадратная: {matrix.shape}")

    eigvals, eigvecs = np.linalg.eig(matrix)
    eigenvalues = [_to_num(v) for v in eigvals]
    eigenvectors = [
        [_to_num(c) for c in eigvecs[:, i]] for i in range(eigvecs.shape[1])
    ]
    return [eigenvalues, eigenvectors]


def determinant(matrix: np.ndarray) -> float:
    """Определитель (только для квадратных матриц)."""
    if matrix.shape[0] != matrix.shape[1]:
        raise ValueError(f"Матрица не квадратная: {matrix.shape}")
    det = float(np.linalg.det(matrix))
    return 0.0 if abs(det) < 1e-12 else det


def perform_operation(
    matrix_a: List[List[int | float]],
    matrix_b: List[List[int | float]] | None,
    operation: str,
):
    """
    Выполняет матричную операцию и возвращает JSON-сериализуемый результат:
    матрицу (список списков), число (определитель) или [значения, векторы].
    Ошибки ввода пробрасываются как ValueError.
    """
    A = parse_matrix(matrix_a)

    if operation == "transpose":
        result = transpose_matrix(A)
    elif operation == "inverse":
        result = inverse_matrix(A)
    elif operation == "determinant":
        result = determinant(A)
    elif operation == "eigen":
        result = eigenvalues_eigenvectors(A)
    elif operation in ("add", "subtract", "multiply"):
        if matrix_b is None:
            raise ValueError(f"Для операции '{operation}' требуется вторая матрица")
        B = parse_matrix(matrix_b)
        if operation == "add":
            result = add_matrices(A, B)
        elif operation == "subtract":
            result = subtract_matrices(A, B)
        else:  # multiply
            result = multiply_matrices(A, B)
    else:
        raise ValueError(f"Неизвестная операция: {operation}")

    if isinstance(result, np.ndarray):
        return result.tolist()
    return result
