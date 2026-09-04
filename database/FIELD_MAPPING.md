# Seed field mapping (frontend `data.js` → PostgreSQL)

| Frontend field | Database |
| --- | --- |
| title, description, property_type, bedrooms, bathrooms, area_sqft | properties.* |
| furnishing_status, address, city, locality | properties.* |
| lat / lng | properties.latitude / longitude |
| mapCoords.x / mapCoords.y | properties.map_coord_x / map_coord_y (UI extras) |
| monthly_rent, security_deposit, min_lease_months | properties.* |
| str_friendly, est_nightly_rate, est_occupancy_pct, est_annual_roi_pct | properties.* |
| featured, verified | properties.* |
| status `live` | properties.status `approved` |
| status `paused` | properties.status `inactive` |
| str_tags | amenities + property_amenities |
| images[] | property_images.image_url |
| nearby_places[].name / dist | nearby_places.name / distance_text |
| society_rules.* | society_rules.* |
| owner.name, owner.verified, owner.phone | users.name, users.verified, users.phone |
| owner.role | users.display_role |
| owner.response_time, owner.rating | users.response_time, users.rating |
| owner.member_since | derived from users.created_at |
| owner.properties_listed | computed count, not stored |
| inquiries.proposed_terms | inquiries.message |
| inquiries.status display labels | mapped from inquiries.status enum |
| pincode | not present in seed; nullable column reserved |

Passwords are never stored on `users`. Local demo auth uses `local_credentials`.
Private phones are not returned on public property JSON; use `POST /api/properties/{id}/contact`.
