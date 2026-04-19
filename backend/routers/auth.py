from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr,Field, validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import Teacher
from utils.auth import create_access_token, hash_password, verify_password, get_current_teacher

router = APIRouter()


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=72)  
    school_name: str

    @validator('password')
    def validate_password_length(cls, v):
        if len(v.encode('utf-8')) > 72:
            raise ValueError('Password cannot exceed 72 bytes (bcrypt limit)')
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TeacherResponse(BaseModel):
    id: str
    email: str
    school_name: str


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Teacher).where(Teacher.email == payload.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    teacher = Teacher(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        school_name=payload.school_name,
    )
    db.add(teacher)
    await db.flush()  # get the ID before commit

    token = create_access_token(teacher.id)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Teacher).where(Teacher.email == payload.email))
    teacher = result.scalar_one_or_none()

    if not teacher or not verify_password(payload.password, teacher.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(teacher.id)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=TeacherResponse)
async def me(teacher: Teacher = Depends(get_current_teacher)):
    return TeacherResponse(id=teacher.id, email=teacher.email, school_name=teacher.school_name)
