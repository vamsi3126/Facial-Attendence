# Fixing Your Supabase Connection String

## Your Current Connection String

```
postgresql://postgres:Vsvg%40face@attendace_db1@db.hgxxzjjvzkaaipxqlwej.supabase.co:5432/postgres
```

## Issue Found

The password appears to have **double `@` symbols**:
- `Vsvg%40face@attendace_db1` decodes to `Vsvg@face@attendace_db1`
- The second `@` is not encoded and breaks the connection string format

## Correct Format

The connection string format is:
```
postgresql://postgres:[ENCODED_PASSWORD]@[HOST]:5432/postgres
```

## Solution

### Option 1: If your password is `Vsvg@face@attendace_db1`

Encode **both** `@` symbols:
```
postgresql://postgres:Vsvg%40face%40attendace_db1@db.hgxxzjjvzkaaipxqlwej.supabase.co:5432/postgres
```

### Option 2: If your password should be `Vsvg@face_attendance_db1` (original)

Encode the single `@`:
```
postgresql://postgres:Vsvg%40face_attendance_db1@db.hgxxzjjvzkaaipxqlwej.supabase.co:5432/postgres
```

### Option 3: Use Python to encode automatically

```python
from urllib.parse import quote_plus

password = "Vsvg@face@attendace_db1"  # or your actual password
encoded = quote_plus(password)
print(f"Encoded: {encoded}")
# Output: Vsvg%40face%40attendace_db1
```

## Quick Fix Script

Run this to test and fix your connection:

```powershell
# Set your actual password (before encoding)
$password = "Vsvg@face@attendace_db1"  # Change to your actual password

# Encode it
$encoded = [System.Web.HttpUtility]::UrlEncode($password)

# Build connection string
$host = "db.hgxxzjjvzkaaipxqlwej.supabase.co"
$conn = "postgresql://postgres:${encoded}@${host}:5432/postgres"

# Set environment variable
$env:DATABASE_URL = $conn
Write-Host "Connection string set: $conn"

# Test connection
python -m scripts.test_supabase_connection
```

## Verify Your Password

1. Go to Supabase Dashboard → **Settings** → **Database**
2. Check the **Database password** field
3. Use that exact password (encode special characters)

## Test Connection

After fixing, test with:

```powershell
# Set the corrected connection string
$env:DATABASE_URL = "postgresql://postgres:Vsvg%40face%40attendace_db1@db.hgxxzjjvzkaaipxqlwej.supabase.co:5432/postgres"

# Test
python -m scripts.test_supabase_connection
```

## For Vercel Deployment

When setting `DATABASE_URL` in Vercel environment variables, use the **fully encoded** version:

```
postgresql://postgres:Vsvg%40face%40attendace_db1@db.hgxxzjjvzkaaipxqlwej.supabase.co:5432/postgres
```
