from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.dependencies.auth import get_current_user, require_roles
from app.models import Inquiry, Property, User
from app.schemas.inquiry import InquiryCreate, InquiryStatusUpdate

router = APIRouter(tags=["inquiries"])

STATUS_LABEL = {
    "new": "New Inquiry",
    "reviewing": "Reviewing",
    "accepted": "Accepted",
    "rejected": "Rejected",
    "withdrawn": "Withdrawn",
}


def serialize_inquiry(inq: Inquiry) -> dict:
    operator = inq.operator
    prop = inq.property
    created = inq.created_at.date().isoformat() if inq.created_at else None
    return {
        "id": str(inq.id),
        "property_id": str(inq.property_id),
        "property_title": prop.title if prop else None,
        "operator_id": str(inq.operator_id),
        "operator_name": inq.operator_display_name or (operator.name if operator else "Operator"),
        "operator_rating": float(operator.rating) if operator and operator.rating is not None else 4.9,
        "portfolio_size": inq.portfolio_size or "",
        "proposed_terms": inq.message or "",
        "proposed_tenure_months": inq.proposed_tenure_months,
        "proposed_rent": float(inq.proposed_rent) if inq.proposed_rent is not None else None,
        "status": STATUS_LABEL.get(inq.status, inq.status),
        "status_code": inq.status,
        "date": created,
    }


def _load_inquiry(db: Session, inquiry_id: uuid.UUID) -> Inquiry:
    inq = (
        db.query(Inquiry)
        .options(joinedload(Inquiry.operator), joinedload(Inquiry.property))
        .filter(Inquiry.id == inquiry_id)
        .first()
    )
    if not inq:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return inq


@router.post("/api/properties/{property_id}/inquiries", status_code=201)
def create_inquiry(
    property_id: uuid.UUID,
    body: InquiryCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_roles("operator", "admin")),
):
    prop = db.get(Property, property_id)
    if not prop or prop.status != "approved":
        raise HTTPException(status_code=404, detail="Property not found")
    inq = Inquiry(
        property_id=property_id,
        operator_id=user.id,
        message=body.message,
        proposed_tenure_months=body.proposed_tenure_months,
        proposed_rent=body.proposed_rent,
        operator_display_name=body.operator_display_name or user.name,
        portfolio_size=body.portfolio_size,
        status="new",
    )
    db.add(inq)
    db.commit()
    return serialize_inquiry(_load_inquiry(db, inq.id))


@router.get("/api/inquiries")
def my_inquiries(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = (
        db.query(Inquiry)
        .options(joinedload(Inquiry.operator), joinedload(Inquiry.property))
        .filter(Inquiry.operator_id == user.id)
        .order_by(Inquiry.created_at.desc())
        .all()
    )
    return {"items": [serialize_inquiry(i) for i in rows]}


@router.get("/api/owner/inquiries")
def owner_inquiries(db: Session = Depends(get_db), user: User = Depends(require_roles("owner", "admin"))):
    q = db.query(Inquiry).options(joinedload(Inquiry.operator), joinedload(Inquiry.property))
    if user.role != "admin":
        q = q.join(Property, Inquiry.property_id == Property.id).filter(Property.owner_id == user.id)
    rows = q.order_by(Inquiry.created_at.desc()).all()
    return {"items": [serialize_inquiry(i) for i in rows]}


@router.put("/api/inquiries/{inquiry_id}/status")
def update_status(
    inquiry_id: uuid.UUID,
    body: InquiryStatusUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    inq = _load_inquiry(db, inquiry_id)
    is_owner = inq.property and inq.property.owner_id == user.id
    is_operator = inq.operator_id == user.id
    if user.role != "admin" and not is_owner:
        if not (is_operator and body.status == "withdrawn"):
            raise HTTPException(status_code=403, detail="Not allowed to update this inquiry")
    inq.status = body.status
    inq.updated_at = datetime.now(timezone.utc)
    db.commit()
    return serialize_inquiry(_load_inquiry(db, inquiry_id))
