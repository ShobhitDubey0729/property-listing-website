import { useState } from "react";
import { formatStatMoney } from "../utils/format.js";
import { useStore } from "../context/StoreContext.jsx";
import { PropertyCard } from "../components/PropertyCard.jsx";

export function HomePage() {
  const { store, properties, stats } = useStore();
  const featured = properties.filter((p) => p.featured).slice(0, 3);
  const displayProps = featured.length > 0 ? featured : properties.slice(0, 4);
  const [city, setCity] = useState("Goa");
  const [type, setType] = useState("All Types");
  const [budget, setBudget] = useState("150000");

  function executeHeroSearch() {
    store.setFilter("city", city);
    store.setFilter("propertyType", type);
    store.setFilter("maxPrice", parseInt(budget, 10));
    window.location.hash = "#explore";
  }

  function quickFilterCity(c) {
    store.setFilter("city", c);
    window.location.hash = "#explore";
  }

  return (
    <>
      <section className="hero-section">
        <div className="hero-glow-1" />
        <div className="hero-glow-2" />
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <span>✨</span> The Airbnb Rental Arbitrage Marketplace
            </div>
            <h1 className="hero-title">
              Find <span className="gradient-text-accent">STR-Friendly</span> Properties For Your Airbnb Business
            </h1>
            <p className="hero-subtitle">
              Connect directly with verified property owners who explicitly permit short-term rental subletting. Master leases, society NOCs, and real ROI projections — all in one place.
            </p>
            <div className="hero-search-box">
              <div className="hero-search-field">
                <span className="hero-search-label">Location / City</span>
                <select className="hero-search-select" value={city} onChange={(e) => setCity(e.target.value)}>
                  <option value="All Cities">All Hotspots (India)</option>
                  <option value="Goa">Goa (Anjuna, Candolim)</option>
                  <option value="Bengaluru">Bengaluru (Indiranagar, Koramangala)</option>
                  <option value="Mumbai">Mumbai (Bandra, Juhu)</option>
                  <option value="Jaipur">Jaipur (C-Scheme, Heritage)</option>
                  <option value="Manali">Manali (Old Manali, Chalets)</option>
                  <option value="Rishikesh">Rishikesh (Tapovan, Ganga-view)</option>
                </select>
              </div>
              <div className="hero-search-field">
                <span className="hero-search-label">Property Type</span>
                <select className="hero-search-select" value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="All Types">Any Property Type</option>
                  <option value="Villa">Villas & Independent Plots</option>
                  <option value="Apartment">Luxury Apartments</option>
                  <option value="Penthouse">Penthouses with Terraces</option>
                </select>
              </div>
              <div className="hero-search-field">
                <span className="hero-search-label">Max Lease Budget</span>
                <select className="hero-search-select" value={budget} onChange={(e) => setBudget(e.target.value)}>
                  <option value="250000">Up to ₹2,50,000 / mo</option>
                  <option value="150000">Up to ₹1,50,000 / mo</option>
                  <option value="100000">Up to ₹1,00,000 / mo</option>
                  <option value="60000">Up to ₹60,000 / mo</option>
                </select>
              </div>
              <button className="btn btn-primary hero-search-submit" onClick={executeHeroSearch}>
                Search STR Deals
              </button>
            </div>
            <div className="city-shortcuts">
              <span style={{ fontSize: "0.85rem", color: "var(--text-subtle)", marginRight: "0.5rem" }}>Popular Markets:</span>
              {["Goa", "Bengaluru", "Mumbai", "Jaipur", "Manali", "Rishikesh"].map((c) => (
                <span key={c} className="city-pill" onClick={() => quickFilterCity(c)}>
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div className="hero-stats-banner">
            <div className="stat-item">
              <div className="stat-num gradient-text">
                {stats.verified_listing_percentage != null ? stats.verified_listing_percentage + "%" : "—"}
              </div>
              <div className="stat-label">Verified Share of {stats.total_active_listings || 0} Live Listings</div>
            </div>
            <div className="stat-item">
              <div className="stat-num gradient-text-roi">{formatStatMoney(stats.average_operator_net_profit)}</div>
              <div className="stat-label">Avg. Monthly Operator Net Profit</div>
            </div>
            <div className="stat-item">
              <div className="stat-num gradient-text">
                {stats.average_estimated_roi != null ? stats.average_estimated_roi + "%" : "—"}
              </div>
              <div className="stat-label">Avg. Arbitrage Cash-on-Cash ROI</div>
            </div>
            <div className="stat-item">
              <div className="stat-num gradient-text-accent">{formatStatMoney(stats.average_monthly_rent)}</div>
              <div className="stat-label">Average Monthly Master Lease</div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "4rem 0" }}>
        <div className="container">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <span className="badge badge-featured" style={{ marginBottom: "0.5rem" }}>
                Handpicked Deals
              </span>
              <h2>Top Performing Rental Arbitrage Opportunities</h2>
              <p>Pre-vetted properties with highest projected revenue and verified landlord subletting NOCs.</p>
            </div>
            <a href="#explore" className="btn btn-outline">
              View All Properties →
            </a>
          </div>
          <div className="grid grid-3 gap-6">
            {displayProps.map((p) => (
              <PropertyCard key={p.id} prop={p} />
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "4rem 0", background: "var(--bg-tertiary)", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 3.5rem" }}>
            <span className="badge badge-str" style={{ marginBottom: "0.5rem" }}>
              The Ecosystem
            </span>
            <h2>A Win-Win for Landlords and STR Operators</h2>
            <p>We eliminate the friction of finding STR-friendly landlords and provide clear legal contracts.</p>
          </div>
          <div className="how-it-works-grid">
            <div className="role-flow-column owner-col">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <span className="badge badge-str">For Property Owners</span>
                <span style={{ fontSize: "1.5rem" }}>🏡</span>
              </div>
              <h3 style={{ marginBottom: "0.75rem" }}>Earn Predictable, Premium Lease Income</h3>
              <p style={{ marginBottom: "2rem" }}>Lease your unit to seasoned Superhosts who maintain your property immaculately.</p>
              <div className="step-timeline-item">
                <div className="step-num-bubble">1</div>
                <div>
                  <h4>List with STR Clauses</h4>
                  <p className="text-sm">Set your lease expectations, security deposit, and approved guest turnover rules in 5 minutes.</p>
                </div>
              </div>
              <div className="step-timeline-item">
                <div className="step-num-bubble">2</div>
                <div>
                  <h4>Screen Vetted Operators</h4>
                  <p className="text-sm">Review operator Airbnb track record, decibel monitoring tools, and guest screening protocols.</p>
                </div>
              </div>
              <div className="step-timeline-item">
                <div className="step-num-bubble">3</div>
                <div>
                  <h4>Sign E-Lease & Collect Rent</h4>
                  <p className="text-sm">Execute standardized master lease agreements with explicit property damage indemnity.</p>
                </div>
              </div>
              <a href="#list-property" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
                List Your Property Now →
              </a>
            </div>
            <div className="role-flow-column operator-col">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                <span className="badge badge-roi">For STR Operators & Investors</span>
                <span style={{ fontSize: "1.5rem" }}>📈</span>
              </div>
              <h3 style={{ marginBottom: "0.75rem" }}>Scale an Airbnb Empire Without Buying Real Estate</h3>
              <p style={{ marginBottom: "2rem" }}>Stop getting rejected by landlords. Find properties where subletting is 100% welcomed.</p>
              <div className="step-timeline-item">
                <div className="step-num-bubble" style={{ background: "var(--success-subtle)", color: "var(--success)", borderColor: "#a7f3d0" }}>
                  1
                </div>
                <div>
                  <h4>Filter Pre-Approved Deals</h4>
                  <p className="text-sm">Filter by city, tourist hubs, society NOC readiness, smart lock support, and projected ROI.</p>
                </div>
              </div>
              <div className="step-timeline-item">
                <div className="step-num-bubble" style={{ background: "var(--success-subtle)", color: "var(--success)", borderColor: "#a7f3d0" }}>
                  2
                </div>
                <div>
                  <h4>Model Cash Flow & ROI</h4>
                  <p className="text-sm">Use our interactive deal analyzer to stress-test nightly ADRs, occupancy, and operating margins.</p>
                </div>
              </div>
              <div className="step-timeline-item">
                <div className="step-num-bubble" style={{ background: "var(--success-subtle)", color: "var(--success)", borderColor: "#a7f3d0" }}>
                  3
                </div>
                <div>
                  <h4>Submit Master Lease Proposals</h4>
                  <p className="text-sm">Send business proposals directly to landlords with 1-click verified contact unlock.</p>
                </div>
              </div>
              <a href="#explore" className="btn btn-roi" style={{ width: "100%", marginTop: "1rem" }}>
                Browse Pre-Approved Properties →
              </a>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "5rem 0" }}>
        <div className="container">
          <div className="glass-panel" style={{ padding: "3rem", background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)", borderColor: "var(--border-subtle)", boxShadow: "var(--shadow-lg)" }}>
            <div className="grid grid-2 gap-8" style={{ alignItems: "center" }}>
              <div>
                <span className="badge badge-roi" style={{ marginBottom: "0.75rem" }}>
                  Interactive Simulator
                </span>
                <h2>How Much Can You Earn from Rental Arbitrage?</h2>
                <p style={{ margin: "1rem 0 1.75rem", fontSize: "1.05rem" }}>
                  A 3BHK villa in Goa leased at ₹1,40,000/month generates ~₹3,19,000/month at 72% occupancy (₹14,500 ADR). After utilities and OTA fees, net cashflow exceeds <strong>₹1,20,000/month</strong>.
                </p>
                <a href="#roi-calculator" className="btn btn-primary btn-lg">
                  Launch Full ROI Simulator →
                </a>
              </div>
              <div style={{ background: "#ffffff", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-lg)", padding: "1.75rem", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700 }}>Sample Goa 3BHK Deal</div>
                <div style={{ fontSize: "2.25rem", fontWeight: 800, fontFamily: "var(--font-heading)", color: "var(--success)", margin: "0.25rem 0 1rem" }}>
                  ₹1,21,580 <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: "normal" }}>/ month net profit</span>
                </div>
                <div className="roi-calc-row">
                  <span>Gross Airbnb Revenue:</span>
                  <strong style={{ color: "var(--text-main)" }}>₹3,13,200</strong>
                </div>
                <div className="roi-calc-row">
                  <span>Fixed Master Lease:</span>
                  <span style={{ color: "var(--danger)" }}>-₹1,40,000</span>
                </div>
                <div className="roi-calc-row">
                  <span>Cleaning, Linen & Utilities:</span>
                  <span style={{ color: "var(--danger)" }}>-₹51,620</span>
                </div>
                <div className="roi-calc-row">
                  <span>Annual Cash-on-Cash Return:</span>
                  <strong style={{ color: "var(--primary)" }}>128%</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
