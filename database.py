"""
Database setup and models for Surgical Risk Prediction System
HIPAA-compliant SQLite database with user, patient, and assessment tracking
"""

import sqlite3
import os
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from contextlib import contextmanager

DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'surgical_risk.db')


@contextmanager
def get_db_connection():
    """Context manager for database connections"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()


def init_database():
    """Initialize database with all required tables"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Users table (doctors and patients)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                user_type TEXT NOT NULL CHECK(user_type IN ('doctor', 'patient')),
                full_name TEXT NOT NULL,
                department TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Patients table (detailed medical information)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS patients (
                patient_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER UNIQUE,
                assigned_doctor_id INTEGER,
                surgery_type TEXT NOT NULL,
                surgery_date TEXT NOT NULL,
                status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'completed', 'cancelled')),
                
                -- Core features
                age INTEGER NOT NULL,
                gender INTEGER NOT NULL CHECK(gender IN (0, 1)),
                bmi REAL NOT NULL,
                asa_class INTEGER NOT NULL CHECK(asa_class BETWEEN 1 AND 5),
                emergency_surgery INTEGER NOT NULL CHECK(emergency_surgery IN (0, 1)),
                hemoglobin REAL NOT NULL,
                platelets REAL NOT NULL,
                creatinine REAL NOT NULL,
                albumin REAL NOT NULL,
                blood_loss REAL NOT NULL,
                
                -- Medical history
                diabetes INTEGER DEFAULT 0 CHECK(diabetes IN (0, 1)),
                hypertension INTEGER DEFAULT 0 CHECK(hypertension IN (0, 1)),
                heart_disease INTEGER DEFAULT 0 CHECK(heart_disease IN (0, 1)),
                copd INTEGER DEFAULT 0 CHECK(copd IN (0, 1)),
                kidney_disease INTEGER DEFAULT 0 CHECK(kidney_disease IN (0, 1)),
                liver_disease INTEGER DEFAULT 0 CHECK(liver_disease IN (0, 1)),
                stroke_history INTEGER DEFAULT 0 CHECK(stroke_history IN (0, 1)),
                cancer_history INTEGER DEFAULT 0 CHECK(cancer_history IN (0, 1)),
                immunosuppression INTEGER DEFAULT 0 CHECK(immunosuppression IN (0, 1)),
                smoking_status INTEGER DEFAULT 0 CHECK(smoking_status IN (0, 1, 2)),
                alcohol_use INTEGER DEFAULT 0 CHECK(alcohol_use IN (0, 1, 2)),
                anticoagulation INTEGER DEFAULT 0 CHECK(anticoagulation IN (0, 1)),
                steroid_use INTEGER DEFAULT 0 CHECK(steroid_use IN (0, 1)),
                previous_surgeries INTEGER DEFAULT 0,
                
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id),
                FOREIGN KEY (assigned_doctor_id) REFERENCES users(user_id)
            )
        ''')
        
        # Risk assessments table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS risk_assessments (
                assessment_id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id INTEGER NOT NULL,
                assessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                overall_risk TEXT NOT NULL,
                mortality_risk REAL,
                aki_risk REAL NOT NULL,
                cardiovascular_risk REAL NOT NULL,
                transfusion_risk REAL NOT NULL,
                recommendations TEXT,
                contributing_factors TEXT,
                FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
            )
        ''')
        
        # Lifestyle plans table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS lifestyle_plans (
                plan_id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                diet_recommendations TEXT,
                exercise_recommendations TEXT,
                medication_reminders TEXT,
                warning_signs TEXT,
                recovery_timeline TEXT,
                FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
            )
        ''')
        
        # Admin users table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS admin_users (
                admin_id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                full_name TEXT NOT NULL,
                role TEXT DEFAULT 'admin' CHECK(role IN ('admin', 'icu_manager', 'bed_coordinator')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # ICU beds table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS icu_beds (
                bed_id INTEGER PRIMARY KEY AUTOINCREMENT,
                room_number TEXT NOT NULL UNIQUE,
                floor_number INTEGER NOT NULL,
                status TEXT DEFAULT 'available' CHECK(status IN ('available', 'occupied', 'maintenance', 'cleaning')),
                patient_id INTEGER,
                admitted_at TIMESTAMP,
                expected_discharge TIMESTAMP,
                equipment_type TEXT,
                proximity_to_nursing_station INTEGER DEFAULT 5 CHECK(proximity_to_nursing_station BETWEEN 1 AND 10),
                has_ventilator INTEGER DEFAULT 0 CHECK(has_ventilator IN (0, 1)),
                has_dialysis INTEGER DEFAULT 0 CHECK(has_dialysis IN (0, 1)),
                has_ecmo INTEGER DEFAULT 0 CHECK(has_ecmo IN (0, 1)),
                isolation_room INTEGER DEFAULT 0 CHECK(isolation_room IN (0, 1)),
                bed_cost_per_day REAL DEFAULT 2500.0,
                last_maintenance TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
            )
        ''')
        
        # ICU predictions table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS icu_predictions (
                prediction_id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id INTEGER NOT NULL,
                assessment_id INTEGER,
                icu_needed INTEGER NOT NULL CHECK(icu_needed IN (0, 1)),
                icu_probability REAL NOT NULL,
                risk_level TEXT NOT NULL CHECK(risk_level IN ('CRITICAL', 'HIGH', 'MODERATE', 'LOW')),
                predicted_icu_days REAL,
                ventilator_needed INTEGER DEFAULT 0 CHECK(ventilator_needed IN (0, 1)),
                dialysis_needed INTEGER DEFAULT 0 CHECK(dialysis_needed IN (0, 1)),
                priority_score INTEGER NOT NULL CHECK(priority_score BETWEEN 1 AND 100),
                predicted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
                FOREIGN KEY (assessment_id) REFERENCES risk_assessments(assessment_id)
            )
        ''')
        
        # Bed allocations table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS bed_allocations (
                allocation_id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id INTEGER NOT NULL,
                bed_id INTEGER NOT NULL,
                allocated_by TEXT,
                allocation_type TEXT DEFAULT 'manual' CHECK(allocation_type IN ('manual', 'automatic', 'emergency')),
                allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                actual_discharge TIMESTAMP,
                duration_days REAL,
                discharge_reason TEXT,
                total_cost REAL,
                readmitted INTEGER DEFAULT 0 CHECK(readmitted IN (0, 1)),
                notes TEXT,
                FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
                FOREIGN KEY (bed_id) REFERENCES icu_beds(bed_id)
            )
        ''')
        
        # ICU waitlist table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS icu_waitlist (
                waitlist_id INTEGER PRIMARY KEY AUTOINCREMENT,
                patient_id INTEGER NOT NULL,
                prediction_id INTEGER,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                priority INTEGER NOT NULL CHECK(priority BETWEEN 1 AND 100),
                status TEXT DEFAULT 'waiting' CHECK(status IN ('waiting', 'allocated', 'cancelled')),
                estimated_wait_hours REAL,
                allocated_at TIMESTAMP,
                notes TEXT,
                FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
                FOREIGN KEY (prediction_id) REFERENCES icu_predictions(prediction_id)
            )
        ''')
        
        print("✅ Database initialized successfully")


def create_user(email, password, user_type, full_name, department=None):
    """Create a new user (doctor or patient)"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        password_hash = generate_password_hash(password)
        cursor.execute('''
            INSERT INTO users (email, password_hash, user_type, full_name, department)
            VALUES (?, ?, ?, ?, ?)
        ''', (email, password_hash, user_type, full_name, department))
        return cursor.lastrowid


def verify_user(email, password):
    """Verify user credentials and return user data"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        
        if user and check_password_hash(user['password_hash'], password):
            return dict(user)
        return None


def create_patient(user_id, assigned_doctor_id, patient_data):
    """Create a new patient record with all features"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Build dynamic INSERT query
        columns = ['user_id', 'assigned_doctor_id'] + list(patient_data.keys())
        placeholders = ', '.join(['?'] * len(columns))
        columns_str = ', '.join(columns)
        
        values = [user_id, assigned_doctor_id] + list(patient_data.values())
        
        cursor.execute(f'''
            INSERT INTO patients ({columns_str})
            VALUES ({placeholders})
        ''', values)
        
        return cursor.lastrowid


def get_patient_by_id(patient_id):
    """Retrieve patient details by patient_id"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM patients WHERE patient_id = ?', (patient_id,))
        patient = cursor.fetchone()
        return dict(patient) if patient else None


def get_patient_by_user_id(user_id):
    """Retrieve patient details by user_id"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM patients WHERE user_id = ?', (user_id,))
        patient = cursor.fetchone()
        return dict(patient) if patient else None


def get_patients_by_doctor(doctor_id):
    """Get all patients assigned to a specific doctor, sorted by risk level (highest first)"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT 
                p.*, 
                u.full_name as patient_name, 
                u.email,
                ra.overall_risk,
                ra.assessed_at
            FROM patients p
            JOIN users u ON p.user_id = u.user_id
            LEFT JOIN (
                SELECT patient_id, overall_risk, assessed_at,
                       ROW_NUMBER() OVER (PARTITION BY patient_id ORDER BY assessed_at DESC) as rn
                FROM risk_assessments
            ) ra ON p.patient_id = ra.patient_id AND ra.rn = 1
            WHERE p.assigned_doctor_id = ?
            ORDER BY 
                CASE 
                    WHEN ra.overall_risk = 'CRITICAL' THEN 1
                    WHEN ra.overall_risk = 'HIGH' THEN 2
                    WHEN ra.overall_risk = 'MODERATE' THEN 3
                    WHEN ra.overall_risk = 'LOW' THEN 4
                    ELSE 5
                END,
                p.surgery_date ASC
        ''', (doctor_id,))
        return [dict(row) for row in cursor.fetchall()]


def save_risk_assessment(patient_id, overall_risk, risks, recommendations, contributing_factors):
    """Save a risk assessment to the database"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO risk_assessments 
            (patient_id, overall_risk, mortality_risk, aki_risk, cardiovascular_risk, 
             transfusion_risk, recommendations, contributing_factors)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            patient_id, 
            overall_risk,
            risks.get('mortality'),
            risks['aki'],
            risks['cardiovascular'],
            risks['transfusion'],
            recommendations,
            contributing_factors
        ))
        return cursor.lastrowid


def get_latest_risk_assessment(patient_id):
    """Get the most recent risk assessment for a patient"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM risk_assessments 
            WHERE patient_id = ? 
            ORDER BY assessed_at DESC 
            LIMIT 1
        ''', (patient_id,))
        assessment = cursor.fetchone()
        return dict(assessment) if assessment else None


def save_lifestyle_plan(patient_id, plan_data):
    """Save a lifestyle plan for a patient"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO lifestyle_plans 
            (patient_id, diet_recommendations, exercise_recommendations, 
             medication_reminders, warning_signs, recovery_timeline)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            patient_id,
            plan_data.get('diet_recommendations'),
            plan_data.get('exercise_recommendations'),
            plan_data.get('medication_reminders'),
            plan_data.get('warning_signs'),
            plan_data.get('recovery_timeline')
        ))
        return cursor.lastrowid


def get_lifestyle_plan(patient_id):
    """Get the most recent lifestyle plan for a patient"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM lifestyle_plans 
            WHERE patient_id = ? 
            ORDER BY created_at DESC 
            LIMIT 1
        ''', (patient_id,))
        plan = cursor.fetchone()
        return dict(plan) if plan else None


def get_doctor_info(doctor_id):
    """Get doctor information"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT user_id, full_name, email, department 
            FROM users 
            WHERE user_id = ? AND user_type = 'doctor'
        ''', (doctor_id,))
        doctor = cursor.fetchone()
        return dict(doctor) if doctor else None


if __name__ == '__main__':
    # Initialize database and create sample users
    init_database()
    
    # Create sample doctor
    try:
        doctor_id = create_user(
            'dr.smith@hospital.com',
            'doctor123',
            'doctor',
            'Dr. Sarah Smith',
            'General Surgery'
        )
        print(f"✅ Sample doctor created (ID: {doctor_id})")
    except:
        print("⚠️ Sample doctor already exists")


def update_patient_vitals(patient_id, vitals):
    """
    Update patient blood vitals from extracted report
    vitals: dict with keys like 'hemoglobin', 'platelets', 'creatinine', 'albumin'
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Build dynamic UPDATE query for available vitals
        update_parts = []
        values = []
        
        for vital_name, vital_value in vitals.items():
            if vital_value is not None:
                update_parts.append(f"{vital_name} = ?")
                values.append(vital_value)
        
        if not update_parts:
            return False
        
        # Add patient_id to values
        values.append(patient_id)
        
        query = f"UPDATE patients SET {', '.join(update_parts)} WHERE patient_id = ?"
        cursor.execute(query, values)
        
        return cursor.rowcount > 0


def get_patient_risk_summary(doctor_id):
    """Get summary of patient risk distribution for a doctor's dashboard"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT 
                COUNT(*) as total_patients,
                SUM(CASE WHEN ra.overall_risk = 'CRITICAL' THEN 1 ELSE 0 END) as critical,
                SUM(CASE WHEN ra.overall_risk = 'HIGH' THEN 1 ELSE 0 END) as high,
                SUM(CASE WHEN ra.overall_risk = 'MODERATE' THEN 1 ELSE 0 END) as moderate,
                SUM(CASE WHEN ra.overall_risk = 'LOW' THEN 1 ELSE 0 END) as low,
                SUM(CASE WHEN ra.overall_risk IS NULL THEN 1 ELSE 0 END) as unassessed
            FROM patients p
            LEFT JOIN (
                SELECT patient_id, overall_risk,
                       ROW_NUMBER() OVER (PARTITION BY patient_id ORDER BY assessed_at DESC) as rn
                FROM risk_assessments
            ) ra ON p.patient_id = ra.patient_id AND ra.rn = 1
            WHERE p.assigned_doctor_id = ?
        ''', (doctor_id,))
        
        result = cursor.fetchone()
        if result:
            return dict(result)
        return {
            'total_patients': 0,
            'critical': 0,
            'high': 0,
            'moderate': 0,
            'low': 0,
            'unassessed': 0
        }


# ========================================
# ICU MANAGEMENT FUNCTIONS
# ========================================

def create_admin_user(email, password, full_name, role='admin'):
    """Create a new admin user"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        password_hash = generate_password_hash(password)
        cursor.execute('''
            INSERT INTO admin_users (email, password_hash, full_name, role)
            VALUES (?, ?, ?, ?)
        ''', (email, password_hash, full_name, role))
        return cursor.lastrowid


def verify_admin_user(email, password):
    """Verify admin credentials and return admin data"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM admin_users WHERE email = ?', (email,))
        admin = cursor.fetchone()
        
        if admin and check_password_hash(admin['password_hash'], password):
            return dict(admin)
        return None


def create_icu_bed(bed_data):
    """Create a new ICU bed"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO icu_beds (
                room_number, floor_number, equipment_type, proximity_to_nursing_station,
                has_ventilator, has_dialysis, has_ecmo, isolation_room, bed_cost_per_day
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            bed_data.get('room_number'),
            bed_data.get('floor_number', 1),
            bed_data.get('equipment_type', ''),
            bed_data.get('proximity_to_nursing_station', 5),
            bed_data.get('has_ventilator', 0),
            bed_data.get('has_dialysis', 0),
            bed_data.get('has_ecmo', 0),
            bed_data.get('isolation_room', 0),
            bed_data.get('bed_cost_per_day', 2500.0)
        ))
        return cursor.lastrowid


def get_all_icu_beds():
    """Get all ICU beds with current status"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT 
                b.*,
                p.patient_id as current_patient_id,
                u.full_name as patient_name,
                ra.overall_risk as patient_risk
            FROM icu_beds b
            LEFT JOIN patients p ON b.patient_id = p.patient_id
            LEFT JOIN users u ON p.user_id = u.user_id
            LEFT JOIN (
                SELECT patient_id, overall_risk,
                       ROW_NUMBER() OVER (PARTITION BY patient_id ORDER BY assessed_at DESC) as rn
                FROM risk_assessments
            ) ra ON p.patient_id = ra.patient_id AND ra.rn = 1
            ORDER BY b.floor_number, b.room_number
        ''')
        return [dict(row) for row in cursor.fetchall()]


def get_available_icu_beds(filters=None):
    """Get available ICU beds with optional equipment filters"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        query = "SELECT * FROM icu_beds WHERE status = 'available'"
        params = []
        
        if filters:
            if filters.get('has_ventilator'):
                query += " AND has_ventilator = 1"
            if filters.get('has_dialysis'):
                query += " AND has_dialysis = 1"
            if filters.get('has_ecmo'):
                query += " AND has_ecmo = 1"
            if filters.get('isolation_room'):
                query += " AND isolation_room = 1"
        
        query += " ORDER BY proximity_to_nursing_station"
        
        cursor.execute(query, params)
        return [dict(row) for row in cursor.fetchall()]


def get_icu_capacity():
    """Get current ICU capacity statistics"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT 
                COUNT(*) as total_beds,
                SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
                SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied,
                SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance,
                SUM(CASE WHEN status = 'cleaning' THEN 1 ELSE 0 END) as cleaning
            FROM icu_beds
        ''')
        result = cursor.fetchone()
        
        if result:
            data = dict(result)
            if data['total_beds'] > 0:
                data['utilization_rate'] = round((data['occupied'] / data['total_beds']) * 100, 1)
            else:
                data['utilization_rate'] = 0
            return data
        return None


def save_icu_prediction(patient_id, assessment_id, prediction_data):
    """Save ICU need prediction for a patient"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO icu_predictions (
                patient_id, assessment_id, icu_needed, icu_probability, risk_level,
                predicted_icu_days, ventilator_needed, dialysis_needed, priority_score
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            patient_id,
            assessment_id,
            prediction_data.get('icu_needed', 0),
            prediction_data.get('icu_probability', 0),
            prediction_data.get('risk_level', 'LOW'),
            prediction_data.get('predicted_icu_days', 0),
            prediction_data.get('ventilator_needed', 0),
            prediction_data.get('dialysis_needed', 0),
            prediction_data.get('priority_score', 50)
        ))
        return cursor.lastrowid


def get_icu_prediction(patient_id):
    """Get the most recent ICU prediction for a patient"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT * FROM icu_predictions 
            WHERE patient_id = ? 
            ORDER BY predicted_at DESC 
            LIMIT 1
        ''', (patient_id,))
        prediction = cursor.fetchone()
        return dict(prediction) if prediction else None


def allocate_bed(patient_id, bed_id, allocated_by='system', allocation_type='automatic'):
    """Allocate an ICU bed to a patient"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Check if bed is available
        cursor.execute('SELECT status FROM icu_beds WHERE bed_id = ?', (bed_id,))
        bed = cursor.fetchone()
        
        if not bed or bed['status'] != 'available':
            return None
        
        # Update bed status
        cursor.execute('''
            UPDATE icu_beds 
            SET status = 'occupied', patient_id = ?, admitted_at = CURRENT_TIMESTAMP
            WHERE bed_id = ?
        ''', (patient_id, bed_id))
        
        # Create allocation record
        cursor.execute('''
            INSERT INTO bed_allocations (
                patient_id, bed_id, allocated_by, allocation_type
            ) VALUES (?, ?, ?, ?)
        ''', (patient_id, bed_id, allocated_by, allocation_type))
        
        return cursor.lastrowid


def discharge_from_icu(allocation_id, discharge_reason=''):
    """Discharge a patient from ICU"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Get allocation details
        cursor.execute('''
            SELECT a.*, b.bed_cost_per_day 
            FROM bed_allocations a
            JOIN icu_beds b ON a.bed_id = b.bed_id
            WHERE a.allocation_id = ?
        ''', (allocation_id,))
        allocation = cursor.fetchone()
        
        if not allocation:
            return False
        
        # Calculate duration and cost
        cursor.execute('''
            UPDATE bed_allocations 
            SET actual_discharge = CURRENT_TIMESTAMP,
                duration_days = CAST((julianday(CURRENT_TIMESTAMP) - julianday(allocated_at)) AS REAL),
                discharge_reason = ?,
                total_cost = CAST((julianday(CURRENT_TIMESTAMP) - julianday(allocated_at)) AS REAL) * ?
            WHERE allocation_id = ?
        ''', (discharge_reason, allocation['bed_cost_per_day'], allocation_id))
        
        # Update bed status
        cursor.execute('''
            UPDATE icu_beds 
            SET status = 'cleaning', patient_id = NULL, admitted_at = NULL, expected_discharge = NULL
            WHERE bed_id = ?
        ''', (allocation['bed_id'],))
        
        return True


def update_bed_status(bed_id, status):
    """Update ICU bed status"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE icu_beds 
            SET status = ?
            WHERE bed_id = ?
        ''', (status, bed_id))
        return cursor.rowcount > 0


def add_to_icu_waitlist(patient_id, prediction_id, priority):
    """Add patient to ICU waitlist"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO icu_waitlist (patient_id, prediction_id, priority)
            VALUES (?, ?, ?)
        ''', (patient_id, prediction_id, priority))
        return cursor.lastrowid


def get_icu_waitlist():
    """Get current ICU waitlist sorted by priority"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT 
                w.*,
                u.full_name as patient_name,
                p.surgery_type,
                p.surgery_date,
                ip.risk_level,
                ip.predicted_icu_days,
                ip.ventilator_needed,
                ip.dialysis_needed
            FROM icu_waitlist w
            JOIN patients p ON w.patient_id = p.patient_id
            JOIN users u ON p.user_id = u.user_id
            LEFT JOIN icu_predictions ip ON w.prediction_id = ip.prediction_id
            WHERE w.status = 'waiting'
            ORDER BY w.priority DESC, w.added_at
        ''')
        return [dict(row) for row in cursor.fetchall()]


def get_icu_analytics(days=30):
    """Get ICU analytics for the last N days"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Average ICU stay duration
        cursor.execute('''
            SELECT 
                AVG(duration_days) as avg_stay_duration,
                MIN(duration_days) as min_stay,
                MAX(duration_days) as max_stay,
                COUNT(*) as total_admissions,
                SUM(total_cost) as total_revenue,
                SUM(CASE WHEN readmitted = 1 THEN 1 ELSE 0 END) as readmissions
            FROM bed_allocations
            WHERE actual_discharge IS NOT NULL
            AND actual_discharge >= datetime('now', '-' || ? || ' days')
        ''', (days,))
        
        result = cursor.fetchone()
        return dict(result) if result else None


def get_icu_forecast(days=7):
    """Get ICU demand forecast for next N days"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Get upcoming surgeries with HIGH/CRITICAL risk
        cursor.execute('''
            SELECT 
                DATE(p.surgery_date) as surgery_day,
                COUNT(*) as predicted_icu_needs
            FROM patients p
            JOIN icu_predictions ip ON p.patient_id = ip.patient_id
            WHERE p.surgery_date >= DATE('now')
            AND p.surgery_date <= DATE('now', '+' || ? || ' days')
            AND ip.icu_needed = 1
            AND p.status = 'scheduled'
            GROUP BY DATE(p.surgery_date)
            ORDER BY surgery_day
        ''', (days,))
        
        return [dict(row) for row in cursor.fetchall()]


def get_expected_discharges_today():
    """Get beds expected to be discharged today"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT 
                b.bed_id,
                b.room_number,
                u.full_name as patient_name,
                b.expected_discharge,
                CAST((julianday(CURRENT_TIMESTAMP) - julianday(b.admitted_at)) AS REAL) as current_stay_days
            FROM icu_beds b
            JOIN patients p ON b.patient_id = p.patient_id
            JOIN users u ON p.user_id = u.user_id
            WHERE b.status = 'occupied'
            AND DATE(b.expected_discharge) = DATE('now')
            ORDER BY b.expected_discharge
        ''')
        return [dict(row) for row in cursor.fetchall()]

