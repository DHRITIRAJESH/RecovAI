"""
Blood Report Vitals Extractor
Supports multiple extraction methods for PDF/Image blood reports
Integrates with pdf_ocr_tool.py for enhanced PDF OCR capabilities
"""

import os
import re
import json
from io import BytesIO
import tempfile

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False
    print("⚠️  Pillow (PIL) not available")

try:
    import PyPDF2
    PYPDF2_AVAILABLE = True
except ImportError:
    PYPDF2_AVAILABLE = False
    print("⚠️  PyPDF2 not available")

try:
    import pdf2image
    PDF2IMAGE_AVAILABLE = True
except ImportError:
    PDF2IMAGE_AVAILABLE = False
    print("⚠️  pdf2image not available")

try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False
    print("⚠️  pytesseract not available")

try:
    import google.generativeai as genai
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    if GEMINI_API_KEY:
        genai.configure(api_key=GEMINI_API_KEY)
        GEMINI_AVAILABLE = True
    else:
        GEMINI_AVAILABLE = False
except ImportError:
    GEMINI_AVAILABLE = False

# Try to import pdf_ocr_tool
try:
    from pdf_ocr_tool import run_pdf_ocr
    PDF_OCR_TOOL_AVAILABLE = True
except ImportError:
    PDF_OCR_TOOL_AVAILABLE = False
    print("⚠️  pdf_ocr_tool.py not available")


class BloodReportExtractor:
    """Extract blood vitals from PDF/Image reports using multiple methods"""
    
    def __init__(self):
        self.vitals_keywords = {
            'hemoglobin': ['hemoglobin', 'hb', 'hgb', 'haemoglobin'],
            'platelets': ['platelet', 'plt', 'thrombocyte'],
            'creatinine': ['creatinine', 'creat', 'cr'],
            'albumin': ['albumin', 'alb']
        }
        
        # Common units for validation
        self.units = {
            'hemoglobin': 'g/dL',
            'platelets': 'x10^3/µL',
            'creatinine': 'mg/dL',
            'albumin': 'g/dL'
        }
        
        # Normal ranges for validation
        self.normal_ranges = {
            'hemoglobin': (12.0, 17.5),
            'platelets': (150, 400),
            'creatinine': (0.6, 1.3),
            'albumin': (3.5, 5.5)
        }
    
    def extract_from_file(self, file_path_or_bytes, filename='report.pdf'):
        """
        Main extraction method - tries all available methods
        Returns: {
            'values': {'hemoglobin': 14.2, 'platelets': 250, ...},
            'confidence': 85,
            'method': 'gemini_vision',
            'raw_text': '...',
            'status': 'success'
        }
        """
        file_extension = filename.lower().split('.')[-1]
        
        # Try Gemini Vision first (highest accuracy)
        if GEMINI_AVAILABLE and file_extension in ['pdf', 'jpg', 'jpeg', 'png']:
            print("🔍 Trying Gemini Vision API...")
            result = self._extract_with_gemini(file_path_or_bytes, file_extension)
            if result['status'] == 'success' and result['confidence'] > 50:  # Lower threshold
                result['method'] = 'gemini_vision'
                return result
            else:
                print(f"⚠️ Gemini extraction result: {result.get('message', 'Unknown error')}")
        
        # For images, try OCR if available
        if file_extension in ['jpg', 'jpeg', 'png']:
            if TESSERACT_AVAILABLE:
                print("🔍 Trying Tesseract OCR for image...")
                result = self._extract_from_image_ocr(file_path_or_bytes)
                if result['status'] == 'success':
                    result['method'] = 'tesseract_ocr'
                    return result
            else:
                print("⚠️ Tesseract OCR not available")
                if not GEMINI_AVAILABLE:
                    return {
                        'status': 'error',
                        'message': 'Image extraction requires either Gemini API key or Tesseract OCR installation. Please set GEMINI_API_KEY environment variable.',
                        'values': {},
                        'confidence': 0,
                        'method': 'none'
                    }
        
        # For PDFs, try text extraction first
        if file_extension == 'pdf':
            print("🔍 Trying PDF text extraction...")
            result = self._extract_from_pdf_text(file_path_or_bytes)
            if result['status'] == 'success' and result['confidence'] > 50:
                result['method'] = 'pdf_text'
                return result
            
            # If text extraction failed, convert to image and OCR
            print("🔍 Trying PDF to Image OCR...")
            result = self._extract_from_pdf_ocr(file_path_or_bytes)
            if result['status'] == 'success':
                result['method'] = 'pdf_ocr'
                return result
        
        return {
            'status': 'error',
            'message': 'Could not extract vitals from the report',
            'values': {},
            'confidence': 0,
            'method': 'none'
        }
    
    def _extract_from_pdf_text(self, file_bytes):
        """Extract text from digital PDF"""
        if not PYPDF2_AVAILABLE:
            return {'status': 'error', 'message': 'PyPDF2 not installed. Run: pip install PyPDF2', 'values': {}, 'confidence': 0}
        
        try:
            if isinstance(file_bytes, bytes):
                pdf_file = BytesIO(file_bytes)
            else:
                pdf_file = open(file_bytes, 'rb')
            
            reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            
            if not isinstance(file_bytes, bytes):
                pdf_file.close()
            
            return self._parse_text_for_vitals(text)
        
        except Exception as e:
            print(f"PDF text extraction error: {e}")
            return {'status': 'error', 'message': str(e), 'values': {}, 'confidence': 0}
    
    def _extract_from_image_ocr(self, file_bytes):
        """Extract text from image using Tesseract OCR"""
        if not TESSERACT_AVAILABLE:
            return {'status': 'error', 'message': 'pytesseract not installed. Run: pip install pytesseract', 'values': {}, 'confidence': 0}
        
        if not PIL_AVAILABLE:
            return {'status': 'error', 'message': 'Pillow not installed. Run: pip install Pillow', 'values': {}, 'confidence': 0}
        
        try:
            if isinstance(file_bytes, bytes):
                image = Image.open(BytesIO(file_bytes))
            else:
                image = Image.open(file_bytes)
            
            text = pytesseract.image_to_string(image)
            return self._parse_text_for_vitals(text)
        
        except Exception as e:
            print(f"OCR error: {e}")
            return {'status': 'error', 'message': str(e), 'values': {}, 'confidence': 0}
    
    def _extract_from_pdf_ocr(self, file_bytes):
        """Convert PDF to images and extract using OCR - Enhanced with pdf_ocr_tool"""
        if not TESSERACT_AVAILABLE:
            return {'status': 'error', 'message': 'pytesseract not installed. Run: pip install pytesseract', 'values': {}, 'confidence': 0}
        
        if not PDF2IMAGE_AVAILABLE:
            return {'status': 'error', 'message': 'pdf2image not installed. Run: pip install pdf2image. Also requires poppler: https://github.com/oschwartz10612/poppler-windows/releases/', 'values': {}, 'confidence': 0}
        
        if not PIL_AVAILABLE:
            return {'status': 'error', 'message': 'Pillow not installed. Run: pip install Pillow', 'values': {}, 'confidence': 0}
        
        try:
            # If pdf_ocr_tool is available, use it for better OCR results
            if PDF_OCR_TOOL_AVAILABLE:
                print("🔍 Using pdf_ocr_tool for enhanced OCR...")
                
                # Save bytes to temp file
                with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as tmp_file:
                    if isinstance(file_bytes, bytes):
                        tmp_file.write(file_bytes)
                    else:
                        with open(file_bytes, 'rb') as f:
                            tmp_file.write(f.read())
                    tmp_path = tmp_file.name
                
                try:
                    # Run pdf_ocr_tool
                    text_file, pdf_file = run_pdf_ocr(tmp_path)
                    
                    # Read extracted text
                    with open(text_file, 'r', encoding='utf-8') as f:
                        text = f.read()
                    
                    # Clean up temp files
                    os.unlink(tmp_path)
                    os.unlink(text_file)
                    if os.path.exists(pdf_file):
                        os.unlink(pdf_file)
                    
                    # Clean up any temporary page images
                    for i in range(20):  # Check up to 20 pages
                        temp_img = f"page_{i}.jpg"
                        if os.path.exists(temp_img):
                            os.unlink(temp_img)
                    
                    return self._parse_text_for_vitals(text)
                except Exception as e:
                    print(f"pdf_ocr_tool error: {e}, falling back to standard OCR")
                    if os.path.exists(tmp_path):
                        os.unlink(tmp_path)
            
            # Standard OCR method (fallback)
            # Convert PDF to images
            if isinstance(file_bytes, bytes):
                images = pdf2image.convert_from_bytes(file_bytes)
            else:
                images = pdf2image.convert_from_path(file_bytes)
            
            # Extract text from all pages
            text = ""
            for image in images:
                text += pytesseract.image_to_string(image) + "\n"
            
            return self._parse_text_for_vitals(text)
        
        except Exception as e:
            print(f"PDF OCR error: {e}")
            return {'status': 'error', 'message': str(e), 'values': {}, 'confidence': 0}
    
    def _extract_with_gemini(self, file_bytes, file_extension):
        """Extract using Google Gemini Vision API"""
        if not GEMINI_AVAILABLE:
            return {'status': 'error', 'message': 'Gemini API not configured. Set GEMINI_API_KEY environment variable.', 'values': {}, 'confidence': 0}
        
        if not PIL_AVAILABLE:
            return {'status': 'error', 'message': 'Pillow not installed. Run: pip install Pillow', 'values': {}, 'confidence': 0}
        
        try:
            # Prepare image
            if file_extension == 'pdf':
                if not PDF2IMAGE_AVAILABLE:
                    return {'status': 'error', 'message': 'pdf2image required for PDF processing with Gemini', 'values': {}, 'confidence': 0}
                
                # Convert first page to image
                if isinstance(file_bytes, bytes):
                    images = pdf2image.convert_from_bytes(file_bytes, first_page=1, last_page=1)
                else:
                    images = pdf2image.convert_from_path(file_bytes, first_page=1, last_page=1)
                image = images[0]
            else:
                if isinstance(file_bytes, bytes):
                    image = Image.open(BytesIO(file_bytes))
                else:
                    image = Image.open(file_bytes)
            
            # Convert to bytes for Gemini
            img_byte_arr = BytesIO()
            image.save(img_byte_arr, format='PNG')
            img_byte_arr = img_byte_arr.getvalue()
            
            # Call Gemini Vision
            try:
                model = genai.GenerativeModel('gemini-1.5-flash')
            except:
                # Fallback to older model
                model = genai.GenerativeModel('gemini-pro-vision')
            
            prompt = """You are a medical data extraction expert. Analyze this blood report image and extract the following vital values:
1. Hemoglobin (Hb/HGB) in g/dL
2. Platelets (PLT) in x10^3/µL or thousands/µL
3. Creatinine (Creat/CR) in mg/dL
4. Albumin (ALB) in g/dL

Return ONLY a JSON object in this exact format (no markdown, no explanation):
{
  "hemoglobin": 14.2,
  "platelets": 250,
  "creatinine": 1.1,
  "albumin": 4.5,
  "confidence": 95
}

If a value is not found, use null. confidence should be 0-100 based on image quality and clarity."""

            # Generate response
            response = model.generate_content([prompt, {'mime_type': 'image/png', 'data': img_byte_arr}])
            
            # Parse JSON response
            response_text = response.text.strip()
            # Remove markdown code blocks if present
            response_text = re.sub(r'```json\s*|\s*```', '', response_text)
            
            data = json.loads(response_text)
            
            values = {}
            for key in ['hemoglobin', 'platelets', 'creatinine', 'albumin']:
                if key in data and data[key] is not None:
                    values[key] = float(data[key])
            
            confidence = int(data.get('confidence', 80))
            
            return {
                'status': 'success',
                'values': values,
                'confidence': confidence,
                'raw_text': response_text,
                'method': 'gemini_vision'
            }
        
        except Exception as e:
            print(f"Gemini Vision error: {e}")
            return {'status': 'error', 'message': str(e), 'values': {}, 'confidence': 0}
    
    def _parse_text_for_vitals(self, text):
        """Parse extracted text for vital values using regex"""
        values = {}
        confidence_scores = []
        
        text_lower = text.lower()
        lines = text_lower.split('\n')
        
        for vital, keywords in self.vitals_keywords.items():
            value = self._find_vital_value(lines, keywords, vital)
            if value is not None:
                values[vital] = value
                # Calculate confidence based on value reasonableness
                if self._is_value_reasonable(vital, value):
                    confidence_scores.append(90)
                else:
                    confidence_scores.append(60)
        
        if not values:
            return {
                'status': 'error',
                'message': 'No vitals found in text',
                'values': {},
                'confidence': 0,
                'raw_text': text[:500]
            }
        
        avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0
        
        return {
            'status': 'success',
            'values': values,
            'confidence': int(avg_confidence),
            'raw_text': text[:500]  # First 500 chars for debugging
        }
    
    def _find_vital_value(self, lines, keywords, vital_name):
        """Find a specific vital value in text lines"""
        for line in lines:
            # Check if any keyword is in the line
            if any(keyword in line for keyword in keywords):
                # Look for number patterns
                # Patterns: "12.5", "12.5 g/dL", "12.5g/dL", "12.5 - 15.0"
                patterns = [
                    r'(\d+\.?\d*)\s*(?:g/dl|g/l|mg/dl|x10|/µl|thousand)',  # With unit
                    r'(?::|=|\s)\s*(\d+\.?\d*)',  # After colon/equals
                    r'(\d+\.?\d*)\s*$'  # Just number at end of line
                ]
                
                for pattern in patterns:
                    match = re.search(pattern, line)
                    if match:
                        try:
                            value = float(match.group(1))
                            # Validate range
                            if self._is_value_reasonable(vital_name, value):
                                return value
                        except (ValueError, IndexError):
                            continue
        
        return None
    
    def _is_value_reasonable(self, vital_name, value):
        """Check if value is within reasonable range"""
        if vital_name not in self.normal_ranges:
            return True
        
        min_val, max_val = self.normal_ranges[vital_name]
        # Allow 50% beyond normal range for abnormal values
        return (min_val * 0.5) <= value <= (max_val * 1.5)


def get_extractor():
    """Factory function to get extractor instance"""
    return BloodReportExtractor()
