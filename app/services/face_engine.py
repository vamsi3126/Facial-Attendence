"""
High-level face recognition pipeline: load registered embeddings, detect faces in image,
match each face to a student, return list of recognized (student_id, name, confidence).
"""
import numpy as np
from pathlib import Path
from typing import List, Tuple, Optional

from app.config import (
    UPLOAD_DIR,
    EMBEDDINGS_DIR,
    FACE_DETECTOR,
    FACE_RECOGNITION_MODEL,
    DISTANCE_METRIC,
    THRESHOLD_COSINE,
    THRESHOLD_EUCLIDEAN,
)
from app.ml.recognizer import (
    get_embeddings_from_image,
    find_best_match,
)


def load_student_embeddings() -> List[Tuple[str, str, np.ndarray]]:
    """
    Load all stored embeddings from embeddings/<student_id>.npy.
    Returns list of (student_id, name, embedding).
    Name is read from a sidecar file or left empty (API will fill from DB).
    """
    result = []
    if not EMBEDDINGS_DIR.exists():
        return result
    for path in EMBEDDINGS_DIR.glob("*.npy"):
        student_id = path.stem
        try:
            emb = np.load(path, allow_pickle=False)
            if emb.ndim == 1:
                pass
            elif emb.ndim == 2:
                emb = np.mean(emb, axis=0)
            else:
                continue
            name_path = path.with_suffix(".name")
            name = name_path.read_text(encoding="utf-8").strip() if name_path.exists() else ""
            result.append((student_id, name, emb.astype(np.float32)))
        except Exception:
            continue
    return result


def save_embedding(student_id: str, name: str, embedding: np.ndarray) -> None:
    """Save single embedding to embeddings/<student_id>.npy and .name."""
    EMBEDDINGS_DIR.mkdir(parents=True, exist_ok=True)
    path = EMBEDDINGS_DIR / f"{student_id}.npy"
    name_path = EMBEDDINGS_DIR / f"{student_id}.name"
    np.save(path, embedding.astype(np.float32))
    name_path.write_text(name, encoding="utf-8")


def recognize_from_image(image: np.ndarray) -> List[Tuple[str, str, float]]:
    """
    Detect all faces in image and match to registered students.
    Returns list of (student_id, name, confidence) for each recognized face.
    Confidence is 1 - cosine_distance or inverse of euclidean for consistency.
    """
    known = load_student_embeddings()
    if not known:
        return []

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
