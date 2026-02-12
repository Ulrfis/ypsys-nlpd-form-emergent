# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Interactive nLPD (Swiss Data Protection Law) compliance self-assessment form for medical practices, laboratories, and fiduciary firms. The form captures user responses, generates an AI-powered personalized analysis via OpenAI Assistant, and stores submissions in Supabase.

**Stack**: React 19 + Tailwind/shadcn/ui (frontend), FastAPI/Python 3.11 (backend), Supabase (database), OpenAI Assistant API (analysis), Railway (deployment)

## Development Commands

### Frontend (from project root)
```bash
cd frontend && npm install    # Install dependencies
cd frontend && npm run dev    # Start dev server (port 3000)
cd frontend && npm run build  # Production build
cd frontend && npm test       # Run tests
```

### Backend (from project root)
```bash
cd backend && pip install -r requirements.txt    # Install dependencies
cd backend && uvicorn server:app --reload        # Start dev server (port 8000)
```

### Full Stack Local
Run frontend and backend in separate terminals. Frontend dev server proxies to backend automatically when `REACT_APP_BACKEND_URL=http://localhost:8000` is set.

## Architecture

### Data Flow
1. User completes questionnaire → answers stored in `FormFlow` state
2. On submit → `generateAnalysis()` calls backend `/api/analyze` with all answers
3. Backend proxies to OpenAI Assistant → returns teaser + email templates
4. Frontend saves to Supabase (`form_submissions` + `email_outputs` tables)
5. Results displayed to user, Dreamlit triggers email sending from `email_outputs` table

### Key Files

**Frontend**
- `src/components/FormFlow.jsx` – Main orchestrator (landing → questions → analysis → results → thank you)
- `src/data/questionsData.js` – All 15 questions, options, scoring weights
- `src/lib/openai.js` – Backend proxy call, fallback response generation
- `src/lib/supabase.js` – Database writes (form_submissions, email_outputs)
- `src/context/DebugContext.js` – Debug mode (`?debug=true` URL param)

**Backend**
- `server.py` – Single FastAPI app with `/api/analyze` proxy, CORS, static file serving
- OpenAI Assistant configured via `OPENAI_ASSISTANT_ID` env var

### Environment Variables

**Frontend** (`frontend/.env`)
- `REACT_APP_BACKEND_URL` – Backend API URL (localhost:8000 for dev)
- `REACT_APP_SUPABASE_URL` / `REACT_APP_SUPABASE_ANON_KEY` – Supabase credentials

**Backend** (`backend/.env`)
- `OPENAI_API_KEY` / `OPENAI_ASSISTANT_ID` – OpenAI credentials
- `CORS_ORIGINS` – Allowed origins (optional, defaults to localhost)
- `API_ADMIN_SECRET` – Protects GET `/api/submissions` and `/api/stats` (optional)

## Important Patterns

### OpenAI Integration
- Frontend NEVER calls OpenAI directly – all calls go through `/api/analyze` backend proxy
- OpenAI keys are backend-only (never in `REACT_APP_*` variables which are bundled)
- 45-second timeout with local fallback response if OpenAI fails

### Supabase Writes
- `email_outputs` table only written when OpenAI returns BOTH `email_user` and `email_sales` with `subject` and `body_markdown`
- This triggers Dreamlit email automation – missing fields = no emails sent

### Debug Mode
Access via `?debug=true` URL param. Shows panel with:
- Full payload sent to `/api/analyze`
- OpenAI response structure
- Supabase insert results
- Personal data redacted as `[REDACTED]` in logs for GDPR/nLPD compliance

### Deployment (Railway)
- Uses Nixpacks with Python venv at `/app/venv`
- Frontend built and served as static files from backend
- `REACT_APP_*` vars must be set in Railway BEFORE build (they're compile-time)
- Config files: `nixpacks.toml`, `railway.toml`, `railway.json`, `Procfile`

## Documentation

- `docs/openai-analyze-and-supabase-flow.md` – API payload/response format
- `docs/deployment-railway-env.md` – Railway deployment troubleshooting
- `docs/supabase-schema-update.sql` – Database schema
- `docs/assistant-prompt-nlpd.md` – OpenAI Assistant prompt/instructions
- `docs/audit-securite-rgpd-nlpd.md` – GDPR/nLPD compliance audit

## Language

The application UI and all user-facing content is in **French**. Code comments and technical documentation are in English/French mix.
