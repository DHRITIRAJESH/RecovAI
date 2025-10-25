@echo off
REM Start RecovAI Backend with TensorFlow from Virtual Environment
echo ========================================
echo Starting RecovAI Backend with ML Models
echo ========================================
echo.

cd /d "%~dp0backend"

if exist "venv\Scripts\python.exe" (
    echo Using virtual environment...
    venv\Scripts\python.exe app.py
) else (
    echo Virtual environment not found!
    echo Please run: python -m venv backend\venv
    echo Then run: backend\venv\Scripts\pip install tensorflow-cpu flask flask-cors keras numpy pandas scikit-learn PyPDF2
    pause
)
