/**
 * PropLease Google Maps Pop-Up & Interactive Split-View Component
 */

function generateGoogleMapsEmbedUrl(lat, lng, queryTitle, zoom = 15) {
  const query = encodeURIComponent(`${lat},${lng} (${queryTitle || 'PropLease STR Property'})`);
  return `https://maps.google.com/maps?q=${query}&hl=en&z=${zoom}&output=embed`;
}

function generateGoogleMapsDirectionsUrl(lat, lng) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/**
 * Opens a Google Maps pop-up beside / over the clicked property card
 */
function openPropertyMapPopup(propertyId, event) {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  const prop = window.store.getPropertyById(propertyId);
  if (!prop) return;

  const lat = prop.lat || 15.5841;
  const lng = prop.lng || 73.7442;
  const mapUrl = generateGoogleMapsEmbedUrl(lat, lng, prop.title);
  const directionsUrl = generateGoogleMapsDirectionsUrl(lat, lng);

  const nearbyHtml = (prop.nearby_places || [
    { name: "City Transit / Metro Hub", dist: "1.2 km" },
    { name: "Tourist District / Cafes", dist: "800 m" },
    { name: "International Airport", dist: "25 km" }
  ]).map(place => `
    <div class="map-nearby-pill">
      <span class="map-nearby-icon">📍</span>
      <span class="map-nearby-name">${place.name}</span>
      <span class="map-nearby-dist">${place.dist}</span>
    </div>
  `).join("");

  const popupHtml = `
    <div class="modal-overlay active" id="google-map-popup-modal" onclick="handleMapModalBackdropClick(event)">
      <div class="map-popup-container glass-panel-glow">
        <!-- Top Bar -->
        <div class="map-popup-header">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <div class="map-popup-brand-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 0.4rem;">
                <span class="badge badge-str">Google Maps Live</span>
                <span class="badge badge-roi">${prop.est_annual_roi_pct || 110}% Est. ROI</span>
              </div>
              <h3 class="map-popup-title">${prop.title}</h3>
            </div>
          </div>
          <button class="modal-close-btn" onclick="closePropertyMapPopup()">&times;</button>
        </div>

        <!-- Google Maps Iframe Container -->
        <div class="map-iframe-wrapper">
          <iframe
            id="google-maps-embed-iframe"
            title="Google Maps Location for ${prop.title}"
            src="${mapUrl}"
            width="100%"
            height="100%"
            style="border:0;"
            allowfullscreen=""
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade">
          </iframe>

          <!-- Floating Coordinates Badge -->
          <div class="map-coords-badge">
            <span style="color: var(--primary); font-weight: 700;">GPS:</span> ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E • ${prop.locality}, ${prop.city}
          </div>
        </div>

        <!-- Location Details & STR Neighborhood Proximity -->
        <div class="map-popup-body">
          <div class="map-specs-bar">
            <div class="map-spec-item">
              <span class="map-spec-label">Monthly Master Lease</span>
              <span class="map-spec-val">${window.formatINR(prop.monthly_rent)}/mo</span>
            </div>
            <div class="map-spec-item">
              <span class="map-spec-label">Nightly ADR Target</span>
              <span class="map-spec-val" style="color: var(--primary);">₹${prop.est_nightly_rate?.toLocaleString()}</span>
            </div>
            <div class="map-spec-item">
              <span class="map-spec-label">Society NOC Status</span>
              <span class="map-spec-val" style="color: var(--success); font-size: 0.85rem;">✓ Pre-Approved STR</span>
            </div>
          </div>

          <div style="margin-top: 1rem;">
            <div style="font-size: 0.825rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem; letter-spacing: 0.05em;">
              Strategic Proximity & Guest Transit Points
            </div>
            <div class="map-nearby-grid">
              ${nearbyHtml}
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="map-popup-footer">
          <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="gap: 0.4rem;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
            Get Driving Directions
          </a>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-ghost btn-sm" onclick="closePropertyMapPopup()">Close</button>
            <a href="#detail/${prop.id}" class="btn btn-primary btn-sm" onclick="closePropertyMapPopup()">
              Analyze Full Deal & ROI →
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  const existing = document.getElementById("google-map-popup-modal");
  if (existing) existing.remove();

  document.body.insertAdjacentHTML("beforeend", popupHtml);

  // Add subtle pulse on the clicked property card
  const card = document.querySelector(`.prop-card[data-id="${propertyId}"]`);
  if (card) {
    card.classList.add("prop-card-highlighted");
    setTimeout(() => card.classList.remove("prop-card-highlighted"), 2000);
  }
}

function closePropertyMapPopup() {
  const modal = document.getElementById("google-map-popup-modal");
  if (modal) {
    modal.classList.remove("active");
    setTimeout(() => modal.remove(), 250);
  }
}

function handleMapModalBackdropClick(event) {
  if (event.target.id === "google-map-popup-modal") {
    closePropertyMapPopup();
  }
}

/**
 * Updates the embedded Google Map in Explore Split-Screen mode
 */
function updateSplitGoogleMap(propertyId) {
  const prop = window.store.getPropertyById(propertyId);
  if (!prop) return;

  const lat = prop.lat || 15.5841;
  const lng = prop.lng || 73.7442;
  const iframe = document.getElementById("split-google-maps-iframe");
  if (iframe) {
    iframe.src = generateGoogleMapsEmbedUrl(lat, lng, prop.title, 16);
  }

  const titleEl = document.getElementById("split-map-prop-title");
  if (titleEl) titleEl.textContent = prop.title;

  const priceEl = document.getElementById("split-map-prop-price");
  if (priceEl) priceEl.textContent = `${window.formatINR(prop.monthly_rent)}/mo • ${prop.est_annual_roi_pct}% ROI`;

  const linkEl = document.getElementById("split-map-prop-link");
  if (linkEl) linkEl.setAttribute("href", `#detail/${prop.id}`);

  // Highlight card
  document.querySelectorAll(".prop-card").forEach(c => c.classList.remove("prop-card-split-active"));
  const activeCard = document.querySelector(`.prop-card[data-id="${propertyId}"]`);
  if (activeCard) activeCard.classList.add("prop-card-split-active");
}

window.openPropertyMapPopup = openPropertyMapPopup;
window.closePropertyMapPopup = closePropertyMapPopup;
window.handleMapModalBackdropClick = handleMapModalBackdropClick;
window.updateSplitGoogleMap = updateSplitGoogleMap;
window.generateGoogleMapsEmbedUrl = generateGoogleMapsEmbedUrl;
window.generateGoogleMapsDirectionsUrl = generateGoogleMapsDirectionsUrl;
