"""
DEVNEXUS TECH — Authenticated Client Dashboard APIs.
Strictly scoped to g.current_user['id'] and g.current_user['email'].
"""

from flask import Blueprint, jsonify, g, request

from server.models import db, Inquiry, ProjectRecord, Invoice, ClientRecord, CommunicationLog
from server.security import require_auth, sanitize_text

client_bp = Blueprint("client_portal", __name__, url_prefix="/api/client")


@client_bp.route("/dashboard", methods=["GET"])
@require_auth
def get_client_dashboard():
    user = g.current_user
    uid = user["id"]
    email = user["email"]

    inquiries = (
        Inquiry.query.filter((Inquiry.user_id == uid) | (Inquiry.email == email))
        .order_by(Inquiry.created_at.desc())
        .all()
    )
    projects = (
        ProjectRecord.query.filter((ProjectRecord.appwrite_user_id == uid) | (ProjectRecord.client_email == email))
        .order_by(ProjectRecord.updated_at.desc())
        .all()
    )
    invoices = (
        Invoice.query.filter(Invoice.client_email == email)
        .order_by(Invoice.created_at.desc())
        .all()
    )
    notifications = (
        CommunicationLog.query.filter(CommunicationLog.client_email == email)
        .order_by(CommunicationLog.created_at.desc())
        .limit(15)
        .all()
    )
    client_rec = ClientRecord.query.filter(
        (ClientRecord.appwrite_user_id == uid) | (ClientRecord.email == email)
    ).first()

    return jsonify({
        "success": True,
        "profile": client_rec.to_dict() if client_rec else None,
        "inquiries": [i.to_dict(include_private=False) for i in inquiries],
        "projects": [p.to_dict(include_private=False) for p in projects],
        "invoices": [inv.to_dict() for inv in invoices],
        "notifications": [n.to_dict() for n in notifications],
    }), 200


@client_bp.route("/profile", methods=["PATCH"])
@require_auth
def update_client_profile():
    user = g.current_user
    data = request.get_json(silent=True) or {}
    client_rec = ClientRecord.query.filter(
        (ClientRecord.appwrite_user_id == user["id"]) | (ClientRecord.email == user["email"])
    ).first()
    if not client_rec:
        client_rec = ClientRecord(
            appwrite_user_id=user["id"],
            full_name=user["name"] or user["email"].split("@")[0],
            email=user["email"],
        )
        db.session.add(client_rec)

    if "phone" in data:
        client_rec.phone = sanitize_text(data["phone"], 40)
    if "company_name" in data:
        client_rec.company_name = sanitize_text(data["company_name"], 140)
    if "country" in data:
        client_rec.country = sanitize_text(data["country"], 80)

    db.session.commit()
    return jsonify({"success": True, "profile": client_rec.to_dict()}), 200
