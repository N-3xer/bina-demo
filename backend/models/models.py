"""
All SQLAlchemy models in one file for MVP simplicity.
Split into separate files as the schema grows.
"""
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


def gen_uuid():
    return str(uuid.uuid4())


class Teacher(Base):
    __tablename__ = "teachers"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    school_name: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    experiments: Mapped[list["Experiment"]] = relationship("Experiment", back_populates="teacher", cascade="all, delete-orphan")


class ExperimentCache(Base):
    """
    The core cache table. One row per unique document.
    document_hash unique constraint ensures only one generation per doc.
    """
    __tablename__ = "experiment_cache"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    document_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False, index=True)
    component_url: Mapped[str] = mapped_column(Text, nullable=False)
    quiz_json: Mapped[dict] = mapped_column(JSONB, nullable=False)
    subject: Mapped[str] = mapped_column(String(20), nullable=False)  # physics | chemistry
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    source_doc_url: Mapped[str] = mapped_column(Text, nullable=False)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    generation_attempts: Mapped[int] = mapped_column(Integer, default=1)
    document_text: Mapped[str | None] = mapped_column(Text, nullable=True)  # store original text for analytics and potential future features

    experiments: Mapped[list["Experiment"]] = relationship("Experiment", back_populates="cache")


class Experiment(Base):
    """
    A teacher's published experiment — points to a cached component.
    """
    __tablename__ = "experiments"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    teacher_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("teachers.id", ondelete="CASCADE"), nullable=False)
    cache_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("experiment_cache.id"), nullable=False)
    published: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    teacher: Mapped["Teacher"] = relationship("Teacher", back_populates="experiments")
    cache: Mapped["ExperimentCache"] = relationship("ExperimentCache", back_populates="experiments")
    sessions: Mapped[list["StudentSession"]] = relationship("StudentSession", back_populates="experiment", cascade="all, delete-orphan")


class StudentSession(Base):
    """
    Anonymous student session — no login required for MVP.
    """
    __tablename__ = "student_sessions"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    experiment_id: Mapped[str] = mapped_column(UUID(as_uuid=False), ForeignKey("experiments.id"), nullable=False)
    session_token: Mapped[str] = mapped_column(String(64), nullable=False)
    quiz_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    experiment: Mapped["Experiment"] = relationship("Experiment", back_populates="sessions")
