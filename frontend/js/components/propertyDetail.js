/**
 * PropLease Property Detail View & Deal Analyzer Component
 */

function renderPropertyDetailView(propertyId) {
  const prop = window.store.getPropertyById(propertyId);

  if (!prop) {
    return `
      <div class="container" style="padding: 5rem 0; text-align: center;">
        <h2>Property Not Found</h2>
        <p style="margin: 1rem 0 2rem;">The property you are looking for does not exist or has been unlisted.</p>
        <a href="#explore" class="btn btn-primary">Browse Available Properties</a>
      </div>
    `;
  }

  const isFav = window.store.isFavorite(prop.id);
  const images = prop.images && prop.images.length > 0 ? prop.images : [
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80"
  ];

  // Default values for deal calculator
  const defaultAdr = prop.est_nightly_rate || 10000;
  const defaultOcc = prop.est_occupancy_pct || 70;
  const monthlyLease = prop.monthly_rent || 100000;

  const lat = prop.lat || 15.5841;
  const lng = prop.lng || 73.7442;
  const googleMapEmbedUrl = window.generateGoogleMapsEmbedUrl ? window.generateGoogleMapsEmbedUrl(lat, lng, prop.title, 15) : `https://maps.google.com/maps?q=${lat},${lng}&hl=en&z=15&output=embed`;
  const directionsUrl = window.generateGoogleMapsDirectionsUrl ? window.generateGoogleMapsDirectionsUrl(lat, lng) : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  const nearbyList = prop.nearby_places || [
    { name: "Transit / Metro Station", dist: "800 m" },
    { name: "Tourist Attraction Hub", dist: "1.2 km" },
    { name: "Supermarket & Cafes", dist: "300 m" },
    { name: "Nearest Airport", dist: "25 km" }
  ];

  return `
    <div class="container" style="padding-top: 2rem; padding-bottom: 4rem;">
      <!-- Breadcrumb & Back -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
        <a href="#explore" class="btn btn-secondary btn-sm" style="gap: 0.4rem;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to Explore
        </a>

        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-secondary btn-sm" onclick="openPropertyMapPopup('${prop.id}', event)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
            Google Map
          </button>
          <button class="btn btn-secondary btn-sm fav-btn ${isFav ? 'active' : ''}" data-action="toggle-favorite" data-id="${prop.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            ${isFav ? 'Shortlisted' : 'Save to Shortlist'}
          </button>
          <button class="btn btn-secondary btn-sm" data-action="toggle-compare" data-id="${prop.id}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>
            Compare
          </button>
        </div>
      </div>

      <!-- Header Titles & Badges -->
      <div style="margin-bottom: 1.5rem;">
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.75rem;">
          ${prop.str_friendly ? '<span class="badge badge-str">STR / Airbnb Friendly</span>' : ''}
          ${prop.verified ? '<span class="badge badge-verified">✓ Verified Master Landlord</span>' : ''}
          <span class="badge badge-neutral">${prop.property_type}</span>
        </div>
        <h1 style="font-size: clamp(1.8rem, 3.5vw, 2.6rem); margin-bottom: 0.5rem;">${prop.title}</h1>
        <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--text-muted); font-size: 0.95rem;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${prop.address || `${prop.locality}, ${prop.city}`}
          <button class="location-map-tag" style="margin-left: 0.5rem;" onclick="openPropertyMapPopup('${prop.id}', event)">
            Open Google Map ↗
          </button>
        </div>
      </div>

      <!-- Gallery Grid -->
      <div class="detail-gallery-grid">
        <img src="${images[0]}" alt="${prop.title}" class="detail-gallery-item detail-gallery-main" />
        <img src="${images[1] || images[0]}" alt="Interior view" class="detail-gallery-item" />
        <img src="${images[2] || images[0]}" alt="Bedroom view" class="detail-gallery-item" />
        <img src="${images[3] || images[0]}" alt="Amenities view" class="detail-gallery-item" />
        <img src="${images[0]}" alt="Compound view" class="detail-gallery-item" />
      </div>

      <!-- Main Two-Column Layout -->
      <div class="detail-content-layout">
        <!-- Left Column: Specs, Rules, Overview, Location Map -->
        <div class="detail-main-info">
          <!-- Property Specs Row -->
          <div class="glass-panel" style="padding: 1.25rem 1.75rem; margin-bottom: 2rem; display: flex; justify-content: space-around; flex-wrap: wrap; gap: 1rem;">
            <div style="text-align: center;">
              <span style="font-size: 0.75rem; color: var(--text-subtle); text-transform: uppercase; font-weight: 700;">Bedrooms</span>
              <p style="font-size: 1.25rem; font-weight: 700; color: var(--text-main);">${prop.bedrooms} BHK</p>
            </div>
            <div style="text-align: center;">
              <span style="font-size: 0.75rem; color: var(--text-subtle); text-transform: uppercase; font-weight: 700;">Bathrooms</span>
              <p style="font-size: 1.25rem; font-weight: 700; color: var(--text-main);">${prop.bathrooms} Bath</p>
            </div>
            <div style="text-align: center;">
              <span style="font-size: 0.75rem; color: var(--text-subtle); text-transform: uppercase; font-weight: 700;">Carpet Area</span>
              <p style="font-size: 1.25rem; font-weight: 700; color: var(--text-main);">${prop.area_sqft} sq.ft</p>
            </div>
            <div style="text-align: center;">
              <span style="font-size: 0.75rem; color: var(--text-subtle); text-transform: uppercase; font-weight: 700;">Furnishing</span>
              <p style="font-size: 1.25rem; font-weight: 700; color: var(--text-main);">${prop.furnishing_status}</p>
            </div>
            <div style="text-align: center;">
              <span style="font-size: 0.75rem; color: var(--text-subtle); text-transform: uppercase; font-weight: 700;">Min Lease</span>
              <p style="font-size: 1.25rem; font-weight: 700; color: var(--text-main);">${prop.min_lease_months} Months</p>
            </div>
          </div>

          <!-- Description -->
          <div class="detail-section">
            <h3 style="margin-bottom: 0.75rem;">Property Description</h3>
            <p style="font-size: 1rem; line-height: 1.7; color: var(--text-muted);">${prop.description}</p>
          </div>

          <!-- STR & Society Permissions Breakdown -->
          <div class="detail-section">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <h3>STR / Rental Arbitrage Permissions & Rules</h3>
              <span class="badge badge-verified">Verified by PropLease</span>
            </div>
            <p style="font-size: 0.88rem; margin-top: 0.25rem; margin-bottom: 1rem;">
              These specific clauses are approved by the landlord for short-term rental operation:
            </p>

            <div class="str-checklist">
              <div class="str-check-item">
                <div class="str-check-icon">✓</div>
                <div>
                  <h5 style="margin-bottom: 0.2rem;">Society NOC / Sublet Permission</h5>
                  <p class="text-sm">Landlord has confirmed short-term guests are 100% permitted by building management/RWA.</p>
                </div>
              </div>

              <div class="str-check-item">
                <div class="str-check-icon">✓</div>
                <div>
                  <h5 style="margin-bottom: 0.2rem;">Frequent Guest Turnover Allowed</h5>
                  <p class="text-sm">Daily and weekly tourist check-ins allowed without additional gate fees or NOC delays.</p>
                </div>
              </div>

              <div class="str-check-item">
                <div class="str-check-icon">✓</div>
                <div>
                  <h5 style="margin-bottom: 0.2rem;">Smart Lock & Self Check-in</h5>
                  <p class="text-sm">Operator is authorized to install keypad/smart locks on the front door.</p>
                </div>
              </div>

              <div class="str-check-item">
                <div class="str-check-icon">✓</div>
                <div>
                  <h5 style="margin-bottom: 0.2rem;">Housekeeping & Linen Access</h5>
                  <p class="text-sm">Turnover cleaning staff and linen deliveries are granted regular building entry passes.</p>
                </div>
              </div>

              <div class="str-check-item">
                <div class="str-check-icon">✓</div>
                <div>
                  <h5 style="margin-bottom: 0.2rem;">Commercial Arbitrage Lease Clause</h5>
                  <p class="text-sm">Formal sublease agreement provided on platform with explicit indemnity protection.</p>
                </div>
              </div>

              <div class="str-check-item">
                <div class="str-check-icon">✓</div>
                <div>
                  <h5 style="margin-bottom: 0.2rem;">Noise & Party Rules</h5>
                  <p class="text-sm">${prop.society_rules ? prop.society_rules.noise_curfew : 'Strict quiet hours after 10:30 PM'}.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Interactive Google Maps Location & Neighborhood Section -->
          <div class="detail-section">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
              <div>
                <h3>Location & Strategic Transit Hubs</h3>
                <p class="text-sm" style="margin-top: 0.2rem;">Real-time Google Maps pinpoint with tourist & transit access metrics.</p>
              </div>
              <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="gap: 0.4rem;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                Get Directions
              </a>
            </div>

            <!-- Embedded Map -->
            <div style="height: 320px; border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border-medium); margin-bottom: 1.25rem;">
              <iframe
                title="Google Maps Location for ${prop.title}"
                src="${googleMapEmbedUrl}"
                width="100%"
                height="100%"
                style="border:0;"
                allowfullscreen=""
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade">
              </iframe>
            </div>

            <!-- Proximity Pills -->
            <div class="map-nearby-grid">
              ${nearbyList.map(place => `
                <div class="map-nearby-pill">
                  <span class="map-nearby-icon">📍</span>
                  <span class="map-nearby-name">${place.name}</span>
                  <span class="map-nearby-dist">${place.dist}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Amenities & Tags -->
          <div class="detail-section">
            <h3 style="margin-bottom: 1rem;">Amenities & Features</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 0.6rem;">
              ${(prop.str_tags || []).map(tag => `
                <div style="display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 0.9rem; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); font-size: 0.88rem;">
                  <span style="color: var(--primary-light);">✦</span> ${tag}
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Landlord Profile Card -->
          <div class="detail-section">
            <h3 style="margin-bottom: 1rem;">Landlord Information</h3>
            <div class="glass-panel" style="padding: 1.5rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem;">
              <div style="display: flex; align-items: center; gap: 1.25rem;">
                <div style="width: 54px; height: 54px; border-radius: 50%; background: linear-gradient(135deg, var(--primary) 0%, #06b6d4 100%); display: flex; align-items: center; justify-content: center; font-size: 1.35rem; font-weight: 800; color: #fff;">
                  ${prop.owner ? prop.owner.name.charAt(0) : 'L'}
                </div>
                <div>
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <h4 style="margin: 0;">${prop.owner ? prop.owner.name : 'Property Landlord'}</h4>
                    <span class="badge badge-verified">Verified</span>
                  </div>
                  <p class="text-sm" style="margin-top: 0.2rem;">
                    Member since ${prop.owner ? prop.owner.member_since : '2023'} • Response time: ${prop.owner ? prop.owner.response_time : '< 1 hr'}
                  </p>
                </div>
              </div>

              <button class="btn btn-secondary" onclick="openUnlockContactModal('${prop.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Unlock Direct Contact
              </button>
            </div>
          </div>
        </div>

        <!-- Right Column: Interactive Arbitrage ROI Simulator Widget -->
        <div class="detail-sidebar">
          <div class="roi-widget-card">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
              <span class="badge badge-roi">Arbitrage Deal Analyzer</span>
              <span style="font-size: 0.8rem; color: var(--text-subtle);">Live Model</span>
            </div>

            <div class="roi-metric-highlight">
              <span style="font-size: 0.8rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); letter-spacing: 0.05em;">Estimated Monthly Net Profit</span>
              <div class="roi-metric-value" id="detail-net-profit">₹0</div>
              <span id="detail-annual-roi" style="font-size: 0.85rem; font-weight: 700; color: var(--success); display: block; margin-top: 0.2rem;">0% Cash-on-Cash Return</span>
            </div>

            <!-- Lease Rent Fixed -->
            <div style="margin-bottom: 1.25rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.25rem;">
                <span style="color: var(--text-muted);">Fixed Monthly Lease:</span>
                <span style="font-weight: 700; color: var(--text-main);">${formatINR(monthlyLease)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-subtle);">
                <span>Security Deposit:</span>
                <span>${formatINR(prop.security_deposit || monthlyLease * 2)}</span>
              </div>
            </div>

            <hr style="border: 0; border-top: 1px solid var(--border-subtle); margin: 1.25rem 0;" />

            <!-- Slider 1: Nightly Rate -->
            <div class="form-group">
              <div class="range-header">
                <span class="form-label" style="margin: 0;">Expected Nightly ADR</span>
                <span class="range-val" id="val-adr">₹${defaultAdr.toLocaleString()}</span>
              </div>
              <input type="range" id="slider-adr" min="${Math.round(defaultAdr * 0.4)}" max="${Math.round(defaultAdr * 2)}" step="250" value="${defaultAdr}" oninput="updateDetailRoi('${prop.id}')" />
            </div>

            <!-- Slider 2: Occupancy Rate -->
            <div class="form-group">
              <div class="range-header">
                <span class="form-label" style="margin: 0;">Expected Occupancy %</span>
                <span class="range-val" id="val-occ">${defaultOcc}% (${Math.round(defaultOcc * 0.3)} nights/mo)</span>
              </div>
              <input type="range" id="slider-occ" min="30" max="95" step="1" value="${defaultOcc}" oninput="updateDetailRoi('${prop.id}')" />
            </div>

            <!-- Financial Breakdown Table -->
            <div style="background: var(--bg-tertiary); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1.5rem;">
              <div class="roi-calc-row">
                <span style="color: var(--text-muted);">Gross Monthly Revenue:</span>
                <span style="font-weight: 700; color: var(--text-main);" id="detail-gross-rev">₹0</span>
              </div>
              <div class="roi-calc-row">
                <span style="color: var(--text-muted);">- Lease Cost:</span>
                <span style="color: var(--danger);">${formatINR(monthlyLease)}</span>
              </div>
              <div class="roi-calc-row">
                <span style="color: var(--text-muted);">- Operating & OTA Fees (18%):</span>
                <span style="color: var(--danger);" id="detail-opex">₹0</span>
              </div>
            </div>

            <!-- Main CTA Buttons -->
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <button class="btn btn-primary btn-lg" onclick="openProposalModal('${prop.id}')">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                Apply as Operator (Submit Proposal)
              </button>
              
              <a href="#roi-calculator" class="btn btn-outline btn-sm" style="text-align: center;">
                Open Full 10-Year Arbitrage Simulator →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function updateDetailRoi(propertyId) {
  const prop = window.store.getPropertyById(propertyId);
  if (!prop) return;

  const adrInput = document.getElementById("slider-adr");
  const occInput = document.getElementById("slider-occ");
  if (!adrInput || !occInput) return;

  const adr = parseInt(adrInput.value, 10);
  const occ = parseInt(occInput.value, 10);

  // Update label indicators
  document.getElementById("val-adr").textContent = "₹" + adr.toLocaleString();
  document.getElementById("val-occ").textContent = `${occ}% (${Math.round(occ * 0.3)} nights/mo)`;

  const nights = (30 * occ) / 100;
  const grossRev = Math.round(adr * nights);
  const lease = prop.monthly_rent;
  const opex = Math.round(grossRev * 0.18); // 18% OTA, cleaning, utilities
  const netProfit = grossRev - lease - opex;

  // Annual ROI calculation based on 2 months deposit + 2 months buffer working capital
  const upfrontCapital = lease * 3;
  const annualRoi = Math.round(((netProfit * 12) / upfrontCapital) * 100);

  document.getElementById("detail-gross-rev").textContent = window.formatINR(grossRev);
  document.getElementById("detail-opex").textContent = window.formatINR(opex);

  const netElem = document.getElementById("detail-net-profit");
  if (netElem) {
    netElem.textContent = window.formatINR(netProfit);
    netElem.style.color = netProfit >= 0 ? "var(--success-light)" : "var(--danger)";
  }

  const roiElem = document.getElementById("detail-annual-roi");
  if (roiElem) {
    roiElem.textContent = `${annualRoi}% Cash-on-Cash Return`;
    roiElem.style.color = annualRoi >= 0 ? "var(--success)" : "var(--danger)";
  }
}

// Modal Handlers
function openProposalModal(propertyId) {
  const prop = window.store.getPropertyById(propertyId);
  if (!prop) return;

  const modalHtml = `
    <div class="modal-overlay active" id="proposal-modal">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">Submit Operator Master Lease Proposal</h3>
          <button class="modal-close-btn" onclick="closeModal('proposal-modal')">&times;</button>
        </div>
        <form id="operator-proposal-form" onsubmit="handleProposalSubmit(event, '${propertyId}')">
          <div class="modal-body">
            <div style="background: var(--bg-tertiary); padding: 0.9rem; border-radius: var(--radius-md); margin-bottom: 1.25rem; font-size: 0.88rem;">
              <strong>Property:</strong> ${prop.title} (${prop.locality}, ${prop.city})<br/>
              <strong>Asking Rent:</strong> ${window.formatINR(prop.monthly_rent)}/mo
            </div>

            <div class="form-group">
              <label class="form-label">Operator / Co-Host Full Name *</label>
              <input type="text" class="form-control" name="name" required placeholder="e.g. Rahul Mehta (LuxeStay Ventures)" value="Kavita Sharma" />
            </div>

            <div class="grid grid-2 gap-4">
              <div class="form-group">
                <label class="form-label">Email Address *</label>
                <input type="email" class="form-control" name="email" required placeholder="kavita@luxestay.com" value="kavita@luxestay.in" />
              </div>
              <div class="form-group">
                <label class="form-label">Phone / WhatsApp *</label>
                <input type="tel" class="form-control" name="phone" required placeholder="+91 98XXX XXXXX" value="+91 98112 34567" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Existing Portfolio & Experience</label>
              <select class="form-select" name="experience">
                <option value="1-3 properties (1-2 years experience)">1–3 Active Airbnb Units (Superhost)</option>
                <option value="4-10 properties (Experienced Operator)" selected>4–10 Active Units (Professional STR Operator)</option>
                <option value="10+ properties (Property Management Co)">10+ Units (Enterprise Hospitality Firm)</option>
                <option value="First-time STR investor">First-time STR Arbitrage Operator</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Proposed Lease Term</label>
              <select class="form-select" name="tenure">
                <option value="12 Months" selected>12 Months (Standard Master Lease)</option>
                <option value="24 Months">24 Months (2-Year Lock-in)</option>
                <option value="36 Months">36 Months (Long-Term with 5% Escalation)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Business Pitch & Maintenance Commitments</label>
              <textarea class="form-control" name="message" placeholder="Describe your guest screening process, smart noise-monitoring sensors (e.g. Minut), and cleaning standards..." rows="3">We manage 6 Superhost properties in the area. We install smart door locks, Minut decibel sensors to eliminate any noise disturbance, provide weekly deep-cleaning, and cover minor maintenance up to ₹5,000 ourselves.</textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-ghost" onclick="closeModal('proposal-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary">Submit Formal Proposal</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const existing = document.getElementById("proposal-modal");
  if (existing) existing.remove();

  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

function handleProposalSubmit(event, propertyId) {
  event.preventDefault();
  if (!window.store.currentUser) {
    closeModal("proposal-modal");
    window.Toast.warning("Sign in as an operator to send a proposal");
    window.location.hash = "#login";
    return;
  }
  const form = event.target;
  const formData = new FormData(form);
  const tenure = String(formData.get("tenure") || "12");
  const months = parseInt(tenure, 10) || 12;
  const prop = window.store.getPropertyById(propertyId);

  window.store.addInquiry({
    property_id: propertyId,
    property_title: prop ? prop.title : "Rental Arbitrage Property",
    operator_name: formData.get("name"),
    portfolio_size: formData.get("experience"),
    proposed_terms: `${formData.get("tenure")} tenure. ${String(formData.get("message") || "").slice(0, 80)}...`,
    proposed_tenure_months: months
  }).then(() => {
    closeModal("proposal-modal");
    window.Toast.success("Proposal sent to landlord. Track it in Operator Hub.");
  }).catch((err) => {
    window.Toast.warning(err.message || "Could not send proposal");
  });
}

async function openUnlockContactModal(propertyId) {
  if (!window.store.currentUser) {
    window.Toast.warning("Sign in to unlock landlord contact");
    window.location.hash = "#login";
    return;
  }
  const prop = window.store.getPropertyById(propertyId);
  if (!prop) return;
  let phone = "Contact unavailable";
  let name = prop.owner ? prop.owner.name : "Verified Owner";
  try {
    const contact = await window.api.unlockContact(propertyId);
    phone = contact.phone;
    name = contact.name || name;
  } catch (err) {
    window.Toast.warning(err.message || "Could not unlock contact");
    return;
  }

  const modalHtml = `
    <div class="modal-overlay active" id="unlock-contact-modal">
      <div class="modal-container" style="max-width: 500px;">
        <div class="modal-header">
          <h3 class="modal-title">Verified Landlord Contact</h3>
          <button class="modal-close-btn" onclick="closeModal('unlock-contact-modal')">&times;</button>
        </div>
        <div class="modal-body" style="text-align: center; padding: 2rem 1.5rem;">
          <div style="width: 60px; height: 60px; border-radius: 50%; background: var(--success-subtle); color: var(--success); font-size: 1.8rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem;">
            📞
          </div>
          <h4>${name}</h4>
          <p class="text-sm" style="margin-bottom: 1.5rem;">Direct Line for STR Lease Inquiries:</p>
          <div style="background: var(--bg-tertiary); border: 1px solid var(--border-medium); border-radius: var(--radius-lg); padding: 1.25rem; font-family: var(--font-mono); font-size: 1.3rem; font-weight: 700; color: var(--primary-light); letter-spacing: 0.05em; margin-bottom: 1.5rem;">
            ${phone}
          </div>
          <div style="font-size: 0.8rem; color: var(--text-muted); line-height: 1.4;">
            Contact is only issued to signed-in users by the server.<br/>
            Reference <strong>PropLease ID</strong> when connecting.
          </div>
        </div>
        <div class="modal-footer" style="justify-content: center;">
          <button class="btn btn-primary" onclick="closeModal('unlock-contact-modal');">Done</button>
        </div>
      </div>
    </div>
  `;

  const existing = document.getElementById("unlock-contact-modal");
  if (existing) existing.remove();
  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("active");
    setTimeout(() => modal.remove(), 250);
  }
}

window.renderPropertyDetailView = renderPropertyDetailView;
window.updateDetailRoi = updateDetailRoi;
window.openProposalModal = openProposalModal;
window.openUnlockContactModal = openUnlockContactModal;
window.closeModal = closeModal;
window.handleProposalSubmit = handleProposalSubmit;
