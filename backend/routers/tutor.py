"""
Tutor router — rate-limited endpoint for student questions.
No auth required (students have no accounts in MVP).
"""
import time
import logging
from collections import defaultdict

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from agents.tutor import ask_tutor
from config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

# Simple in-memory rate limiter: session_token → list of timestamps
_rate_store: dict[str, list[float]] = defaultdict(list)


def _check_rate_limit(session_token: str) -> None:
    now = time.time()
    window = 60  # 1 minute
    limit = settings.tutor_requests_per_minute

    # Purge old timestamps
    _rate_store[session_token] = [t for t in _rate_store[session_token] if now - t < window]

    if len(_rate_store[session_token]) >= limit:
        raise HTTPException(429, f"Too many questions. Maximum {limit} per minute.")

    _rate_store[session_token].append(now)


class TutorRequest(BaseModel):
    question: str
    document_text: str        # frontend passes the cached doc text
    conversation_history: list[dict] = []
    session_token: str


class TutorResponse(BaseModel):
    answer: str


@router.post("", response_model=TutorResponse)
async def ask(payload: TutorRequest):
    if not payload.question.strip():
        raise HTTPException(400, "Question cannot be empty.")

    if len(payload.question) > 500:
        raise HTTPException(400, "Question too long. Keep it under 500 characters.")

    _check_rate_limit(payload.session_token)

    try:
        answer = await ask_tutor(
            question=payload.question,
            document_text=payload.document_text,
            conversation_history=payload.conversation_history,
        )
    except RuntimeError as e:
        raise HTTPException(503, str(e))

    return TutorResponse(answer=answer)
