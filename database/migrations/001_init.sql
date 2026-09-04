-- PropLease PostgreSQL / Supabase schema (v1)
-- Apply in the Supabase SQL editor, or via psql against DATABASE_URL.

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'operator'
        CHECK (role IN ('operator', 'owner', 'admin')),
    verified BOOLEAN DEFAULT FALSE,
    display_role TEXT,
    response_time TEXT,
    rating NUMERIC(3,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Local-only password store. Not used when Supabase Auth owns credentials.
CREATE TABLE IF NOT EXISTS public.local_credentials (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.properties (
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
    map_coord_x DOUBLE PRECISION,
    map_coord_y DOUBLE PRECISION,
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
            'draft', 'pending', 'approved', 'rejected',
            'inactive', 'rented', 'sold'
        )),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_locality ON public.properties(locality);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON public.properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_bedrooms ON public.properties(bedrooms);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(monthly_rent);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_owner ON public.properties(owner_id);

CREATE TABLE IF NOT EXISTS public.property_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    storage_path TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_property_images_property ON public.property_images(property_id);

CREATE TABLE IF NOT EXISTS public.amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.property_amenities (
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    amenity_id UUID REFERENCES public.amenities(id) ON DELETE CASCADE,
    PRIMARY KEY(property_id, amenity_id)
);

CREATE TABLE IF NOT EXISTS public.society_rules (
    property_id UUID PRIMARY KEY REFERENCES public.properties(id) ON DELETE CASCADE,
    noc_available BOOLEAN DEFAULT FALSE,
    guest_turnover_allowed BOOLEAN DEFAULT FALSE,
    smart_lock_allowed BOOLEAN DEFAULT FALSE,
    noise_curfew TEXT,
    cleaning_team_access TEXT,
    subletting_clause_in_contract BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.nearby_places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    distance_text TEXT
);

CREATE INDEX IF NOT EXISTS idx_nearby_places_property ON public.nearby_places(property_id);

CREATE TABLE IF NOT EXISTS public.favorites (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY(user_id, property_id)
);

CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    message TEXT,
    proposed_tenure_months INTEGER,
    proposed_rent NUMERIC(12,2),
    operator_display_name TEXT,
    portfolio_size TEXT,
    status TEXT DEFAULT 'new'
        CHECK (status IN ('new', 'reviewing', 'accepted', 'rejected', 'withdrawn')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inquiries_property ON public.inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_operator ON public.inquiries(operator_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.society_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nearby_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.local_credentials ENABLE ROW LEVEL SECURITY;

-- Public can view approved listings and related public rows.
CREATE POLICY properties_public_read ON public.properties
    FOR SELECT USING (status = 'approved');

CREATE POLICY amenities_public_read ON public.amenities
    FOR SELECT USING (true);

CREATE POLICY property_amenities_public_read ON public.property_amenities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.properties p
            WHERE p.id = property_id AND p.status = 'approved'
        )
    );

CREATE POLICY property_images_public_read ON public.property_images
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.properties p
            WHERE p.id = property_id AND p.status = 'approved'
        )
    );

CREATE POLICY society_rules_public_read ON public.society_rules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.properties p
            WHERE p.id = property_id AND p.status = 'approved'
        )
    );

CREATE POLICY nearby_places_public_read ON public.nearby_places
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.properties p
            WHERE p.id = property_id AND p.status = 'approved'
        )
    );

CREATE POLICY users_self_read ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY users_self_update ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY properties_owner_all ON public.properties
    FOR ALL USING (owner_id = auth.uid());

CREATE POLICY property_images_owner_all ON public.property_images
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.properties p
            WHERE p.id = property_id AND p.owner_id = auth.uid()
        )
    );

CREATE POLICY favorites_own ON public.favorites
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY inquiries_operator_own ON public.inquiries
    FOR SELECT USING (operator_id = auth.uid());

CREATE POLICY inquiries_operator_insert ON public.inquiries
    FOR INSERT WITH CHECK (operator_id = auth.uid());

CREATE POLICY inquiries_owner_read ON public.inquiries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.properties p
            WHERE p.id = property_id AND p.owner_id = auth.uid()
        )
    );

CREATE POLICY inquiries_owner_update ON public.inquiries
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.properties p
            WHERE p.id = property_id AND p.owner_id = auth.uid()
        )
    );

-- Admin operations are enforced in FastAPI with the service role / JWT role check.
-- RLS above protects direct client access; FastAPI uses the service role or SQLAlchemy.
