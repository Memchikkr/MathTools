from aiosqlite import Connection
from fastapi import APIRouter, Depends
from typing import Annotated
from core.depends import get_conn
from schemas.root import ModulesResponse


router = APIRouter(prefix="")


@router.get("/", response_model=ModulesResponse)
async def get_root(conn: Annotated[Connection, Depends(get_conn)]):
    cur = await conn.execute("SELECT * FROM module")
    rows = await cur.fetchall()
    return ModulesResponse(modules=[dict(row) for row in rows])
