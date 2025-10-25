@echo off
cd /d %~dp0
cd backend
echo ========================================
echo Starting RecovAI Backend with TensorFlow ML Models
echo ========================================
echo.
echo Current directory: %CD%
echo.
echo Loading TensorFlow models...
echo This may take 10-15 seconds...
echo.
..\backend\venv\Scripts\python.exe app.py

