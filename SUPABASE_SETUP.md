# Supabase Database Setup

## Connection String Format

Your Supabase connection string should look like:
```
postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
```

### Password Encoding

If your password contains special characters (like `@`, `#`, `%`), you need to **percent-encode** them:

| Character | Encoded |
|-----------|---------|
| `@` | `%40` |
| `#` | `%23` |
| `%` | `%25` |
| `&` | `%26` |
| `+` | `%2B` |
| `=` | `%3D` |

**Your password**: `Vsvg@face_attendance_db1`
**Encoded**: `Vsvg%40face_attendance_db1`

### Example Connection String

```
postgresql://postgres:Vsvg%40face_attendance_db1@db.xxxxx.supabase.co:5432/postgres
```

Replace `db.xxxxx.supabase.co` with your actual Supabase host (found in Supabase Dashboard → Settings → Database).

## Getting Your Connection String

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project (`face_attedance_db`)
3. Go to **Settings** → **Database**
4. Scroll to **Connection string** → **URI**
5. Copy the string and replace `[PASSWORD]` with your encoded password

## Database Tables

After connecting, run this SQL in Supabase SQL Editor to create tables:

```sql
-- Users table (for authentication)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'faculty',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Present',
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(50),
    UNIQUE(student_id, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance(student_id, date);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

## Testing Connection

You can test the connection locally:

```bash
# Set environment variable
$env:DATABASE_URL="postgresql://postgres:Vsvg%40face_attendance_db1@[YOUR_HOST]:5432/postgres"

# Run Python to test
python -c "import asyncio; from app.database import init_db; asyncio.run(init_db()); print('Tables created successfully!')"
```

## Storage Buckets (Optional)

For file uploads (student photos, embeddings, Excel exports), create Supabase Storage buckets:

1. Go to **Storage** in Supabase Dashboard
2. Create buckets:
   - `uploads` (public or private)
   - `embeddings` (private)
   - `exports` (public, for Excel downloads)

Then update the code to use Supabase Storage API instead of local filesystem (see `VERCEL_DEPLOYMENT.md` Step 5).
