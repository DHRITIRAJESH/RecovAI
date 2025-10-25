"""
AI-Powered 24/7 Recovery Chatbot
Provides personalized post-operative care guidance using ML models and conversational AI
"""

import os
import re
import pickle
import numpy as np
from datetime import datetime
import google.generativeai as genai

# Configure Gemini API (you'll need to set your API key)
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'YOUR_API_KEY_HERE')
genai.configure(api_key=GEMINI_API_KEY)

class RecoveryChatbot:
    def __init__(self, models_dir='..'):
        self.models_dir = models_dir
        self.recovery_model = None
        self.scaler = None
        self._load_models()
        
        # Initialize Gemini model
        self.gemini_model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Red flag symptoms that require immediate medical attention
        self.red_flags = {
            'fever': ['fever', 'temperature', '101', '102', '103', 'hot', 'chills'],
            'bleeding': ['bleeding', 'blood', 'hemorrhage', 'oozing'],
            'severe_pain': ['severe pain', 'unbearable', 'excruciating', '10/10', 'worst pain'],
            'breathing': ['can\'t breathe', 'shortness of breath', 'difficulty breathing', 'gasping'],
            'chest_pain': ['chest pain', 'heart pain', 'pressure in chest'],
            'confusion': ['confused', 'disoriented', 'dizzy', 'lightheaded', 'passing out'],
            'infection': ['pus', 'discharge', 'red streak', 'swelling', 'infected']
        }
        
        # Recovery milestones by surgery type
        self.recovery_guidelines = {
            'cardiac': {
                'walking': 'Start walking on day 1, gradually increase to 20-30 minutes by week 2',
                'exercise': 'Cardiac rehab starting week 2-3, avoid heavy lifting for 6-8 weeks',
                'return_work': '6-12 weeks depending on job type',
                'diet': 'Heart-healthy diet: low sodium, lean proteins, plenty of vegetables'
            },
            'orthopedic': {
                'walking': 'Weight-bearing as tolerated with assistive device from day 1',
                'exercise': 'Physical therapy starting day 1-2, ROM exercises hourly',
                'return_work': '6-12 weeks for desk work, 3-6 months for physical jobs',
                'diet': 'High protein, calcium, vitamin D for bone healing'
            },
            'abdominal': {
                'walking': 'Walk within 24 hours, increase gradually',
                'exercise': 'Avoid heavy lifting 4-6 weeks, gentle core exercises after 2 weeks',
                'return_work': '2-4 weeks for light work, 6-8 weeks for physical work',
                'diet': 'Start clear liquids, advance as tolerated, high fiber to prevent constipation'
            },
            'general': {
                'walking': 'Start walking as soon as cleared by medical team',
                'exercise': 'Gentle movement, avoid straining surgical site',
                'return_work': '2-6 weeks depending on surgery complexity',
                'diet': 'Balanced nutrition, adequate protein for healing'
            }
        }
        
    def _load_models(self):
        """Load recovery model and scaler"""
        try:
            # Try to load recovery model if available
            recovery_model_path = os.path.join(self.models_dir, 'recovery_model.pkl')
            if os.path.exists(recovery_model_path):
                with open(recovery_model_path, 'rb') as f:
                    self.recovery_model = pickle.load(f)
                print("✅ Loaded recovery model")
            else:
                print("⚠️ Recovery model not found - using rule-based guidance only")
            
            # Load scaler
            scaler_path = os.path.join(self.models_dir, 'scaler.pkl')
            if os.path.exists(scaler_path):
                with open(scaler_path, 'rb') as f:
                    self.scaler = pickle.load(f)
                print("✅ Loaded scaler for chatbot")
            else:
                print("⚠️ Scaler not found")
                
        except Exception as e:
            print(f"⚠️ Warning: Chatbot model loading failed: {e}")
    
    def detect_red_flags(self, message):
        """Detect concerning symptoms that need immediate attention"""
        message_lower = message.lower()
        detected_flags = []
        
        for flag_type, keywords in self.red_flags.items():
            for keyword in keywords:
                if keyword in message_lower:
                    detected_flags.append(flag_type)
                    break
        
        return list(set(detected_flags))  # Remove duplicates
    
    def get_surgery_category(self, surgery_type):
        """Categorize surgery type for personalized guidance"""
        surgery_lower = surgery_type.lower()
        
        if any(term in surgery_lower for term in ['cardiac', 'heart', 'bypass', 'valve']):
            return 'cardiac'
        elif any(term in surgery_lower for term in ['hip', 'knee', 'joint', 'orthopedic', 'fracture']):
            return 'orthopedic'
        elif any(term in surgery_lower for term in ['abdominal', 'appendectomy', 'cholecystectomy', 'hernia', 'colon']):
            return 'abdominal'
        else:
            return 'general'
    
    def get_recovery_timeline(self, patient_data):
        """Get personalized recovery timeline based on patient profile"""
        surgery_category = self.get_surgery_category(patient_data.get('surgery_type', 'general'))
        age = patient_data.get('age', 50)
        asa_class = patient_data.get('asa_class', 2)
        
        # Adjust timeline based on patient factors
        base_timeline = {
            'day_1': 'Walking, deep breathing exercises',
            'day_2_3': 'Increased mobility, pain management',
            'week_1': 'Wound care, activity progression',
            'week_2_4': 'Gradual return to daily activities',
            'week_4_6': 'Light exercise, possible return to work'
        }
        
        # Add age/ASA adjustments
        if age > 70 or asa_class >= 3:
            adjustment = " (May take longer due to age/health factors)"
        else:
            adjustment = ""
        
        return {k: v + adjustment for k, v in base_timeline.items()}
    
    def generate_contextual_response(self, message, patient_data, chat_history):
        """Generate AI response using Gemini with patient context"""
        
        # Build context for Gemini
        surgery_type = patient_data.get('surgery_type', 'surgery')
        surgery_category = self.get_surgery_category(surgery_type)
        patient_name = patient_data.get('patient_name', 'there')
        age = patient_data.get('age', 'N/A')
        days_post_op = patient_data.get('days_post_op', 0)
        
        # Get relevant recovery guidelines
        guidelines = self.recovery_guidelines.get(surgery_category, self.recovery_guidelines['general'])
        
        # Create system prompt
        system_context = f"""You are a compassionate 24/7 AI Recovery Assistant for post-operative care.

PATIENT CONTEXT:
- Name: {patient_name}
- Age: {age}
- Surgery: {surgery_type}
- Days post-op: {days_post_op}
- Surgery category: {surgery_category}

RECOVERY GUIDELINES FOR THIS SURGERY:
- Walking: {guidelines['walking']}
- Exercise: {guidelines['exercise']}
- Return to work: {guidelines['return_work']}
- Diet: {guidelines['diet']}

YOUR ROLE:
1. Provide empathetic, clear, evidence-based recovery guidance
2. Answer questions about: pain management, wound care, activity levels, diet, medications
3. Reassure for normal symptoms, alert for concerning ones
4. Keep responses concise (2-3 sentences max)
5. Use simple language, avoid medical jargon
6. Always prioritize patient safety

IMPORTANT:
- If patient reports red flag symptoms (high fever >101.5°F, severe pain, heavy bleeding, difficulty breathing, chest pain), immediately recommend medical attention
- Never diagnose or replace medical care - always defer to their surgical team for serious concerns
- Be warm and encouraging about recovery progress

Now respond to the patient's question:"""

        try:
            # Generate response using Gemini
            chat = self.gemini_model.start_chat(history=[])
            full_prompt = f"{system_context}\n\nPatient: {message}\n\nAssistant:"
            
            response = chat.send_message(full_prompt)
            return response.text.strip()
            
        except Exception as e:
            print(f"Gemini API error: {e}")
            # Fallback to rule-based response
            return self._fallback_response(message, surgery_category, guidelines)
    
    def _fallback_response(self, message, surgery_category, guidelines):
        """Rule-based fallback when Gemini API is unavailable"""
        message_lower = message.lower()
        
        # Pattern matching for common questions
        if any(word in message_lower for word in ['walk', 'walking', 'move', 'mobility']):
            return f"For your surgery, you should: {guidelines['walking']}. Start slowly and listen to your body."
        
        elif any(word in message_lower for word in ['exercise', 'activity', 'workout']):
            return f"Exercise guidance: {guidelines['exercise']}. Always consult your surgeon before starting new activities."
        
        elif any(word in message_lower for word in ['work', 'job', 'return']):
            return f"Return to work timeline: {guidelines['return_work']}. Discuss with your doctor based on your recovery progress."
        
        elif any(word in message_lower for word in ['eat', 'diet', 'food', 'nutrition']):
            return f"Dietary recommendations: {guidelines['diet']}. Stay hydrated and avoid alcohol during recovery."
        
        elif any(word in message_lower for word in ['pain', 'hurt', 'sore']):
            return "Mild to moderate pain is normal in the first 1-2 weeks. Take prescribed pain medication as directed. If pain is severe, worsening, or not controlled by medication, contact your doctor."
        
        elif any(word in message_lower for word in ['wound', 'incision', 'scar']):
            return "Keep your incision clean and dry. Watch for signs of infection: redness, warmth, swelling, discharge. Follow your surgeon's wound care instructions carefully."
        
        else:
            return "I'm here to help with your recovery! You can ask me about: walking/exercise, pain management, wound care, diet, or when to return to normal activities. What would you like to know?"
    
    def process_message(self, message, patient_data, chat_history=None):
        """Main method to process patient message and generate response"""
        
        # Detect red flags
        red_flags = self.detect_red_flags(message)
        needs_doctor_alert = len(red_flags) > 0
        
        # Generate AI response
        ai_response = self.generate_contextual_response(message, patient_data, chat_history or [])
        
        # Add warning if red flags detected
        if needs_doctor_alert:
            alert_message = "\n\n⚠️ ALERT: Your symptoms may need medical attention. I've notified your surgical team. "
            
            if 'fever' in red_flags:
                alert_message += "Seek emergency care if fever exceeds 103°F or persists. "
            if 'breathing' in red_flags or 'chest_pain' in red_flags:
                alert_message += "If symptoms worsen, call 911 immediately. "
            
            ai_response = ai_response + alert_message
        
        # Prepare recommended actions
        recommended_actions = []
        if needs_doctor_alert:
            recommended_actions.append({
                'type': 'alert_doctor',
                'severity': 'high' if any(f in red_flags for f in ['breathing', 'chest_pain', 'severe_pain']) else 'medium',
                'flags': red_flags
            })
        
        # Add helpful resources
        if any(word in message.lower() for word in ['exercise', 'walk']):
            recommended_actions.append({
                'type': 'resource',
                'title': 'View Exercise Guidelines',
                'link': '/patient/lifestyle?tab=exercise'
            })
        elif any(word in message.lower() for word in ['diet', 'eat', 'food']):
            recommended_actions.append({
                'type': 'resource',
                'title': 'View Diet Plan',
                'link': '/patient/lifestyle?tab=diet'
            })
        
        return {
            'response': ai_response,
            'recommended_actions': recommended_actions,
            'needs_doctor_alert': needs_doctor_alert,
            'red_flags': red_flags,
            'timestamp': datetime.now().isoformat()
        }

# Initialize chatbot instance
chatbot = None

def get_chatbot():
    """Get or create chatbot instance"""
    global chatbot
    if chatbot is None:
        chatbot = RecoveryChatbot(models_dir='..')
    return chatbot
