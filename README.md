# Job Mail AI

> Generate and send personalized job application emails in seconds — powered by Google Gemini.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com)

---

## What it does

Job Mail AI is a full-stack web application that generates tailored cold emails for job applications using your profile data and a job description. Write once, apply everywhere — including bulk sending to 25 companies at once.

---

## Features

- **One-time profile setup** — your skills, projects, and education are reused for every application
- **AI-generated emails** tailored to each job description (Google Gemini 1.5 Flash)
- **3 generation modes** — Simple, Professional, Advanced
- **Send directly from your Gmail** — no copy-paste, no forwarding
- **Bulk apply** — upload a CSV, generate + send up to 25 emails at once with live progress tracking
- **Application tracker** — every sent email is logged with status management (Sent → Replied → Interview → Offer)
- **Real-time SSE streaming** — watch each email generate live, card by card

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18 + Vite + Tailwind CSS    |
| Backend    | FastAPI (Python 3.11)             |
| AI         | Google Gemini 1.5 Flash           |
| Auth       | Supabase + Google OAuth 2.0       |
| Database   | Supabase Postgres (with RLS)      |
| Email      | Gmail API (sends from user Gmail) |
| Deploy     | Vercel (frontend) + Railway (backend) |

---

## Local Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- A [Supabase](https://supabase.com) account (free)
- A [Google Cloud](https://console.cloud.google.com) project with OAuth 2.0 credentials (free)
- A [Gemini API key](https://aistudio.google.com) (free)

### Backend

```bash
cd backend
cp .env.example .env
# Fill in all values in .env (see Environment Variables table below)
pip install -r requirements.txt
uvicorn main:app --reload
# Backend running at http://localhost:8000
# Health check: http://localhost:8000/health
```

### Frontend

```bash
cd frontend
cp .env.development .env.local
# Confirm VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and VITE_API_URL are set
npm install
npm run dev
# App running at http://localhost:5173
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable              | Description                                      | Where to get it                        |
|-----------------------|--------------------------------------------------|----------------------------------------|
| `GEMINI_API_KEY`      | Google Gemini API key                            | [aistudio.google.com](https://aistudio.google.com) |
| `SUPABASE_URL`        | Your Supabase project URL                        | Supabase → Settings → API             |
| `SUPABASE_SERVICE_KEY`| Supabase service role key (admin access)         | Supabase → Settings → API             |
| `GOOGLE_CLIENT_ID`    | OAuth 2.0 Client ID                              | Google Cloud → Credentials            |
| `GOOGLE_CLIENT_SECRET`| OAuth 2.0 Client Secret                          | Google Cloud → Credentials            |
| `FRONTEND_URL`        | Comma-separated list of allowed frontend origins | Your Vercel URL after deploy           |

### Frontend (`frontend/.env.development`)

| Variable               | Description                        | Where to get it                   |
|------------------------|------------------------------------|-----------------------------------|
| `VITE_SUPABASE_URL`    | Your Supabase project URL          | Supabase → Settings → API        |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key    | Supabase → Settings → API        |
| `VITE_API_URL`         | Backend base URL                   | `http://localhost:8000` for local |

---

## Deployment

See [docs/deployment.md](docs/deployment.md) for the full step-by-step guide.

**Quick summary:**
1. Push to GitHub
2. Deploy backend to [Railway](https://railway.app) → set env vars
3. Deploy frontend to [Vercel](https://vercel.com) → set env vars
4. Update Supabase redirect URLs + Google Cloud OAuth URIs

---

## Project Structure

```
job-mail-agent/
├── backend/
│   ├── middleware/
│   │   └── auth.py              # JWT verification via Supabase
│   ├── routes/
│   │   ├── profile.py           # GET/POST user profile
│   │   ├── generate.py          # POST /api/generate (Gemini)
│   │   ├── send_email.py        # POST /api/send-email (Gmail)
│   │   ├── applications.py      # CRUD /api/applications
│   │   └── bulk.py              # SSE /api/bulk/generate + /send
│   ├── services/
│   │   ├── gemini_service.py    # Gemini API wrapper
│   │   ├── gmail_service.py     # Gmail API + token refresh
│   │   ├── supabase_admin.py    # Service role DB operations
│   │   └── bulk_generator.py   # Sequential bulk Gemini calls
│   ├── tests/
│   │   └── test_health.py       # Smoke tests
│   ├── Dockerfile               # Production Docker image
│   ├── railway.toml             # Railway deploy config
│   ├── main.py                  # FastAPI app + CORS + health
│   └── requirements.txt         # Pinned dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthButton.jsx
│   │   │   ├── BulkProgressPanel.jsx
│   │   │   ├── BulkReviewPanel.jsx
│   │   │   ├── BulkSendPanel.jsx
│   │   │   ├── EmailPreview.jsx
│   │   │   ├── JobInputForm.jsx
│   │   │   ├── ModeSelector.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProfileForm.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── hooks/
│   │   │   ├── useApplications.js
│   │   │   ├── useAuth.js
│   │   │   ├── useBulkGenerate.js
│   │   │   ├── useBulkSend.js
│   │   │   └── useSendEmail.js
│   │   ├── lib/
│   │   │   └── supabase.js      # Supabase client + Google OAuth
│   │   ├── pages/
│   │   │   ├── AuthCallback.jsx
│   │   │   ├── BulkApply.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Home.jsx
│   │   ├── services/
│   │   │   └── api.js           # All fetch calls (env-aware)
│   │   ├── store/
│   │   │   ├── useBulkStore.js
│   │   │   └── useProfileStore.js
│   │   └── utils/
│   │       ├── csvParser.js
│   │       └── reportGenerator.js
│   ├── vercel.json              # SPA routing + security headers
│   ├── vite.config.js           # Build optimization + chunks
│   └── index.html
│
├── docs/
│   └── deployment.md
├── db_schema.sql                # Supabase migration SQL
├── .gitignore
└── README.md
```

---

## API Endpoints

| Method | Endpoint                  | Auth | Description                          |
|--------|---------------------------|------|--------------------------------------|
| GET    | `/health`                 | No   | Health check                         |
| GET    | `/api/profile`            | Yes  | Get user profile                     |
| POST   | `/api/profile`            | Yes  | Save user profile                    |
| POST   | `/api/generate`           | Yes  | Generate email with Gemini           |
| POST   | `/api/send-email`         | Yes  | Send email via Gmail + log to DB     |
| GET    | `/api/applications`       | Yes  | List all user applications           |
| PATCH  | `/api/applications/{id}/status` | Yes | Update application status      |
| DELETE | `/api/applications/{id}`  | Yes  | Delete an application log            |
| POST   | `/api/bulk/validate`      | Yes  | Server-side CSV validation           |
| POST   | `/api/bulk/generate`      | Yes  | SSE: Bulk Gemini generation stream   |
| POST   | `/api/bulk/send`          | Yes  | SSE: Bulk Gmail send stream          |

---

## Running Smoke Tests

```bash
# Test local backend
cd backend
pip install pytest httpx
pytest tests/ -v

# Test production backend
API_URL=https://your-railway-url.up.railway.app pytest tests/ -v
```

---

## Built by

**Adithya Kuppusamy**  
B.Tech AI & Data Science | Dhanalakshmi Srinivasan College of Engineering  
[GitHub](https://github.com/Adithya0805) · [LinkedIn](https://linkedin.com/in/adithya-kuppusamy-76baab204)
