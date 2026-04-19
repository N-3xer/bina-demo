"""
Basic validation that the generated string looks like a valid React component.
Not a full JSX parser — just enough to catch obvious generation failures
before we waste storage on broken code.
"""
import re


REQUIRED_PATTERNS = [
   # r"export\s+default",                          # Default export
    r"(function|const\s+\w+\s*=\s*\$|=>)",       # Function/arrow/const component
    r"<[A-Za-z]",                                # JSX elements
    r"React\.useState|useState",                 # React hooks (per your prompt)
    r"(useEffect|requestAnimationFrame)",        # Animation engine
]


def validate_jsx(code: str) -> tuple[bool, str]:
    """
    Returns (is_valid, error_message).
    is_valid=True means safe to store and serve.
    """
    if not code or len(code.strip()) < 200:  # Raised min length for experiments
        return False, "Generated component too short — likely incomplete."

    for pattern in REQUIRED_PATTERNS:
        if not re.search(pattern, code, re.MULTILINE):
            return False, f"Missing required pattern: {pattern}"

    # Brace balance (tighter tolerance for JSX)
    opens = code.count("{")
    closes = code.count("}")
    if abs(opens - closes) > 3:
        return False, f"Unbalanced braces: {opens} open vs {closes} close."

    # Ensure it's not just a plain JS function (must have JSX)
    if re.search(r"return\s*\$[^<]*\$", code) and "<" not in code:
        return False, "Found return() but no JSX elements."

    return True, ""