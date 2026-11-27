# DEVNEXUS TECH — Local Development, Vercel Deployment & Custom Domain Guide

---

## 1. Running Locally

### Prerequisites
- Node.js 18+ (`node -v`, `npm -v`)
- Python 3.10+ (`python --version`)

### Backend Setup (Terminal 1)
```powershell
cd "c:\Users\user\Downloads\my portfolio"
.\server\venv\Scripts\Activate.ps1   # or create venv: python -m venv server\venv
pip install -r requirements.txt
copy server\.env.example server\.env
python run.py
# API & SQLite DB running on http://127.0.0.1:5000
```

### Frontend Setup (Terminal 2)
```powershell
cd client
npm install
copy .env.example .env
npm run dev
# Frontend running on http://localhost:3000 (auto-proxies /api/* to 127.0.0.1:5000)
```

### Production Build Check
```powershell
node build.cjs
# Runs client TypeScript check + Vite production bundle and outputs to ./dist
```

---

## 2. Deploying on Vercel
This repository includes `vercel.json`, `build.cjs`, and `api/index.py` configured for unified full-stack deployment on Vercel:
1. Push your repository to GitHub (never commit `.env` or `server/.env`).
2. Import the repository at [vercel.com](https://vercel.com) -> **Add New -> Project** (leave **Root Directory** at `./`).
3. Create a managed PostgreSQL database on [neon.tech](https://neon.tech) and copy its `DATABASE_URL` (Vercel serverless filesystems are read-only outside `/tmp`, so PostgreSQL is required for persistent production data).
4. Add environment variables in **Vercel -> Project Settings -> Environment Variables**:
   - `FLASK_ENV=production`
   - `SECRET_KEY=<long-random-secret>`
   - `DATABASE_URL=<your-neon-postgresql-uri>`
   - `ADMIN_API_KEY=<strong-admin-key>`
   - `ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com`
   - `VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1`
   - `VITE_APPWRITE_PROJECT_ID=<your-appwrite-project-id>`
   - `APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1`
   - `APPWRITE_PROJECT_ID=<your-appwrite-project-id>`
   - `APPWRITE_API_KEY=<your-appwrite-server-api-key>`
   - `ADMIN_EMAILS=<your-verified-admin-email>`
   - Optional integrations: `RESEND_API_KEY`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, `WHATSAPP_*`, `STRIPE_*`, `PAYPAL_*`, `JAZZCASH_*`, `EASYPAISA_*`, `N8N_WEBHOOK_URL`
5. Click **Deploy**.

---

## 3. Connecting a Custom Domain (e.g., `devnexustech.com`)
1. In **Vercel Project -> Settings -> Domains**, add `devnexustech.com` and `www.devnexustech.com`.
2. At your domain registrar (Namecheap, GoDaddy, Cloudflare, PKNIC):
   - Either point Nameservers to `ns1.vercel-dns.com` & `ns2.vercel-dns.com`, OR add DNS records:
     - `A` record for `@` -> `76.76.21.21`
     - `CNAME` record for `www` -> `cname.vercel-dns.com`
3. Wait for DNS propagation and automatic Let's Encrypt HTTPS provisioning in Vercel.
4. **Critical Post-Domain Step:** Add `devnexustech.com` and `www.devnexustech.com` to:
   - **Appwrite Console -> Overview -> Platforms -> Web App**
   - **Google Cloud Console -> OAuth Client -> Authorized JavaScript origins**
   - **Vercel `ALLOWED_ORIGINS`** environment variable.

---

## 4. Running Tests
```powershell
# Frontend TypeScript + Lint + Bundle
cd client
npm run typecheck
npm run lint
npm run build

# Backend Automated Verification Suite
cd ..
.\server\venv\Scripts\python.exe -m pytest tests/test_backend_api.py -v
```
