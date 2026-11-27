"""
DEVNEXUS TECH — Authentication Verification & Profile Sync Routes.
Cryptographically verifies Appwrite JWT sessions server-side and syncs ClientRecord safely.
"""

from flask import Blueprint, request, jsonify

from server.config import Config, _is_real_secret
from server.models import db, ClientRecord
from server.security import verify_appwrite_jwt, sanitize_text, log_audit, rate_limit
from server.services.appwrite_service import sync_document_to_appwrite

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/config", methods=["GET"])
def auth_config():
    return jsonify({
        "appwrite_configured": bool(
            _is_real_secret(Config.APPWRITE_ENDPOINT) and _is_real_secret(Config.APPWRITE_PROJECT_ID)
        ),
        "endpoint": Config.APPWRITE_ENDPOINT if _is_real_secret(Config.APPWRITE_PROJECT_ID) else None,
        "project_id": Config.APPWRITE_PROJECT_ID if _is_real_secret(Config.APPWRITE_PROJECT_ID) else None,
        "google_oauth_supported": True,
        "email_password_supported": True,
    }), 200


@auth_bp.route("/session", methods=["POST"])
@rate_limit(max_requests=30, window_seconds=60, scope="auth_session")
def sync_authenticated_session():
    """
    Validates an Appwrite JWT sent by the browser after Google OAuth or Email login.
    Returns authoritative server role ('client' or 'admin') — never trusts client-supplied role.
    """
    body = request.get_json(silent=True) or {}
    jwt_token = body.get("jwt") or request.headers.get("X-Appwrite-JWT") or ""
    if not jwt_token and request.headers.get("Authorization", "").lower().startswith("bearer "):
        jwt_token = request.headers.get("Authorization", "")[7:].strip()

    user, err = verify_appwrite_jwt(jwt_token)
    if not user:
        return jsonify({"success": False, "error": err or "Invalid Appwrite session."}), 401

    provider = sanitize_text(body.get("provider") or "appwrite", 40)
    avatar_url = sanitize_text(body.get("avatar_url") or "", 500)

    client_rec = ClientRecord.query.filter(
        (ClientRecord.appwrite_user_id == user["id"]) | (ClientRecord.email == user["email"])
    ).first()

    if not client_rec:
        client_rec = ClientRecord(
            appwrite_user_id=user["id"],
            full_name=user["name"] or user["email"].split("@")[0],
            email=user["email"],
            auth_provider=provider,
            avatar_url=avatar_url or None,
        )
        db.session.add(client_rec)
    else:
        client_rec.appwrite_user_id = user["id"]
        if user["name"]:
            client_rec.full_name = user["name"]
        if provider:
            client_rec.auth_provider = provider
        if avatar_url:
            client_rec.avatar_url = avatar_url

    db.session.commit()

    sync_document_to_appwrite(
        Config.APPWRITE_COLLECTION_PROFILES,
        user["id"],
        {
            "userId": user["id"],
            "fullName": client_rec.full_name,
            "email": client_rec.email,
            "authProvider": client_rec.auth_provider,
            "role": user["role"],
        },
        permissions=[f'read("user:{user["id"]}")', f'update("user:{user["id"]}")'],
    )

    log_audit("auth_session_verified", "auth/session", {"provider": provider, "role": user["role"]}, actor=user)

    return jsonify({
        "success": True,
        "user": {
            **user,
            "auth_provider": client_rec.auth_provider,
            "avatar_url": client_rec.avatar_url,
        },
    }), 200
