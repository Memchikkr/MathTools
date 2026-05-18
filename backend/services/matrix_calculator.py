import numpy as np
from typing import List


def parse_matrix(matrix: List[List[int | float]]) -> np.ndarray:
    """Преобразует список списков в numpy array."""
    try:
        return np.array(matrix, dtype=float)
    except Exception as e:
        raise ValueError(f"Ошибка преобразования матрицы: {e}")


def to_list(matrix: np.ndarray) -> List[List[int | float]]:
    """Преобразует numpy array в список списков для JSON."""
    return matrix.tolist()


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


def eigenvalues_eigenvectors(matrix: np.ndarray) -> List[List[int | float]]:
    """
    Возвращает (собственные значения, собственные векторы, сообщение об ошибке)
    Собственные значения могут быть комплексными.
    """
    try:
        if matrix.shape[0] != matrix.shape[1]:
            raise Exception(f"Матрица не квадратная: {matrix.shape}")
        eigvals, eigvecs = np.linalg.eig(matrix)
        # Преобразуем в списки Python (комплексные числа -> строки или комплексные объекты)
        # Для сериализации JSON комплексные числа нужно конвертировать в строку или в [real, imag]
        eigenvalues = []
        for val in eigvals:
            if np.iscomplex(val):
                # Можно вернуть как строку "real+imag*j"
                eigenvalues.append(complex(val).__str__())
            else:
                eigenvalues.append(float(val))

        eigenvectors = []
        for i in range(eigvecs.shape[1]):
            vec = eigvecs[:, i]
            vec_list = []
            for v in vec:
                if np.iscomplex(v):
                    vec_list.append(complex(v).__str__())
                else:
                    vec_list.append(float(v))
            eigenvectors.append(vec_list)
        return [eigenvalues, eigenvectors]
    except np.linalg.LinAlgError as e:
        raise Exception(f"Ошибка вычисления: {str(e)}")
    except Exception as e:
        raise Exception(f"Ошибка нахождения собственных значений и векторов: {str(e)}")


def determinant(matrix: np.ndarray) -> float:
    """Вычисление определителя (только для квадратных матриц)"""
    try:
        if matrix.shape[0] != matrix.shape[1]:
            return None, f"Матрица не квадратная: {matrix.shape}"
        det = np.linalg.det(matrix)
        # Округляем очень маленькие числа до нуля
        if abs(det) < 1e-12:
            det = 0.0
        return float(det)
    except np.linalg.LinAlgError as e:
        raise Exception(f"Ошибка вычисления определителя: {str(e)}")
    except Exception as e:
        raise Exception(f"Ошибка: {str(e)}")


def perform_operation(
    matrix_a: List[List[int | float]],
    matrix_b: List[List[int | float]] | None,
    operation: str,
) -> np.ndarray:
    """Выполняет операцию и возвращает (результат, сообщение об ошибке)"""
    try:
        A = parse_matrix(matrix_a)

        if operation == "transpose":
            result = transpose_matrix(A)
        elif operation == "inverse":
            result = inverse_matrix(A)
        elif operation == "determinant":
            result = determinant(A)
        elif operation == "eigenvalues_eigenvectors":
            result = eigenvalues_eigenvectors(A)
        elif operation in ["add", "subtract", "multiply"]:
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

        return result
    except Exception as e:
        raise Exception(f"Произошла ошибка при операции с матрицами: {str(e)}")
