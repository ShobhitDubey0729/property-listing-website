import { useStore } from "../context/StoreContext.jsx";
import { useUi } from "../context/UiContext.jsx";

export function Footer() {
  const { store } = useStore();
  const { toast } = useUi();

  function quickFilterCity(city) {
    store.setFilter("city", city);
  }

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top-grid">
          <div>
            <a href="#home" className="brand-logo" style={{ marginBottom: "1rem" }}>
              <div className="brand-icon-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <span>PropLease</span>
            </a>
            <p className="text-sm" style={{ lineHeight: 1.6, maxWidth: 300, marginBottom: "1.25rem" }}>
              The dedicated marketplace bridging property owners with professional Airbnb & STR operators for master leases.
            </p>
            <div className="social-links">
              <a href="#home" className="social-icon-btn" title="Twitter">
                𝕏
              </a>
              <a href="#home" className="social-icon-btn" title="LinkedIn">
                in
              </a>
              <a href="#home" className="social-icon-btn" title="Instagram">
                📸
              </a>
            </div>
          </div>
          <div>
            <div className="footer-col-title">For Operators</div>
            <div className="footer-link-list">
              <a href="#explore" className="footer-link">
                Browse STR Listings
              </a>
              <a href="#roi-calculator" className="footer-link">
                Arbitrage ROI Simulator
              </a>
              <a href="#pricing" className="footer-link">
                Operator Pro Pass
              </a>
              <a href="#operator-dashboard" className="footer-link">
                Shortlisted Deals
              </a>
            </div>
          </div>
          <div>
            <div className="footer-col-title">For Landlords</div>
            <div className="footer-link-list">
              <a href="#list-property" className="footer-link">
                List Your Property
              </a>
              <a href="#owner-dashboard" className="footer-link">
                Landlord Portal
              </a>
              <a href="#pricing" className="footer-link">
                Featured Boost
              </a>
              <a href="#resources" className="footer-link">
                Standard Sublease NOC
              </a>
            </div>
          </div>
          <div>
            <div className="footer-col-title">Top Destinations</div>
            <div className="footer-link-list">
              <a href="#explore" className="footer-link" onClick={() => quickFilterCity("Goa")}>
                Goa Villas
              </a>
              <a href="#explore" className="footer-link" onClick={() => quickFilterCity("Bengaluru")}>
                Bengaluru Tech Penthouses
              </a>
              <a href="#explore" className="footer-link" onClick={() => quickFilterCity("Mumbai")}>
                Mumbai Sea-Facing
              </a>
              <a href="#explore" className="footer-link" onClick={() => quickFilterCity("Manali")}>
                Manali Mountain Chalets
              </a>
            </div>
          </div>
          <div>
            <div className="footer-col-title">Trust & Safety</div>
            <div className="footer-link-list">
              <a href="#resources" className="footer-link">
                RWA Society Guidelines
              </a>
              <a href="#resources" className="footer-link">
                Decibel Sensor Protocols
              </a>
              <a href="#admin-panel" className="footer-link">
                Admin Moderation
              </a>
              <a
                href="#home"
                className="footer-link"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info("Privacy Policy is compliant with DPDP Act 2023");
                }}
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div>© 2026 PropLease Technologies Inc. All rights reserved. Master lease platform built for rental arbitrage.</div>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <span>🔒 256-Bit Encrypted</span>
            <span>🛡️ Verified Landlords</span>
            <span>📋 E-Sign Compatible</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
