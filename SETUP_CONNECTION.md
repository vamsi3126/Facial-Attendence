# Setting Up Supabase Connection

## Your Connection String

```
postgresql://postgres:Vsvg%40face_attendace_db1@db.hgxxzjjvzkaaipxqlwej.supabase.co:5432/postgres
```

✅ This connection string is correctly formatted!

## Step 1: Test Connection Locally

### Windows PowerShell:

```powershell
# Set environment variable
$env:DATABASE_URL="postgresql://postgres:Vsvg%40face_attendace_db1@db.hgxxzjjvzkaaipxqlwej.supabase.co:5432/postgres"

# Test connection
python -m scripts.test_supabase_connection
```

### Windows CMD:

```cmd
set DATABASE_URL=postgresql://postgres:Vsvg%40face_attendace_db1@db.hgxxzjjvzkaaipxqlwej.supabase.co:5432/postgres
python -m scripts.test_supabase_connection
```

### Linux/Mac:

```bash
export DATABASE_URL="postgresql://postgres:Vsvg%40face_attendace_db1@db.hgxxzjjvzkaaipxqlwej.supabase.co:5432/postgres"
python -m scripts.test_supabase_connection
```

## Step 2: Initialize Database Tables

After confirming connection works, create tables:

```powershell
# With DATABASE_URL set
python -m scripts.init_supabase_db
```

Or run SQL directly in Supabase Dashboard → SQL Editor (see `SUPABASE_SETUP.md`).

## Step 3: Run Application Locally

```powershell
# Set DATABASE_URL (if not already set)
$env:DATABASE_URL="postgresql://postgres:Vsvg%40face_attendace_db1@db.hgxxzjjvzkaaipxqlwej.supabase.co:5432/postgres"

# Run server
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open: http://localhost:8000

## Step 4: Deploy to Vercel

### Using Vercel CLI:

```powershell
# Login
vercel login

# Deploy
cd "c:\Users\NAGA VAMSI\Downloads\attendence system"
vercel

# Set environment variables
vercel env add DATABASE_URL
# Paste: postgresql://postgres:Vsvg%40face_attendace_db1@db.hgxxzjjvzkaaipxqlwej.supabase.co:5432/postgres

vercel env add SECRET_KEY
# Generate: python -c "import secrets; print(secrets.token_urlsafe(32))"

# Deploy to production
vercel --prod
```

### Using Vercel Dashboard:

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://postgres:Vsvg%40face_attendace_db1@db.hgxxzjjvzkaaipxqlwej.supabase.co:5432/postgres`
   - **Environments**: Production, Preview, Development
5. Add:
   - **Name**: `SECRET_KEY`
   - **Value**: (generate secure random string)
6. **Deploy**

## Troubleshooting

### Connection fails?
- ✅ Verify password encoding: `@` = `%40`
- ✅ Check Supabase project is active
- ✅ Verify host: `db.hgxxzjjvzkaaipxqlwej.supabase.co`
- ✅ Check firewall/network allows PostgreSQL connections

### Tables not found?
- Run initialization script: `python -m scripts.init_supabase_db`
- Or run SQL from `SUPABASE_SETUP.md` in Supabase SQL Editor

### Vercel deployment issues?
- Ensure `DATABASE_URL` is set in Vercel environment variables
- Check `vercel.json` configuration
- Verify `api/index.py` exists and imports correctly

## Next Steps

1. ✅ Test connection locally
2. ✅ Initialize database tables
3. ✅ Run app locally
4. ✅ Deploy to Vercel
5. ⚠️ Set up file storage (Supabase Storage or S3) - required for Vercel
