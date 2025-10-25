"""
Sample Patient Data Generator
Creates realistic test patients for the Surgical Risk Prediction System
"""

import sys
import os
sys.path.append(os.path.dirname(__file__))

from database import create_user, create_patient, init_database

# Sample patients with diverse risk profiles
SAMPLE_PATIENTS = [
    {
        'email': 'john.doe@email.com',
        'password': 'patient123',
        'full_name': 'John Doe',
        'patient_data': {
            'surgery_type': 'Laparoscopic Cholecystectomy',
            'surgery_date': '2025-11-15',
            'age': 45,
            'gender': 1,
            'bmi': 27.5,
            'asa_class': 2,
            'emergency_surgery': 0,
            'hemoglobin': 14.2,
            'platelets': 220,
            'creatinine': 0.9,
            'albumin': 4.1,
            'blood_loss': 150,
            'diabetes': 0,
            'hypertension': 1,
            'heart_disease': 0,
            'copd': 0,
            'kidney_disease': 0,
            'liver_disease': 0,
            'stroke_history': 0,
            'cancer_history': 0,
            'immunosuppression': 0,
            'smoking_status': 1,
            'alcohol_use': 1,
            'anticoagulation': 0,
            'steroid_use': 0,
            'previous_surgeries': 1
        }
    },
    {
        'email': 'mary.johnson@email.com',
        'password': 'patient123',
        'full_name': 'Mary Johnson',
        'patient_data': {
            'surgery_type': 'Total Hip Replacement',
            'surgery_date': '2025-11-20',
            'age': 72,
            'gender': 0,
            'bmi': 29.8,
            'asa_class': 3,
            'emergency_surgery': 0,
            'hemoglobin': 11.5,
            'platelets': 185,
            'creatinine': 1.3,
            'albumin': 3.6,
            'blood_loss': 450,
            'diabetes': 1,
            'hypertension': 1,
            'heart_disease': 1,
            'copd': 0,
            'kidney_disease': 0,
            'liver_disease': 0,
            'stroke_history': 0,
            'cancer_history': 0,
            'immunosuppression': 0,
            'smoking_status': 0,
            'alcohol_use': 0,
            'anticoagulation': 1,
            'steroid_use': 0,
            'previous_surgeries': 2
        }
    },
    {
        'email': 'robert.williams@email.com',
        'password': 'patient123',
        'full_name': 'Robert Williams',
        'patient_data': {
            'surgery_type': 'Emergency Appendectomy',
            'surgery_date': '2025-11-05',
            'age': 58,
            'gender': 1,
            'bmi': 32.1,
            'asa_class': 3,
            'emergency_surgery': 1,
            'hemoglobin': 13.8,
            'platelets': 195,
            'creatinine': 1.1,
            'albumin': 3.8,
            'blood_loss': 200,
            'diabetes': 1,
            'hypertension': 1,
            'heart_disease': 0,
            'copd': 1,
            'kidney_disease': 0,
            'liver_disease': 0,
            'stroke_history': 0,
            'cancer_history': 0,
            'immunosuppression': 0,
            'smoking_status': 2,
            'alcohol_use': 2,
            'anticoagulation': 0,
            'steroid_use': 0,
            'previous_surgeries': 0
        }
    },
    {
        'email': 'sarah.davis@email.com',
        'password': 'patient123',
        'full_name': 'Sarah Davis',
        'patient_data': {
            'surgery_type': 'Thyroidectomy',
            'surgery_date': '2025-11-25',
            'age': 38,
            'gender': 0,
            'bmi': 24.3,
            'asa_class': 1,
            'emergency_surgery': 0,
            'hemoglobin': 13.5,
            'platelets': 240,
            'creatinine': 0.8,
            'albumin': 4.3,
            'blood_loss': 100,
            'diabetes': 0,
            'hypertension': 0,
            'heart_disease': 0,
            'copd': 0,
            'kidney_disease': 0,
            'liver_disease': 0,
            'stroke_history': 0,
            'cancer_history': 0,
            'immunosuppression': 0,
            'smoking_status': 0,
            'alcohol_use': 0,
            'anticoagulation': 0,
            'steroid_use': 0,
            'previous_surgeries': 0
        }
    },
    {
        'email': 'james.brown@email.com',
        'password': 'patient123',
        'full_name': 'James Brown',
        'patient_data': {
            'surgery_type': 'Coronary Artery Bypass Graft',
            'surgery_date': '2025-11-10',
            'age': 68,
            'gender': 1,
            'bmi': 28.7,
            'asa_class': 4,
            'emergency_surgery': 0,
            'hemoglobin': 12.1,
            'platelets': 165,
            'creatinine': 1.6,
            'albumin': 3.4,
            'blood_loss': 800,
            'diabetes': 1,
            'hypertension': 1,
            'heart_disease': 1,
            'copd': 1,
            'kidney_disease': 1,
            'liver_disease': 0,
            'stroke_history': 1,
            'cancer_history': 0,
            'immunosuppression': 0,
            'smoking_status': 1,
            'alcohol_use': 1,
            'anticoagulation': 1,
            'steroid_use': 0,
            'previous_surgeries': 3
        }
    },
    {
        'email': 'linda.garcia@email.com',
        'password': 'patient123',
        'full_name': 'Linda Garcia',
        'patient_data': {
            'surgery_type': 'Colon Resection',
            'surgery_date': '2025-11-18',
            'age': 61,
            'gender': 0,
            'bmi': 26.4,
            'asa_class': 3,
            'emergency_surgery': 0,
            'hemoglobin': 10.8,
            'platelets': 178,
            'creatinine': 1.0,
            'albumin': 3.2,
            'blood_loss': 500,
            'diabetes': 0,
            'hypertension': 1,
            'heart_disease': 0,
            'copd': 0,
            'kidney_disease': 0,
            'liver_disease': 0,
            'stroke_history': 0,
            'cancer_history': 1,
            'immunosuppression': 0,
            'smoking_status': 0,
            'alcohol_use': 0,
            'anticoagulation': 0,
            'steroid_use': 1,
            'previous_surgeries': 1
        }
    }
]


def create_sample_patients(doctor_email='dr.smith@hospital.com'):
    """Create sample patients for testing"""
    
    # Initialize database
    init_database()
    
    # Get doctor ID
    from database import get_db_connection
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT user_id FROM users WHERE email = ?', (doctor_email,))
        result = cursor.fetchone()
        
        if not result:
            print(f"❌ Doctor with email {doctor_email} not found!")
            print("   Please run database.py first to create the sample doctor.")
            return
        
        doctor_id = result['user_id']
    
    print(f"\n🏥 Creating sample patients for Dr. {doctor_email}")
    print("=" * 60)
    
    created_count = 0
    skipped_count = 0
    
    for patient_info in SAMPLE_PATIENTS:
        try:
            # Create user account
            user_id = create_user(
                email=patient_info['email'],
                password=patient_info['password'],
                user_type='patient',
                full_name=patient_info['full_name']
            )
            
            # Create patient record
            patient_id = create_patient(
                user_id=user_id,
                assigned_doctor_id=doctor_id,
                patient_data=patient_info['patient_data']
            )
            
            print(f"✅ Created: {patient_info['full_name']}")
            print(f"   Email: {patient_info['email']}")
            print(f"   Surgery: {patient_info['patient_data']['surgery_type']}")
            print(f"   Risk Profile: ASA {patient_info['patient_data']['asa_class']}, "
                  f"Age {patient_info['patient_data']['age']}")
            print()
            
            created_count += 1
            
        except Exception as e:
            if 'UNIQUE constraint failed' in str(e):
                print(f"⚠️  Skipped: {patient_info['full_name']} (already exists)")
                skipped_count += 1
            else:
                print(f"❌ Error creating {patient_info['full_name']}: {e}")
    
    print("=" * 60)
    print(f"\n📊 Summary:")
    print(f"   ✅ Created: {created_count} patients")
    print(f"   ⚠️  Skipped: {skipped_count} patients (already exist)")
    print(f"\n🔑 All patient passwords: patient123")
    print(f"\n💡 You can now:")
    print(f"   1. Login as doctor (dr.smith@hospital.com / doctor123)")
    print(f"   2. View and assess these patients")
    print(f"   3. Login as any patient to see their portal")
    print()


if __name__ == '__main__':
    create_sample_patients()
