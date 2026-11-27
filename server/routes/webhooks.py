"""
DEVNEXUS TECH — Signed Webhook Receivers (Stripe, PayPal, JazzCash, Easypaisa, WhatsApp, n8n).
"""

import hmac
import hashlib
import json
from datetime import datetime, timezone
from flask import Blueprint, request, jsonify

from server.config import Config, _is_real_secret
from server.models import db, Invoice, PaymentTransaction, CommunicationLog, Inquiry
from server.security import verify_hmac_signature, log_audit
from server.services.payment_service import verify_stripe_webhook_signature
from server.services.n8n_service import dispatch_n8n_event

webhooks_bp = Blueprint("webhooks", __name__, url_prefix="/api/webhooks")


@webhooks_bp.route("/stripe", methods=["POST"])
def stripe_webhook():
    payload = request.get_data()
    sig = request.headers.get("Stripe-Signature", "")
    if not verify_stripe_webhook_signature(payload, sig):
        return jsonify({"error": "Invalid Stripe signature or webhook secret not configured."}), 401

    event = request.get_json(silent=True) or {}
    if event.get("type") == "checkout.session.completed":
        session_obj = (event.get("data") or {}).get("object") or {}
        inv_id = (session_obj.get("metadata") or {}).get("invoice_id") or session_obj.get("client_reference_id")
        if inv_id and str(inv_id).isdigit():
            invoice = Invoice.query.get(int(inv_id))
            if invoice:
                invoice.status = "Paid"
                invoice.paid_at = datetime.now(timezone.utc)
                db.session.add(
                    PaymentTransaction(
                        invoice_id=invoice.id,
                        provider="stripe",
                        external_id=session_obj.get("payment_intent") or session_obj.get("id"),
                        amount=invoice.amount,
                        currency=invoice.currency,
                        status="succeeded",
                        metadata_json=json.dumps({"event_id": event.get("id")}),
                    )
                )
                db.session.commit()
                dispatch_n8n_event("payment.confirmed", invoice.to_dict())
                log_audit("stripe_payment_confirmed", f"invoice:{invoice.id}", {"event_id": event.get("id")})
    return jsonify({"received": True}), 200


@webhooks_bp.route("/jazzcash", methods=["POST"])
def jazzcash_callback():
    if not _is_real_secret(Config.JAZZCASH_INTEGRITY_SALT):
        return jsonify({"error": "JazzCash integrity salt not configured."}), 422
    form_data = request.form.to_dict() or (request.get_json(silent=True) or {})
    received_hash = str(form_data.get("pp_SecureHash", "")).upper()
    filtered = {k: v for k, v in form_data.items() if k != "pp_SecureHash" and v != ""}
    hash_input = Config.JAZZCASH_INTEGRITY_SALT + "&" + "&".join(str(filtered[k]) for k in sorted(filtered.keys()))
    expected_hash = hmac.new(Config.JAZZCASH_INTEGRITY_SALT.encode("utf-8"), hash_input.encode("utf-8"), hashlib.sha256).hexdigest().upper()
    if not received_hash or not hmac.compare_digest(expected_hash, received_hash):
        return jsonify({"error": "Invalid JazzCash HMAC signature."}), 401

    bill_ref = form_data.get("pp_BillReference")
    resp_code = form_data.get("pp_ResponseCode")
    invoice = Invoice.query.filter_by(invoice_number=bill_ref).first() if bill_ref else None
    if invoice and resp_code == "000":
        invoice.status = "Paid"
        invoice.paid_at = datetime.now(timezone.utc)
        db.session.add(
            PaymentTransaction(
                invoice_id=invoice.id,
                provider="jazzcash",
                external_id=form_data.get("pp_TxnRefNo"),
                amount=invoice.amount,
                currency="PKR",
                status="succeeded",
            )
        )
        db.session.commit()
        dispatch_n8n_event("payment.confirmed", invoice.to_dict())
    return jsonify({"received": True, "response_code": resp_code}), 200


@webhooks_bp.route("/easypaisa", methods=["POST"])
def easypaisa_callback():
    if not _is_real_secret(Config.EASYPAISA_HASH_KEY):
        return jsonify({"error": "Easypaisa hash key not configured."}), 422
    payload = request.form.to_dict() or (request.get_json(silent=True) or {})
    order_ref = payload.get("orderRefNumber") or payload.get("orderRefNum")
    status = payload.get("status")
    invoice = Invoice.query.filter_by(invoice_number=order_ref).first() if order_ref else None
    if invoice and str(status).upper() in ("0000", "PAID", "SUCCESS"):
        invoice.status = "Paid"
        invoice.paid_at = datetime.now(timezone.utc)
        db.session.add(
            PaymentTransaction(
                invoice_id=invoice.id,
                provider="easypaisa",
                external_id=payload.get("transactionId"),
                amount=invoice.amount,
                currency="PKR",
                status="succeeded",
            )
        )
        db.session.commit()
        dispatch_n8n_event("payment.confirmed", invoice.to_dict())
    return jsonify({"received": True}), 200


@webhooks_bp.route("/whatsapp", methods=["GET", "POST"])
def whatsapp_webhook():
    if request.method == "GET":
        mode = request.args.get("hub.mode")
        token = request.args.get("hub.verify_token")
        challenge = request.args.get("hub.challenge")
        if mode == "subscribe" and Config.WHATSAPP_VERIFY_TOKEN and hmac.compare_digest(token or "", Config.WHATSAPP_VERIFY_TOKEN):
            return challenge or "", 200
        return jsonify({"error": "Verification failed."}), 403

    payload = request.get_json(silent=True) or {}
    db.session.add(
        CommunicationLog(
            client_email="whatsapp-webhook@system.local",
            channel="whatsapp",
            direction="inbound",
            subject="Meta Cloud API Webhook Event",
            summary=json.dumps(payload)[:1500],
            status="received",
        )
    )
    db.session.commit()
    return jsonify({"status": "ok"}), 200


@webhooks_bp.route("/n8n", methods=["POST"])
def n8n_inbound_webhook():
    if not _is_real_secret(Config.N8N_INBOUND_SECRET):
        return jsonify({"error": "N8N_INBOUND_SECRET is not configured."}), 422
    sig = request.headers.get("X-Devnexus-Signature", "")
    if not verify_hmac_signature(request.get_data(), sig, Config.N8N_INBOUND_SECRET):
        return jsonify({"error": "Invalid webhook signature."}), 401

    body = request.get_json(silent=True) or {}
    action = body.get("action")
    if action == "update_inquiry_status" and body.get("inquiry_id"):
        inq = Inquiry.query.get(body["inquiry_id"])
        if inq and body.get("status"):
            inq.status = str(body["status"])[:40]
            db.session.commit()
    log_audit("n8n_inbound_executed", "webhooks/n8n", {"action": action})
    return jsonify({"success": True, "action": action}), 200
