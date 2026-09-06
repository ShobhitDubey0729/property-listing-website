import { useEffect } from "react";
import { CITIES_LIST, PROPERTY_TYPES, STR_FILTER_OPTIONS } from "../data/seed.js";
import { formatINR } from "../utils/format.js";
import { generateGoogleMapsEmbedUrl } from "../utils/maps.js";
import { useStore } from "../context/StoreContext.jsx";
import { useUi } from "../context/UiContext.jsx";
import { PropertyCard } from "../components/PropertyCard.jsx";

export function ExplorePage() {
  const { store, filters } = useStore();
  const { openMap, splitSelectedId, setSplitSelectedId, fullMapFocus, setFullMapFocus, toast } = useUi();
  const filtered = store.getFilteredProperties();
  const selectedFirstProp = filtered.length > 0 ? filtered[0] : null;

  useEffect(() => {
    if (selectedFirstProp && !splitSelectedId) setSplitSelectedId(selectedFirstProp.id);
  }, [selectedFirstProp, splitSelectedId, setSplitSelectedId]);

  function handleTagToggle(tag) {
    const currentTags = [...store.filters.selectedTags];
    const index = currentTags.indexOf(tag);
    if (index > -1) currentTags.splice(index, 1);
    else currentTags.push(tag);
    store.setFilter("selectedTags", currentTags);
  }

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "5rem" }}>
      <div style={{ marginBottom: "2rem", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <span className="badge badge-str" style={{ marginBottom: "0.5rem" }}>
            Marketplace
          </span>
          <h1 style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)" }}>Explore STR-Friendly Properties</h1>
          <p>Browse verified residential units and villas with pre-approved short-term rental / Airbnb subleasing rights.</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <a href="#roi-calculator" className="btn btn-outline btn-sm">
            Deal Simulator
          </a>
          <button className="btn btn-secondary btn-sm" onClick={() => store.resetFilters()}>
            Reset Filters
          </button>
        </div>
      </div>
      <div className={`explore-layout${filters.viewMode === "split" ? " explore-split-mode" : ""}`}>
        <aside className="filter-sidebar">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "1.15rem" }}>Filter Deals</h3>
            <span style={{ fontSize: "0.8rem", color: "var(--primary-light)", cursor: "pointer" }} onClick={() => store.resetFilters()}>
              Clear All
            </span>
          </div>
          <div className="form-group">
            <label className="form-label">Keyword Search</label>
            <div className="input-with-icon">
              <input
                type="text"
                className="form-control"
                placeholder="Search Goa, Indiranagar, Pool..."
                defaultValue={filters.searchQuery}
                onChange={(e) => store.setFilter("searchQuery", e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Destination / City</label>
            <select className="form-select" value={filters.city} onChange={(e) => store.setFilter("city", e.target.value)}>
              {CITIES_LIST.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Property Type</label>
            <select className="form-select" value={filters.propertyType} onChange={(e) => store.setFilter("propertyType", e.target.value)}>
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <div className="range-header">
              <span className="form-label" style={{ margin: 0 }}>
                Max Monthly Lease
              </span>
              <span className="range-val">{formatINR(filters.maxPrice)}</span>
            </div>
            <input type="range" min="40000" max="250000" step="5000" value={filters.maxPrice} onChange={(e) => store.setFilter("maxPrice", parseInt(e.target.value, 10))} />
          </div>
          <div className="form-group">
            <label className="form-label">Minimum Bedrooms (BHK)</label>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {[0, 1, 2, 3, 4].map((bhk) => (
                <button
                  key={bhk}
                  className={`btn btn-sm ${filters.minBedrooms === bhk ? "btn-primary" : "btn-secondary"}`}
                  style={{ flex: 1, padding: "0.4rem 0" }}
                  onClick={() => store.setFilter("minBedrooms", bhk)}
                >
                  {bhk === 0 ? "Any" : `${bhk}+`}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group" style={{ marginTop: "1.25rem" }}>
            <label className="form-label" style={{ marginBottom: "0.6rem" }}>
              STR Tags & Amenities
            </label>
            <div className="tag-checkbox-grid">
              {STR_FILTER_OPTIONS.map((tag) => {
                const checked = filters.selectedTags.includes(tag);
                return (
                  <label key={tag} className={`tag-checkbox-label${checked ? " checked" : ""}`}>
                    <input type="checkbox" checked={checked} onChange={() => handleTagToggle(tag)} />
                    {tag}
                  </label>
                );
              })}
            </div>
          </div>
        </aside>
        <main className="explore-main">
          <div className="explore-toolbar">
            <div className="results-count-title">
              Showing <span className="text-primary">{filtered.length}</span> STR-friendly properties
            </div>
            <div className="toolbar-controls">
              <select className="form-select" style={{ width: "auto", padding: "0.45rem 0.9rem", fontSize: "0.85rem" }} value={filters.sortBy} onChange={(e) => store.setFilter("sortBy", e.target.value)}>
                <option value="roi-desc">Sort by: Highest ROI %</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
              <div className="view-mode-toggle">
                {["grid", "split", "map"].map((mode) => (
                  <button key={mode} className={`view-mode-btn${filters.viewMode === mode ? " active" : ""}`} onClick={() => store.setFilter("viewMode", mode)}>
                    {mode === "grid" ? "Grid" : mode === "split" ? "Split Map" : "Map"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <ExploreMode
            mode={filters.viewMode}
            properties={filtered}
            selectedId={splitSelectedId || selectedFirstProp?.id}
            onExpandMap={openMap}
            fullMapFocus={fullMapFocus}
            setFullMapFocus={setFullMapFocus}
            toast={toast}
          />
        </main>
      </div>
    </div>
  );
}

function ExploreMode({ mode, properties, selectedId, onExpandMap, fullMapFocus, setFullMapFocus, toast }) {
  if (properties.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: "4rem 2rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
        <h3>No matching properties found</h3>
        <p style={{ margin: "0.5rem 0 1.5rem" }}>Try relaxing your budget, selecting &quot;All Cities&quot;, or removing specific STR tags.</p>
      </div>
    );
  }

  if (mode === "split") {
    const prop = properties.find((p) => p.id === selectedId) || properties[0];
    const lat = prop.lat || 15.5841;
    const lng = prop.lng || 73.7442;
    const mapUrl = generateGoogleMapsEmbedUrl(lat, lng, prop.title, 15);
    return (
      <div className="split-view-container">
        <div className="split-cards-column">
          {properties.map((p) => (
            <PropertyCard key={p.id} prop={p} highlighted={p.id === prop.id} />
          ))}
        </div>
        <div className="split-map-docked-pane">
          <div className="glass-panel split-map-card">
            <div className="split-map-header">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                <span className="badge badge-str">Google Maps Live Sync</span>
                <span className="text-xs text-muted">Click any property to inspect</span>
              </div>
              <h4 style={{ fontSize: "1.05rem", marginBottom: "0.2rem" }}>{prop.title}</h4>
              <div style={{ fontSize: "0.85rem", color: "var(--success-light)", fontWeight: 700 }}>
                {formatINR(prop.monthly_rent)}/mo • {prop.est_annual_roi_pct}% Est. ROI
              </div>
            </div>
            <div className="split-map-iframe-box">
              <iframe title="Google Maps Location" src={mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
            <div className="split-map-footer">
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button className="btn btn-secondary btn-sm" onClick={() => onExpandMap(prop.id)}>
                  Expand Map
                </button>
                <a href={`#detail/${prop.id}`} className="btn btn-primary btn-sm">
                  Analyze Deal →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "map") {
    const firstProp = properties[0];
    const focus = fullMapFocus || { lat: firstProp?.lat || 15.5841, lng: firstProp?.lng || 73.7442 };
    const mapUrl = `https://maps.google.com/maps?q=${focus.lat},${focus.lng}&hl=en&z=12&output=embed`;
    return (
      <div className="map-view-container" style={{ height: 640, position: "relative" }}>
        <iframe title="Google Maps Explorer" src={mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        <div className="map-floating-carousel">
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-main)", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span>Select Property to Pinpoint</span>
            <span className="badge badge-roi">{properties.length} Active STR Deals</span>
          </div>
          <div className="map-floating-scroll">
            {properties.map((p) => (
              <div
                key={p.id}
                className="map-prop-pill"
                onClick={() => {
                  setFullMapFocus({ lat: p.lat || 15.58, lng: p.lng || 73.74 });
                  toast.info(`Map centered on: ${p.title}`);
                }}
              >
                <img src={p.images?.[0]} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover" }} />
                <div>
                  <strong style={{ fontSize: "0.85rem", color: "var(--text-main)", display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 140 }}>
                    {p.title}
                  </strong>
                  <span className="text-xs" style={{ color: "var(--primary)", fontWeight: 600 }}>
                    {formatINR(p.monthly_rent)}/mo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-2 gap-6">
      {properties.map((p) => (
        <PropertyCard key={p.id} prop={p} />
      ))}
    </div>
  );
}
