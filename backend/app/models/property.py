from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import Uuid

from app.database import Base


class Property(Base):
    __tablename__ = "properties"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    property_type: Mapped[str] = mapped_column(String(80), nullable=False)
    bedrooms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    bathrooms: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    area_sqft: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    furnishing_status: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(String(400), nullable=True)
    city: Mapped[str] = mapped_column(String(120), nullable=False)
    locality: Mapped[Optional[str]] = mapped_column(String(160), nullable=True)
    pincode: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    latitude: Mapped[Optional[float]] = mapped_column(nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(nullable=True)
    map_coord_x: Mapped[Optional[float]] = mapped_column(nullable=True)
    map_coord_y: Mapped[Optional[float]] = mapped_column(nullable=True)
    monthly_rent: Mapped[Optional[float]] = mapped_column(Numeric(12, 2), nullable=True)
    security_deposit: Mapped[Optional[float]] = mapped_column(Numeric(12, 2), nullable=True)
    min_lease_months: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    str_friendly: Mapped[bool] = mapped_column(Boolean, default=False)
    est_nightly_rate: Mapped[Optional[float]] = mapped_column(Numeric(12, 2), nullable=True)
    est_occupancy_pct: Mapped[Optional[float]] = mapped_column(Numeric(5, 2), nullable=True)
    est_annual_roi_pct: Mapped[Optional[float]] = mapped_column(Numeric(6, 2), nullable=True)
    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String(20), default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    owner: Mapped[Optional["User"]] = relationship(back_populates="properties")
    images: Mapped[list["PropertyImage"]] = relationship(
        back_populates="property", cascade="all, delete-orphan", order_by="PropertyImage.display_order"
    )
    amenities: Mapped[list["Amenity"]] = relationship(secondary="property_amenities", back_populates="properties")
    society_rules: Mapped[Optional["SocietyRules"]] = relationship(
        back_populates="property", uselist=False, cascade="all, delete-orphan"
    )
    nearby_places: Mapped[list["NearbyPlace"]] = relationship(
        back_populates="property", cascade="all, delete-orphan"
    )


class PropertyImage(Base):
    __tablename__ = "property_images"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("properties.id", ondelete="CASCADE")
    )
    image_url: Mapped[str] = mapped_column(Text, nullable=False)
    storage_path: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    property: Mapped[Property] = relationship(back_populates="images")


class Amenity(Base):
    __tablename__ = "amenities"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(160), unique=True, nullable=False)

    properties: Mapped[list[Property]] = relationship(secondary="property_amenities", back_populates="amenities")


class PropertyAmenity(Base):
    __tablename__ = "property_amenities"

    property_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("properties.id", ondelete="CASCADE"), primary_key=True
    )
    amenity_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True
    )


class SocietyRules(Base):
    __tablename__ = "society_rules"

    property_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("properties.id", ondelete="CASCADE"), primary_key=True
    )
    noc_available: Mapped[bool] = mapped_column(Boolean, default=False)
    guest_turnover_allowed: Mapped[bool] = mapped_column(Boolean, default=False)
    smart_lock_allowed: Mapped[bool] = mapped_column(Boolean, default=False)
    noise_curfew: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    cleaning_team_access: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    subletting_clause_in_contract: Mapped[bool] = mapped_column(Boolean, default=False)

    property: Mapped[Property] = relationship(back_populates="society_rules")


class NearbyPlace(Base):
    __tablename__ = "nearby_places"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    property_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("properties.id", ondelete="CASCADE")
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    distance_text: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)

    property: Mapped[Property] = relationship(back_populates="nearby_places")
