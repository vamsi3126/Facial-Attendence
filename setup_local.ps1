# Quick setup script for local development with Supabase
# Run: .\setup_local.ps1

Write-Host "🚀 Setting up Facial Recognition Attendance System with Supabase" -ForegroundColor Cyan
Write-Host ""

# Set connection string
$DATABASE_URL = "postgresql://postgres:Vsvg%40face_attendace_db1@db.hgxxzjjvzkaaipxqlwej.supabase.co:5432/postgres"
$env:DATABASE_URL = $DATABASE_URL

Write-Host "✅ DATABASE_URL environment variable set" -ForegroundColor Green
Write-Host ""

# Test connection
Write-Host "🔗 Testing database connection..." -ForegroundColor Yellow
python -m scripts.test_supabase_connection

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Connection successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Initialize database tables: python -m scripts.init_supabase_db"
    Write-Host "  2. Run server: python -m uvicorn app.main:app --reload"
    Write-Host "  3. Open: http://localhost:8000"
} else {
    Write-Host ""
    Write-Host "❌ Connection failed. Check your Supabase settings." -ForegroundColor Red
}
