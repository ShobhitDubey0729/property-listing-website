import { useUi } from "../context/UiContext.jsx";

export function PricingPage() {
  const { toast } = useUi();
  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "5rem" }}>
      <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 3rem" }}>
        <span className="badge badge-featured" style={{ marginBottom: "0.5rem" }}>
          Transparent Pricing
        </span>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>Plans for Landlords & Operators</h1>
        <p>Simple, success-aligned tiers with zero hidden lock-ins.</p>
      </div>
      <div className="pricing-grid">
        <div className="pricing-card">
          <span className="badge badge-neutral" style={{ alignSelf: "flex-start" }}>
            Standard Listing
          </span>
          <h3 style={{ marginTop: "0.75rem" }}>Free Landlord Listing</h3>
          <p className="text-sm">Ideal for individual owners with 1 property.</p>
          <div className="price-tag">
            ₹0 <span style={{ fontSize: "1rem", fontWeight: "normal", color: "var(--text-muted)" }}>/ forever</span>
          </div>
          <div className="feature-check-list">
            <div className="feature-check-item">✓ Standard marketplace visibility</div>
            <div className="feature-check-item">✓ STR-friendly badges & tags</div>
            <div className="feature-check-item">✓ Up to 10 incoming proposals</div>
            <div className="feature-check-item">✓ Standard e-lease template</div>
          </div>
          <a href="#list-property" className="btn btn-outline" style={{ marginTop: "auto" }}>
            List for Free
          </a>
        </div>
        <div className="pricing-card featured">
          <span className="badge badge-featured" style={{ alignSelf: "flex-start" }}>
            Most Popular
          </span>
          <h3 style={{ marginTop: "0.75rem" }}>Featured Landlord Boost</h3>
          <p className="text-sm">Get verified Superhost operators within 48 hours.</p>
          <div className="price-tag">
            ₹2,999 <span style={{ fontSize: "1rem", fontWeight: "normal", color: "var(--text-muted)" }}>/ listing</span>
          </div>
          <div className="feature-check-list">
            <div className="feature-check-item">✓ Top rank in Search & Map view</div>
            <div className="feature-check-item">✓ &quot;Verified Landlord&quot; badge</div>
            <div className="feature-check-item">✓ Unlimited operator proposals</div>
            <div className="feature-check-item">✓ Operator KYC & background audit</div>
            <div className="feature-check-item">✓ Dedicated lease advisor support</div>
          </div>
          <button
            className="btn btn-primary"
            style={{ marginTop: "auto" }}
            onClick={() => {
              toast.success("Featured listing boost selected!");
              window.location.hash = "#list-property";
            }}
          >
            Boost My Listing
          </button>
        </div>
        <div className="pricing-card">
          <span className="badge badge-roi" style={{ alignSelf: "flex-start" }}>
            For Operators
          </span>
          <h3 style={{ marginTop: "0.75rem" }}>Operator Pro Pass</h3>
          <p className="text-sm">For ambitious entrepreneurs scaling an STR portfolio.</p>
          <div className="price-tag">
            ₹4,999 <span style={{ fontSize: "1rem", fontWeight: "normal", color: "var(--text-muted)" }}>/ month</span>
          </div>
          <div className="feature-check-list">
            <div className="feature-check-item">✓ Instant Landlord Contact Unlock (Unlimited)</div>
            <div className="feature-check-item">✓ 24-hour early access to new listings</div>
            <div className="feature-check-item">✓ Comprehensive AirDNA/Revenue benchmarking</div>
            <div className="feature-check-item">✓ Custom master sublease legal pack</div>
          </div>
          <button className="btn btn-roi" style={{ marginTop: "auto" }} onClick={() => toast.success("Operator Pro Pass activated!")}>
            Get Pro Access
          </button>
        </div>
      </div>
    </div>
  );
}

export function ResourcesPage() {
  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "5rem" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <span className="badge badge-str" style={{ marginBottom: "0.5rem" }}>
          Knowledge Base
        </span>
        <h1 style={{ marginBottom: "1rem" }}>Master Lease & STR Arbitrage Guide</h1>
        <p style={{ fontSize: "1.05rem", marginBottom: "2.5rem" }}>
          Everything you need to know about legally compliant short-term rental subleasing in Indian and global metros.
        </p>
        <div className="glass-panel" style={{ padding: "2rem", marginBottom: "2rem" }}>
          <h3>1. What is Rental Arbitrage / Master Leasing?</h3>
          <p style={{ marginTop: "0.5rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
            Rental arbitrage is a proven business model where an operator leases a residential property on a 1-3 year master lease from a landlord and furnishes it to host guests on platforms like Airbnb, Booking.com, and Agoda. The landlord enjoys guaranteed monthly rental without vacancies, while the operator earns the margin between nightly tourist revenue and fixed monthly expenses.
          </p>
        </div>
        <div className="glass-panel" style={{ padding: "2rem", marginBottom: "2rem" }}>
          <h3>2. Society / RWA Compliance in India</h3>
          <p style={{ marginTop: "0.5rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
            Different housing societies and RWAs have varied bylaws. On PropLease, all properties are pre-tagged with their specific society approvals. Standalone villas, independent floors, and commercial-zoned apartment complexes offer maximum flexibility.
          </p>
        </div>
        <div className="glass-panel" style={{ padding: "2rem" }}>
          <h3>3. Key Clauses in a PropLease Master Lease Agreement</h3>
          <ul style={{ marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.75rem", color: "var(--text-muted)" }}>
            <li>• <strong>Express Subletting Authorization:</strong> Explicit clause authorizing transient tourist occupancies.</li>
            <li>• <strong>Operator Indemnity & Insurance:</strong> Landlord is held completely harmless from any guest damages or third-party liability.</li>
            <li>• <strong>Maintenance Threshold:</strong> Operator covers minor maintenance (up to ₹5,000 per incident) directly.</li>
            <li>• <strong>Noise Decibel Monitoring:</strong> Mandatory installation of smart decibel sensors to enforce quiet hours.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
