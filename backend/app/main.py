from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.config import BACKEND_DIR, get_settings
from app.database import Base, engine
from app.models import *  # noqa: F401,F403
from app.routes import admin, auth, favorites, inquiries, owners, properties, stats

settings = get_settings()
FRONTEND_DIR = BACKEND_DIR.parent / "frontend"

app = FastAPI(title="PropLease API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(properties.router)
app.include_router(favorites.router)
app.include_router(inquiries.router)
app.include_router(owners.router)
app.include_router(admin.router)
app.include_router(stats.router)


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    if settings.seed_on_start:
        from app.services.seed import seed_if_empty

        seed_if_empty()


@app.get("/api/health")
def health():
    return {"status": "ok"}


uploads_dir = settings.uploads_path
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

DIST_DIR = FRONTEND_DIR / "dist"


def _dist_file(name: str) -> Path:
    path = DIST_DIR / name
    if not path.is_file():
        raise HTTPException(
            status_code=503,
            detail=(
                "Frontend production build is missing. On Render, set the build command to "
                "`bash scripts/render-build.sh` (Root Directory: backend) so `frontend/dist` is created."
            ),
        )
    return path


if (DIST_DIR / "assets").is_dir():
    app.mount("/assets", StaticFiles(directory=str(DIST_DIR / "assets")), name="frontend-assets")


@app.get("/")
def index():
    return FileResponse(_dist_file("index.html"))


@app.get("/login.html")
def login_page():
    return FileResponse(_dist_file("login.html"))


@app.get("/signup.html")
def signup_page():
    return FileResponse(_dist_file("signup.html"))
