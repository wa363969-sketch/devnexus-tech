"""
DEVNEXUS TECH — Backend API & Security Verification Suite.
Tests public endpoints, input validation, honeypot, admin RBAC, honest unconfigured provider states,
HMAC webhook security, and database CRUD using an isolated temporary SQLite database.
"""

import hmac
import hashlib
import json
import os
import tempfile
from unittest.mock import patch
import pytest

# Isolate test DB before importing server.app
_TMP_DB = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
_TMP_DB.close()
os.environ["DATABASE_URL"] = f"sqlite:///{_TMP_DB.name}"
os.environ["ADMIN_API_KEY"] = "test-admin-key-devnexus"
os.environ["FLASK_ENV"] = "testing"

from server.app import app  # noqa: E402
from server.config import Config  # noqa: E402


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as test_client:
        yield test_client


def test_health_and_bootstrap(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    body = res.get_json()
    assert body["company"] == "DEVNEXUS TECH"
    assert body["database"] == "connected"

    boot = client.get("/api/public/bootstrap")
    assert boot.status_code == 200
    bdata = boot.get_json()
    assert len(bdata["services"]) == 9
    assert len(bdata["portfolio"]) == 5
    assert all(t["is_demo"] is True for t in bdata["testimonials"])


def test_portfolio_detail_and_404(client):
    ok_res = client.get("/api/portfolio/enterprise-logistics-portal")
    assert ok_res.status_code == 200
    assert ok_res.get_json()["project"]["is_concept"] is True

    miss = client.get("/api/portfolio/nonexistent-project")
    assert miss.status_code == 404


def test_contact_validation_honeypot_and_persistence(client):
    bad = client.post("/api/contact", json={"full_name": "A", "email": "bad", "message": "short"})
    assert bad.status_code == 400
    assert "errors" in bad.get_json()

    bot = client.post("/api/contact", json={"_gotcha": "spam-bot", "full_name": "Bot"})
    assert bot.status_code == 200

    good = client.post(
        "/api/contact",
        json={
            "full_name": "Test Client",
            "email": "client@example.com",
            "phone": "+92 300 0000000",
            "company_name": "Test Corp",
            "country": "Pakistan",
            "project_type": "AI Automation",
            "budget": "$1,500 – $3,500 USD",
            "message": "Need an n8n workflow and Appwrite client portal built cleanly.",
        },
    )
    assert good.status_code == 201
    data = good.get_json()
    assert data["success"] is True
    assert isinstance(data["inquiry_id"], int)
    assert data["integrations"]["database"]["saved"] is True


def test_admin_rbac_rejects_unauthenticated_and_non_admin_jwt(client):
    assert client.get("/api/admin/analytics").status_code == 401
    assert client.get("/api/admin/analytics", headers={"X-Admin-Key": "wrong-key"}).status_code == 403

    # Simulated verified Google client user MUST NOT gain admin access
    with patch("server.security.verify_appwrite_jwt", return_value=({"id": "u1", "email": "user@gmail.com", "role": "client", "is_admin": False}, None)):
        res = client.get("/api/admin/analytics", headers={"X-Appwrite-JWT": "valid-client-jwt"})
        assert res.status_code == 403

    # Valid Admin API Key succeeds
    ok = client.get("/api/admin/analytics", headers={"X-Admin-Key": "test-admin-key-devnexus"})
    assert ok.status_code == 200
    assert ok.get_json()["overview"]["total_inquiries"] >= 1


def test_client_dashboard_scoped_to_authenticated_user(client):
    assert client.get("/api/client/dashboard").status_code == 401

    with patch("server.security.verify_appwrite_jwt", return_value=({"id": "u99", "name": "Google User", "email": "client@example.com", "role": "client", "is_admin": False}, None)):
        dash = client.get("/api/client/dashboard", headers={"X-Appwrite-JWT": "valid-jwt"})
        assert dash.status_code == 200
        inquiries = dash.get_json()["inquiries"]
        assert all(i["email"] == "client@example.com" for i in inquiries)


def test_honest_unconfigured_ai_and_payments(client):
    ai_res = client.post("/api/ai/chat", json={"message": "Tell me about DEVNEXUS TECH"})
    assert ai_res.status_code == 200
    ai_json = ai_res.get_json()
    if not Config.OPENAI_API_KEY and not Config.GEMINI_API_KEY:
        assert ai_json["configured"] is False
        assert ai_json["mode"] == "pending_configuration"

    # Admin creates an invoice, then unconfigured Stripe checkout refuses with 422 (never fakes success)
    inv_res = client.post(
        "/api/admin/invoices",
        headers={"X-Admin-Key": "test-admin-key-devnexus"},
        json={"client_email": "client@example.com", "client_name": "Test Client", "description": "Milestone 1", "amount": 500, "currency": "USD"},
    )
    assert inv_res.status_code == 201
    inv_id = inv_res.get_json()["invoice"]["id"]

    with patch("server.security.verify_appwrite_jwt", return_value=({"id": "u99", "email": "client@example.com", "role": "client", "is_admin": False}, None)):
        chk = client.post(
            "/api/payments/checkout",
            headers={"X-Appwrite-JWT": "valid-jwt"},
            json={"invoice_id": inv_id, "provider": "stripe"},
        )
        if not Config.STRIPE_SECRET_KEY:
            assert chk.status_code == 422
            assert chk.get_json()["configured"] is False


def test_webhook_hmac_verification(client):
    # Invalid Stripe signature rejected
    assert client.post("/api/webhooks/stripe", data=b"{}", headers={"Stripe-Signature": "t=1,v1=bad"}).status_code == 401

    # Valid n8n inbound signature works when secret is set
    with patch.object(Config, "N8N_INBOUND_SECRET", "n8n-secret-123"):
        payload = json.dumps({"action": "ping"}).encode("utf-8")
        sig = hmac.new(b"n8n-secret-123", payload, hashlib.sha256).hexdigest()
        bad_n8n = client.post("/api/webhooks/n8n", data=payload, headers={"X-Devnexus-Signature": "sha256=wrong"})
        assert bad_n8n.status_code == 401
        ok_n8n = client.post(
            "/api/webhooks/n8n",
            data=payload,
            content_type="application/json",
            headers={"X-Devnexus-Signature": f"sha256={sig}"},
        )
        assert ok_n8n.status_code == 200
