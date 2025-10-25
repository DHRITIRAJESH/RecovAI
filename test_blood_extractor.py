"""
Test script for blood report extractor
Run: python test_blood_extractor.py
"""

import os
import sys

# Test with sample text (simulating extracted text from PDF/OCR)
sample_blood_report_text = """
BLOOD TEST REPORT
=================
Patient: John Doe
Date: 2025-10-25

COMPLETE BLOOD COUNT (CBC)
---------------------------
Hemoglobin (Hb):        14.5 g/dL       [Normal: 13.5-17.5]
Platelets (PLT):        245 x10³/µL     [Normal: 150-400]

KIDNEY FUNCTION TESTS
---------------------
Creatinine:             1.2 mg/dL       [Normal: 0.6-1.3]

LIVER FUNCTION TESTS
--------------------
Albumin:                4.2 g/dL        [Normal: 3.5-5.5]
"""

def test_text_parsing():
    """Test the text parsing capability"""
    print("🧪 Testing Blood Report Extractor")
    print("=" * 60)
    
    try:
        from blood_report_extractor import BloodReportExtractor
        
        extractor = BloodReportExtractor()
        result = extractor._parse_text_for_vitals(sample_blood_report_text)
        
        print(f"\n✅ Status: {result['status']}")
        print(f"📊 Confidence: {result['confidence']}%")
        print(f"\n📋 Extracted Values:")
        
        for vital, value in result.get('values', {}).items():
            print(f"   • {vital.capitalize()}: {value}")
        
        if result['status'] == 'success':
            print("\n✅ Text parsing test PASSED")
            return True
        else:
            print(f"\n❌ Test FAILED: {result.get('message')}")
            return False
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_gemini_availability():
    """Test if Gemini API is available"""
    print(f"\n{'=' * 60}")
    print("🔍 Checking Gemini API Availability")
    print("=" * 60)
    
    try:
        import google.generativeai as genai
        api_key = os.getenv('GEMINI_API_KEY', '')
        
        if api_key:
            print(f"✅ GEMINI_API_KEY found (length: {len(api_key)})")
            genai.configure(api_key=api_key)
            
            # Try to list models
            models = list(genai.list_models())
            print(f"✅ Connected to Gemini API ({len(models)} models available)")
            return True
        else:
            print("⚠️  GEMINI_API_KEY not set in environment")
            return False
            
    except ImportError:
        print("❌ google-generativeai package not installed")
        return False
    except Exception as e:
        print(f"❌ Gemini API error: {e}")
        return False


def test_tesseract_availability():
    """Test if Tesseract OCR is available"""
    print(f"\n{'=' * 60}")
    print("🔍 Checking Tesseract OCR Availability")
    print("=" * 60)
    
    try:
        import pytesseract
        print("✅ pytesseract package installed")
        
        # Try to get version (will fail if tesseract executable not installed)
        try:
            version = pytesseract.get_tesseract_version()
            print(f"✅ Tesseract executable found (version: {version})")
            return True
        except:
            print("⚠️  pytesseract installed but Tesseract executable not found")
            print("   Download from: https://github.com/UB-Mannheim/tesseract/wiki")
            return False
            
    except ImportError:
        print("❌ pytesseract package not installed")
        return False


if __name__ == '__main__':
    print("\n🏥 RecovAI Blood Report Extractor - Test Suite")
    print("=" * 60)
    
    results = {
        'text_parsing': test_text_parsing(),
        'gemini': test_gemini_availability(),
        'tesseract': test_tesseract_availability()
    }
    
    print(f"\n{'=' * 60}")
    print("📊 Test Summary")
    print("=" * 60)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
    
    print("\n" + "=" * 60)
    if results['text_parsing']:
        print("✅ Blood report extractor is functional!")
        print("\nCapabilities:")
        print("  • Text parsing from PDF/OCR: ✅")
        print(f"  • Gemini Vision API: {'✅' if results['gemini'] else '⚠️ Not available'}")
        print(f"  • Tesseract OCR: {'✅' if results['tesseract'] else '⚠️ Not available'}")
    else:
        print("❌ Blood report extractor has issues")
    print("=" * 60)
