import asyncio
import sys
from pathlib import Path
from getpass import getpass

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from app.database import get_db, AsyncSessionLocal
from app.models import User
from app.routers.auth import hash_password
from sqlalchemy import select

async def create_user():
    print("--- Create Admin/Teacher User ---")
    email = input("Email: ").strip()
    if not email:
        print("Email required.")
        return

    password = getpass("Password: ")
    if not password:
        print("Password required.")
        return

    role = input("Role (admin/faculty) [default: faculty]: ").strip().lower() or "faculty"
    if role not in ["admin", "faculty"]:
        print("Invalid role. Must be 'admin' or 'faculty'.")
        return

    full_name = input("Full Name: ").strip()

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.email == email))
        if result.scalar_one_or_none():
            print(f"User {email} already exists.")
            return

        user = User(
            email=email,
            hashed_password=hash_password(password),
            full_name=full_name,
            role=role,
            is_active=True
        )
        session.add(user)
        await session.commit()
        print(f"✓ User {email} created successfully as {role}!")

if __name__ == "__main__":
    asyncio.run(create_user())
