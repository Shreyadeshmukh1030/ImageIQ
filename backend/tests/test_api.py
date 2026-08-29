from fastapi.testclient import TestClient
import os
import sys

# Add project root to path
base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.append(base_dir)

from backend.app.main import app
from backend.app.models.database import init_db

client = TestClient(app)

def setup_module(module):
    init_db()

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "message": "ImageIQ API is running."}

def test_history_empty():
    response = client.get("/api/history")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_analyze_invalid_extension():
    # Attempt to upload a text file
    response = client.post(
        "/api/analyze",
        files={"file": ("test.txt", b"hello world", "text/plain")}
    )
    assert response.status_code == 400
    assert "Invalid file type" in response.json()["detail"]
