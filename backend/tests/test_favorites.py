from tests.conftest import auth_header, make_property, make_user


def test_favorites_flow(client, db):
    owner = make_user(db, "owner")
    op = make_user(db, "operator")
    prop = make_property(db, owner)

    add = client.post(f"/api/favorites/{prop.id}", headers=auth_header(op))
    assert add.status_code == 201
    dup = client.post(f"/api/favorites/{prop.id}", headers=auth_header(op))
    assert dup.status_code == 201
    listed = client.get("/api/favorites", headers=auth_header(op))
    assert str(prop.id) in listed.json()["property_ids"]
    removed = client.delete(f"/api/favorites/{prop.id}", headers=auth_header(op))
    assert removed.status_code == 200


def test_favorites_unauthorized(client, db):
    owner = make_user(db, "owner")
    prop = make_property(db, owner)
    res = client.post(f"/api/favorites/{prop.id}")
    assert res.status_code == 401
