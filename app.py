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
    save_risk_assessment, get_latest_risk_assessment,
    save_lifestyle_plan, get_lifestyle_plan, get_doctor_info
)
from ml_predictor import SurgicalRiskPredictor
from clinical_recs import ClinicalRecommendations

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

# Enable CORS - allow both port 3000 and 3001
CORS(app, supports_credentials=True, origins=['http://localhost:3000', 'http://localhost:3001'])

# Initialize ML predictor (load models once at startup)
try:
    predictor = SurgicalRiskPredictor(models_dir='..')
    print("✅ ML Predictor initialized successfully")
except Exception as e:
    print(f"⚠️ Warning: ML Predictor initialization failed: {e}")
    predictor = None

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
    """Get all patients assigned to the logged-in doctor"""
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
        # Check if predictor is available
        if predictor is None:
            return jsonify({'error': 'ML predictor not available'}), 503
        
        # Get patient data
        patient = get_patient_by_id(patient_id)
        
        if not patient:
            return jsonify({'error': 'Patient not found'}), 404
        
        # Verify access
        if patient['assigned_doctor_id'] != session['user_id']:
            return jsonify({'error': 'Access denied'}), 403
        
        # Generate predictions
        prediction = predictor.predict(patient)
        
        # Generate clinical recommendations
        recommendations = ClinicalRecommendations.generate_recommendations(prediction)
        
        # Save assessment to database
        assessment_id = save_risk_assessment(
            patient_id=patient_id,
            overall_risk=prediction['overall_risk'],
            risks=prediction['risks'],
            recommendations=json.dumps(recommendations),
            contributing_factors=json.dumps(prediction['contributing_factors'])
        )
        
        return jsonify({
            'assessment_id': assessment_id,
            'overall_risk': prediction['overall_risk'],
            'risks': prediction['risks'],
            'risk_categories': prediction['risk_categories'],
            'contributing_factors': prediction['contributing_factors'],
            'recommendations': recommendations
        }), 200
        
    except Exception as e:
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
# MAIN
# ============================================================================

if __name__ == '__main__':
    print("\n🏥 Surgical Risk Prediction System - Backend Server")
    print("=" * 60)
    print("Server running on: http://localhost:5000")
    print("API endpoints available at: http://localhost:5000/api/")
    print("=" * 60)
    print("\n✅ Ready to accept connections\n")
    
    app.run(debug=False, host='0.0.0.0', port=5000)
