# PropLease backend

Python 3.11+ FastAPI API for the PropLease React 18 frontend.

## Local run

Terminal 1 — API:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Terminal 2 — React (Vite proxies `/api` and `/uploads` to port 8000):

```bash
cd frontend
npm install
npm run dev
```

Open:

- React app: http://localhost:5173
- API docs: http://localhost:8000/docs

To serve a production build from FastAPI on port 8000:

```bash
cd frontend && npm run build
cd ../backend && uvicorn app.main:app --reload --port 8000
```

Demo accounts (password `password123`):

- `operator@proplease.local`
- `owner@proplease.local`
- `admin@proplease.local`

## Environment

See `.env.example`. `SUPABASE_SERVICE_ROLE_KEY` must never be used in frontend JS.

Local default database is SQLite (`proplease.db`) so the MVP runs with zero paid services. To use Supabase Postgres:

1. Create a project and run `database/migrations/001_init.sql`
2. Set `DATABASE_URL` to the Supabase connection string
3. Set `JWT_SECRET` to the Supabase JWT secret (Auth settings)
4. Optional: configure Storage bucket `property-images` and wire `SUPABASE_*` keys on the backend only

## Render

The React app must be **built** on deploy. `frontend/index.html` is Vite’s development page (`/src/main.jsx`); production files live in `frontend/dist` after `npm run build`. That folder is gitignored, so `pip install` alone will serve a blank/broken site.

Web Service settings:

| Setting | Value |
| --- | --- |
| Root Directory | `backend` |
| Build Command | `bash scripts/render-build.sh` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

Environment:

- `FRONTEND_URL=https://<your-service>.onrender.com`
- `CORS_ORIGINS=https://<your-service>.onrender.com`
- `DATABASE_URL`, `JWT_SECRET` as usual

Then **Manual Deploy** so the new build command runs. Confirm the build log includes `vite build` and `dist/assets`.
