"""
DEVNEXUS TECH — Payment Gateways & Checkout Routes.
"""

from flask import Blueprint, request, jsonify, g

from server.models import db, Invoice, PaymentTransaction
from server.security import require_auth, require_admin, sanitize_text, log_audit
from server.services.payment_service import (
    get_payment_providers_status,
    create_stripe_checkout,
    create_paypal_order,
    create_payoneer_request_link,
    build_jazzcash_checkout_payload,
    build_easypaisa_checkout_payload,
    refund_payment,
)

payments_bp = Blueprint("payments", __name__, url_prefix="/api/payments")


@payments_bp.route("/providers", methods=["GET"])
def list_payment_providers():
    return jsonify({"success": True, "providers": get_payment_providers_status()}), 200


@payments_bp.route("/checkout", methods=["POST"])
@require_auth
def initiate_checkout():
    body = request.get_json(silent=True) or {}
    invoice_id = body.get("invoice_id")
    provider = sanitize_text(body.get("provider"), 30).lower()
    origin = sanitize_text(body.get("return_origin") or request.host_url.rstrip("/"), 200).rstrip("/")

    if not invoice_id or not provider:
        return jsonify({"success": False, "error": "invoice_id and provider are required."}), 400

    invoice = Invoice.query.get_or_404(invoice_id)
    user = g.current_user
    if not user.get("is_admin") and invoice.client_email != user.get("email"):
        return jsonify({"success": False, "error": "Unauthorized access to this invoice."}), 403

    if invoice.status.lower() == "paid":
        return jsonify({"success": False, "error": "Invoice is already paid."}), 400

    success_url = f"{origin}/dashboard?payment=success&invoice={invoice.invoice_number}"
    cancel_url = f"{origin}/dashboard?payment=cancelled&invoice={invoice.invoice_number}"

    if provider == "stripe":
        res = create_stripe_checkout(invoice, success_url, cancel_url)
    elif provider == "paypal":
        res = create_paypal_order(invoice, success_url, cancel_url)
    elif provider == "payoneer":
        res = create_payoneer_request_link(invoice)
    elif provider == "jazzcash":
        res = build_jazzcash_checkout_payload(invoice, f"{origin}/api/webhooks/jazzcash")
    elif provider == "easypaisa":
        res = build_easypaisa_checkout_payload(invoice, f"{origin}/api/webhooks/easypaisa")
    else:
        return jsonify({"success": False, "error": f"Unknown payment provider '{provider}'."}), 400

    if not res.get("configured", True):
        return jsonify({
            "success": False,
            "configured": False,
            "message": res.get("error"),
        }), 422

    if not res.get("ok"):
        return jsonify({"success": False, "error": res.get("error", "Payment initiation failed.")}), 502

    invoice.provider = provider
    if res.get("session_id"):
        invoice.provider_session_id = res["session_id"]
    if res.get("checkout_url"):
        invoice.payment_url = res["checkout_url"]
    db.session.add(
        PaymentTransaction(
            invoice_id=invoice.id,
            provider=provider,
            external_id=res.get("session_id"),
            amount=invoice.amount,
            currency=invoice.currency,
            status="initiated",
        )
    )
    db.session.commit()
    log_audit("payment_checkout_initiated", f"invoice:{invoice.id}", {"provider": provider}, actor=user)
    return jsonify({"success": True, **res}), 200


@payments_bp.route("/refund", methods=["POST"])
@require_admin
def process_refund():
    body = request.get_json(silent=True) or {}
    provider = sanitize_text(body.get("provider"), 30).lower()
    external_id = sanitize_text(body.get("external_id"), 180)
    amount = body.get("amount")

    if not provider or not external_id:
        return jsonify({"success": False, "error": "provider and external_id are required."}), 400

    res = refund_payment(provider, external_id, amount=amount)
    if not res.get("ok"):
        code = 422 if not res.get("configured", True) else 400
        return jsonify({"success": False, **res}), code

    db.session.add(
        PaymentTransaction(
            provider=provider,
            external_id=res.get("refund_id") or external_id,
            amount=float(amount or 0),
            currency="USD",
            status="refunded",
        )
    )
    db.session.commit()
    log_audit("payment_refunded", f"payment:{external_id}", {"provider": provider})
    return jsonify({"success": True, **res}), 200
