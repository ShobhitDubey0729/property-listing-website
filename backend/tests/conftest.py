from __future__ import annotations

import io
import os
import uuid
from datetime import datetime, timedelta, timezone

import jwt
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

os.environ["SEED_ON_START"] = "false"
os.environ["JWT_SECRET"] = "test-secret"
os.environ["DATABASE_URL"] = "sqlite://"

from app.config import get_settings

get_settings.cache_clear()

from app.database import Base, get_db
from app.main import app
from app.models import Property, User
from app.models.user import LocalCredential
from app.services.auth_service import create_access_token, hash_password


engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSession = sessionmaker(bind=engine, autoflush=False, autocommit=False)


@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(db):
    def override():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def make_user(db, role="operator", email=None, password="password123"):
    user = User(
        name=role.title(),
        email=email or f"{role}-{uuid.uuid4().hex[:8]}@test.local",
        role=role,
        verified=True,
        phone="+91 98000 00000",
    )
    db.add(user)
    db.flush()
    db.add(LocalCredential(user_id=user.id, password_hash=hash_password(password)))
    db.commit()
    db.refresh(user)
    return user


def auth_header(user):
    return {"Authorization": f"Bearer {create_access_token(user)}"}


def make_property(db, owner, status="approved", **kwargs):
    prop = Property(
        owner_id=owner.id,
        title=kwargs.get("title", "Test Villa"),
        description="Nice place",
        property_type=kwargs.get("property_type", "Villa"),
        bedrooms=kwargs.get("bedrooms", 2),
        bathrooms=2,
        area_sqft=1200,
        city=kwargs.get("city", "Goa"),
        locality="Anjuna",
        monthly_rent=kwargs.get("monthly_rent", 50000),
        security_deposit=100000,
        min_lease_months=12,
        str_friendly=True,
        est_nightly_rate=8000,
        est_occupancy_pct=70,
        est_annual_roi_pct=80,
        status=status,
        verified=True,
    )
    db.add(prop)
    db.commit()
    db.refresh(prop)
    return prop
