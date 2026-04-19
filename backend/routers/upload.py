"""
Upload router — triggers the full generation pipeline.
POST /api/upload  → hash check → generate (if miss) → store → return experiment
"""
import asyncio
import logging
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from database import get_db
from models import Experiment, ExperimentCache, Teacher
from agents.generator import generate_experiment
from agents.quiz_gen import generate_quiz
from utils.auth import get_current_teacher
from utils.doc_parser import extract_text
from utils.hasher import hash_document

router = APIRouter()
logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".webp"}
ALLOWED_SUBJECTS = {"physics", "chemistry"}


@router.post("", status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    subject: str = Form(...),
    db: AsyncSession = Depends(get_db),
    teacher: Teacher = Depends(get_current_teacher),
):
    # ── Validate input ────────────────────────────────────────────────────
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"File type {ext} not supported. Use PDF or image.")

    if subject.lower() not in ALLOWED_SUBJECTS:
        raise HTTPException(400, f"Subject must be one of: {ALLOWED_SUBJECTS}")

    content = await file.read()

    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(400, f"File too large. Maximum size is {settings.max_upload_size_mb}MB.")

    # ── Cache check ───────────────────────────────────────────────────────
    doc_hash = hash_document(content)
    result = await db.execute(
        select(ExperimentCache).where(ExperimentCache.document_hash == doc_hash)
    )
    cached = result.scalar_one_or_none()

    if cached:
        logger.info(f"Cache HIT for hash {doc_hash[:12]}...")
        # Create an experiment record pointing to cache if teacher doesn't have one yet
        existing = await db.execute(
            select(Experiment).where(
                Experiment.teacher_id == teacher.id,
                Experiment.cache_id == cached.id,

            )
        )
        exp = existing.scalar_one_or_none()
        if not exp:
            exp = Experiment(teacher_id=teacher.id, cache_id=cached.id, published=True)
            db.add(exp)
            await db.flush()
            await db.commit()

        return {
            "cache_hit": True,
            "experiment_id": exp.id,
            "title": cached.title,
            "subject": cached.subject,
            "component_url": cached.component_url,
        }

    # ── Cache MISS — run generation pipeline ─────────────────────────────
    logger.info(f"Cache MISS for hash {doc_hash[:12]}... Starting generation.")

    # Extract text from document
    try:
        document_text = extract_text(content, file.filename)
    except Exception as e:
        raise HTTPException(422, f"Could not extract text from document: {e}")

    if len(document_text.strip()) < 100:
        raise HTTPException(422, "Document text is too short. Check that the file contains readable content.")

    # Run experiment generation and quiz generation in parallel
    try:
        (html_code, title), quiz_questions = await asyncio.gather(
            generate_experiment(document_text, subject),
            generate_quiz(document_text),
        )
    except RuntimeError as e:
        raise HTTPException(500, f"Generation failed: {e}")

    # Upload component code to Supabase Storage
    from supabase import create_client
    supabase = create_client(settings.supabase_url, settings.supabase_service_key)

    component_filename = f"experiments/components/{doc_hash}.html"
    try:
        supabase.storage.from_("bina-experiments").upload(
            path=component_filename,
            file=html_code.encode("utf-8"),
            file_options={"content-type": "text/html"},
        )
        #component_url = f'http://localhost:8000/api/experiments/component/{doc_hash}.html'
        component_url = f'https://bina-demo-production.up.railway.app/api/experiments/component/{doc_hash}.html'
    except Exception as e:
        raise HTTPException(500, f"Storage upload failed: {e}")

    # Upload source document
    source_filename = f"uploads/raw/{doc_hash}{ext}"
    try:
        supabase.storage.from_("bina-experiments").upload(
            path=source_filename,
            file=content,
            file_options={"content-type": file.content_type},
        )
        source_doc_url = supabase.storage.from_("bina-experiments").get_public_url(source_filename)
    except Exception as e:
        raise HTTPException(500, f"Source document storage failed: {e}")

    # Write cache row + experiment row in one transaction (ACID)
    cache_entry = ExperimentCache(
        document_hash=doc_hash,
        document_text=document_text,
        component_url=component_url,
        quiz_json=quiz_questions,
        subject=subject.lower(),
        title=title,
        source_doc_url=source_doc_url,
    )
    db.add(cache_entry)
    await db.flush()  # get cache_entry.id

    exp = Experiment(teacher_id=teacher.id, cache_id=cache_entry.id, published=True)
    db.add(exp)
    await db.flush()

    logger.info(f"Generation complete. Experiment ID: {exp.id}, Title: {title}")

    await db.commit()

    return {
        "cache_hit": False,
        "experiment_id": exp.id,
        "title": title,
        "subject": subject.lower(),
        "component_url": component_url,
    }
