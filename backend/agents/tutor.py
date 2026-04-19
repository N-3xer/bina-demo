"""
Agent 2 — AI Tutor
Uses Groq (Llama 3.3 70B) to answer student questions grounded
in the source experiment document.
"""
import logging

from groq import Groq

from config import settings

logger = logging.getLogger(__name__)

groq_client = Groq(api_key=settings.groq_api_key)

SYSTEM_TEMPLATE = """You are Bina, a friendly and knowledgeable science tutor helping a Kenyan secondary school student.

Your answers must be:
- Grounded ONLY in the experiment document provided below — do not use outside knowledge
- Clear and simple enough for a Form 1-4 student to understand
- Concise — 2 to 4 sentences maximum
- Encouraging and patient in tone
- In English

If the question is not related to the experiment, politely say you can only help with this specific experiment.

EXPERIMENT DOCUMENT:
{document_text}
"""


async def ask_tutor(
    question: str,
    document_text: str,
    conversation_history: list[dict],
) -> str:
    """
    Returns the tutor's answer as a string.
    conversation_history is a list of {"role": "user"|"assistant", "content": "..."} dicts.
    Keep last 6 pairs max to stay within context limits.
    """
    system_prompt = SYSTEM_TEMPLATE.format(document_text=document_text[:6000])

    # Keep only last 12 messages (6 pairs)
    recent_history = conversation_history[-12:] if len(conversation_history) > 12 else conversation_history

    messages = [
        {"role": "system", "content": system_prompt},
        *recent_history,
        {"role": "user", "content": question},
    ]

    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=512,
            temperature=0.3,
        )
        answer = response.choices[0].message.content.strip()
        logger.info(f"Tutor answered question ({len(question)} chars)")
        return answer

    except Exception as e:
        logger.error(f"Groq tutor error: {e}")
        raise RuntimeError(f"Tutor unavailable: {e}")
