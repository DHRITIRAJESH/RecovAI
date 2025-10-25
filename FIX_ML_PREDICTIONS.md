# 🔧 URGENT: Enable ML Predictions - Fix Required

## Current Status

❌ **TensorFlow NOT working** - ML predictions using mock data  
✅ **Website running** - Backend and frontend operational  
⚠️ **Action Required** - You need to enable Windows Long Paths (takes 2 minutes)

## Why ML Predictions Stopped Working

Your TensorFlow installation is **BLOCKED** by Windows Long Path limitation:

- Windows default: 260 character path limit
- Your Python location: 112 characters
- TensorFlow files: Add 200+ characters
- **Total: Exceeds 260** → Installation fails

## The Fix (Simple - 2 Minutes)

### Step 1: Enable Long Paths (Requires Administrator)

**Right-click PowerShell → "Run as Administrator"**, then run:

```powershell
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

You should see:

```
LongPathsEnabled : 1
```

### Step 2: Restart Your Computer

**IMPORTANT:** You MUST restart for this change to take effect.

### Step 3: Install TensorFlow (After Restart)

Open VS Code normally and run:

```powershell
cd backend
pip install tensorflow-cpu keras numpy pandas scikit-learn PyPDF2
```

This time it will succeed! You'll see:

```
Successfully installed tensorflow-cpu-2.20.0 keras-3.11.3 ...
```

### Step 4: Start Backend with ML Models

```powershell
python app.py
```

You should now see:

```
✓ ML Predictor loaded successfully
✓ Loaded 3 trained models (AKI, Cardiovascular, Transfusion)
✓ Models ready for predictions
```

## Verification Checklist

After completing the fix:

- [ ] Long Paths enabled in registry (check: `Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled"` should show `1`)
- [ ] Computer restarted
- [ ] TensorFlow installed successfully (no errors)
- [ ] Backend shows "✓ ML Predictor loaded successfully"
- [ ] Risk assessment generates REAL predictions (not mock data)

## What You'll See After Fix

**Before (Current - Mock Predictions):**

```
⚠️  ML Predictor not available: No module named 'tensorflow.python'
   System will run without ML prediction features
```

**After (Real ML Predictions):**

```
✓ ML Predictor loaded successfully
✓ Loaded model: model_aki.keras
✓ Loaded model: model_cardiovascular.keras
✓ Loaded model: model_transfusion_required.keras
✓ All models ready for predictions
```

## Why This Happened

1. Windows Store Python has a long installation path
2. TensorFlow has deeply nested folders
3. Combined path exceeds Windows 260-character limit
4. Windows Long Paths was disabled on your system
5. TensorFlow installation failed during file extraction

## Alternative: Use Regular Python (If Preferred)

If you don't want to enable Long Paths, you can:

1. Install Python from python.org (not Windows Store)
2. Install to short path like `C:\Python313`
3. Then install TensorFlow normally

But enabling Long Paths is **easier and recommended** for modern development.

---

## Quick Start After Fix

Once Long Paths is enabled and computer restarted:

```powershell
# Install TensorFlow
cd C:\Users\rajes\OneDrive\Desktop\RecovAI\backend
pip install tensorflow-cpu keras numpy pandas scikit-learn PyPDF2

# Start backend with ML
python app.py

# You should see ML models load successfully!
```

The ML predictions will then work with your actual trained models (`model_aki.keras`, `model_cardiovascular.keras`, `model_transfusion_required.keras`).
