# Model Architecture & Accuracy

## 1. Face Detection: MTCNN

**MTCNN** (Multi-task Cascaded Convolutional Networks) is a classic deep learning face detector used for high-accuracy localization and alignment.

### Architecture (brief)
- **Stage 1 (P-Net)**: Shallow CNN producing candidate windows and bounding box regression.
- **Stage 2 (R-Net)**: Refines candidates and rejects false positives.
- **Stage 3 (O-Net)**: Outputs final bounding box and 5 facial landmarks (eyes, nose, mouth corners).

### Why MTCNN
- Handles **multiple faces** in one image (classroom).
- Good under **varying pose and lighting** when used with a strong recognition model.
- Lightweight compared to heavy detectors; good trade-off for accuracy/speed.

### Alternatives
- **RetinaFace**: Higher accuracy, heavier; can be set in config as `retinaface` with DeepFace.
- **YOLO-face**: Real-time; suitable if you integrate a YOLO-based face model.

---

## 2. Face Recognition: Facenet (via DeepFace)

**Facenet** learns a **128-dimensional embedding** per face such that same-person embeddings are close and different-person embeddings are far (triplet loss).

### Idea
- CNN maps a face image to a **unit hypersphere** (L2-normalized 128-d vector).
- **Triplet loss**: For anchor A, positive P (same identity), negative N (different identity), minimize:
  - `max(0, d(A,P) - d(A,N) + margin)`
- At inference, **matching** = small distance (cosine or Euclidean) between query and stored embeddings.

### Loss function (training)
- **Triplet loss** with online triplet mining.
- Margin typically 0.2–0.5; training on large face datasets (e.g. VGGFace2, MS-Celeb).

### In this project
- We use **pre-trained Facenet** (no training in-app).
- **Embeddings** are computed with DeepFace’s `represent()` and stored in `embeddings/<student_id>.npy`.
- **Similarity**: Cosine distance `1 - cos_sim` or Euclidean; threshold in `config.py` (`THRESHOLD_COSINE`, `THRESHOLD_EUCLIDEAN`).

### Handling variations
- **Lighting**: Facenet is trained with augmentation; normalization in the model helps.
- **Pose**: Multiple photos per student and **averaged embedding** improve robustness.
- **Partial occlusion**: MTCNN may still detect; if crop is too occluded, recognition can fail (design trade-off).

---

## 3. Accuracy Optimization

### Threshold tuning
- **Cosine**: Lower `THRESHOLD_COSINE` (e.g. 0.5) = stricter = fewer false positives, more false negatives.
- **Euclidean**: Lower `THRESHOLD_EUCLIDEAN` = stricter.
- Tune on a small validation set of (query image, expected student_id).

### Multiple photos per student
- Register **3–5 clear, front-facing photos** per student.
- Store **mean embedding** to reduce noise and pose/lighting variance.

### Fine-tuning (optional, advanced)
- Take a **pre-trained Facenet** (e.g. Keras/TF implementation).
- Replace last layer or fine-tune on your **student face dataset** (with identity labels).
- Loss: **triplet** or **ArcFace/Softmax** for classification.
- Use same train/val split and report **Precision, Recall, F1** on verification (same identity / different identity pairs).

---

## 4. Accuracy Evaluation Metrics

For **face verification** (is this face the same as stored student X?):

- **Precision** = TP / (TP + FP) — among predicted positives, how many are correct.
- **Recall** = TP / (TP + FN) — among true positives, how many we find.
- **F1-Score** = 2 × (Precision × Recall) / (Precision + Recall).

### How to compute
1. Build a **test set**: pairs (image, true_student_id) and (image, not_student_id).
2. Run **recognize_from_image** (or equivalent) and get predicted student_id and confidence.
3. For a fixed threshold:
   - TP = correctly identified as that student.
   - FP = wrong student or unknown claimed as student.
   - FN = true student not recognized.
4. Compute Precision, Recall, F1; optionally plot **ROC/PR curve** vs threshold.

### In code (example)
```python
# Pseudo: for each test image with ground_truth_id
recognized = recognize_from_image(test_image)
pred_id = recognized[0][0] if recognized else None
# Compare pred_id with ground_truth_id → TP/FP/FN, then Precision, Recall, F1.
```

---

## 5. Workflow Summary

1. **Registration**: Photo(s) → MTCNN (crop face) → Facenet (embedding) → store mean embedding.
2. **Attendance**: Classroom image → MTCNN (all faces) → Facenet (embedding per face) → match to stored embeddings → mark Present (no duplicate per day) → fill Absent for rest.
3. **Export**: From DB, generate Excel with Student ID, Name, Date, Attendance Status.
