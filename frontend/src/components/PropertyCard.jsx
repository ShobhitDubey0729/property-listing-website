import { formatINR } from "../utils/format.js";
import { useStore } from "../context/StoreContext.jsx";
import { useUi } from "../context/UiContext.jsx";

export function PropertyCard({ prop, highlighted }) {
  const { store } = useStore();
  const { toast, openMap, setSplitSelectedId } = useUi();
  const isFav = store.isFavorite(prop.id);
  const isCompared = store.compareList.includes(prop.id);
  const mainImage =
    prop.images && prop.images.length > 0
      ? prop.images[0]
      : "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80";

  function handleCardClick(event) {
    if (event.target.closest("button") || event.target.closest("a")) return;
    if (store.filters.viewMode === "split") setSplitSelectedId(prop.id);
  }

  function onCompare(e) {
    e.preventDefault();
    e.stopPropagation();
    const res = store.toggleCompare(prop.id);
    if (!res.success && res.reason) toast.warning(res.reason);
    else if (res.added) toast.info(`Added to comparison (${res.count}/3)`);
  }

  async function onFav(e) {
    e.preventDefault();
    e.stopPropagation();
    const added = await store.toggleFavorite(prop.id, toast);
    if (store.currentUser) {
      toast.success(added ? "Property added to Shortlist" : "Removed from Shortlist");
    }
  }

  function onMap(e) {
    e.preventDefault();
    e.stopPropagation();
    openMap(prop.id);
  }

  return (
    <article
      className={`prop-card${highlighted ? " prop-card-split-active" : ""}`}
      data-id={prop.id}
      onClick={handleCardClick}
    >
      <div className="prop-card-media">
        <img src={mainImage} alt={prop.title} className="prop-card-img" loading="lazy" />
        <div className="prop-card-badges">
          {prop.featured ? <span className="badge badge-featured">★ Featured</span> : null}
          {prop.str_friendly ? <span className="badge badge-str">STR Friendly</span> : null}
          {prop.verified ? <span className="badge badge-verified">✓ Verified Landlord</span> : null}
        </div>
        <div className="prop-card-actions">
          <button className="map-quick-btn" title="View Google Maps Location & Proximity" onClick={onMap}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
              <line x1="8" y1="2" x2="8" y2="18" />
              <line x1="16" y1="6" x2="16" y2="22" />
            </svg>
          </button>
          <button className={`compare-btn${isCompared ? " active" : ""}`} title="Compare property" onClick={onCompare}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
            </svg>
          </button>
          <button className={`fav-btn${isFav ? " active" : ""}`} title="Save to shortlist" onClick={onFav}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
        <div className="prop-card-roi-pill">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
          {prop.est_annual_roi_pct || 95}% Est. ROI
        </div>
      </div>
      <div className="prop-card-body">
        <div className="prop-card-location" onClick={onMap} title="Click to view Google Maps location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span>
            {prop.locality}, {prop.city}
          </span>
          <span className="location-map-tag">Google Map ↗</span>
        </div>
        <h3 className="prop-card-title" title={prop.title}>
          {prop.title}
        </h3>
        <div className="prop-card-specs">
          <span className="spec-item">{prop.bedrooms} BHK</span>
          <span className="spec-item">{prop.bathrooms} Bath</span>
          <span className="spec-item">{prop.area_sqft} sq.ft</span>
        </div>
        <div className="prop-card-tags">
          {(prop.str_tags || []).slice(0, 3).map((tag) => (
            <span key={tag} className="prop-tag-mini">
              {tag}
            </span>
          ))}
        </div>
        <div className="prop-card-footer">
          <div className="prop-price-block">
            <span className="prop-price-val">{formatINR(prop.monthly_rent)}</span>
            <span className="prop-price-period">Lease / month</span>
          </div>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <button className="btn btn-secondary btn-sm" onClick={onMap} title="Open Google Maps location">
              Map
            </button>
            <a href={`#detail/${prop.id}`} className="btn btn-primary btn-sm">
              Analyze Deal
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
