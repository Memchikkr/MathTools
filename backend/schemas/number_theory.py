from pydantic import BaseModel, Field
from typing import Any, Dict, List, Optional


class NumberTheoryRequest(BaseModel):
    numbers: List[int] = Field(..., description="Список чисел")
    operation: str = Field(
        ..., description="gcd | lcm | factorize | is_prime"
    )


class NumberTheoryResponse(BaseModel):
    operation: str
    input: List[int]
    result: Any
    result_factors: Optional[Dict[int, int]] = None
    steps: List[str] = []
