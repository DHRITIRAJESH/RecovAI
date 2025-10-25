# RecovAI Frontend Startup Script
Write-Host "`n" -NoNewline
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RecovAI - Frontend Server Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-Not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found!" -ForegroundColor Red
    Write-Host "Please run this script from the frontend directory" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if node_modules exists
if (-Not (Test-Path "node_modules")) {
    Write-Host "⚠️  Dependencies not installed. Installing..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

Write-Host "🚀 Starting React Development Server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend will run on: http://localhost:3000" -ForegroundColor Green
Write-Host "Make sure backend is running on: http://localhost:5000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start the development server
npm run dev
