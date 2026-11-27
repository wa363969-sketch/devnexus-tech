"""
DEVNEXUS TECH — Public Endpoints (Health, Bootstrap Catalog, Contact & Start-a-Project).
"""

import json
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify

from server.config import Config, get_integration_status
from server.models import (
    db,
    Inquiry,
    PortfolioProject,
    ServiceCatalog,
    TestimonialItem,
    SiteContentSetting,
    CommunicationLog,
)
from server.security import (
    sanitize_text,
    is_valid_email,
    get_client_ip,
    rate_limit,
    verify_appwrite_jwt,
    log_audit,
)
from server.services.email_service import send_inquiry_emails
from server.services.whatsapp_service import notify_admin_whatsapp
from server.services.n8n_service import dispatch_n8n_event
from server.services.appwrite_service import sync_inquiry_to_appwrite

public_bp = Blueprint("public", __name__, url_prefix="/api")


def _get_setting(key: str, fallback: dict) -> dict:
    row = SiteContentSetting.query.get(key)
    if not row:
        return fallback
    try:
        return json.loads(row.value_json)
    except Exception:
        return fallback


@public_bp.route("/health", methods=["GET"])
def health_check():
    db_status = "connected"
    try:
        db.session.execute(db.text("SELECT 1"))
    except Exception as exc:
        db_status = f"error: {exc}"

    integrations = get_integration_status()
    return jsonify({
        "status": "healthy" if db_status == "connected" else "degraded",
        "company": "DEVNEXUS TECH",
        "database": db_status,
        "engine": db.engine.name,
        "integrations_summary": {
            k: {"configured": v["configured"], "mode": v["mode"]}
            for k, v in integrations.items()
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }), 200


@public_bp.route("/public/bootstrap", methods=["GET"])
def public_bootstrap():
    services = [
        s.to_dict()
        for s in ServiceCatalog.query.filter_by(is_active=True).order_by(ServiceCatalog.sort_order.asc()).all()
    ]
    portfolio = [
        p.to_dict()
        for p in PortfolioProject.query.order_by(PortfolioProject.sort_order.asc()).all()
    ]
    testimonials = [
        t.to_dict()
        for t in TestimonialItem.query.filter_by(is_published=True).order_by(TestimonialItem.id.asc()).all()
    ]
    announcement = _get_setting("announcement", {})
    contact_cfg = _get_setting("contact", {})
    seo_cfg = _get_setting("seo", {})

    return jsonify({
        "success": True,
        "services": services,
        "portfolio": portfolio,
        "testimonials": testimonials,
        "announcement": announcement,
        "contact": {
            "whatsapp_number": contact_cfg.get("whatsapp_number", Config.WHATSAPP_BUSINESS_NUMBER),
            "email": contact_cfg.get("email", Config.NOTIFICATION_RECEIVER),
            "company_email": contact_cfg.get("company_email", "contact@devnexustech.com"),
            "location": contact_cfg.get("location", "Pakistan & International Remote"),
        },
        "seo": seo_cfg,
        "analytics": {
            "ga4_measurement_id": Config.GA4_MEASUREMENT_ID or None,
            "gtm_container_id": Config.GTM_CONTAINER_ID or None,
            "meta_pixel_id": Config.META_PIXEL_ID or None,
            "gsc_verification": Config.GSC_VERIFICATION_TOKEN or None,
        },
    }), 200


@public_bp.route("/portfolio/<slug>", methods=["GET"])
def get_portfolio_detail(slug):
    item = PortfolioProject.query.filter_by(slug=slug).first()
    if not item:
        return jsonify({"success": False, "error": "Project not found."}), 404
    return jsonify({"success": True, "project": item.to_dict()}), 200


@public_bp.route("/contact", methods=["POST"])
@rate_limit(max_requests=10, window_seconds=300, scope="contact")
def submit_contact_inquiry():
    data = request.get_json(silent=True) or {}

    # Bot honeypot
    if data.get("_gotcha"):
        return jsonify({"success": True, "message": "Inquiry received."}), 200

    full_name = sanitize_text(data.get("full_name"), 120)
    email = sanitize_text(data.get("email"), 150).lower()
    phone = sanitize_text(data.get("phone"), 40)
    company_name = sanitize_text(data.get("company_name"), 140)
    country = sanitize_text(data.get("country") or "Pakistan", 80)
    project_type = sanitize_text(data.get("project_type"), 120)
    budget = sanitize_text(data.get("budget"), 80)
    timeline = sanitize_text(data.get("timeline"), 80)
    message = sanitize_text(data.get("message"), 4000)
    source = sanitize_text(data.get("source") or "contact_form", 60)
    requirements = data.get("requirements") if isinstance(data.get("requirements"), dict) else {}

    errors = {}
    if len(full_name) < 2:
        errors["full_name"] = "Please provide your full name (at least 2 characters)."
    if not is_valid_email(email):
        errors["email"] = "Please provide a valid email address."
    if not project_type:
        errors["project_type"] = "Please select the service required."
    if not budget:
        errors["budget"] = "Please select an estimated budget range."
    if len(message) < 10:
        errors["message"] = "Please provide at least 10 characters describing your project details."

    if errors:
        return jsonify({
            "success": False,
            "message": "Validation failed. Please correct the highlighted fields.",
            "errors": errors,
        }), 400

    # Attach verified user_id if the visitor is authenticated with Appwrite
    user_id = None
    jwt_token = request.headers.get("X-Appwrite-JWT", "").strip()
    if not jwt_token and request.headers.get("Authorization", "").lower().startswith("bearer "):
        jwt_token = request.headers.get("Authorization", "")[7:].strip()
    if jwt_token:
        verified_user, _ = verify_appwrite_jwt(jwt_token)
        if verified_user:
            user_id = verified_user["id"]

    try:
        inquiry = Inquiry(
            user_id=user_id,
            full_name=full_name,
            email=email,
            phone=phone or None,
            company_name=company_name or None,
            country=country,
            project_type=project_type,
            budget=budget,
            timeline=timeline or None,
            message=message,
            requirements_json=json.dumps(requirements) if requirements else None,
            status="New",
            source=source,
            client_ip=get_client_ip()[:50],
            user_agent=sanitize_text(request.headers.get("User-Agent", ""), 250),
        )
        db.session.add(inquiry)
        db.session.commit()

        # Side effects: all report real honest outcomes
        appwrite_res = sync_inquiry_to_appwrite(inquiry)
        email_res = send_inquiry_emails(inquiry)
        whatsapp_res = notify_admin_whatsapp(inquiry)
        n8n_res = dispatch_n8n_event("inquiry.created", inquiry.to_dict())

        db.session.add(
            CommunicationLog(
                client_email=inquiry.email,
                channel="email",
                direction="outbound",
                subject="Inquiry Confirmation & Admin Alert",
                summary=f"Admin email sent={email_res['admin_notification']['sent']}; Client email sent={email_res['client_confirmation']['sent']}",
                status="sent" if email_res["admin_notification"]["sent"] else "pending_config",
            )
        )
        db.session.commit()
        log_audit("inquiry_created", f"inquiry:{inquiry.id}", {"project_type": project_type, "source": source})

        return jsonify({
            "success": True,
            "message": "Your project inquiry has been saved to DEVNEXUS TECH. Our engineering team will review it within 24 hours.",
            "inquiry_id": inquiry.id,
            "integrations": {
                "database": {"saved": True},
                "appwrite": appwrite_res,
                "email": email_res,
                "whatsapp": whatsapp_res,
                "n8n": n8n_res,
            },
        }), 201
    except Exception as exc:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "An unexpected server error occurred while saving your inquiry.",
            "error": str(exc),
        }), 500
