"""
Agent 1 — Experiment Generator
Uses Groq to convert extracted document text into a self-contained HTML file
implementing the experiment as a virtual lab.
"""
import logging
import re

from groq import Groq

from config import settings
from utils.validator import validate_jsx

logger = logging.getLogger(__name__)

groq_client = Groq(api_key=settings.groq_api_key)

SYSTEM_PROMPT = """You are a Kenyan KNEC secondary school science teacher and senior web developer.

Convert a science experiment document into a single self-contained HTML file that implements the experiment as a virtual lab for Form 1-4 students (age 14-18) with no physical equipment.

STRUCTURE — produce exactly this layout:
1. <style> block — all CSS inline, no external stylesheets except cdnjs
2. <div class="lab"> — the full UI
3. <script> block — all JavaScript, vanilla JS only, no frameworks

UI LAYOUT — three sections:
SECTION 1 (left panel): Canvas/SVG visualisation — minimum 300px wide, animated in real time using requestAnimationFrame. Shows the physical setup with labelled parts. Uses real physics formulas.
SECTION 2 (right top): Controls — sliders with units/min/max/step, action buttons (Run/Reset/Keep Trial), phase badge showing current state
SECTION 3 (right bottom): Data table filling row by row as student runs trials, derived columns, auto-calculated result vs accepted value with % error, conclusion

PHYSICS REQUIREMENTS:
- All constants and formulas must be correct to 2 decimal places
- Minimum 5 distinct student-runnable trials
- Animation timing proportional to real time (scaled for UX)
- No hardcoded results — every value computed from real physics

JAVASCRIPT REQUIREMENTS:
- Use requestAnimationFrame for all animation (no setTimeout)
- Use performance.now() for timing accuracy
- Clean up animation frames properly
- Vanilla JS only — no React, no Vue, no imports

You MAY import Three.js from: https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js
Only use Three.js if the experiment genuinely benefits from 3D visualisation.
For most experiments, use SVG or 2D canvas — simpler and more reliable.

OUTPUT FORMAT — ABSOLUTE:
- Output raw HTML only
- Start EXACTLY with: <!-- Title:
- The title comment must be on the very first line
- End with: </script>
- No markdown, no backticks, no preamble, no explanation
- CRITICAL: Do not wrap in markdown fences. Start immediately with <!-- Title:
"""


def build_user_prompt(document_text: str, subject: str) -> str:
    return f"""Subject: {subject.upper()}
Curriculum: KNEC secondary school syllabus
Target user: Kenyan Form 1-4 student, age 14-18, no physical lab equipment

Experiment document:
───────────────────────────────────────────────────────────────
{document_text}
───────────────────────────────────────────────────────────────

Produce the complete self-contained HTML virtual lab.
CRITICAL: Start immediately with <!-- Title: — no markdown, no backticks, nothing before it.
"""


def validate_html(code: str) -> tuple[bool, str]:
    """Basic validation that the output looks like a working HTML experiment."""
    if not code or len(code.strip()) < 200:
        return False, "Output too short — likely incomplete."

    checks = [
        (r"<!--\s*Title:", "Missing <!-- Title: comment"),
        (r"<style", "Missing <style> block"),
        (r"<script", "Missing <script> block"),
        (r"requestAnimationFrame", "Missing animation loop"),
        (r"<(div|svg|canvas)", "Missing visual element"),
    ]

    for pattern, message in checks:
        if not re.search(pattern, code, re.IGNORECASE):
            return False, message

    return True, ""


def _extract_title(code: str, document_text: str) -> str:
    """Extract title from HTML comment or document text."""
    match = re.search(r"<!--\s*Title:\s*(.+?)(?:-->|\n)", code)
    if match:
        return match.group(1).strip()
    first_line = document_text.strip().split("\n")[0][:80]
    return first_line or "Untitled Experiment"


async def generate_experiment(document_text: str, subject: str) -> tuple[str, str]:
    """
    Returns (html_code, experiment_title).
    Retries up to 3 times on validation failure.
    Raises RuntimeError if all attempts fail.
    """
    prompt = build_user_prompt(document_text, subject)

    last_error = ""
    for attempt in range(1, 4):
        try:
            response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
               # model="llama-3.3-70b-instruct",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=8192,
            )
            code = response.choices[0].message.content.strip()

            # Nuclear markdown strip
            code = re.sub(r'^```[\w]*\n?', '', code, flags=re.MULTILINE)
            code = re.sub(r'\n?```$', '', code, flags=re.MULTILINE)

            # Strip any preamble before the HTML title comment
            if '<!-- Title:' in code:
                code = code[code.find('<!-- Title:'):]

            code = code.strip()

            is_valid, error = validate_html(code)
            if is_valid:
                title = _extract_title(code, document_text)
                logger.info(f"Experiment generated on attempt {attempt}: {title}")
                return code, title

            last_error = error
            logger.warning(f"Attempt {attempt} failed validation: {error}")
            prompt += f"\n\nPrevious attempt invalid: {error}. Fix and regenerate. Start with <!-- Title:"

        except Exception as e:
            last_error = str(e)
            logger.error(f"Groq error on attempt {attempt}: {e}")

    raise RuntimeError(f"Experiment generation failed after 3 attempts. Last error: {last_error}")