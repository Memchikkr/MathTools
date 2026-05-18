from typing import List
from pydantic import BaseModel, ConfigDict


class Module(BaseModel):
    id: int
    path: str
    name: str
    description: str
    icon: str


class ModulesResponse(BaseModel):
    model_config = ConfigDict()
    modules: List[Module]
