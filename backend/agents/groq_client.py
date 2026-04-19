"""
Shared Groq client for the backend.
Initializes a single Groq client using the `groq_api_key` from settings.
"""
from groq import Groq

from config import settings


groq_client = Groq(api_key=settings.groq_api_key)
