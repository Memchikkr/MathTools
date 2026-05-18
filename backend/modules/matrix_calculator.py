from fastapi import APIRouter, HTTPException
from schemas.matrix_calculator import MatrixRequest, MatrixResponse
from services.matrix_calculator import perform_operation

router = APIRouter(prefix="", tags=["Матричный калькулятор"])


@router.post("/matrix-calculate", response_model=MatrixResponse)
async def calculate(request: MatrixRequest):
    """Матричные операции: сложение, вычитание, умножение, транспонирование, обратная, определитель, eigen."""
    try:
        result = perform_operation(
            request.matrix_a, request.matrix_b, request.operation
        )
        return MatrixResponse(operation=request.operation, result=result)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
