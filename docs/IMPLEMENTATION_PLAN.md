# Step-by-Step Implementation Plan

## Phase 1: Project setup
1. Create project root and folders: `app/`, `app/routers/`, `app/services/`, `app/ml/`, `static/`, `uploads/`, `embeddings/`, `exports/`, `docs/`.
2. Add `requirements.txt` with FastAPI, SQLAlchemy, OpenCV, MTCNN, DeepFace, pandas, openpyxl, auth libraries.
3. Add `app/config.py` for paths, DB URL, face thresholds.
4. Add `app/database.py` for async SQLite and `get_db`, `init_db`.

## Phase 2: Data layer
5. Define `app/models.py`: User (email, role), Student (student_id, name), Attendance (student_id, date, status) with unique (student_id, date).
6. Define `app/schemas.py`: Pydantic models for API request/response.

## Phase 3: Face pipeline
7. Implement `app/ml/detector.py`: MTCNN wrapper, return list of (x, y, w, h) boxes.
8. Implement `app/ml/recognizer.py`: DeepFace/Facenet embedding extraction; cosine/euclidean distance; best-match with threshold.
9. Implement `app/services/face_engine.py`: load embeddings from `embeddings/*.npy`, save new embeddings; `recognize_from_image()` returns list of (student_id, name, confidence).

## Phase 4: Business logic
10. Implement `app/services/attendance_service.py`: mark_present (no duplicate per day), ensure_all_students_have_attendance_record (fill Absent).
11. Implement `app/services/excel_export.py`: build rows (Student ID, Name, Date, Status), write .xlsx with pandas/openpyxl, daily and range reports.

## Phase 5: API
12. Implement `app/routers/auth.py`: register, login (JWT), get_current_user, optional role check.
13. Implement `app/routers/students.py`: create student, upload photos (build and store mean embedding), list, get, delete.
14. Implement `app/routers/attendance.py`: mark-from-image (upload image, recognize, mark present, fill absent), records, daily summary, summary-range.
15. Implement `app/routers/reports.py`: daily Excel, range Excel (query params), return FileResponse.
16. Wire all routers and static in `app/main.py`; run `init_db` on startup.

## Phase 6: Dashboard
17. Build `static/index.html`: tabs (Register, Mark Attendance, Records, Reports).
18. Build `static/styles.css`: responsive, clean layout.
19. Build `static/app.js`: fetch API for students, photo upload, mark attendance, load records/summary, export links.

## Phase 7: Documentation & deployment
20. Write `docs/ARCHITECTURE.md` (data flow, components).
21. Write `docs/MODEL_EXPLANATION.md` (MTCNN, Facenet, loss, accuracy metrics, tuning).
22. Write `docs/DEPLOYMENT.md` (local run, env vars, cloud).
23. Add README with quick start and project structure.

---

# Final Project Explanation (Academic Submission)

## Title
**Facial Recognition–Based Attendance Management System**

## Objective
To design and implement a system that uses **deep learning** for **face detection** and **face recognition** to automatically mark and manage **attendance** for a classroom, with support for **multiple faces in a single frame**, **duplicate prevention**, and **Excel-based reports**.

## Methodology

### Face detection
- **MTCNN** (Multi-task Cascaded CNN) is used to detect all faces in an image. It outputs bounding boxes and optionally landmarks. This allows the system to process a full classroom image and obtain one crop per person.

### Face recognition
- **Facenet** (via DeepFace) is used to compute a **128-dimensional embedding** for each face. Embeddings are stored per student (averaged over multiple registration photos). At attendance time, each detected face is compared to all stored embeddings using **cosine distance** (or Euclidean). If the distance is below a **threshold**, the face is recognized as that student.

### Duplicate prevention
- Attendance is stored as one row per (student, date). When marking from an image, only **Present** is written for recognized students; the rest are filled as **Absent** for that day. A student cannot be marked present more than once per day.

### Accuracy considerations
- **Precision**, **Recall**, and **F1-Score** can be evaluated on a verification task (same/different identity). Threshold and number of registration photos affect these metrics. The report describes how to compute them and how to fine-tune the model for higher accuracy.

## Outcomes
- **Web dashboard** for student registration (with photo upload), attendance marking (image upload), daily records and summary, and **Excel export** (daily and date range) with columns: Student ID, Student Name, Date, Attendance Status.
- **Backend** implemented in **FastAPI** with **SQLite** (or PostgreSQL in production); **role-based login** (Admin/Faculty) is available as an option.
- **Documentation** includes architecture, model explanation (architecture, loss, metrics), and deployment steps for local and cloud use.

## Conclusion
The system meets the requirements of high-accuracy face detection and recognition, multi-face handling, automatic attendance marking with duplicate prevention, and Excel-based reporting, and is suitable for deployment in academic or similar environments.
