"""
Test Supabase database connection.
Run: python -m scripts.test_supabase_connection
Make sure DATABASE_URL environment variable is set.
"""
import asyncio
import sys
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from app.database import engine
from sqlalchemy import text


async def test_connection():
    """Test database connection."""
    db_url = os.getenv("DATABASE_URL", "")
    if not db_url:
        print("❌ DATABASE_URL environment variable not set!")
        print("\nSet it with:")
        print('  $env:DATABASE_URL="postgresql://postgres:Vsvg%40face_attendace_db1@db.hgxxzjjvzkaaipxqlwej.supabase.co:5432/postgres"')
        return False
    
    print(f"🔗 Testing connection to: {db_url.split('@')[1] if '@' in db_url else 'database'}")
    
    try:
        async with engine.connect() as conn:
            result = await conn.execute(text("SELECT version();"))
            version = result.scalar()
            print(f"✅ Connected successfully!")
            print(f"📊 PostgreSQL version: {version.split(',')[0]}")
            
            # Test if tables exist
            result = await conn.execute(text("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """))
            tables = [row[0] for row in result.fetchall()]
            
            if tables:
                print(f"\n📋 Existing tables: {', '.join(tables)}")
            else:
                print("\n⚠️  No tables found. Run database initialization script.")
            
            return True
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("\n💡 Troubleshooting:")
        print("  1. Check if DATABASE_URL is correct")
        print("  2. Verify password encoding (%40 for @)")
        print("  3. Check Supabase project is active")
        print("  4. Verify network/firewall allows connection")
        return False


if __name__ == "__main__":
    success = asyncio.run(test_connection())
    sys.exit(0 if success else 1)
