import pytesseract
from pdf2image import convert_from_path
from fpdf import FPDF
from PIL import Image
import os

def run_pdf_ocr(pdf_path):
    pages = convert_from_path(pdf_path, dpi=300)
    ocr_text = ""
    output_pdf = FPDF()

    for i, page in enumerate(pages):
        text = pytesseract.image_to_string(page)
        ocr_text += f"\n--- Page {i+1} ---\n{text}\n"

        temp_img = f"page_{i}.jpg"
        page.save(temp_img, "JPEG")
        output_pdf.add_page()
        output_pdf.image(temp_img, 0, 0, 210, 297)

    # Save outputs
    text_file = pdf_path.replace(".pdf", "_ocr.txt")
    pdf_file = pdf_path.replace(".pdf", "_ocr.pdf")

    with open(text_file, "w", encoding="utf-8") as f:
        f.write(ocr_text)

    output_pdf.output(pdf_file)
    print(f"OCR complete: {pdf_file}")

    return text_file, pdf_file
