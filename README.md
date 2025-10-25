# RecovAI - Surgical Risk Prediction System

A comprehensive full-stack application for predicting surgical complications using machine learning. Features dual portals for doctors and patients with **AI-powered 24/7 recovery assistance**.

## 🏥 System Overview

RecovAI uses pre-trained TensorFlow models to predict surgical complications and provides **intelligent recovery support** through an AI chatbot:

- **Acute Kidney Injury (AKI)** prediction
- **Cardiovascular Complications** risk assessment
- **Transfusion Requirements** forecasting
- **24/7 AI Recovery Assistant** with red flag detection 🤖

The system applies clinical risk adjustments based on patient comorbidities and provides evidence-based recommendations for perioperative management.

## 🎯 Features

### Doctor Dashboard

- ✅ Patient management and tracking
- 🔬 ML-powered risk assessments
- 📊 Comprehensive risk reports with clinical recommendations
- 📈 Visual risk categorization (CRITICAL/HIGH/MODERATE/LOW)
- 💊 Evidence-based procedural modifications
- 📋 Contributing factors analysis
- 🚨 **Real-time alerts for concerning patient symptoms** 🆕

### Patient Portal

- 🏥 Surgery information and care team details
- 💪 Personalized lifestyle and recovery plans
- 📅 Day-by-day recovery timeline
- ⚠️ Warning signs and emergency contacts
- 🥗 Diet, exercise, and medication guidance
- 🔒 Patient-friendly language (no percentages shown)
- 🤖 **24/7 AI Recovery Chatbot** 🆕

### AI Recovery Assistant 🆕

- **24/7 Availability** - Always available for patient questions
- **Red Flag Detection** - Monitors 7 types of concerning symptoms
- **Doctor Alerts** - Automatic notifications for urgent issues
- **Personalized Guidance** - Surgery-specific recovery advice
- **Powered by Google Gemini AI** - Natural language understanding
- **Fallback Mode** - Works even without API key

## 🛠️ Technology Stack

### Backend

- **Framework:** Flask 3.0
- **Database:** SQLite (HIPAA-compliant practices)
- **ML/AI:** TensorFlow 2.20, scikit-learn 1.3
- **Chatbot:** Google Generative AI (Gemini)
- **Authentication:** Session-based with password hashing
- **API:** RESTful with CORS support

### Frontend

- **Framework:** React 18 with Vite
- **Styling:** Tailwind CSS 3.3
- **Routing:** React Router 6
- **HTTP Client:** Axios 1.6
- **Charts:** Recharts 2.10

## 📋 Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone or Navigate to Project Directory

```powershell
cd "c:\Users\rajes\OneDrive\Desktop\RecovAI"
```

### 2. Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Initialize database
python database.py

# Start Flask server
python app.py
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

Open a **new PowerShell terminal** and run:

```powershell
# Navigate to frontend directory
cd "c:\Users\rajes\OneDrive\Desktop\RecovAI\frontend"

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🔑 Demo Credentials

### Doctor Account

- **Email:** dr.smith@hospital.com
- **Password:** doctor123

### Patient Account

You can register a new patient account or have the doctor add one through the dashboard.

## 📊 Required ML Models

The system expects the following files in the **root RecovAI directory**:

```
RecovAI/
├── model_aki.keras
├── model_cardiovascular.keras
├── model_transfusion_required.keras
├── scaler.pkl (optional)
├── imputer.pkl (optional)
├── optimal_thresholds.pkl (optional)
```

**Note:** The system will work with just the `.keras` model files. If preprocessing files are missing, it will use default values.

## 📁 Project Structure

```
RecovAI/
├── backend/
│   ├── app.py                    # Flask application & API endpoints
│   ├── database.py               # SQLite database models & operations
│   ├── ml_predictor.py           # ML risk prediction engine
│   ├── clinical_recs.py          # Clinical recommendations generator
│   ├── requirements.txt          # Python dependencies
│   └── surgical_risk.db          # SQLite database (auto-created)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   └── Login.jsx
│   │   │   ├── Doctor/
│   │   │   │   ├── DoctorDashboard.jsx
│   │   │   │   ├── PatientList.jsx
│   │   │   │   ├── PatientDetail.jsx
│   │   │   │   ├── AddPatient.jsx
│   │   │   │   └── RiskAssessmentReport.jsx
│   │   │   └── Patient/
│   │   │       ├── PatientPortal.jsx
│   │   │       ├── MySurgery.jsx
│   │   │       └── LifestylePlan.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── model_aki.keras
├── model_cardiovascular.keras
├── model_transfusion_required.keras
└── README.md
```

## 🔬 ML Model Features

### Core Features (Required)

1. **age** - Patient age in years
2. **gender** - 0=Female, 1=Male
3. **bmi** - Body Mass Index
4. **asa_class** - ASA Physical Status (1-5)
5. **emergency_surgery** - 0=Elective, 1=Emergency
6. **hemoglobin** - g/dL
7. **platelets** - ×10³/μL
8. **creatinine** - mg/dL
9. **albumin** - g/dL
10. **blood_loss** - Estimated in mL

### Medical History (For Risk Adjustment)

- Diabetes, Hypertension, Heart Disease
- COPD, Kidney Disease, Liver Disease
- Stroke History, Cancer History
- Immunosuppression, Anticoagulation
- Steroid Use, Smoking Status, Alcohol Use

## 📡 API Endpoints

### Authentication

- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/check-session` - Check authentication status

### Doctor Endpoints

- `GET /api/doctor/patients` - Get all assigned patients
- `GET /api/doctor/patient/<id>` - Get patient details
- `POST /api/doctor/add-patient` - Add new patient
- `POST /api/doctor/assess-patient/<id>` - Generate risk assessment

### Patient Endpoints

- `GET /api/patient/my-surgery` - Get surgery information
- `GET /api/patient/risk-assessment` - Get risk assessment (patient-friendly)
- `POST /api/patient/generate-lifestyle-plan` - Generate lifestyle plan
- `GET /api/patient/lifestyle-plan` - Get existing lifestyle plan

## 🎨 Risk Categories

| Category     | Risk Range | Color  | Icon |
| ------------ | ---------- | ------ | ---- |
| **CRITICAL** | ≥70%       | Red    | 🔴   |
| **HIGH**     | 40-69%     | Orange | ⚠️   |
| **MODERATE** | 20-39%     | Yellow | 🟡   |
| **LOW**      | <20%       | Green  | ✅   |

## 🔒 Security Features

- ✅ Password hashing with Werkzeug
- ✅ Session-based authentication
- ✅ CORS configuration for frontend
- ✅ HIPAA-compliant practices (no PHI in logs)
- ✅ Input validation and sanitization
- ✅ Role-based access control (doctor/patient)

## 📈 Clinical Risk Adjustment

The system applies evidence-based multipliers for comorbidities:

### AKI Risk Adjustments

- Diabetes: 1.3× multiplier
- Chronic Kidney Disease: 2.5× multiplier
- Hypertension: 1.2× multiplier
- Age >70: 1.4× multiplier

### Cardiovascular Risk Adjustments

- Heart Disease: 2.5× multiplier
- Hypertension: 1.6× multiplier
- Stroke History: 1.8× multiplier
- Current Smoking: 1.4× multiplier

### Transfusion Risk Adjustments

- Anticoagulation: 2.0× multiplier
- Liver Disease: 1.6× multiplier
- Low Hemoglobin (<10): 1.8× multiplier
- Thrombocytopenia: 1.7× multiplier

## 🧪 Testing the System

### 1. Create a Patient

1. Login as doctor (dr.smith@hospital.com / doctor123)
2. Click "Add Patient"
3. Fill in patient information and lab values
4. Select relevant medical history checkboxes

### 2. Generate Risk Assessment

1. View patient from the list
2. Click "Generate Risk Assessment"
3. Review comprehensive risk report
4. Note clinical recommendations and procedural modifications

### 3. Patient Portal

1. Login as patient using credentials created above
2. View surgery information and care team
3. Generate personalized lifestyle plan
4. Explore recovery timeline and warning signs

## 🔧 Troubleshooting

### Backend Issues

**Database errors:**

```powershell
cd backend
python database.py
```

**Import errors:**

```powershell
pip install -r requirements.txt --upgrade
```

**ML model not loading:**

- Ensure `.keras` files are in the root RecovAI directory
- Check file names match exactly

### Frontend Issues

**Dependencies not installing:**

```powershell
rm -r node_modules
rm package-lock.json
npm install
```

**Port already in use:**
Edit `vite.config.js` and change the port number.

## 📚 Additional Notes

### Patient Privacy

- No PHI is logged to console or files
- Sessions expire after 24 hours
- All medical data is stored locally in SQLite

### Clinical Recommendations

- Based on current medical literature
- Should be reviewed by qualified medical professionals
- Not a substitute for clinical judgment

### Production Deployment

For production use:

1. Change `SECRET_KEY` in app.py
2. Use PostgreSQL instead of SQLite
3. Enable HTTPS/SSL
4. Implement proper logging and monitoring
5. Add rate limiting and additional security measures

## 🤝 Support

For issues or questions:

1. Check the troubleshooting section
2. Review the code comments
3. Ensure all dependencies are installed correctly

## 📄 License

This is an educational/demonstration project. Not intended for production medical use without proper validation and regulatory approval.

## 🎓 Acknowledgments

- TensorFlow and scikit-learn communities
- Flask and React ecosystems
- Medical literature for risk stratification guidelines

---

**⚠️ DISCLAIMER:** This system is for educational purposes only. Clinical decisions should always be made by qualified healthcare professionals based on complete patient assessment and current medical standards.
