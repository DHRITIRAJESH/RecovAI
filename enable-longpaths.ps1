# Enable Windows Long Paths Support
# This script MUST be run as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Windows Long Paths Enabler for RecovAI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "To run as Administrator:" -ForegroundColor Yellow
    Write-Host "1. Close this window" -ForegroundColor Yellow
    Write-Host "2. Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host "3. Navigate to this folder: cd '$PSScriptRoot'" -ForegroundColor Yellow
    Write-Host "4. Run: .\enable-longpaths.ps1" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✓ Running as Administrator" -ForegroundColor Green
Write-Host ""

# Enable Long Paths in Registry
Write-Host "Enabling Windows Long Paths support..." -ForegroundColor Yellow

try {
    $regPath = "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem"
    $regName = "LongPathsEnabled"
    $regValue = 1
    
    # Check current value
    $currentValue = Get-ItemProperty -Path $regPath -Name $regName -ErrorAction SilentlyContinue
    
    if ($currentValue.$regName -eq 1) {
        Write-Host "✓ Long Paths support is already enabled!" -ForegroundColor Green
    } else {
        # Enable Long Paths
        New-ItemProperty -Path $regPath -Name $regName -Value $regValue -PropertyType DWORD -Force | Out-Null
        Write-Host "✓ Successfully enabled Long Paths support!" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠️  IMPORTANT: You must RESTART your computer for changes to take effect!" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "1. Restart your computer" -ForegroundColor White
    Write-Host "2. Open VS Code" -ForegroundColor White
    Write-Host "3. Open terminal in VS Code" -ForegroundColor White
    Write-Host "4. Run: cd backend" -ForegroundColor White
    Write-Host "5. Run: pip install tensorflow-cpu keras numpy" -ForegroundColor White
    Write-Host "6. Run: python app.py" -ForegroundColor White
    Write-Host ""
    Write-Host "You should see: '✓ ML Predictor loaded successfully'" -ForegroundColor Green
    Write-Host ""
    
} catch {
    Write-Host "❌ ERROR: Failed to enable Long Paths!" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Read-Host "Press Enter to exit"
