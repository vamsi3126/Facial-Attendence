"""
Initialize Supabase database tables.
Run: python -m scripts.init_supabase_db
Make sure DATABASE_URL environment variable is set.
"""
import asyncio
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from app.database import init_db


async def main():
    print("Initializing database tables...")
    try:
        await init_db()
        print("✓ Tables created successfully!")
    except Exception as e:
        print(f"✗ Error: {e}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
