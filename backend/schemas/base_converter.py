from pydantic import BaseModel, Field
from typing import Dict, List


class BaseConvertRequest(BaseModel):
    value: str = Field(..., description="Число в исходной системе счисления")
    from_base: int = Field(..., ge=2, le=36)
    to_base: int = Field(..., ge=2, le=36)


class BaseConvertStep(BaseModel):
    description: str
    detail: str


class BaseConvertResponse(BaseModel):
    value: str
    from_base: int
    to_base: int
    result: str
    decimal: int
    steps: List[BaseConvertStep] = []
    common: Dict[str, str]
