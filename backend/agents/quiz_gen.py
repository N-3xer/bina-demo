"""
Agent 3 — Quiz Generator
Uses Gemini 1.5 Flash to generate 5 multiple-choice questions
from the experiment document. Runs in parallel with Agent 1.
"""
import json
import logging

from agents.groq_client import groq_client
from pydantic import BaseModel, ValidationError

from config import settings

logger = logging.getLogger(__name__)



class QuizQuestion(BaseModel):
    question: str
    options: list[str]       # exactly 4 options
    correct_index: int       # 0-3
    explanation: str


class QuizResult(BaseModel):
    questions: list[QuizQuestion]


QUIZ_PROMPT = """You are a science teacher creating a short quiz for Kenyan secondary school students.

Based on the experiment document below, generate exactly 5 multiple-choice questions.

RULES:
1. Return ONLY a valid JSON object — no markdown, no explanation
2. Format: {"questions": [{"question": "...", "options": ["A","B","C","D"], "correct_index": 0, "explanation": "..."}]}
3. Each question must have exactly 4 options
4. correct_index is 0-based (0=A, 1=B, 2=C, 3=D)
5. Questions must test understanding, not just recall
6. Use simple, clear English appropriate for Form 1-4 students
7. Explanation must be one sentence explaining why the answer is correct

Document:
"""


async def generate_quiz(document_text: str) -> list[dict]:
    """
    Returns a list of 5 quiz question dicts.
    Retries once on parse failure.
    Raises RuntimeError if both attempts fail.
    """
    prompt = QUIZ_PROMPT + document_text

    for attempt in range(1, 3):
        try:
            response = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "system", "content": ""}, {"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=8000,
            )
            # follow replacement rule: response.text -> response.choices[0].message.content
            text = response.choices[0].message.content.strip()

            # Strip markdown fences
            if text.startswith("```"):
                lines = text.split("\n")
                text = "\n".join(lines[1:-1]) if lines[-1].strip() == "```" else "\n".join(lines[1:])

            data = json.loads(text)
            quiz = QuizResult(**data)

            if len(quiz.questions) != 5:
                raise ValueError(f"Expected 5 questions, got {len(quiz.questions)}")

            logger.info(f"Quiz generated on attempt {attempt}")
            return [q.model_dump() for q in quiz.questions]

        except (json.JSONDecodeError, ValidationError, ValueError) as e:
            logger.warning(f"Quiz generation attempt {attempt} failed: {e}")
            if attempt == 2:
                raise RuntimeError(f"Quiz generation failed: {e}")

    raise RuntimeError("Quiz generation failed after 2 attempts")
