from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies.auth import require_roles
from app.models import User
from app.services.property_service import eager_property, list_properties, serialize_property

router = APIRouter(prefix="/api/owner", tags=["owners"])


@router.get("/properties")
def owner_properties(db: Session = Depends(get_db), user: User = Depends(require_roles("owner", "admin"))):
    statuses = ["draft", "pending", "approved", "rejected", "inactive", "rented", "sold"]
    owner_id = None if user.role == "admin" else user.id
    rows, total, page, page_size = list_properties(
        db,
        statuses=statuses,
        owner_id=owner_id,
        page=1,
        page_size=50,
        sort="newest",
    )
    return {"items": [serialize_property(p) for p in rows], "page": page, "page_size": page_size, "total": total}
