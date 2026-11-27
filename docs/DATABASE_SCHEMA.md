# DEVNEXUS TECH — Database Schema Documentation

DEVNEXUS TECH supports **two synchronized data layers**:
1. **Relational SQL Layer (`server/models.py`)**: PostgreSQL in production (Neon / Supabase / RDS) with automatic SQLite fallback locally.
2. **Appwrite Database & Storage Layer** (optional mirror & user workspace storage when configured).

---

## 1. Relational SQL Tables (`server/models.py`)

| Table | Purpose | Key Columns |
|---|---|---|
| `inquiries` | Contact & Start-a-Project briefs | `id`, `user_id`, `full_name`, `email`, `phone`, `company_name`, `country`, `project_type`, `budget`, `timeline`, `message`, `requirements_json`, `status`, `lead_score`, `ai_summary`, `internal_notes`, `source`, `created_at` |
| `clients` | Verified user & CRM client records | `id`, `appwrite_user_id`, `full_name`, `email`, `phone`, `company_name`, `country`, `auth_provider`, `avatar_url`, `status`, `notes`, `created_at` |
| `projects` | Active client software projects | `id`, `client_id`, `appwrite_user_id`, `client_email`, `title`, `service_type`, `stage`, `progress_pct`, `budget_usd`, `deadline`, `description`, `milestones_json`, `updated_at` |
| `project_tasks` | Tasks & deadlines per project | `id`, `project_id`, `title`, `status`, `priority`, `due_date`, `assignee`, `created_at` |
| `portfolio_projects` | Portfolio concepts managed via CMS | `id`, `slug`, `title`, `tagline`, `category`, `badge`, `description`, `architecture`, `features_json`, `technologies_json`, `metrics_json`, `sample_code`, `is_featured`, `is_concept` |
| `services_catalog` | 9 Core services & pricing metadata | `id`, `slug`, `title`, `badge`, `short_desc`, `full_desc`, `features_json`, `benefits_json`, `technologies_json`, `starting_price_usd`, `delivery_window`, `is_active` |
| `testimonials` | Client reviews & demo slots | `id`, `author_name`, `author_role`, `company`, `region`, `quote`, `rating`, `project_type`, `is_demo`, `is_published` |
| `quotations` | Client cost quotations | `id`, `quote_number`, `client_email`, `client_name`, `project_title`, `items_json`, `currency`, `total_amount`, `status`, `valid_until` |
| `invoices` | Milestone & payment invoices | `id`, `invoice_number`, `client_email`, `client_name`, `project_id`, `description`, `currency`, `amount`, `status`, `provider`, `provider_session_id`, `payment_url`, `paid_at` |
| `payment_transactions` | Gateway transaction & refund log | `id`, `invoice_id`, `provider`, `external_id`, `amount`, `currency`, `status`, `metadata_json`, `created_at` |
| `communication_logs` | Email, WhatsApp & CRM notes history | `id`, `client_email`, `channel`, `direction`, `subject`, `summary`, `status`, `created_at` |
| `site_settings` | Announcements, SEO & WhatsApp config | `key`, `value_json`, `updated_at` |
| `audit_logs` | Security & admin action audit trail | `id`, `actor_id`, `actor_email`, `actor_role`, `action`, `resource`, `details_json`, `ip_address`, `created_at` |

---

## 2. Appwrite Database Collections (`devnexus_db`)

Create a Database ID `devnexus_db` in Appwrite Console and add these collections:

### Collection: `profiles`
- **Permissions:** Document Security ON. Authenticated users may create; read/update scoped to `Role.user(userId)`.
- **Attributes:**
  - `userId` (string, required, size 64)
  - `fullName` (string, required, size 140)
  - `email` (email, required)
  - `avatarUrl` (string, optional, size 500)
  - `authProvider` (string, required, size 40)
  - `role` (string, required, default `client`, size 20)

### Collection: `inquiries`
- **Permissions:** Server API key writes; document-level `read("user:<userId>")` assigned automatically when submitted by an authenticated user.
- **Attributes:** `localId` (integer), `userId` (string, 64), `fullName` (string, 120), `email` (email), `phone` (string, 40), `companyName` (string, 140), `country` (string, 80), `projectType` (string, 120), `budget` (string, 80), `timeline` (string, 80), `message` (string, 2000), `status` (string, 40), `createdAt` (string, 60).

### Storage Bucket: `project_briefs`
- **Permissions:** Authenticated users or guests permitted to upload RFP briefs (max file size 10 MB; allowed extensions `pdf, docx, png, jpg, txt`).
