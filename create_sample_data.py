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


def create_icu_sample_data():
    """Create sample ICU beds and admin user"""
    print("\n🏥 Creating ICU Management Sample Data")
    print("=" * 60)
    
    from database import create_admin_user, create_icu_bed
    
    # 1. Create admin user
    try:
        admin_id = create_admin_user(
            email='admin@hospital.com',
            password='admin123',
            full_name='Hospital Administrator',
            role='admin'
        )
        print(f"✅ Created admin user: admin@hospital.com (password: admin123)")
        print(f"   Admin ID: {admin_id}")
    except Exception as e:
        if 'UNIQUE constraint failed' in str(e):
            print(f"⚠️  Admin user already exists: admin@hospital.com")
        else:
            print(f"❌ Error creating admin: {e}")
    
    # 2. Create ICU beds with varying equipment
    icu_beds = [
        {
            'room_number': '101A',
            'floor_number': 1,
            'equipment_type': 'Ventilator, Dialysis, Advanced Monitoring',
            'proximity_to_nursing_station': 1,  # Very close
            'has_ventilator': 1,
            'has_dialysis': 1,
            'has_ecmo': 0,
            'isolation_room': 0,
            'bed_cost_per_day': 4500.0
        },
        {
            'room_number': '101B',
            'floor_number': 1,
            'equipment_type': 'Ventilator, ECMO, Advanced Monitoring',
            'proximity_to_nursing_station': 1,
            'has_ventilator': 1,
            'has_dialysis': 0,
            'has_ecmo': 1,
            'isolation_room': 0,
            'bed_cost_per_day': 5000.0
        },
        {
            'room_number': '102A',
            'floor_number': 1,
            'equipment_type': 'Ventilator, Advanced Monitoring',
            'proximity_to_nursing_station': 2,
            'has_ventilator': 1,
            'has_dialysis': 0,
            'has_ecmo': 0,
            'isolation_room': 0,
            'bed_cost_per_day': 3500.0
        },
        {
            'room_number': '102B',
            'floor_number': 1,
            'equipment_type': 'Dialysis, Advanced Monitoring',
            'proximity_to_nursing_station': 2,
            'has_ventilator': 0,
            'has_dialysis': 1,
            'has_ecmo': 0,
            'isolation_room': 0,
            'bed_cost_per_day': 3000.0
        },
        {
            'room_number': '103',
            'floor_number': 1,
            'equipment_type': 'Standard ICU Monitoring',
            'proximity_to_nursing_station': 3,
            'has_ventilator': 0,
            'has_dialysis': 0,
            'has_ecmo': 0,
            'isolation_room': 0,
            'bed_cost_per_day': 2500.0
        },
        {
            'room_number': '104',
            'floor_number': 1,
            'equipment_type': 'Standard ICU Monitoring',
            'proximity_to_nursing_station': 3,
            'has_ventilator': 0,
            'has_dialysis': 0,
            'has_ecmo': 0,
            'isolation_room': 0,
            'bed_cost_per_day': 2500.0
        },
        {
            'room_number': '201',
            'floor_number': 2,
            'equipment_type': 'Isolation Room, Ventilator',
            'proximity_to_nursing_station': 2,
            'has_ventilator': 1,
            'has_dialysis': 0,
            'has_ecmo': 0,
            'isolation_room': 1,
            'bed_cost_per_day': 4000.0
        },
        {
            'room_number': '202',
            'floor_number': 2,
            'equipment_type': 'Isolation Room, Standard Monitoring',
            'proximity_to_nursing_station': 2,
            'has_ventilator': 0,
            'has_dialysis': 0,
            'has_ecmo': 0,
            'isolation_room': 1,
            'bed_cost_per_day': 3000.0
        },
        {
            'room_number': '203',
            'floor_number': 2,
            'equipment_type': 'Ventilator, Dialysis',
            'proximity_to_nursing_station': 4,
            'has_ventilator': 1,
            'has_dialysis': 1,
            'has_ecmo': 0,
            'isolation_room': 0,
            'bed_cost_per_day': 4000.0
        },
        {
            'room_number': '204',
            'floor_number': 2,
            'equipment_type': 'Standard ICU Monitoring',
            'proximity_to_nursing_station': 5,
            'has_ventilator': 0,
            'has_dialysis': 0,
            'has_ecmo': 0,
            'isolation_room': 0,
            'bed_cost_per_day': 2500.0
        }
    ]
    
    created_beds = 0
    for bed_data in icu_beds:
        try:
            bed_id = create_icu_bed(bed_data)
            print(f"✅ Created ICU Bed: Room {bed_data['room_number']}, Floor {bed_data['floor_number']}")
            print(f"   Equipment: {bed_data['equipment_type']}")
            print(f"   Cost: ${bed_data['bed_cost_per_day']}/day")
            print()
            created_beds += 1
        except Exception as e:
            print(f"❌ Error creating bed {bed_data['room_number']}: {e}")
    
    print("=" * 60)
    print(f"\n📊 ICU Setup Summary:")
    print(f"   ✅ Created: {created_beds} ICU beds")
    print(f"   🏥 Total Capacity: {created_beds} beds")
    print(f"   💰 Cost Range: $2,500 - $5,000 per day")
    print(f"\n🔑 Admin Login:")
    print(f"   Email: admin@hospital.com")
    print(f"   Password: admin123")
    print(f"\n💡 ICU Features:")
    print(f"   • Real-time bed status tracking")
    print(f"   • Smart bed allocation algorithm")
    print(f"   • Predictive ICU forecasting")
    print(f"   • Equipment matching (Ventilator, Dialysis, ECMO)")
    print(f"   • Isolation room capabilities")
    print()


if __name__ == '__main__':
    create_sample_patients()
    create_icu_sample_data()

