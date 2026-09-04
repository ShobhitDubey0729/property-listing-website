import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models import Favorite, Property, User
from app.services.property_service import eager_property, serialize_property

router = APIRouter(prefix="/api/favorites", tags=["favorites"])


@router.get("")
def list_favorites(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    favs = db.query(Favorite).filter(Favorite.user_id == user.id).all()
    ids = [f.property_id for f in favs]
    props = db.query(Property).options(*eager_property()).filter(Property.id.in_(ids)).all() if ids else []
    return {"property_ids": [str(i) for i in ids], "items": [serialize_property(p) for p in props]}


@router.post("/{property_id}", status_code=201)
def add_favorite(property_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    prop = db.get(Property, property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    existing = db.query(Favorite).filter_by(user_id=user.id, property_id=property_id).first()
    if existing:
        return {"detail": "Already favorited", "property_id": str(property_id)}
    db.add(Favorite(user_id=user.id, property_id=property_id))
    db.commit()
    return {"detail": "Favorited", "property_id": str(property_id)}


@router.delete("/{property_id}")
def remove_favorite(property_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    existing = db.query(Favorite).filter_by(user_id=user.id, property_id=property_id).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Favorite not found")
    db.delete(existing)
    db.commit()
    return {"detail": "Removed", "property_id": str(property_id)}
