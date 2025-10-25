# RecovAI Backend Startup Script
Write-Host "`n" -NoNewline
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RecovAI - Backend Server Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-Not (Test-Path "app.py")) {
    Write-Host "❌ Error: app.py not found!" -ForegroundColor Red
    Write-Host "Please run this script from the backend directory" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if database exists
if (-Not (Test-Path "surgical_risk.db")) {
    Write-Host "⚠️  Database not found. Creating sample data..." -ForegroundColor Yellow
    python create_sample_data.py
    Write-Host ""
}

# Check for Gemini API key
if ($env:GEMINI_API_KEY) {
    Write-Host "✅ Gemini API Key: Configured" -ForegroundColor Green
} else {
    Write-Host "⚠️  Gemini API Key: Not Set (using fallback mode)" -ForegroundColor Yellow
    Write-Host "   To enable AI chatbot, run:" -ForegroundColor Gray
    Write-Host "   `$env:GEMINI_API_KEY='your-api-key'" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🚀 Starting Flask Backend Server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Server will run on: http://localhost:5000" -ForegroundColor Green
Write-Host "API endpoints available at: http://localhost:5000/api" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start the Flask server with TensorFlow from virtual environment
if (Test-Path "venv\Scripts\python.exe") {
    Write-Host "✓ Using virtual environment with TensorFlow ML models" -ForegroundColor Green
    ..\backend\venv\Scripts\python app.py
} else {
    Write-Host "⚠ Virtual environment not found, using system Python" -ForegroundColor Yellow
    python app.py
}
