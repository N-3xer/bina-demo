"""
Extracts plain text from uploaded PDF or image files.
PDF: PyMuPDF (fast, no external dependencies)
Image: pytesseract OCR (free, local, no tokens burned)
"""
import io
from pathlib import Path

import fitz  # PyMuPDF


MAX_CHARS = 12_000  # ~3000 tokens — tight budget for Llama


def extract_text_from_pdf(content: bytes) -> str:
    doc = fitz.open(stream=content, filetype="pdf")
    pages = []
    for page in doc:
        pages.append(page.get_text())
    doc.close()
    text = "\n\n".join(pages).strip()
    return text[:MAX_CHARS]


def extract_text_from_image(content: bytes) -> str:
    try:
        import pytesseract
        from PIL import Image
    except ImportError:
        raise RuntimeError(
            "pytesseract and Pillow are required for image OCR. "
            "Run: pip install pytesseract pillow && sudo apt install tesseract-ocr"
        )

    image = Image.open(io.BytesIO(content))
    text = pytesseract.image_to_string(image)
    return text.strip()[:MAX_CHARS]


def extract_text(content: bytes, filename: str, gemini_client=None) -> str:
    ext = Path(filename).suffix.lower()
    if ext == ".pdf":
        return extract_text_from_pdf(content)
    elif ext in {".png", ".jpg", ".jpeg", ".webp"}:
        return extract_text_from_image(content)
    else:
        raise ValueError(f"Unsupported file type: {ext}")