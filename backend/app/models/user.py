from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(320), unique=True, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(40), nullable=True)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="operator")
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    display_role: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    response_time: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    rating: Mapped[Optional[float]] = mapped_column(Numeric(3, 2), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    credential: Mapped[Optional["LocalCredential"]] = relationship(back_populates="user", uselist=False)
    properties: Mapped[list["Property"]] = relationship(back_populates="owner")


class LocalCredential(Base):
    __tablename__ = "local_credentials"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)

    user: Mapped[User] = relationship(back_populates="credential")
