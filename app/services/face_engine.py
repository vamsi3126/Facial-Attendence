"""
High-level face recognition pipeline: load registered embeddings from DB, detect faces in image,
match each face to a student, return list of recognized (student_id, name, confidence).
"""
import numpy as np
from typing import List, Tuple, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pgvector.sqlalchemy import Vector

from app.config import (
    FACE_DETECTOR,
    FACE_RECOGNITION_MODEL,
    DISTANCE_METRIC,
    THRESHOLD_COSINE,
    THRESHOLD_EUCLIDEAN,
)
from app.models import Student
from app.ml.recognizer import (
    get_embeddings_from_image,
    find_best_match,
)


async def load_student_embeddings_db(session: AsyncSession) -> List[Tuple[str, str, np.ndarray]]:
    """
    Load all stored embeddings from the database.
    Returns list of (student_id, name, embedding).
    """
    stmt = select(Student).where(Student.embedding.is_not(None))
    result = await session.execute(stmt)
    students = result.scalars().all()
    
    loaded = []
    for s in students:
        # s.embedding is a string or list depending on driver, but pgvector-python handles it
        # usually it returns a numpy array or list
        if s.embedding is None:
            continue
            
        # Ensure it's a numpy array
        emb = np.array(s.embedding, dtype=np.float32)
        loaded.append((s.student_id, s.name, emb))
    return loaded


async def recognize_from_image(session: AsyncSession, image: np.ndarray) -> List[Tuple[str, str, float]]:
    """
    Detect all faces in image and match to registered students using DB embeddings.
    Returns list of (student_id, name, confidence) for each recognized face.
    """
    # 1. Get known embeddings from DB
    known = await load_student_embeddings_db(session)
    if not known:
        # Even if no students, we might want to detect faces? No, can't recognize.
        return []

    # 2. Detect faces and get embeddings (CPU bound, blocking)
    # Ideally run in executor, but for simplicity we run here
    face_list = get_embeddings_from_image(
        image,
        detector_backend=FACE_DETECTOR,
        model_name=FACE_RECOGNITION_MODEL,
    )
    
    recognized = []
    for _bbox, emb in face_list:
        match = find_best_match(
            emb,
            known,
            metric=DISTANCE_METRIC,
            threshold_cosine=THRESHOLD_COSINE,
            threshold_euclidean=THRESHOLD_EUCLIDEAN,
        )
        if match:
            sid, name, dist = match
            conf = 1.0 - dist if DISTANCE_METRIC == "cosine" else max(0, 1.0 - dist / THRESHOLD_EUCLIDEAN)
            recognized.append((sid, name, round(float(conf), 4)))
            
    return recognized
