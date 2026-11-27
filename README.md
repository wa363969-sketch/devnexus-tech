# DEVNEXUS TECH — Enterprise Software & AI Agency Platform

**Tagline:** *Engineering Digital Excellence.*  
**Founder:** Shabeer Ahmed  
**Markets:** Pakistan & International Clients (UK, USA, Canada, UAE, Australia, Europe)

---

## Architecture Overview
- **Frontend (`client/`):** React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7, Framer Motion, Lucide Icons, official Appwrite Web SDK (`appwrite`).
- **Backend (`server/` & `api/index.py`):** Python Flask REST API with SQLAlchemy (PostgreSQL production / SQLite local dev), rate limiting, RBAC middleware, Appwrite JWT cryptographic verification, and server-side integration services.
- **Demo Concept Showcases (`projects/`):** Preserved full-stack reference codebases (`enterprise-logistics-portal`, `apex-health-telemedicine`, `shopcore-ecommerce`).

---

## Pages & Capabilities
- **Public Site:** Home (16 bespoke sections), About Us, Services (9 detailed practices), Filterable Portfolio & Case Study Pages (`/portfolio/:slug`), Technologies, Contact Us, Start a Project Wizard (with optional AI Requirement Assistant), Legal Privacy & Terms.
- **Theme & UX:** Persistent Dark Midnight Navy & Crisp Architectural Light Mode, Framer Motion scroll reveals, interactive HTML5 Canvas digital network, accessible navigation & mobile drawer.
- **Authentication:** Split-screen `/login`, `/register`, `/auth/callback`, `/auth/verify`, `/reset-password` using official **Appwrite Authentication + Google OAuth 2.0**.
- **Client Dashboard (`/dashboard`):** Protected user profile, real submitted inquiries, active projects, invoices & multi-gateway checkout (`Stripe`, `PayPal`, `Payoneer`, `JazzCash`, `Easypaisa`).
- **Admin Dashboard (`/admin`):** Server-authorized CRM, Inquiries, Clients, Projects, Portfolio CMS, Services, Testimonials, Invoices, Site Content, Integration Readiness Panel, and Security Audit Logs.

---

## Documentation
- [API Endpoints](docs/API_DOCUMENTATION.md)
- [Appwrite & Google OAuth 2.0 Setup](docs/APPWRITE_GOOGLE_OAUTH_GUIDE.md)
- [Database Schema (SQL + Appwrite)](docs/DATABASE_SCHEMA.md)
- [Email, WhatsApp, Payments, AI & n8n Setup](docs/INTEGRATIONS_SETUP.md)
- [Webhook Reference](docs/WEBHOOKS.md)
- [Local Run, Vercel Deployment & Custom Domain](docs/DEPLOYMENT_AND_DOMAIN.md)
