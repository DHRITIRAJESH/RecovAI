# 🤖 AI Chatbot Setup Instructions

## Overview

The RecovAI system now includes a 24/7 AI Recovery Assistant powered by Google's Gemini AI. This chatbot provides personalized recovery guidance, monitors for red flag symptoms, and alerts doctors when needed.

## Features

✅ **24/7 Availability** - Always available to answer patient questions
✅ **Red Flag Detection** - Monitors for 7 types of concerning symptoms
✅ **Personalized Guidance** - Tailored advice based on surgery type and recovery stage
✅ **Doctor Alerts** - Automatically notifies doctors of concerning symptoms
✅ **Surgery-Specific Recovery** - Specialized guidelines for cardiac, orthopedic, and abdominal surgeries
✅ **Fallback Responses** - Works even without internet/API key using rule-based responses

## Red Flags Monitored

1. **Fever** - Temperature concerns, chills, persistent fever
2. **Bleeding** - Excessive bleeding, blood in urine/stool
3. **Severe Pain** - Uncontrolled pain, worsening pain
4. **Breathing Issues** - Shortness of breath, difficulty breathing
5. **Chest Pain** - Chest pain, heart-related concerns
6. **Confusion** - Mental confusion, disorientation, memory issues
7. **Infection Signs** - Wound redness, pus, swelling, warmth

## Setup Instructions

### Step 1: Get Your Gemini API Key

1. Visit **Google AI Studio**: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated API key

### Step 2: Configure the API Key

**Option A: Set Environment Variable (Recommended)**

**Windows PowerShell:**

```powershell
# Temporary (current session only)
$env:GEMINI_API_KEY="your-api-key-here"

# Permanent (system-wide)
[System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'your-api-key-here', 'User')
```

**Windows Command Prompt:**

```cmd
setx GEMINI_API_KEY "your-api-key-here"
```

**Linux/Mac:**

```bash
export GEMINI_API_KEY="your-api-key-here"

# Add to ~/.bashrc or ~/.zshrc for persistence
echo 'export GEMINI_API_KEY="your-api-key-here"' >> ~/.bashrc
```

**Option B: Create .env File**

Create a file named `.env` in the `backend` folder:

```
GEMINI_API_KEY=your-api-key-here
```

Then install python-dotenv:

```bash
pip install python-dotenv
```

And add to the top of `chatbot.py`:

```python
from dotenv import load_dotenv
load_dotenv()
```

### Step 3: Restart Backend Server

After setting the API key, restart the Flask backend:

```bash
cd backend
python app.py
```

You should see: `✅ Chatbot initialized successfully`

## Testing the Chatbot

### Test 1: Normal Question

**Patient Input:** "When can I walk after surgery?"
**Expected:** Personalized response based on surgery type and recovery timeline

### Test 2: Red Flag Detection (Fever)

**Patient Input:** "I have a high fever and chills"
**Expected:**

- Immediate doctor alert notification
- Recommendation to monitor temperature
- Advice to contact doctor immediately

### Test 3: Red Flag Detection (Bleeding)

**Patient Input:** "There's a lot of blood coming from my wound"
**Expected:**

- Doctor alert triggered
- Emergency guidance (apply pressure, elevate)
- Instruction to seek immediate medical attention

### Test 4: Quick Questions

**Patient Input:** Click any quick question button
**Expected:** Surgery-specific response with actionable recommendations

## API Endpoints

### POST /api/chatbot/ask

Send a message to the chatbot.

**Request:**

```json
{
  "message": "When can I walk?",
  "chat_history": [
    { "type": "user", "text": "Previous question" },
    { "type": "bot", "text": "Previous response" }
  ]
}
```

**Response:**

```json
{
  "response": "Based on your cardiac surgery...",
  "recommended_actions": ["Monitor your heart rate", "Start with short walks"],
  "needs_alert": false,
  "timestamp": "2025-01-15T10:30:00"
}
```

### GET /api/chatbot/quick-questions

Get personalized quick questions based on recovery stage.

**Response:**

```json
{
  "quick_questions": [
    "Is this pain level normal?",
    "What are warning signs I should watch for?",
    "When can I start walking?",
    "How do I care for my wound?"
  ]
}
```

## Fallback Mode

If the Gemini API is unavailable or the API key is not configured, the chatbot automatically falls back to rule-based responses:

- **Medication questions** → Remind to follow doctor's prescription
- **Pain management** → Provide general pain management tips
- **Wound care** → Basic wound care guidelines
- **Activity questions** → General activity recommendations
- **Diet questions** → General nutrition advice
- **Appointment questions** → Remind to check with healthcare team

The system will continue to detect red flags and alert doctors even in fallback mode.

## Troubleshooting

### Issue: "Chatbot not responding"

**Solution:**

- Check if backend server is running
- Verify API endpoint is accessible: `http://localhost:5000/api/chatbot/ask`
- Check browser console for errors

### Issue: "Generic responses only"

**Solution:**

- Verify GEMINI_API_KEY is set correctly
- Check backend logs for API errors
- Ensure internet connection is active

### Issue: "Doctor alerts not working"

**Solution:**

- Check backend console for alert logs
- Look for: `🚨 ALERT: Patient X reported: [symptoms]`
- Implement notification system (email/SMS) for production

### Issue: "Quick questions not showing"

**Solution:**

- Verify patient has surgery_date in database
- Check that GET /api/chatbot/quick-questions is accessible
- Ensure patient is logged in with valid session

## Security Notes

⚠️ **Never commit your API key to version control!**

- Add `.env` to `.gitignore`
- Use environment variables in production
- Rotate API keys regularly
- Monitor API usage in Google AI Studio

## Cost Considerations

- **Gemini API** is free for limited usage (60 requests/minute)
- For production, consider Google Cloud billing
- Monitor usage at: https://console.cloud.google.com/
- Fallback mode reduces API calls

## Next Steps

1. **Implement Doctor Notifications**: Add email/SMS alerts when red flags are detected
2. **Chat History Storage**: Save chat logs to database for continuity
3. **Analytics Dashboard**: Track common patient concerns and recovery patterns
4. **Multi-language Support**: Extend chatbot to support multiple languages
5. **Voice Interface**: Add speech-to-text for hands-free interaction

## Support

For issues or questions:

- Check backend logs in terminal
- Review browser console (F12)
- Test with curl: `curl -X POST http://localhost:5000/api/chatbot/ask -H "Content-Type: application/json" -d '{"message":"test"}'`

---

**Status**: ✅ Chatbot feature fully integrated and ready to use!
