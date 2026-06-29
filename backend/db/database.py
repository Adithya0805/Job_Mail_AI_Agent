# PostgreSQL database connection pooling using asyncpg
import asyncpg
import os
from contextlib import asynccontextmanager

_pool = None

async def get_pool():
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            dsn=os.getenv('DATABASE_URL'),
            min_size=2,
            max_size=10,
            command_timeout=30
        )
    return _pool

@asynccontextmanager
async def get_db():
    pool = await get_pool()
    async with pool.acquire() as conn:
        yield conn

async def close_pool():
    global _pool
    if _pool:
        await _pool.close()
        _pool = None
