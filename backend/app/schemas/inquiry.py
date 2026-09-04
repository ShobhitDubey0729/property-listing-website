from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field, field_validator

INQUIRY_STATUSES = {"new", "reviewing", "accepted", "rejected", "withdrawn"}


class InquiryCreate(BaseModel):
    message: Optional[str] = None
    proposed_tenure_months: Optional[int] = Field(default=None, ge=1)
    proposed_rent: Optional[float] = Field(default=None, ge=0)
    operator_display_name: Optional[str] = None
    portfolio_size: Optional[str] = None


class InquiryStatusUpdate(BaseModel):
    status: str

    @field_validator("status")
    @classmethod
    def valid_status(cls, v: str) -> str:
        if v not in INQUIRY_STATUSES:
            raise ValueError("invalid inquiry status")
        return v
