# 🚀 RecovAI - Quick Start Guide

## ⚡ Get Started in 3 Minutes!

### Step 1: Start the Backend (Terminal 1)

**Windows PowerShell:**

```powershell
cd backend
.\start-backend.ps1
```

**Alternative (if script doesn't work):**

```powershell
cd backend
python app.py
```

✅ **You should see:**

```
🏥 Surgical Risk Prediction System - Backend Server
============================================================
✅ Database initialized successfully
✅ ML models loaded (using fallback predictions)
✅ Chatbot initialized successfully
 * Running on http://127.0.0.1:5000
```

---

### Step 2: Start the Frontend (Terminal 2)

**Open a NEW terminal and run:**

**Windows PowerShell:**

```powershell
cd frontend
.\start-frontend.ps1
```

**Alternative:**

```powershell
cd frontend
npm run dev
```

✅ **You should see:**

```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

---

### Step 3: Open the Application

Open your browser and go to: **http://localhost:3000**

---

## 👤 Login Credentials

### Doctor Account

```
Email: dr.smith@hospital.com
Password: doctor123
```

**What you can do:**

- ✅ View all patients
- ✅ Add new patients
- ✅ Generate risk assessments
- ✅ Create lifestyle plans

### Patient Account

```
Email: john.doe@email.com
Password: patient123
```

**What you can do:**

- ✅ View surgery details
- ✅ See risk assessment
- ✅ View lifestyle plan
- ✅ Chat with AI assistant 🤖

---

## 🤖 Test the AI Chatbot

1. **Login as patient** (`john.doe@email.com`)
2. **Click the chat bubble** in the bottom-right corner
3. **Try these questions:**

**Safe Questions:**

```
- When can I walk after surgery?
- What foods should I eat?
- How do I care for my wound?
- When can I drive?
```

**Red Flag Test (triggers doctor alert):**

```
- I have a high fever and chills
- There's blood coming from my wound
```

🚨 **You should see:** Doctor alert notification!

---

## 🔑 Enable Full AI Features (Optional)

The chatbot works in fallback mode without an API key, but for full AI responses:

### Get Gemini API Key

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google
3. Click "Create API Key"
4. Copy the key

### Set API Key

**Windows PowerShell:**

```powershell
$env:GEMINI_API_KEY="your-api-key-here"
```

**Then restart backend:**

```powershell
cd backend
.\start-backend.ps1
```

---

## ✅ Verify Everything Works

### Test Backend

```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/patients -Method GET
```

### Test Frontend

Open: http://localhost:3000/login

### Test Chatbot

1. Login as patient
2. Open chatbot
3. Send any message
4. Should get a response!

---

## 🎯 Quick Feature Tour

### As Doctor:

1. **View Dashboard** → See all patients
2. **Click "View Details"** → See patient info
3. **Click "Generate Risk Assessment"** → ML predictions
4. **Click "Create Lifestyle Plan"** → Personalized plan

### As Patient:

1. **My Surgery Tab** → Surgery details + risk report
2. **Lifestyle Plan Tab** → Recovery instructions
3. **Chat Button** → 24/7 AI assistant

---

## 🔧 Common Issues

### ❌ "Port 5000 already in use"

```powershell
netstat -ano | findstr :5000
taskkill /PID <number> /F
```

### ❌ "Cannot connect to backend"

- Make sure backend is running
- Check terminal for errors
- Try: http://localhost:5000/api/patients

### ❌ "npm install fails"

```powershell
npm cache clean --force
npm install
```

### ❌ "Chatbot not responding"

- Check browser console (F12)
- Verify backend running
- Check backend terminal for errors

---

## 📚 More Information

- **Full Documentation:** `SYSTEM_DOCUMENTATION.md`
- **Chatbot Setup:** `CHATBOT_SETUP.md`
- **Main README:** `README.md`

---

## 🎉 You're All Set!

**RecovAI is now running!** 🏥✨

**What to explore:**

1. ✅ Login as doctor and add a patient
2. ✅ Generate risk assessment
3. ✅ Create lifestyle plan
4. ✅ Login as patient and view your surgery
5. ✅ Chat with AI assistant
6. ✅ Test red flag detection

**Questions?** Check the documentation or create an issue!

---

**Built with ❤️ for better surgical outcomes**
