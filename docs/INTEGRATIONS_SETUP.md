# DEVNEXUS TECH — External Integrations Setup Guide

Every external service in DEVNEXUS TECH inspects server/frontend environment variables and truthfully reports `Pending Configuration` until valid credentials are provided.

---

## 1. Transactional Email (`server/services/email_service.py`)
Priority order: **Resend -> SendGrid -> SMTP**.
- **Resend (Recommended):** Create an API key at [resend.com](https://resend.com), verify your domain, and set `RESEND_API_KEY`, `EMAIL_FROM`, and `NOTIFICATION_RECEIVER`.
- **SendGrid:** Set `SENDGRID_API_KEY` and `EMAIL_FROM`.
- **Gmail SMTP Fallback:** Enable 2FA on Google Account, generate an App Password, and set `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_USER`, `SMTP_PASS`.

---

## 2. WhatsApp Business Cloud API (`server/services/whatsapp_service.py`)
1. Open [Meta for Developers](https://developers.facebook.com) -> Create Business App -> Add **WhatsApp**.
2. Copy `WHATSAPP_PHONE_NUMBER_ID` and permanent System User `WHATSAPP_ACCESS_TOKEN`.
3. Set `WHATSAPP_VERIFY_TOKEN` and configure Meta Webhook URL as `https://your-domain.com/api/webhooks/whatsapp`.
4. Set `WHATSAPP_ADMIN_RECIPIENT` (E.164 digits without `+`) to receive automatic WhatsApp notifications on new inquiries.

---

## 3. Payment Gateways (`server/services/payment_service.py`)
> **Important:** Use Sandbox / Test credentials until merchant onboarding and compliance checks are complete.
- **Stripe:** Set `STRIPE_SECRET_KEY` (`sk_test_...`), `STRIPE_PUBLISHABLE_KEY`, and `STRIPE_WEBHOOK_SECRET` (`whsec_...`). Point webhook to `/api/webhooks/stripe`.
- **PayPal:** Create REST app on [developer.paypal.com](https://developer.paypal.com), set `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, and `PAYPAL_MODE=sandbox`.
- **Payoneer:** Set `PAYONEER_PAYMENT_REQUEST_BASE_URL` and `PAYONEER_RECIPIENT_EMAIL`.
- **JazzCash (Pakistan):** Obtain Merchant ID, Password, and Integrity Salt from JazzCash Merchant Portal; set `JAZZCASH_MERCHANT_ID`, `JAZZCASH_PASSWORD`, `JAZZCASH_INTEGRITY_SALT`, `JAZZCASH_MODE=sandbox`.
- **Easypaisa (Pakistan):** Obtain Store ID and Hash Key from Easypaisa Merchant Portal; set `EASYPAISA_STORE_ID`, `EASYPAISA_HASH_KEY`, `EASYPAISA_MODE=sandbox`.

---

## 4. AI Services (`server/services/ai_service.py`)
All AI keys remain strictly server-side (`server/.env` / Vercel Env Vars):
- **Google Gemini:** Set `GEMINI_API_KEY` and `GEMINI_MODEL=gemini-2.0-flash`.
- **OpenAI:** Set `OPENAI_API_KEY` and `OPENAI_MODEL=gpt-4o-mini`.

---

## 5. n8n Automation (`server/services/n8n_service.py`)
1. Create a Webhook trigger node in your n8n instance.
2. Set `N8N_WEBHOOK_URL` to your n8n webhook URL and `N8N_WEBHOOK_SECRET` for HMAC-SHA256 verification.
3. Set `N8N_INBOUND_SECRET` if n8n calls back into `POST /api/webhooks/n8n`.

---

## 6. Analytics & Search Console
Set `VITE_GA4_MEASUREMENT_ID`, `VITE_GTM_CONTAINER_ID`, `VITE_META_PIXEL_ID`, and/or `VITE_GSC_VERIFICATION` (or matching server env vars). Analytics tags only execute after the visitor accepts analytics in the consent banner.
