"""
DEVNEXUS TECH — Server-Side Appwrite Database Sync Service.
Uses APPWRITE_API_KEY strictly on the backend to mirror inquiries/records to Appwrite Collections when configured.
"""

import json
import requests

from server.config import Config, _is_real_secret


def is_appwrite_server_configured() -> bool:
    return bool(
        _is_real_secret(Config.APPWRITE_ENDPOINT)
        and _is_real_secret(Config.APPWRITE_PROJECT_ID)
        and _is_real_secret(Config.APPWRITE_API_KEY)
        and Config.APPWRITE_DATABASE_ID
    )


def _headers() -> dict:
    return {
        "X-Appwrite-Project": Config.APPWRITE_PROJECT_ID,
        "X-Appwrite-Key": Config.APPWRITE_API_KEY,
        "Content-Type": "application/json",
    }


def sync_document_to_appwrite(collection_id: str, document_id: str, data: dict, permissions: list[str] | None = None) -> dict:
    """Creates or updates a document in Appwrite Database via official REST API."""
    if not is_appwrite_server_configured():
        return {"synced": False, "configured": False, "detail": "Appwrite server API key pending configuration."}

    url = (
        f"{Config.APPWRITE_ENDPOINT}/databases/{Config.APPWRITE_DATABASE_ID}"
        f"/collections/{collection_id}/documents"
    )
    payload = {
        "documentId": str(document_id),
        "data": data,
    }
    if permissions:
        payload["permissions"] = permissions

    try:
        res = requests.post(url, headers=_headers(), json=payload, timeout=8)
        if res.status_code == 409:
            patch_url = f"{url}/{document_id}"
            res = requests.patch(patch_url, headers=_headers(), json={"data": data}, timeout=8)
        if res.ok:
            return {"synced": True, "configured": True, "document_id": res.json().get("$id")}
        return {"synced": False, "configured": True, "detail": f"Appwrite HTTP {res.status_code}: {res.text[:200]}"}
    except requests.RequestException as exc:
        return {"synced": False, "configured": True, "detail": str(exc)}


def sync_inquiry_to_appwrite(inquiry) -> dict:
    doc_data = {
        "localId": inquiry.id,
        "userId": inquiry.user_id or "",
        "fullName": inquiry.full_name,
        "email": inquiry.email,
        "phone": inquiry.phone or "",
        "companyName": inquiry.company_name or "",
        "country": inquiry.country,
        "projectType": inquiry.project_type,
        "budget": inquiry.budget,
        "timeline": inquiry.timeline or "",
        "message": inquiry.message[:2000],
        "status": inquiry.status,
        "createdAt": inquiry.created_at.isoformat() if inquiry.created_at else "",
    }
    perms = [f'read("user:{inquiry.user_id}")'] if inquiry.user_id else None
    return sync_document_to_appwrite(
        Config.APPWRITE_COLLECTION_INQUIRIES,
        f"inq_{inquiry.id}",
        doc_data,
        permissions=perms,
    )


def test_appwrite_connection() -> dict:
    if not is_appwrite_server_configured():
        return {"ok": False, "configured": False, "detail": "APPWRITE_PROJECT_ID or APPWRITE_API_KEY missing."}
    try:
        res = requests.get(
            f"{Config.APPWRITE_ENDPOINT}/databases/{Config.APPWRITE_DATABASE_ID}",
            headers=_headers(),
            timeout=8,
        )
        if res.ok:
            return {"ok": True, "configured": True, "database": res.json().get("name")}
        return {"ok": False, "configured": True, "detail": f"Appwrite HTTP {res.status_code}: {res.text[:200]}"}
    except requests.RequestException as exc:
        return {"ok": False, "configured": True, "detail": str(exc)}
