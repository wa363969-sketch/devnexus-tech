"""
DEVNEXUS TECH — n8n Automation Webhook Dispatcher.
"""

import hmac
import hashlib
import json
from datetime import datetime, timezone
import requests

from server.config import Config, _is_real_secret


def dispatch_n8n_event(event_name: str, payload: dict) -> dict:
    """Sends an HMAC-SHA256 signed webhook event to configured n8n workflow URL."""
    if not _is_real_secret(Config.N8N_WEBHOOK_URL):
        return {
            "dispatched": False,
            "configured": False,
            "detail": "n8n webhook URL pending configuration (N8N_WEBHOOK_URL).",
        }

    envelope = {
        "event": event_name,
        "source": "devnexus-tech-api",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": payload,
    }
    raw = json.dumps(envelope, separators=(",", ":"), default=str).encode("utf-8")
    headers = {"Content-Type": "application/json", "X-Devnexus-Event": event_name}

    if _is_real_secret(Config.N8N_WEBHOOK_SECRET):
        sig = hmac.new(Config.N8N_WEBHOOK_SECRET.encode("utf-8"), raw, hashlib.sha256).hexdigest()
        headers["X-Devnexus-Signature"] = f"sha256={sig}"

    try:
        res = requests.post(Config.N8N_WEBHOOK_URL, data=raw, headers=headers, timeout=8)
        if res.ok:
            return {"dispatched": True, "configured": True, "status_code": res.status_code, "detail": "n8n workflow triggered"}
        return {
            "dispatched": False,
            "configured": True,
            "status_code": res.status_code,
            "detail": f"n8n returned HTTP {res.status_code}",
        }
    except requests.RequestException as exc:
        return {"dispatched": False, "configured": True, "detail": str(exc)}
