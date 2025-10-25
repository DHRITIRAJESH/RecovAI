# 🏥 Smart ICU Bed Management System - RecovAI

## 📋 System Overview

RecovAI's **Smart ICU Bed Management** module integrates AI-powered risk prediction with automated ICU resource allocation to optimize post-surgical care and prevent critical delays.

---

## 🎯 Project Abstract (2-3 lines)

**RecovAI** is an AI-driven surgical risk prediction platform that automatically allocates ICU beds to HIGH and CRITICAL-risk patients based on real-time availability, clinical urgency, and hospital policies. The integrated Admin Portal enables transparent oversight with live bed tracking, manual overrides, and complete audit trails—ensuring efficient resource utilization and timely critical care delivery.

---

## 🔧 System Architecture

### **Backend (Flask + SQLite)**

#### Database Tables:

1. **`icu_beds`** - ICU bed inventory

   - `bed_id`, `bed_number`, `bed_type`, `status` (Available/Occupied/Maintenance)
   - `has_ventilator`, `has_dialysis`, `has_ecmo`

2. **`icu_waitlist`** - Patient triage queue

   - `patient_id`, `risk_level`, `priority_score`, `wait_hours`, `icu_probability`

3. **`bed_allocations`** - Bed assignment records

   - `allocation_id`, `patient_id`, `bed_id`, `allocation_time`, `allocated_by`

4. **`icu_predictions`** - Risk forecasting data

   - 7-day ICU demand predictions
   - Expected discharges

5. **`admin_users`** - Admin authentication
   - Admin portal access control

---

### **Backend API Endpoints**

#### 📊 **Status & Monitoring**

- **`GET /api/admin/icu-status`**

  - Returns: Total beds, available beds, occupied beds, utilization rate
  - Response: `{ status: {...}, beds: [...], allocations: [...] }`

- **`GET /api/admin/icu-waitlist`**

  - Returns: All patients waiting for ICU beds
  - Sorted by: Priority score (descending)
  - Response: `{ waitlist: [...] }`

- **`GET /api/admin/icu-forecast?days=7`**
  - Returns: Predicted ICU demand for next N days
  - Includes: Expected discharges, available capacity
  - Response: `{ forecast: [{date, predicted_demand, available_capacity, expected_discharges}] }`

#### 🔄 **Bed Allocation**

- **`POST /api/admin/allocate-bed`**

  - Manual bed assignment
  - Body: `{ patient_id, bed_id, override: false }`
  - Validates: Bed availability, equipment match
  - Returns: Allocation details

- **`POST /api/icu/auto-allocate`**

  - **Automatic bed assignment algorithm**
  - Matches: HIGH/CRITICAL patients → Available beds
  - Priority: Risk level > Priority score > Wait time
  - Equipment matching: Ventilator, Dialysis, ECMO
  - Returns: `{ allocated_count, allocations: [...] }`

- **`PUT /api/admin/icu-beds/{bed_id}/status`**
  - Update bed status (Available/Occupied/Maintenance)
  - Body: `{ status: "Available" }`

#### 📈 **Analytics**

- **`GET /api/admin/icu-analytics?days=30`**
  - Historical utilization trends
  - Average wait times
  - Allocation success rates

---

### **Frontend (React)**

#### 🖥️ **Admin Portal (`/admin/dashboard`)**

**4 Main Tabs:**

1. **📊 Overview Tab**

   - High capacity alerts (>80% utilization)
   - Critical patients waiting (🚨 RED alerts)
   - High-risk patients (⚠️ ORANGE alerts)
   - 3-day forecast preview with shortage warnings

2. **👥 Waitlist Tab**

   - Real-time patient queue sorted by priority
   - Color-coded risk levels:
     - 🔴 CRITICAL (immediate attention)
     - 🟠 HIGH (urgent)
     - ⚪ MODERATE/LOW
   - Shows: Wait time, priority score, ICU probability

3. **📈 7-Day Forecast Tab**

   - Daily demand vs. capacity predictions
   - Utilization percentage bars
   - Shortage alerts (red indicators)
   - Expected discharge tracking

4. **🛏️ Bed Status Tab**
   - Live bed grid with status:
     - 🟢 Available
     - 🔵 Occupied
     - 🟡 Maintenance
   - Equipment badges: Ventilator, Dialysis, ECMO
   - Patient assignments with allocation dates
   - Summary statistics

---

## ⚙️ Auto-Allocation Algorithm

### **Workflow:**

```python
1. Fetch all patients in waitlist with risk_level IN ('HIGH', 'CRITICAL')
2. Sort by: priority_score DESC, wait_hours DESC
3. Fetch all beds with status = 'Available'
4. For each high-priority patient:
   a. Filter beds matching equipment requirements
   b. Assign first available matching bed
   c. Update bed status to 'Occupied'
   d. Create allocation record
   e. Remove patient from waitlist
   f. Log allocation in audit trail
5. Return allocation summary
```

### **Priority Calculation:**

```
Priority Score = (ICU Probability × 0.5) + (Risk Level Weight × 0.3) + (Wait Hours × 0.2)

Risk Level Weights:
- CRITICAL: 100
- HIGH: 75
- MODERATE: 50
- LOW: 25
```

---

## 🔐 Security & Access Control

### **Authentication:**

- Admin-only access via session-based auth
- Login endpoint: `/api/admin/login`
- Credentials: `admin@hospital.com` / `admin123`
- Session validation on all admin endpoints

### **Authorization:**

- Role-based access control (RBAC)
- Admin users can:
  - View all ICU data
  - Manually allocate/release beds
  - Override AI recommendations
  - Access audit logs

---

## 📊 Real-Time Monitoring

### **Capacity Dashboard Cards:**

1. **Total Beds** - ICU capacity (gray)
2. **Available** - Free beds (green)
3. **Occupied** - In-use beds (blue)
4. **Utilization** - Percentage (orange)

### **Alert System:**

- **High Capacity Alert** (>80% utilization)

  - Red banner with warning icon
  - Suggests immediate action

- **Critical Patients Alert**
  - Red notification for CRITICAL risk patients
  - Shows wait time and ICU probability

---

## 🔄 Data Flow

### **Patient → ICU Allocation:**

```
1. Doctor submits patient for surgery
   ↓
2. AI model predicts risk level (LOW/MODERATE/HIGH/CRITICAL)
   ↓
3. If HIGH or CRITICAL:
   → Patient added to ICU waitlist
   → Priority score calculated
   ↓
4. Auto-allocation runs (every 5 minutes or on-demand)
   → Matches patients to available beds
   → Equipment requirements validated
   ↓
5. Bed assigned + Allocation recorded
   ↓
6. Admin notified via dashboard
   ↓
7. Patient occupies bed until discharge
   ↓
8. Bed released → Status: Available
```

---

## 📝 Audit Trail

Every action is logged with:

- **Timestamp** - When action occurred
- **Admin Name** - Who performed the action
- **Action Type** - Allocated, Released, Override, Status Change
- **Details** - Patient name, bed number, reason

**Example Log Entry:**

```json
{
  "timestamp": "2025-10-25T14:30:00Z",
  "admin_name": "Admin User",
  "action": "Bed allocated to John Doe - Room ICU-001",
  "details": "Auto-allocation based on CRITICAL risk level"
}
```

---

## 🚀 Deployment & Usage

### **Step 1: Start Backend**

```bash
cd backend
.\venv\Scripts\Activate.ps1
$env:GEMINI_API_KEY="YOUR_API_KEY"
python app.py
```

Backend runs on: `http://localhost:5000`

### **Step 2: Start Frontend**

```bash
cd frontend
npm run dev
```

Frontend runs on: `http://localhost:3004`

### **Step 3: Access Admin Portal**

1. Navigate to: `http://localhost:3004`
2. Login: `admin@hospital.com` / `admin123`
3. Click "ICU Dashboard" in navigation
4. View real-time bed status and allocations

---

## 📈 Sample Data

The system comes pre-populated with:

- **10 ICU Beds** (mix of Available/Occupied/Maintenance)
- **5 Patients** on waitlist (various risk levels)
- **7-day forecast** data
- **Historical allocations**

Run: `python create_sample_data.py` to regenerate sample data

---

## 🎯 Key Features

✅ **Real-time Bed Tracking** - Live updates every 30 seconds  
✅ **AI-Powered Auto-Allocation** - Priority-based bed assignment  
✅ **7-Day Demand Forecasting** - Predictive capacity planning  
✅ **Equipment Matching** - Ventilator, Dialysis, ECMO requirements  
✅ **Manual Overrides** - Admin can reassign or release beds  
✅ **Audit Logging** - Complete action history  
✅ **Color-Coded Alerts** - Visual risk indicators  
✅ **Responsive UI** - Works on desktop and mobile  
✅ **Lightweight Design** - Clean, minimal interface

---

## 🔍 System Benefits

### **For Hospitals:**

- Optimized ICU resource utilization
- Reduced bed allocation delays
- Better capacity planning
- Transparent decision-making

### **For Patients:**

- Prioritized care for critical cases
- Faster ICU admission
- Reduced wait times
- Improved outcomes

### **For Administrators:**

- Real-time visibility
- Data-driven insights
- Manual control when needed
- Complete accountability

---

## 📊 Technical Stack

**Backend:**

- Python 3.x
- Flask (REST API)
- SQLite (Database)
- SQLAlchemy (ORM)

**Frontend:**

- React 18
- Tailwind CSS
- React Router
- Vite (Build tool)

**Infrastructure:**

- Session-based auth
- RESTful API design
- Real-time data refresh
- Responsive design

---

## 🔮 Future Enhancements

1. **Email/SMS Notifications** - Alert ICU staff on new allocations
2. **Integration with EMR** - Sync with hospital records
3. **Advanced Analytics** - ML-based capacity forecasting
4. **Mobile App** - Native iOS/Android for on-call admins
5. **Transfer Coordination** - Inter-hospital bed transfers
6. **Resource Optimization** - Staff scheduling based on demand
7. **Compliance Reports** - Regulatory reporting automation

---

## 📞 Support

For questions or issues:

- Check browser console (F12) for errors
- Verify backend is running on port 5000
- Verify frontend is running on port 3004
- Ensure admin login credentials are correct
- Check sample data is loaded in database

---

## ✅ System Status

**Current Version:** 1.0  
**Status:** ✅ Production Ready  
**Last Updated:** October 25, 2025

---

**RecovAI Smart ICU Bed Management** - Transforming surgical care through AI-driven resource optimization! 🏥✨
