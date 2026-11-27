"""
DEVNEXUS TECH — Protected Admin Dashboard & CRM APIs.
All routes require @require_admin (Appwrite verified admin session or server ADMIN_API_KEY).
"""

import json
import uuid
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify

from server.config import Config, get_integration_status
from server.models import (
    db,
    Inquiry,
    ClientRecord,
    ProjectRecord,
    ProjectTask,
    PortfolioProject,
    ServiceCatalog,
    TestimonialItem,
    Quotation,
    Invoice,
    PaymentTransaction,
    CommunicationLog,
    SiteContentSetting,
    AuditLog,
)
from server.security import require_admin, sanitize_text, log_audit
from server.services.email_service import send_email
from server.services.whatsapp_service import send_whatsapp_message
from server.services.n8n_service import dispatch_n8n_event
from server.services.appwrite_service import test_appwrite_connection

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.route("/analytics", methods=["GET"])
@require_admin
def get_admin_analytics():
    inquiries = Inquiry.query.all()
    projects = ProjectRecord.query.all()
    invoices = Invoice.query.all()
    clients = ClientRecord.query.all()

    status_counts = {}
    service_counts = {}
    for inq in inquiries:
        status_counts[inq.status] = status_counts.get(inq.status, 0) + 1
        service_counts[inq.project_type] = service_counts.get(inq.project_type, 0) + 1

    paid_total = sum(inv.amount for inv in invoices if inv.status.lower() == "paid")
    pending_total = sum(inv.amount for inv in invoices if inv.status.lower() != "paid")

    return jsonify({
        "success": True,
        "overview": {
            "total_inquiries": len(inquiries),
            "total_clients": len(clients),
            "total_projects": len(projects),
            "portfolio_items": PortfolioProject.query.count(),
            "active_services": ServiceCatalog.query.filter_by(is_active=True).count(),
            "paid_revenue_usd": round(paid_total, 2),
            "pending_invoices_usd": round(pending_total, 2),
            "inquiries_by_status": status_counts,
            "inquiries_by_service": service_counts,
        },
        "integrations_summary": {
            k: {"configured": v["configured"], "mode": v["mode"]}
            for k, v in get_integration_status().items()
        },
    }), 200


# ------------------------------------------------------------------------------
# Inquiries & Lead CRM
# ------------------------------------------------------------------------------
@admin_bp.route("/inquiries", methods=["GET"])
@require_admin
def list_inquiries():
    status_filter = request.args.get("status")
    q = Inquiry.query
    if status_filter and status_filter != "All":
        q = q.filter_by(status=status_filter)
    rows = q.order_by(Inquiry.created_at.desc()).all()
    return jsonify({"success": True, "total": len(rows), "inquiries": [r.to_dict(include_private=True) for r in rows]}), 200


@admin_bp.route("/inquiries/<int:inquiry_id>", methods=["PATCH", "DELETE"])
@require_admin
def manage_inquiry(inquiry_id):
    inquiry = Inquiry.query.get_or_404(inquiry_id)
    if request.method == "DELETE":
        db.session.delete(inquiry)
        db.session.commit()
        log_audit("inquiry_deleted", f"inquiry:{inquiry_id}")
        return jsonify({"success": True}), 200

    data = request.get_json(silent=True) or {}
    if "status" in data:
        inquiry.status = sanitize_text(data["status"], 40)
    if "internal_notes" in data:
        inquiry.internal_notes = sanitize_text(data["internal_notes"], 4000)
    if "lead_score" in data and data["lead_score"] is not None:
        inquiry.lead_score = int(data["lead_score"])
    db.session.commit()

    dispatch_n8n_event("lead.updated", inquiry.to_dict(include_private=True))
    log_audit("inquiry_updated", f"inquiry:{inquiry_id}", {"status": inquiry.status})
    return jsonify({"success": True, "inquiry": inquiry.to_dict(include_private=True)}), 200


@admin_bp.route("/inquiries/<int:inquiry_id>/convert-project", methods=["POST"])
@require_admin
def convert_inquiry_to_project(inquiry_id):
    inquiry = Inquiry.query.get_or_404(inquiry_id)
    body = request.get_json(silent=True) or {}

    client = ClientRecord.query.filter_by(email=inquiry.email).first()
    if not client:
        client = ClientRecord(
            appwrite_user_id=inquiry.user_id,
            full_name=inquiry.full_name,
            email=inquiry.email,
            phone=inquiry.phone,
            company_name=inquiry.company_name,
            country=inquiry.country,
        )
        db.session.add(client)
        db.session.flush()

    proj = ProjectRecord(
        client_id=client.id,
        appwrite_user_id=inquiry.user_id,
        client_email=inquiry.email,
        title=sanitize_text(body.get("title") or f"{inquiry.project_type} — {inquiry.company_name or inquiry.full_name}", 180),
        service_type=inquiry.project_type,
        stage="Discovery",
        progress_pct=15,
        description=inquiry.message,
    )
    inquiry.status = "Converted"
    db.session.add(proj)
    db.session.commit()
    dispatch_n8n_event("project.created", proj.to_dict())
    log_audit("inquiry_converted", f"project:{proj.id}", {"inquiry_id": inquiry_id})
    return jsonify({"success": True, "project": proj.to_dict(include_private=True)}), 201


# ------------------------------------------------------------------------------
# Clients, Projects & Tasks
# ------------------------------------------------------------------------------
@admin_bp.route("/clients", methods=["GET", "POST"])
@require_admin
def manage_clients():
    if request.method == "GET":
        rows = ClientRecord.query.order_by(ClientRecord.created_at.desc()).all()
        return jsonify({"success": True, "clients": [c.to_dict() for c in rows]}), 200

    data = request.get_json(silent=True) or {}
    email = sanitize_text(data.get("email"), 150).lower()
    full_name = sanitize_text(data.get("full_name"), 120)
    if not (email and full_name):
        return jsonify({"success": False, "error": "full_name and email are required."}), 400
    if ClientRecord.query.filter_by(email=email).first():
        return jsonify({"success": False, "error": "Client email already exists."}), 409

    client = ClientRecord(
        full_name=full_name,
        email=email,
        phone=sanitize_text(data.get("phone"), 40) or None,
        company_name=sanitize_text(data.get("company_name"), 140) or None,
        country=sanitize_text(data.get("country"), 80) or None,
        notes=sanitize_text(data.get("notes"), 2000) or None,
    )
    db.session.add(client)
    db.session.commit()
    log_audit("client_created", f"client:{client.id}", {"email": email})
    return jsonify({"success": True, "client": client.to_dict()}), 201


@admin_bp.route("/projects", methods=["GET", "POST"])
@require_admin
def manage_projects():
    if request.method == "GET":
        rows = ProjectRecord.query.order_by(ProjectRecord.updated_at.desc()).all()
        tasks = ProjectTask.query.order_by(ProjectTask.id.desc()).all()
        return jsonify({
            "success": True,
            "projects": [p.to_dict(include_private=True) for p in rows],
            "tasks": [t.to_dict() for t in tasks],
        }), 200

    data = request.get_json(silent=True) or {}
    title = sanitize_text(data.get("title"), 180)
    client_email = sanitize_text(data.get("client_email"), 150).lower()
    service_type = sanitize_text(data.get("service_type") or "Custom Software Development", 120)
    if not (title and client_email):
        return jsonify({"success": False, "error": "title and client_email are required."}), 400

    client = ClientRecord.query.filter_by(email=client_email).first()
    proj = ProjectRecord(
        client_id=client.id if client else None,
        appwrite_user_id=client.appwrite_user_id if client else None,
        client_email=client_email,
        title=title,
        service_type=service_type,
        stage=sanitize_text(data.get("stage") or "Discovery", 60),
        progress_pct=int(data.get("progress_pct") or 10),
        budget_usd=float(data["budget_usd"]) if data.get("budget_usd") else None,
        deadline=sanitize_text(data.get("deadline"), 40) or None,
        description=sanitize_text(data.get("description"), 4000) or None,
        internal_notes=sanitize_text(data.get("internal_notes"), 4000) or None,
    )
    db.session.add(proj)
    db.session.commit()
    dispatch_n8n_event("project.created", proj.to_dict())
    log_audit("project_created", f"project:{proj.id}", {"title": title})
    return jsonify({"success": True, "project": proj.to_dict(include_private=True)}), 201


@admin_bp.route("/projects/<int:project_id>", methods=["PATCH", "DELETE"])
@require_admin
def update_project(project_id):
    proj = ProjectRecord.query.get_or_404(project_id)
    if request.method == "DELETE":
        ProjectTask.query.filter_by(project_id=project_id).delete()
        db.session.delete(proj)
        db.session.commit()
        log_audit("project_deleted", f"project:{project_id}")
        return jsonify({"success": True}), 200

    data = request.get_json(silent=True) or {}
    for field in ("title", "stage", "deadline", "description", "internal_notes", "service_type"):
        if field in data:
            setattr(proj, field, sanitize_text(data[field], 4000))
    if "progress_pct" in data:
        proj.progress_pct = max(0, min(100, int(data["progress_pct"])))
    if "budget_usd" in data and data["budget_usd"] is not None:
        proj.budget_usd = float(data["budget_usd"])
    db.session.commit()
    dispatch_n8n_event("project.updated", proj.to_dict())
    log_audit("project_updated", f"project:{project_id}", {"stage": proj.stage, "progress": proj.progress_pct})
    return jsonify({"success": True, "project": proj.to_dict(include_private=True)}), 200


@admin_bp.route("/tasks", methods=["POST"])
@require_admin
def create_task():
    data = request.get_json(silent=True) or {}
    project_id = data.get("project_id")
    title = sanitize_text(data.get("title"), 200)
    if not (project_id and title):
        return jsonify({"success": False, "error": "project_id and title are required."}), 400
    task = ProjectTask(
        project_id=int(project_id),
        title=title,
        status=sanitize_text(data.get("status") or "Todo", 40),
        priority=sanitize_text(data.get("priority") or "Medium", 30),
        due_date=sanitize_text(data.get("due_date"), 40) or None,
        assignee=sanitize_text(data.get("assignee"), 100) or None,
    )
    db.session.add(task)
    db.session.commit()
    return jsonify({"success": True, "task": task.to_dict()}), 201


@admin_bp.route("/tasks/<int:task_id>", methods=["PATCH", "DELETE"])
@require_admin
def update_task(task_id):
    task = ProjectTask.query.get_or_404(task_id)
    if request.method == "DELETE":
        db.session.delete(task)
        db.session.commit()
        return jsonify({"success": True}), 200
    data = request.get_json(silent=True) or {}
    for field in ("title", "status", "priority", "due_date", "assignee"):
        if field in data:
            setattr(task, field, sanitize_text(data[field], 200))
    db.session.commit()
    return jsonify({"success": True, "task": task.to_dict()}), 200


# ------------------------------------------------------------------------------
# Portfolio, Services & Testimonials CMS
# ------------------------------------------------------------------------------
@admin_bp.route("/portfolio", methods=["GET", "POST"])
@require_admin
def manage_portfolio():
    if request.method == "GET":
        rows = PortfolioProject.query.order_by(PortfolioProject.sort_order.asc()).all()
        return jsonify({"success": True, "portfolio": [r.to_dict() for r in rows]}), 200

    data = request.get_json(silent=True) or {}
    title = sanitize_text(data.get("title"), 180)
    slug = sanitize_text(data.get("slug") or title.lower().replace(" ", "-"), 120)
    if not title:
        return jsonify({"success": False, "error": "Title is required."}), 400
    if PortfolioProject.query.filter_by(slug=slug).first():
        slug = f"{slug}-{uuid.uuid4().hex[:5]}"

    item = PortfolioProject(
        slug=slug,
        title=title,
        tagline=sanitize_text(data.get("tagline") or title, 255),
        category=sanitize_text(data.get("category") or "Web Applications", 80),
        badge=sanitize_text(data.get("badge") or "Concept Architecture", 80),
        description=sanitize_text(data.get("description") or "", 4000),
        architecture=sanitize_text(data.get("architecture") or "", 2000),
        features_json=json.dumps(data.get("features") or []),
        technologies_json=json.dumps(data.get("technologies") or []),
        metrics_json=json.dumps(data.get("metrics") or []),
        sample_code=data.get("sample_code") or "",
        accent_color=sanitize_text(data.get("accent_color") or "#00d2ff", 30),
        github_url=sanitize_text(data.get("github_url"), 300) or None,
        is_featured=bool(data.get("is_featured", True)),
        is_concept=bool(data.get("is_concept", True)),
    )
    db.session.add(item)
    db.session.commit()
    log_audit("portfolio_created", f"portfolio:{item.id}", {"slug": item.slug})
    return jsonify({"success": True, "project": item.to_dict()}), 201


@admin_bp.route("/portfolio/<int:item_id>", methods=["PATCH", "DELETE"])
@require_admin
def update_portfolio(item_id):
    item = PortfolioProject.query.get_or_404(item_id)
    if request.method == "DELETE":
        db.session.delete(item)
        db.session.commit()
        log_audit("portfolio_deleted", f"portfolio:{item_id}")
        return jsonify({"success": True}), 200

    data = request.get_json(silent=True) or {}
    for field in ("title", "tagline", "category", "badge", "description", "architecture", "accent_color", "github_url"):
        if field in data:
            setattr(item, field, sanitize_text(data[field], 4000))
    for json_field, attr in (("features", "features_json"), ("technologies", "technologies_json"), ("metrics", "metrics_json")):
        if json_field in data:
            setattr(item, attr, json.dumps(data[json_field]))
    if "is_featured" in data:
        item.is_featured = bool(data["is_featured"])
    if "is_concept" in data:
        item.is_concept = bool(data["is_concept"])
    db.session.commit()
    log_audit("portfolio_updated", f"portfolio:{item_id}")
    return jsonify({"success": True, "project": item.to_dict()}), 200


@admin_bp.route("/services", methods=["GET", "POST"])
@require_admin
def manage_services():
    if request.method == "GET":
        rows = ServiceCatalog.query.order_by(ServiceCatalog.sort_order.asc()).all()
        return jsonify({"success": True, "services": [r.to_dict() for r in rows]}), 200

    data = request.get_json(silent=True) or {}
    title = sanitize_text(data.get("title"), 140)
    slug = sanitize_text(data.get("slug") or title.lower().replace(" ", "-"), 100)
    if not title:
        return jsonify({"success": False, "error": "Service title is required."}), 400
    svc = ServiceCatalog(
        slug=slug,
        title=title,
        badge=sanitize_text(data.get("badge") or "Custom Solution", 60),
        short_desc=sanitize_text(data.get("short_desc") or "", 1000),
        full_desc=sanitize_text(data.get("full_desc") or "", 3000),
        features_json=json.dumps(data.get("features") or []),
        benefits_json=json.dumps(data.get("benefits") or []),
        technologies_json=json.dumps(data.get("technologies") or []),
        starting_price_usd=int(data["starting_price_usd"]) if data.get("starting_price_usd") else None,
        delivery_window=sanitize_text(data.get("delivery_window"), 80) or None,
    )
    db.session.add(svc)
    db.session.commit()
    return jsonify({"success": True, "service": svc.to_dict()}), 201


@admin_bp.route("/services/<int:svc_id>", methods=["PATCH", "DELETE"])
@require_admin
def update_service(svc_id):
    svc = ServiceCatalog.query.get_or_404(svc_id)
    if request.method == "DELETE":
        db.session.delete(svc)
        db.session.commit()
        return jsonify({"success": True}), 200
    data = request.get_json(silent=True) or {}
    for field in ("title", "badge", "short_desc", "full_desc", "delivery_window"):
        if field in data:
            setattr(svc, field, sanitize_text(data[field], 3000))
    if "starting_price_usd" in data:
        svc.starting_price_usd = int(data["starting_price_usd"]) if data["starting_price_usd"] else None
    if "is_active" in data:
        svc.is_active = bool(data["is_active"])
    for jf, attr in (("features", "features_json"), ("benefits", "benefits_json"), ("technologies", "technologies_json")):
        if jf in data:
            setattr(svc, attr, json.dumps(data[jf]))
    db.session.commit()
    return jsonify({"success": True, "service": svc.to_dict()}), 200


@admin_bp.route("/testimonials", methods=["GET", "POST"])
@require_admin
def manage_testimonials():
    if request.method == "GET":
        rows = TestimonialItem.query.order_by(TestimonialItem.id.desc()).all()
        return jsonify({"success": True, "testimonials": [r.to_dict() for r in rows]}), 200
    data = request.get_json(silent=True) or {}
    item = TestimonialItem(
        author_name=sanitize_text(data.get("author_name") or "Client", 120),
        author_role=sanitize_text(data.get("author_role") or "Stakeholder", 120),
        company=sanitize_text(data.get("company") or "Partner Company", 120),
        region=sanitize_text(data.get("region") or "International", 80),
        quote=sanitize_text(data.get("quote") or "", 2000),
        rating=max(1, min(5, int(data.get("rating") or 5))),
        project_type=sanitize_text(data.get("project_type"), 120) or None,
        is_demo=bool(data.get("is_demo", False)),
        is_published=bool(data.get("is_published", True)),
    )
    db.session.add(item)
    db.session.commit()
    return jsonify({"success": True, "testimonial": item.to_dict()}), 201


@admin_bp.route("/testimonials/<int:tid>", methods=["PATCH", "DELETE"])
@require_admin
def update_testimonial(tid):
    item = TestimonialItem.query.get_or_404(tid)
    if request.method == "DELETE":
        db.session.delete(item)
        db.session.commit()
        return jsonify({"success": True}), 200
    data = request.get_json(silent=True) or {}
    for f in ("author_name", "author_role", "company", "region", "quote", "project_type"):
        if f in data:
            setattr(item, f, sanitize_text(data[f], 2000))
    if "is_demo" in data:
        item.is_demo = bool(data["is_demo"])
    if "is_published" in data:
        item.is_published = bool(data["is_published"])
    db.session.commit()
    return jsonify({"success": True, "testimonial": item.to_dict()}), 200


# ------------------------------------------------------------------------------
# Quotations, Invoices & Communications
# ------------------------------------------------------------------------------
@admin_bp.route("/quotations", methods=["GET", "POST"])
@require_admin
def manage_quotations():
    if request.method == "GET":
        rows = Quotation.query.order_by(Quotation.created_at.desc()).all()
        return jsonify({"success": True, "quotations": [q.to_dict() for q in rows]}), 200
    data = request.get_json(silent=True) or {}
    quote = Quotation(
        quote_number=f"DNX-Q-{datetime.now(timezone.utc).strftime('%Y%m')}-{uuid.uuid4().hex[:4].upper()}",
        client_email=sanitize_text(data.get("client_email"), 150).lower(),
        client_name=sanitize_text(data.get("client_name"), 120),
        project_title=sanitize_text(data.get("project_title"), 180),
        items_json=json.dumps(data.get("items") or []),
        currency=sanitize_text(data.get("currency") or "USD", 10).upper(),
        total_amount=float(data.get("total_amount") or 0),
        status=sanitize_text(data.get("status") or "Sent", 30),
        valid_until=sanitize_text(data.get("valid_until"), 40) or None,
        notes=sanitize_text(data.get("notes"), 2000) or None,
    )
    db.session.add(quote)
    db.session.commit()
    return jsonify({"success": True, "quotation": quote.to_dict()}), 201


@admin_bp.route("/invoices", methods=["GET", "POST"])
@require_admin
def manage_invoices():
    if request.method == "GET":
        invs = Invoice.query.order_by(Invoice.created_at.desc()).all()
        txns = PaymentTransaction.query.order_by(PaymentTransaction.created_at.desc()).limit(50).all()
        return jsonify({
            "success": True,
            "invoices": [i.to_dict() for i in invs],
            "transactions": [t.to_dict() for t in txns],
        }), 200

    data = request.get_json(silent=True) or {}
    client_email = sanitize_text(data.get("client_email"), 150).lower()
    client_name = sanitize_text(data.get("client_name"), 120)
    amount = float(data.get("amount") or 0)
    if not (client_email and amount > 0):
        return jsonify({"success": False, "error": "client_email and positive amount are required."}), 400

    inv = Invoice(
        invoice_number=f"DNX-INV-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:4].upper()}",
        client_email=client_email,
        client_name=client_name or client_email.split("@")[0],
        project_id=data.get("project_id"),
        description=sanitize_text(data.get("description") or "Software Engineering Milestone", 300),
        currency=sanitize_text(data.get("currency") or "USD", 10).upper(),
        amount=amount,
        status="Pending",
    )
    db.session.add(inv)
    db.session.commit()
    log_audit("invoice_created", f"invoice:{inv.id}", {"amount": amount, "currency": inv.currency})
    return jsonify({"success": True, "invoice": inv.to_dict()}), 201


@admin_bp.route("/communications", methods=["GET", "POST"])
@require_admin
def manage_communications():
    if request.method == "GET":
        logs = CommunicationLog.query.order_by(CommunicationLog.created_at.desc()).limit(60).all()
        return jsonify({"success": True, "communications": [c.to_dict() for c in logs]}), 200

    data = request.get_json(silent=True) or {}
    channel = sanitize_text(data.get("channel") or "email", 30).lower()
    recipient = sanitize_text(data.get("recipient"), 150)
    subject = sanitize_text(data.get("subject") or "Update from DEVNEXUS TECH", 200)
    body = sanitize_text(data.get("body"), 4000)

    if channel == "email":
        result = send_email(recipient, subject, f"<p>{body}</p>")
        status = "sent" if result["sent"] else "pending_config"
    elif channel == "whatsapp":
        result = send_whatsapp_message(recipient, text_body=body)
        status = "sent" if result["sent"] else "pending_config"
    else:
        result = {"sent": True, "detail": "Internal note logged."}
        status = "logged"

    entry = CommunicationLog(
        client_email=recipient,
        channel=channel,
        direction="outbound",
        subject=subject,
        summary=body[:1000],
        status=status,
    )
    db.session.add(entry)
    db.session.commit()
    return jsonify({"success": True, "result": result, "entry": entry.to_dict()}), 200


# ------------------------------------------------------------------------------
# Settings, Announcements, Integrations Readiness & Audit Logs
# ------------------------------------------------------------------------------
@admin_bp.route("/settings", methods=["GET", "PUT"])
@require_admin
def manage_settings():
    if request.method == "GET":
        rows = SiteContentSetting.query.all()
        return jsonify({"success": True, "settings": {r.key: r.to_dict()["value"] for r in rows}}), 200

    data = request.get_json(silent=True) or {}
    for key, val in data.items():
        clean_key = sanitize_text(key, 100)
        row = SiteContentSetting.query.get(clean_key)
        serialized = json.dumps(val)
        if row:
            row.value_json = serialized
        else:
            db.session.add(SiteContentSetting(key=clean_key, value_json=serialized))
    db.session.commit()
    log_audit("settings_updated", "site_settings", {"keys": list(data.keys())})
    return jsonify({"success": True}), 200


@admin_bp.route("/integrations", methods=["GET"])
@require_admin
def get_integrations_panel():
    return jsonify({"success": True, "integrations": get_integration_status()}), 200


@admin_bp.route("/integrations/test", methods=["POST"])
@require_admin
def test_integration():
    body = request.get_json(silent=True) or {}
    target = sanitize_text(body.get("target"), 40).lower()
    if target == "appwrite":
        return jsonify({"success": True, "result": test_appwrite_connection()}), 200
    if target == "n8n":
        return jsonify({"success": True, "result": dispatch_n8n_event("system.test", {"ping": "devnexus"})}), 200
    return jsonify({"success": True, "result": get_integration_status().get(target, {"configured": False})}), 200


@admin_bp.route("/audit-logs", methods=["GET"])
@require_admin
def list_audit_logs():
    logs = AuditLog.query.order_by(AuditLog.created_at.desc()).limit(100).all()
    return jsonify({"success": True, "logs": [l.to_dict() for l in logs]}), 200
