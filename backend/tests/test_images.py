import io

from tests.conftest import auth_header, make_property, make_user


def test_valid_image_upload(client, db):
    owner = make_user(db, "owner")
    prop = make_property(db, owner)
    files = {"file": ("photo.png", io.BytesIO(b"\x89PNG\r\n" + b"0" * 100), "image/png")}
    res = client.post(f"/api/properties/{prop.id}/images", files=files, headers=auth_header(owner))
    assert res.status_code == 201
    assert res.json()["image_url"].startswith("/uploads/")


def test_invalid_type_and_size(client, db):
    owner = make_user(db, "owner")
    prop = make_property(db, owner)
    bad = client.post(
        f"/api/properties/{prop.id}/images",
        files={"file": ("notes.txt", io.BytesIO(b"hello"), "text/plain")},
        headers=auth_header(owner),
    )
    assert bad.status_code == 400
    huge = client.post(
        f"/api/properties/{prop.id}/images",
        files={"file": ("big.jpg", io.BytesIO(b"x" * (5 * 1024 * 1024 + 10)), "image/jpeg")},
        headers=auth_header(owner),
    )
    assert huge.status_code == 400
