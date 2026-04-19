from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import engine, Base
from routers import auth, experiments, upload, tutor, quiz


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables if they don't exist
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown: dispose engine
    await engine.dispose()


app = FastAPI(
    title="Bina API",
    description="Virtual Science Labs for Kenyan Secondary Schools",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    # Hardcoded origins to avoid env parsing issues with FRONTEND_URLS
    allow_origins=[
        "https://bina-demo-git-main-adre-institute.vercel.app",
        "https://bina-demo-chi.vercel.app",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(experiments.router, prefix="/api/experiments", tags=["experiments"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])
app.include_router(tutor.router, prefix="/api/tutor", tags=["tutor"])
app.include_router(quiz.router, prefix="/api/quiz", tags=["quiz"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "bina-api"}
