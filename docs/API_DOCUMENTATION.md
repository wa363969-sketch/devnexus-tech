# DEVNEXUS TECH — API Endpoint Documentation

Base URL (Local): `http://127.0.0.1:5000/api` (proxied automatically from Vite at `http://localhost:3000/api`)  
Base URL (Production Vercel): `https://your-domain.com/api`

---

## 1. Public Endpoints

### `GET /api/health`
Returns backend health, database connectivity (`PostgreSQL` or `SQLite`), and factual integration readiness (`configured: true/false`, `mode`). Never leaks secret values.

### `GET /api/public/bootstrap`
Returns active services (`services_catalog`), architectural portfolio concepts (`portfolio_projects`), published testimonials (`testimonials`), announcement banner (`site_settings`), public contact settings, and public analytics IDs (loaded in the browser only after visitor consent).

### `GET /api/portfolio/<slug>`
Returns full case study details for a specific portfolio project slug (`404` if not found).

### `POST /api/contact`
Validates and persists a Contact Us or Start a Project inquiry. Rate-limited (`10 requests / 300s` per IP) with honeypot `_gotcha` spam filtering.
- **Headers (Optional):** `X-Appwrite-JWT: <jwt>` (attaches verified Appwrite `user_id` if signed in)
- **Body:**
  ```json
  {
    "full_name": "Jane Doe",
    "email": "jane@company.com",
    "phone": "+44 7700 900077",
    "company_name": "Acme Ltd",
    "country": "United Kingdom",
    "project_type": "Web Application Development",
    "budget": "$3,500 – $7,500 USD",
    "timeline": "4 – 8 Weeks",
    "message": "Detailed technical requirements...",
    "source": "start_project_wizard",
    "requirements": { "requested_integrations": ["Google OAuth", "Stripe"] }
  }
  ```
- **Side Effects (reported honestly in `integrations` object):**
  - Persists to `inquiries` SQL table.
  - Mirrors to Appwrite Database if `APPWRITE_API_KEY` + `APPWRITE_PROJECT_ID` are configured.
  - Sends admin alert & client confirmation email if Resend, SendGrid, or SMTP is configured.
  - Sends WhatsApp alert if WhatsApp Cloud API credentials are configured.
  - Triggers HMAC-signed `inquiry.created` n8n webhook if `N8N_WEBHOOK_URL` is configured.

---

## 2. Authentication & Client Portal Endpoints

### `GET /api/auth/config`
Reports whether public Appwrite auth (`APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`) is configured.

### `POST /api/auth/session`
Cryptographically verifies a browser-generated Appwrite JWT against `{APPWRITE_ENDPOINT}/account`.
- **Headers:** `X-Appwrite-JWT: <jwt>` (or `Authorization: Bearer <jwt>`)
- **Behavior:** Upserts `clients` record and Appwrite `profiles` document. Resolves `role` (`"client"` or `"admin"`) strictly server-side from Appwrite user `labels`, Admin Team membership, or `ADMIN_EMAILS`. **Never grants admin privileges to standard Google sign-in users.**

### `GET /api/client/dashboard` (`@require_auth`)
Requires valid `X-Appwrite-JWT`. Returns only inquiries, projects, invoices, profile data, and notifications owned by `g.current_user`.

### `PATCH /api/client/profile` (`@require_auth`)
Updates `phone`, `company_name`, or `country` for the authenticated user's `ClientRecord`.

---

## 3. AI Endpoints (Server-Side Only)

### `POST /api/ai/chat` (Rate limited: 25 / 300s)
Forwards chat messages to Google Gemini or OpenAI server-side. Returns `{ configured: false, mode: "pending_configuration" }` if neither `OPENAI_API_KEY` nor `GEMINI_API_KEY` is configured.

### `POST /api/ai/project-assistant` (Rate limited: 15 / 300s)
Generates structured JSON scope refinements (`refined_scope`, `recommended_features`, `suggested_stack`) for `/start-project`.

### `POST /api/ai/qualify-lead` (`@require_admin`)
Scores an existing inquiry (`1-100`) and updates `lead_score` and `ai_summary` in the database.

### `POST /api/ai/draft-reply` (`@require_admin`)
Drafts a personalized client outreach email for an inquiry.

---

## 4. Payments Endpoints

### `GET /api/payments/providers`
Lists `stripe`, `paypal`, `payoneer`, `jazzcash`, and `easypaisa` with factual `configured`, `mode`, `currencies`, and `missing_vars` fields.

### `POST /api/payments/checkout` (`@require_auth`)
Initiates a payment session/request for an invoice owned by the authenticated user (or any invoice for admin). Returns HTTP `422` (`configured: false`) if the chosen gateway's merchant credentials are not set.

### `POST /api/payments/refund` (`@require_admin`)
Issues a real Stripe or PayPal capture refund when credentials are configured.

---

## 5. Admin & CRM Endpoints (`@require_admin`)
Accepts either:
- `X-Appwrite-JWT: <jwt>` for a server-verified admin user, OR
- `X-Admin-Key: <ADMIN_API_KEY>` matching the server environment variable.

Endpoints:
- `GET /api/admin/analytics`
- `GET /api/admin/inquiries`, `PATCH/DELETE /api/admin/inquiries/<id>`, `POST /api/admin/inquiries/<id>/convert-project`
- `GET/POST /api/admin/clients`
- `GET/POST /api/admin/projects`, `PATCH/DELETE /api/admin/projects/<id>`
- `POST /api/admin/tasks`, `PATCH/DELETE /api/admin/tasks/<id>`
- `GET/POST /api/admin/portfolio`, `PATCH/DELETE /api/admin/portfolio/<id>`
- `GET/POST /api/admin/services`, `PATCH/DELETE /api/admin/services/<id>`
- `GET/POST /api/admin/testimonials`, `PATCH/DELETE /api/admin/testimonials/<id>`
- `GET/POST /api/admin/quotations`, `GET/POST /api/admin/invoices`
- `GET/POST /api/admin/communications`
- `GET/PUT /api/admin/settings`
- `GET /api/admin/integrations`, `POST /api/admin/integrations/test`
- `GET /api/admin/audit-logs`
