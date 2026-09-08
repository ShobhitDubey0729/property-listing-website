# PropLease

Full-stack marketplace connecting property owners with short-term rental operators.

- Frontend: existing HTML / CSS / vanilla JS (`frontend/`)
- Backend: FastAPI (`backend/`)
- Database: SQLite locally, PostgreSQL/Supabase in production (`database/`)

## Open in the browser (HTTP)

Do not open `index.html` as a `file://` URL.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Then visit:

| Surface | URL |
| --- | --- |
| Frontend | http://127.0.0.1:8000 |
| API docs | http://127.0.0.1:8000/docs |
| Health | http://127.0.0.1:8000/api/health |

Optional second origin for the static files:

```bash
cd frontend
python3 -m http.server 5500
```

Frontend: http://127.0.0.1:5500 — set `CORS` already allows this origin; `js/config.js` uses `window.location.origin` when served from FastAPI.

## Demo accounts

Password for all: `password123`

- `operator@proplease.local`
- `owner@proplease.local`
- `admin@proplease.local`

Header Operator / Landlord / Admin buttons sign in to these accounts. They do **not** grant privileges by writing a role into `localStorage`; the API checks the JWT.

## What changed vs the old demo

| Before | After |
| --- | --- |
| `data.js` + `localStorage` | PostgreSQL/SQLite via FastAPI |
| Fake role switcher | Real login + server-side roles |
| Public owner phones in JS | `POST /api/properties/{id}/contact` |
| Instant live listings | New listings are `pending` until admin approve |

Original seed mapping: `database/FIELD_MAPPING.md`.

## Tests

```bash
cd backend
source .venv/bin/activate
pytest
```

## Deploy (free-tier path)

1. Push this repo to GitHub.
2. Create a Supabase project, run `database/migrations/001_init.sql`, create storage bucket `property-images`.
3. Render Web Service (same origin for API + React):
   - Root Directory: `backend`
   - Build Command: `bash scripts/render-build.sh`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Set `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL=https://<service>.onrender.com`, and `CORS_ORIGINS` to that same URL. Supabase keys stay **only** on the backend.

Never put `SUPABASE_SERVICE_ROLE_KEY` in frontend JavaScript.
