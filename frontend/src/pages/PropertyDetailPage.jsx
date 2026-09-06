import { useEffect, useMemo, useState } from "react";
import { formatINR } from "../utils/format.js";
import { generateGoogleMapsDirectionsUrl, generateGoogleMapsEmbedUrl } from "../utils/maps.js";
import { api } from "../api/client.js";
import { useStore } from "../context/StoreContext.jsx";
import { useUi } from "../context/UiContext.jsx";

export function PropertyDetailPage({ propertyId }) {
  const { store } = useStore();
  const { toast, openMap, openProposal, openContact } = useUi();
  const [loading, setLoading] = useState(!store.getPropertyById(propertyId));
  const prop = store.getPropertyById(propertyId);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (store.getPropertyById(propertyId)) {
        setLoading(false);
        return;
      }
      setLoading(true);
      await store.ensureProperty(propertyId);
      if (!cancelled) setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [propertyId, store]);

  if (loading) {
    return (
      <div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>
        <p>Loading listing…</p>
      </div>
    );
  }

  if (!prop) {
    return (
      <div className="container" style={{ padding: "5rem 0", textAlign: "center" }}>
        <h2>Property Not Found</h2>
        <p style={{ margin: "1rem 0 2rem" }}>The property you are looking for does not exist or has been unlisted.</p>
        <a href="#explore" className="btn btn-primary">
          Browse Available Properties
        </a>
      </div>
    );
  }

  return <PropertyDetailBody prop={prop} toast={toast} openMap={openMap} openProposal={openProposal} openContact={openContact} store={store} />;
}

function PropertyDetailBody({ prop, toast, openMap, openProposal, openContact, store }) {
  const isFav = store.isFavorite(prop.id);
  const images =
    prop.images && prop.images.length > 0
      ? prop.images
      : ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80"];
  const defaultAdr = prop.est_nightly_rate || 10000;
  const defaultOcc = prop.est_occupancy_pct || 70;
  const monthlyLease = prop.monthly_rent || 100000;
  const [adr, setAdr] = useState(defaultAdr);
  const [occ, setOcc] = useState(defaultOcc);
  const lat = prop.lat || 15.5841;
  const lng = prop.lng || 73.7442;
  const nearbyList = prop.nearby_places || [
    { name: "Transit / Metro Station", dist: "800 m" },
    { name: "Tourist Attraction Hub", dist: "1.2 km" },
    { name: "Supermarket & Cafes", dist: "300 m" },
    { name: "Nearest Airport", dist: "25 km" }
  ];

  const roi = useMemo(() => {
    const nights = (30 * occ) / 100;
    const grossRev = Math.round(adr * nights);
    const opex = Math.round(grossRev * 0.18);
    const netProfit = grossRev - monthlyLease - opex;
    const upfrontCapital = monthlyLease * 3;
    const annualRoi = Math.round(((netProfit * 12) / upfrontCapital) * 100);
    return { grossRev, opex, netProfit, annualRoi };
  }, [adr, occ, monthlyLease]);

  async function unlockContact() {
    if (!store.currentUser) {
      toast.warning("Sign in to unlock landlord contact");
      window.location.hash = "#login";
      return;
    }
    try {
      const contact = await api.unlockContact(prop.id);
      openContact({ name: contact.name || prop.owner?.name || "Verified Owner", phone: contact.phone });
    } catch (err) {
      toast.warning(err.message || "Could not unlock contact");
    }
  }

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "4rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <a href="#explore" className="btn btn-secondary btn-sm" style={{ gap: "0.4rem" }}>
          Back to Explore
        </a>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn btn-secondary btn-sm" onClick={() => openMap(prop.id)}>
            Google Map
          </button>
          <button
            className={`btn btn-secondary btn-sm fav-btn${isFav ? " active" : ""}`}
            onClick={async () => {
              const added = await store.toggleFavorite(prop.id, toast);
              if (store.currentUser) toast.success(added ? "Property added to Shortlist" : "Removed from Shortlist");
            }}
          >
            {isFav ? "Shortlisted" : "Save to Shortlist"}
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              const res = store.toggleCompare(prop.id);
              if (!res.success && res.reason) toast.warning(res.reason);
            }}
          >
            Compare
          </button>
        </div>
      </div>
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
          {prop.str_friendly ? <span className="badge badge-str">STR / Airbnb Friendly</span> : null}
          {prop.verified ? <span className="badge badge-verified">✓ Verified Master Landlord</span> : null}
          <span className="badge badge-neutral">{prop.property_type}</span>
        </div>
        <h1 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", marginBottom: "0.5rem" }}>{prop.title}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.95rem" }}>
          {prop.address || `${prop.locality}, ${prop.city}`}
          <button className="location-map-tag" style={{ marginLeft: "0.5rem" }} onClick={() => openMap(prop.id)}>
            Open Google Map ↗
          </button>
        </div>
      </div>
      <div className="detail-gallery-grid">
        <img src={images[0]} alt={prop.title} className="detail-gallery-item detail-gallery-main" />
        <img src={images[1] || images[0]} alt="Interior view" className="detail-gallery-item" />
        <img src={images[2] || images[0]} alt="Bedroom view" className="detail-gallery-item" />
        <img src={images[3] || images[0]} alt="Amenities view" className="detail-gallery-item" />
        <img src={images[0]} alt="Compound view" className="detail-gallery-item" />
      </div>
      <div className="detail-content-layout">
        <div className="detail-main-info">
          <div className="glass-panel" style={{ padding: "1.25rem 1.75rem", marginBottom: "2rem", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "1rem" }}>
            {[
              ["Bedrooms", `${prop.bedrooms} BHK`],
              ["Bathrooms", `${prop.bathrooms} Bath`],
              ["Carpet Area", `${prop.area_sqft} sq.ft`],
              ["Furnishing", prop.furnishing_status],
              ["Min Lease", `${prop.min_lease_months} Months`]
            ].map(([label, val]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--text-subtle)", textTransform: "uppercase", fontWeight: 700 }}>{label}</span>
                <p style={{ fontSize: "1.25rem", fontWeight: 700 }}>{val}</p>
              </div>
            ))}
          </div>
          <div className="detail-section">
            <h3 style={{ marginBottom: "0.75rem" }}>Property Description</h3>
            <p style={{ fontSize: "1rem", lineHeight: 1.7, color: "var(--text-muted)" }}>{prop.description}</p>
          </div>
          <div className="detail-section">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3>STR / Rental Arbitrage Permissions & Rules</h3>
              <span className="badge badge-verified">Verified by PropLease</span>
            </div>
            <div className="str-checklist" style={{ marginTop: "1rem" }}>
              {[
                ["Society NOC / Sublet Permission", "Landlord has confirmed short-term guests are 100% permitted by building management/RWA."],
                ["Frequent Guest Turnover Allowed", "Daily and weekly tourist check-ins allowed without additional gate fees or NOC delays."],
                ["Smart Lock & Self Check-in", "Operator is authorized to install keypad/smart locks on the front door."],
                ["Housekeeping & Linen Access", "Turnover cleaning staff and linen deliveries are granted regular building entry passes."],
                ["Commercial Arbitrage Lease Clause", "Formal sublease agreement provided on platform with explicit indemnity protection."],
                ["Noise & Party Rules", prop.society_rules ? prop.society_rules.noise_curfew : "Strict quiet hours after 10:30 PM"]
              ].map(([title, body]) => (
                <div className="str-check-item" key={title}>
                  <div className="str-check-icon">✓</div>
                  <div>
                    <h5 style={{ marginBottom: "0.2rem" }}>{title}</h5>
                    <p className="text-sm">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="detail-section">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div>
                <h3>Location & Strategic Transit Hubs</h3>
                <p className="text-sm" style={{ marginTop: "0.2rem" }}>
                  Real-time Google Maps pinpoint with tourist & transit access metrics.
                </p>
              </div>
              <a href={generateGoogleMapsDirectionsUrl(lat, lng)} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                Get Directions
              </a>
            </div>
            <div style={{ height: 320, borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--border-medium)", marginBottom: "1.25rem" }}>
              <iframe title={`Google Maps Location for ${prop.title}`} src={generateGoogleMapsEmbedUrl(lat, lng, prop.title, 15)} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
            <div className="map-nearby-grid">
              {nearbyList.map((place) => (
                <div className="map-nearby-pill" key={place.name}>
                  <span className="map-nearby-icon">📍</span>
                  <span className="map-nearby-name">{place.name}</span>
                  <span className="map-nearby-dist">{place.dist}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="detail-section">
            <h3 style={{ marginBottom: "1rem" }}>Amenities & Features</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
              {(prop.str_tags || []).map((tag) => (
                <div key={tag} style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.9rem", background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)", fontSize: "0.88rem" }}>
                  <span style={{ color: "var(--primary-light)" }}>✦</span> {tag}
                </div>
              ))}
            </div>
          </div>
          <div className="detail-section">
            <h3 style={{ marginBottom: "1rem" }}>Landlord Information</h3>
            <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                <div style={{ width: 54, height: 54, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary) 0%, #06b6d4 100%)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.35rem", fontWeight: 800, color: "#fff" }}>
                  {prop.owner ? prop.owner.name.charAt(0) : "L"}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <h4 style={{ margin: 0 }}>{prop.owner ? prop.owner.name : "Property Landlord"}</h4>
                    <span className="badge badge-verified">Verified</span>
                  </div>
                  <p className="text-sm" style={{ marginTop: "0.2rem" }}>
                    Member since {prop.owner ? prop.owner.member_since : "2023"} • Response time: {prop.owner ? prop.owner.response_time : "< 1 hr"}
                  </p>
                </div>
              </div>
              <button className="btn btn-secondary" onClick={unlockContact}>
                Unlock Direct Contact
              </button>
            </div>
          </div>
        </div>
        <div className="detail-sidebar">
          <div className="roi-widget-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <span className="badge badge-roi">Arbitrage Deal Analyzer</span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-subtle)" }}>Live Model</span>
            </div>
            <div className="roi-metric-highlight">
              <span style={{ fontSize: "0.8rem", textTransform: "uppercase", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em" }}>Estimated Monthly Net Profit</span>
              <div className="roi-metric-value" style={{ color: roi.netProfit >= 0 ? "var(--success-light)" : "var(--danger)" }}>
                {formatINR(roi.netProfit)}
              </div>
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: roi.annualRoi >= 0 ? "var(--success)" : "var(--danger)", display: "block", marginTop: "0.2rem" }}>
                {roi.annualRoi}% Cash-on-Cash Return
              </span>
            </div>
            <div style={{ marginBottom: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: "0.25rem" }}>
                <span style={{ color: "var(--text-muted)" }}>Fixed Monthly Lease:</span>
                <span style={{ fontWeight: 700 }}>{formatINR(monthlyLease)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "var(--text-subtle)" }}>
                <span>Security Deposit:</span>
                <span>{formatINR(prop.security_deposit || monthlyLease * 2)}</span>
              </div>
            </div>
            <hr style={{ border: 0, borderTop: "1px solid var(--border-subtle)", margin: "1.25rem 0" }} />
            <div className="form-group">
              <div className="range-header">
                <span className="form-label" style={{ margin: 0 }}>
                  Expected Nightly ADR
                </span>
                <span className="range-val">₹{adr.toLocaleString()}</span>
              </div>
              <input type="range" min={Math.round(defaultAdr * 0.4)} max={Math.round(defaultAdr * 2)} step="250" value={adr} onChange={(e) => setAdr(parseInt(e.target.value, 10))} />
            </div>
            <div className="form-group">
              <div className="range-header">
                <span className="form-label" style={{ margin: 0 }}>
                  Expected Occupancy %
                </span>
                <span className="range-val">
                  {occ}% ({Math.round(occ * 0.3)} nights/mo)
                </span>
              </div>
              <input type="range" min="30" max="95" step="1" value={occ} onChange={(e) => setOcc(parseInt(e.target.value, 10))} />
            </div>
            <div style={{ background: "var(--bg-tertiary)", borderRadius: "var(--radius-md)", padding: "1rem", marginBottom: "1.5rem" }}>
              <div className="roi-calc-row">
                <span style={{ color: "var(--text-muted)" }}>Gross Monthly Revenue:</span>
                <span style={{ fontWeight: 700 }}>{formatINR(roi.grossRev)}</span>
              </div>
              <div className="roi-calc-row">
                <span style={{ color: "var(--text-muted)" }}>- Lease Cost:</span>
                <span style={{ color: "var(--danger)" }}>{formatINR(monthlyLease)}</span>
              </div>
              <div className="roi-calc-row">
                <span style={{ color: "var(--text-muted)" }}>- Operating & OTA Fees (18%):</span>
                <span style={{ color: "var(--danger)" }}>{formatINR(roi.opex)}</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button className="btn btn-primary btn-lg" onClick={() => openProposal(prop.id)}>
                Apply as Operator (Submit Proposal)
              </button>
              <a href="#roi-calculator" className="btn btn-outline btn-sm" style={{ textAlign: "center" }}>
                Open Full 10-Year Arbitrage Simulator →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProposalModal() {
  const { store } = useStore();
  const { proposalPropertyId, closeProposal, toast } = useUi();
  if (!proposalPropertyId) return null;
  const prop = store.getPropertyById(proposalPropertyId);
  if (!prop) return null;

  function handleSubmit(event) {
    event.preventDefault();
    if (!store.currentUser) {
      closeProposal();
      toast.warning("Sign in as an operator to send a proposal");
      window.location.hash = "#login";
      return;
    }
    const formData = new FormData(event.target);
    const tenure = String(formData.get("tenure") || "12");
    const months = parseInt(tenure, 10) || 12;
    store
      .addInquiry({
        property_id: prop.id,
        property_title: prop.title,
        operator_name: formData.get("name"),
        portfolio_size: formData.get("experience"),
        proposed_terms: `${formData.get("tenure")} tenure. ${String(formData.get("message") || "").slice(0, 80)}...`,
        proposed_tenure_months: months
      })
      .then(() => {
        closeProposal();
        toast.success("Proposal sent to landlord. Track it in Operator Hub.");
      })
      .catch((err) => toast.warning(err.message || "Could not send proposal"));
  }

  return (
    <div className="modal-overlay active">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title">Submit Operator Master Lease Proposal</h3>
          <button className="modal-close-btn" onClick={closeProposal}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ background: "var(--bg-tertiary)", padding: "0.9rem", borderRadius: "var(--radius-md)", marginBottom: "1.25rem", fontSize: "0.88rem" }}>
              <strong>Property:</strong> {prop.title} ({prop.locality}, {prop.city})
              <br />
              <strong>Asking Rent:</strong> {formatINR(prop.monthly_rent)}/mo
            </div>
            <div className="form-group">
              <label className="form-label">Operator / Co-Host Full Name *</label>
              <input type="text" className="form-control" name="name" required defaultValue="Kavita Sharma" />
            </div>
            <div className="grid grid-2 gap-4">
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input type="email" className="form-control" name="email" required defaultValue="kavita@luxestay.in" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone / WhatsApp *</label>
                <input type="tel" className="form-control" name="phone" required defaultValue="+91 98112 34567" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Existing Portfolio & Experience</label>
              <select className="form-select" name="experience" defaultValue="4-10 properties (Experienced Operator)">
                <option value="1-3 properties (1-2 years experience)">1–3 Active Airbnb Units (Superhost)</option>
                <option value="4-10 properties (Experienced Operator)">4–10 Active Units (Professional STR Operator)</option>
                <option value="10+ properties (Property Management Co)">10+ Units (Enterprise Hospitality Firm)</option>
                <option value="First-time STR investor">First-time STR Arbitrage Operator</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Proposed Lease Term</label>
              <select className="form-select" name="tenure" defaultValue="12 Months">
                <option value="12 Months">12 Months (Standard Master Lease)</option>
                <option value="24 Months">24 Months (2-Year Lock-in)</option>
                <option value="36 Months">36 Months (Long-Term with 5% Escalation)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Business Pitch & Maintenance Commitments</label>
              <textarea className="form-control" name="message" rows="3" defaultValue="We manage 6 Superhost properties in the area. We install smart door locks, Minut decibel sensors to eliminate any noise disturbance, provide weekly deep-cleaning, and cover minor maintenance up to ₹5,000 ourselves." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={closeProposal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Formal Proposal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ContactModal() {
  const { contactModal, closeContact } = useUi();
  if (!contactModal) return null;
  return (
    <div className="modal-overlay active">
      <div className="modal-container" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <h3 className="modal-title">Verified Landlord Contact</h3>
          <button className="modal-close-btn" onClick={closeContact}>
            &times;
          </button>
        </div>
        <div className="modal-body" style={{ textAlign: "center", padding: "2rem 1.5rem" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "var(--success-subtle)", color: "var(--success)", fontSize: "1.8rem", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
            📞
          </div>
          <h4>{contactModal.name}</h4>
          <p className="text-sm" style={{ marginBottom: "1.5rem" }}>
            Direct Line for STR Lease Inquiries:
          </p>
          <div style={{ background: "var(--bg-tertiary)", border: "1px solid var(--border-medium)", borderRadius: "var(--radius-lg)", padding: "1.25rem", fontFamily: "var(--font-mono)", fontSize: "1.3rem", fontWeight: 700, color: "var(--primary-light)", letterSpacing: "0.05em", marginBottom: "1.5rem" }}>
            {contactModal.phone}
          </div>
        </div>
        <div className="modal-footer" style={{ justifyContent: "center" }}>
          <button className="btn btn-primary" onClick={closeContact}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
