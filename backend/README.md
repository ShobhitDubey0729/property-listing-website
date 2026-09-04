# PropLease backend

Python 3.11+ FastAPI API for the existing PropLease HTML/CSS/JS frontend.

## Local run

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Open:

- Frontend: http://localhost:8000
- API docs: http://localhost:8000/docs
- Alternate static frontend: `cd ../frontend && python3 -m http.server 5500`

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

Build: `pip install -r requirements.txt`  
Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`  
Root directory: `backend`
