"""
Simple standalone test for Gemini AI Chatbot
No database or complex dependencies required
"""

import google.generativeai as genai

# Configure Gemini API
GEMINI_API_KEY = 'AIzaSyAaJcKBydblvrS0jZNMVaN8LTYU0pHvOUw'
genai.configure(api_key=GEMINI_API_KEY)

def test_gemini_connection():
    """Test basic Gemini API connection"""
    print("🤖 Testing Gemini AI Connection")
    print("=" * 60)
    
    try:
        # Initialize Gemini model - using gemini-pro which is available
        model = genai.GenerativeModel('gemini-pro')
        print("✅ Gemini model initialized successfully")
        
        # Test prompt
        test_prompt = """You are a compassionate medical recovery assistant. 
        A patient asks: "I had knee surgery 3 days ago. Is it normal to have some swelling?"
        
        Provide a brief, reassuring response (2-3 sentences)."""
        
        print("\n📤 Sending test message...")
        response = model.generate_content(test_prompt)
        
        print("✅ Response received from Gemini AI\n")
        print("-" * 60)
        print("🤖 Gemini Response:")
        print(response.text)
        print("-" * 60)
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_recovery_chatbot():
    """Test recovery-specific chatbot functionality"""
    print("\n\n🏥 Testing Recovery Chatbot Functionality")
    print("=" * 60)
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # Recovery context
        system_context = """You are a compassionate 24/7 AI Recovery Assistant for post-operative care.

PATIENT CONTEXT:
- Name: John Doe
- Age: 55
- Surgery: Knee Replacement
- Days post-op: 3

YOUR ROLE:
1. Provide empathetic, clear, evidence-based recovery guidance
2. Answer questions about pain management, wound care, activity levels, diet
3. Reassure for normal symptoms, alert for concerning ones
4. Keep responses concise (2-3 sentences max)
5. Use simple language, avoid medical jargon

Now respond to the patient's question:"""

        # Test questions
        questions = [
            "When can I start walking after knee surgery?",
            "I have some pain, is this normal?",
            "What foods should I eat to help healing?",
            "I have a fever of 102°F, should I be worried?"
        ]
        
        for i, question in enumerate(questions, 1):
            print(f"\n{i}. Patient: {question}")
            print("-" * 60)
            
            full_prompt = f"{system_context}\n\nPatient: {question}\n\nAssistant:"
            response = model.generate_content(full_prompt)
            
            print(f"🤖 Chatbot: {response.text}")
            
            # Check for red flags
            if any(word in question.lower() for word in ['fever', 'severe pain', 'bleeding', 'chest pain']):
                print("⚠️  NOTE: This response should trigger an alert to the medical team")
        
        print("\n" + "=" * 60)
        print("✅ All chatbot tests completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def interactive_chatbot():
    """Interactive chatbot session"""
    print("\n\n💬 Interactive Chatbot Mode")
    print("=" * 60)
    print("Type your questions below (or 'quit' to exit)")
    print("-" * 60)
    
    try:
        model = genai.GenerativeModel('gemini-pro')
        
        system_context = """You are a compassionate 24/7 AI Recovery Assistant for post-operative care.

PATIENT CONTEXT:
- Surgery: Recent surgery
- You're helping with post-operative recovery

YOUR ROLE:
1. Provide empathetic, clear, evidence-based recovery guidance
2. Answer questions about pain, healing, activities, medications
3. Keep responses brief and encouraging
4. Alert for serious symptoms (high fever, severe pain, bleeding)

Respond to the patient:"""

        while True:
            user_input = input("\n👤 You: ").strip()
            
            if user_input.lower() in ['quit', 'exit', 'bye']:
                print("👋 Thank you! Take care and feel better soon!")
                break
            
            if not user_input:
                continue
            
            full_prompt = f"{system_context}\n\nPatient: {user_input}\n\nAssistant:"
            response = model.generate_content(full_prompt)
            
            print(f"🤖 Chatbot: {response.text}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False

if __name__ == '__main__':
    # Test 1: Basic connection
    if not test_gemini_connection():
        print("\n❌ Basic connection test failed. Please check your API key and internet connection.")
        exit(1)
    
    # Test 2: Recovery chatbot
    if not test_recovery_chatbot():
        print("\n❌ Recovery chatbot test failed.")
        exit(1)
    
    # Test 3: Interactive mode
    print("\n" + "=" * 60)
    choice = input("\nWould you like to try interactive mode? (y/n): ").strip().lower()
    if choice == 'y':
        interactive_chatbot()
    
    print("\n✅ All tests completed successfully!")
    print("🎉 Your Gemini AI chatbot is working perfectly!")
