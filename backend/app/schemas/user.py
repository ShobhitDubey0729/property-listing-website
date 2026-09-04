from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class SignupRequest(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: str = Field(min_length=3, max_length=320)
    password: str = Field(min_length=6, max_length=128)
    role: str = "operator"
    phone: Optional[str] = None

    @field_validator("role")
    @classmethod
    def valid_role(cls, v: str) -> str:
        if v not in {"operator", "owner"}:
            raise ValueError("role must be operator or owner")
        return v


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    password: str


class UserPublic(BaseModel):
    id: UUID
    name: str
    email: str
    phone: Optional[str] = None
    role: str
    verified: bool
    display_role: Optional[str] = None
    response_time: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic
