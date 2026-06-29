# Deployment Guide — Job Mail AI

A beginner-friendly step-by-step guide to deploying Job Mail AI to production.
Total time: approximately 30 minutes.

---

## Overview

| Step | What you do | Result |
|------|------------|--------|
| 1 | Supabase setup | Database + Auth ready |
| 2 | Google Cloud OAuth setup | Login + Gmail send ready |
| 3 | Push to GitHub | Code in cloud |
| 4 | Deploy backend to Railway | FastAPI live on public URL |
| 5 | Deploy frontend to Vercel | React app live on public URL |
| 6 | Update redirect URLs | Auth works in production |
| 7 | Run smoke tests | Verify everything works |

---

## Step 1 — Supabase Setup

1. Go to [supabase.com](https://supabase.com) → Create account → New Project
2. Wait ~2 minutes for project to provision
3. Go to **SQL Editor** → paste the contents of `db_schema.sql` → Run
4. Go to **Authentication → Providers → Google** → Enable it
5. Note your credentials from **Settings → API**:
   - Project URL → `SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_KEY`

---

## Step 2 — Google Cloud OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com) → New Project
2. Enable the **Gmail API**: APIs & Services → Library → search "Gmail API" → Enable
3. Go to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
4. Application type: **Web application**
5. Add **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   https://your-vercel-app.vercel.app   ← add after Step 5
   ```
6. Add **Authorized redirect URIs**:
   ```
   http://localhost:5173/auth/callback
   https://your-vercel-app.vercel.app/auth/callback
   https://doudaunmuoufwecuasbg.supabase.co/auth/v1/callback
   ```
7. Copy **Client ID** → `GOOGLE_CLIENT_ID`
8. Copy **Client Secret** → `GOOGLE_CLIENT_SECRET`
9. In Supabase → **Authentication → Providers → Google**: paste Client ID and Secret → Save

---

## Step 3 — Push to GitHub

```bash
cd job-mail-agent

# Initialize git if not done already
git init
git add .
git commit -m "feat: Job Mail AI — complete 4-phase build"
git branch -M main

# Create repo at github.com then:
git remote add origin https://github.com/Adithya0805/job-mail-agent.git
git push -u origin main
```

> **Important:** Your `.gitignore` excludes all `.env` files. Your secrets are safe.

---

## Step 4 — Deploy Backend to Railway

### Option A: Web UI (Recommended for beginners)

1. Go to [railway.app](https://railway.app) → Sign up with GitHub
2. Click **New Project → Deploy from GitHub repo**
3. Select your `job-mail-agent` repo
4. Set **Root Directory** to `/backend`
5. Railway detects the `Dockerfile` automatically → Click **Deploy**
6. Go to **Settings → Variables → Add Variable** for each:

| Variable | Value |
|----------|-------|
| `GEMINI_API_KEY` | Your Gemini key |
| `SUPABASE_URL` | `https://doudaunmuoufwecuasbg.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Your service role key |
| `GOOGLE_CLIENT_ID` | Your Google Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google Client Secret |
| `FRONTEND_URL` | *(leave blank for now — fill after Step 5)* |
| `PYTHON_VERSION` | `3.11` |

7. Go to **Settings → Networking → Generate Domain**
8. Copy your Railway URL → looks like: `https://job-mail-agent-production.up.railway.app`

### Option B: CLI

```bash
npm install -g @railway/cli
railway login
cd backend
railway init
railway up
```

### Verify backend is live

```bash
curl https://your-railway-url.up.railway.app/health
# Expected: {"status":"ok","version":"1.0.0"}
```

---

## Step 5 — Deploy Frontend to Vercel

### Option A: Web UI (Recommended for beginners)

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **Add New Project → Import** your `job-mail-agent` repo
3. Set **Root Directory** to `/frontend`
4. Framework Preset: **Vite** (auto-detected)
5. Build Command: `npm run build` (auto-detected)
6. Output Directory: `dist` (auto-detected)
7. Add **Environment Variables**:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://doudaunmuoufwecuasbg.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `VITE_API_URL` | Your Railway URL from Step 4 |

8. Click **Deploy**
9. Copy your Vercel URL → looks like: `https://job-mail-agent.vercel.app`

### Option B: CLI

```bash
npm install -g vercel
cd frontend
vercel login
vercel --prod
```

---

## Step 6 — Update Redirect URLs

### 6a. Update Railway FRONTEND_URL

1. Railway Dashboard → Your project → Variables
2. Set `FRONTEND_URL` = `https://job-mail-agent.vercel.app`
3. Railway auto-redeploys → CORS now allows your Vercel domain

### 6b. Update Supabase redirect URLs

1. Supabase → **Authentication → URL Configuration**
2. **Site URL**: `https://job-mail-agent.vercel.app`
3. **Redirect URLs** → Add:
   ```
   http://localhost:5173/auth/callback
   https://job-mail-agent.vercel.app/auth/callback
   ```

### 6c. Update Google Cloud OAuth (if not done in Step 2)

1. Google Cloud Console → APIs & Services → Credentials
2. Edit your OAuth 2.0 Client ID
3. Add to **Authorized JavaScript origins**: `https://job-mail-agent.vercel.app`
4. Add to **Authorized redirect URIs**: `https://job-mail-agent.vercel.app/auth/callback`
5. Save

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
1. Visit your Vercel URL → see login screen
2. Click "Sign in with Google" → OAuth consent screen appears
3. After login → home page loads with your name in navbar
4. Generate an email → check your Gmail Sent folder
5. Visit `/dashboard` → application is logged

**Your app is live!**
