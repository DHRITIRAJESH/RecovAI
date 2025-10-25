# 🚀 Quick Start Guide - RecovAI

Follow these steps to get RecovAI running on your system.

## Step 1: Backend Setup (5 minutes)

Open PowerShell and run:

```powershell
# Navigate to backend
cd "c:\Users\rajes\OneDrive\Desktop\RecovAI\backend"

# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Initialize database & create sample doctor
python database.py

# Create sample patients (optional)
python create_sample_data.py

# Start the server
python app.py
```

✅ Backend running at: http://localhost:5000

## Step 2: Frontend Setup (3 minutes)

Open a **NEW** PowerShell window and run:

```powershell
# Navigate to frontend
cd "c:\Users\rajes\OneDrive\Desktop\RecovAI\frontend"

# Install dependencies
npm install

# Start development server
npm run dev
```

✅ Frontend running at: http://localhost:3000

## Step 3: Access the System

Open your browser and go to: **http://localhost:3000**

### Login as Doctor:

- Email: `dr.smith@hospital.com`
- Password: `doctor123`

### Login as Patient (if you created sample data):

- Email: `john.doe@email.com`
- Password: `patient123`

## 🎯 What to Try

### As Doctor:

1. ✅ View patient list
2. ✅ Add a new patient
3. ✅ Generate risk assessment
4. ✅ Review clinical recommendations

### As Patient:

1. ✅ View surgery information
2. ✅ Generate lifestyle plan
3. ✅ Explore recovery timeline
4. ✅ Check warning signs

## 🔧 Troubleshooting

### "Module not found" errors:

```powershell
pip install -r requirements.txt --upgrade
```

### Backend won't start:

Make sure you activated the virtual environment:

```powershell
.\venv\Scripts\Activate.ps1
```

### Frontend errors:

```powershell
rm -r node_modules
npm install
```

### Port already in use:

Kill the process or change the port in `vite.config.js` (frontend) or `app.py` (backend)

## 📝 Notes

- The system will work even if ML model files (.keras) are missing - it will show warnings but continue
- Sample data creates 6 diverse patients with different risk profiles
- All data is stored in `backend/surgical_risk.db`
- Session expires after 24 hours

## 🎓 Next Steps

1. Read the full README.md for detailed documentation
2. Explore the API endpoints
3. Test different patient scenarios
4. Review the clinical recommendations logic

---

**Need Help?** Check the main README.md or review the code comments for detailed explanations.
