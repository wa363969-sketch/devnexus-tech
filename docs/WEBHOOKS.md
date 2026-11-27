# DEVNEXUS TECH — Webhook Reference

## Outbound Webhooks (to n8n)
DEVNEXUS TECH sends JSON envelopes to `N8N_WEBHOOK_URL` on:
- `inquiry.created`
- `lead.updated`
- `project.created`
- `project.updated`
- `payment.confirmed`
- `system.test`

### Headers Sent
- `Content-Type: application/json`
- `X-Devnexus-Event: <event_name>`
- `X-Devnexus-Signature: sha256=<hmac_sha256_hex>` (when `N8N_WEBHOOK_SECRET` is configured)

### Sample Payload
```json
{
  "event": "inquiry.created",
  "source": "devnexus-tech-api",
  "timestamp": "2026-11-26T18:30:00+00:00",
  "data": {
    "id": 12,
    "full_name": "Bilal Khan",
    "email": "bilal@example.pk",
    "country": "Pakistan",
    "project_type": "AI Automation",
    "budget": "$1,500 – $3,500 USD",
    "status": "New"
  }
}
```

---

## Inbound Webhooks
| Endpoint | Verification | Purpose |
|---|---|---|
| `POST /api/webhooks/stripe` | `Stripe-Signature` (`v1` HMAC-SHA256 with `STRIPE_WEBHOOK_SECRET`) | Marks invoice `Paid`, logs transaction, triggers `payment.confirmed` n8n event |
| `POST /api/webhooks/jazzcash` | `pp_SecureHash` HMAC-SHA256 with `JAZZCASH_INTEGRITY_SALT` | Confirms PKR JazzCash transaction & updates invoice |
| `POST /api/webhooks/easypaisa` | `EASYPAISA_HASH_KEY` check + order ref lookup | Confirms PKR Easypaisa transaction & updates invoice |
| `GET/POST /api/webhooks/whatsapp` | `hub.verify_token` == `WHATSAPP_VERIFY_TOKEN` | Meta Cloud API verification challenge & inbound message logging |
| `POST /api/webhooks/n8n` | `X-Devnexus-Signature: sha256=...` using `N8N_INBOUND_SECRET` | Allows n8n workflows to update inquiry CRM status |
