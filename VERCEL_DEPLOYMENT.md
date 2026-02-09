# Deploying to Vercel with Supabase

## ⚠️ Important Notes

**Vercel Limitations for ML Applications:**
- **File Storage**: Serverless functions cannot write to filesystem. You'll need to use Supabase Storage or external storage (S3, Cloudinary) for uploads/embeddings/exports.
- **Cold Starts**: ML models (MTCNN, DeepFace, TensorFlow) can cause slow cold starts (10-30 seconds). Consider Vercel Pro plan (60s timeout) or alternative platforms.
- **Memory**: Large dependencies may hit memory limits. Monitor usage in Vercel dashboard.

**Recommended Alternative**: For production ML workloads, consider deploying backend to **Render** or **Railway** (better for long-running processes) and frontend to Vercel.

## Prerequisites

1. **Supabase Project**: Create a project at [supabase.com](https://supabase.com)
   - Project name: `face_attedance_db` (or your choice)
   - Password: `Vsvg@face_attendance_db1` (or your secure password)
   - Region: Asia-Pacific (or closest to your users)
   - Enable Data API (optional, but recommended)

2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)

## Step 1: Get Supabase Connection String

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Find **Connection string** → **URI**
4. Copy the connection string (format: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`)

**Important**: Replace `[PASSWORD]` with your actual password (`Vsvg@face_attendance_db1`). If your password contains special characters, you may need to **percent-encode** them:
- `@` → `%40`
- `#` → `%23`
- etc.

Example connection string:
```
postgresql://postgres:Vsvg%40face_attendance_db1@db.xxxxx.supabase.co:5432/postgres
```

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Navigate to project directory
cd "c:\Users\NAGA VAMSI\Downloads\attendence system"

# Deploy
vercel

# Follow prompts:
# - Link to existing project? (No for first time)
# - Project name: face-attendance-system (or your choice)
# - Directory: ./
# - Override settings? (No)

# Set environment variables
vercel env add DATABASE_URL
# Paste your Supabase connection string when prompted

vercel env add SECRET_KEY
# Enter a secure random string (e.g., generate with: python -c "import secrets; print(secrets.token_urlsafe(32))")

# Deploy to production
vercel --prod
```

### Option B: Using Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository (GitHub/GitLab/Bitbucket)
   - Or upload the project folder directly
3. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: (leave empty or `pip install -r requirements.txt`)
   - **Output Directory**: (leave empty)
   - **Install Command**: `pip install -r requirements.txt`
4. Add Environment Variables:
   - `DATABASE_URL`: Your Supabase connection string (with percent-encoded password)
   - `SECRET_KEY`: A secure random string
5. Click **Deploy**

## Step 3: Configure Environment Variables in Vercel

After deployment, go to your project → **Settings** → **Environment Variables**:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `postgresql://postgres:Vsvg%40face_attendance_db1@[HOST]:5432/postgres` | Replace `[HOST]` with your Supabase host |
| `SECRET_KEY` | `your-secure-random-string` | Generate with: `python -c "import secrets; print(secrets.token_urlsafe(32))"` |

**Important**: Make sure to add these for **Production**, **Preview**, and **Development** environments.

## Step 4: Initialize Database Tables

After first deployment, you need to create the database tables. You can:

### Option 1: Run locally with Supabase connection
```bash
# Set DATABASE_URL temporarily
$env:DATABASE_URL="postgresql://postgres:Vsvg%40face_attendance_db1@[HOST]:5432/postgres"

# Run init script
python -c "import asyncio; from app.database import init_db; asyncio.run(init_db())"
```

### Option 2: Use Supabase SQL Editor
Go to Supabase Dashboard → **SQL Editor** → Run:
```sql
-- Create tables (copy from app/models.py structure)
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
    student_id INTEGER NOT NULL REFERENCES students(id),
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

## Step 5: File Storage (Important)

**Vercel serverless functions are stateless** - uploaded files and embeddings cannot be stored on the filesystem. You have two options:

### Option A: Use Supabase Storage (Recommended)
1. Create a Supabase Storage bucket: `uploads`, `embeddings`, `exports`
2. Update code to use Supabase Storage API instead of local filesystem
3. See `SUPABASE_STORAGE.md` for implementation details

### Option B: Use External Storage
- **AWS S3**, **Cloudinary**, or similar for uploads/embeddings
- Update `app/config.py` and file handling code accordingly

**Note**: For a quick demo, you can temporarily store files in Supabase Storage or use a cloud storage service.

## Step 6: Access Your Deployed App

After deployment, Vercel will provide a URL like:
```
https://face-attendance-system.vercel.app
```

Open this URL in your browser to access the dashboard.

## Troubleshooting

### Issue: "Module not found" or import errors
- Ensure `api/index.py` correctly imports from `app.main`
- Check that all dependencies are in `requirements.txt`

### Issue: Database connection errors
- Verify `DATABASE_URL` is correctly set (with percent-encoded password)
- Check Supabase project is active and database is accessible
- Ensure tables are created (run SQL from Step 4)

### Issue: File uploads not working
- Vercel serverless functions cannot write to filesystem
- Implement Supabase Storage or external storage (see Step 5)

### Issue: Cold start timeouts
- ML models (MTCNN, DeepFace) can cause slow cold starts
- Consider using Vercel Pro plan (60s timeout vs 10s)
- Or deploy to a platform with longer timeouts (Render, Railway, Fly.io)

## Alternative: Deploy Backend Separately

If Vercel limitations are an issue, consider:
- **Backend**: Deploy FastAPI to **Render** or **Railway** (better for ML workloads)
- **Frontend**: Deploy static files to **Vercel** or **Netlify**
- **Database**: Use **Supabase** (as configured)

This gives you more control over runtime, memory, and file storage.
