from __future__ import annotations

import uuid
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session, joinedload

from app.models import Amenity, NearbyPlace, Property, PropertyImage, SocietyRules, User


STATUS_TO_UI = {
    "approved": "live",
    "inactive": "paused",
}
UI_TO_STATUS = {
    "live": "approved",
    "paused": "inactive",
}


def _num(value) -> float | None:
    if value is None:
        return None
    if isinstance(value, Decimal):
        return float(value)
    return float(value)


def serialize_property(prop: Property, *, include_contact: bool = False) -> dict:
    owner = prop.owner
    listed_count = 0
    if owner is not None:
        listed_count = len(owner.properties) if owner.properties is not None else 0
    owner_payload = None
    if owner:
        owner_payload = {
            "name": owner.name,
            "role": owner.display_role or "Property Owner",
            "verified": bool(owner.verified),
            "member_since": owner.created_at.strftime("%b %Y") if owner.created_at else None,
            "response_time": owner.response_time or "< 1 hour",
            "rating": _num(owner.rating) or 4.9,
            "properties_listed": listed_count or 1,
        }
        if include_contact:
            owner_payload["phone"] = owner.phone
    images = [img.image_url for img in sorted(prop.images, key=lambda i: i.display_order)]
    tags = [a.name for a in prop.amenities]
    nearby = [{"name": n.name, "dist": n.distance_text} for n in prop.nearby_places]
    rules = None
    if prop.society_rules:
        r = prop.society_rules
        rules = {
            "noc_available": r.noc_available,
            "guest_turnover_allowed": r.guest_turnover_allowed,
            "smart_lock_allowed": r.smart_lock_allowed,
            "noise_curfew": r.noise_curfew,
            "cleaning_team_access": r.cleaning_team_access,
            "subletting_clause_in_contract": r.subletting_clause_in_contract,
        }
    ui_status = STATUS_TO_UI.get(prop.status, prop.status)
    created = prop.created_at.date().isoformat() if prop.created_at else None
    return {
        "id": str(prop.id),
        "title": prop.title,
        "description": prop.description,
        "property_type": prop.property_type,
        "bedrooms": prop.bedrooms,
        "bathrooms": prop.bathrooms,
        "area_sqft": prop.area_sqft,
        "furnishing_status": prop.furnishing_status,
        "address": prop.address,
        "city": prop.city,
        "locality": prop.locality,
        "pincode": prop.pincode,
        "lat": prop.latitude,
        "lng": prop.longitude,
        "mapCoords": {"x": prop.map_coord_x or 50, "y": prop.map_coord_y or 50},
        "monthly_rent": _num(prop.monthly_rent) or 0,
        "security_deposit": _num(prop.security_deposit),
        "min_lease_months": prop.min_lease_months,
        "str_friendly": prop.str_friendly,
        "str_tags": tags,
        "est_nightly_rate": _num(prop.est_nightly_rate),
        "est_occupancy_pct": _num(prop.est_occupancy_pct),
        "est_annual_roi_pct": _num(prop.est_annual_roi_pct),
        "nearby_places": nearby,
        "images": images,
        "owner": owner_payload,
        "society_rules": rules,
        "featured": prop.featured,
        "verified": prop.verified,
        "status": ui_status,
        "created_at": created,
    }


def eager_property():
    return joinedload(Property.owner).joinedload(User.properties), joinedload(Property.images), joinedload(
        Property.amenities
    ), joinedload(Property.society_rules), joinedload(Property.nearby_places)


def get_or_create_amenity(db: Session, name: str) -> Amenity:
    amenity = db.query(Amenity).filter(Amenity.name == name).first()
    if amenity:
        return amenity
    amenity = Amenity(name=name)
    db.add(amenity)
    db.flush()
    return amenity


def apply_tags(db: Session, prop: Property, tags: list[str]) -> None:
    prop.amenities.clear()
    seen = set()
    for raw in tags:
        name = raw.strip()
        if not name or name in seen:
            continue
        seen.add(name)
        prop.amenities.append(get_or_create_amenity(db, name))


def list_properties(
    db: Session,
    *,
    city: str | None = None,
    locality: str | None = None,
    property_type: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    min_bedrooms: int | None = None,
    max_bedrooms: int | None = None,
    str_friendly: bool | None = None,
    amenity: str | None = None,
    search: str | None = None,
    sort: str = "roi-desc",
    page: int = 1,
    page_size: int = 20,
    statuses: list[str] | None = None,
    owner_id: uuid.UUID | None = None,
):
    q = db.query(Property)
    statuses = statuses or ["approved"]
    q = q.filter(Property.status.in_(statuses))
    if owner_id:
        q = q.filter(Property.owner_id == owner_id)
    if city and city.lower() not in {"all cities", "all"}:
        q = q.filter(func.lower(Property.city) == city.lower())
    if locality:
        q = q.filter(func.lower(Property.locality) == locality.lower())
    if property_type and property_type.lower() not in {"all types", "all"}:
        q = q.filter(Property.property_type == property_type)
    if min_price is not None:
        q = q.filter(Property.monthly_rent >= min_price)
    if max_price is not None:
        q = q.filter(Property.monthly_rent <= max_price)
    if min_bedrooms:
        q = q.filter(Property.bedrooms >= min_bedrooms)
    if max_bedrooms:
        q = q.filter(Property.bedrooms <= max_bedrooms)
    if str_friendly is not None:
        q = q.filter(Property.str_friendly.is_(str_friendly))
    if amenity:
        q = q.join(Property.amenities).filter(Amenity.name == amenity)
    if search:
        like = f"%{search.lower()}%"
        q = q.filter(
            or_(
                func.lower(Property.title).like(like),
                func.lower(Property.city).like(like),
                func.lower(Property.locality).like(like),
                func.lower(Property.description).like(like),
            )
        )

    if sort == "price-asc":
        q = q.order_by(Property.monthly_rent.asc())
    elif sort == "price-desc":
        q = q.order_by(Property.monthly_rent.desc())
    elif sort == "newest":
        q = q.order_by(Property.created_at.desc())
    else:
        q = q.order_by(Property.est_annual_roi_pct.desc())

    total = q.distinct().count()
    page = max(page, 1)
    page_size = min(max(page_size, 1), 50)
    rows = (
        q.options(*eager_property())
        .distinct()
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return rows, total, page, page_size
