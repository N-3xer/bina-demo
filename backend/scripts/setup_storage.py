"""
Run this once to create the Supabase Storage bucket and RLS policies.
Run after your Supabase project is created.

    python scripts/setup_storage.py
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from supabase import create_client
from config import settings


def setup():
    supabase = create_client(settings.supabase_url, settings.supabase_service_key)

    # Create bucket (public read, authenticated write)
    try:
        supabase.storage.create_bucket(
            "bina-experiments",
            options={
                "public": True,
                "file_size_limit": 10 * 1024 * 1024,  # 10MB
                "allowed_mime_types": [
                    "application/pdf",
                    "image/png",
                    "image/jpeg",
                    "image/webp",
                    "text/javascript",
                    "application/json",
                ],
            },
        )
        print("✓ Created bucket: bina-experiments")
    except Exception as e:
        if "already exists" in str(e).lower():
            print("⚠ Bucket already exists — skipping")
        else:
            raise

    print("\nStorage setup complete.")
    print("Next: run python data/seed.py to seed the experiment library.")


if __name__ == "__main__":
    setup()
