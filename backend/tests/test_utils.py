"""
Basic test suite — expand as you build.
Run: pytest tests/ -v
"""
import pytest
from utils.hasher import hash_document
from utils.validator import validate_jsx


def test_hash_document_is_deterministic():
    content = b"hello world"
    assert hash_document(content) == hash_document(content)


def test_hash_document_different_for_different_content():
    assert hash_document(b"abc") != hash_document(b"xyz")


def test_hash_document_is_64_chars():
    result = hash_document(b"test")
    assert len(result) == 64


def test_validate_jsx_valid():
    code = """
export default function Experiment() {
  return (
    <div>
      <h1>Test</h1>
    </div>
  );
}
"""
    is_valid, error = validate_jsx(code)
    assert is_valid, error


def test_validate_jsx_missing_export():
    code = """
function Experiment() {
  return (<div>Hello</div>);
}
"""
    is_valid, error = validate_jsx(code)
    assert not is_valid
    assert "export" in error.lower() or "Missing required pattern" in error


def test_validate_jsx_empty():
    is_valid, error = validate_jsx("")
    assert not is_valid


def test_validate_jsx_too_short():
    is_valid, error = validate_jsx("hi")
    assert not is_valid
