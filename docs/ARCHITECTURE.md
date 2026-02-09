# System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           WEB DASHBOARD (Browser)                             │
│  Register Student │ Mark Attendance (Image/Upload) │ Records │ Excel Export   │
└─────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FastAPI Backend (Python)                              │
│  /api/students  │  /api/attendance  │  /api/reports  │  /api/auth             │
└─────────────────────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌──────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   SQLite     │    │   Face Engine    │    │  Excel Export    │
│  (Students,  │    │  - MTCNN detect  │    │  (openpyxl /     │
│  Attendance, │    │  - Facenet embed │    │   pandas)        │
│  Users)      │    │  - Match & mark  │    │  exports/*.xlsx  │
└──────────────┘    └─────────────────┘    └─────────────────┘
         │                    │
         │                    ▼
         │           ┌─────────────────┐
         │           │  uploads/       │  (student photos)
         │           │  embeddings/    │  (*.npy, *.name)
         └───────────┴─────────────────┘
```

## Data Flow

### 1. Student Registration
- User submits **Student ID** and **Name** → stored in `students` table.
- User uploads **multiple photos** → saved under `uploads/<student_id>/`.
- For each photo, **MTCNN** detects face(s); **Facenet** extracts embedding.
- **Mean embedding** across all faces is stored in `embeddings/<student_id>.npy` and name in `embeddings/<student_id>.name`.

### 2. Marking Attendance
- User uploads a **classroom image** (or provides a camera frame).
- **MTCNN** detects all faces in the image.
- For each face crop, **Facenet** computes embedding.
- Each embedding is **matched** against all stored embeddings (cosine or euclidean distance).
- If distance below **threshold** → student marked **Present** for that day (no duplicate).
- All other registered students get **Absent** for that day (ensures full roster in Excel).

### 3. Reports & Excel
- **Daily**: One row per student for the chosen date (Present/Absent).
- **Range**: Rows for each (student × date) in the range.
- Columns: **Student ID**, **Student Name**, **Date**, **Attendance Status**.
- File generated with **pandas + openpyxl** and served for download.

## Component Summary

| Component        | Technology        | Role                                      |
|-----------------|-------------------|-------------------------------------------|
| Frontend        | HTML/CSS/JS       | Dashboard, forms, file upload, tables     |
| API             | FastAPI            | REST endpoints, async I/O                |
| Database        | SQLite (async)     | Students, Attendance, Users              |
| Face detection  | MTCNN              | Multi-face bounding boxes                 |
| Face recognition| DeepFace (Facenet) | 128-d embeddings, similarity              |
| Excel           | pandas, openpyxl   | .xlsx generation                          |

## Security Notes

- Passwords hashed with **bcrypt**; JWT for auth (optional role-based: Admin/Faculty).
- Upload directories and exports should be outside public web root in production.
- Use **HTTPS** and set **SECRET_KEY** via environment in production.
