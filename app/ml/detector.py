"""
Face detection using MTCNN (Multi-task Cascaded CNN).
MTCNN is a state-of-the-art detector that outputs bounding boxes and facial landmarks.
Handles multi-face detection in a single image for classroom scenarios.
"""
import numpy as np
from typing import List, Tuple

# Lazy import to avoid loading TF at module load
_detector = None


def _get_detector():
    global _detector
    if _detector is None:
        try:
            from mtcnn import MTCNN
            _detector = MTCNN()
        except Exception as e:
            raise RuntimeError(f"MTCNN not available: {e}. Install: pip install mtcnn") from e
    return _detector


def detect_faces(image: np.ndarray) -> List[Tuple[int, int, int, int]]:
    """
    Detect all faces in image. Returns list of (x, y, w, h) bounding boxes.
    image: BGR or RGB numpy array (H, W, C).
    """
    detector = _get_detector()
    # MTCNN expects RGB
    if len(image.shape) == 2:
        import cv2
        image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
    elif image.shape[2] == 4:
        import cv2
        image = cv2.cvtColor(image, cv2.COLOR_BGRA2RGB)
    elif image.shape[2] == 3:
        import cv2
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    results = detector.detect_faces(image)
    boxes = []
    for r in results:
        x, y, w, h = r["box"]
        # Ensure non-negative and within image
        x = max(0, x)
        y = max(0, y)
        boxes.append((int(x), int(y), int(w), int(h)))
    return boxes
