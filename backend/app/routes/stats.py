from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Property

router = APIRouter(prefix="/api/stats", tags=["stats"])


@router.get("")
def marketplace_stats(db: Session = Depends(get_db)):
    active = db.query(func.count(Property.id)).filter(Property.status == "approved").scalar() or 0
    verified = (
        db.query(func.count(Property.id))
        .filter(Property.status == "approved", Property.verified.is_(True))
        .scalar()
        or 0
    )
    avg_rent = (
        db.query(func.avg(Property.monthly_rent)).filter(Property.status == "approved").scalar()
    )
    avg_roi = (
        db.query(func.avg(Property.est_annual_roi_pct)).filter(Property.status == "approved").scalar()
    )
    avg_nightly = (
        db.query(func.avg(Property.est_nightly_rate)).filter(Property.status == "approved").scalar()
    )
    avg_occ = (
        db.query(func.avg(Property.est_occupancy_pct)).filter(Property.status == "approved").scalar()
    )
    avg_operator_net = None
    if avg_rent is not None and avg_nightly is not None and avg_occ is not None:
        gross = float(avg_nightly) * 30 * (float(avg_occ) / 100)
        avg_operator_net = round(gross - float(avg_rent) - gross * 0.18, 2)

    verified_pct = round((verified / active) * 100, 1) if active else 0
    return {
        "total_active_listings": int(active),
        "verified_listing_percentage": verified_pct,
        "average_monthly_rent": round(float(avg_rent), 2) if avg_rent is not None else None,
        "average_estimated_roi": round(float(avg_roi), 1) if avg_roi is not None else None,
        "average_operator_net_profit": avg_operator_net,
    }
