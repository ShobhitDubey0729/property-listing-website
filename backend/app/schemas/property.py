from __future__ import annotations

from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

ALLOWED_TYPES = {"Villa", "Apartment", "Penthouse", "Independent House"}
ALLOWED_STATUS = {"draft", "pending", "approved", "rejected", "inactive", "rented", "sold"}


class SocietyRulesIn(BaseModel):
    noc_available: bool = False
    guest_turnover_allowed: bool = False
    smart_lock_allowed: bool = False
    noise_curfew: Optional[str] = None
    cleaning_team_access: Optional[str] = None
    subletting_clause_in_contract: bool = False


class NearbyPlaceIn(BaseModel):
    name: str
    dist: Optional[str] = None
    distance_text: Optional[str] = None


class PropertyCreate(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    description: Optional[str] = None
    property_type: str
    bedrooms: int = Field(ge=0, default=0)
    bathrooms: int = Field(ge=0, default=0)
    area_sqft: int = Field(gt=0)
    furnishing_status: Optional[str] = None
    address: Optional[str] = None
    city: str
    locality: Optional[str] = None
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    map_coord_x: Optional[float] = None
    map_coord_y: Optional[float] = None
    monthly_rent: float = Field(ge=0)
    security_deposit: Optional[float] = Field(default=None, ge=0)
    min_lease_months: Optional[int] = Field(default=12, ge=1)
    str_friendly: bool = True
    est_nightly_rate: Optional[float] = Field(default=None, ge=0)
    est_occupancy_pct: Optional[float] = Field(default=None, ge=0, le=100)
    est_annual_roi_pct: Optional[float] = Field(default=None, ge=-50, le=500)
    str_tags: list[str] = Field(default_factory=list)
    image_urls: list[str] = Field(default_factory=list)
    nearby_places: list[NearbyPlaceIn] = Field(default_factory=list)
    society_rules: Optional[SocietyRulesIn] = None

    @field_validator("property_type")
    @classmethod
    def valid_type(cls, v: str) -> str:
        if v not in ALLOWED_TYPES:
            raise ValueError(f"property_type must be one of {sorted(ALLOWED_TYPES)}")
        return v


class PropertyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    property_type: Optional[str] = None
    bedrooms: Optional[int] = Field(default=None, ge=0)
    bathrooms: Optional[int] = Field(default=None, ge=0)
    area_sqft: Optional[int] = Field(default=None, gt=0)
    furnishing_status: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    locality: Optional[str] = None
    monthly_rent: Optional[float] = Field(default=None, ge=0)
    security_deposit: Optional[float] = Field(default=None, ge=0)
    min_lease_months: Optional[int] = Field(default=None, ge=1)
    str_friendly: Optional[bool] = None
    est_nightly_rate: Optional[float] = Field(default=None, ge=0)
    est_occupancy_pct: Optional[float] = Field(default=None, ge=0, le=100)
    est_annual_roi_pct: Optional[float] = Field(default=None, ge=-50, le=500)
    status: Optional[str] = None
    str_tags: Optional[list[str]] = None
    society_rules: Optional[SocietyRulesIn] = None

    @field_validator("status")
    @classmethod
    def valid_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        mapped = {"live": "approved", "paused": "inactive"}.get(v, v)
        if mapped not in ALLOWED_STATUS:
            raise ValueError("invalid listing status")
        return mapped


class PropertyListResponse(BaseModel):
    items: list[dict]
    page: int
    page_size: int
    total: int
