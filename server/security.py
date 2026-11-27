"""
DEVNEXUS TECH — Security Middleware, Rate Limiting, Auth Verification & Audit Logging.
"""

import hmac
import hashlib
import json
import re
import time
import threading
from collections import defaultdict, deque
from functools import wraps
import requests
from flask import request, jsonify, g

from server.config import Config
from server.models import db, AuditLog

EMAIL_REGEX = re.compile(r"^[\w.+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$")

# Thread-safe sliding window rate limiter
_rate_lock = threading.Lock()
_rate_buckets: dict[str, deque[float]] = defaultdict(deque)


def get_client_ip() -> str:
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.remote_addr or "unknown"


def sanitize_text(value, max_len: int = 2000) -> str:
    if value is None:
        return ""
    text = str(value).strip()
    # Strip null bytes and non-printable control characters except newlines/tabs
    text = "".join(ch for ch in text if ch in ("\n", "\r", "\t") or ord(ch) >= 32)
    return text[:max_len]


def is_valid_email(email: str) -> bool:
    return bool(email and len(email) <= 150 and EMAIL_REGEX.match(email))


def rate_limit(max_requests: int = 30, window_seconds: int = 60, scope: str = "global"):
    """Decorator enforcing per-IP sliding window rate limits."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            now = time.time()
            ip = get_client_ip()
            key = f"{scope}:{ip}"
            with _rate_lock:
                bucket = _rate_buckets[key]
                cutoff = now - window_seconds
                while bucket and bucket[0] < cutoff:
                    bucket.popleft()
                if len(bucket) >= max_requests:
                    retry_after = int(max(1, window_seconds - (now - bucket[0])))
                    resp = jsonify({
                        "success": False,
                        "message": "Rate limit exceeded. Please wait before retrying.",
                        "retry_after_seconds": retry_after,
                    })
                    resp.status_code = 429
                    resp.headers["Retry-After"] = str(retry_after)
                    return resp
                bucket.append(now)
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def log_audit(action: str, resource: str, details: dict | None = None, actor: dict | None = None):
    """Persists security-sensitive events to the AuditLog table."""
    try:
        user = actor or getattr(g, "current_user", None) or {}
        entry = AuditLog(
            actor_id=user.get("id"),
            actor_email=user.get("email"),
            actor_role=user.get("role", "anonymous"),
            action=action[:100],
            resource=resource[:120],
            details_json=json.dumps(details or {}),
            ip_address=get_client_ip()[:50],
        )
        db.session.add(entry)
        db.session.commit()
    except Exception as exc:
        db.session.rollback()
        print(f"[AuditLog warning] Failed to write audit entry: {exc}")


def _extract_jwt() -> str:
    auth_header = request.headers.get("Authorization", "")
    if auth_header.lower().startswith("bearer "):
        return auth_header[7:].strip()
    return request.headers.get("X-Appwrite-JWT", "").strip()


def _check_appwrite_admin_team(user_id: str) -> bool:
    if not (Config.APPWRITE_ENDPOINT and Config.APPWRITE_PROJECT_ID and Config.APPWRITE_API_KEY and Config.APPWRITE_ADMIN_TEAM_ID):
        return False
    try:
        url = f"{Config.APPWRITE_ENDPOINT}/teams/{Config.APPWRITE_ADMIN_TEAM_ID}/memberships"
        res = requests.get(
            url,
            headers={
                "X-Appwrite-Project": Config.APPWRITE_PROJECT_ID,
                "X-Appwrite-Key": Config.APPWRITE_API_KEY,
            },
            timeout=6,
        )
        if not res.ok:
            return False
        memberships = res.json().get("memberships", [])
        return any(m.get("userId") == user_id and m.get("confirm") for m in memberships)
    except Exception:
        return False


def verify_appwrite_jwt(jwt_token: str) -> tuple[dict | None, str | None]:
    """
    Verifies a frontend Appwrite JWT cryptographically via Appwrite's /account endpoint.
    Determines admin privileges ONLY from server-trusted signals:
      1. Appwrite user label 'admin' (set only via Appwrite Console/Server API)
      2. Appwrite Admin Team membership (APPWRITE_ADMIN_TEAM_ID)
      3. Server-side ADMIN_EMAILS allowlist (requires verified email)
    Never grants admin access automatically to Google sign-in users or client-supplied role params.
    """
    if not jwt_token:
        return None, "Missing authentication token."
    if not (Config.APPWRITE_ENDPOINT and Config.APPWRITE_PROJECT_ID):
        return None, "Appwrite server environment is not configured."

    try:
        res = requests.get(
            f"{Config.APPWRITE_ENDPOINT}/account",
            headers={
                "X-Appwrite-Project": Config.APPWRITE_PROJECT_ID,
                "X-Appwrite-JWT": jwt_token,
            },
            timeout=8,
        )
        if res.status_code == 401:
            return None, "Invalid or expired session token."
        if not res.ok:
            return None, f"Appwrite verification returned HTTP {res.status_code}."

        account_data = res.json()
        user_id = account_data.get("$id", "")
        email = (account_data.get("email") or "").strip().lower()
        email_verified = bool(account_data.get("emailVerification", False))
        labels = [str(l).lower() for l in (account_data.get("labels") or [])]

        is_admin = (
            "admin" in labels
            or _check_appwrite_admin_team(user_id)
            or (email_verified and email in Config.ADMIN_EMAILS)
        )

        return {
            "id": user_id,
            "name": account_data.get("name", ""),
            "email": email,
            "email_verified": email_verified,
            "labels": labels,
            "role": "admin" if is_admin else "client",
            "is_admin": is_admin,
        }, None
    except requests.RequestException as exc:
        return None, f"Could not reach Appwrite authentication endpoint: {exc}"


def require_auth(fn):
    """Requires a valid Appwrite user JWT."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        jwt_token = _extract_jwt()
        user, err = verify_appwrite_jwt(jwt_token)
        if not user:
            return jsonify({"success": False, "error": err or "Authentication required."}), 401
        g.current_user = user
        return fn(*args, **kwargs)
    return wrapper


def require_admin(fn):
    """
    Requires either:
      - A server-verified Appwrite JWT whose user has authoritative admin status, OR
      - A matching server-configured X-Admin-Key header (constant-time comparison).
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        provided_key = request.headers.get("X-Admin-Key", "").strip()
        if provided_key and Config.ADMIN_API_KEY:
            if hmac.compare_digest(provided_key, Config.ADMIN_API_KEY):
                g.current_user = {
                    "id": "admin-key",
                    "name": "System Administrator",
                    "email": "admin@devnexustech.com",
                    "role": "admin",
                    "is_admin": True,
                }
                return fn(*args, **kwargs)
            log_audit("admin_auth_failed", request.path, {"reason": "invalid_admin_key"})
            return jsonify({"success": False, "error": "Invalid admin credentials."}), 403

        jwt_token = _extract_jwt()
        if jwt_token:
            user, err = verify_appwrite_jwt(jwt_token)
            if not user:
                return jsonify({"success": False, "error": err or "Invalid session."}), 401
            if not user.get("is_admin"):
                log_audit("admin_access_denied", request.path, {"email": user.get("email")}, actor=user)
                return jsonify({
                    "success": False,
                    "error": "Forbidden. Administrator role required.",
                }), 403
            g.current_user = user
            return fn(*args, **kwargs)

        return jsonify({
            "success": False,
            "error": "Administrator authentication required (verified Appwrite admin session or valid X-Admin-Key).",
        }), 401
    return wrapper


def verify_hmac_signature(payload_bytes: bytes, signature: str, secret: str) -> bool:
    if not (secret and signature):
        return False
    cleaned = signature.replace("sha256=", "").strip()
    expected = hmac.new(secret.encode("utf-8"), payload_bytes, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, cleaned)


def apply_security_headers(response):
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("X-XSS-Protection", "1; mode=block")
    return response
