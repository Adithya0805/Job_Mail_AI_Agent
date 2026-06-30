# PostgreSQL database connection pooling using asyncpg
import asyncpg
import os
from contextlib import asynccontextmanager

_pool = None

async def get_pool():
    global _pool
    if _pool is None:
        db_url = os.getenv('DATABASE_URL')
        if not db_url:
            raise ValueError("DATABASE_URL environment variable is missing or empty! Please configure it in Railway.")
        
        # Let asyncpg parse sslmode from the DSN parameter (e.g. ?sslmode=require or ?sslmode=disable)
        # to ensure compatibility with both internal and external connection configurations.
        _pool = await asyncpg.create_pool(
            dsn=db_url,
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
