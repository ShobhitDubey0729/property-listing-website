# PropLease — Property Listing Platform for Airbnb-Style Leasing

## 1. Concept Summary

A marketplace website where **property owners** can list properties they want to lease out specifically for **Airbnb / short-term rental (STR) use**, and **operators/investors/co-hosts** (people who want to run an Airbnb business but don't own property) can browse, filter, and connect with owners to arrange a lease (commonly known as "rental arbitrage" or "master lease for STR").

Think of it as a hybrid of:
- **Housing.com / NoBroker** → listing structure, verification, lead generation, owner dashboard, broker-free model
- **Airbnb** → property presentation style (photos, amenities, calendar-style availability)
- **Rent To Airbnb / Landing / PadSplit** → the specific niche of owners leasing to STR operators

### Core Value Proposition
- **Owners**: List a property, get discovered by serious STR operators, earn steady lease income (often above traditional long-term rent) without running the Airbnb themselves.
- **Operators (Renters/Investors)**: Find landlords who explicitly allow/welcome Airbnb subletting — solving the #1 pain point in rental arbitrage (finding STR-friendly landlords).
- **Platform**: Charges via subscription, lead-based commission, or transaction fee.

---

## 2. Target Users

| User Type | Description | Needs |
|---|---|---|
| **Property Owner** | Owns 1–N residential/commercial units, wants passive lease income | Easy listing, verified leads, lease templates, screening tools |
| **STR Operator / Investor** | Wants to lease properties to run as Airbnb/STR business | Search by city, STR-friendly filter, ROI estimator, direct contact |
| **Admin/Platform Team** | Manages listings, verifies users, handles disputes | Moderation dashboard, analytics, payment tracking |
| **Property Manager/Agent (optional)** | Lists on behalf of multiple owners | Bulk upload, CRM-like dashboard |

---

## 3. Core Features

### 3.1 For Property Owners
- Sign up / KYC-lite verification (phone, email, ID upload optional)
- Create listing: address, property type (apartment/villa/independent house/PG), size, furnishing, amenities, photos/video, lease terms (min lease duration, rent expectations, deposit, STR-specific clauses like "guest turnover allowed", "linen/laundry access")
- Mark property as **"Airbnb/STR Friendly"** with sub-tags (e.g., "Society allows short-term guests", "No noise restrictions", "Separate entry")
- Dashboard: view leads/inquiries, edit/pause/delete listing, view listing performance (views, saves, inquiries)
- Chat/inquiry inbox with operators
- Option to request background/business verification of operator before sharing contact
- Lease agreement templates (auto-fill via e-sign integration)
- Subscription plans (Free listing with limited visibility vs Paid "Featured" listing)

### 3.2 For STR Operators / Renters
- Search & filter: city/locality, price range, property type, furnishing, STR-friendliness tags, min lease term, proximity to tourist/business hubs
- Map-based search (like Housing.com/NoBroker map view)
- Property detail page: photo gallery, amenities, nearby attractions, estimated Airbnb ROI (nightly rate benchmarks pulled from AirDNA-like data or manual estimate), owner's lease terms
- Save/shortlist properties, compare properties side-by-side
- Contact owner (chat/call reveal after verification, similar to NoBroker's contact-unlock model)
- Submit rental application / proposal with business plan snippet (some owners want to know operator's STR experience)
- Alerts for new listings matching saved search criteria

### 3.3 Trust & Safety
- ID verification for both parties (Aadhaar/PAN or equivalent, business registration for operators)
- Ratings & reviews after a lease is signed (owner rates operator, operator rates owner)
- Report/flag listing or user
- Admin moderation queue for new listings before going live
- Optional "Verified Owner" / "Verified Operator" badges

### 3.4 Monetization Options
- **Freemium listings**: free basic listing, paid boost/featured placement
- **Lead-based pricing**: operators pay small fee to unlock owner contact (NoBroker-style)
- **Subscription tiers** for owners with multiple properties (property management companies)
- **Commission on signed lease** (if platform facilitates the agreement/e-sign)
- **Value-added services**: professional photography, STR ROI reports, legal lease drafting — sold as add-ons

### 3.5 Admin Panel
- User management (owners, operators, agents)
- Listing moderation (approve/reject/flag)
- Payments & subscription management
- Analytics dashboard (listings by city, conversion rates, active users)
- Content management (blog/SEO pages, city landing pages)
- Dispute resolution & support ticketing

---

## 4. Suggested Page/Screen List

1. **Home** — search bar, featured listings, "How it works" (owner vs operator flow), testimonials, city shortcuts
2. **Search/Listing Results** — filters + map + list/grid toggle
3. **Property Detail Page** — gallery, description, amenities, STR-tags, ROI estimate, owner card, "Contact Owner" CTA, similar listings
4. **List Your Property** (Owner onboarding flow) — multi-step form (basic info → photos → lease terms → pricing plan → submit for review)
5. **Owner Dashboard** — my listings, leads/inbox, analytics, subscription/billing
6. **Operator Dashboard** — saved properties, applications sent, messages, alerts settings
7. **Sign Up / Login** — role selection (Owner / Operator / Agent), OTP-based auth
8. **Profile & Verification** — KYC upload, business details (for operators)
9. **Messaging/Inbox** — in-app chat between owner & operator
10. **Pricing/Plans Page** — for owners choosing listing tier
11. **City Landing Pages** (SEO) — "Airbnb-friendly properties in [City]"
12. **Blog/Resources** — guides on rental arbitrage, legal considerations, lease templates
13. **About / Trust & Safety / Terms / Privacy Policy**
14. **Admin Panel** (separate internal app)

---

## 5. Suggested Data Model (Simplified)

**Users**
`id, name, email, phone, role(owner/operator/agent/admin), kyc_status, created_at`

**Properties**
`id, owner_id, title, description, address, city, locality, lat, lng, property_type, bedrooms, bathrooms, area_sqft, furnishing_status, str_friendly(bool), str_tags[], min_lease_months, monthly_rent, security_deposit, status(draft/pending_review/live/paused), created_at`

**PropertyMedia**
`id, property_id, media_type(image/video), url, order`

**Inquiries/Leads**
`id, property_id, operator_id, message, status(new/contacted/converted/rejected), created_at`

**Applications** (optional formal step)
`id, property_id, operator_id, business_plan_note, proposed_terms, status`

**Messages**
`id, thread_id, sender_id, receiver_id, content, sent_at`

**Reviews**
`id, lease_id, reviewer_id, reviewee_id, rating, comment`

**Subscriptions/Payments**
`id, user_id, plan_type, amount, status, valid_till`

---

## 6. Suggested Tech Stack

| Layer | Options |
|---|---|
| Frontend | React / Next.js (SEO-friendly, SSR for listing pages) |
| Styling | Tailwind CSS |
| Backend | Node.js (Express/NestJS) or Django (Python) |
| Database | PostgreSQL (relational data + PostGIS for map/location search) |
| Search | Elasticsearch/Algolia for fast filtering & full-text search |
| Media Storage | AWS S3 / Cloudinary |
| Auth | OTP via Twilio/MSG91 + JWT sessions; optional Google login |
| Maps | Google Maps / Mapbox |
| Payments | Razorpay/Stripe for subscriptions & lead unlocks |
| E-sign | DocuSign/Leegality API for lease agreements |
| Hosting | AWS / GCP with CDN (CloudFront) |
| Notifications | Email (SendGrid) + SMS/WhatsApp (MSG91/Twilio) |

---

## 7. MVP Scope (Phase 1)

1. Owner & operator signup with role selection
2. Property listing creation (manual form, image upload, STR-friendly toggle)
3. Search with basic filters (city, price, property type, STR-friendly)
4. Property detail page with contact/inquiry form
5. Basic owner dashboard (manage listings, view leads)
6. Basic operator dashboard (saved listings, sent inquiries)
7. Admin panel for listing approval
8. Simple in-app messaging or "reveal contact number" flow

## 8. Phase 2 (Growth Features)
- Map-based search, ROI calculator, verified badges
- Subscription/paid featured listings
- Reviews & ratings post-lease
- E-sign lease agreements
- City-wise SEO landing pages, blog
- Mobile app (React Native)

## 9. Phase 3 (Scale Features)
- AI-based property recommendation for operators
- Automated STR revenue estimation using market data APIs
- Multi-language & multi-city expansion
- Property management company (agent) bulk tools
- In-house lease/legal marketplace (partner lawyers)

---

## 10. Key Differentiators vs Housing.com/NoBroker
- Explicit **STR/Airbnb-friendly tagging system** (not offered on general rental portals)
- **ROI estimator** tailored to short-term rental income, not just monthly rent comparison
- Operator profiles show **STR business experience/track record**, which owners specifically want to see
- Lease terms built around **subletting/guest-turnover permissions**, a legal nuance general portals ignore

---

## 11. Legal/Compliance Notes to Address Later
- Local laws on short-term rentals vary by city/state (some housing societies/RWAs restrict Airbnb use) — platform should include a disclaimer and encourage owners to confirm society/municipal rules
- Lease agreements should clearly state subletting/STR permissions to avoid disputes
- Data privacy compliance (DPDP Act in India, or GDPR if expanding internationally)
