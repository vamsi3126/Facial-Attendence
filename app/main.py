"""
Facial Recognition Attendance System - FastAPI entry point.
Serves API, static assets, and dashboard.
"""
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path

from app.database import init_db
from app.routers import auth, students, attendance, reports

# Reduce TensorFlow logging
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    # shutdown if needed


app = FastAPI(
    title="Facial Recognition Attendance System",
    description="High-accuracy face detection & recognition for classroom attendance",
    version="1.0.0",
    lifespan=lifespan,
)

app.include_router(auth.router)
app.include_router(students.router)
app.include_router(attendance.router)
app.include_router(reports.router)

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"
if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


@app.get("/")
async def index():
    """Serve dashboard."""
    dashboard = BASE_DIR / "static" / "index.html"
    if dashboard.exists():
        return FileResponse(dashboard)
    return {"message": "API is running. Mount static files at /static and add index.html for dashboard."}


@app.get("/health")
async def health():
    return {"status": "ok"}
