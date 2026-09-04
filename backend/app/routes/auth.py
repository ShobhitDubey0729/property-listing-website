from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models import User
from app.schemas.user import LoginRequest, SignupRequest, TokenResponse, UserPublic
from app.services.auth_service import authenticate, create_access_token, signup_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=TokenResponse, status_code=201)
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    user = signup_user(db, body.name, body.email, body.password, body.role, body.phone)
    return TokenResponse(access_token=create_access_token(user), user=UserPublic.model_validate(user))


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = authenticate(db, body.email, body.password)
    return TokenResponse(access_token=create_access_token(user), user=UserPublic.model_validate(user))


@router.post("/logout")
def logout():
    return {"detail": "Logged out"}


@router.get("/me", response_model=UserPublic)
def me(user: User = Depends(get_current_user)):
    return UserPublic.model_validate(user)
