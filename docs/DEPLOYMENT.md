# Deployment Guide

## Local Run

### 1. Prerequisites
- Python 3.10+
- pip

### 2. Setup
```bash
cd "attendence system"
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
# source venv/bin/activate

pip install -r requirements.txt
```

### 3. Run server
```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Dashboard: **http://localhost:8000**
- API docs: **http://localhost:8000/docs**

### 4. First use
- Register a user (optional): `POST /api/auth/register`
- Create students and upload photos via dashboard or API.
- Mark attendance by uploading a classroom image; export Excel from Reports.

---

## Environment Variables

| Variable       | Description                    | Default (example)        |
|----------------|--------------------------------|---------------------------|
| `SECRET_KEY`   | JWT signing key                 | (dev default in code)     |
| `DATABASE_URL` | DB connection                  | `sqlite+aiosqlite:///...` |
| `PORT`         | Server port (e.g. Render)      | 8000                      |

---

## Cloud Deployment (e.g. Render, Railway, Fly.io)

### General
1. Use **PostgreSQL** in production: set `DATABASE_URL=postgresql+asyncpg://...`
2. Set **SECRET_KEY** in environment.
3. Mount or persist **uploads/** and **embeddings/** and **exports/** (or use object storage).
4. Run: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Render (example)
- **Web Service**; build: `pip install -r requirements.txt`
- Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Add **PostgreSQL** and set `DATABASE_URL`; add env **SECRET_KEY**.

### AWS / Azure
- Deploy FastAPI (e.g. container or serverless with Mangum).
- Use RDS/Azure DB for PostgreSQL; S3/Blob for uploads/embeddings/exports if needed.
- Ensure **HTTPS** and secure **SECRET_KEY**.

---

## Real-Time Camera (optional)

- Frontend: use **getUserMedia()** to capture from webcam; send frames as images to `POST /api/attendance/mark-from-image` (e.g. every N seconds or on button click).
- Backend: same pipeline (MTCNN + Facenet); no change required.

---

## Anti-Spoofing (optional)

- Add a **liveness** check: e.g. blink detection or short video with motion.
- Or use a dedicated **anti-spoofing model** (binary: real face vs photo/screen) before running recognition; integrate in `face_engine` before matching.
