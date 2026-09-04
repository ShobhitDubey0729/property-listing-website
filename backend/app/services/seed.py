from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy.orm import Session

from app.config import BACKEND_DIR
from app.database import SessionLocal
from app.models import Amenity, Favorite, Inquiry, NearbyPlace, Property, PropertyImage, SocietyRules, User
from app.models.user import LocalCredential
from app.services.auth_service import hash_password
from app.services.property_service import apply_tags

SEED_JSON = BACKEND_DIR.parent / "database" / "seed" / "frontend_seed.json"
SEED_NS = uuid.UUID("6ba7b810-9dad-11d1-80b4-00c04fd430c8")

DEMO_PASSWORD = "password123"

BASE_AMENITIES = [
    "Society NOC Ready",
    "Smart Lock Installed",
    "Private Pool",
    "Sea View",
    "High Speed Wifi",
    "High Tourist Density",
    "Separate Entry",
    "Mountain View",
    "River View",
    "Parking",
    "Gym",
    "Swimming Pool",
    "Lift",
    "Security",
    "Power Backup",
]

DEMO_USERS = [
    {
        "id": uuid.uuid5(SEED_NS, "user-operator"),
        "name": "Aman Kapoor",
        "email": "operator@proplease.local",
        "role": "operator",
        "phone": "+91 98112 34567",
        "verified": True,
        "display_role": "STR Operator",
        "response_time": "< 30 mins",
        "rating": 4.95,
    },
    {
        "id": uuid.uuid5(SEED_NS, "user-admin"),
        "name": "PropLease Admin",
        "email": "admin@proplease.local",
        "role": "admin",
        "phone": "+91 99000 00000",
        "verified": True,
        "display_role": "Platform Admin",
        "response_time": "< 1 hour",
        "rating": 5.0,
    },
]


def _parse_member_since(text: str | None) -> datetime:
    if not text:
        return datetime(2024, 1, 1, tzinfo=timezone.utc)
    try:
        return datetime.strptime(text, "%b %Y").replace(tzinfo=timezone.utc)
    except ValueError:
        return datetime(2024, 1, 1, tzinfo=timezone.utc)


def _status(raw: str) -> str:
    if raw == "live":
        return "approved"
    if raw == "paused":
        return "inactive"
    return raw if raw in {"draft", "pending", "approved", "rejected", "inactive", "rented", "sold"} else "pending"


def seed_amenities(db: Session, extra: list[str] | None = None) -> None:
    names = list(dict.fromkeys(BASE_AMENITIES + (extra or [])))
    existing = {a.name for a in db.query(Amenity).all()}
    for name in names:
        if name not in existing:
            db.add(Amenity(name=name))
    db.flush()


def seed_demo_accounts(db: Session) -> dict[str, User]:
    users = {}
    for row in DEMO_USERS:
        user = db.get(User, row["id"])
        if not user:
            user = User(**row)
            db.add(user)
            db.flush()
            db.add(LocalCredential(user_id=user.id, password_hash=hash_password(DEMO_PASSWORD)))
        users[row["role"]] = user
    return users


def seed_from_frontend_json(db: Session) -> None:
    if not SEED_JSON.exists():
        return
    payload = json.loads(SEED_JSON.read_text())
    properties = payload.get("properties", [])
    extra_tags = []
    for p in properties:
        extra_tags.extend(p.get("str_tags") or [])
    seed_amenities(db, extra_tags)
    accounts = seed_demo_accounts(db)
    operator = accounts["operator"]

    owner_by_email: dict[str, User] = {}
    for p in properties:
        owner_info = p.get("owner") or {}
        email_key = f"{owner_info.get('name', 'owner').lower().replace(' ', '.')}@owners.proplease.local"
        if email_key not in owner_by_email:
            oid = uuid.uuid5(SEED_NS, f"owner:{email_key}")
            user = db.get(User, oid)
            if not user:
                user = User(
                    id=oid,
                    name=owner_info.get("name") or "Property Owner",
                    email=email_key,
                    phone=owner_info.get("phone"),
                    role="owner",
                    verified=bool(owner_info.get("verified")),
                    display_role=owner_info.get("role") or "Property Owner",
                    response_time=owner_info.get("response_time"),
                    rating=owner_info.get("rating"),
                    created_at=_parse_member_since(owner_info.get("member_since")),
                )
                db.add(user)
                db.flush()
                db.add(LocalCredential(user_id=user.id, password_hash=hash_password(DEMO_PASSWORD)))
            owner_by_email[email_key] = user
        owner = owner_by_email[email_key]
        pid = uuid.uuid5(SEED_NS, p["id"])
        if db.get(Property, pid):
            continue
        created = None
        if p.get("created_at"):
            try:
                created = datetime.strptime(p["created_at"], "%Y-%m-%d").replace(tzinfo=timezone.utc)
            except ValueError:
                created = None
        prop = Property(
            id=pid,
            owner_id=owner.id,
            title=p["title"],
            description=p.get("description"),
            property_type=p["property_type"],
            bedrooms=p.get("bedrooms"),
            bathrooms=p.get("bathrooms"),
            area_sqft=p.get("area_sqft"),
            furnishing_status=p.get("furnishing_status"),
            address=p.get("address"),
            city=p["city"],
            locality=p.get("locality"),
            latitude=p.get("lat"),
            longitude=p.get("lng"),
            map_coord_x=(p.get("mapCoords") or {}).get("x"),
            map_coord_y=(p.get("mapCoords") or {}).get("y"),
            monthly_rent=p.get("monthly_rent"),
            security_deposit=p.get("security_deposit"),
            min_lease_months=p.get("min_lease_months"),
            str_friendly=bool(p.get("str_friendly")),
            est_nightly_rate=p.get("est_nightly_rate"),
            est_occupancy_pct=p.get("est_occupancy_pct"),
            est_annual_roi_pct=p.get("est_annual_roi_pct"),
            featured=bool(p.get("featured")),
            verified=bool(p.get("verified")),
            status=_status(p.get("status") or "pending"),
            created_at=created,
        )
        db.add(prop)
        db.flush()
        apply_tags(db, prop, p.get("str_tags") or [])
        for i, url in enumerate(p.get("images") or []):
            db.add(PropertyImage(property_id=pid, image_url=url, is_primary=i == 0, display_order=i))
        rules = p.get("society_rules") or {}
        db.add(
            SocietyRules(
                property_id=pid,
                noc_available=bool(rules.get("noc_available")),
                guest_turnover_allowed=bool(rules.get("guest_turnover_allowed")),
                smart_lock_allowed=bool(rules.get("smart_lock_allowed")),
                noise_curfew=rules.get("noise_curfew"),
                cleaning_team_access=rules.get("cleaning_team_access"),
                subletting_clause_in_contract=bool(rules.get("subletting_clause_in_contract")),
            )
        )
        for place in p.get("nearby_places") or []:
            db.add(NearbyPlace(property_id=pid, name=place.get("name"), distance_text=place.get("dist")))

    # seed operator favorites for first two properties if present
    first_ids = [uuid.uuid5(SEED_NS, p["id"]) for p in properties[:2]]
    for pid in first_ids:
        if db.get(Property, pid) and not db.query(Favorite).filter_by(user_id=operator.id, property_id=pid).first():
            db.add(Favorite(user_id=operator.id, property_id=pid))

    for inq in payload.get("inquiries") or []:
        iid = uuid.uuid5(SEED_NS, inq["id"])
        if db.get(Inquiry, iid):
            continue
        pid = uuid.uuid5(SEED_NS, inq["property_id"])
        status_map = {"New Inquiry": "new", "Reviewing": "reviewing", "Proposal Sent": "new"}
        db.add(
            Inquiry(
                id=iid,
                property_id=pid,
                operator_id=operator.id,
                message=inq.get("proposed_terms"),
                operator_display_name=inq.get("operator_name"),
                portfolio_size=inq.get("portfolio_size"),
                status=status_map.get(inq.get("status"), "new"),
            )
        )

    # convenient landlord demo account owns the Goa listing too? Keep separate owners.
    landlord = User(
        id=uuid.uuid5(SEED_NS, "user-owner"),
        name="Rohit Verma",
        email="owner@proplease.local",
        phone="+91 98200 11223",
        role="owner",
        verified=True,
        display_role="Verified Landlord",
        response_time="< 1 hr",
        rating=5.0,
    )
    if not db.get(User, landlord.id):
        db.add(landlord)
        db.flush()
        db.add(LocalCredential(user_id=landlord.id, password_hash=hash_password(DEMO_PASSWORD)))
        # attach first property to demo owner for dashboard testing
        if properties:
            first = db.get(Property, uuid.uuid5(SEED_NS, properties[0]["id"]))
            if first:
                first.owner_id = landlord.id


def seed_if_empty() -> None:
    db = SessionLocal()
    try:
        if db.query(Property).count() == 0:
            seed_from_frontend_json(db)
            db.commit()
        else:
            seed_amenities(db)
            seed_demo_accounts(db)
            db.commit()
    finally:
        db.close()


def seed_force() -> None:
    db = SessionLocal()
    try:
        seed_from_frontend_json(db)
        db.commit()
        print("Seed complete.")
        print("Demo logins (password: password123):")
        print("  operator@proplease.local")
        print("  owner@proplease.local")
        print("  admin@proplease.local")
    finally:
        db.close()
