from fastapi import APIRouter, HTTPException
from schemas.matrix_calculator import MatrixRequest, MatrixResponse
from services.matrix_calculator import perform_operation, to_list

router = APIRouter(prefix="", tags=["Матричный калькулятор"])


@router.post("/matrix-calculate", response_model=MatrixResponse)
async def calculate(request: MatrixRequest):
    """Выполняет матричные операции: сложение, вычитание, умножение, транспонирование, обратная матрица."""
    try:
        result = perform_operation(
            request.matrix_a, request.matrix_b, request.operation
        )

        return MatrixResponse(
            operation=request.operation, result=to_list(result)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
