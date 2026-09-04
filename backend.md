# PropLease Backend Implementation Specification

## 0. Objective

Convert the existing PropLease frontend-only property marketplace into a complete full-stack MVP while preserving the existing UI/UX.

Current frontend:
- HTML
- CSS
- Vanilla JavaScript
- Property data/state currently managed through `data.js`, `state.js`, and `localStorage`

Target stack:
- Frontend: existing HTML/CSS/JavaScript
- Backend: Python + FastAPI
- Database: PostgreSQL hosted by Supabase
- Authentication: Supabase Auth
- Image storage: Supabase Storage
- Version control: GitHub
- Deployment: Render free tier for frontend/backend
- All services should use free tiers where available.

Do NOT rewrite the frontend unnecessarily. Integrate the backend into the existing application.

---

# 1. Inspect the Existing Project First

Before modifying code:

1. Inspect the entire existing frontend directory.
2. Identify:
   - HTML pages
   - CSS files
   - JavaScript files
   - `data.js`
   - `state.js`
   - routing/navigation logic
   - localStorage usage
   - property object structure
   - inquiry/proposal structure
   - favorites structure
   - listing wizard
   - owner dashboard
   - admin dashboard
   - authentication/role UI
3. Create a short implementation inventory documenting:
   - existing files
   - existing data models
   - existing frontend state
   - every localStorage key
   - every feature that needs an API
4. Preserve existing UI behavior unless backend integration requires a change.

Important existing behavior to replace:
- Seed property data from `data.js`
- `localStorage` persistence
- fake role switching
- fake favorites
- fake inquiries/proposals
- hardcoded owner contact data
- hardcoded marketplace metrics

---

# 2. Target Architecture

Use this architecture:

```text
                         USERS
                           |
                           v
                +----------------------+
                | Existing Frontend    |
                | HTML/CSS/Vanilla JS  |
                +----------+-----------+
                           |
                         HTTPS
                           |
                           v
                +----------------------+
                |       FastAPI        |
                |      REST API        |
                +----------+-----------+
                           |
             +-------------+-------------+
             |             |             |
             v             v             v
        PostgreSQL    Supabase Auth   Supabase Storage
         Supabase        JWT            Images
```

Deployment:

```text
                         INTERNET
                            |
                            v
                    Public Website
                            |
                +-----------+-----------+
                |                       |
                v                       v
        Render Static Site       Render Web Service
             Frontend                 FastAPI
                                         |
                                         v
                                    Supabase
                               PostgreSQL/Auth/Storage
```

Do not introduce microservices, Kafka, Redis, Kubernetes, Elasticsearch, or other infrastructure for v1.

---

# 3. Database: PostgreSQL/Supabase

Create a Supabase project.

Use PostgreSQL as the source of truth for all persistent application data.

## 3.1 Users

Use Supabase Auth for authentication.

Create an application profile table:

```sql
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'operator'
        CHECK (role IN ('operator', 'owner', 'admin')),
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Do not store passwords in this table.

The authenticated user's identity comes from Supabase Auth.

---

# 4. Properties Table

Create:

```sql
CREATE TABLE public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    owner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,

    title TEXT NOT NULL,
    description TEXT,

    property_type TEXT NOT NULL,

    bedrooms INTEGER,
    bathrooms INTEGER,
    area_sqft INTEGER,

    furnishing_status TEXT,

    address TEXT,
    city TEXT NOT NULL,
    locality TEXT,
    pincode TEXT,

    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,

    monthly_rent NUMERIC(12,2),
    security_deposit NUMERIC(12,2),
    min_lease_months INTEGER,

    str_friendly BOOLEAN DEFAULT FALSE,

    est_nightly_rate NUMERIC(12,2),
    est_occupancy_pct NUMERIC(5,2),
    est_annual_roi_pct NUMERIC(6,2),

    featured BOOLEAN DEFAULT FALSE,
    verified BOOLEAN DEFAULT FALSE,

    status TEXT DEFAULT 'pending'
        CHECK (status IN (
            'draft',
            'pending',
            'approved',
            'rejected',
            'inactive',
            'rented',
            'sold'
        )),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

Add indexes:

```sql
CREATE INDEX idx_properties_city
ON public.properties(city);

CREATE INDEX idx_properties_locality
ON public.properties(locality);

CREATE INDEX idx_properties_property_type
ON public.properties(property_type);

CREATE INDEX idx_properties_bedrooms
ON public.properties(bedrooms);

CREATE INDEX idx_properties_price
ON public.properties(monthly_rent);

CREATE INDEX idx_properties_status
ON public.properties(status);

CREATE INDEX idx_properties_owner
ON public.properties(owner_id);
```

---

# 5. Property Images

Do not store binary images inside PostgreSQL.

Use Supabase Storage.

Database table:

```sql
CREATE TABLE public.property_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    property_id UUID NOT NULL
        REFERENCES public.properties(id)
        ON DELETE CASCADE,

    image_url TEXT NOT NULL,

    storage_path TEXT,

    is_primary BOOLEAN DEFAULT FALSE,

    display_order INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_property_images_property
ON public.property_images(property_id);
```

Create a Supabase Storage bucket named:

```text
property-images
```

Implement upload functionality from the landlord listing wizard.

---

# 6. Amenities / STR Tags

Create:

```sql
CREATE TABLE public.amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL
);
```

Create relationship table:

```sql
CREATE TABLE public.property_amenities (
    property_id UUID
        REFERENCES public.properties(id)
        ON DELETE CASCADE,

    amenity_id UUID
        REFERENCES public.amenities(id)
        ON DELETE CASCADE,

    PRIMARY KEY(property_id, amenity_id)
);
```

Seed amenities based on existing frontend data, including relevant values such as:

- Society NOC Ready
- Smart Lock Installed
- Private Pool
- Sea View
- High Speed Wifi
- High Tourist Density
- Separate Entry
- Mountain View
- River View
- Parking
- Gym
- Swimming Pool
- Lift
- Security
- Power Backup

Do not create duplicate amenity values.

---

# 7. Society Rules

Existing frontend property data includes society rules.

Create:

```sql
CREATE TABLE public.society_rules (
    property_id UUID PRIMARY KEY
        REFERENCES public.properties(id)
        ON DELETE CASCADE,

    noc_available BOOLEAN DEFAULT FALSE,
    guest_turnover_allowed BOOLEAN DEFAULT FALSE,
    smart_lock_allowed BOOLEAN DEFAULT FALSE,

    noise_curfew TEXT,
    cleaning_team_access TEXT,

    subletting_clause_in_contract BOOLEAN DEFAULT FALSE
);
```

---

# 8. Nearby Places

Create:

```sql
CREATE TABLE public.nearby_places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    property_id UUID NOT NULL
        REFERENCES public.properties(id)
        ON DELETE CASCADE,

    name TEXT NOT NULL,
    distance_text TEXT
);

CREATE INDEX idx_nearby_places_property
ON public.nearby_places(property_id);
```

---

# 9. Favorites

Replace localStorage favorites with:

```sql
CREATE TABLE public.favorites (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    PRIMARY KEY(user_id, property_id)
);
```

The frontend must call the backend rather than writing favorites to localStorage.

---

# 10. Inquiries / Proposals

Replace the current fake/seed inquiry system with:

```sql
CREATE TABLE public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    property_id UUID NOT NULL
        REFERENCES public.properties(id)
        ON DELETE CASCADE,

    operator_id UUID NOT NULL
        REFERENCES public.users(id)
        ON DELETE CASCADE,

    message TEXT,

    proposed_tenure_months INTEGER,
    proposed_rent NUMERIC(12,2),

    status TEXT DEFAULT 'new'
        CHECK (status IN (
            'new',
            'reviewing',
            'accepted',
            'rejected',
            'withdrawn'
        )),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inquiries_property
ON public.inquiries(property_id);

CREATE INDEX idx_inquiries_operator
ON public.inquiries(operator_id);

CREATE INDEX idx_inquiries_status
ON public.inquiries(status);
```

---

# 11. Optional Future Tables

Do NOT implement these in v1 unless the existing frontend already requires them:

```text
property_views
notifications
messages
reviews
subscriptions
payments
verification_documents
```

Keep the initial system simple.

---

# 12. Row Level Security

Enable Supabase Row Level Security on all user-data tables.

At minimum:

```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.society_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nearby_places ENABLE ROW LEVEL SECURITY;
```

Design policies so:

- public users can view approved properties
- authenticated users can manage their own favorites
- operators can create/view their own inquiries
- owners can manage their own properties
- owners can manage images belonging to their properties
- admins can manage listings
- users cannot modify another user's records
- admin access is determined server-side

Never trust a frontend `role` variable for authorization.

---

# 13. FastAPI Backend

Create:

```text
backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   │
│   ├── models/
│   │   ├── user.py
│   │   ├── property.py
│   │   ├── inquiry.py
│   │   └── favorite.py
│   │
│   ├── schemas/
│   │   ├── user.py
│   │   ├── property.py
│   │   ├── inquiry.py
│   │   └── favorite.py
│   │
│   ├── routes/
│   │   ├── auth.py
│   │   ├── properties.py
│   │   ├── favorites.py
│   │   ├── inquiries.py
│   │   ├── owners.py
│   │   ├── admin.py
│   │   └── stats.py
│   │
│   ├── services/
│   │   ├── property_service.py
│   │   ├── auth_service.py
│   │   └── storage_service.py
│   │
│   └── dependencies/
│       └── auth.py
│
├── requirements.txt
├── .env.example
└── README.md
```

Use environment variables for secrets.

Never commit `.env`.

---

# 14. Backend Dependencies

Use stable current versions compatible with Python 3.11+.

Core dependencies:

```text
fastapi
uvicorn
sqlalchemy
psycopg2-binary
pydantic
pydantic-settings
python-dotenv
supabase
PyJWT
```

If using Supabase's REST/client APIs rather than direct SQLAlchemy PostgreSQL access, simplify dependencies accordingly.

Prefer one consistent database access strategy. Do not mix multiple ORMs/query layers without a reason.

---

# 15. API Endpoints

## Public properties

```http
GET /api/properties
GET /api/properties/{property_id}
```

Support query parameters:

```text
city
locality
property_type
min_price
max_price
min_bedrooms
max_bedrooms
str_friendly
amenity
sort
page
page_size
```

Example:

```http
GET /api/properties?city=Bangalore&min_bedrooms=2&max_price=40000
```

Only return public/approved listings.

---

# 16. Property CRUD

Authenticated owners:

```http
POST   /api/properties
GET    /api/owner/properties
GET    /api/properties/{property_id}
PUT    /api/properties/{property_id}
DELETE /api/properties/{property_id}
```

Owners may only modify properties they own.

---

# 17. Favorites API

```http
GET    /api/favorites
POST   /api/favorites/{property_id}
DELETE /api/favorites/{property_id}
```

Require authentication.

---

# 18. Inquiry API

```http
POST /api/properties/{property_id}/inquiries
GET  /api/inquiries
GET  /api/owner/inquiries
PUT  /api/inquiries/{inquiry_id}/status
```

Operators can create inquiries.

Owners can see inquiries for their properties.

Owners can update inquiry status.

Operators can see their own inquiries.

---

# 19. Admin API

Implement:

```http
GET /api/admin/properties
PUT /api/admin/properties/{id}/approve
PUT /api/admin/properties/{id}/reject
PUT /api/admin/properties/{id}/activate
PUT /api/admin/properties/{id}/deactivate
```

Admin authorization must be checked in FastAPI.

Do not rely on:

```javascript
localStorage.setItem("role", "admin")
```

for security.

---

# 20. Marketplace Statistics

Replace hardcoded metrics with:

```http
GET /api/stats
```

Return values calculated from actual database records, such as:

```json
{
  "total_active_listings": 123,
  "verified_listing_percentage": 82.5,
  "average_monthly_rent": 42000,
  "average_estimated_roi": 18.2,
  "average_operator_net_profit": 65000
}
```

Only expose metrics that can be meaningfully calculated from actual data.

Do not fabricate business metrics.

---

# 21. Authentication

Use Supabase Auth.

Support initially:

- email/password signup
- email/password login
- logout
- current-user session
- optional Google OAuth if easy to configure

Flow:

```text
Frontend
   |
   v
Supabase Auth
   |
   v
JWT
   |
   v
FastAPI
   |
   v
Validate JWT
   |
   v
Identify user
   |
   v
Check role/ownership
```

The backend must validate the authenticated user's JWT.

---

# 22. Frontend Authentication Changes

Replace the current fake role/localStorage authentication.

Do not allow:

```javascript
localStorage.setItem("proplease_role", "admin");
```

to grant permissions.

The frontend may retain a UI role display, but the backend must be authoritative.

Implement:

```text
login.html
signup.html
auth.js
```

or adapt the existing pages.

---

# 23. Replace `data.js`

The existing property seed data should become database seed data.

Do NOT delete the original data until:

1. It has been mapped to the PostgreSQL schema.
2. A seed script has been created.
3. The data has been successfully inserted.
4. The frontend has been tested against API responses.

Create:

```text
backend/scripts/seed_database.py
```

or an SQL seed file.

Map existing fields carefully.

Examples:

```text
title             -> properties.title
description       -> properties.description
property_type     -> properties.property_type
bedrooms          -> properties.bedrooms
bathrooms         -> properties.bathrooms
area_sqft         -> properties.area_sqft
monthly_rent      -> properties.monthly_rent
security_deposit  -> properties.security_deposit
city              -> properties.city
locality          -> properties.locality
str_tags          -> amenities/property_amenities
society_rules     -> society_rules
nearby_places     -> nearby_places
images            -> property_images
```

Do not silently discard existing fields. Document any fields that require transformation.

---

# 24. Replace `state.js`

The state manager should no longer persist business data in localStorage.

Instead:

```text
UI
 |
 v
state/service layer
 |
 v
API
 |
 v
FastAPI
 |
 v
PostgreSQL
```

localStorage may still be used for harmless UI preferences if needed, such as:

- selected theme
- temporary UI state
- non-sensitive filters

Never use localStorage as the authoritative database.

---

# 25. Frontend API Client

Create:

```text
frontend/js/api.js
```

Centralize API calls.

Example:

```javascript
const API_BASE_URL =
    window.APP_CONFIG?.API_BASE_URL || "http://localhost:8000";

async function apiFetch(path, options = {}) {
    const response = await fetch(
        `${API_BASE_URL}${path}`,
        options
    );

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    return response.json();
}
```

Use this from the existing application rather than scattering URLs throughout every JS file.

---

# 26. Property Listing Integration

Existing listing wizard should become:

```text
Listing Wizard
      |
      v
Validate form
      |
      v
POST /api/properties
      |
      v
Property ID
      |
      v
Upload images to Supabase Storage
      |
      v
Create property_images records
      |
      v
Listing status = pending
      |
      v
Admin approval
      |
      v
Public listing
```

Do not publish a new listing automatically unless the current product requirements explicitly require that behavior.

---

# 27. Property Image Upload

Implement:

1. User selects images.
2. Validate file type.
3. Validate file size.
4. Upload to Supabase Storage.
5. Receive storage path/public URL.
6. Save URL/path in `property_images`.
7. Associate with property ID.
8. Support primary image.
9. Support display order.

Use safe file naming.

Do not expose service-role keys in frontend JavaScript.

---

# 28. Owner Contact Information

The current frontend contains partially hardcoded owner phone data.

Do not expose private owner phone numbers in public property JSON.

Public property response should contain something like:

```json
{
  "owner": {
    "name": "Owner Name",
    "verified": true
  }
}
```

Contact information should be protected.

If contact unlocking is a product requirement, implement a protected API such as:

```http
POST /api/properties/{property_id}/contact
```

and perform authorization server-side.

At minimum, authenticated users should be required before exposing private contact information.

Never put hidden phone numbers into JavaScript and assume they are secure.

---

# 29. CORS

Configure FastAPI CORS.

During local development:

```text
http://localhost:5500
http://127.0.0.1:5500
```

or whatever port the existing frontend uses.

Production:

```text
https://YOUR_FRONTEND_DOMAIN
```

Do not use unrestricted:

```text
allow_origins=["*"]
```

in production when authenticated/private APIs are being used.

---

# 30. Local Development

Recommended setup:

```text
frontend/
backend/
```

Run backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

uvicorn app.main:app --reload --port 8000
```

Run frontend with a static server, for example:

```bash
python -m http.server 5500
```

Then:

```text
Frontend:
http://localhost:5500

Backend:
http://localhost:8000

Swagger:
http://localhost:8000/docs
```

Do not open the frontend directly using `file://` because browser security/CORS behavior can differ.

---

# 31. Environment Variables

Create:

```text
backend/.env.example
```

Example:

```text
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
FRONTEND_URL=http://localhost:5500
```

Important:

- `SUPABASE_SERVICE_ROLE_KEY` must ONLY exist on the backend.
- Never expose service-role keys to frontend JavaScript.
- Never commit `.env`.
- Frontend may contain only intentionally public configuration.

If Supabase Auth handles JWT validation directly, use the appropriate Supabase/JWT verification mechanism instead of inventing a second authentication system.

---

# 32. Error Handling

FastAPI APIs should return useful HTTP status codes.

Examples:

```text
200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
500 Internal Server Error
```

Return consistent JSON:

```json
{
  "detail": "Property not found"
}
```

Do not expose stack traces or secrets to users.

---

# 33. Validation

Validate:

- price >= 0
- bedrooms >= 0
- bathrooms >= 0
- area_sqft > 0
- occupancy between 0 and 100
- ROI within sensible bounds
- valid property type
- valid listing status
- valid UUIDs
- image file type/size
- required fields

Use Pydantic schemas.

Do not trust client-side validation alone.

---

# 34. Pagination

Do not return every property in one API call.

Implement:

```text
page
page_size
```

or preferably:

```text
limit
offset
```

Example:

```http
GET /api/properties?page=1&page_size=20
```

Response:

```json
{
  "items": [],
  "page": 1,
  "page_size": 20,
  "total": 123
}
```

---

# 35. Search and Filtering

Use PostgreSQL initially.

Do NOT introduce Elasticsearch.

Support:

```text
city
locality
property type
price range
bedrooms
STR friendliness
amenities
sorting
```

Add PostgreSQL indexes for commonly filtered fields.

Potential future enhancement:

```text
PostgreSQL + pgvector
```

for semantic property search.

Do not implement vector search in v1 unless explicitly requested.

---

# 36. ROI Calculator

The ROI calculator can remain client-side if it is only a calculator.

If it is supposed to use saved property data, retrieve the property from the backend.

Do not store calculated values in the database unless they represent actual persisted listing metrics.

---

# 37. Security Requirements

Before deployment:

- no passwords in source code
- no service-role Supabase key in frontend
- no private phone numbers hardcoded in JS
- no admin authorization in frontend
- no secrets committed to Git
- validate every authenticated API
- verify ownership before modifying property
- verify user identity for favorites/inquiries
- enable RLS
- configure production CORS
- validate file uploads
- use HTTPS in production

---

# 38. Testing

Create backend tests for:

### Properties

- create property
- get property
- update property
- delete property
- search
- filtering
- pagination
- unauthorized update
- non-existent property

### Authentication

- signup
- login
- invalid token
- expired token
- role validation

### Favorites

- add favorite
- duplicate favorite
- remove favorite
- unauthorized access

### Inquiries

- create inquiry
- owner receives inquiry
- operator sees own inquiry
- status update
- unauthorized status update

### Admin

- admin can approve
- normal user cannot approve
- admin can reject
- normal user cannot reject

### Images

- valid upload
- invalid file type
- oversized file
- correct property association

---

# 39. Frontend Regression Testing

After API integration verify every existing major flow:

## Explore

- page loads
- property cards load from database
- filters work
- sorting works
- pagination works

## Property details

- correct property
- images load
- amenities load
- nearby places load
- society rules load
- ROI values load

## Favorites

- favorite persists after refresh
- favorite persists across login/session
- unfavorite works

## Compare

- up to 3 properties
- compare data comes from backend
- no broken state after reload

## Operator

- login
- view properties
- submit inquiry
- see inquiries
- contact workflow

## Landlord

- login
- create listing
- upload images
- save listing
- view own listings
- status displayed correctly

## Admin

- login as admin
- see pending listings
- approve/reject
- approved listing becomes publicly visible

---

# 40. Deployment

Use GitHub for source control.

Recommended deployment:

```text
GitHub
 |
 +---- frontend ---> Render Static Site
 |
 +---- backend ----> Render Web Service
                         |
                         v
                    Supabase
```

Frontend environment/config:

```text
API_BASE_URL=https://YOUR_BACKEND.onrender.com
```

Backend environment:

```text
DATABASE_URL=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
FRONTEND_URL=https://YOUR-FRONTEND.onrender.com
```

Never hardcode production secrets.

---

# 41. Render Backend Configuration

Backend service:

```text
Runtime: Python
Build:
pip install -r requirements.txt

Start:
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Make sure FastAPI listens on:

```text
0.0.0.0
```

and uses Render's `$PORT`.

---

# 42. Render Frontend Configuration

For a pure static HTML/CSS/JS frontend:

```text
Service type: Static Site
Build command: none
Publish directory: frontend
```

Adjust based on the actual project structure.

If the frontend requires a build step, use the appropriate build command discovered during inspection.

---

# 43. Production CORS

Once deployed, set:

```text
FRONTEND_URL=https://your-frontend-url
```

and configure FastAPI:

```python
allow_origins=[settings.FRONTEND_URL]
```

Do not leave development localhost origins as the only production configuration.

---

# 44. Custom Domain

Optional after the MVP works:

```text
www.yourdomain.com
```

Configure DNS to the frontend hosting provider.

The frontend then calls the backend HTTPS URL.

---

# 45. Free-Tier Constraint

The goal is a zero-cost MVP.

Use:

```text
GitHub             -> free
Supabase           -> free tier
Render frontend    -> free tier
Render backend     -> free tier
```

Important:

- free tiers have quotas/limitations
- Render free web services can sleep after inactivity
- do not depend on Render's free PostgreSQL for persistent production data
- use Supabase PostgreSQL for the database
- avoid paid external APIs for v1
- avoid paid map/geocoding/search services initially

If a feature cannot be implemented reliably for free, implement a simple local/database-backed alternative and document the limitation.

---

# 46. Maps / Geolocation

Do not add Google Maps API as a mandatory dependency in v1 because API usage may eventually require billing.

For v1:

- store latitude/longitude in PostgreSQL
- display textual location
- optionally use OpenStreetMap-based solutions if needed
- do not make map functionality block deployment

---

# 47. Notifications

Do not require paid SMS/email services for v1.

For inquiries:

- persist the inquiry in PostgreSQL
- show it in owner dashboard
- show it in operator dashboard

Email notifications can be added later using a free-tier transactional email provider if required.

---

# 48. Seed Existing Data

The existing `data.js` contains seed property data.

Create a migration/seed process that:

1. Reads existing property data.
2. Maps it to the new database schema.
3. Inserts users/owners where required.
4. Inserts properties.
5. Inserts images.
6. Inserts amenities.
7. Inserts property-amenity relationships.
8. Inserts society rules.
9. Inserts nearby places.
10. Verifies row counts.

Do not duplicate records if the seed script is run twice.

Use deterministic IDs or upsert logic where practical.

---

# 49. Migration Strategy

Do this in stages:

```text
Stage 1
Existing frontend + existing local data
        |
        v
Stage 2
Database created + seed data
        |
        v
Stage 3
FastAPI read APIs
        |
        v
Stage 4
Frontend reads properties from API
        |
        v
Stage 5
Write APIs
        |
        v
Stage 6
Frontend creates/updates data through API
        |
        v
Stage 7
Authentication
        |
        v
Stage 8
Authorization/RLS
        |
        v
Stage 9
Images
        |
        v
Stage 10
Testing + deployment
```

Do not remove the old localStorage/data layer until the corresponding backend functionality is verified.

---

# 50. Definition of Done

The implementation is complete only when:

- [ ] Existing frontend still looks and behaves correctly.
- [ ] PostgreSQL/Supabase database exists.
- [ ] Existing seed properties are in PostgreSQL.
- [ ] FastAPI starts successfully.
- [ ] `/docs` works.
- [ ] Property listings come from PostgreSQL.
- [ ] Property detail comes from PostgreSQL.
- [ ] Search/filter works through API.
- [ ] Favorites persist in PostgreSQL.
- [ ] Inquiries persist in PostgreSQL.
- [ ] Landlords can create listings.
- [ ] Landlords can upload property images.
- [ ] Admin can approve/reject listings.
- [ ] Authentication works.
- [ ] Backend validates JWT.
- [ ] Backend enforces roles.
- [ ] Owners can only modify their own listings.
- [ ] Public users only see approved listings.
- [ ] Private owner contact data is not embedded in frontend source.
- [ ] RLS is configured.
- [ ] CORS is configured.
- [ ] Secrets are environment variables.
- [ ] Automated/backend tests pass.
- [ ] Frontend regression testing passes.
- [ ] GitHub repository is clean.
- [ ] Backend deploys successfully.
- [ ] Frontend deploys successfully.
- [ ] Production frontend communicates with production backend.
- [ ] Production database is Supabase PostgreSQL.
- [ ] HTTPS works.
- [ ] No paid service is required for the MVP.

---

# 51. Agent Execution Rules

The coding agent implementing this specification should follow these rules:

1. Inspect before modifying.
2. Preserve the existing frontend design.
3. Do not replace working UI components without a reason.
4. Make incremental changes.
5. Run tests after each major phase.
6. Do not invent fields when an existing frontend field can be mapped.
7. If a frontend field has no database equivalent, document it before discarding it.
8. Keep API contracts documented.
9. Keep secrets out of Git.
10. Do not expose Supabase service-role credentials to the browser.
11. Do not trust frontend roles for authorization.
12. Do not use localStorage as persistent business storage after migration.
13. Do not introduce paid infrastructure unless explicitly approved.
14. Do not introduce unnecessary microservices.
15. Keep the implementation simple enough to run locally with minimal setup.
16. Update README with exact local setup and deployment instructions.
17. Create `.env.example`.
18. Add useful error messages.
19. Make database migrations reproducible.
20. At the end, provide a summary of changed files, database tables, APIs, environment variables, test results, and deployment steps.

---

# 52. Final Expected Project

```text
propLease/
│
├── frontend/
│   ├── index.html
│   ├── ...
│   ├── css/
│   └── js/
│       ├── api.js
│       ├── auth.js
│       ├── properties.js
│       ├── favorites.js
│       └── ...
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routes/
│   │   ├── services/
│   │   └── dependencies/
│   │
│   ├── scripts/
│   │   └── seed_database.py
│   │
│   ├── tests/
│   ├── requirements.txt
│   ├── .env.example
│   └── README.md
│
├── database/
│   ├── migrations/
│   └── seed/
│
├── .gitignore
└── README.md
```

The final system should be a functional full-stack PropLease MVP rather than a frontend demo.

The priority is correctness, security, maintainability, and preservation of the existing UI—not adding unnecessary technologies.
