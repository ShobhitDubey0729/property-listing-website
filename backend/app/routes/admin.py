from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_roles
from app.models import Property, User
from app.services.property_service import eager_property, serialize_property

router = APIRouter(prefix="/api/admin", tags=["admin"])


def _load(db: Session, property_id: uuid.UUID) -> Property:
    prop = db.query(Property).options(*eager_property()).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return prop


@router.get("/properties")
def admin_properties(db: Session = Depends(get_db), _: User = Depends(require_roles("admin"))):
    rows = db.query(Property).options(*eager_property()).order_by(Property.created_at.desc()).all()
    return {"items": [serialize_property(p) for p in rows], "total": len(rows)}


def _set_status(db: Session, property_id: uuid.UUID, status: str, verified: bool | None = None) -> dict:
    prop = _load(db, property_id)
    prop.status = status
    if verified is not None:
        prop.verified = verified
    prop.updated_at = datetime.now(timezone.utc)
    db.commit()
    return serialize_property(_load(db, property_id))


@router.put("/properties/{property_id}/approve")
def approve(property_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(require_roles("admin"))):
    return _set_status(db, property_id, "approved", verified=True)


@router.put("/properties/{property_id}/reject")
def reject(property_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(require_roles("admin"))):
    return _set_status(db, property_id, "rejected")


@router.put("/properties/{property_id}/activate")
def activate(property_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(require_roles("admin"))):
    return _set_status(db, property_id, "approved")


@router.put("/properties/{property_id}/deactivate")
def deactivate(property_id: uuid.UUID, db: Session = Depends(get_db), _: User = Depends(require_roles("admin"))):
    return _set_status(db, property_id, "inactive")
