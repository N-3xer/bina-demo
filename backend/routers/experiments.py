from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import Experiment, ExperimentCache, Teacher
from utils.auth import get_current_teacher

router = APIRouter()


class ExperimentSummary(BaseModel):
    id: str
    title: str
    subject: str
    published: bool
    component_url: str


class ExperimentDetail(BaseModel):
    id: str
    title: str
    subject: str
    component_url: str
    quiz: list[dict]
    source_doc_url: str
    document_text: str


@router.get("", response_model=list[ExperimentSummary])
async def list_experiments(db: AsyncSession = Depends(get_db)):
    """Public — lists all published experiments in the library."""
    result = await db.execute(
        select(Experiment, ExperimentCache)
        .join(ExperimentCache, Experiment.cache_id == ExperimentCache.id)
        .where(Experiment.published == True)
    )
    rows = result.all()
    return [
        ExperimentSummary(
            id=exp.id,
            title=cache.title,
            subject=cache.subject,
            published=exp.published,
            component_url=cache.component_url,
        )
        for exp, cache in rows
    ]


@router.get("/component/{filename}")
async def serve_component(filename: str):
    from supabase import create_client
    from fastapi.responses import HTMLResponse
    from config import settings
    
    supabase = create_client(settings.supabase_url, settings.supabase_service_key)
    
    try:
        data = supabase.storage.from_("bina-experiments").download(
            f"experiments/components/{filename}"
        )
        return HTMLResponse(content=data.decode("utf-8"))
    except Exception as e:
        raise HTTPException(404, f"Component not found: {e}")


@router.get("/{experiment_id}", response_model=ExperimentDetail)
async def get_experiment(experiment_id: str, db: AsyncSession = Depends(get_db)):
    """Public — get full experiment detail including component URL and quiz."""
    result = await db.execute(
        select(Experiment, ExperimentCache)
        .join(ExperimentCache, Experiment.cache_id == ExperimentCache.id)
        .where(Experiment.id == experiment_id, Experiment.published == True)
    )
    row = result.one_or_none()
    if not row:
        raise HTTPException(status_code=404, detail="Experiment not found")

    exp, cache = row
    return ExperimentDetail(
        id=exp.id,
        title=cache.title,
        subject=cache.subject,
        component_url=cache.component_url,
        quiz=cache.quiz_json,
        source_doc_url=cache.source_doc_url,
        document_text=cache.document_text or ""
    )


@router.patch("/{experiment_id}/publish")
async def toggle_publish(
    experiment_id: str,
    db: AsyncSession = Depends(get_db),
    teacher: Teacher = Depends(get_current_teacher),
):
    """Teacher only — publish or unpublish an experiment."""
    result = await db.execute(
        select(Experiment).where(
            Experiment.id == experiment_id,
            Experiment.teacher_id == teacher.id,
        )
    )
    exp = result.scalar_one_or_none()
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found or not yours")

    exp.published = not exp.published
    return {"id": exp.id, "published": exp.published}


@router.get("/teacher/dashboard")
async def teacher_dashboard(
    db: AsyncSession = Depends(get_db),
    teacher: Teacher = Depends(get_current_teacher),
):
    """Teacher only — list their experiments with session counts."""
    from sqlalchemy import func
    from models import StudentSession

    result = await db.execute(
        select(
            Experiment,
            ExperimentCache,
            func.count(StudentSession.id).label("session_count"),
        )
        .join(ExperimentCache, Experiment.cache_id == ExperimentCache.id)
        .outerjoin(StudentSession, StudentSession.experiment_id == Experiment.id)
        .where(Experiment.teacher_id == teacher.id)
        .group_by(Experiment.id, ExperimentCache.id)
        .order_by(Experiment.created_at.desc())
    )

    rows = result.all()
    return [
        {
            "id": exp.id,
            "title": cache.title,
            "subject": cache.subject,
            "published": exp.published,
            "session_count": session_count,
            "created_at": exp.created_at.isoformat(),
        }
        for exp, cache, session_count in rows
    ]

