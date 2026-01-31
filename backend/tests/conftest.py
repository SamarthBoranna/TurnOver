import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    """Create a test client for the FastAPI application"""
    return TestClient(app)


@pytest.fixture
def auth_headers():
    """
    Fixture to provide authentication headers for tests.
    In real tests, you would create a test user and get a real token.
    """
    # TODO: Implement proper test authentication
    return {"Authorization": "Bearer test-token"}
