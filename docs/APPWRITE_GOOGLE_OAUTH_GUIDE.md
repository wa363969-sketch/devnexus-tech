# Real Google OAuth 2.0 + Appwrite Authentication Setup Guide

Follow every step below to activate real **Continue with Google** Sign-In and Sign-Up for **DEVNEXUS TECH**.

---

## 1. Create an Appwrite Project
1. Sign in to [Appwrite Cloud](https://cloud.appwrite.io) (or open your self-hosted Appwrite Console).
2. Click **Create Project** -> Name it `DEVNEXUS TECH`.
3. Copy your **Endpoint** (e.g., `https://cloud.appwrite.io/v1`) and **Project ID**.
4. In Appwrite Console -> **Overview -> Platforms -> Add Platform -> Web App**:
   - Add `localhost` (for local Vite dev on `http://localhost:3000` and Flask `http://127.0.0.1:5000`).
   - Add your Vercel preview domain (`*.vercel.app`) and custom production domain (`devnexustech.com` and `www.devnexustech.com`).

---

## 2. Configure Google Cloud Console (OAuth 2.0)
1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project named **DEVNEXUS TECH**.
3. Go to **Google Auth Platform / APIs & Services -> OAuth consent screen**:
   - Choose **External** (or Internal for Workspace).
   - Fill **App name**: `DEVNEXUS TECH`, **User support email**, and **Developer contact email**.
   - Add **Authorized domains**: your production domain (`devnexustech.com`) and `appwrite.io` (or your custom Appwrite endpoint domain).
   - Add scopes: `openid`, `email`, `profile`.
   - While in Testing mode, add your test Google accounts under **Test users** (or publish the app for public Google Sign-In).
4. Go to **Credentials -> Create Credentials -> OAuth client ID**:
   - Application type: **Web application**.
   - Name: `DEVNEXUS TECH Appwrite Web`.
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `https://devnexustech.com`
   - **Authorized redirect URIs**:
     - Paste the exact **Callback / Redirect URI** shown inside your Appwrite Console under **Auth -> Settings -> OAuth2 Providers -> Google** (e.g. `https://cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/<YOUR_PROJECT_ID>`).
5. Copy the **Client ID** and **Client Secret** (never paste them into frontend source code!).

---

## 3. Enable Google Provider in Appwrite Console
1. In Appwrite Console, open **Auth -> Settings -> OAuth2 Providers -> Google**.
2. Toggle **Enabled** ON.
3. Paste your Google **App ID (Client ID)** and **App Secret (Client Secret)**.
4. Verify the Callback URI matches Google Cloud Console exactly.
5. Click **Update**.

---

## 4. Configure Environment Variables

### Frontend (`client/.env` and Vercel Environment Variables)
```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-appwrite-project-id
```

### Backend (`server/.env` and Vercel Environment Variables)
```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-appwrite-project-id
APPWRITE_API_KEY=your-appwrite-server-api-key
ADMIN_EMAILS=your-verified-admin-email@example.com
```

> **Security Note:** Never prefix `APPWRITE_API_KEY` or Google's OAuth Client Secret with `VITE_`. Only `VITE_APPWRITE_ENDPOINT` and `VITE_APPWRITE_PROJECT_ID` belong in the frontend.

---

## 5. Granting Administrator Access Safely
Standard Google OAuth users are **always** assigned the `"client"` role. To grant Admin Console access to a specific user:
1. In Appwrite Console -> **Auth -> Users**, open your user account and add the label `admin` (recommended), **OR**
2. Add the verified admin email to `ADMIN_EMAILS` in server environment variables, **OR**
3. Create an Appwrite Team for admins and set `APPWRITE_ADMIN_TEAM_ID`.

---

## 6. Verification Checklist
- [ ] Click **Continue with Google** on `/login` -> redirects to `accounts.google.com`.
- [ ] Complete consent -> redirects to `/auth/callback` -> verifies session & lands on `/dashboard`.
- [ ] Refresh page -> session persists via Appwrite SDK.
- [ ] Open `/admin` as a normal Google user -> blocked unless authorized as admin.
- [ ] Click **Logout** -> destroys Appwrite session and blocks `/dashboard`.
