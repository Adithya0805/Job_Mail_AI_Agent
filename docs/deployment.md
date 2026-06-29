# Deployment Guide — Job Mail AI

A beginner-friendly step-by-step guide to deploying Job Mail AI to production after migrating to Firebase Auth + PostgreSQL.
Total time: approximately 30 minutes.

---

## Overview

| Step | What you do | Result |
|------|------------|--------|
| 1 | Firebase Setup | Auth provider + Web app ready |
| 2 | Railway PostgreSQL Setup | Database ready |
| 3 | Google Cloud OAuth Setup | Google API credentials + Gmail send ready |
| 4 | Push to GitHub | Monorepo code uploaded |
| 5 | Deploy backend to Railway | FastAPI server live on public URL |
| 6 | Deploy frontend to Vercel | React app live on public URL |
| 7 | Run smoke tests | Verify everything works |

---

## Step 1 — Firebase Setup

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → Create account → New Project named `job-mail-ai`.
2. Disable Google Analytics (not needed).
3. Create a Web App: Click the `</>` web icon. Name it `job-mail-ai-web`.
4. Copy the `firebaseConfig` variables — you will need these for Vercel:
   - `apiKey` $\rightarrow$ `VITE_FIREBASE_API_KEY`
   - `authDomain` $\rightarrow$ `VITE_FIREBASE_AUTH_DOMAIN`
   - `projectId` $\rightarrow$ `VITE_FIREBASE_PROJECT_ID`
   - `appId` $\rightarrow$ `VITE_FIREBASE_APP_ID`
5. Enable **Google Auth**: Go to **Authentication** $\rightarrow$ **Sign-in method** $\rightarrow$ **Google** $\rightarrow$ Click **Enable** $\rightarrow$ Select project support email $\rightarrow$ Click **Save**.
6. **Get Service Account Key (For Backend)**:
   - Go to Project Settings (gear icon) $\rightarrow$ **Service accounts**.
   - Click **Generate new private key** and download the JSON.
   - You will paste this JSON as a Railway environment variable `FIREBASE_SERVICE_ACCOUNT_JSON`.

---

## Step 2 — Railway PostgreSQL Setup

1. Go to [railway.app](https://railway.app) $\rightarrow$ Open your project.
2. Click **+ New** (or Add Plugin) $\rightarrow$ **PostgreSQL**.
3. Railway provisions a Postgres database instantly.
4. Click on the **PostgreSQL** card and navigate to the **Variables** tab.
5. Copy the `DATABASE_URL` (format: `postgresql://user:pass@host:port/dbname`).
6. You will add this URL to the FastAPI backend variables in Step 5.

---

## Step 3 — Google Cloud OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → Open your project.
2. Enable the **Gmail API**: APIs & Services → Library → search "Gmail API" → Enable.
3. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**.
4. Application type: **Web application**.
5. Add **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   https://your-vercel-app.vercel.app   ← Add after Step 6
   ```
6. Add **Authorized redirect URIs**:
   - `https://your-project-id.firebaseapp.com/__/auth/handler` (This is the Firebase Auth handler URL shown in your Firebase Google Auth settings).
7. Copy **Client ID** $\rightarrow$ `GOOGLE_CLIENT_ID`
8. Copy **Client Secret** $\rightarrow$ `GOOGLE_CLIENT_SECRET`
9. In Firebase → **Authentication → Sign-in method → Google** edit settings: paste Client ID and Secret → Click **Save**.

---

## Step 4 — Push to GitHub

Stage and commit all changes, then push to main:
```bash
git add .
git commit -m "migration: firebase auth and postgresql backend"
git push
```

---

## Step 5 — Deploy Backend to Railway

1. Railway Dashboard → Click **+ New** → **Github Repo** → select `Job_Mail_AI_Agent`.
2. Go to **Settings** → Set **Root Directory** to `/`. (A root-level `railway.toml` points Railway to `backend/Dockerfile` automatically).
3. Add the following **Environment Variables** under Settings:

| Variable | Value |
|----------|-------|
| `GEMINI_API_KEY` | Your Gemini key |
| `GOOGLE_CLIENT_ID` | Your Google Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google Client Secret |
| `DATABASE_URL` | Your Railway PostgreSQL `DATABASE_URL` (includes `sslmode=require`) |
| `FRONTEND_URL` | *(leave blank for now — update after Step 6)* |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Minified content of your downloaded service account JSON (Single line, no spaces) |
| `PYTHON_VERSION` | `3.11` |

4. Go to **Settings → Networking → Generate Domain**.
5. Copy your Railway URL (e.g. `https://your-backend.up.railway.app`).

---

## Step 6 — Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project → Import** your repository.
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Vite** (auto-detected).
4. Add the following **Environment Variables**:

| Variable | Value |
|----------|-------|
| `VITE_FIREBASE_API_KEY` | Your Firebase Web App API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `<project-id>.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `<project-id>` |
| `VITE_FIREBASE_APP_ID` | Your Firebase App ID |
| `VITE_API_URL` | Your Railway backend URL from Step 5 |

5. Click **Deploy**.
6. Copy your Vercel URL (e.g., `https://your-app.vercel.app`).
7. **Final Domain Wiring**:
   - In **Railway**, update `FRONTEND_URL` to your Vercel domain.
   - In **Firebase Console → Authentication → Settings → Authorized domains**, add your Vercel domain (`your-app.vercel.app`).
   - In **Google Cloud OAuth settings**, add your Vercel domain under **Authorized JavaScript origins**.

---

## Step 7 — Run Smoke Tests

```bash
# Install test dependencies
pip install pytest httpx

# Test production backend
API_URL=https://your-railway-url.up.railway.app pytest backend/tests/ -v
```

Expected output:
```
PASSED tests/test_health.py::test_health
PASSED tests/test_health.py::test_generate_requires_auth
PASSED tests/test_health.py::test_bulk_generate_requires_auth
PASSED tests/test_health.py::test_bulk_send_requires_auth
PASSED tests/test_health.py::test_applications_requires_auth
PASSED tests/test_health.py::test_send_email_requires_auth
```

Then manually verify in browser:
1. Visit your Vercel URL → see login screen.
2. Click "Sign in with Google" → Popup window opens. Select Google account and authorize scopes.
3. After login → home page loads with avatar in navbar.
4. Generate and send an email → check Gmail Sent folder and the applications dashboard.
5. In Railway PostgreSQL plugin Data tab, verify rows are populated in both `profiles` and `applications` tables.
