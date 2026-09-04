from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user, get_optional_user, require_roles
from app.models import NearbyPlace, Property, PropertyImage, SocietyRules, User
from app.schemas.property import PropertyCreate, PropertyUpdate
from app.services.property_service import (
    apply_tags,
    eager_property,
    list_properties,
    serialize_property,
)
from app.services.storage_service import save_property_image

router = APIRouter(prefix="/api/properties", tags=["properties"])


def _load(db: Session, property_id: uuid.UUID) -> Property:
    prop = db.query(Property).options(*eager_property()).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return prop


@router.get("")
def public_list(
    city: Optional[str] = None,
    locality: Optional[str] = None,
    property_type: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_bedrooms: Optional[int] = None,
    max_bedrooms: Optional[int] = None,
    str_friendly: Optional[bool] = None,
    amenity: Optional[str] = None,
    search: Optional[str] = None,
    sort: str = "roi-desc",
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
):
    rows, total, page, page_size = list_properties(
        db,
        city=city,
        locality=locality,
        property_type=property_type,
        min_price=min_price,
        max_price=max_price,
        min_bedrooms=min_bedrooms,
        max_bedrooms=max_bedrooms,
        str_friendly=str_friendly,
        amenity=amenity,
        search=search,
        sort=sort,
        page=page,
        page_size=page_size,
        statuses=["approved"],
    )
    return {
        "items": [serialize_property(p) for p in rows],
        "page": page,
        "page_size": page_size,
        "total": total,
    }


@router.post("", status_code=201)
def create_property(
    body: PropertyCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("owner", "admin")),
):
    prop = Property(
        owner_id=user.id,
        title=body.title,
        description=body.description,
        property_type=body.property_type,
        bedrooms=body.bedrooms,
        bathrooms=body.bathrooms,
        area_sqft=body.area_sqft,
        furnishing_status=body.furnishing_status,
        address=body.address,
        city=body.city,
        locality=body.locality,
        pincode=body.pincode,
        latitude=body.latitude,
        longitude=body.longitude,
        map_coord_x=body.map_coord_x,
        map_coord_y=body.map_coord_y,
        monthly_rent=body.monthly_rent,
        security_deposit=body.security_deposit,
        min_lease_months=body.min_lease_months,
        str_friendly=body.str_friendly,
        est_nightly_rate=body.est_nightly_rate,
        est_occupancy_pct=body.est_occupancy_pct,
        est_annual_roi_pct=body.est_annual_roi_pct,
        featured=False,
        verified=False,
        status="pending",
        updated_at=datetime.now(timezone.utc),
    )
    db.add(prop)
    db.flush()
    apply_tags(db, prop, body.str_tags)
    for i, url in enumerate(body.image_urls):
        db.add(PropertyImage(property_id=prop.id, image_url=url, is_primary=i == 0, display_order=i))
    if body.society_rules:
        r = body.society_rules
        db.add(
            SocietyRules(
                property_id=prop.id,
                noc_available=r.noc_available,
                guest_turnover_allowed=r.guest_turnover_allowed,
                smart_lock_allowed=r.smart_lock_allowed,
                noise_curfew=r.noise_curfew,
                cleaning_team_access=r.cleaning_team_access,
                subletting_clause_in_contract=r.subletting_clause_in_contract,
            )
        )
    for place in body.nearby_places:
        db.add(
            NearbyPlace(
                property_id=prop.id,
                name=place.name,
                distance_text=place.distance_text or place.dist,
            )
        )
    db.commit()
    return serialize_property(_load(db, prop.id))


@router.get("/{property_id}")
def get_property(
    property_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user),
):
    prop = _load(db, property_id)
    if prop.status != "approved":
        if not user:
            raise HTTPException(status_code=404, detail="Property not found")
        if user.role != "admin" and prop.owner_id != user.id:
            raise HTTPException(status_code=404, detail="Property not found")
    return serialize_property(prop)


@router.put("/{property_id}")
def update_property(
    property_id: uuid.UUID,
    body: PropertyUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    prop = _load(db, property_id)
    if user.role != "admin" and prop.owner_id != user.id:
        raise HTTPException(status_code=403, detail="You can only modify your own listings")
    data = body.model_dump(exclude_unset=True)
    tags = data.pop("str_tags", None)
    rules = data.pop("society_rules", None)
    if user.role != "admin" and data.get("status") in {"approved", "rejected"}:
        raise HTTPException(status_code=403, detail="Only admins can approve or reject listings")
    for key, value in data.items():
        setattr(prop, key, value)
    if tags is not None:
        apply_tags(db, prop, tags)
    if rules is not None:
        if prop.society_rules:
            for k, v in rules.items():
                setattr(prop.society_rules, k, v)
        else:
            db.add(SocietyRules(property_id=prop.id, **rules))
    prop.updated_at = datetime.now(timezone.utc)
    db.commit()
    return serialize_property(_load(db, property_id))


@router.delete("/{property_id}", status_code=200)
def delete_property(
    property_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    prop = _load(db, property_id)
    if user.role != "admin" and prop.owner_id != user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own listings")
    db.delete(prop)
    db.commit()
    return {"detail": "Property deleted"}


@router.post("/{property_id}/images", status_code=201)
async def upload_image(
    property_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    prop = _load(db, property_id)
    if user.role != "admin" and prop.owner_id != user.id:
        raise HTTPException(status_code=403, detail="You can only upload images for your own listings")
    url, path = await save_property_image(property_id, file)
    order = len(prop.images)
    img = PropertyImage(property_id=prop.id, image_url=url, storage_path=path, is_primary=order == 0, display_order=order)
    db.add(img)
    db.commit()
    db.refresh(img)
    return {"id": str(img.id), "image_url": url, "storage_path": path, "is_primary": img.is_primary}


@router.post("/{property_id}/contact")
def unlock_contact(
    property_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    prop = _load(db, property_id)
    if prop.status != "approved" and user.role != "admin" and prop.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Property not found")
    if not prop.owner or not prop.owner.phone:
        raise HTTPException(status_code=404, detail="Contact not available")
    return {"name": prop.owner.name, "phone": prop.owner.phone, "verified": prop.owner.verified}
