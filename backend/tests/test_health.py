import httpx
import os

# Smoke tests for the deployed backend — run with: pytest tests/ -v
# Set API_URL env var to test production: API_URL=https://your-railway-url pytest tests/ -v

BASE_URL = os.getenv("API_URL", "http://localhost:8000")

def test_health():
    r = httpx.get(f"{BASE_URL}/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"

def test_generate_requires_auth():
    r = httpx.post(f"{BASE_URL}/api/generate", json={})
    assert r.status_code == 401

def test_bulk_generate_requires_auth():
    r = httpx.post(f"{BASE_URL}/api/bulk/generate", json={})
    assert r.status_code == 401

def test_bulk_send_requires_auth():
    r = httpx.post(f"{BASE_URL}/api/bulk/send", json={})
    assert r.status_code == 401

def test_applications_requires_auth():
    r = httpx.get(f"{BASE_URL}/api/applications")
    assert r.status_code == 401

def test_send_email_requires_auth():
    r = httpx.post(f"{BASE_URL}/api/send-email", json={})
    assert r.status_code == 401
