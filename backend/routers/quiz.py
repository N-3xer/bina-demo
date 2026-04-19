import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import Experiment, ExperimentCache, StudentSession

router = APIRouter()


class QuizSubmission(BaseModel):
    experiment_id: str
    answers: list[int]        # list of chosen option indices
    session_token: str


class QuizResult(BaseModel):
    score: int
    total: int
    percentage: float
    feedback: list[dict]


@router.post("/submit", response_model=QuizResult)
async def submit_quiz(payload: QuizSubmission, db: AsyncSession = Depends(get_db)):
    # Fetch experiment + quiz
    result = await db.execute(
        select(Experiment, ExperimentCache)
        .join(ExperimentCache, Experiment.cache_id == ExperimentCache.id)
        .where(Experiment.id == payload.experiment_id, Experiment.published == True)
    )
    row = result.one_or_none()
    if not row:
        raise HTTPException(404, "Experiment not found")

    exp, cache = row
    questions = cache.quiz_json

    if len(payload.answers) != len(questions):
        raise HTTPException(400, f"Expected {len(questions)} answers, got {len(payload.answers)}")

    # Score
    score = 0
    feedback = []
    for i, (q, chosen) in enumerate(zip(questions, payload.answers)):
        correct = q["correct_index"]
        is_correct = chosen == correct
        if is_correct:
            score += 1
        feedback.append({
            "question": q["question"],
            "chosen": chosen,
            "correct_index": correct,
            "is_correct": is_correct,
            "explanation": q.get("explanation", ""),
        })

    percentage = round((score / len(questions)) * 100, 1)

    # Record session
    session_result = await db.execute(
        select(StudentSession).where(
            StudentSession.experiment_id == payload.experiment_id,
            StudentSession.session_token == payload.session_token,
        )
    )
    session = session_result.scalar_one_or_none()

    if session:
        session.quiz_score = score
        session.completed_at = datetime.now(timezone.utc)
    else:
        session = StudentSession(
            experiment_id=payload.experiment_id,
            session_token=payload.session_token,
            quiz_score=score,
            completed_at=datetime.now(timezone.utc),
        )
        db.add(session)

    return QuizResult(score=score, total=len(questions), percentage=percentage, feedback=feedback)


@router.post("/session/start")
async def start_session(experiment_id: str, db: AsyncSession = Depends(get_db)):
    """Creates an anonymous session token for a student starting an experiment."""
    result = await db.execute(
        select(Experiment).where(Experiment.id == experiment_id, Experiment.published == True)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(404, "Experiment not found")

    token = secrets.token_urlsafe(32)
    session = StudentSession(experiment_id=experiment_id, session_token=token)
    db.add(session)

    return {"session_token": token}
