# 🚀 How to Run RecovAI Website

## Quick Start Guide

### ✅ Prerequisites

- Python 3.x installed
- Node.js and npm installed
- Both backend and frontend folders ready

---

## 📝 Step-by-Step Instructions

### **Step 1: Start the Backend Server**

Open a **PowerShell terminal** and run:

```powershell
# Navigate to backend folder
cd C:\Users\rajes\OneDrive\Desktop\RecovAI\backend

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Set Gemini API key (required for chatbot)
$env:GEMINI_API_KEY="AIzaSyAaJcKBydblvrS0jZNMVaN8LTYU0pHvOUw"

# Start the Flask server
python app.py
```

**✅ You should see:**

```
* Running on http://127.0.0.1:5000
* Running on http://0.0.0.0:5000
```

**Keep this terminal window open!** The backend is now running.

---

### **Step 2: Start the Frontend Server**

Open a **NEW PowerShell terminal** (keep the first one running) and run:

```powershell
# Navigate to frontend folder
cd C:\Users\rajes\OneDrive\Desktop\RecovAI\frontend

# Start the Vite dev server
npm run dev
```

**✅ You should see:**

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3004/
  ➜  Network: use --host to expose
```

---

### **Step 3: Open the Website**

Open your web browser and go to:

```
http://localhost:3004
```

---

## 👥 Login Credentials

### **Admin Portal** (ICU Dashboard)

- Email: `admin@hospital.com`
- Password: `admin123`
- Route: `/admin/dashboard`

### **Doctor Portal**

- Email: `dr.smith@hospital.com`
- Password: `doctor123`
- Features: Add patients, view risk assessments

### **Patient Portal**

- Email: `john.doe@email.com`
- Password: `patient123`
- Features: View surgery details, AI chatbot, lifestyle plans

---

## 🛠️ Troubleshooting

### **Backend not starting?**

```powershell
# Make sure you're in the backend folder
cd backend

# Check if virtual environment exists
dir venv

# Reinstall dependencies if needed
.\venv\Scripts\pip.exe install -r requirements.txt
```

### **Frontend not starting?**

```powershell
# Make sure you're in the frontend folder
cd frontend

# Reinstall dependencies
npm install

# Try again
npm run dev
```

### **Port already in use?**

```powershell
# Check what's using port 5000 (backend)
netstat -ano | findstr :5000

# Check what's using port 3004 (frontend)
netstat -ano | findstr :3004

# Kill the process if needed (replace PID with actual process ID)
Stop-Process -Id PID -Force
```

### **Database errors?**

```powershell
# Recreate the database
cd backend
.\venv\Scripts\Activate.ps1
python database.py
python create_sample_data.py
```

---

## 🎯 Quick Access URLs

| Service            | URL                                    | Purpose            |
| ------------------ | -------------------------------------- | ------------------ |
| **Frontend**       | http://localhost:3004                  | Main website       |
| **Backend API**    | http://localhost:5000                  | REST API endpoints |
| **Admin Login**    | http://localhost:3004/admin/login      | Admin portal       |
| **ICU Dashboard**  | http://localhost:3004/admin/dashboard  | ICU bed management |
| **Doctor Portal**  | http://localhost:3004/doctor/dashboard | Doctor dashboard   |
| **Patient Portal** | http://localhost:3004/patient/portal   | Patient portal     |

---

## 📋 Startup Scripts (Recommended)

### **Windows PowerShell Scripts:**

#### `start-backend.ps1` (already exists)

```powershell
cd C:\Users\rajes\OneDrive\Desktop\RecovAI\backend
.\venv\Scripts\Activate.ps1
$env:GEMINI_API_KEY="AIzaSyAaJcKBydblvrS0jZNMVaN8LTYU0pHvOUw"
python app.py
```

#### `start-frontend.ps1` (already exists)

```powershell
cd C:\Users\rajes\OneDrive\Desktop\RecovAI\frontend
npm run dev
```

**Usage:**

```powershell
# Terminal 1: Start backend
cd backend
.\start-backend.ps1

# Terminal 2: Start frontend
cd frontend
.\start-frontend.ps1
```

---

## 🔍 Verify Everything is Working

### **1. Check Backend Health**

Open browser: http://localhost:5000/api/health
Should return: `{"status": "healthy"}`

### **2. Check Frontend**

Open browser: http://localhost:3004
Should see: RecovAI login page

### **3. Test Login**

- Use doctor credentials: `dr.smith@hospital.com` / `doctor123`
- Should redirect to doctor dashboard

### **4. Test ICU Dashboard**

- Login as admin: `admin@hospital.com` / `admin123`
- Navigate to ICU Dashboard
- Should see bed status, waitlist, forecast tabs

---

## ⚡ One-Command Startup (Advanced)

Create a `start-all.ps1` file:

```powershell
# Start backend in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\rajes\OneDrive\Desktop\RecovAI\backend; .\venv\Scripts\Activate.ps1; `$env:GEMINI_API_KEY='AIzaSyAaJcKBydblvrS0jZNMVaN8LTYU0pHvOUw'; python app.py"

# Wait 5 seconds for backend to start
Start-Sleep -Seconds 5

# Start frontend in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\rajes\OneDrive\Desktop\RecovAI\frontend; npm run dev"

# Wait 3 seconds then open browser
Start-Sleep -Seconds 3
Start-Process "http://localhost:3004"
```

Then run:

```powershell
.\start-all.ps1
```

---

## 📊 System Status Check

### **Is everything running?**

```powershell
# Check both servers
netstat -ano | findstr ":5000 :3004"
```

**Expected output:**

```
TCP    0.0.0.0:5000    LISTENING
TCP    [::1]:3004      LISTENING
```

---

## 🎉 You're All Set!

Your RecovAI application should now be running at:

### **http://localhost:3004**

Enjoy exploring the Smart ICU Bed Management System! 🏥✨

---

## 📞 Need Help?

If you encounter any issues:

1. Check both terminal windows for error messages
2. Verify Python and Node.js are installed: `python --version` and `node --version`
3. Make sure ports 5000 and 3004 are not blocked by firewall
4. Try restarting both servers
5. Check the troubleshooting section above
