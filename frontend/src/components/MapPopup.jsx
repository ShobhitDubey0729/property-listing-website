import { formatINR } from "../utils/format.js";
import { generateGoogleMapsDirectionsUrl, generateGoogleMapsEmbedUrl } from "../utils/maps.js";
import { useStore } from "../context/StoreContext.jsx";
import { useUi } from "../context/UiContext.jsx";

export function MapPopup() {
  const { store } = useStore();
  const { mapPropertyId, closeMap } = useUi();
  if (!mapPropertyId) return null;
  const prop = store.getPropertyById(mapPropertyId);
  if (!prop) return null;

  const lat = prop.lat || 15.5841;
  const lng = prop.lng || 73.7442;
  const mapUrl = generateGoogleMapsEmbedUrl(lat, lng, prop.title);
  const directionsUrl = generateGoogleMapsDirectionsUrl(lat, lng);
  const nearby = prop.nearby_places || [
    { name: "City Transit / Metro Hub", dist: "1.2 km" },
    { name: "Tourist District / Cafes", dist: "800 m" },
    { name: "International Airport", dist: "25 km" }
  ];

  return (
    <div
      className="modal-overlay active"
      id="google-map-popup-modal"
      onClick={(e) => {
        if (e.target.id === "google-map-popup-modal") closeMap();
      }}
    >
      <div className="map-popup-container glass-panel-glow">
        <div className="map-popup-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div className="map-popup-brand-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span className="badge badge-str">Google Maps Live</span>
                <span className="badge badge-roi">{prop.est_annual_roi_pct || 110}% Est. ROI</span>
              </div>
              <h3 className="map-popup-title">{prop.title}</h3>
            </div>
          </div>
          <button className="modal-close-btn" onClick={closeMap}>
            &times;
          </button>
        </div>
        <div className="map-iframe-wrapper">
          <iframe
            title={`Google Maps Location for ${prop.title}`}
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="map-coords-badge">
            <span style={{ color: "var(--primary)", fontWeight: 700 }}>GPS:</span> {lat.toFixed(4)}° N, {lng.toFixed(4)}° E • {prop.locality}, {prop.city}
          </div>
        </div>
        <div className="map-popup-body">
          <div className="map-specs-bar">
            <div className="map-spec-item">
              <span className="map-spec-label">Monthly Master Lease</span>
              <span className="map-spec-val">{formatINR(prop.monthly_rent)}/mo</span>
            </div>
            <div className="map-spec-item">
              <span className="map-spec-label">Nightly ADR Target</span>
              <span className="map-spec-val" style={{ color: "var(--primary)" }}>
                ₹{prop.est_nightly_rate?.toLocaleString()}
              </span>
            </div>
            <div className="map-spec-item">
              <span className="map-spec-label">Society NOC Status</span>
              <span className="map-spec-val" style={{ color: "var(--success)", fontSize: "0.85rem" }}>
                ✓ Pre-Approved STR
              </span>
            </div>
          </div>
          <div style={{ marginTop: "1rem" }}>
            <div
              style={{
                fontSize: "0.825rem",
                fontWeight: 700,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                marginBottom: "0.5rem",
                letterSpacing: "0.05em"
              }}
            >
              Strategic Proximity & Guest Transit Points
            </div>
            <div className="map-nearby-grid">
              {nearby.map((place) => (
                <div className="map-nearby-pill" key={place.name}>
                  <span className="map-nearby-icon">📍</span>
                  <span className="map-nearby-name">{place.name}</span>
                  <span className="map-nearby-dist">{place.dist}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="map-popup-footer">
          <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ gap: "0.4rem" }}>
            Get Driving Directions
          </a>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button className="btn btn-ghost btn-sm" onClick={closeMap}>
              Close
            </button>
            <a href={`#detail/${prop.id}`} className="btn btn-primary btn-sm" onClick={closeMap}>
              Analyze Full Deal & ROI →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
