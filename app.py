"""
Flask Backend for Surgical Risk Prediction System
Provides REST API for doctor dashboard and patient portal
"""

from flask import Flask, request, jsonify, session
from flask_cors import CORS
from datetime import datetime, timedelta
import json
import os

from database import (
    init_database, create_user, verify_user, create_patient,
    get_patient_by_id, get_patient_by_user_id, get_patients_by_doctor,
    get_all_patients,
    save_risk_assessment, get_latest_risk_assessment,
    save_lifestyle_plan, get_lifestyle_plan, get_doctor_info
)

# Try to import ML predictor, but allow system to work without it
try:
    from ml_predictor import SurgicalRiskPredictor
    ML_PREDICTOR_AVAILABLE = True
    print("✓ ML Predictor loaded successfully")
except Exception as e:
    print(f"⚠️  ML Predictor not available: {e}")
    print("   System will run without ML prediction features")
    ML_PREDICTOR_AVAILABLE = False
    SurgicalRiskPredictor = None

try:
    from clinical_recs import ClinicalRecommendations
    CLINICAL_RECS_AVAILABLE = True
except Exception as e:
    print(f"⚠️  Clinical Recommendations not available: {e}")
    CLINICAL_RECS_AVAILABLE = False
    ClinicalRecommendations = None

# Optional chatbot import - system works without it
try:
    from chatbot import get_chatbot
    CHATBOT_AVAILABLE = True
except Exception as e:
    print(f"⚠️  Chatbot module not available: {e}")
    print("   System will run without chatbot features")
    CHATBOT_AVAILABLE = False
    get_chatbot = None

# Optional blood report extractor - system works without it
try:
    from blood_report_extractor import get_extractor
    BLOOD_EXTRACTOR_AVAILABLE = True
except Exception as e:
    print(f"⚠️  Blood report extractor not available: {e}")
    print("   System will run without blood report extraction")
    BLOOD_EXTRACTOR_AVAILABLE = False
    get_extractor = None

app = Flask(__name__)
app.config['SECRET_KEY'] = 'surgical-risk-prediction-secret-key-change-in-production'
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=24)

# Enable CORS - allow ports 3000-3005
CORS(app, supports_credentials=True, origins=['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', 'http://localhost:3004', 'http://localhost:3005'])

# Initialize ML predictor (load models once at startup)
predictor = None
if ML_PREDICTOR_AVAILABLE:
    try:
        predictor = SurgicalRiskPredictor(models_dir='..')
        print("✅ ML Predictor initialized successfully")
    except Exception as e:
        print(f"⚠️ Warning: ML Predictor initialization failed: {e}")
        predictor = None
else:
    print("⚠️ ML Predictor not available - skipping initialization")

# Initialize database
init_database()


# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def login_required(f):
    """Decorator to require authentication"""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function


def doctor_required(f):
    """Decorator to require doctor role"""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session or session.get('user_type') != 'doctor':
            return jsonify({'error': 'Doctor access required'}), 403
        return f(*args, **kwargs)
    return decorated_function


def patient_required(f):
    """Decorator to require patient role"""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session or session.get('user_type') != 'patient':
            return jsonify({'error': 'Patient access required'}), 403
        return f(*args, **kwargs)
    return decorated_function


# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

@app.route('/api/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['email', 'password', 'user_type', 'full_name']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Validate user_type
        if data['user_type'] not in ['doctor', 'patient']:
            return jsonify({'error': 'Invalid user_type. Must be doctor or patient'}), 400
        
        # Create user
        user_id = create_user(
            email=data['email'],
            password=data['password'],
            user_type=data['user_type'],
            full_name=data['full_name'],
            department=data.get('department')
        )
        
        return jsonify({
            'message': 'User registered successfully',
            'user_id': user_id
        }), 201
        
    except Exception as e:
        # Check for duplicate email
        if 'UNIQUE constraint failed' in str(e):
            return jsonify({'error': 'Email already registered'}), 409
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500


@app.route('/api/login', methods=['POST'])
def login():
    """Login user and create session"""
    try:
        data = request.get_json()
        
        if 'email' not in data or 'password' not in data:
            return jsonify({'error': 'Email and password required'}), 400
        
        # Verify credentials
        user = verify_user(data['email'], data['password'])
        
        if not user:
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Create session (no PHI in session - only IDs and type)
        session['user_id'] = user['user_id']
        session['user_type'] = user['user_type']
        session.permanent = True
        
        return jsonify({
            'message': 'Login successful',
            'user': {
                'user_id': user['user_id'],
                'email': user['email'],
                'user_type': user['user_type'],
                'full_name': user['full_name'],
                'department': user['department']
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Login failed: {str(e)}'}), 500


@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    """Logout user and clear session"""
    session.clear()
    return jsonify({'message': 'Logout successful'}), 200


@app.route('/api/check-session', methods=['GET'])
def check_session():
    """Check if user is logged in"""
    if 'user_id' in session:
        return jsonify({
            'authenticated': True,
            'user_type': session.get('user_type')
        }), 200
    else:
        return jsonify({'authenticated': False}), 200


# ============================================================================
# DOCTOR ENDPOINTS
# ============================================================================

@app.route('/api/doctor/patients', methods=['GET'])
@doctor_required
def get_doctor_patients():
    """Get all patients assigned to the logged-in doctor, sorted by risk (highest first)"""
    try:
        doctor_id = session['user_id']
        patients = get_patients_by_doctor(doctor_id)
        
        # Get latest risk assessment for each patient
        for patient in patients:
            assessment = get_latest_risk_assessment(patient['patient_id'])
            patient['latest_assessment'] = assessment
        
        return jsonify({'patients': patients}), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve patients: {str(e)}'}), 500


@app.route('/api/doctor/risk-summary', methods=['GET'])
@doctor_required
def get_risk_summary():
    """Get risk distribution summary for doctor's dashboard"""
    try:
        from database import get_patient_risk_summary
        doctor_id = session['user_id']
        summary = get_patient_risk_summary(doctor_id)
        
        return jsonify(summary), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve risk summary: {str(e)}'}), 500


@app.route('/api/doctor/patient/<int:patient_id>', methods=['GET'])
@doctor_required
def get_patient_details(patient_id):
    """Get detailed patient information"""
    try:
        patient = get_patient_by_id(patient_id)
        
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        # Verify this patient is assigned to the logged-in doctor
        if patient['assigned_doctor_id'] != session['user_id']:
            return jsonify({'error': 'Access denied'}), 403
        
        # Get latest assessment
        assessment = get_latest_risk_assessment(patient_id)
        
        return jsonify({
            'patient': patient,
            'latest_assessment': assessment
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve patient: {str(e)}'}), 500


@app.route('/api/doctor/add-patient', methods=['POST'])
@doctor_required
def add_patient():
    """Add a new patient"""
    try:
        data = request.get_json()
        doctor_id = session['user_id']
        
        # Validate required fields
        required_fields = [
            'email', 'password', 'full_name', 'surgery_type', 'surgery_date',
            'age', 'gender', 'bmi', 'asa_class', 'emergency_surgery',
            'hemoglobin', 'platelets', 'creatinine', 'albumin', 'blood_loss'
        ]
        
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Create user account for patient
        user_id = create_user(
            email=data['email'],
            password=data['password'],
            user_type='patient',
            full_name=data['full_name']
        )
        
        # Prepare patient data (exclude user creation fields)
        patient_data = {k: v for k, v in data.items() 
                       if k not in ['email', 'password', 'full_name']}
        
        # Create patient record
        patient_id = create_patient(user_id, doctor_id, patient_data)
        
        return jsonify({
            'message': 'Patient added successfully',
            'patient_id': patient_id,
            'user_id': user_id
        }), 201
        
    except Exception as e:
        if 'UNIQUE constraint failed' in str(e):
            return jsonify({'error': 'Email already registered'}), 409
        return jsonify({'error': f'Failed to add patient: {str(e)}'}), 500


@app.route('/api/doctor/assess-patient/<int:patient_id>', methods=['POST'])
@doctor_required
def assess_patient_risk(patient_id):
    """Generate risk assessment for a patient"""
    try:
        print(f"\n=== Generating Risk Assessment for Patient ID: {patient_id} ===")
        
        # Get patient data
        patient = get_patient_by_id(patient_id)
        
        if not patient:
            print(f"❌ Patient not found: {patient_id}")
            return jsonify({'error': 'Patient not found'}), 404
        
        print(f"✅ Patient found: {patient.get('patient_name', 'Unknown')}")
        
        # Verify access
        doctor_id = session.get('user_id')
        print(f"Doctor ID from session: {doctor_id}")
        print(f"Patient assigned to doctor: {patient.get('assigned_doctor_id')}")
        
        if patient['assigned_doctor_id'] != doctor_id:
            print(f"❌ Access denied - Doctor {doctor_id} trying to access patient of doctor {patient['assigned_doctor_id']}")
            return jsonify({'error': 'Access denied'}), 403
        
        print("✅ Access verified")
        
        # Generate predictions - use mock data if predictor unavailable
        if predictor is None:
            # Generate mock assessment when ML is not available
            import random
            
            # Calculate risk based on patient factors
            age = patient.get('age', 50)
            bmi = patient.get('bmi', 25)
            
            # Simple risk scoring
            risk_score = 0
            if age > 65: risk_score += 2
            elif age > 50: risk_score += 1
            
            if bmi > 30: risk_score += 2
            elif bmi > 25: risk_score += 1
            
            if patient.get('diabetes') == 1: risk_score += 2
            if patient.get('hypertension') == 1: risk_score += 1
            if patient.get('smoking') == 1: risk_score += 2
            
            # Determine overall risk
            if risk_score >= 6:
                overall_risk = 'CRITICAL'
            elif risk_score >= 4:
                overall_risk = 'HIGH'
            elif risk_score >= 2:
                overall_risk = 'MODERATE'
            else:
                overall_risk = 'LOW'
            
            prediction = {
                'overall_risk': overall_risk,
                'risks': {
                    'aki': random.uniform(0.1, 0.4),
                    'cardiovascular': random.uniform(0.1, 0.3),
                    'transfusion': random.uniform(0.05, 0.25)
                },
                'risk_categories': {
                    'aki': overall_risk,
                    'cardiovascular': overall_risk,
                    'transfusion': 'MODERATE' if overall_risk == 'CRITICAL' else overall_risk
                },
                'contributing_factors': {
                    'age': f"{age} years",
                    'bmi': f"{bmi}",
                    'comorbidities': ', '.join([k for k, v in patient.items() if k in ['diabetes', 'hypertension', 'smoking'] and v == 1]) or 'None'
                }
            }
            
            recommendations = {
                'preoperative': [
                    'Complete preoperative lab work 3-5 days before surgery',
                    'Review all medications with anesthesiologist',
                    'Optimize chronic conditions (blood pressure, blood sugar)'
                ],
                'intraoperative': [
                    'Consider goal-directed fluid therapy',
                    'Monitor hemodynamics closely',
                    'Have blood products available if needed'
                ],
                'postoperative': [
                    'Monitor vital signs every 2 hours for first 24 hours',
                    'Early mobilization encouraged',
                    'Pain management with multimodal approach'
                ],
                'monitoring': [
                    'Watch for signs of infection',
                    'Monitor kidney function (creatinine levels)',
                    'Assess cardiovascular status regularly'
                ]
            }
        else:
            # Use actual ML predictor
            prediction = predictor.predict(patient)
            recommendations = ClinicalRecommendations.generate_recommendations(prediction)
        
        # Save assessment to database
        assessment_id = save_risk_assessment(
            patient_id=patient_id,
            overall_risk=prediction['overall_risk'],
            risks=prediction['risks'],
            recommendations=json.dumps(recommendations),
            contributing_factors=json.dumps(prediction['contributing_factors'])
        )
        
        # Generate ICU prediction
        from database import save_icu_prediction, add_to_icu_waitlist
        
        if predictor is None:
            # Mock ICU prediction
            icu_prediction = {
                'icu_needed': prediction['overall_risk'] in ['CRITICAL', 'HIGH'],
                'priority_score': 85 if prediction['overall_risk'] == 'CRITICAL' else 65 if prediction['overall_risk'] == 'HIGH' else 40,
                'estimated_duration': 2 if prediction['overall_risk'] == 'CRITICAL' else 1,
                'reasoning': f"Based on {prediction['overall_risk']} risk level and patient comorbidities"
            }
        else:
            icu_prediction = predictor.predict_icu_need(patient, prediction)
        
        # Save ICU prediction to database
        prediction_id = save_icu_prediction(
            patient_id=patient_id,
            assessment_id=assessment_id,
            prediction_data=icu_prediction
        )
        
        # If ICU needed and HIGH/CRITICAL risk, add to waitlist automatically
        if icu_prediction['icu_needed'] and prediction['overall_risk'] in ['HIGH', 'CRITICAL']:
            add_to_icu_waitlist(
                patient_id=patient_id,
                prediction_id=prediction_id,
                priority=icu_prediction['priority_score']
            )
        
        print(f"✅ Risk assessment completed successfully")
        print(f"Overall Risk: {prediction['overall_risk']}")
        
        return jsonify({
            'assessment_id': assessment_id,
            'overall_risk': prediction['overall_risk'],
            'risks': prediction['risks'],
            'risk_categories': prediction['risk_categories'],
            'contributing_factors': prediction['contributing_factors'],
            'recommendations': recommendations,
            'icu_prediction': icu_prediction
        }), 200
        
    except Exception as e:
        print(f"❌ Risk assessment failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Risk assessment failed: {str(e)}'}), 500


# ============================================================================
# PATIENT ENDPOINTS
# ============================================================================

@app.route('/api/patient/my-surgery', methods=['GET'])
@patient_required
def get_patient_surgery_info():
    """Get patient's surgery information"""
    try:
        user_id = session['user_id']
        patient = get_patient_by_user_id(user_id)
        
        if not patient:
            return jsonify({'error': 'Patient record not found'}), 404
        
        # Get doctor info
        doctor = get_doctor_info(patient['assigned_doctor_id'])
        
        return jsonify({
            'surgery_type': patient['surgery_type'],
            'surgery_date': patient['surgery_date'],
            'status': patient['status'],
            'doctor': doctor
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve surgery info: {str(e)}'}), 500


@app.route('/api/patient/risk-assessment', methods=['GET'])
@patient_required
def get_patient_risk_assessment():
    """Get patient's latest risk assessment (patient-friendly version)"""
    try:
        user_id = session['user_id']
        patient = get_patient_by_user_id(user_id)
        
        if not patient:
            return jsonify({'error': 'Patient record not found'}), 404
        
        # Get latest assessment
        assessment = get_latest_risk_assessment(patient['patient_id'])
        
        if not assessment:
            return jsonify({'message': 'No risk assessment available yet'}), 200
        
        # Parse stored JSON
        if assessment.get('recommendations'):
            assessment['recommendations'] = json.loads(assessment['recommendations'])
        
        # Generate patient-friendly version (no percentages)
        patient_friendly = {
            'overall_status': assessment['overall_risk'],
            'summary': assessment['recommendations'].get('summary', '') if assessment.get('recommendations') else '',
            'monitoring_plan': [],
            'assessed_at': assessment['assessed_at']
        }
        
        # Convert to patient-friendly language
        risk_map = {
            'CRITICAL': 'We will be monitoring you very closely',
            'HIGH': 'We will be monitoring you closely',
            'MODERATE': 'We will be monitoring you as part of standard care',
            'LOW': 'Standard monitoring will be provided'
        }
        
        patient_friendly['care_level'] = risk_map.get(
            assessment['overall_risk'], 
            'You will receive appropriate care'
        )
        
        return jsonify(patient_friendly), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve assessment: {str(e)}'}), 500


@app.route('/api/patient/generate-lifestyle-plan', methods=['POST'])
@patient_required
def generate_patient_lifestyle_plan():
    """Generate personalized lifestyle and recovery plan"""
    try:
        user_id = session['user_id']
        patient = get_patient_by_user_id(user_id)
        
        if not patient:
            return jsonify({'error': 'Patient record not found'}), 404
        
        # Get latest risk assessment
        assessment = get_latest_risk_assessment(patient['patient_id'])
        
        if not assessment:
            return jsonify({'error': 'Risk assessment required first'}), 400
        
        # Build risk assessment object for recommendations
        risk_assessment = {
            'overall_risk': assessment['overall_risk'],
            'risks': {
                'aki': assessment['aki_risk'],
                'cardiovascular': assessment['cardiovascular_risk'],
                'transfusion': assessment['transfusion_risk'],
                'mortality': assessment.get('mortality_risk', 0)
            },
            'risk_categories': {}
        }
        
        # Categorize risks
        for comp, risk in risk_assessment['risks'].items():
            if risk >= 70:
                category = 'CRITICAL'
            elif risk >= 40:
                category = 'HIGH'
            elif risk >= 20:
                category = 'MODERATE'
            else:
                category = 'LOW'
            risk_assessment['risk_categories'][comp] = category
        
        # Generate patient-friendly plan
        patient_plan = ClinicalRecommendations.generate_patient_friendly_plan(
            risk_assessment, patient
        )
        
        # Generate recovery timeline
        recovery_timeline = ClinicalRecommendations.generate_recovery_timeline(
            patient['surgery_type'], 
            assessment['overall_risk']
        )
        
        # Save lifestyle plan
        plan_data = {
            'diet_recommendations': json.dumps([r for r in patient_plan['lifestyle'] 
                                               if r['category'] in ['Nutrition']]),
            'exercise_recommendations': json.dumps([r for r in patient_plan['lifestyle'] 
                                                    if r['category'] in ['Physical Activity']]),
            'medication_reminders': json.dumps([r for r in patient_plan['lifestyle'] 
                                               if r['category'] in ['Medications', 'Blood Sugar Control']]),
            'warning_signs': json.dumps(patient_plan['warning_signs']),
            'recovery_timeline': json.dumps(recovery_timeline)
        }
        
        plan_id = save_lifestyle_plan(patient['patient_id'], plan_data)
        
        return jsonify({
            'plan_id': plan_id,
            'overview': patient_plan['overview'],
            'what_to_expect': patient_plan['what_to_expect'],
            'monitoring': patient_plan['monitoring'],
            'lifestyle_recommendations': patient_plan['lifestyle'],
            'warning_signs': patient_plan['warning_signs'],
            'recovery_timeline': recovery_timeline
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to generate lifestyle plan: {str(e)}'}), 500


@app.route('/api/patient/lifestyle-plan', methods=['GET'])
@patient_required
def get_patient_lifestyle_plan():
    """Get patient's existing lifestyle plan"""
    try:
        user_id = session['user_id']
        patient = get_patient_by_user_id(user_id)
        
        if not patient:
            return jsonify({'error': 'Patient record not found'}), 404
        
        plan = get_lifestyle_plan(patient['patient_id'])
        
        if not plan:
            return jsonify({'message': 'No lifestyle plan generated yet'}), 200
        
        # Parse JSON fields
        for field in ['diet_recommendations', 'exercise_recommendations', 
                     'medication_reminders', 'warning_signs', 'recovery_timeline']:
            if plan.get(field):
                try:
                    plan[field] = json.loads(plan[field])
                except:
                    pass
        
        return jsonify(plan), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve lifestyle plan: {str(e)}'}), 500


# ============================================================================
# SYMPTOM TRACKING ENDPOINTS
# ============================================================================

@app.route('/api/symptoms/log', methods=['POST'])
@patient_required
def log_symptoms():
    """Log patient symptoms"""
    try:
        from database import save_symptom_log
        
        user_id = session['user_id']
        patient = get_patient_by_user_id(user_id)
        
        if not patient:
            return jsonify({'error': 'Patient record not found'}), 404
        
        data = request.get_json()
        
        # Check for red flags
        red_flags = []
        if data.get('painLevel', 0) >= 8:
            red_flags.append('severe_pain')
        if float(data.get('temperature', 0) or 0) >= 101.0:
            red_flags.append('high_fever')
        if data.get('woundCondition') == 'poor':
            red_flags.append('poor_wound')
        if data.get('discharge'):
            red_flags.append('wound_discharge')
        if data.get('shortnessOfBreath'):
            red_flags.append('breathing_difficulty')
        
        # Add red flag indicator to data
        data['redFlagAlert'] = len(red_flags) > 0
        
        # Save symptom log
        log_id = save_symptom_log(patient['patient_id'], data)
        
        return jsonify({
            'message': 'Symptoms logged successfully',
            'log_id': log_id,
            'red_flags': red_flags,
            'alert_sent': len(red_flags) > 0
        }), 201
        
    except Exception as e:
        return jsonify({'error': f'Failed to log symptoms: {str(e)}'}), 500


@app.route('/api/symptoms/history', methods=['GET'])
@patient_required
def get_symptoms_history():
    """Get patient's symptom history"""
    try:
        from database import get_symptom_history
        
        user_id = session['user_id']
        patient = get_patient_by_user_id(user_id)
        
        if not patient:
            return jsonify({'error': 'Patient record not found'}), 404
        
        limit = request.args.get('limit', 30, type=int)
        history = get_symptom_history(patient['patient_id'], limit)
        
        return jsonify({'history': history}), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to retrieve symptom history: {str(e)}'}), 500


@app.route('/api/symptoms/alert', methods=['POST'])
@patient_required
def send_symptom_alert():
    """Send alert to care team about concerning symptoms"""
    try:
        from database import get_symptom_history, get_doctor_info
        
        user_id = session['user_id']
        patient = get_patient_by_user_id(user_id)
        
        if not patient:
            return jsonify({'error': 'Patient record not found'}), 404
        
        data = request.get_json()
        red_flags = data.get('redFlags', [])
        
        # Get doctor info
        doctor = get_doctor_info(patient['assigned_doctor_id'])
        
        # In a real system, this would send an email/SMS to the doctor
        print(f"🚨 RED FLAG ALERT for Patient {patient['patient_id']}")
        print(f"   Doctor: {doctor['full_name']} ({doctor['email']})")
        print(f"   Red Flags: {', '.join(red_flags)}")
        
        return jsonify({
            'message': 'Alert sent to care team',
            'doctor_notified': doctor['full_name']
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to send alert: {str(e)}'}), 500


@app.route('/api/patient/update-surgery', methods=['POST'])
@patient_required
def update_surgery_info():
    """Update patient's surgery information"""
    try:
        from database import update_patient_surgery_info
        
        user_id = session['user_id']
        patient = get_patient_by_user_id(user_id)
        
        if not patient:
            return jsonify({'error': 'Patient record not found'}), 404
        
        data = request.get_json()
        
        # Update surgery info
        success = update_patient_surgery_info(patient['patient_id'], data)
        
        if success:
            return jsonify({'message': 'Surgery information updated successfully'}), 200
        else:
            return jsonify({'error': 'No changes made'}), 400
        
    except Exception as e:
        return jsonify({'error': f'Failed to update surgery information: {str(e)}'}), 500


# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'ml_predictor': 'available' if predictor else 'unavailable',
        'timestamp': datetime.now().isoformat()
    }), 200


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500


# ============================================================================
# CHATBOT ENDPOINTS
# ============================================================================

@app.route('/api/chatbot/ask', methods=['POST'])
@login_required
def chatbot_ask():
    """AI chatbot for 24/7 recovery assistance"""
    # Check if chatbot is available
    if not CHATBOT_AVAILABLE:
        return jsonify({
            'error': 'Chatbot service is currently unavailable',
            'response': 'I apologize, but the chatbot service is temporarily unavailable. Please contact your doctor if you have urgent concerns.',
            'recommended_actions': ['Contact your healthcare team', 'Call emergency services if urgent'],
            'needs_alert': False,
            'timestamp': datetime.now().isoformat()
        }), 200
    
    try:
        data = request.get_json()
        
        if 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        message = data['message']
        user_type = session.get('user_type')
        
        # Get patient data
        if user_type == 'patient':
            patient = get_patient_by_user_id(session['user_id'])
        elif user_type == 'doctor' and 'patient_id' in data:
            patient = get_patient_by_id(data['patient_id'])
        else:
            return jsonify({'error': 'Patient information not available'}), 400
        
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        # Calculate days post-op
        from datetime import datetime
        surgery_date = datetime.strptime(patient['surgery_date'], '%Y-%m-%d')
        days_post_op = (datetime.now() - surgery_date).days
        
        # Prepare patient data for chatbot
        patient_data = {
            'patient_name': patient.get('patient_name', 'Patient'),
            'age': patient['age'],
            'surgery_type': patient['surgery_type'],
            'asa_class': patient['asa_class'],
            'days_post_op': days_post_op,
            'diabetes': patient.get('diabetes', 0),
            'heart_disease': patient.get('heart_disease', 0),
            'hypertension': patient.get('hypertension', 0)
        }
        
        # Get chat history from request (optional)
        chat_history = data.get('chat_history', [])
        
        # Process message through chatbot
        bot = get_chatbot()
        result = bot.process_message(message, patient_data, chat_history)
        
        # If doctor alert is needed, log it (you can expand this to send notifications)
        if result['needs_doctor_alert']:
            print(f"🚨 ALERT: Patient {patient['patient_id']} reported: {result['red_flags']}")
            # TODO: Send notification to assigned doctor
        
        return jsonify({
            'response': result['response'],
            'recommended_actions': result['recommended_actions'],
            'needs_alert': result['needs_doctor_alert'],
            'timestamp': result['timestamp']
        }), 200
        
    except Exception as e:
        print(f"Chatbot error: {e}")
        return jsonify({'error': f'Chatbot error: {str(e)}'}), 500


@app.route('/api/chatbot/quick-questions', methods=['GET'])
@login_required
def get_quick_questions():
    """Get suggested quick questions based on patient's surgery and recovery stage"""
    # Works even without chatbot module
    try:
        user_type = session.get('user_type')
        
        if user_type == 'patient':
            patient = get_patient_by_user_id(session['user_id'])
        else:
            return jsonify({'error': 'This endpoint is for patients only'}), 403
        
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        # Calculate days post-op
        from datetime import datetime
        surgery_date = datetime.strptime(patient['surgery_date'], '%Y-%m-%d')
        days_post_op = (datetime.now() - surgery_date).days
        
        # Suggest questions based on recovery timeline
        if days_post_op <= 3:
            quick_questions = [
                "Is this pain level normal?",
                "What are warning signs I should watch for?",
                "When can I start walking?",
                "How do I care for my wound?"
            ]
        elif days_post_op <= 7:
            quick_questions = [
                "When can I shower?",
                "What activities can I do now?",
                "Is swelling normal?",
                "When can I drive?"
            ]
        elif days_post_op <= 14:
            quick_questions = [
                "When can I exercise?",
                "Can I return to work?",
                "What foods should I eat?",
                "When is my follow-up appointment?"
            ]
        else:
            quick_questions = [
                "When can I resume normal activities?",
                "What exercises are safe now?",
                "When can I lift heavy objects?",
                "How long until full recovery?"
            ]
        
        return jsonify({'quick_questions': quick_questions}), 200
        
    except Exception as e:
        return jsonify({'error': f'Failed to get quick questions: {str(e)}'}), 500


# ============================================================================
# BLOOD REPORT EXTRACTION
# ============================================================================

@app.route('/api/extract-blood-report', methods=['POST'])
def extract_blood_report():
    """
    Extract blood vitals from uploaded PDF/image report
    Accepts: multipart/form-data with 'file' and optional 'patient_id'
    Returns: extracted values with confidence scores
    """
    if not BLOOD_EXTRACTOR_AVAILABLE:
        return jsonify({
            'error': 'Blood report extraction not available',
            'message': 'Required libraries not installed'
        }), 503
    
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Validate file type
        allowed_extensions = {'pdf', 'png', 'jpg', 'jpeg'}
        file_extension = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        
        if file_extension not in allowed_extensions:
            return jsonify({
                'error': f'Invalid file type. Allowed: {", ".join(allowed_extensions)}'
            }), 400
        
        # Get patient_id if provided
        patient_id = request.form.get('patient_id')
        
        # Read file bytes
        file_bytes = file.read()
        
        # Extract vitals
        extractor = get_extractor()
        result = extractor.extract_from_file(file_bytes, file.filename)
        
        # If extraction successful and patient_id provided, update database
        if result['status'] == 'success' and patient_id and result['values']:
            try:
                from database import update_patient_vitals
                update_patient_vitals(patient_id, result['values'])
                result['database_updated'] = True
            except Exception as e:
                print(f"Database update error: {e}")
                result['database_updated'] = False
                result['database_error'] = str(e)
        
        return jsonify(result), 200
    
    except Exception as e:
        print(f"Blood report extraction error: {e}")
        return jsonify({
            'status': 'error',
            'error': 'Failed to extract blood report',
            'message': str(e)
        }), 500


# ============================================================================
# ICU MANAGEMENT & ADMIN PORTAL ENDPOINTS
# ============================================================================

def admin_required(f):
    """Decorator to require admin role"""
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'admin_id' not in session:
            return jsonify({'error': 'Admin authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function


@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    """Admin login endpoint"""
    try:
        from database import verify_admin_user
        
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        admin = verify_admin_user(email, password)
        
        if admin:
            session.permanent = True
            session['admin_id'] = admin['admin_id']
            session['admin_email'] = admin['email']
            session['admin_name'] = admin['full_name']
            session['admin_role'] = admin['role']
            
            return jsonify({
                'message': 'Login successful',
                'admin': {
                    'admin_id': admin['admin_id'],
                    'email': admin['email'],
                    'full_name': admin['full_name'],
                    'role': admin['role']
                }
            }), 200
        else:
            return jsonify({'error': 'Invalid credentials'}), 401
    
    except Exception as e:
        print(f"Admin login error: {e}")
        return jsonify({'error': 'Login failed'}), 500


@app.route('/api/admin/logout', methods=['POST'])
@admin_required
def admin_logout():
    """Admin logout endpoint"""
    session.clear()
    return jsonify({'message': 'Logged out successfully'}), 200


@app.route('/api/admin/check-session', methods=['GET'])
def admin_check_session():
    """Check if admin is logged in"""
    if 'admin_id' in session:
        return jsonify({
            'authenticated': True,
            'admin': {
                'admin_id': session.get('admin_id'),
                'email': session.get('admin_email'),
                'full_name': session.get('admin_name'),
                'role': session.get('admin_role')
            }
        }), 200
    return jsonify({'authenticated': False}), 200


@app.route('/api/admin/icu-status', methods=['GET'])
@admin_required
def get_icu_status():
    """Get real-time ICU bed status"""
    try:
        from database import get_all_icu_beds, get_icu_capacity
        
        beds = get_all_icu_beds()
        capacity = get_icu_capacity()
        
        return jsonify({
            'beds': beds,
            'status': capacity  # Return as 'status' for frontend compatibility
        }), 200
    
    except Exception as e:
        print(f"ICU status error: {e}")
        return jsonify({'error': 'Failed to fetch ICU status'}), 500


@app.route('/api/admin/auto-allocate-beds', methods=['POST'])
@admin_required
def auto_allocate_beds():
    """Automatically allocate ICU beds based on patient criticality"""
    try:
        from database import auto_allocate_beds_by_criticality
        
        print("🔄 Starting auto-allocation...")
        allocated = auto_allocate_beds_by_criticality()
        print(f"✅ Allocated {len(allocated)} beds")
        print(f"Allocated patients: {allocated}")
        
        return jsonify({
            'message': f'{len(allocated)} bed(s) allocated successfully',
            'allocated': allocated
        }), 200
    
    except Exception as e:
        print(f"❌ Auto-allocation error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to auto-allocate beds: {str(e)}'}), 500


@app.route('/api/admin/manual-allocate-bed', methods=['POST'])
@admin_required
def manual_allocate_bed():
    """Manually allocate one ICU bed to highest priority patient"""
    try:
        from database import allocate_one_bed_manually
        
        result = allocate_one_bed_manually()
        
        if result:
            return jsonify({
                'message': f"Bed {result['bed_number']} allocated to {result['patient_name']}",
                'allocation': result
            }), 200
        else:
            return jsonify({
                'message': 'No patients waiting or no beds available',
                'allocation': None
            }), 200
    
    except Exception as e:
        print(f"❌ Manual allocation error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to allocate bed: {str(e)}'}), 500


@app.route('/api/admin/icu-beds', methods=['POST'])
@admin_required
def create_bed():
    """Create a new ICU bed"""
    try:
        from database import create_icu_bed
        
        data = request.get_json()
        bed_id = create_icu_bed(data)
        
        return jsonify({
            'message': 'ICU bed created successfully',
            'bed_id': bed_id
        }), 201
    
    except Exception as e:
        print(f"Bed creation error: {e}")
        return jsonify({'error': 'Failed to create bed'}), 500


@app.route('/api/admin/icu-beds/<int:bed_id>/status', methods=['PUT'])
@admin_required
def update_bed_status_endpoint(bed_id):
    """Update ICU bed status"""
    try:
        from database import update_bed_status
        
        data = request.get_json()
        status = data.get('status')
        
        if status not in ['available', 'occupied', 'maintenance', 'cleaning']:
            return jsonify({'error': 'Invalid status'}), 400
        
        success = update_bed_status(bed_id, status)
        
        if success:
            return jsonify({'message': 'Bed status updated'}), 200
        else:
            return jsonify({'error': 'Bed not found'}), 404
    
    except Exception as e:
        print(f"Bed status update error: {e}")
        return jsonify({'error': 'Failed to update bed status'}), 500


@app.route('/api/admin/allocate-bed', methods=['POST'])
@admin_required
def allocate_bed_endpoint():
    """Manually allocate a bed to a patient"""
    try:
        from database import allocate_bed
        
        data = request.get_json()
        patient_id = data.get('patient_id')
        bed_id = data.get('bed_id')
        
        if not patient_id or not bed_id:
            return jsonify({'error': 'Patient ID and Bed ID required'}), 400
        
        allocation_id = allocate_bed(
            patient_id, 
            bed_id, 
            allocated_by=session.get('admin_id'),
            allocation_type='manual'
        )
        
        if allocation_id:
            return jsonify({
                'message': 'Bed allocated successfully',
                'allocation_id': allocation_id
            }), 200
        else:
            return jsonify({'error': 'Bed not available'}), 400
    
    except Exception as e:
        print(f"Bed allocation error: {e}")
        return jsonify({'error': 'Failed to allocate bed'}), 500


@app.route('/api/admin/discharge-bed/<int:allocation_id>', methods=['POST'])
@admin_required
def discharge_bed_endpoint(allocation_id):
    """Discharge a patient from ICU"""
    try:
        from database import discharge_from_icu
        
        data = request.get_json()
        discharge_reason = data.get('discharge_reason', '')
        
        success = discharge_from_icu(allocation_id, discharge_reason)
        
        if success:
            return jsonify({'message': 'Patient discharged successfully'}), 200
        else:
            return jsonify({'error': 'Allocation not found'}), 404
    
    except Exception as e:
        print(f"Discharge error: {e}")
        return jsonify({'error': 'Failed to discharge patient'}), 500


@app.route('/api/admin/icu-waitlist', methods=['GET'])
@admin_required
def get_waitlist_endpoint():
    """Get ICU waitlist"""
    try:
        from database import get_icu_waitlist
        
        waitlist = get_icu_waitlist()
        
        return jsonify({'waitlist': waitlist}), 200
    
    except Exception as e:
        print(f"Waitlist error: {e}")
        return jsonify({'error': 'Failed to fetch waitlist'}), 500


@app.route('/api/admin/icu-forecast', methods=['GET'])
@admin_required
def get_forecast_endpoint():
    """Get ICU demand forecast"""
    try:
        from database import get_icu_forecast, get_expected_discharges_today
        
        days = request.args.get('days', 7, type=int)
        
        forecast = get_icu_forecast(days)
        discharges_today = get_expected_discharges_today()
        
        return jsonify({
            'forecast': forecast,
            'expected_discharges_today': discharges_today
        }), 200
    
    except Exception as e:
        print(f"Forecast error: {e}")
        return jsonify({'error': 'Failed to generate forecast'}), 500


@app.route('/api/admin/icu-analytics', methods=['GET'])
@admin_required
def get_analytics_endpoint():
    """Get ICU analytics"""
    try:
        from database import get_icu_analytics
        
        days = request.args.get('days', 30, type=int)
        
        analytics = get_icu_analytics(days)
        
        return jsonify({'analytics': analytics}), 200
    
    except Exception as e:
        print(f"Analytics error: {e}")
        return jsonify({'error': 'Failed to fetch analytics'}), 500


@app.route('/api/admin/icu-recommendations', methods=['GET'])
@admin_required
def get_icu_recommendations():
    """Get smart recommendations for ICU capacity management"""
    try:
        from database import (
            get_icu_status, get_icu_waitlist, get_all_patients,
            get_bed_allocations, get_icu_forecast
        )
        
        # Get current ICU status
        status = get_icu_status()
        capacity = status.get('capacity', {})
        utilization = capacity.get('utilization_rate', 0)
        
        recommendations = {
            'postpone_elective': [],
            'expedite_discharge': [],
            'transfer_candidates': []
        }
        
        # Only generate recommendations if capacity is tight (> 80%)
        if utilization > 80:
            # Get all patients with upcoming surgeries
            patients = get_all_patients()
            
            # Suggest postponing LOW/MODERATE risk elective cases
            for patient in patients:
                if patient.get('surgery_date'):
                    surgery_date = datetime.fromisoformat(patient['surgery_date'].replace('Z', '+00:00'))
                    days_until = (surgery_date.date() - datetime.now().date()).days
                    
                    # Only consider surgeries in next 7 days
                    if 0 <= days_until <= 7:
                        risk_level = patient.get('risk_category', 'MODERATE')
                        icu_prob = patient.get('icu_probability', 0)
                        
                        # Suggest postponing low-moderate risk with low ICU probability
                        if risk_level in ['LOW', 'MODERATE'] and icu_prob < 30:
                            recommendations['postpone_elective'].append({
                                'patient_id': patient['patient_id'],
                                'patient_name': patient['name'],
                                'surgery_type': patient.get('surgery_type', 'General Surgery'),
                                'surgery_date': patient['surgery_date'],
                                'risk_level': risk_level,
                                'icu_probability': icu_prob,
                                'reason': 'Low ICU risk, can be safely rescheduled'
                            })
            
            # Suggest expediting discharges for patients who can move to step-down
            allocations = get_bed_allocations()
            for allocation in allocations:
                if allocation.get('status') == 'active':
                    # Check stay duration
                    admission_time = datetime.fromisoformat(allocation['allocation_time'].replace('Z', '+00:00'))
                    stay_days = (datetime.now() - admission_time).days
                    
                    # Patients who have been 3+ days and are moderate risk can potentially step down
                    if stay_days >= 3:
                        recommendations['expedite_discharge'].append({
                            'patient_id': allocation['patient_id'],
                            'patient_name': allocation.get('patient_name', 'Unknown'),
                            'bed_id': allocation['bed_id'],
                            'room_number': allocation.get('room_number', 'N/A'),
                            'current_stay_days': stay_days,
                            'reason': 'Extended stay, candidate for step-down care'
                        })
        
        return jsonify({'recommendations': recommendations}), 200
    
    except Exception as e:
        print(f"Recommendations error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to generate recommendations'}), 500


@app.route('/api/admin/all-patients', methods=['GET'])
@admin_required
def get_all_patients_endpoint():
    """Get all patients for ICU overview"""
    try:
        patients = get_all_patients()
        return jsonify({'patients': patients}), 200
    except Exception as e:
        print(f"All patients error: {e}")
        return jsonify({'error': 'Failed to fetch all patients'}), 500


# ============================================================================
# ICU BED MANAGEMENT - HELPER FUNCTIONS
# ============================================================================

def _get_time_ago(timestamp):
    """Convert timestamp to human-readable 'time ago' string"""
    now = datetime.now()
    diff = now - timestamp
    
    seconds = diff.total_seconds()
    
    if seconds < 60:
        return f"{int(seconds)} seconds ago"
    elif seconds < 3600:
        return f"{int(seconds / 60)} minutes ago"
    elif seconds < 86400:
        return f"{int(seconds / 3600)} hours ago"
    else:
        return f"{int(seconds / 86400)} days ago"


# ============================================================================
# ICU BED MANAGEMENT - CORE WORKFLOW ENDPOINTS
# ============================================================================

@app.route('/api/risk/icu-enqueue', methods=['POST'])
@login_required
def enqueue_patient_for_icu():
    """
    Enqueue patient for ICU after risk assessment shows HIGH/CRITICAL risk
    Called automatically after AI model generates predictions
    """
    try:
        from database import add_to_icu_waitlist, get_icu_prediction
        
        data = request.get_json()
        patient_id = data.get('patient_id')
        
        if not patient_id:
            return jsonify({'error': 'Patient ID required'}), 400
        
        # Get the latest ICU prediction
        prediction = get_icu_prediction(patient_id)
        
        if not prediction:
            return jsonify({'error': 'No ICU prediction found for patient'}), 404
        
        # Check if ICU is actually needed
        if not prediction.get('icu_needed'):
            return jsonify({
                'status': 'not_needed',
                'message': 'ICU not required for this patient'
            }), 200
        
        # Add to waitlist
        waitlist_id = add_to_icu_waitlist(
            patient_id=patient_id,
            prediction_id=prediction['prediction_id'],
            priority=prediction.get('priority_score', 50)
        )
        
        return jsonify({
            'status': 'enqueued',
            'message': 'Patient added to ICU queue',
            'waitlist_id': waitlist_id,
            'priority_score': prediction.get('priority_score'),
            'risk_level': prediction.get('risk_level')
        }), 201
    
    except Exception as e:
        print(f"ICU enqueue error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to enqueue patient'}), 500


@app.route('/api/icu/status', methods=['GET'])
@login_required
def get_icu_status_endpoint():
    """Get real-time ICU bed occupancy status"""
    try:
        from database import get_icu_status
        
        status = get_icu_status()
        
        return jsonify(status), 200
    
    except Exception as e:
        print(f"ICU status error: {e}")
        return jsonify({'error': 'Failed to fetch ICU status'}), 500


@app.route('/api/icu/queue', methods=['GET'])
@login_required
def get_icu_queue_endpoint():
    """Get current ICU queue (waiting patients sorted by priority)"""
    try:
        from database import get_icu_waitlist
        
        queue = get_icu_waitlist()
        
        # Calculate wait time for each patient
        for patient in queue:
            if patient.get('added_at'):
                added_time = datetime.fromisoformat(patient['added_at'].replace('Z', '+00:00'))
                wait_hours = (datetime.now() - added_time).total_seconds() / 3600
                patient['wait_hours'] = round(wait_hours, 1)
        
        return jsonify({
            'queue': queue,
            'total_waiting': len(queue)
        }), 200
    
    except Exception as e:
        print(f"ICU queue error: {e}")
        return jsonify({'error': 'Failed to fetch ICU queue'}), 500


@app.route('/api/icu/logs', methods=['GET'])
@login_required
def get_icu_allocation_logs():
    """Get recent ICU bed allocation events (audit trail)"""
    try:
        from database import get_bed_allocations
        
        limit = request.args.get('limit', 50, type=int)
        
        allocations = get_bed_allocations()
        
        # Limit results
        allocations = allocations[:limit] if allocations else []
        
        # Add human-readable timestamps
        for allocation in allocations:
            if allocation.get('allocated_at'):
                allocated_time = datetime.fromisoformat(allocation['allocated_at'].replace('Z', '+00:00'))
                allocation['time_ago'] = _get_time_ago(allocated_time)
        
        return jsonify({
            'logs': allocations,
            'total': len(allocations)
        }), 200
    
    except Exception as e:
        print(f"ICU logs error: {e}")
        return jsonify({'error': 'Failed to fetch allocation logs'}), 500


@app.route('/api/icu/assign', methods=['POST'])
@admin_required
def manual_bed_assignment():
    """Manually assign ICU bed to a patient (admin override)"""
    try:
        from database import allocate_bed, get_available_icu_beds
        
        data = request.get_json()
        patient_id = data.get('patient_id')
        bed_id = data.get('bed_id')
        
        if not patient_id or not bed_id:
            return jsonify({'error': 'Patient ID and Bed ID required'}), 400
        
        # Allocate the bed
        allocation_id = allocate_bed(
            patient_id=patient_id,
            bed_id=bed_id,
            allocated_by=session.get('email', 'admin'),
            allocation_type='manual'
        )
        
        if not allocation_id:
            return jsonify({'error': 'Bed not available or allocation failed'}), 400
        
        return jsonify({
            'status': 'allocated',
            'message': 'Bed assigned successfully',
            'allocation_id': allocation_id
        }), 200
    
    except Exception as e:
        print(f"Manual assignment error: {e}")
        return jsonify({'error': 'Failed to assign bed'}), 500


@app.route('/api/icu/release/<int:bed_id>', methods=['PUT'])
@admin_required
def release_bed_endpoint(bed_id):
    """Release/discharge patient from ICU bed"""
    try:
        from database import discharge_from_icu, get_bed_allocations
        
        data = request.get_json()
        discharge_reason = data.get('discharge_reason', 'Discharged')
        
        # Find active allocation for this bed
        allocations = get_bed_allocations()
        active_allocation = None
        
        for allocation in allocations:
            if allocation.get('bed_id') == bed_id and not allocation.get('actual_discharge'):
                active_allocation = allocation
                break
        
        if not active_allocation:
            return jsonify({'error': 'No active allocation found for this bed'}), 404
        
        # Discharge patient
        success = discharge_from_icu(
            allocation_id=active_allocation['allocation_id'],
            discharge_reason=discharge_reason
        )
        
        if not success:
            return jsonify({'error': 'Failed to discharge patient'}), 500
        
        return jsonify({
            'status': 'released',
            'message': 'Patient discharged, bed now cleaning'
        }), 200
    
    except Exception as e:
        print(f"Release bed error: {e}")
        return jsonify({'error': 'Failed to release bed'}), 500


@app.route('/api/icu/auto-assign', methods=['POST'])
@login_required
def auto_assign_beds():
    """
    Background job/API to automatically assign available beds to highest-priority patients in queue
    Can be called manually or run as a scheduled task
    """
    try:
        from database import (
            get_available_icu_beds, get_icu_waitlist, allocate_bed,
            get_icu_prediction
        )
        
        assigned = []
        
        # Get available beds and waiting patients
        available_beds = get_available_icu_beds()
        waitlist = get_icu_waitlist()  # Already sorted by priority
        
        if not available_beds or not waitlist:
            return jsonify({
                'status': 'no_action',
                'message': 'No beds available or no patients waiting',
                'assigned': []
            }), 200
        
        # Match patients to beds
        for patient in waitlist:
            if not available_beds:
                break  # No more beds available
            
            patient_id = patient['patient_id']
            
            # Get patient's requirements
            prediction = get_icu_prediction(patient_id)
            
            # Find best matching bed
            best_bed = _select_best_bed(available_beds, prediction)
            
            # Allocate the bed
            allocation_id = allocate_bed(
                patient_id=patient_id,
                bed_id=best_bed['bed_id'],
                allocated_by='system',
                allocation_type='automatic'
            )
            
            if allocation_id:
                assigned.append({
                    'patient_id': patient_id,
                    'patient_name': patient.get('patient_name'),
                    'bed_id': best_bed['bed_id'],
                    'room_number': best_bed.get('room_number'),
                    'allocation_id': allocation_id
                })
                
                # Remove assigned bed from available list
                available_beds = [b for b in available_beds if b['bed_id'] != best_bed['bed_id']]
        
        return jsonify({
            'status': 'completed',
            'message': f'{len(assigned)} bed(s) assigned automatically',
            'assigned': assigned
        }), 200
    
    except Exception as e:
        print(f"Auto-assign error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to auto-assign beds'}), 500


@app.route('/api/icu/auto-allocate', methods=['POST'])
@login_required
def auto_allocate_bed():
    """Automatically allocate best-matching ICU bed for a patient"""
    try:
        from database import (
            get_available_icu_beds, allocate_bed, 
            get_icu_prediction, add_to_icu_waitlist
        )
        
        data = request.get_json()
        patient_id = data.get('patient_id')
        
        if not patient_id:
            return jsonify({'error': 'Patient ID required'}), 400
        
        # Get ICU prediction for patient
        prediction = get_icu_prediction(patient_id)
        
        if not prediction or not prediction.get('icu_needed'):
            return jsonify({'error': 'ICU not recommended for this patient'}), 400
        
        # Get equipment requirements
        filters = {
            'has_ventilator': prediction.get('ventilator_needed'),
            'has_dialysis': prediction.get('dialysis_needed')
        }
        
        # Get available beds matching requirements
        available_beds = get_available_icu_beds(filters)
        
        if not available_beds:
            # No beds available - add to waitlist
            waitlist_id = add_to_icu_waitlist(
                patient_id,
                prediction['prediction_id'],
                prediction.get('priority_score', 50)
            )
            
            return jsonify({
                'status': 'waitlisted',
                'message': 'No beds available. Patient added to waitlist',
                'waitlist_id': waitlist_id,
                'priority_score': prediction.get('priority_score')
            }), 200
        
        # Smart allocation: choose best bed
        best_bed = _select_best_bed(available_beds, prediction)
        
        # Allocate the bed
        allocation_id = allocate_bed(
            patient_id,
            best_bed['bed_id'],
            allocated_by='system',
            allocation_type='automatic'
        )
        
        return jsonify({
            'status': 'allocated',
            'message': 'ICU bed allocated successfully',
            'allocation_id': allocation_id,
            'bed': best_bed
        }), 200
    
    except Exception as e:
        print(f"Auto allocation error: {e}")
        return jsonify({'error': 'Failed to allocate bed'}), 500


def _select_best_bed(available_beds, prediction):
    """Select the best bed based on patient needs and bed features"""
    risk_level = prediction.get('risk_level', 'MODERATE')
    
    # Score each bed
    bed_scores = []
    for bed in available_beds:
        score = 0
        
        # Proximity to nursing station (higher priority for critical patients)
        if risk_level in ['CRITICAL', 'HIGH']:
            # Closer is better for critical patients (lower proximity value)
            score += (10 - bed.get('proximity_to_nursing_station', 5)) * 10
        else:
            # Farther is acceptable for stable patients (save close beds)
            score += bed.get('proximity_to_nursing_station', 5) * 5
        
        # Equipment match (perfect match gets bonus)
        if prediction.get('ventilator_needed') and bed.get('has_ventilator'):
            score += 30
        if prediction.get('dialysis_needed') and bed.get('has_dialysis'):
            score += 30
        
        # Cost optimization (prefer lower cost for moderate risk)
        if risk_level == 'MODERATE':
            # Prefer cheaper beds for moderate risk
            max_cost = 5000
            score += (max_cost - bed.get('bed_cost_per_day', 2500)) / 100
        
        bed_scores.append({'bed': bed, 'score': score})
    
    # Sort by score (highest first)
    bed_scores.sort(key=lambda x: x['score'], reverse=True)
    
    return bed_scores[0]['bed'] if bed_scores else available_beds[0]


# ============================================================================
# MAIN
# ============================================================================@app.route('/api/nearby-centers', methods=['GET'])
def get_nearby_centers():
    """Get nearby rehabilitation and physiotherapy centers near PES University, Banshankari, Bengaluru"""
    # Mock data - in production, this would query a database or external API
    centers = [
        {
            'id': 1,
            'name': 'Banashankari Rehabilitation Center',
            'type': 'rehab',
            'address': 'Near BSNL Office, 17th Main, Banashankari 2nd Stage, Bengaluru 560070',
            'phone': '+91 80 2661 2345',
            'distance': 0.8,
            'rating': 4.8,
            'reviews': 245,
            'hours': 'Mon-Fri: 7AM-7PM, Sat: 8AM-4PM',
            'services': ['Physical Therapy', 'Occupational Therapy', 'Speech Therapy'],
            'lat': 12.9280,
            'lng': 77.5985,
            'image': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=300&fit=crop'
        },
        {
            'id': 2,
            'name': 'PES Physiotherapy & Sports Clinic',
            'type': 'physio',
            'address': '100 Feet Ring Road, Near PES University, Banashankari, Bengaluru 560085',
            'phone': '+91 80 2679 8888',
            'distance': 0.5,
            'rating': 4.9,
            'reviews': 312,
            'hours': 'Mon-Sat: 8AM-8PM, Sun: 9AM-2PM',
            'services': ['Sports Rehabilitation', 'Manual Therapy', 'Dry Needling', 'Athletic Training'],
            'lat': 12.9350,
            'lng': 77.6050,
            'image': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop'
        },
        {
            'id': 3,
            'name': 'South Bangalore Recovery & Wellness',
            'type': 'rehab',
            'address': 'Kanakapura Road, Uttarahalli, Bengaluru 560061',
            'phone': '+91 80 2326 7890',
            'distance': 2.1,
            'rating': 4.7,
            'reviews': 189,
            'hours': 'Mon-Fri: 6AM-9PM, Sat-Sun: 8AM-6PM',
            'services': ['Post-Surgery Rehab', 'Pain Management', 'Aquatic Therapy', 'Neurological Rehab'],
            'lat': 12.9180,
            'lng': 77.5890,
            'image': 'https://images.unsplash.com/photo-1519494140681-8b17d830a3e9?w=400&h=300&fit=crop'
        },
        {
            'id': 4,
            'name': 'Padmanabhanagar Physiotherapy Center',
            'type': 'physio',
            'address': 'Mysore Road, Padmanabhanagar, Bengaluru 560070',
            'phone': '+91 80 2669 4455',
            'distance': 1.3,
            'rating': 4.6,
            'reviews': 156,
            'hours': 'Mon-Fri: 7AM-8PM, Sat: 8AM-5PM',
            'services': ['Orthopedic PT', 'Geriatric Therapy', 'Balance Training', 'Home Visits'],
            'lat': 12.9220,
            'lng': 77.5920,
            'image': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop'
        },
        {
            'id': 5,
            'name': 'JP Nagar Sports Rehabilitation',
            'type': 'rehab',
            'address': '24th Main Road, JP Nagar 5th Phase, Bengaluru 560078',
            'phone': '+91 80 2659 3366',
            'distance': 3.2,
            'rating': 4.9,
            'reviews': 401,
            'hours': 'Mon-Sun: 6AM-10PM',
            'services': ['Sports Medicine', 'Athletic Training', 'Injury Prevention', 'Performance Enhancement'],
            'lat': 12.9070,
            'lng': 77.5870,
            'image': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'
        },
        {
            'id': 6,
            'name': 'Jayanagar Healing Hands Physiotherapy',
            'type': 'physio',
            'address': '9th Block, Jayanagar, Near Madhavan Park, Bengaluru 560069',
            'phone': '+91 80 2663 7788',
            'distance': 2.5,
            'rating': 4.8,
            'reviews': 278,
            'hours': 'Mon-Sat: 7AM-7PM',
            'services': ['Neurological PT', 'Pediatric Therapy', 'Women\'s Health', 'Geriatric Care'],
            'lat': 12.9250,
            'lng': 77.5950,
            'image': 'https://images.unsplash.com/photo-1578496479914-7ef3b0193be3?w=400&h=300&fit=crop'
        }
    ]
    
    return jsonify({'centers': centers}), 200


if __name__ == '__main__':
    print("\n🏥 Surgical Risk Prediction System - Backend Server")
    print("=" * 60)
    print("Server running on: http://localhost:5000")
    print("API endpoints available at: http://localhost:5000/api/")
    print("=" * 60)
    print("\n✅ Ready to accept connections\n")
    
    app.run(debug=False, host='0.0.0.0', port=5000)
