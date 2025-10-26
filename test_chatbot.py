"""
Test script to verify the chatbot is working with Gemini AI
"""

import sys
from chatbot import get_chatbot

def test_chatbot():
    print("🤖 Testing RecovAI Chatbot with Gemini AI")
    print("=" * 60)
    
    # Initialize chatbot
    try:
        bot = get_chatbot()
        print("✅ Chatbot initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize chatbot: {e}")
        return False
    
    # Test patient data
    patient_data = {
        'patient_name': 'John Doe',
        'age': 55,
        'surgery_type': 'Knee Replacement',
        'asa_class': 2,
        'days_post_op': 3,
        'diabetes': 0,
        'heart_disease': 0,
        'hypertension': 1
    }
    
    # Test questions
    test_questions = [
        "Is this pain level normal after surgery?",
        "When can I start walking?",
        "What foods should I eat for recovery?",
        "I have a fever of 102°F, what should I do?"
    ]
    
    print(f"\n👤 Patient: {patient_data['patient_name']}")
    print(f"📋 Surgery: {patient_data['surgery_type']}")
    print(f"📅 Days post-op: {patient_data['days_post_op']}")
    print("\n" + "=" * 60 + "\n")
    
    # Test each question
    for i, question in enumerate(test_questions, 1):
        print(f"Question {i}: {question}")
        print("-" * 60)
        
        try:
            result = bot.process_message(question, patient_data)
            
            print(f"🤖 Response: {result['response']}")
            
            if result['needs_doctor_alert']:
                print(f"⚠️  ALERT: Doctor notification required")
                print(f"   Red flags detected: {', '.join(result['red_flags'])}")
            
            if result['recommended_actions']:
                print(f"📋 Recommended actions:")
                for action in result['recommended_actions']:
                    if isinstance(action, dict):
                        print(f"   - {action.get('title', action.get('type', 'Action'))}")
                    else:
                        print(f"   - {action}")
            
            print("\n")
            
        except Exception as e:
            print(f"❌ Error: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    print("=" * 60)
    print("✅ All chatbot tests passed successfully!")
    return True

if __name__ == '__main__':
    success = test_chatbot()
    sys.exit(0 if success else 1)
