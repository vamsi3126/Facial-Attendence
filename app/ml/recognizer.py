"""
Face recognition using DeepFace (Facenet/ArcFace) embeddings.
Extracts 128/512-dim embedding per face; matching is done via cosine/euclidean distance.
"""
import numpy as np
from typing import List, Optional, Tuple

# DeepFace is used for representation (embedding) and verification
_recognition_model = None


def _get_model():
    global _recognition_model
    if _recognition_model is None:
        import os
        os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")
        from deepface import DeepFace
        _recognition_model = DeepFace
    return _recognition_model


def get_embedding(image: np.ndarray, detector_backend: str = "mtcnn", model_name: str = "Facenet") -> Optional[np.ndarray]:
    """
    Get face embedding for a single aligned face image (crop).
    image: RGB numpy array (H, W, 3).
    Returns 128-d (Facenet) or 512-d (ArcFace) vector, or None if no face.
    """
    import tempfile
    import cv2
    try:
        # DeepFace.represent expects file path; write numpy array to temp file
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as f:
            if image.shape[2] == 3:
                cv2.imwrite(f.name, cv2.cvtColor(image, cv2.COLOR_RGB2BGR))
            else:
                cv2.imwrite(f.name, image)
            path = f.name
        try:
            df = _get_model().represent(
                img_path=path,
                detector_backend=detector_backend,
                model_name=model_name,
                enforce_detection=False,
            )
            if df and len(df) > 0 and "embedding" in df[0]:
                return np.array(df[0]["embedding"], dtype=np.float32)
        finally:
            import os
            os.unlink(path)
    except Exception:
        pass
    return None


def get_embeddings_from_image(
    image: np.ndarray,
    detector_backend: str = "mtcnn",
    model_name: str = "Facenet",
) -> List[Tuple[Tuple[int, int, int, int], np.ndarray]]:
    """
    Detect faces in image and return list of (bbox, embedding) for each face.
    image: BGR or RGB numpy array.
    """
    import cv2
    from app.ml.detector import detect_faces

    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB) if image.shape[2] == 3 else image
    boxes = detect_faces(image)
    results = []
    for (x, y, w, h) in boxes:
        # Expand slightly for better alignment
        pad = int(0.1 * max(w, h))
        x1 = max(0, x - pad)
        y1 = max(0, y - pad)
        x2 = min(image.shape[1], x + w + pad)
        y2 = min(image.shape[0], y + h + pad)
        crop = rgb[y1:y2, x1:x2]
        if crop.size == 0:
            continue
        emb = get_embedding(crop, detector_backend=detector_backend, model_name=model_name)
        if emb is not None:
            results.append(((x, y, w, h), emb))
    return results


def cosine_distance(a: np.ndarray, b: np.ndarray) -> float:
    """Cosine distance = 1 - cosine_similarity. Lower is more similar."""
    a = a.flatten().astype(np.float64)
    b = b.flatten().astype(np.float64)
    return 1.0 - np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-8)


def euclidean_distance(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.linalg.norm(a.flatten() - b.flatten()))


def find_best_match(
    query_embedding: np.ndarray,
    known_embeddings: List[Tuple[str, str, np.ndarray]],
    metric: str = "cosine",
    threshold_cosine: float = 0.6,
    threshold_euclidean: float = 10.0,
) -> Optional[Tuple[str, str, float]]:
    """
    known_embeddings: list of (student_id, name, embedding).
    Returns (student_id, name, distance) of best match if within threshold, else None.
    """
    best_id, best_name, best_dist = None, None, float("inf")
    for sid, name, emb in known_embeddings:
        if metric == "cosine":
            d = cosine_distance(query_embedding, emb)
            if d < best_dist and d <= threshold_cosine:
                best_dist, best_id, best_name = d, sid, name
        else:
            d = euclidean_distance(query_embedding, emb)
            if d < best_dist and d <= threshold_euclidean:
                best_dist, best_id, best_name = d, sid, name
    if best_id is None:
        return None
    return (best_id, best_name, best_dist)
