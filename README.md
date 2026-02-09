# Facial Recognition–Based Attendance Management System

A high-accuracy, deep learning–based system that detects and recognizes multiple faces in a single frame (classroom scenario), compares them with registered students, and marks attendance automatically with Excel export and a web dashboard.

## Features

- **Multi-face detection & recognition** in one frame (MTCNN + FaceNet/DeepFace)
- **Duplicate prevention**: one attendance mark per student per day
- **Student registration** with multiple photo uploads; face embeddings stored
- **Attendance output**: auto-generated Excel (.xlsx) with Student ID, Name, Date, Status
- **Web dashboard**: registration, live/image upload, daily/monthly summary, charts
- **Role-based login** (Admin / Faculty) – optional
- **Deployment**: run locally or deploy to cloud (Vercel + Supabase, Render, AWS, Azure)

## Quick Start

### Local Development with Supabase

```powershell
# 1. Install dependencies
pip install -r requirements.txt

# 2. Set Supabase connection (Windows PowerShell)
$env:DATABASE_URL="postgresql://postgres:Vsvg%40face_attendace_db1@db.hgxxzjjvzkaaipxqlwej.supabase.co:5432/postgres"

# Or use the setup script:
.\setup_local.ps1

# 3. Test connection
python -m scripts.test_supabase_connection

# 4. Initialize database tables
python -m scripts.init_supabase_db

# 5. Run server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Open dashboard: http://localhost:8000
```

### Using SQLite (Local Testing)

```bash
# Create virtual environment (recommended)
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Run backend (uses SQLite by default)
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Open dashboard: http://localhost:8000
```

## Project Structure

```
attendence system/
├── app/
│   ├── main.py              # FastAPI app entry
│   ├── config.py            # Settings
│   ├── database.py          # SQLAlchemy + SQLite/PostgreSQL (Supabase)
│   ├── models.py            # Student, Attendance, User
│   ├── schemas.py           # Pydantic schemas
│   ├── routers/
│   │   ├── auth.py          # Login / roles
│   │   ├── students.py      # Registration, list
│   │   ├── attendance.py    # Mark attendance, reports
│   │   └── reports.py       # Excel export
│   ├── services/
│   │   ├── face_engine.py   # Detection + recognition pipeline
│   │   ├── attendance_service.py
│   │   └── excel_export.py
│   └── ml/
│       ├── detector.py      # MTCNN wrapper
│       └── recognizer.py    # DeepFace/FaceNet embeddings
├── static/                  # Frontend assets
├── templates/               # HTML (if using Jinja)
├── uploads/                 # Student photos (gitignore)
├── embeddings/              # Stored face vectors (gitignore)
├── exports/                 # Generated Excel (gitignore)
├── docs/
│   ├── ARCHITECTURE.md      # System architecture
│   ├── MODEL_EXPLANATION.md # DL models, loss, accuracy
│   └── DEPLOYMENT.md        # Local & cloud deployment
├── api/                 # Vercel serverless entry point
│   └── index.py
├── vercel.json          # Vercel configuration
├── requirements.txt
├── README.md
├── VERCEL_DEPLOYMENT.md # Vercel + Supabase guide
└── SUPABASE_SETUP.md    # Supabase database setup
```

## Documentation

- [Architecture](docs/ARCHITECTURE.md) – high-level design and data flow
- [Model Explanation](docs/MODEL_EXPLANATION.md) – CNN/face detector & recognizer, loss, tuning
- [Deployment](docs/DEPLOYMENT.md) – local run and cloud deployment
- [Vercel + Supabase Deployment](VERCEL_DEPLOYMENT.md) – step-by-step guide for Vercel + Supabase
- [Supabase Setup](SUPABASE_SETUP.md) – database connection and table creation
- [Connection Setup](SETUP_CONNECTION.md) – quick guide for your Supabase connection string
- [Accuracy Metrics](docs/MODEL_EXPLANATION.md#accuracy-evaluation) – Precision, Recall, F1

## License

Academic / educational use.
