/**
 * PropLease Property Card Component with Google Maps Pop-Up Triggers
 */

function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

function renderPropertyCard(prop) {
  const isFav = window.store.isFavorite(prop.id);
  const isCompared = window.store.compareList.includes(prop.id);

  const mainImage = prop.images && prop.images.length > 0
    ? prop.images[0]
    : "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80";

  const tagsHtml = (prop.str_tags || []).slice(0, 3).map(tag => 
    `<span class="prop-tag-mini">${tag}</span>`
  ).join("");

  return `
    <article class="prop-card" data-id="${prop.id}" onclick="handleCardClick('${prop.id}', event)">
      <div class="prop-card-media">
        <img src="${mainImage}" alt="${prop.title}" class="prop-card-img" loading="lazy" />
        
        <div class="prop-card-badges">
          ${prop.featured ? `<span class="badge badge-featured">★ Featured</span>` : ''}
          ${prop.str_friendly ? `<span class="badge badge-str">STR Friendly</span>` : ''}
          ${prop.verified ? `<span class="badge badge-verified">✓ Verified Landlord</span>` : ''}
        </div>

        <div class="prop-card-actions">
          <button class="map-quick-btn" data-action="view-map" data-id="${prop.id}" title="View Google Maps Location & Proximity" onclick="openPropertyMapPopup('${prop.id}', event)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
          </button>
          <button class="compare-btn ${isCompared ? 'active' : ''}" data-action="toggle-compare" data-id="${prop.id}" title="Compare property">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>
          </button>
          <button class="fav-btn ${isFav ? 'active' : ''}" data-action="toggle-favorite" data-id="${prop.id}" title="Save to shortlist">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
        </div>

        <div class="prop-card-roi-pill">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          ${prop.est_annual_roi_pct || 95}% Est. ROI
        </div>
      </div>

      <div class="prop-card-body">
        <div class="prop-card-location" onclick="openPropertyMapPopup('${prop.id}', event)" title="Click to view Google Maps location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>${prop.locality}, ${prop.city}</span>
          <span class="location-map-tag">Google Map ↗</span>
        </div>

        <h3 class="prop-card-title" title="${prop.title}">${prop.title}</h3>

        <div class="prop-card-specs">
          <span class="spec-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/></svg>
            ${prop.bedrooms} BHK
          </span>
          <span class="spec-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-2.12 0l-.88.88a1.5 1.5 0 0 0 0 2.12L6 9M4 21h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2Z"/></svg>
            ${prop.bathrooms} Bath
          </span>
          <span class="spec-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
            ${prop.area_sqft} sq.ft
          </span>
        </div>

        <div class="prop-card-tags">
          ${tagsHtml}
        </div>

        <div class="prop-card-footer">
          <div class="prop-price-block">
            <span class="prop-price-val">${formatINR(prop.monthly_rent)}</span>
            <span class="prop-price-period">Lease / month</span>
          </div>

          <div style="display: flex; gap: 0.4rem;">
            <button class="btn btn-secondary btn-sm" onclick="openPropertyMapPopup('${prop.id}', event)" title="Open Google Maps location">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Map
            </button>
            <a href="#detail/${prop.id}" class="btn btn-primary btn-sm">
              Analyze Deal
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </div>
    </article>
  `;
}

function handleCardClick(propertyId, event) {
  // If user clicked a button or link inside the card, ignore
  if (event.target.closest('button') || event.target.closest('a')) {
    return;
  }

  // If in explore split mode, update the side map
  if (window.store && window.store.filters && window.store.filters.viewMode === "split") {
    window.updateSplitGoogleMap(propertyId);
  }
}

window.renderPropertyCard = renderPropertyCard;
window.formatINR = formatINR;
window.handleCardClick = handleCardClick;
