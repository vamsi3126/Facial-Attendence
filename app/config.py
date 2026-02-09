"""
Application configuration.
Environment variables can override defaults (e.g. DATABASE_URL, SECRET_KEY).
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production-attendance-secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Database
# Supabase uses PostgreSQL. Connection string format:
# postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
# For async SQLAlchemy, use: postgresql+asyncpg://...
_db_url = os.getenv("DATABASE_URL", "")
if _db_url and _db_url.startswith("postgresql://"):
    # Convert postgresql:// to postgresql+asyncpg:// for async SQLAlchemy
    DATABASE_URL = _db_url.replace("postgresql://", "postgresql+asyncpg://", 1)
elif _db_url and _db_url.startswith("postgres://"):
    # Supabase may use postgres://, convert to postgresql+asyncpg://
    DATABASE_URL = _db_url.replace("postgres://", "postgresql+asyncpg://", 1)
else:
    # Default to SQLite for local dev
    DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite+aiosqlite:///{BASE_DIR / 'attendance.db'}".replace("\\", "/"))

# Paths
UPLOAD_DIR = BASE_DIR / "uploads"
EMBEDDINGS_DIR = BASE_DIR / "embeddings"
EXPORTS_DIR = BASE_DIR / "exports"

# Face recognition
FACE_DETECTOR = "mtcnn"  # mtcnn | retinaface | opencv
FACE_RECOGNITION_MODEL = "Facenet"  # Facenet | ArcFace | DeepFace (VGG-Face)
DISTANCE_METRIC = "cosine"  # cosine | euclidean
THRESHOLD_COSINE = 0.6  # Lower = stricter match
THRESHOLD_EUCLIDEAN = 10.0

# Ensure directories exist
for d in (UPLOAD_DIR, EMBEDDINGS_DIR, EXPORTS_DIR):
    d.mkdir(parents=True, exist_ok=True)
