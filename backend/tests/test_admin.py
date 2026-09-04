from tests.conftest import auth_header, make_property, make_user


def test_admin_approve_reject(client, db):
    owner = make_user(db, "owner")
    admin = make_user(db, "admin")
    op = make_user(db, "operator")
    prop = make_property(db, owner, status="pending")

    denied = client.put(f"/api/admin/properties/{prop.id}/approve", headers=auth_header(op))
    assert denied.status_code == 403

    ok = client.put(f"/api/admin/properties/{prop.id}/approve", headers=auth_header(admin))
    assert ok.status_code == 200
    public = client.get(f"/api/properties/{prop.id}")
    assert public.status_code == 200

    rejected = client.put(f"/api/admin/properties/{prop.id}/reject", headers=auth_header(admin))
    assert rejected.status_code == 200
    hidden = client.get(f"/api/properties/{prop.id}")
    assert hidden.status_code == 404

    still_denied = client.put(f"/api/admin/properties/{prop.id}/reject", headers=auth_header(op))
    assert still_denied.status_code == 403
