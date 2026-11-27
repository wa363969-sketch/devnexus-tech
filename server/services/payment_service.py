"""
DEVNEXUS TECH — Payment Gateways Service.
Supports Stripe, PayPal, Payoneer links, JazzCash, and Easypaisa.
Strictly refuses to fake configured states or simulate fake payment completions when credentials are absent.
"""

import hmac
import hashlib
from datetime import datetime, timezone, timedelta
from urllib.parse import urlencode
import requests

from server.config import Config, _is_real_secret


def get_payment_providers_status() -> dict:
    return {
        "stripe": {
            "id": "stripe",
            "name": "Stripe",
            "region": "International (Cards, Apple Pay, Google Pay)",
            "currencies": ["USD", "GBP", "EUR", "CAD", "AUD"],
            "configured": _is_real_secret(Config.STRIPE_SECRET_KEY),
            "mode": ("sandbox" if Config.STRIPE_SECRET_KEY.startswith("sk_test_") else "live") if _is_real_secret(Config.STRIPE_SECRET_KEY) else "pending_configuration",
            "supports_refunds": True,
            "missing_vars": [
                k for k, v in [
                    ("STRIPE_SECRET_KEY", Config.STRIPE_SECRET_KEY),
                    ("STRIPE_WEBHOOK_SECRET", Config.STRIPE_WEBHOOK_SECRET),
                ] if not _is_real_secret(v)
            ],
        },
        "paypal": {
            "id": "paypal",
            "name": "PayPal",
            "region": "International",
            "currencies": ["USD", "GBP", "EUR", "CAD", "AUD"],
            "configured": _is_real_secret(Config.PAYPAL_CLIENT_ID) and _is_real_secret(Config.PAYPAL_CLIENT_SECRET),
            "mode": Config.PAYPAL_MODE if (_is_real_secret(Config.PAYPAL_CLIENT_ID) and _is_real_secret(Config.PAYPAL_CLIENT_SECRET)) else "pending_configuration",
            "supports_refunds": True,
            "missing_vars": [
                k for k, v in [
                    ("PAYPAL_CLIENT_ID", Config.PAYPAL_CLIENT_ID),
                    ("PAYPAL_CLIENT_SECRET", Config.PAYPAL_CLIENT_SECRET),
                ] if not _is_real_secret(v)
            ],
        },
        "payoneer": {
            "id": "payoneer",
            "name": "Payoneer Payment Request",
            "region": "International B2B",
            "currencies": ["USD", "GBP", "EUR"],
            "configured": _is_real_secret(Config.PAYONEER_PAYMENT_REQUEST_BASE_URL) and _is_real_secret(Config.PAYONEER_RECIPIENT_EMAIL),
            "mode": "configured_links" if (_is_real_secret(Config.PAYONEER_PAYMENT_REQUEST_BASE_URL) and _is_real_secret(Config.PAYONEER_RECIPIENT_EMAIL)) else "pending_configuration",
            "supports_refunds": False,
            "missing_vars": [
                k for k, v in [
                    ("PAYONEER_PAYMENT_REQUEST_BASE_URL", Config.PAYONEER_PAYMENT_REQUEST_BASE_URL),
                    ("PAYONEER_RECIPIENT_EMAIL", Config.PAYONEER_RECIPIENT_EMAIL),
                ] if not _is_real_secret(v)
            ],
        },
        "jazzcash": {
            "id": "jazzcash",
            "name": "JazzCash",
            "region": "Pakistan (PKR)",
            "currencies": ["PKR"],
            "configured": _is_real_secret(Config.JAZZCASH_MERCHANT_ID) and _is_real_secret(Config.JAZZCASH_PASSWORD) and _is_real_secret(Config.JAZZCASH_INTEGRITY_SALT),
            "mode": Config.JAZZCASH_MODE if (_is_real_secret(Config.JAZZCASH_MERCHANT_ID) and _is_real_secret(Config.JAZZCASH_PASSWORD) and _is_real_secret(Config.JAZZCASH_INTEGRITY_SALT)) else "pending_configuration",
            "supports_refunds": False,
            "missing_vars": [
                k for k, v in [
                    ("JAZZCASH_MERCHANT_ID", Config.JAZZCASH_MERCHANT_ID),
                    ("JAZZCASH_PASSWORD", Config.JAZZCASH_PASSWORD),
                    ("JAZZCASH_INTEGRITY_SALT", Config.JAZZCASH_INTEGRITY_SALT),
                ] if not _is_real_secret(v)
            ],
        },
        "easypaisa": {
            "id": "easypaisa",
            "name": "Easypaisa",
            "region": "Pakistan (PKR)",
            "currencies": ["PKR"],
            "configured": _is_real_secret(Config.EASYPAISA_STORE_ID) and _is_real_secret(Config.EASYPAISA_HASH_KEY),
            "mode": Config.EASYPAISA_MODE if (_is_real_secret(Config.EASYPAISA_STORE_ID) and _is_real_secret(Config.EASYPAISA_HASH_KEY)) else "pending_configuration",
            "supports_refunds": False,
            "missing_vars": [
                k for k, v in [
                    ("EASYPAISA_STORE_ID", Config.EASYPAISA_STORE_ID),
                    ("EASYPAISA_HASH_KEY", Config.EASYPAISA_HASH_KEY),
                ] if not _is_real_secret(v)
            ],
        },
    }


def create_stripe_checkout(invoice, success_url: str, cancel_url: str) -> dict:
    if not _is_real_secret(Config.STRIPE_SECRET_KEY):
        return {"ok": False, "configured": False, "error": "Stripe credentials are pending configuration."}
    amount_minor = int(round(float(invoice.amount) * 100))
    payload = {
        "mode": "payment",
        "success_url": success_url,
        "cancel_url": cancel_url,
        "customer_email": invoice.client_email,
        "client_reference_id": str(invoice.id),
        "line_items[0][price_data][currency]": invoice.currency.lower(),
        "line_items[0][price_data][product_data][name]": f"DEVNEXUS TECH Invoice {invoice.invoice_number}",
        "line_items[0][price_data][product_data][description]": invoice.description[:250],
        "line_items[0][price_data][unit_amount]": str(amount_minor),
        "line_items[0][quantity]": "1",
        "metadata[invoice_id]": str(invoice.id),
        "metadata[invoice_number]": invoice.invoice_number,
    }
    res = requests.post(
        "https://api.stripe.com/v1/checkout/sessions",
        auth=(Config.STRIPE_SECRET_KEY, ""),
        data=payload,
        timeout=12,
    )
    data = res.json() if res.content else {}
    if res.ok:
        return {
            "ok": True,
            "configured": True,
            "provider": "stripe",
            "session_id": data.get("id"),
            "checkout_url": data.get("url"),
        }
    return {
        "ok": False,
        "configured": True,
        "error": data.get("error", {}).get("message", f"Stripe HTTP {res.status_code}"),
    }


def verify_stripe_webhook_signature(payload_bytes: bytes, sig_header: str) -> bool:
    if not (_is_real_secret(Config.STRIPE_WEBHOOK_SECRET) and sig_header):
        return False
    parts = dict(item.split("=", 1) for item in sig_header.split(",") if "=" in item)
    timestamp = parts.get("t")
    v1_sig = parts.get("v1")
    if not (timestamp and v1_sig):
        return False
    signed_payload = f"{timestamp}.".encode("utf-8") + payload_bytes
    expected = hmac.new(Config.STRIPE_WEBHOOK_SECRET.encode("utf-8"), signed_payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, v1_sig)


def _paypal_base_url() -> str:
    return "https://api-m.paypal.com" if Config.PAYPAL_MODE == "live" else "https://api-m.sandbox.paypal.com"


def _get_paypal_token() -> tuple[str | None, str | None]:
    res = requests.post(
        f"{_paypal_base_url()}/v1/oauth2/token",
        auth=(Config.PAYPAL_CLIENT_ID, Config.PAYPAL_CLIENT_SECRET),
        data={"grant_type": "client_credentials"},
        timeout=12,
    )
    if not res.ok:
        return None, f"PayPal auth error HTTP {res.status_code}"
    return res.json().get("access_token"), None


def create_paypal_order(invoice, return_url: str, cancel_url: str) -> dict:
    if not (_is_real_secret(Config.PAYPAL_CLIENT_ID) and _is_real_secret(Config.PAYPAL_CLIENT_SECRET)):
        return {"ok": False, "configured": False, "error": "PayPal credentials are pending configuration."}
    token, err = _get_paypal_token()
    if not token:
        return {"ok": False, "configured": True, "error": err}

    payload = {
        "intent": "CAPTURE",
        "purchase_units": [
            {
                "reference_id": invoice.invoice_number,
                "description": invoice.description[:120],
                "amount": {"currency_code": invoice.currency.upper(), "value": f"{invoice.amount:.2f}"},
            }
        ],
        "application_context": {
            "brand_name": "DEVNEXUS TECH",
            "return_url": return_url,
            "cancel_url": cancel_url,
        },
    }
    res = requests.post(
        f"{_paypal_base_url()}/v2/checkout/orders",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        json=payload,
        timeout=12,
    )
    data = res.json() if res.content else {}
    if res.ok:
        approve_link = next((l.get("href") for l in data.get("links", []) if l.get("rel") == "approve"), None)
        return {
            "ok": True,
            "configured": True,
            "provider": "paypal",
            "session_id": data.get("id"),
            "checkout_url": approve_link,
        }
    return {"ok": False, "configured": True, "error": data.get("message", f"PayPal HTTP {res.status_code}")}


def create_payoneer_request_link(invoice) -> dict:
    if not (_is_real_secret(Config.PAYONEER_PAYMENT_REQUEST_BASE_URL) and _is_real_secret(Config.PAYONEER_RECIPIENT_EMAIL)):
        return {"ok": False, "configured": False, "error": "Payoneer request base URL is pending configuration."}
    query = urlencode({
        "reference": invoice.invoice_number,
        "amount": f"{invoice.amount:.2f}",
        "currency": invoice.currency.upper(),
        "payer": invoice.client_email,
    })
    separator = "&" if "?" in Config.PAYONEER_PAYMENT_REQUEST_BASE_URL else "?"
    return {
        "ok": True,
        "configured": True,
        "provider": "payoneer",
        "session_id": invoice.invoice_number,
        "checkout_url": f"{Config.PAYONEER_PAYMENT_REQUEST_BASE_URL}{separator}{query}",
    }


def build_jazzcash_checkout_payload(invoice, return_url: str) -> dict:
    if not (_is_real_secret(Config.JAZZCASH_MERCHANT_ID) and _is_real_secret(Config.JAZZCASH_PASSWORD) and _is_real_secret(Config.JAZZCASH_INTEGRITY_SALT)):
        return {"ok": False, "configured": False, "error": "JazzCash merchant credentials are pending configuration."}
    now = datetime.now(timezone.utc)
    txn_dt = now.strftime("%Y%m%d%H%M%S")
    exp_dt = (now + timedelta(hours=1)).strftime("%Y%m%d%H%M%S")
    amount_paisa = str(int(round(float(invoice.amount) * 100)))
    fields = {
        "pp_Version": "1.1",
        "pp_TxnType": "MWALLET",
        "pp_Language": "EN",
        "pp_MerchantID": Config.JAZZCASH_MERCHANT_ID,
        "pp_Password": Config.JAZZCASH_PASSWORD,
        "pp_TxnRefNo": f"DNX{txn_dt}{invoice.id}",
        "pp_Amount": amount_paisa,
        "pp_TxnCurrency": "PKR",
        "pp_TxnDateTime": txn_dt,
        "pp_BillReference": invoice.invoice_number,
        "pp_Description": invoice.description[:100],
        "pp_TxnExpiryDateTime": exp_dt,
        "pp_ReturnURL": return_url,
    }
    sorted_keys = sorted(k for k, v in fields.items() if v != "")
    hash_input = Config.JAZZCASH_INTEGRITY_SALT + "&" + "&".join(str(fields[k]) for k in sorted_keys)
    fields["pp_SecureHash"] = hmac.new(
        Config.JAZZCASH_INTEGRITY_SALT.encode("utf-8"),
        hash_input.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest().upper()
    endpoint = (
        "https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/"
        if Config.JAZZCASH_MODE == "live"
        else "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/"
    )
    return {"ok": True, "configured": True, "provider": "jazzcash", "endpoint": endpoint, "form_fields": fields}


def build_easypaisa_checkout_payload(invoice, post_back_url: str) -> dict:
    if not (_is_real_secret(Config.EASYPAISA_STORE_ID) and _is_real_secret(Config.EASYPAISA_HASH_KEY)):
        return {"ok": False, "configured": False, "error": "Easypaisa merchant credentials are pending configuration."}
    now = datetime.now(timezone.utc)
    fields = {
        "storeId": Config.EASYPAISA_STORE_ID,
        "amount": f"{invoice.amount:.1f}",
        "postBackURL": post_back_url,
        "orderRefNum": invoice.invoice_number,
        "expiryDate": (now + timedelta(hours=1)).strftime("%Y%m%d %H%M%S"),
        "autoRedirect": "1",
        "emailAddr": invoice.client_email,
    }
    canonical = "&".join(f"{k}={fields[k]}" for k in sorted(fields.keys()))
    fields["merchantHashedReq"] = hmac.new(
        Config.EASYPAISA_HASH_KEY.encode("utf-8"),
        canonical.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    endpoint = (
        "https://easypay.easypaisa.com.pk/easypay/Index.jsf"
        if Config.EASYPAISA_MODE == "live"
        else "https://easypaystg.easypaisa.com.pk/easypay/Index.jsf"
    )
    return {"ok": True, "configured": True, "provider": "easypaisa", "endpoint": endpoint, "form_fields": fields}


def refund_payment(provider: str, external_id: str, amount: float | None = None) -> dict:
    provider = (provider or "").lower()
    if provider == "stripe":
        if not _is_real_secret(Config.STRIPE_SECRET_KEY):
            return {"ok": False, "configured": False, "error": "Stripe credentials pending configuration."}
        data = {"payment_intent": external_id}
        if amount is not None:
            data["amount"] = str(int(round(float(amount) * 100)))
        res = requests.post("https://api.stripe.com/v1/refunds", auth=(Config.STRIPE_SECRET_KEY, ""), data=data, timeout=12)
        body = res.json() if res.content else {}
        if res.ok:
            return {"ok": True, "refund_id": body.get("id"), "status": body.get("status")}
        return {"ok": False, "error": body.get("error", {}).get("message", "Stripe refund failed")}

    if provider == "paypal":
        if not (_is_real_secret(Config.PAYPAL_CLIENT_ID) and _is_real_secret(Config.PAYPAL_CLIENT_SECRET)):
            return {"ok": False, "configured": False, "error": "PayPal credentials pending configuration."}
        token, err = _get_paypal_token()
        if not token:
            return {"ok": False, "error": err}
        res = requests.post(
            f"{_paypal_base_url()}/v2/payments/captures/{external_id}/refund",
            headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
            json={},
            timeout=12,
        )
        body = res.json() if res.content else {}
        if res.ok:
            return {"ok": True, "refund_id": body.get("id"), "status": body.get("status")}
        return {"ok": False, "error": body.get("message", "PayPal refund failed")}

    return {"ok": False, "error": f"Automated API refund is not supported for provider '{provider}'."}
