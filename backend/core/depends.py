import aiosqlite

from typing import AsyncGenerator

from core.consts import DB_PATH


async def get_conn() -> AsyncGenerator[aiosqlite.Connection, None]:
    async with aiosqlite.connect(DB_PATH) as conn:
        conn.row_factory = aiosqlite.Row
        yield conn
