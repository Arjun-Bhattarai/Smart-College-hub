import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect(
        user="postgres",
        password="****",
        host="127.0.0.1",
        port=5433,
        database="smart_college_hub",
    )

    db = await conn.fetchval("SELECT current_database();")
    print("Connected to:", db)

    await conn.close()

asyncio.run(main())