import hashlib


def hash_document(content: bytes) -> str:
    """SHA-256 hash of raw document bytes. Used as the cache key."""
    return hashlib.sha256(content).hexdigest()
