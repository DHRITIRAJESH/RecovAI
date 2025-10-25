# 🔧 Fix TensorFlow Installation Issue (Windows Long Path)

## ❌ Current Problem

**Error**: `ModuleNotFoundError: No module named 'tensorflow.python'`

**Root Cause**: Windows Long Path limitation (260 characters max)

TensorFlow has very long file paths that exceed Windows' 260-character limit, preventing proper installation on Python 3.13.

---

## ✅ Solution: Enable Windows Long Paths

### Option 1: Enable via Registry (Requires Admin - RECOMMENDED)

1. **Right-click** on PowerShell or Command Prompt
2. Select **"Run as Administrator"**
3. Run this command:
   ```powershell
   reg add HKLM\SYSTEM\CurrentControlSet\Control\FileSystem /v LongPathsEnabled /t REG_DWORD /d 1 /f
   ```
4. **Restart your computer**
5. After restart, install TensorFlow:
   ```powershell
   cd C:\Users\rajes\OneDrive\Desktop\RecovAI\backend
   python -m pip install --upgrade tensorflow
   ```

### Option 2: Enable via Group Policy Editor (Windows Pro)

1. Press **Win + R**, type `gpedit.msc`, press Enter
2. Navigate to: **Computer Configuration → Administrative Templates → System → Filesystem**
3. Find: **"Enable Win32 long paths"**
4. Double-click it, select **"Enabled"**
5. Click **Apply** and **OK**
6. **Restart your computer**
7. Install TensorFlow as in Option 1 step 5

### Option 3: Use Python 3.11 Instead (Easier, No Admin Needed)

Python 3.13 is very new. TensorFlow works better with Python 3.11:

1. **Uninstall Python 3.13** (from Windows Settings → Apps)
2. **Download Python 3.11.9** from: https://www.python.org/downloads/release/python-3119/
3. During installation, check **"Add Python to PATH"**
4. Install dependencies:
   ```powershell
   cd C:\Users\rajes\OneDrive\Desktop\RecovAI\backend
   python -m pip install -r requirements.txt
   ```

---

## 🚀 After Fixing TensorFlow

### Start the Backend:

```powershell
cd C:\Users\rajes\OneDrive\Desktop\RecovAI\backend
python app.py
```

You should see:

```
✓ ML Models loaded successfully
  - AKI Prediction Model
  - Cardiovascular Complication Model
  - Blood Transfusion Model
 * Running on http://127.0.0.1:5000
```

### Start the Frontend (Already Running):

The frontend is already running on **http://localhost:3000**

---

## 🌐 Access RecovAI

Once both servers are running:

1. **Open browser**: http://localhost:3000
2. **Login** with:
   - **Patient**: `john.doe@email.com` / `patient123`
   - **Doctor**: `dr.smith@hospital.com` / `doctor123`
   - **Admin**: `admin@hospital.com` / `admin123`

---

## 🗺️ Test the Google Maps Feature

After logging in as a patient:

1. Click **"📍 Find Nearby Centers"** tab
2. You should see a **REAL Google Maps** (not a placeholder!)
3. **But wait!** You need to add your Google Maps API key first

### Get Your Google Maps API Key:

1. Go to: https://console.cloud.google.com/
2. Create project: "RecovAI"
3. Enable: "Maps JavaScript API"
4. Create API Key
5. Open: `C:\Users\rajes\OneDrive\Desktop\RecovAI\frontend\.env`
6. Replace:
   ```
   VITE_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY_HERE
   ```
7. Save and refresh browser

**See `QUICK_START_MAPS.md` for detailed Google Maps setup!**

---

## ✅ Quick Test (Frontend Only - No ML Features)

If you can't fix TensorFlow right now, you can still test the website with limited features:

**What Works**:

- ✅ Login/Logout
- ✅ Patient Portal (without risk assessment)
- ✅ Doctor Dashboard (without risk predictions)
- ✅ ICU Management
- ✅ **Google Maps** (after adding API key)
- ✅ Chatbot (limited without ML)

**What Doesn't Work** (requires backend):

- ❌ Risk Assessment
- ❌ ML Predictions (AKI, Cardiovascular, Transfusion)
- ❌ Blood Report Upload
- ❌ Patient data from database

---

## 📋 Summary

**Current Status**:

- ✅ Frontend: Running on port 3000
- ❌ Backend: Not running (TensorFlow error)
- 🗺️ Google Maps: Ready (need API key)

**Next Steps**:

1. **Fix TensorFlow** using Option 1, 2, or 3 above
2. **Start backend**: `python app.py`
3. **Add Google Maps API key** to `.env`
4. **Open browser**: http://localhost:3000
5. **Login and test** all features!

---

**Need help? Check these guides**:

- `QUICK_START_MAPS.md` - Google Maps setup
- `GOOGLE_MAPS_SETUP.md` - Detailed Maps API guide
- `REAL_MAPS_IMPLEMENTATION.md` - Technical details
