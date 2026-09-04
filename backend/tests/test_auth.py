from datetime import datetime, timedelta, timezone

import jwt

from app.config import get_settings
from tests.conftest import auth_header, make_user


def test_signup_login_me(client):
    res = client.post(
        "/api/auth/signup",
        json={"name": "Neo", "email": "neo@test.local", "password": "secret12", "role": "operator"},
    )
    assert res.status_code == 201
    token = res.json()["access_token"]
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    assert me.json()["email"] == "neo@test.local"

    login = client.post("/api/auth/login", json={"email": "neo@test.local", "password": "secret12"})
    assert login.status_code == 200


def test_invalid_and_expired_token(client, db):
    bad = client.get("/api/auth/me", headers={"Authorization": "Bearer not-a-token"})
    assert bad.status_code == 401

    user = make_user(db)
    settings = get_settings()
    expired = jwt.encode(
        {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
            "exp": int((datetime.now(timezone.utc) - timedelta(minutes=1)).timestamp()),
        },
        settings.jwt_secret,
        algorithm="HS256",
    )
    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {expired}"})
    assert res.status_code == 401


def test_role_validation_admin_only(client, db):
    user = make_user(db, "operator")
    res = client.get("/api/admin/properties", headers=auth_header(user))
    assert res.status_code == 403
