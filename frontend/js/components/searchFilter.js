/**
 * PropLease Explore, Search & Google Maps Split-View Component
 */

function renderExploreView() {
  const store = window.store;
  const filtered = store.getFilteredProperties();
  const filters = store.filters;

  const cityOptionsHtml = window.CITIES_LIST.map(city => 
    `<option value="${city}" ${filters.city === city ? 'selected' : ''}>${city}</option>`
  ).join("");

  const typeOptionsHtml = window.PROPERTY_TYPES.map(type => 
    `<option value="${type}" ${filters.propertyType === type ? 'selected' : ''}>${type}</option>`
  ).join("");

  const tagsCheckboxesHtml = window.STR_FILTER_OPTIONS.map(tag => {
    const checked = filters.selectedTags.includes(tag);
    return `
      <label class="tag-checkbox-label ${checked ? 'checked' : ''}">
        <input type="checkbox" value="${tag}" ${checked ? 'checked' : ''} onchange="handleTagToggle('${tag}')" />
        ${tag}
      </label>
    `;
  }).join("");

  const selectedFirstProp = filtered.length > 0 ? filtered[0] : null;

  return `
    <div class="container" style="padding-top: 2rem; padding-bottom: 5rem;">
      <!-- Page Header -->
      <div style="margin-bottom: 2rem; display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
        <div>
          <span class="badge badge-str" style="margin-bottom: 0.5rem;">Marketplace</span>
          <h1 style="font-size: clamp(1.8rem, 3.5vw, 2.5rem);">Explore STR-Friendly Properties</h1>
          <p>Browse verified residential units and villas with pre-approved short-term rental / Airbnb subleasing rights.</p>
        </div>

        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <a href="#roi-calculator" class="btn btn-outline btn-sm">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="16" y1="14" x2="16" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M12 18h.01"/><path d="M8 18h.01"/></svg>
            Deal Simulator
          </a>
          <button class="btn btn-secondary btn-sm" onclick="window.store.resetFilters();">
            Reset Filters
          </button>
        </div>
      </div>

      <!-- Main Explore Layout -->
      <div class="explore-layout ${filters.viewMode === 'split' ? 'explore-split-mode' : ''}">
        <!-- Filter Sidebar -->
        <aside class="filter-sidebar">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
            <h3 style="font-size: 1.15rem;">Filter Deals</h3>
            <span style="font-size: 0.8rem; color: var(--primary-light); cursor: pointer;" onclick="window.store.resetFilters();">Clear All</span>
          </div>

          <!-- Search Query Input -->
          <div class="form-group">
            <label class="form-label">Keyword Search</label>
            <div class="input-with-icon">
              <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" class="form-control" placeholder="Search Goa, Indiranagar, Pool..." value="${filters.searchQuery}" oninput="window.store.setFilter('searchQuery', this.value)" />
            </div>
          </div>

          <!-- City Selector -->
          <div class="form-group">
            <label class="form-label">Destination / City</label>
            <select class="form-select" onchange="window.store.setFilter('city', this.value)">
              ${cityOptionsHtml}
            </select>
          </div>

          <!-- Property Type -->
          <div class="form-group">
            <label class="form-label">Property Type</label>
            <select class="form-select" onchange="window.store.setFilter('propertyType', this.value)">
              ${typeOptionsHtml}
            </select>
          </div>

          <!-- Price Slider -->
          <div class="form-group">
            <div class="range-header">
              <span class="form-label" style="margin: 0;">Max Monthly Lease</span>
              <span class="range-val" id="filter-price-val">${window.formatINR(filters.maxPrice)}</span>
            </div>
            <input type="range" min="40000" max="250000" step="5000" value="${filters.maxPrice}" oninput="document.getElementById('filter-price-val').textContent = window.formatINR(this.value); window.store.setFilter('maxPrice', parseInt(this.value, 10))" />
          </div>

          <!-- Minimum BHK -->
          <div class="form-group">
            <label class="form-label">Minimum Bedrooms (BHK)</label>
            <div style="display: flex; gap: 0.4rem;">
              ${[0, 1, 2, 3, 4].map(bhk => `
                <button class="btn btn-sm ${filters.minBedrooms === bhk ? 'btn-primary' : 'btn-secondary'}" style="flex: 1; padding: 0.4rem 0;" onclick="window.store.setFilter('minBedrooms', ${bhk})">
                  ${bhk === 0 ? 'Any' : bhk + '+'}
                </button>
              `).join("")}
            </div>
          </div>

          <!-- STR & Subletting Amenities -->
          <div class="form-group" style="margin-top: 1.25rem;">
            <label class="form-label" style="margin-bottom: 0.6rem;">STR Tags & Amenities</label>
            <div class="tag-checkbox-grid">
              ${tagsCheckboxesHtml}
            </div>
          </div>
        </aside>

        <!-- Main Content Area -->
        <main class="explore-main">
          <!-- Toolbar -->
          <div class="explore-toolbar">
            <div class="results-count-title">
              Showing <span class="text-primary">${filtered.length}</span> STR-friendly properties
            </div>

            <div class="toolbar-controls">
              <!-- Sort Dropdown -->
              <select class="form-select" style="width: auto; padding: 0.45rem 0.9rem; font-size: 0.85rem;" onchange="window.store.setFilter('sortBy', this.value)">
                <option value="roi-desc" ${filters.sortBy === 'roi-desc' ? 'selected' : ''}>Sort by: Highest ROI %</option>
                <option value="price-asc" ${filters.sortBy === 'price-asc' ? 'selected' : ''}>Price: Low to High</option>
                <option value="price-desc" ${filters.sortBy === 'price-desc' ? 'selected' : ''}>Price: High to Low</option>
                <option value="newest" ${filters.sortBy === 'newest' ? 'selected' : ''}>Newest First</option>
              </select>

              <!-- View Switcher (Grid vs Split Map vs Full Map) -->
              <div class="view-mode-toggle">
                <button class="view-mode-btn ${filters.viewMode === 'grid' ? 'active' : ''}" onclick="window.store.setFilter('viewMode', 'grid')" title="Grid of Property Cards">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                  Grid
                </button>
                <button class="view-mode-btn ${filters.viewMode === 'split' ? 'active' : ''}" onclick="window.store.setFilter('viewMode', 'split')" title="Split Screen: List + Live Google Map">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/></svg>
                  Split Map
                </button>
                <button class="view-mode-btn ${filters.viewMode === 'map' ? 'active' : ''}" onclick="window.store.setFilter('viewMode', 'map')" title="Interactive Full Map">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
                  Map
                </button>
              </div>
            </div>
          </div>

          <!-- View Router: Grid, Split Map, or Full Map -->
          ${renderExploreActiveMode(filters.viewMode, filtered, selectedFirstProp)}
        </main>
      </div>
    </div>
  `;
}

function renderExploreActiveMode(mode, properties, selectedFirstProp) {
  if (properties.length === 0) {
    return `
      <div class="glass-panel" style="padding: 4rem 2rem; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
        <h3>No matching properties found</h3>
        <p style="margin: 0.5rem 0 1.5rem;">Try relaxing your budget, selecting "All Cities", or removing specific STR tags.</p>
        <button class="btn btn-primary" onclick="window.store.resetFilters()">Reset All Filters</button>
      </div>
    `;
  }

  if (mode === "split") {
    const prop = selectedFirstProp || properties[0];
    const lat = prop.lat || 15.5841;
    const lng = prop.lng || 73.7442;
    const mapUrl = window.generateGoogleMapsEmbedUrl ? window.generateGoogleMapsEmbedUrl(lat, lng, prop.title, 15) : `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=15&output=embed`;

    return `
      <div class="split-view-container">
        <!-- Left Side: Property Cards List -->
        <div class="split-cards-column">
          ${properties.map(p => window.renderPropertyCard(p)).join("")}
        </div>

        <!-- Right Side: Sticky Google Maps Pane Docked Beside Properties -->
        <div class="split-map-docked-pane">
          <div class="glass-panel split-map-card">
            <!-- Map Top Info Header -->
            <div class="split-map-header">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
                <span class="badge badge-str">Google Maps Live Sync</span>
                <span class="text-xs text-muted">Click any property to inspect</span>
              </div>
              <h4 id="split-map-prop-title" style="font-size: 1.05rem; margin-bottom: 0.2rem;">${prop.title}</h4>
              <div id="split-map-prop-price" style="font-size: 0.85rem; color: var(--success-light); font-weight: 700;">
                ${window.formatINR(prop.monthly_rent)}/mo • ${prop.est_annual_roi_pct}% Est. ROI
              </div>
            </div>

            <!-- Embedded Google Map -->
            <div class="split-map-iframe-box">
              <iframe
                id="split-google-maps-iframe"
                title="Google Maps Location"
                src="${mapUrl}"
                width="100%"
                height="100%"
                style="border:0;"
                allowfullscreen=""
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade">
              </iframe>
            </div>

            <!-- Map Bottom Controls -->
            <div class="split-map-footer">
              <div style="display: flex; gap: 0.5rem;">
                <button class="btn btn-secondary btn-sm" onclick="openPropertyMapPopup('${prop.id}', event)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                  Expand Map
                </button>
                <a id="split-map-prop-link" href="#detail/${prop.id}" class="btn btn-primary btn-sm">
                  Analyze Deal →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (mode === "map") {
    return renderInteractiveMap(properties);
  }

  // Default: Grid View
  return renderCardsGrid(properties);
}

function renderCardsGrid(properties) {
  return `
    <div class="grid grid-2 gap-6">
      ${properties.map(p => window.renderPropertyCard(p)).join("")}
    </div>
  `;
}

function renderInteractiveMap(properties) {
  const firstProp = properties[0];
  const lat = firstProp ? (firstProp.lat || 15.5841) : 15.5841;
  const lng = firstProp ? (firstProp.lng || 73.7442) : 73.7442;
  const mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=12&output=embed`;

  return `
    <div class="map-view-container" style="height: 640px; position: relative;">
      <!-- Google Map as Main Canvas -->
      <iframe
        id="full-google-maps-iframe"
        title="Google Maps Explorer"
        src="${mapUrl}"
        width="100%"
        height="100%"
        style="border:0;"
        allowfullscreen=""
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade">
      </iframe>

      <!-- Floating Property Selector Carousel on Map -->
      <div class="map-floating-carousel">
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-main); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; justify-content: space-between;">
          <span>Select Property to Pinpoint</span>
          <span class="badge badge-roi">${properties.length} Active STR Deals</span>
        </div>
        <div class="map-floating-scroll">
          ${properties.map(p => `
            <div class="map-prop-pill" onclick="switchFullMapLocation(${p.lat || 15.58}, ${p.lng || 73.74}, '${p.id}')">
              <img src="${p.images[0]}" style="width: 36px; height: 36px; border-radius: 6px; object-fit: cover;" />
              <div>
                <strong style="font-size: 0.85rem; color: var(--text-main); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;">${p.title}</strong>
                <span class="text-xs" style="color: var(--primary); font-weight: 600;">${window.formatINR(p.monthly_rent)}/mo</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function switchFullMapLocation(lat, lng, propId) {
  const iframe = document.getElementById("full-google-maps-iframe");
  const prop = window.store.getPropertyById(propId);
  if (iframe && prop) {
    iframe.src = `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=15&output=embed`;
    window.Toast.info(`Map centered on: ${prop.title}`);
  }
}

function handleTagToggle(tag) {
  const currentTags = [...window.store.filters.selectedTags];
  const index = currentTags.indexOf(tag);
  if (index > -1) {
    currentTags.splice(index, 1);
  } else {
    currentTags.push(tag);
  }
  window.store.setFilter("selectedTags", currentTags);
}

window.renderExploreView = renderExploreView;
window.renderExploreActiveMode = renderExploreActiveMode;
window.renderCardsGrid = renderCardsGrid;
window.renderInteractiveMap = renderInteractiveMap;
window.switchFullMapLocation = switchFullMapLocation;
window.handleTagToggle = handleTagToggle;
