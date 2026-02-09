"""
Optional: Evaluate face recognition accuracy (Precision, Recall, F1-Score).
Run from project root: python -m scripts.evaluate_accuracy

Expects a CSV or list of (image_path, true_student_id) test pairs.
Example usage: prepare test_data.csv with columns: image_path, student_id
"""
import sys
from pathlib import Path

# Add project root
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

import numpy as np
import cv2
from app.services.face_engine import recognize_from_image


def evaluate_accuracy(test_pairs, threshold_strict=False):
    """
    test_pairs: list of (image_path_or_numpy, expected_student_id).
    If threshold_strict, use stricter matching (fewer FP, more FN).
    Returns dict with precision, recall, f1, tp, fp, fn.
    """
    tp, fp, fn = 0, 0, 0
    for item, expected_id in test_pairs:
        if isinstance(item, str):
            img = cv2.imread(item)
        else:
            img = item
        if img is None:
            fn += 1
            continue
        recognized = recognize_from_image(img)
        pred_id = recognized[0][0] if recognized else None
        if expected_id and pred_id == expected_id:
            tp += 1
        elif expected_id and pred_id and pred_id != expected_id:
            fp += 1
            fn += 1  # true identity missed
        elif expected_id:
            fn += 1
        elif pred_id:
            fp += 1
    precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    f1 = 2 * precision * recall / (precision + recall) if (precision + recall) > 0 else 0.0
    return {
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_score": round(f1, 4),
        "tp": tp,
        "fp": fp,
        "fn": fn,
    }


if __name__ == "__main__":
    # Example: no test file → print usage
    print("Accuracy evaluation (Precision, Recall, F1-Score)")
    print("Provide test_pairs as (image_path, expected_student_id).")
    print("Example: add test images and run with your test_data.")
    # Demo with empty list
    result = evaluate_accuracy([])
    print("Sample output format:", result)
