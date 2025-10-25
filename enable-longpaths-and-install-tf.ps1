# Enable Windows Long Paths Support
# Run this script as Administrator

Write-Host "Enabling Windows Long Paths..." -ForegroundColor Cyan

try {
    # Enable Long Paths in Registry
    New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
                     -Name "LongPathsEnabled" `
                     -Value 1 `
                     -PropertyType DWORD `
                     -Force | Out-Null
    
    Write-Host "✅ Long Paths enabled successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Now installing TensorFlow..." -ForegroundColor Cyan
    
    # Install TensorFlow
    pip install tensorflow keras numpy
    
    Write-Host ""
    Write-Host "✅ Installation complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Please restart your terminal and run:" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor White
    Write-Host "  python app.py" -ForegroundColor White
    
} catch {
    Write-Host "❌ Failed to enable Long Paths" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please run this script as Administrator:" -ForegroundColor Yellow
    Write-Host "1. Right-click PowerShell" -ForegroundColor White
    Write-Host "2. Select 'Run as Administrator'" -ForegroundColor White
    Write-Host "3. Navigate to this folder and run:" -ForegroundColor White
    Write-Host "   .\enable-longpaths-and-install-tf.ps1" -ForegroundColor White
}
