import { useState } from "react";
import { STR_FILTER_OPTIONS } from "../data/seed.js";
import { api } from "../api/client.js";
import { useStore } from "../context/StoreContext.jsx";
import { useUi } from "../context/UiContext.jsx";
import { PropertyCard } from "../components/PropertyCard.jsx";

const INITIAL = {
  title: "",
  property_type: "Villa",
  city: "Goa",
  locality: "",
  address: "",
  bedrooms: 2,
  bathrooms: 2,
  area_sqft: 1400,
  furnishing_status: "Fully Furnished",
  str_tags: ["Society NOC Ready", "Smart Lock Installed"],
  monthly_rent: 85000,
  security_deposit: 170000,
  min_lease_months: 12,
  est_nightly_rate: 7500,
  description: "Bright and spacious unit situated in a prime leisure destination. Walking distance to popular cafes and scenic viewpoints. Excellent potential for high occupancy Airbnb operations.",
  images: [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
  ],
  society_rules: {
    noc_available: true,
    guest_turnover_allowed: true,
    smart_lock_allowed: true,
    noise_curfew: "10:30 PM",
    cleaning_team_access: "Approved",
    subletting_clause_in_contract: true
  }
};

export function ListingWizardPage() {
  const { store } = useStore();
  const { toast } = useUi();
  const [step, setStep] = useState(1);
  const [data, setData] = useState(INITIAL);
  const [pendingFiles, setPendingFiles] = useState([]);

  function update(partial) {
    setData((d) => ({ ...d, ...partial }));
  }

  function validateStep1() {
    const next = { ...data };
    if (!next.title.trim()) next.title = `Chic ${next.bedrooms}BHK ${next.property_type} in ${next.city}`;
    if (!next.locality.trim()) next.locality = `${next.city} Center`;
    setData(next);
    setStep(2);
  }

  function toggleTag(tag) {
    const tags = [...data.str_tags];
    const idx = tags.indexOf(tag);
    if (idx > -1) tags.splice(idx, 1);
    else tags.push(tag);
    update({ str_tags: tags });
  }

  async function publishListing() {
    if (!store.currentUser) {
      toast.warning("Sign in as a landlord to list a property");
      window.location.hash = "#login";
      return;
    }
    if (store.currentRole !== "owner" && store.currentRole !== "admin") {
      toast.warning("Switch to the Landlord demo account (or sign up as owner) to publish");
      return;
    }
    const payload = {
      title: data.title || `Modern ${data.bedrooms}BHK in ${data.city}`,
      description: data.description || "STR-friendly property with pre-approved society permissions.",
      property_type: data.property_type,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      area_sqft: data.area_sqft,
      furnishing_status: data.furnishing_status,
      address: data.address || `${data.locality}, ${data.city}`,
      city: data.city,
      locality: data.locality || "Prime Area",
      map_coord_x: 45 + Math.random() * 10,
      map_coord_y: 40 + Math.random() * 10,
      monthly_rent: data.monthly_rent,
      security_deposit: data.security_deposit || data.monthly_rent * 2,
      min_lease_months: data.min_lease_months,
      str_friendly: true,
      str_tags: data.str_tags.length > 0 ? data.str_tags : ["Society NOC Ready", "Smart Lock Installed"],
      est_nightly_rate: data.est_nightly_rate,
      est_occupancy_pct: 72,
      est_annual_roi_pct: Math.round((((data.est_nightly_rate * 22) - data.monthly_rent - data.est_nightly_rate * 22 * 0.18) * 12) / (data.monthly_rent * 3) * 100),
      image_urls: pendingFiles.length ? [] : data.images,
      society_rules: data.society_rules
    };
    try {
      const created = await api.createProperty(payload);
      for (const file of pendingFiles) {
        await api.uploadPropertyImage(created.id, file);
      }
      await store.refreshSessionData();
      toast.success("Listing submitted for admin approval");
      window.location.hash = "#owner-dashboard";
    } catch (err) {
      toast.warning(err.message || "Could not publish listing");
    }
  }

  const previewProp = {
    id: "preview-local",
    title: data.title || "Spacious Airbnb-Ready Haven",
    description: data.description,
    property_type: data.property_type,
    bedrooms: data.bedrooms,
    bathrooms: data.bathrooms,
    area_sqft: data.area_sqft,
    furnishing_status: data.furnishing_status,
    city: data.city,
    locality: data.locality || "City Center",
    monthly_rent: data.monthly_rent,
    str_friendly: true,
    str_tags: data.str_tags,
    est_annual_roi_pct: 110,
    images: data.images,
    featured: true,
    verified: true
  };

  return (
    <div className="container" style={{ paddingTop: "2.5rem", paddingBottom: "5rem" }}>
      <div className="wizard-container">
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span className="badge badge-str" style={{ marginBottom: "0.5rem" }}>
            Landlord Onboarding
          </span>
          <h1>List Your Property for STR Operators</h1>
          <p>Connect with vetted Airbnb entrepreneurs and secure steady, hassle-free master lease income.</p>
        </div>
        <div className="wizard-steps-nav">
          <div className="wizard-progress-track">
            <div className="wizard-progress-bar-fill" style={{ width: `${((step - 1) / 4) * 100}%` }} />
          </div>
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className={`wizard-step-node${step === s ? " active" : ""}${step > s ? " completed" : ""}`} onClick={() => setStep(s)}>
              <div className="wizard-step-circle">{step > s ? "✓" : s}</div>
              <span className="wizard-step-label">{["Basic Info", "STR Rules", "Media & Amenities", "Lease Terms", "Review"][s - 1]}</span>
            </div>
          ))}
        </div>
        <div className="glass-panel" style={{ padding: "2.25rem" }}>
          {step === 1 && (
            <div>
              <h3>Step 1: Property Overview & Location</h3>
              <p className="text-sm" style={{ marginBottom: "1.5rem" }}>
                Provide general specs for your property.
              </p>
              <div className="form-group">
                <label className="form-label">Listing Title *</label>
                <input className="form-control" value={data.title} placeholder="e.g. Modern Sunset 3BHK Penthouse with Pool Access" onChange={(e) => update({ title: e.target.value })} />
              </div>
              <div className="grid grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Property Type</label>
                  <select className="form-select" value={data.property_type} onChange={(e) => update({ property_type: e.target.value })}>
                    <option value="Villa">Villa / Standalone</option>
                    <option value="Apartment">Apartment / Flat</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Independent House">Independent House / Haveli</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <select className="form-select" value={data.city} onChange={(e) => update({ city: e.target.value })}>
                    {["Goa", "Bengaluru", "Mumbai", "Jaipur", "Manali", "Rishikesh"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Locality / Neighborhood *</label>
                  <input className="form-control" value={data.locality} onChange={(e) => update({ locality: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Full Street Address</label>
                  <input className="form-control" value={data.address} onChange={(e) => update({ address: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-3 gap-4">
                <div className="form-group">
                  <label className="form-label">Bedrooms</label>
                  <input type="number" className="form-control" min="1" max="10" value={data.bedrooms} onChange={(e) => update({ bedrooms: parseInt(e.target.value, 10) })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Bathrooms</label>
                  <input type="number" className="form-control" min="1" max="10" value={data.bathrooms} onChange={(e) => update({ bathrooms: parseInt(e.target.value, 10) })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Carpet Area (sq.ft)</label>
                  <input type="number" className="form-control" value={data.area_sqft} onChange={(e) => update({ area_sqft: parseInt(e.target.value, 10) })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Furnishing Status</label>
                <select className="form-select" value={data.furnishing_status} onChange={(e) => update({ furnishing_status: e.target.value })}>
                  <option value="Fully Furnished">Fully Furnished (Ready to Host)</option>
                  <option value="Semi-Furnished">Semi-Furnished (Kitchen + Wardrobes)</option>
                  <option value="Unfurnished">Unfurnished (Operator Sets Up)</option>
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
                <button className="btn btn-primary" onClick={validateStep1}>
                  Proceed to STR Permissions →
                </button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <h3>Step 2: STR & Short-Term Rental Permissions</h3>
              <div className="form-group" style={{ marginTop: "1.5rem" }}>
                <label className="form-label">Noise & Quiet Hours Policy</label>
                <input
                  className="form-control"
                  value={data.society_rules.noise_curfew}
                  onChange={(e) => update({ society_rules: { ...data.society_rules, noise_curfew: e.target.value } })}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
                <button className="btn btn-secondary" onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button className="btn btn-primary" onClick={() => setStep(3)}>
                  Next: Photos & Amenities →
                </button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <h3>Step 3: Property Photos & STR Tags</h3>
              <div className="file-dropzone" onClick={() => document.getElementById("wiz-photos")?.click()}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📸</div>
                <h4>Drag & Drop Property Photos or Click to Upload</h4>
                <p className="text-sm" style={{ marginTop: "0.25rem" }}>
                  JPEG, PNG or WebP up to 5MB. Listing stays pending until an admin approves it.
                </p>
                <input
                  id="wiz-photos"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  hidden
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setPendingFiles(files);
                    toast.success(`${files.length} photo(s) ready to upload`);
                  }}
                />
                <button type="button" className="btn btn-secondary btn-sm" style={{ marginTop: "1rem" }}>
                  Choose Images
                </button>
                <div className="text-xs text-muted" style={{ marginTop: "0.75rem" }}>
                  {pendingFiles.length} file(s) selected
                </div>
              </div>
              <div style={{ marginTop: "1.5rem" }}>
                <label className="form-label">Select Highlight Tags</label>
                <div className="tag-checkbox-grid">
                  {STR_FILTER_OPTIONS.map((tag) => (
                    <label key={tag} className={`tag-checkbox-label${data.str_tags.includes(tag) ? " checked" : ""}`}>
                      <input type="checkbox" checked={data.str_tags.includes(tag)} onChange={() => toggleTag(tag)} />
                      {tag}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group" style={{ marginTop: "1.5rem" }}>
                <label className="form-label">Detailed Property Pitch & Proximity</label>
                <textarea className="form-control" rows="4" value={data.description} onChange={(e) => update({ description: e.target.value })} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
                <button className="btn btn-secondary" onClick={() => setStep(2)}>
                  ← Back
                </button>
                <button className="btn btn-primary" onClick={() => setStep(4)}>
                  Next: Lease Terms →
                </button>
              </div>
            </div>
          )}
          {step === 4 && (
            <div>
              <h3>Step 4: Master Lease Terms & Rent Expectation</h3>
              <div className="grid grid-2 gap-4" style={{ marginTop: "1.5rem" }}>
                <div className="form-group">
                  <label className="form-label">Desired Monthly Lease Rent (₹) *</label>
                  <input type="number" className="form-control" value={data.monthly_rent} onChange={(e) => update({ monthly_rent: parseInt(e.target.value, 10) })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Security Deposit (₹)</label>
                  <input type="number" className="form-control" value={data.security_deposit} onChange={(e) => update({ security_deposit: parseInt(e.target.value, 10) })} />
                </div>
              </div>
              <div className="grid grid-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Minimum Lease Commitment</label>
                  <select className="form-select" value={data.min_lease_months} onChange={(e) => update({ min_lease_months: parseInt(e.target.value, 10) })}>
                    <option value={11}>11 Months</option>
                    <option value={12}>12 Months (1 Year)</option>
                    <option value={24}>24 Months (2 Years)</option>
                    <option value={36}>36 Months (3 Years)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated Airbnb ADR / Night (₹)</label>
                  <input type="number" className="form-control" value={data.est_nightly_rate} onChange={(e) => update({ est_nightly_rate: parseInt(e.target.value, 10) })} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
                <button className="btn btn-secondary" onClick={() => setStep(3)}>
                  ← Back
                </button>
                <button className="btn btn-primary" onClick={() => setStep(5)}>
                  Review & Final Preview →
                </button>
              </div>
            </div>
          )}
          {step === 5 && (
            <div>
              <h3>Step 5: Review & Publish Listing</h3>
              <p className="text-sm" style={{ marginBottom: "1.5rem" }}>
                Here is how your property listing will appear to STR operators:
              </p>
              <div style={{ maxWidth: 440, margin: "0 auto 2rem" }}>
                <PropertyCard prop={previewProp} />
              </div>
              <div style={{ background: "var(--bg-tertiary)", padding: "1.25rem", borderRadius: "var(--radius-md)", marginBottom: "2rem", fontSize: "0.88rem" }}>
                Your listing is submitted as <strong>pending</strong>. It becomes public after admin approval.
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <button className="btn btn-secondary" onClick={() => setStep(4)}>
                  ← Back
                </button>
                <button className="btn btn-primary btn-lg" onClick={publishListing}>
                  🚀 Publish Property Live
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
