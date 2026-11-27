"""
DEVNEXUS TECH — SQLAlchemy Database Models & Safe Initialization.
Supports PostgreSQL (production) and SQLite (zero-config local dev).
"""

import json
from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import inspect, text

db = SQLAlchemy()


def _utcnow():
    return datetime.now(timezone.utc)


def _json_loads(raw: str | None, fallback):
    if not raw:
        return fallback
    try:
        return json.loads(raw)
    except Exception:
        return fallback


class Inquiry(db.Model):
    __tablename__ = "inquiries"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(64), nullable=True, index=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(150), nullable=False, index=True)
    phone = db.Column(db.String(40), nullable=True)
    company_name = db.Column(db.String(140), nullable=True)
    country = db.Column(db.String(80), nullable=False, default="Pakistan")
    project_type = db.Column(db.String(120), nullable=False)
    budget = db.Column(db.String(80), nullable=False)
    timeline = db.Column(db.String(80), nullable=True)
    message = db.Column(db.Text, nullable=False)
    requirements_json = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(40), default="New", nullable=False)
    lead_score = db.Column(db.Integer, nullable=True)
    ai_summary = db.Column(db.Text, nullable=True)
    internal_notes = db.Column(db.Text, nullable=True)
    source = db.Column(db.String(60), default="contact_form", nullable=True)
    client_ip = db.Column(db.String(50), nullable=True)
    user_agent = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=_utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=_utcnow, onupdate=_utcnow, nullable=True)

    def to_dict(self, include_private: bool = False):
        data = {
            "id": self.id,
            "user_id": self.user_id,
            "full_name": self.full_name,
            "email": self.email,
            "phone": self.phone,
            "company_name": self.company_name,
            "country": self.country,
            "project_type": self.project_type,
            "budget": self.budget,
            "timeline": self.timeline,
            "message": self.message,
            "requirements": _json_loads(self.requirements_json, {}),
            "status": self.status,
            "source": self.source,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_private:
            data["lead_score"] = self.lead_score
            data["ai_summary"] = self.ai_summary
            data["internal_notes"] = self.internal_notes
            data["client_ip"] = self.client_ip
        return data


class ClientRecord(db.Model):
    __tablename__ = "clients"

    id = db.Column(db.Integer, primary_key=True)
    appwrite_user_id = db.Column(db.String(64), nullable=True, unique=True, index=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(150), nullable=False, unique=True, index=True)
    phone = db.Column(db.String(40), nullable=True)
    company_name = db.Column(db.String(140), nullable=True)
    country = db.Column(db.String(80), nullable=True)
    auth_provider = db.Column(db.String(40), nullable=True, default="email")
    avatar_url = db.Column(db.String(500), nullable=True)
    status = db.Column(db.String(40), default="Active", nullable=False)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=_utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "appwrite_user_id": self.appwrite_user_id,
            "full_name": self.full_name,
            "email": self.email,
            "phone": self.phone,
            "company_name": self.company_name,
            "country": self.country,
            "auth_provider": self.auth_provider,
            "avatar_url": self.avatar_url,
            "status": self.status,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class ProjectRecord(db.Model):
    __tablename__ = "projects"

    id = db.Column(db.Integer, primary_key=True)
    client_id = db.Column(db.Integer, db.ForeignKey("clients.id"), nullable=True)
    appwrite_user_id = db.Column(db.String(64), nullable=True, index=True)
    client_email = db.Column(db.String(150), nullable=False, index=True)
    title = db.Column(db.String(180), nullable=False)
    service_type = db.Column(db.String(120), nullable=False)
    stage = db.Column(db.String(60), default="Discovery", nullable=False)
    progress_pct = db.Column(db.Integer, default=10, nullable=False)
    budget_usd = db.Column(db.Float, nullable=True)
    deadline = db.Column(db.String(40), nullable=True)
    description = db.Column(db.Text, nullable=True)
    milestones_json = db.Column(db.Text, nullable=True)
    internal_notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=_utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=_utcnow, onupdate=_utcnow, nullable=False)

    def to_dict(self, include_private: bool = False):
        data = {
            "id": self.id,
            "client_id": self.client_id,
            "appwrite_user_id": self.appwrite_user_id,
            "client_email": self.client_email,
            "title": self.title,
            "service_type": self.service_type,
            "stage": self.stage,
            "progress_pct": self.progress_pct,
            "budget_usd": self.budget_usd,
            "deadline": self.deadline,
            "description": self.description,
            "milestones": _json_loads(self.milestones_json, []),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_private:
            data["internal_notes"] = self.internal_notes
        return data


class ProjectTask(db.Model):
    __tablename__ = "project_tasks"

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    status = db.Column(db.String(40), default="Todo", nullable=False)
    priority = db.Column(db.String(30), default="Medium", nullable=False)
    due_date = db.Column(db.String(40), nullable=True)
    assignee = db.Column(db.String(100), nullable=True)
    created_at = db.Column(db.DateTime, default=_utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "project_id": self.project_id,
            "title": self.title,
            "status": self.status,
            "priority": self.priority,
            "due_date": self.due_date,
            "assignee": self.assignee,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class PortfolioProject(db.Model):
    __tablename__ = "portfolio_projects"

    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(120), unique=True, nullable=False, index=True)
    title = db.Column(db.String(180), nullable=False)
    tagline = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(80), nullable=False)
    badge = db.Column(db.String(80), default="Architectural Concept", nullable=False)
    description = db.Column(db.Text, nullable=False)
    architecture = db.Column(db.Text, nullable=False)
    features_json = db.Column(db.Text, nullable=False, default="[]")
    technologies_json = db.Column(db.Text, nullable=False, default="[]")
    metrics_json = db.Column(db.Text, nullable=False, default="[]")
    sample_code = db.Column(db.Text, nullable=True)
    accent_color = db.Column(db.String(30), default="#00d2ff", nullable=False)
    demo_url = db.Column(db.String(300), nullable=True)
    github_url = db.Column(db.String(300), nullable=True)
    is_featured = db.Column(db.Boolean, default=True, nullable=False)
    is_concept = db.Column(db.Boolean, default=True, nullable=False)
    sort_order = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=_utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "slug": self.slug,
            "title": self.title,
            "tagline": self.tagline,
            "category": self.category,
            "badge": self.badge,
            "description": self.description,
            "architecture": self.architecture,
            "features": _json_loads(self.features_json, []),
            "technologies": _json_loads(self.technologies_json, []),
            "metrics": _json_loads(self.metrics_json, []),
            "sample_code": self.sample_code or "",
            "accent_color": self.accent_color,
            "demo_url": self.demo_url or "",
            "github_url": self.github_url or "",
            "is_featured": self.is_featured,
            "is_concept": self.is_concept,
            "sort_order": self.sort_order,
        }


class ServiceCatalog(db.Model):
    __tablename__ = "services_catalog"

    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(100), unique=True, nullable=False, index=True)
    title = db.Column(db.String(140), nullable=False)
    badge = db.Column(db.String(60), nullable=False, default="Enterprise Ready")
    short_desc = db.Column(db.Text, nullable=False)
    full_desc = db.Column(db.Text, nullable=False)
    features_json = db.Column(db.Text, nullable=False, default="[]")
    benefits_json = db.Column(db.Text, nullable=False, default="[]")
    technologies_json = db.Column(db.Text, nullable=False, default="[]")
    starting_price_usd = db.Column(db.Integer, nullable=True)
    delivery_window = db.Column(db.String(80), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)
    sort_order = db.Column(db.Integer, default=0, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "slug": self.slug,
            "title": self.title,
            "badge": self.badge,
            "short_desc": self.short_desc,
            "full_desc": self.full_desc,
            "features": _json_loads(self.features_json, []),
            "benefits": _json_loads(self.benefits_json, []),
            "technologies": _json_loads(self.technologies_json, []),
            "starting_price_usd": self.starting_price_usd,
            "delivery_window": self.delivery_window,
            "is_active": self.is_active,
            "sort_order": self.sort_order,
        }


class TestimonialItem(db.Model):
    __tablename__ = "testimonials"

    id = db.Column(db.Integer, primary_key=True)
    author_name = db.Column(db.String(120), nullable=False)
    author_role = db.Column(db.String(120), nullable=False)
    company = db.Column(db.String(120), nullable=False)
    region = db.Column(db.String(80), nullable=False)
    quote = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer, default=5, nullable=False)
    project_type = db.Column(db.String(120), nullable=True)
    is_demo = db.Column(db.Boolean, default=True, nullable=False)
    is_published = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=_utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "author_name": self.author_name,
            "author_role": self.author_role,
            "company": self.company,
            "region": self.region,
            "quote": self.quote,
            "rating": self.rating,
            "project_type": self.project_type,
            "is_demo": self.is_demo,
            "is_published": self.is_published,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Quotation(db.Model):
    __tablename__ = "quotations"

    id = db.Column(db.Integer, primary_key=True)
    quote_number = db.Column(db.String(40), unique=True, nullable=False)
    client_email = db.Column(db.String(150), nullable=False, index=True)
    client_name = db.Column(db.String(120), nullable=False)
    project_title = db.Column(db.String(180), nullable=False)
    items_json = db.Column(db.Text, nullable=False, default="[]")
    currency = db.Column(db.String(10), default="USD", nullable=False)
    total_amount = db.Column(db.Float, nullable=False, default=0.0)
    status = db.Column(db.String(30), default="Draft", nullable=False)
    valid_until = db.Column(db.String(40), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=_utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "quote_number": self.quote_number,
            "client_email": self.client_email,
            "client_name": self.client_name,
            "project_title": self.project_title,
            "items": _json_loads(self.items_json, []),
            "currency": self.currency,
            "total_amount": self.total_amount,
            "status": self.status,
            "valid_until": self.valid_until,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Invoice(db.Model):
    __tablename__ = "invoices"

    id = db.Column(db.Integer, primary_key=True)
    invoice_number = db.Column(db.String(40), unique=True, nullable=False)
    client_email = db.Column(db.String(150), nullable=False, index=True)
    client_name = db.Column(db.String(120), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey("projects.id"), nullable=True)
    description = db.Column(db.String(300), nullable=False)
    currency = db.Column(db.String(10), default="USD", nullable=False)
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(30), default="Pending", nullable=False)
    provider = db.Column(db.String(40), nullable=True)
    provider_session_id = db.Column(db.String(180), nullable=True)
    payment_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=_utcnow, nullable=False)
    paid_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "invoice_number": self.invoice_number,
            "client_email": self.client_email,
            "client_name": self.client_name,
            "project_id": self.project_id,
            "description": self.description,
            "currency": self.currency,
            "amount": self.amount,
            "status": self.status,
            "provider": self.provider,
            "provider_session_id": self.provider_session_id,
            "payment_url": self.payment_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "paid_at": self.paid_at.isoformat() if self.paid_at else None,
        }


class PaymentTransaction(db.Model):
    __tablename__ = "payment_transactions"

    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey("invoices.id"), nullable=True)
    provider = db.Column(db.String(40), nullable=False)
    external_id = db.Column(db.String(180), nullable=True, index=True)
    amount = db.Column(db.Float, nullable=False, default=0.0)
    currency = db.Column(db.String(10), default="USD", nullable=False)
    status = db.Column(db.String(40), nullable=False)
    metadata_json = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=_utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "invoice_id": self.invoice_id,
            "provider": self.provider,
            "external_id": self.external_id,
            "amount": self.amount,
            "currency": self.currency,
            "status": self.status,
            "metadata": _json_loads(self.metadata_json, {}),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class CommunicationLog(db.Model):
    __tablename__ = "communication_logs"

    id = db.Column(db.Integer, primary_key=True)
    client_email = db.Column(db.String(150), nullable=False, index=True)
    channel = db.Column(db.String(40), nullable=False)  # email, whatsapp, ai, n8n, note
    direction = db.Column(db.String(20), default="outbound", nullable=False)
    subject = db.Column(db.String(200), nullable=True)
    summary = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(40), default="logged", nullable=False)
    created_at = db.Column(db.DateTime, default=_utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "client_email": self.client_email,
            "channel": self.channel,
            "direction": self.direction,
            "subject": self.subject,
            "summary": self.summary,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class SiteContentSetting(db.Model):
    __tablename__ = "site_settings"

    key = db.Column(db.String(100), primary_key=True)
    value_json = db.Column(db.Text, nullable=False)
    updated_at = db.Column(db.DateTime, default=_utcnow, onupdate=_utcnow, nullable=False)

    def to_dict(self):
        return {
            "key": self.key,
            "value": _json_loads(self.value_json, self.value_json),
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    id = db.Column(db.Integer, primary_key=True)
    actor_id = db.Column(db.String(80), nullable=True)
    actor_email = db.Column(db.String(150), nullable=True)
    actor_role = db.Column(db.String(40), nullable=True)
    action = db.Column(db.String(100), nullable=False)
    resource = db.Column(db.String(120), nullable=False)
    details_json = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(50), nullable=True)
    created_at = db.Column(db.DateTime, default=_utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "actor_id": self.actor_id,
            "actor_email": self.actor_email,
            "actor_role": self.actor_role,
            "action": self.action,
            "resource": self.resource,
            "details": _json_loads(self.details_json, {}),
            "ip_address": self.ip_address,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


def _migrate_inquiries_columns():
    """Safely adds newly introduced columns when upgrading an existing SQLite DB."""
    inspector = inspect(db.engine)
    if "inquiries" not in inspector.get_table_names():
        return
    existing = {col["name"] for col in inspector.get_columns("inquiries")}
    new_cols = {
        "user_id": "VARCHAR(64)",
        "phone": "VARCHAR(40)",
        "company_name": "VARCHAR(140)",
        "timeline": "VARCHAR(80)",
        "requirements_json": "TEXT",
        "lead_score": "INTEGER",
        "ai_summary": "TEXT",
        "internal_notes": "TEXT",
        "source": "VARCHAR(60) DEFAULT 'contact_form'",
        "updated_at": "DATETIME",
    }
    for col_name, col_type in new_cols.items():
        if col_name not in existing:
            db.session.execute(text(f"ALTER TABLE inquiries ADD COLUMN {col_name} {col_type}"))
    db.session.commit()


def _seed_defaults():
    """Seeds initial services, concept portfolio showcase, demo testimonials & settings if empty."""
    if ServiceCatalog.query.count() == 0:
        default_services = [
            {
                "slug": "website-development",
                "title": "Website Development",
                "badge": "Core Practice",
                "short_desc": "High-performance, accessible corporate and conversion-focused websites built with modern semantics and Core Web Vitals optimization.",
                "full_desc": "DEVNEXUS TECH engineers crisp, search-optimized, ultra-fast websites designed for ambitious Pakistani and international enterprises.",
                "features": [
                    "Custom responsive UI across mobile, tablet, and desktop",
                    "SEO metadata, Open Graph, JSON-LD schema & sitemap architecture",
                    "Sub-second asset delivery & Lighthouse performance tuning",
                    "CRM-connected inquiry capture & multi-channel notifications",
                    "Light/Dark architectural theming & WCAG accessibility",
                ],
                "benefits": [
                    "Immediate enterprise credibility with international buyers",
                    "Higher organic search visibility and conversion efficiency",
                    "Clean, maintainable codebase with 100% IP transfer",
                ],
                "technologies": ["React", "Next.js", "TypeScript", "Tailwind CSS", "HTML5/CSS3"],
                "starting_price_usd": 900,
                "delivery_window": "2 – 4 Weeks",
                "sort_order": 1,
            },
            {
                "slug": "web-application-development",
                "title": "Web Application Development",
                "badge": "Full-Stack",
                "short_desc": "Scalable SaaS products, client portals, and multi-tenant web applications engineered with resilient APIs and clean state modeling.",
                "full_desc": "From MVP launches to multi-tenant platforms, we architect secure React/Next.js frontends coupled with Node.js, Python, or Appwrite backends.",
                "features": [
                    "Real-time authentication, OAuth 2.0 & Role-Based Access Control",
                    "PostgreSQL / Appwrite database modeling & REST/GraphQL APIs",
                    "Multi-currency payment orchestration & webhook verification",
                    "Automated testing, CI/CD pipelines & Vercel/cloud deployment",
                ],
                "benefits": [
                    "Architected to scale from initial launch to high concurrency",
                    "Zero vendor lock-in with clean Git documentation",
                    "Transparent sprint milestones and staging previews",
                ],
                "technologies": ["React", "Next.js", "TypeScript", "Node.js", "Python", "PostgreSQL", "Appwrite"],
                "starting_price_usd": 2400,
                "delivery_window": "4 – 8 Weeks",
                "sort_order": 2,
            },
            {
                "slug": "ecommerce-development",
                "title": "E-commerce Development",
                "badge": "Global & Local Commerce",
                "short_desc": "Global and Pakistani storefronts with Stripe, PayPal, Payoneer, JazzCash, and Easypaisa readiness plus live inventory sync.",
                "full_desc": "Sell globally and locally with custom storefronts featuring dynamic catalog filtering, multi-currency pricing, and automated fulfillment pipelines.",
                "features": [
                    "Multi-currency pricing & dynamic facet product search",
                    "Stripe, PayPal, Payoneer, JazzCash & Easypaisa checkout adapters",
                    "Inventory locking, order tracking & automated email receipts",
                    "Merchant analytics & admin catalog management console",
                ],
                "benefits": [
                    "Seamless checkout experience for US/UK/EU and Pakistani shoppers",
                    "Reduced cart abandonment with fast mobile-first flows",
                    "Automated order notifications via Email & WhatsApp",
                ],
                "technologies": ["React", "Next.js", "Node.js", "PostgreSQL", "Stripe", "PayPal"],
                "starting_price_usd": 1800,
                "delivery_window": "3 – 6 Weeks",
                "sort_order": 3,
            },
            {
                "slug": "custom-software-development",
                "title": "Custom Software Development",
                "badge": "Bespoke Systems",
                "short_desc": "Tailor-made internal platforms, ERP modules, and specialized operational tools engineered around your exact business rules.",
                "full_desc": "When off-the-shelf SaaS tools create operational friction, DEVNEXUS TECH builds bespoke software tailored to your workflows, compliance, and scale.",
                "features": [
                    "Domain-driven architecture & normalized SQL/Appwrite schemas",
                    "Custom calculation engines, reporting & PDF/CSV exports",
                    "Granular RBAC permissions & immutable audit logs",
                    "Legacy system modernization & data migration pipelines",
                ],
                "benefits": [
                    "Eliminates spreadsheet chaos and manual errors",
                    "100% alignment with proprietary company processes",
                    "Complete source code ownership with zero per-seat fees",
                ],
                "technologies": ["Python", "Node.js", "PostgreSQL", "Appwrite", "TypeScript", "Git"],
                "starting_price_usd": 2800,
                "delivery_window": "5 – 10 Weeks",
                "sort_order": 4,
            },
            {
                "slug": "ai-chatbots",
                "title": "AI Chatbots",
                "badge": "OpenAI & Gemini",
                "short_desc": "Context-aware conversational assistants powered by OpenAI and Google Gemini with strict server-side security and lead capture.",
                "full_desc": "Deploy intelligent customer support, inquiry qualification, and knowledge-base assistants across your website and WhatsApp workflows.",
                "features": [
                    "Server-side OpenAI & Google Gemini API orchestration",
                    "Retrieval-grounded responses tailored to company docs",
                    "Automated lead capture, scoring & CRM handoff",
                    "Rate limiting, prompt guardrails & graceful fallback flows",
                ],
                "benefits": [
                    "24/7 instant responses across global time zones",
                    "Pre-qualified client briefs before human discovery calls",
                    "Zero API key exposure in browser client bundles",
                ],
                "technologies": ["Python", "Node.js", "OpenAI API", "Gemini API", "React"],
                "starting_price_usd": 1200,
                "delivery_window": "2 – 4 Weeks",
                "sort_order": 5,
            },
            {
                "slug": "ai-automation",
                "title": "AI Automation",
                "badge": "n8n Workflows",
                "short_desc": "End-to-end business process automation connecting CRMs, Email, WhatsApp, invoicing, and LLMs through n8n webhooks.",
                "full_desc": "Automate repetitive triage, client onboarding, follow-up reminders, and data enrichment using resilient n8n workflows and AI agents.",
                "features": [
                    "n8n visual workflow orchestration & HMAC-secured webhooks",
                    "AI-assisted lead qualification & automated reply drafting",
                    "WhatsApp Business Cloud & transactional email triggers",
                    "Cross-app syncing across Slack, Notion, Sheets & PostgreSQL",
                ],
                "benefits": [
                    "Saves dozens of manual operations hours every week",
                    "Faster lead response SLAs under 60 seconds",
                    "Deterministic retry handling & audit logging",
                ],
                "technologies": ["n8n", "Python", "Node.js", "OpenAI", "Gemini", "REST Webhooks"],
                "starting_price_usd": 1000,
                "delivery_window": "1 – 3 Weeks",
                "sort_order": 6,
            },
            {
                "slug": "admin-dashboard-development",
                "title": "Admin Dashboard Development",
                "badge": "Operations Control",
                "short_desc": "Executive command centers for CRM lead tracking, project milestones, invoicing, analytics, and team permissions.",
                "full_desc": "Centralize operational visibility with high-clarity dashboards featuring real-time metrics, role-based access, and multi-entity management.",
                "features": [
                    "Executive KPI analytics, pipelines & stage progression",
                    "CRM lead management, internal notes & quotation tools",
                    "Invoice tracking, payment reconciliation & audit logs",
                    "Protected admin routes & server-verified authorization",
                ],
                "benefits": [
                    "Single source of truth for leadership & ops teams",
                    "Real-time oversight over revenue, leads & deadlines",
                    "Reduced administrative overhead and faster decisions",
                ],
                "technologies": ["React", "TypeScript", "Tailwind CSS", "Appwrite", "PostgreSQL"],
                "starting_price_usd": 1900,
                "delivery_window": "3 – 6 Weeks",
                "sort_order": 7,
            },
            {
                "slug": "ui-ux-design",
                "title": "UI/UX Design",
                "badge": "Figma Systems",
                "short_desc": "Distinctive, enterprise-grade interface systems, wireframes, and interactive prototypes crafted in Figma before a line of code ships.",
                "full_desc": "We craft original visual identities, dark/light design token libraries, and conversion-focused user journeys free from generic template patterns.",
                "features": [
                    "User journey mapping & high-clarity information architecture",
                    "Interactive Figma component libraries & design tokens",
                    "Responsive breakpoint blueprints (mobile, tablet, desktop)",
                    "Motion choreography & accessible contrast validation",
                ],
                "benefits": [
                    "Validates product UX early before engineering investment",
                    "Cohesive, memorable brand differentiation",
                    "Faster frontend handoff with exact design specs",
                ],
                "technologies": ["Figma", "Design Tokens", "Framer Motion", "Tailwind CSS"],
                "starting_price_usd": 800,
                "delivery_window": "1 – 3 Weeks",
                "sort_order": 8,
            },
            {
                "slug": "api-integration",
                "title": "API Integration",
                "badge": "Systems Connectivity",
                "short_desc": "Secure integration of Appwrite, Stripe, PayPal, JazzCash, Easypaisa, WhatsApp Cloud, OpenAI, Gemini, and n8n webhooks.",
                "full_desc": "Connect third-party ecosystems reliably with server-side secret isolation, webhook signature verification, rate limiting, and error resilience.",
                "features": [
                    "Payment gateways (Stripe, PayPal, JazzCash, Easypaisa, Payoneer)",
                    "OAuth 2.0 authentication & Appwrite backend synchronization",
                    "Messaging APIs (Resend, SendGrid, WhatsApp Cloud API)",
                    "HMAC-SHA256 webhook verification & rate-limited REST proxies",
                ],
                "benefits": [
                    "Zero exposed credentials in browser code",
                    "Production-grade error recovery and auditability",
                    "Clear API documentation and testing harnesses",
                ],
                "technologies": ["Node.js", "Python", "REST APIs", "Webhooks", "Appwrite", "n8n"],
                "starting_price_usd": 750,
                "delivery_window": "1 – 3 Weeks",
                "sort_order": 9,
            },
        ]
        for svc in default_services:
            db.session.add(
                ServiceCatalog(
                    slug=svc["slug"],
                    title=svc["title"],
                    badge=svc["badge"],
                    short_desc=svc["short_desc"],
                    full_desc=svc["full_desc"],
                    features_json=json.dumps(svc["features"]),
                    benefits_json=json.dumps(svc["benefits"]),
                    technologies_json=json.dumps(svc["technologies"]),
                    starting_price_usd=svc["starting_price_usd"],
                    delivery_window=svc["delivery_window"],
                    sort_order=svc["sort_order"],
                )
            )

    if PortfolioProject.query.count() == 0:
        default_portfolio = [
            {
                "slug": "enterprise-logistics-portal",
                "title": "Enterprise Logistics Management Portal",
                "tagline": "Mission-Critical Freight Dispatch & Real-Time Route Telemetry",
                "category": "Custom Software",
                "badge": "Concept Architecture",
                "description": "Architectural concept for a commercial freight command center featuring live dispatch scheduling, GPS corridor telemetry, driver compliance tracking, and automated manifest auditing.",
                "architecture": "Python REST backend with PostgreSQL relational models, live coordinate interpolation simulator, and React TypeScript operations dashboard.",
                "features": [
                    "Real-time dispatch scheduling with corridor waypoints",
                    "Interactive GPS route telemetry with speed & ETA tracking",
                    "Driver compliance & duty status controls",
                    "Fleet fuel, payload & maintenance alerting",
                    "Immutable audit log & regulatory manifest export",
                ],
                "technologies": ["Python", "PostgreSQL", "React", "TypeScript", "Tailwind CSS", "REST API"],
                "metrics": [
                    {"label": "Telemetry Target", "value": "< 50ms"},
                    {"label": "Data Model", "value": "ACID SQL"},
                    {"label": "Status", "value": "Concept Demo"},
                ],
                "sample_code": "@api.route('/shipments/<int:id>/telemetry', methods=['POST'])\ndef advance_shipment_telemetry(id):\n    shipment = Shipment.query.get_or_404(id)\n    ratio = min(100, shipment.current_progress_pct + 10) / 100.0\n    shipment.current_lat = shipment.origin_lat + (shipment.dest_lat - shipment.origin_lat) * ratio\n    shipment.current_lng = shipment.origin_lng + (shipment.dest_lng - shipment.origin_lng) * ratio\n    db.session.commit()\n    return jsonify(shipment.to_dict()), 200",
                "accent_color": "#00d2ff",
                "github_url": "https://github.com/wa363969-sketch/enterprise-logistics-portal",
                "is_featured": True,
                "is_concept": True,
                "sort_order": 1,
            },
            {
                "slug": "omniflow-saas-analytics",
                "title": "OmniFlow SaaS Analytics & Billing",
                "tagline": "Multi-Tenant Metrics Engine, Usage Metering & Subscription Webhooks",
                "category": "Web Applications",
                "badge": "Concept Architecture",
                "description": "Concept platform demonstrating multi-tenant SaaS isolation, MRR/ARR cohort reporting, real-time API metering, and webhook-driven Stripe subscription billing.",
                "architecture": "Multi-tenant database isolation paired with asynchronous usage event ingestion and a React + Framer Motion executive financial interface.",
                "features": [
                    "Multi-tenant tenant isolation and role permissions",
                    "Live MRR, ARR, retention & cohort breakdown",
                    "Signature-verified Stripe webhook billing lifecycle",
                    "API usage metering with automated quota alerts",
                    "Printable invoice and tax calculation ledger",
                ],
                "technologies": ["Next.js", "React", "TypeScript", "Node.js", "PostgreSQL", "Stripe API"],
                "metrics": [
                    {"label": "Tenant Isolation", "value": "Row-Scoped"},
                    {"label": "Billing Sync", "value": "HMAC Verified"},
                    {"label": "Status", "value": "Concept Demo"},
                ],
                "sample_code": "@app.post('/billing/webhooks/stripe')\ndef handle_stripe_webhook():\n    sig = request.headers.get('Stripe-Signature', '')\n    if not verify_stripe_hmac(request.get_data(), sig):\n        return jsonify({'error': 'Invalid signature'}), 401\n    event = request.get_json()\n    sync_tenant_subscription(event['data']['object'])\n    return jsonify({'received': True}), 200",
                "accent_color": "#38bdf8",
                "github_url": "https://github.com/wa363969-sketch/omniflow-saas-analytics",
                "is_featured": True,
                "is_concept": True,
                "sort_order": 2,
            },
            {
                "slug": "nexus-ai-automation-desk",
                "title": "NexusAI Support & n8n Lead Engine",
                "tagline": "Gemini/OpenAI Qualification Assistant & Automated WhatsApp CRM Pipelines",
                "category": "AI & Automation",
                "badge": "Concept Architecture",
                "description": "Blueprint for an enterprise AI customer intake and lead qualification suite combining OpenAI/Gemini server-side inference with n8n, Resend, and WhatsApp Business Cloud triggers.",
                "architecture": "Server-side AI inference gateway backed by Appwrite Auth, PostgreSQL CRM tables, and HMAC-signed n8n webhook pipelines.",
                "features": [
                    "Server-side OpenAI & Google Gemini inquiry triage",
                    "Structured lead scoring & scope summarization",
                    "n8n outbound webhooks for WhatsApp & Email follow-ups",
                    "Rate-limited public chat widget with human escalation",
                    "Admin prompt tuning & audit trail inspection",
                ],
                "technologies": ["Python", "OpenAI API", "Gemini API", "n8n", "Appwrite", "React"],
                "metrics": [
                    {"label": "Key Exposure", "value": "Zero Client"},
                    {"label": "Orchestration", "value": "n8n Webhooks"},
                    {"label": "Status", "value": "Concept Demo"},
                ],
                "sample_code": "def qualify_inquiry(inquiry):\n    prompt = build_qualification_prompt(inquiry)\n    ai_json = call_gemini_or_openai(prompt)\n    dispatch_n8n_event('lead.qualified', {\n        'inquiry_id': inquiry.id,\n        'score': ai_json['score'],\n        'recommended_service': ai_json['service']\n    })\n    return ai_json",
                "accent_color": "#22d3ee",
                "github_url": "",
                "is_featured": True,
                "is_concept": True,
                "sort_order": 3,
            },
            {
                "slug": "apex-health-telemedicine",
                "title": "Apex Health Telemedicine Suite",
                "tagline": "Encrypted Consultation Scheduling & Role-Gated Health Records",
                "category": "Web Applications",
                "badge": "Concept Architecture",
                "description": "Concept healthcare portal designed for appointment booking, encrypted WebRTC video consultations, electronic intake workflows, and strict clinician-patient access isolation.",
                "architecture": "Role-based JWT authorization layer, PostgreSQL audit records, and real-time consultation room signaling.",
                "features": [
                    "Patient booking & clinician availability synchronization",
                    "Encrypted peer-to-peer WebRTC consultation rooms",
                    "Structured EHR timeline & prescription notes",
                    "Automated appointment reminders & intake forms",
                    "Clinician verification & access audit trails",
                ],
                "technologies": ["Python", "React", "PostgreSQL", "WebRTC", "TypeScript"],
                "metrics": [
                    {"label": "Access Control", "value": "Strict RBAC"},
                    {"label": "Audit Trail", "value": "Every Read"},
                    {"label": "Status", "value": "Concept Demo"},
                ],
                "sample_code": "@require_auth\ndef create_room_token(session_id):\n    session = Consultation.query.get_or_404(session_id)\n    if g.current_user['id'] not in (session.doctor_id, session.patient_id):\n        abort(403, 'Unauthorized consultation room access')\n    return jsonify({'token': issue_ephemeral_room_token(session)}), 200",
                "accent_color": "#34d399",
                "github_url": "https://github.com/wa363969-sketch/apex-health-telemedicine",
                "is_featured": True,
                "is_concept": True,
                "sort_order": 4,
            },
            {
                "slug": "shopcore-global-commerce",
                "title": "ShopCore Multi-Currency Storefront",
                "tagline": "Global & Pakistani Checkout with Stripe, PayPal, JazzCash & Easypaisa",
                "category": "E-commerce",
                "badge": "Concept Architecture",
                "description": "Concept commerce architecture supporting international USD/GBP/EUR buyers alongside Pakistani PKR checkouts, real-time SKU reservation, and admin fulfillment workflows.",
                "architecture": "Decoupled React TypeScript storefront backed by Python/Node checkout microservices and signature-verified payment callbacks.",
                "features": [
                    "Multi-currency catalog & dynamic facet filtering",
                    "Stripe, PayPal, JazzCash & Easypaisa checkout orchestration",
                    "Atomic stock lock preventing overselling",
                    "Automated invoice PDF & email confirmation pipeline",
                    "Merchant operations & refund dashboard",
                ],
                "technologies": ["React", "TypeScript", "Node.js", "PostgreSQL", "Stripe", "PayPal"],
                "metrics": [
                    {"label": "Gateways", "value": "Global + PK"},
                    {"label": "Inventory Lock", "value": "Atomic TX"},
                    {"label": "Status", "value": "Concept Demo"},
                ],
                "sample_code": "def create_checkout(invoice, provider):\n    if provider == 'stripe':\n        return create_stripe_session(invoice)\n    if provider == 'jazzcash':\n        return build_jazzcash_hmac_payload(invoice)\n    raise ValueError('Unsupported or unconfigured provider')",
                "accent_color": "#60a5fa",
                "github_url": "https://github.com/wa363969-sketch/shopcore-ecommerce",
                "is_featured": True,
                "is_concept": True,
                "sort_order": 5,
            },
        ]
        for item in default_portfolio:
            db.session.add(
                PortfolioProject(
                    slug=item["slug"],
                    title=item["title"],
                    tagline=item["tagline"],
                    category=item["category"],
                    badge=item["badge"],
                    description=item["description"],
                    architecture=item["architecture"],
                    features_json=json.dumps(item["features"]),
                    technologies_json=json.dumps(item["technologies"]),
                    metrics_json=json.dumps(item["metrics"]),
                    sample_code=item["sample_code"],
                    accent_color=item["accent_color"],
                    github_url=item["github_url"],
                    is_featured=item["is_featured"],
                    is_concept=item["is_concept"],
                    sort_order=item["sort_order"],
                )
            )

    if TestimonialItem.query.count() == 0:
        demo_testimonials = [
            {
                "author_name": "Sample Format — International SaaS Founder",
                "author_role": "Demo Testimonial Slot (UK / Europe)",
                "company": "Illustrative B2B Concept",
                "region": "United Kingdom (Demo)",
                "quote": "This space showcases how verified client feedback will appear once our founding international engagements ship. DEVNEXUS TECH prioritizes milestone clarity, clean Git handoffs, and transparent communication.",
                "rating": 5,
                "project_type": "Web Application Development",
                "is_demo": True,
                "is_published": True,
            },
            {
                "author_name": "Sample Format — Operations Director",
                "author_role": "Demo Testimonial Slot (Pakistan Enterprise)",
                "company": "Illustrative Retail Concept",
                "region": "Pakistan (Demo)",
                "quote": "Clearly labelled demonstration testimonial: highlights our focus on combining local Pakistani payment gateways (JazzCash / Easypaisa) with modern React dashboards and n8n operational automation.",
                "rating": 5,
                "project_type": "E-commerce & AI Automation",
                "is_demo": True,
                "is_published": True,
            },
            {
                "author_name": "Sample Format — Product Lead",
                "author_role": "Demo Testimonial Slot (North America)",
                "company": "Illustrative HealthTech Concept",
                "region": "United States / Canada (Demo)",
                "quote": "Clearly labelled demonstration testimonial: reflects our engineering standard—direct architect access, Appwrite authentication security, and zero fabricated agency claims.",
                "rating": 5,
                "project_type": "AI Chatbots & Custom Software",
                "is_demo": True,
                "is_published": True,
            },
        ]
        for t in demo_testimonials:
            db.session.add(TestimonialItem(**t))

    default_settings = {
        "announcement": {
            "enabled": True,
            "badge": "FOUNDING CLIENT SLOTS OPEN",
            "text": "Newly launched engineering studio accepting international & Pakistani software, AI & web projects.",
            "cta_label": "Start a Project",
            "cta_href": "/start-project",
        },
        "contact": {
            "whatsapp_number": "923404942126",
            "email": "wa363969@gmail.com",
            "company_email": "contact@devnexustech.com",
            "location": "Pakistan • Serving Global Clients (UK, USA, Canada, UAE, Australia)",
        },
        "seo": {
            "site_title": "DEVNEXUS TECH — Engineering Tomorrow's Digital World",
            "meta_description": "DEVNEXUS TECH builds intelligent software, scalable web applications, e-commerce platforms, and AI automation solutions for clients in Pakistan and worldwide.",
        },
    }
    for key, val in default_settings.items():
        if not SiteContentSetting.query.get(key):
            db.session.add(SiteContentSetting(key=key, value_json=json.dumps(val)))

    db.session.commit()


def init_db(app):
    with app.app_context():
        db.create_all()
        _migrate_inquiries_columns()
        _seed_defaults()
