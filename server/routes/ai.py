"""
DEVNEXUS TECH — AI Endpoints (Server-Side OpenAI & Gemini).
"""

from flask import Blueprint, request, jsonify

from server.models import db, Inquiry
from server.security import rate_limit, require_admin, sanitize_text, log_audit
from server.services.ai_service import (
    chat_assistant,
    qualify_lead,
    draft_client_reply,
    project_requirement_assistant,
)

ai_bp = Blueprint("ai", __name__, url_prefix="/api/ai")


@ai_bp.route("/chat", methods=["POST"])
@rate_limit(max_requests=25, window_seconds=300, scope="ai_chat")
def ai_chat():
    body = request.get_json(silent=True) or {}
    message = sanitize_text(body.get("message"), 1200)
    provider = sanitize_text(body.get("provider") or "auto", 20)
    history = body.get("history") if isinstance(body.get("history"), list) else []

    if not message:
        return jsonify({"success": False, "error": "Message is required."}), 400

    res = chat_assistant(message, history=history, preferred_provider=provider)
    if not res.get("configured"):
        return jsonify({
            "success": False,
            "configured": False,
            "mode": "pending_configuration",
            "message": "Live LLM inference is pending OpenAI or Gemini API key configuration on the server.",
        }), 200

    if not res.get("text"):
        return jsonify({"success": False, "configured": True, "error": res.get("error")}), 502

    return jsonify({
        "success": True,
        "configured": True,
        "provider": res["provider"],
        "reply": res["text"],
    }), 200


@ai_bp.route("/project-assistant", methods=["POST"])
@rate_limit(max_requests=15, window_seconds=300, scope="ai_project_assistant")
def ai_project_assistant():
    body = request.get_json(silent=True) or {}
    brief = sanitize_text(body.get("brief"), 2000)
    service_type = sanitize_text(body.get("service_type") or "Custom Software Development", 120)
    if len(brief) < 10:
        return jsonify({"success": False, "error": "Provide at least 10 characters describing your idea."}), 400

    res = project_requirement_assistant(brief, service_type)
    if not res.get("configured"):
        return jsonify({
            "success": False,
            "configured": False,
            "mode": "pending_configuration",
            "message": "AI Requirement Assistant requires OPENAI_API_KEY or GEMINI_API_KEY configured on the server.",
        }), 200

    if not res.get("analysis"):
        return jsonify({"success": False, "configured": True, "error": res.get("error")}), 502

    return jsonify({
        "success": True,
        "configured": True,
        "provider": res["provider"],
        "analysis": res["analysis"],
    }), 200


@ai_bp.route("/qualify-lead", methods=["POST"])
@require_admin
def ai_qualify_lead():
    body = request.get_json(silent=True) or {}
    inquiry_id = body.get("inquiry_id")
    if not inquiry_id:
        return jsonify({"success": False, "error": "inquiry_id is required."}), 400

    inquiry = Inquiry.query.get_or_404(inquiry_id)
    res = qualify_lead(inquiry.to_dict(include_private=False))
    if not res.get("configured"):
        return jsonify({"success": False, "configured": False, "error": res.get("error")}), 503

    qual = res.get("qualification") or {}
    if isinstance(qual.get("score"), int):
        inquiry.lead_score = max(0, min(100, qual["score"]))
    if qual.get("summary"):
        inquiry.ai_summary = str(qual["summary"])[:1500]
    db.session.commit()

    log_audit("ai_lead_qualified", f"inquiry:{inquiry.id}", {"provider": res.get("provider"), "score": inquiry.lead_score})
    return jsonify({
        "success": True,
        "configured": True,
        "provider": res.get("provider"),
        "qualification": qual,
        "inquiry": inquiry.to_dict(include_private=True),
    }), 200


@ai_bp.route("/draft-reply", methods=["POST"])
@require_admin
def ai_draft_reply():
    body = request.get_json(silent=True) or {}
    inquiry_id = body.get("inquiry_id")
    tone = sanitize_text(body.get("tone") or "professional", 40)
    if not inquiry_id:
        return jsonify({"success": False, "error": "inquiry_id is required."}), 400

    inquiry = Inquiry.query.get_or_404(inquiry_id)
    res = draft_client_reply(inquiry.to_dict(include_private=False), tone=tone)
    if not res.get("configured"):
        return jsonify({"success": False, "configured": False, "error": res.get("error")}), 503
    if not res.get("text"):
        return jsonify({"success": False, "configured": True, "error": res.get("error")}), 502

    return jsonify({
        "success": True,
        "configured": True,
        "provider": res.get("provider"),
        "draft": res["text"],
    }), 200
