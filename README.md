# Facial Recognition–Based Attendance Management System

A high-accuracy, deep learning–based system that detects and recognizes multiple faces in a single frame (classroom scenario), compares them with registered students, and marks attendance automatically with Excel export and a web dashboard.

## Features

- **Frontend (Web)**:
  - **Teacher Login**: Capture Group Photo (Camera/Upload), View Attendance, Download Excel.
  - **Director Login**: Capture Individual Photo (Camera/Upload), Add/Manage Students.
  - **Camera Integration**: Built-in support for webcam capture.
- **Backend (FastAPI)**:
  - **Face Detection & Recognition**: MTCNN + FaceNet/DeepFace.
  - **Role-Based Auth**: Secure JWT authentication for Admin and Faculty.
- **Database**:
  - **PostgreSQL (Supabase)**: User management, Student data, Attendance records.
  - **pgvector**: Vector similarity search for face embeddings (optional but supported).

## Quick Start

### 1. Local Development Setup

```powershell
# 1. Install dependencies
pip install -r requirements.txt

# 2. Set Database Connection
# Create a .env file or set environment variable:
$env:DATABASE_URL="postgresql+asyncpg://user:password@host:port/dbname"

# 3. Initialize Database
python -m scripts.init_supabase_db

# 4. Create First Admin User
python -m scripts.create_admin

# 5. Run Server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 6. Open Dashboard
# http://localhost:8000
# Login with the credentials created in step 4.
```

### 2. Enable pgvector (Optional)

To store face embeddings in the database instead of local files (recommended for production):

1.  Run the setup script in your SQL editor (e.g., Supabase SQL Editor):
    ```sql
    -- Copy contents from:
    scripts/setup_pgvector.sql
    ```
2.  The application is configured to support the vector column (`app/models.py`).

## Project Structure

```
attendence system/
├── app/
│   ├── routers/         # API Endpoints (Auth, Students, Attendance)
│   ├── services/        # Business Logic (Face Engine, Excel)
│   ├── models.py        # Database Models (User, Student, Attendance)
│   └── ...
├── static/              # Frontend (Login, Dashboard, Camera Logic)
├── scripts/             # Setup Utilities (Init DB, Create Admin, pgvector)
└── ...
```
