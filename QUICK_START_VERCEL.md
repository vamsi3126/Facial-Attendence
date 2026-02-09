# Quick Start: Deploy to Vercel + Supabase

## 1. Get Supabase Connection String

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select project: `face_attedance_db`
3. **Settings** → **Database** → **Connection string** → **URI**
4. Copy and replace password with encoded version:
   - Password: `Vsvg@face_attendance_db1`
   - Encoded: `Vsvg%40face_attendance_db1`
   - Full string: `postgresql://postgres:Vsvg%40face_attendance_db1@[YOUR_HOST]:5432/postgres`

## 2. Deploy to Vercel

### Using CLI (Fastest)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd "c:\Users\NAGA VAMSI\Downloads\attendence system"
vercel

# Set environment variables
vercel env add DATABASE_URL
# Paste: postgresql://postgres:Vsvg%40face_attendance_db1@[HOST]:5432/postgres

vercel env add SECRET_KEY
# Generate: python -c "import secrets; print(secrets.token_urlsafe(32))"

# Deploy to production
vercel --prod
```

### Using Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import Git repo or upload folder
3. **Framework**: Other
4. **Environment Variables**:
   - `DATABASE_URL`: `postgresql://postgres:Vsvg%40face_attendance_db1@[HOST]:5432/postgres`
   - `SECRET_KEY`: (generate secure random string)
5. **Deploy**

## 3. Initialize Database

After deployment, run SQL in Supabase Dashboard → **SQL Editor**:

```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'faculty',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Present',
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(50),
    UNIQUE(student_id, date)
);

CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);
```

## 4. Access Your App

Your app will be available at:
```
https://[your-project].vercel.app
```

## 5. File Storage Setup (Required)

**Vercel serverless functions cannot store files locally.** You need to:

1. **Create Supabase Storage buckets**:
   - Go to Supabase Dashboard → **Storage**
   - Create buckets: `uploads`, `embeddings`, `exports`

2. **Update code** to use Supabase Storage API (or use external storage like S3)

**Quick workaround**: For testing, you can temporarily store files in Supabase Storage or use a cloud storage service.

## Troubleshooting

- **Import errors**: Check `api/index.py` imports `app.main` correctly
- **Database errors**: Verify `DATABASE_URL` has encoded password (`%40` for `@`)
- **File upload errors**: Implement Supabase Storage (see Step 5)
- **Cold start timeouts**: Upgrade to Vercel Pro or use Render/Railway for backend

## Next Steps

- See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for detailed guide
- See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for database details
