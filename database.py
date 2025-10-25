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
    """Get all patients assigned to a specific doctor"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT p.*, u.full_name as patient_name, u.email
            FROM patients p
            JOIN users u ON p.user_id = u.user_id
            WHERE p.assigned_doctor_id = ?
            ORDER BY p.surgery_date ASC
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
