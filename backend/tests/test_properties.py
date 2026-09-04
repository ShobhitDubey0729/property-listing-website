import uuid

from tests.conftest import auth_header, make_property, make_user


def test_create_and_get_property(client, db):
    owner = make_user(db, "owner")
    payload = {
        "title": "Sea Villa",
        "description": "Beach house",
        "property_type": "Villa",
        "bedrooms": 3,
        "bathrooms": 2,
        "area_sqft": 1800,
        "city": "Goa",
        "locality": "Anjuna",
        "monthly_rent": 90000,
        "security_deposit": 180000,
        "str_tags": ["Private Pool"],
        "image_urls": ["https://example.com/a.jpg"],
    }
    res = client.post("/api/properties", json=payload, headers=auth_header(owner))
    assert res.status_code == 201
    body = res.json()
    assert body["status"] == "pending"
    assert "phone" not in (body.get("owner") or {})
    pid = body["id"]

    hidden = client.get(f"/api/properties/{pid}")
    assert hidden.status_code == 404

    listed = client.get(f"/api/properties/{pid}", headers=auth_header(owner))
    assert listed.status_code == 200


def test_search_filter_pagination(client, db):
    owner = make_user(db, "owner")
    make_property(db, owner, city="Goa", bedrooms=3, monthly_rent=40000, title="Goa One")
    make_property(db, owner, city="Mumbai", bedrooms=1, monthly_rent=120000, title="Mum One")
    res = client.get("/api/properties", params={"city": "Goa", "min_bedrooms": 2, "max_price": 50000, "page": 1, "page_size": 1})
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 1
    assert data["page_size"] == 1
    assert data["items"][0]["city"] == "Goa"


def test_unauthorized_update_and_missing(client, db):
    owner = make_user(db, "owner")
    other = make_user(db, "owner", email="other@test.local")
    prop = make_property(db, owner)
    res = client.put(f"/api/properties/{prop.id}", json={"title": "Hacked"}, headers=auth_header(other))
    assert res.status_code == 403
    res = client.put(f"/api/properties/{uuid.uuid4()}", json={"title": "Nope"}, headers=auth_header(owner))
    assert res.status_code == 404


def test_delete_property(client, db):
    owner = make_user(db, "owner")
    prop = make_property(db, owner)
    res = client.delete(f"/api/properties/{prop.id}", headers=auth_header(owner))
    assert res.status_code == 200
    assert client.get(f"/api/properties/{prop.id}", headers=auth_header(owner)).status_code == 404
