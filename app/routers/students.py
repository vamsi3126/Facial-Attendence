"""
Student registration: create student, upload one or more photos, build and store face embedding.
"""
import numpy as np
from pathlib import Path
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import Student
from app.schemas import StudentCreate, StudentResponse
from app.config import UPLOAD_DIR, EMBEDDINGS_DIR
from app.services.face_engine import save_embedding
from app.ml.recognizer import get_embeddings_from_image
from app.config import FACE_DETECTOR, FACE_RECOGNITION_MODEL
from app.models import Attendance
import cv2

router = APIRouter(prefix="/api/students", tags=["students"])


@router.get("", response_model=List[StudentResponse])
async def list_students(session: AsyncSession = Depends(get_db)):
    result = await session.execute(select(Student).order_by(Student.student_id))
    return result.scalars().all()


@router.post("", response_model=StudentResponse)
async def create_student(body: StudentCreate, session: AsyncSession = Depends(get_db)):
    result = await session.execute(select(Student).where(Student.student_id == body.student_id))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Student ID already exists")
    student = Student(student_id=body.student_id, name=body.name)
    session.add(student)
    await session.flush()
    await session.refresh(student)
    return student


@router.post("/{student_id}/photos")
async def upload_photos(
    student_id: str,
    files: List[UploadFile] = File(...),
    session: AsyncSession = Depends(get_db),
):
    result = await session.execute(select(Student).where(Student.student_id == student_id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    folder = UPLOAD_DIR / student_id
    folder.mkdir(parents=True, exist_ok=True)
    embeddings_list = []
    for i, f in enumerate(files):
        if not f.content_type or not f.content_type.startswith("image/"):
            continue
        data = await f.read()
        npy = np.frombuffer(data, np.uint8)
        img = cv2.imdecode(npy, cv2.IMREAD_COLOR)
        if img is None:
            continue
        ext = Path(f.filename or "img.jpg").suffix
        path = folder / f"photo_{i}{ext}"
        with open(path, "wb") as out:
            out.write(data)
        # One face per photo: get first face embedding
        face_list = get_embeddings_from_image(img, detector_backend=FACE_DETECTOR, model_name=FACE_RECOGNITION_MODEL)
        for _bbox, emb in face_list:
            embeddings_list.append(emb)
    if not embeddings_list:
        raise HTTPException(status_code=400, detail="No face detected in any photo. Please upload clear front-facing photos.")
    # Average embedding for robustness (multiple photos)
    mean_emb = np.mean(embeddings_list, axis=0).astype(np.float32)
    save_embedding(student_id, student.name, mean_emb)
    return {"message": "Photos uploaded and embedding saved", "faces_used": len(embeddings_list)}


@router.get("/{student_id}", response_model=StudentResponse)
async def get_student(student_id: str, session: AsyncSession = Depends(get_db)):
    result = await session.execute(select(Student).where(Student.student_id == student_id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.delete("/{student_id}")
async def delete_student(student_id: str, session: AsyncSession = Depends(get_db)):
    result = await session.execute(select(Student).where(Student.student_id == student_id))
    student = result.scalar_one_or_none()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    # Delete attendance records first (FK constraint)
    await session.execute(delete(Attendance).where(Attendance.student_id == student.id))
    await session.delete(student)
    # Remove uploaded photos and embeddings
    folder = UPLOAD_DIR / student_id
    if folder.exists():
        for p in folder.iterdir():
            p.unlink(missing_ok=True)
        folder.rmdir()
    (EMBEDDINGS_DIR / f"{student_id}.npy").unlink(missing_ok=True)
    (EMBEDDINGS_DIR / f"{student_id}.name").unlink(missing_ok=True)
    return {"message": "Student deleted"}
