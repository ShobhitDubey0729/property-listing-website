from tests.conftest import auth_header, make_property, make_user


def test_inquiry_create_and_lists(client, db):
    owner = make_user(db, "owner")
    op = make_user(db, "operator")
    prop = make_property(db, owner)
    res = client.post(
        f"/api/properties/{prop.id}/inquiries",
        json={"message": "12 month lease", "proposed_tenure_months": 12, "proposed_rent": 50000},
        headers=auth_header(op),
    )
    assert res.status_code == 201
    iid = res.json()["id"]

    mine = client.get("/api/inquiries", headers=auth_header(op))
    assert len(mine.json()["items"]) == 1

    owner_box = client.get("/api/owner/inquiries", headers=auth_header(owner))
    assert len(owner_box.json()["items"]) == 1

    ok = client.put(f"/api/inquiries/{iid}/status", json={"status": "reviewing"}, headers=auth_header(owner))
    assert ok.status_code == 200
    assert ok.json()["status_code"] == "reviewing"

    stranger = make_user(db, "operator", email="stranger@test.local")
    denied = client.put(f"/api/inquiries/{iid}/status", json={"status": "accepted"}, headers=auth_header(stranger))
    assert denied.status_code == 403
