"""
DEVNEXUS TECH — Backend Configuration & Integration Readiness Inspector.
Reads environment variables cleanly without exposing secrets in API responses.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
ROOT_DIR = BASE_DIR.parent

# Load server/.env first, then root .env (existing OS env vars take precedence)
load_dotenv(BASE_DIR / ".env")
load_dotenv(ROOT_DIR / ".env")


def _clean(name: str, default: str = "") -> str:
    val = os.getenv(name, default)
    return val.strip() if isinstance(val, str) else default


def _is_real_secret(val: str) -> bool:
    if not val:
        return False
    lowered = val.lower()
    placeholders = (
        "your-",
        "change-this",
        "placeholder",
        "example",
        "xxxx",
        "<",
    )
    return not any(p in lowered for p in placeholders)


class Config:
    FLASK_ENV = _clean("FLASK_ENV", "development")
    PORT = int(_clean("PORT", "5000") or 5000)
    SECRET_KEY = _clean("SECRET_KEY", "devnexus-local-dev-secret-change-me")
    ADMIN_API_KEY = _clean("ADMIN_API_KEY", "")
    ADMIN_EMAILS = [
        e.strip().lower()
        for e in _clean("ADMIN_EMAILS", "").split(",")
        if e.strip()
    ]
    ALLOWED_ORIGINS = list(
        dict.fromkeys(
            [
                o.strip()
                for o in _clean(
                    "ALLOWED_ORIGINS",
                    "http://localhost:3000,http://127.0.0.1:3000,http://127.0.0.1:5000",
                ).split(",")
                if o.strip()
            ]
            + [
                f"https://{_clean(var)}"
                for var in ("VERCEL_URL", "VERCEL_BRANCH_URL", "VERCEL_PROJECT_PRODUCTION_URL")
                if _clean(var)
            ]
        )
    )

    # Database
    @staticmethod
    def get_database_uri() -> str:
        db_url = _clean("DATABASE_URL", "")
        if db_url:
            if db_url.startswith("postgres://"):
                db_url = db_url.replace("postgres://", "postgresql://", 1)
            return db_url
        is_serverless = bool(os.getenv("VERCEL") or os.getenv("VERCEL_ENV"))
        sqlite_dir = Path("/tmp") if is_serverless else BASE_DIR
        return f"sqlite:///{sqlite_dir / 'inquiries.db'}"

    # Appwrite
    APPWRITE_ENDPOINT = _clean("APPWRITE_ENDPOINT", "https://cloud.appwrite.io/v1").rstrip("/")
    APPWRITE_PROJECT_ID = _clean("APPWRITE_PROJECT_ID", "")
    APPWRITE_API_KEY = _clean("APPWRITE_API_KEY", "")
    APPWRITE_DATABASE_ID = _clean("APPWRITE_DATABASE_ID", "devnexus_db")
    APPWRITE_COLLECTION_INQUIRIES = _clean("APPWRITE_COLLECTION_INQUIRIES", "inquiries")
    APPWRITE_COLLECTION_PROFILES = _clean("APPWRITE_COLLECTION_PROFILES", "profiles")
    APPWRITE_COLLECTION_PROJECTS = _clean("APPWRITE_COLLECTION_PROJECTS", "projects")
    APPWRITE_COLLECTION_PORTFOLIO = _clean("APPWRITE_COLLECTION_PORTFOLIO", "portfolio")
    APPWRITE_COLLECTION_SERVICES = _clean("APPWRITE_COLLECTION_SERVICES", "services")
    APPWRITE_COLLECTION_TESTIMONIALS = _clean("APPWRITE_COLLECTION_TESTIMONIALS", "testimonials")
    APPWRITE_BUCKET_ID = _clean("APPWRITE_BUCKET_ID", "project_briefs")
    APPWRITE_ADMIN_TEAM_ID = _clean("APPWRITE_ADMIN_TEAM_ID", "")

    # Email
    RESEND_API_KEY = _clean("RESEND_API_KEY", "")
    SENDGRID_API_KEY = _clean("SENDGRID_API_KEY", "")
    EMAIL_FROM = _clean("EMAIL_FROM", "DEVNEXUS TECH <noreply@devnexustech.com>")
    NOTIFICATION_RECEIVER = _clean("NOTIFICATION_RECEIVER", "wa363969@gmail.com")
    SMTP_HOST = _clean("SMTP_HOST", "smtp.gmail.com")
    SMTP_PORT = int(_clean("SMTP_PORT", "587") or 587)
    SMTP_USER = _clean("SMTP_USER", "")
    SMTP_PASS = _clean("SMTP_PASS", "")

    # WhatsApp Business Cloud API
    WHATSAPP_PHONE_NUMBER_ID = _clean("WHATSAPP_PHONE_NUMBER_ID", "")
    WHATSAPP_ACCESS_TOKEN = _clean("WHATSAPP_ACCESS_TOKEN", "")
    WHATSAPP_VERIFY_TOKEN = _clean("WHATSAPP_VERIFY_TOKEN", "")
    WHATSAPP_BUSINESS_NUMBER = _clean("WHATSAPP_BUSINESS_NUMBER", "923404942126")
    WHATSAPP_ADMIN_RECIPIENT = _clean("WHATSAPP_ADMIN_RECIPIENT", "")
    WHATSAPP_DEFAULT_TEMPLATE = _clean("WHATSAPP_DEFAULT_TEMPLATE", "hello_world")

    # Payments
    STRIPE_SECRET_KEY = _clean("STRIPE_SECRET_KEY", "")
    STRIPE_PUBLISHABLE_KEY = _clean("STRIPE_PUBLISHABLE_KEY", "")
    STRIPE_WEBHOOK_SECRET = _clean("STRIPE_WEBHOOK_SECRET", "")

    PAYPAL_CLIENT_ID = _clean("PAYPAL_CLIENT_ID", "")
    PAYPAL_CLIENT_SECRET = _clean("PAYPAL_CLIENT_SECRET", "")
    PAYPAL_MODE = _clean("PAYPAL_MODE", "sandbox").lower()

    PAYONEER_PAYMENT_REQUEST_BASE_URL = _clean("PAYONEER_PAYMENT_REQUEST_BASE_URL", "")
    PAYONEER_RECIPIENT_EMAIL = _clean("PAYONEER_RECIPIENT_EMAIL", "")

    JAZZCASH_MERCHANT_ID = _clean("JAZZCASH_MERCHANT_ID", "")
    JAZZCASH_PASSWORD = _clean("JAZZCASH_PASSWORD", "")
    JAZZCASH_INTEGRITY_SALT = _clean("JAZZCASH_INTEGRITY_SALT", "")
    JAZZCASH_MODE = _clean("JAZZCASH_MODE", "sandbox").lower()

    EASYPAISA_STORE_ID = _clean("EASYPAISA_STORE_ID", "")
    EASYPAISA_HASH_KEY = _clean("EASYPAISA_HASH_KEY", "")
    EASYPAISA_MODE = _clean("EASYPAISA_MODE", "sandbox").lower()

    # AI
    OPENAI_API_KEY = _clean("OPENAI_API_KEY", "")
    OPENAI_MODEL = _clean("OPENAI_MODEL", "gpt-4o-mini")
    GEMINI_API_KEY = _clean("GEMINI_API_KEY", "")
    GEMINI_MODEL = _clean("GEMINI_MODEL", "gemini-2.0-flash")

    # Automation (n8n)
    N8N_WEBHOOK_URL = _clean("N8N_WEBHOOK_URL", "")
    N8N_WEBHOOK_SECRET = _clean("N8N_WEBHOOK_SECRET", "")
    N8N_INBOUND_SECRET = _clean("N8N_INBOUND_SECRET", "")

    # Analytics
    GA4_MEASUREMENT_ID = _clean("GA4_MEASUREMENT_ID", "")
    GTM_CONTAINER_ID = _clean("GTM_CONTAINER_ID", "")
    META_PIXEL_ID = _clean("META_PIXEL_ID", "")
    GSC_VERIFICATION_TOKEN = _clean("GSC_VERIFICATION_TOKEN", "")


def get_integration_status() -> dict:
    """
    Returns factual integration readiness for every external provider.
    Never exposes raw credentials or fake ready states.
    """
    appwrite_client_ready = bool(
        _is_real_secret(Config.APPWRITE_ENDPOINT) and _is_real_secret(Config.APPWRITE_PROJECT_ID)
    )
    appwrite_server_ready = appwrite_client_ready and _is_real_secret(Config.APPWRITE_API_KEY)

    resend_ready = _is_real_secret(Config.RESEND_API_KEY)
    sendgrid_ready = _is_real_secret(Config.SENDGRID_API_KEY)
    smtp_ready = bool(
        _is_real_secret(Config.SMTP_HOST)
        and _is_real_secret(Config.SMTP_USER)
        and _is_real_secret(Config.SMTP_PASS)
    )

    whatsapp_ready = bool(
        _is_real_secret(Config.WHATSAPP_PHONE_NUMBER_ID)
        and _is_real_secret(Config.WHATSAPP_ACCESS_TOKEN)
    )

    stripe_ready = _is_real_secret(Config.STRIPE_SECRET_KEY)
    paypal_ready = bool(
        _is_real_secret(Config.PAYPAL_CLIENT_ID) and _is_real_secret(Config.PAYPAL_CLIENT_SECRET)
    )
    payoneer_ready = bool(
        _is_real_secret(Config.PAYONEER_PAYMENT_REQUEST_BASE_URL)
        and _is_real_secret(Config.PAYONEER_RECIPIENT_EMAIL)
    )
    jazzcash_ready = bool(
        _is_real_secret(Config.JAZZCASH_MERCHANT_ID)
        and _is_real_secret(Config.JAZZCASH_PASSWORD)
        and _is_real_secret(Config.JAZZCASH_INTEGRITY_SALT)
    )
    easypaisa_ready = bool(
        _is_real_secret(Config.EASYPAISA_STORE_ID) and _is_real_secret(Config.EASYPAISA_HASH_KEY)
    )

    openai_ready = _is_real_secret(Config.OPENAI_API_KEY)
    gemini_ready = _is_real_secret(Config.GEMINI_API_KEY)
    n8n_ready = _is_real_secret(Config.N8N_WEBHOOK_URL)

    return {
        "appwrite": {
            "name": "Appwrite Auth, Database & Storage",
            "category": "backend",
            "configured": appwrite_client_ready,
            "server_sync_configured": appwrite_server_ready,
            "mode": "live" if appwrite_server_ready else ("auth_only" if appwrite_client_ready else "pending_configuration"),
            "missing_vars": [
                k for k, v in [
                    ("APPWRITE_ENDPOINT", Config.APPWRITE_ENDPOINT),
                    ("APPWRITE_PROJECT_ID", Config.APPWRITE_PROJECT_ID),
                    ("APPWRITE_API_KEY", Config.APPWRITE_API_KEY),
                ] if not _is_real_secret(v)
            ],
            "notes": "Configure Google OAuth 2.0 in Appwrite Console -> Auth -> Settings -> OAuth2 Providers.",
        },
        "email": {
            "name": "Transactional Email (Resend / SendGrid / SMTP)",
            "category": "communication",
            "configured": resend_ready or sendgrid_ready or smtp_ready,
            "active_provider": "resend" if resend_ready else ("sendgrid" if sendgrid_ready else ("smtp" if smtp_ready else None)),
            "mode": "live" if (resend_ready or sendgrid_ready or smtp_ready) else "pending_configuration",
            "missing_vars": [] if (resend_ready or sendgrid_ready or smtp_ready) else ["RESEND_API_KEY (or SENDGRID_API_KEY or SMTP_USER + SMTP_PASS)"],
            "notes": "Supports Resend API (recommended), SendGrid API, or Gmail SMTP App Password.",
        },
        "whatsapp": {
            "name": "WhatsApp Business Cloud API",
            "category": "communication",
            "configured": whatsapp_ready,
            "mode": "live" if whatsapp_ready else "pending_configuration",
            "business_number": Config.WHATSAPP_BUSINESS_NUMBER,
            "missing_vars": [
                k for k, v in [
                    ("WHATSAPP_PHONE_NUMBER_ID", Config.WHATSAPP_PHONE_NUMBER_ID),
                    ("WHATSAPP_ACCESS_TOKEN", Config.WHATSAPP_ACCESS_TOKEN),
                ] if not _is_real_secret(v)
            ],
            "notes": "Meta Graph API credentials required for automated template/text messages. Direct click-to-chat link remains active.",
        },
        "openai": {
            "name": "OpenAI API",
            "category": "ai",
            "configured": openai_ready,
            "model": Config.OPENAI_MODEL,
            "mode": "live" if openai_ready else "pending_configuration",
            "missing_vars": [] if openai_ready else ["OPENAI_API_KEY"],
            "notes": "Powers AI chatbot, lead qualification, reply drafting, and requirement assistant server-side.",
        },
        "gemini": {
            "name": "Google Gemini API",
            "category": "ai",
            "configured": gemini_ready,
            "model": Config.GEMINI_MODEL,
            "mode": "live" if gemini_ready else "pending_configuration",
            "missing_vars": [] if gemini_ready else ["GEMINI_API_KEY"],
            "notes": "Powers server-side Gemini AI inference as primary or fallback LLM provider.",
        },
        "n8n": {
            "name": "n8n Workflow Automation Webhooks",
            "category": "automation",
            "configured": n8n_ready,
            "mode": "live" if n8n_ready else "pending_configuration",
            "missing_vars": [] if n8n_ready else ["N8N_WEBHOOK_URL"],
            "notes": "Fires HMAC-SHA256 signed JSON events for new inquiries, lead updates, project milestones, and payments.",
        },
        "stripe": {
            "name": "Stripe Payments",
            "category": "payments",
            "configured": stripe_ready,
            "mode": ("sandbox" if Config.STRIPE_SECRET_KEY.startswith("sk_test_") else "live") if stripe_ready else "pending_configuration",
            "missing_vars": [
                k for k, v in [
                    ("STRIPE_SECRET_KEY", Config.STRIPE_SECRET_KEY),
                    ("STRIPE_WEBHOOK_SECRET", Config.STRIPE_WEBHOOK_SECRET),
                ] if not _is_real_secret(v)
            ],
            "notes": "International card checkout, webhooks, and refunds. Requires Stripe account activation & webhook secret.",
        },
        "paypal": {
            "name": "PayPal Checkout",
            "category": "payments",
            "configured": paypal_ready,
            "mode": Config.PAYPAL_MODE if paypal_ready else "pending_configuration",
            "missing_vars": [
                k for k, v in [
                    ("PAYPAL_CLIENT_ID", Config.PAYPAL_CLIENT_ID),
                    ("PAYPAL_CLIENT_SECRET", Config.PAYPAL_CLIENT_SECRET),
                ] if not _is_real_secret(v)
            ],
            "notes": "Supports PayPal Sandbox & Live Orders API + capture & refunds.",
        },
        "payoneer": {
            "name": "Payoneer Payment Requests",
            "category": "payments",
            "configured": payoneer_ready,
            "mode": "configured_links" if payoneer_ready else "pending_configuration",
            "missing_vars": [
                k for k, v in [
                    ("PAYONEER_PAYMENT_REQUEST_BASE_URL", Config.PAYONEER_PAYMENT_REQUEST_BASE_URL),
                    ("PAYONEER_RECIPIENT_EMAIL", Config.PAYONEER_RECIPIENT_EMAIL),
                ] if not _is_real_secret(v)
            ],
            "notes": "Generates tracked Payoneer payment request links & invoice references.",
        },
        "jazzcash": {
            "name": "JazzCash Merchant Gateway (Pakistan)",
            "category": "payments",
            "configured": jazzcash_ready,
            "mode": Config.JAZZCASH_MODE if jazzcash_ready else "pending_configuration",
            "missing_vars": [
                k for k, v in [
                    ("JAZZCASH_MERCHANT_ID", Config.JAZZCASH_MERCHANT_ID),
                    ("JAZZCASH_PASSWORD", Config.JAZZCASH_PASSWORD),
                    ("JAZZCASH_INTEGRITY_SALT", Config.JAZZCASH_INTEGRITY_SALT),
                ] if not _is_real_secret(v)
            ],
            "notes": "Requires JazzCash Merchant Portal approval & Integrity Salt for HMAC-SHA256 hosted checkout.",
        },
        "easypaisa": {
            "name": "Easypaisa Merchant Gateway (Pakistan)",
            "category": "payments",
            "configured": easypaisa_ready,
            "mode": Config.EASYPAISA_MODE if easypaisa_ready else "pending_configuration",
            "missing_vars": [
                k for k, v in [
                    ("EASYPAISA_STORE_ID", Config.EASYPAISA_STORE_ID),
                    ("EASYPAISA_HASH_KEY", Config.EASYPAISA_HASH_KEY),
                ] if not _is_real_secret(v)
            ],
            "notes": "Requires Easypaisa Merchant Store ID & Hash Key for sandbox/live transaction signing.",
        },
        "analytics": {
            "name": "GA4, GTM, Google Search Console & Meta Pixel",
            "category": "marketing",
            "configured": bool(Config.GA4_MEASUREMENT_ID or Config.GTM_CONTAINER_ID or Config.META_PIXEL_ID or Config.GSC_VERIFICATION_TOKEN),
            "mode": "consent_gated" if (Config.GA4_MEASUREMENT_ID or Config.GTM_CONTAINER_ID or Config.META_PIXEL_ID) else "pending_configuration",
            "missing_vars": [
                k for k, v in [
                    ("GA4_MEASUREMENT_ID", Config.GA4_MEASUREMENT_ID),
                    ("GTM_CONTAINER_ID", Config.GTM_CONTAINER_ID),
                    ("META_PIXEL_ID", Config.META_PIXEL_ID),
                    ("GSC_VERIFICATION_TOKEN", Config.GSC_VERIFICATION_TOKEN),
                ] if not v
            ],
            "notes": "Loaded only after explicit visitor analytics consent.",
        },
    }
