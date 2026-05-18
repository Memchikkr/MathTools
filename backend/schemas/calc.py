from pydantic import BaseModel
from typing import Any


class CalcRequest(BaseModel):
    expression: str


class CalcResponse(BaseModel):
    expression: str
    result: Any | None = None
