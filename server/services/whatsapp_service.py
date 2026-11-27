"""
DEVNEXUS TECH — WhatsApp Business Cloud API (Meta Graph API) Integration.
"""

import re
import requests

from server.config import Config, _is_real_secret


def _normalize_phone(phone: str) -> str:
    return re.sub(r"[^\d]", "", phone or "")


def is_whatsapp_configured() -> bool:
    return bool(
        _is_real_secret(Config.WHATSAPP_PHONE_NUMBER_ID)
        and _is_real_secret(Config.WHATSAPP_ACCESS_TOKEN)
    )


def send_whatsapp_message(
    to_number: str,
    text_body: str | None = None,
    template_name: str | None = None,
    template_lang: str = "en_US",
    template_params: list[str] | None = None,
) -> dict:
    """
    Sends a real WhatsApp message via Meta Cloud API.
    Supports template messages (recommended for cold business notifications) and session text messages.
    """
    if not is_whatsapp_configured():
        return {
            "sent": False,
            "configured": False,
            "detail": "WhatsApp Business Cloud API pending configuration (WHATSAPP_PHONE_NUMBER_ID / WHATSAPP_ACCESS_TOKEN).",
        }

    cleaned = _normalize_phone(to_number)
    if len(cleaned) < 8:
        return {"sent": False, "configured": True, "detail": "Invalid recipient WhatsApp number."}

    url = f"https://graph.facebook.com/v20.0/{Config.WHATSAPP_PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {Config.WHATSAPP_ACCESS_TOKEN}",
        "Content-Type": "application/json",
    }

    if template_name:
        components = []
        if template_params:
            components.append({
                "type": "body",
                "parameters": [{"type": "text", "text": str(p)[:200]} for p in template_params],
            })
        payload = {
            "messaging_product": "whatsapp",
            "to": cleaned,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {"code": template_lang},
                **({"components": components} if components else {}),
            },
        }
    else:
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": cleaned,
            "type": "text",
            "text": {"preview_url": False, "body": (text_body or "")[:4096]},
        }

    try:
        res = requests.post(url, headers=headers, json=payload, timeout=10)
        data = res.json() if res.content else {}
        if res.ok:
            msg_id = ((data.get("messages") or [{}])[0]).get("id")
            return {"sent": True, "configured": True, "message_id": msg_id, "detail": "Delivered via Meta WhatsApp Cloud API"}
        return {
            "sent": False,
            "configured": True,
            "detail": f"WhatsApp Cloud API error HTTP {res.status_code}: {data.get('error', {}).get('message', res.text[:200])}",
        }
    except requests.RequestException as exc:
        return {"sent": False, "configured": True, "detail": str(exc)}


def notify_admin_whatsapp(inquiry) -> dict:
    admin_num = Config.WHATSAPP_ADMIN_RECIPIENT or Config.WHATSAPP_BUSINESS_NUMBER
    if not is_whatsapp_configured() or not admin_num:
        return {
            "sent": False,
            "configured": is_whatsapp_configured(),
            "detail": "WhatsApp admin alert skipped (API or WHATSAPP_ADMIN_RECIPIENT pending configuration).",
        }
    summary = (
        f"DEVNEXUS TECH Inquiry #{inquiry.id}\n"
        f"Name: {inquiry.full_name} ({inquiry.country})\n"
        f"Service: {inquiry.project_type}\n"
        f"Budget: {inquiry.budget}\n"
        f"Email: {inquiry.email}"
    )
    return send_whatsapp_message(to_number=admin_num, text_body=summary)
