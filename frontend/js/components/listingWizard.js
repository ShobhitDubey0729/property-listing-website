/**
 * PropLease "List Your Property" Multi-Step Wizard for Landlords
 */

const WIZARD_STATE = {
  step: 1,
  pendingFiles: [],
  data: {
    title: "",
    property_type: "Villa",
    city: "Goa",
    locality: "",
    address: "",
    bedrooms: 2,
    bathrooms: 2,
    area_sqft: 1400,
    furnishing_status: "Fully Furnished",
    str_friendly: true,
    str_tags: ["Society NOC Ready", "Smart Lock Installed"],
    monthly_rent: 85000,
    security_deposit: 170000,
    min_lease_months: 12,
    est_nightly_rate: 7500,
    est_occupancy_pct: 70,
    description: "",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
    ],
    owner: {
      name: "Property Owner",
      role: "Verified Landlord",
      verified: true,
      phone: "+91 98XXX XXXXX",
      member_since: "Aug 2026",
      response_time: "< 1 hr",
      rating: 5.0
    },
    society_rules: {
      noc_available: true,
      guest_turnover_allowed: true,
      smart_lock_allowed: true,
      noise_curfew: "10:30 PM",
      cleaning_team_access: "Approved",
      subletting_clause_in_contract: true
    }
  }
};

function renderListingWizardView() {
  const step = WIZARD_STATE.step;

  return `
    <div class="container" style="padding-top: 2.5rem; padding-bottom: 5rem;">
      <div class="wizard-container">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 2rem;">
          <span class="badge badge-str" style="margin-bottom: 0.5rem;">Landlord Onboarding</span>
          <h1>List Your Property for STR Operators</h1>
          <p>Connect with vetted Airbnb entrepreneurs and secure steady, hassle-free master lease income.</p>
        </div>

        <!-- Wizard Steps Indicator -->
        <div class="wizard-steps-nav">
          <div class="wizard-progress-track">
            <div class="wizard-progress-bar-fill" style="width: ${((step - 1) / 4) * 100}%;"></div>
          </div>

          <div class="wizard-step-node ${step === 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}" onclick="goToStep(1)">
            <div class="wizard-step-circle">${step > 1 ? '✓' : '1'}</div>
            <span class="wizard-step-label">Basic Info</span>
          </div>

          <div class="wizard-step-node ${step === 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}" onclick="goToStep(2)">
            <div class="wizard-step-circle">${step > 2 ? '✓' : '2'}</div>
            <span class="wizard-step-label">STR Rules</span>
          </div>

          <div class="wizard-step-node ${step === 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}" onclick="goToStep(3)">
            <div class="wizard-step-circle">${step > 3 ? '✓' : '3'}</div>
            <span class="wizard-step-label">Media & Amenities</span>
          </div>

          <div class="wizard-step-node ${step === 4 ? 'active' : ''} ${step > 4 ? 'completed' : ''}" onclick="goToStep(4)">
            <div class="wizard-step-circle">${step > 4 ? '✓' : '4'}</div>
            <span class="wizard-step-label">Lease Terms</span>
          </div>

          <div class="wizard-step-node ${step === 5 ? 'active' : ''}" onclick="goToStep(5)">
            <div class="wizard-step-circle">5</div>
            <span class="wizard-step-label">Review</span>
          </div>
        </div>

        <!-- Step Content Forms -->
        <div class="glass-panel" style="padding: 2.25rem;">
          ${renderStepContent(step)}
        </div>
      </div>
    </div>
  `;
}

function renderStepContent(step) {
  const data = WIZARD_STATE.data;

  if (step === 1) {
    return `
      <div>
        <h3 style="margin-bottom: 0.25rem;">Step 1: Property Overview & Location</h3>
        <p class="text-sm" style="margin-bottom: 1.5rem;">Provide general specs for your property.</p>

        <div class="form-group">
          <label class="form-label">Listing Title *</label>
          <input type="text" class="form-control" id="wiz-title" value="${data.title}" placeholder="e.g. Modern Sunset 3BHK Penthouse with Pool Access" oninput="WIZARD_STATE.data.title = this.value;" />
        </div>

        <div class="grid grid-2 gap-4">
          <div class="form-group">
            <label class="form-label">Property Type</label>
            <select class="form-select" id="wiz-type" onchange="WIZARD_STATE.data.property_type = this.value;">
              <option value="Villa" ${data.property_type === 'Villa' ? 'selected' : ''}>Villa / Standalone</option>
              <option value="Apartment" ${data.property_type === 'Apartment' ? 'selected' : ''}>Apartment / Flat</option>
              <option value="Penthouse" ${data.property_type === 'Penthouse' ? 'selected' : ''}>Penthouse</option>
              <option value="Independent House" ${data.property_type === 'Independent House' ? 'selected' : ''}>Independent House / Haveli</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">City *</label>
            <select class="form-select" id="wiz-city" onchange="WIZARD_STATE.data.city = this.value;">
              <option value="Goa" ${data.city === 'Goa' ? 'selected' : ''}>Goa</option>
              <option value="Bengaluru" ${data.city === 'Bengaluru' ? 'selected' : ''}>Bengaluru</option>
              <option value="Mumbai" ${data.city === 'Mumbai' ? 'selected' : ''}>Mumbai</option>
              <option value="Jaipur" ${data.city === 'Jaipur' ? 'selected' : ''}>Jaipur</option>
              <option value="Manali" ${data.city === 'Manali' ? 'selected' : ''}>Manali</option>
              <option value="Rishikesh" ${data.city === 'Rishikesh' ? 'selected' : ''}>Rishikesh</option>
            </select>
          </div>
        </div>

        <div class="grid grid-2 gap-4">
          <div class="form-group">
            <label class="form-label">Locality / Neighborhood *</label>
            <input type="text" class="form-control" id="wiz-locality" value="${data.locality}" placeholder="e.g. Candolim, Indiranagar, Tapovan" oninput="WIZARD_STATE.data.locality = this.value;" />
          </div>
          <div class="form-group">
            <label class="form-label">Full Street Address</label>
            <input type="text" class="form-control" id="wiz-address" value="${data.address}" placeholder="Flat 402, Sunshine Enclave, Main Road" oninput="WIZARD_STATE.data.address = this.value;" />
          </div>
        </div>

        <div class="grid grid-3 gap-4">
          <div class="form-group">
            <label class="form-label">Bedrooms</label>
            <input type="number" class="form-control" min="1" max="10" value="${data.bedrooms}" oninput="WIZARD_STATE.data.bedrooms = parseInt(this.value, 10);" />
          </div>
          <div class="form-group">
            <label class="form-label">Bathrooms</label>
            <input type="number" class="form-control" min="1" max="10" value="${data.bathrooms}" oninput="WIZARD_STATE.data.bathrooms = parseInt(this.value, 10);" />
          </div>
          <div class="form-group">
            <label class="form-label">Carpet Area (sq.ft)</label>
            <input type="number" class="form-control" min="300" max="10000" step="50" value="${data.area_sqft}" oninput="WIZARD_STATE.data.area_sqft = parseInt(this.value, 10);" />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Furnishing Status</label>
          <select class="form-select" onchange="WIZARD_STATE.data.furnishing_status = this.value;">
            <option value="Fully Furnished" ${data.furnishing_status === 'Fully Furnished' ? 'selected' : ''}>Fully Furnished (Ready to Host)</option>
            <option value="Semi-Furnished" ${data.furnishing_status === 'Semi-Furnished' ? 'selected' : ''}>Semi-Furnished (Kitchen + Wardrobes)</option>
            <option value="Unfurnished" ${data.furnishing_status === 'Unfurnished' ? 'selected' : ''}>Unfurnished (Operator Sets Up)</option>
          </select>
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 2rem;">
          <button class="btn btn-primary" onclick="validateStep1()">Proceed to STR Permissions →</button>
        </div>
      </div>
    `;
  }

  if (step === 2) {
    return `
      <div>
        <h3 style="margin-bottom: 0.25rem;">Step 2: STR & Short-Term Rental Permissions</h3>
        <p class="text-sm" style="margin-bottom: 1.5rem;">Clarify what subletting rights and society permissions apply to this property.</p>

        <div style="background: var(--bg-tertiary); padding: 1.25rem; border-radius: var(--radius-md); margin-bottom: 1.5rem;">
          <h4 style="font-size: 1rem; color: var(--primary-light); margin-bottom: 0.5rem;">Why is this crucial?</h4>
          <p class="text-sm">Serious STR operators look for guaranteed landlord & society consent to avoid operational shutdown after signing a master lease.</p>
        </div>

        <div class="form-group">
          <label class="tag-checkbox-label" style="width: 100%; padding: 0.9rem; margin-bottom: 0.75rem;">
            <input type="checkbox" checked disabled />
            <div>
              <strong>I authorize short-term rental / Airbnb guest subleasing</strong>
              <div class="text-xs text-muted">A master lease subletting clause will be generated automatically.</div>
            </div>
          </label>
        </div>

        <div class="form-group">
          <label class="tag-checkbox-label" style="width: 100%; padding: 0.9rem; margin-bottom: 0.75rem;">
            <input type="checkbox" checked />
            <div>
              <strong>Society / RWA Allows Frequent Guest Turnovers</strong>
              <div class="text-xs text-muted">Building security permits transient guests with digital ID check-in.</div>
            </div>
          </label>
        </div>

        <div class="form-group">
          <label class="tag-checkbox-label" style="width: 100%; padding: 0.9rem; margin-bottom: 0.75rem;">
            <input type="checkbox" checked />
            <div>
              <strong>Smart Lock & Keypad Installation Permitted</strong>
              <div class="text-xs text-muted">Operator may replace the main door lock cylinder with a smart lock.</div>
            </div>
          </label>
        </div>

        <div class="form-group">
          <label class="form-label">Noise & Quiet Hours Policy</label>
          <input type="text" class="form-control" value="Quiet hours from 10:30 PM to 7:00 AM. Decibel monitoring recommended." oninput="WIZARD_STATE.data.society_rules.noise_curfew = this.value;" />
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
          <button class="btn btn-secondary" onclick="goToStep(1)">← Back</button>
          <button class="btn btn-primary" onclick="goToStep(3)">Next: Photos & Amenities →</button>
        </div>
      </div>
    `;
  }

  if (step === 3) {
    return `
      <div>
        <h3 style="margin-bottom: 0.25rem;">Step 3: Property Photos & STR Tags</h3>
        <p class="text-sm" style="margin-bottom: 1.5rem;">Add photos and highlight standout features.</p>

        <!-- Dropzone simulation -->
        <div class="file-dropzone" onclick="document.getElementById('wiz-photos').click()">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📸</div>
          <h4>Drag & Drop Property Photos or Click to Upload</h4>
          <p class="text-sm" style="margin-top: 0.25rem;">JPEG, PNG or WebP up to 5MB. Listing stays pending until an admin approves it.</p>
          <input id="wiz-photos" type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onchange="handleWizardPhotos(event)" />
          <button type="button" class="btn btn-secondary btn-sm" style="margin-top: 1rem;">Choose Images</button>
          <div class="text-xs text-muted" style="margin-top: 0.75rem;">${(WIZARD_STATE.pendingFiles || []).length} file(s) selected</div>
        </div>

        <div style="margin-top: 1.5rem;">
          <label class="form-label" style="margin-bottom: 0.5rem;">Select Highlight Tags</label>
          <div class="tag-checkbox-grid">
            ${window.STR_FILTER_OPTIONS.map(tag => `
              <label class="tag-checkbox-label ${data.str_tags.includes(tag) ? 'checked' : ''}">
                <input type="checkbox" ${data.str_tags.includes(tag) ? 'checked' : ''} onchange="toggleWizardTag('${tag}')" />
                ${tag}
              </label>
            `).join('')}
          </div>
        </div>

        <div class="form-group" style="margin-top: 1.5rem;">
          <label class="form-label">Detailed Property Pitch & Proximity</label>
          <textarea class="form-control" rows="4" placeholder="Mention nearby tourist spots, cafes, metro stations, view from balcony..." oninput="WIZARD_STATE.data.description = this.value;">${data.description || 'Bright and spacious unit situated in a prime leisure destination. Walking distance to popular cafes and scenic viewpoints. Excellent potential for high occupancy Airbnb operations.'}</textarea>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
          <button class="btn btn-secondary" onclick="goToStep(2)">← Back</button>
          <button class="btn btn-primary" onclick="goToStep(4)">Next: Lease Terms →</button>
        </div>
      </div>
    `;
  }

  if (step === 4) {
    return `
      <div>
        <h3 style="margin-bottom: 0.25rem;">Step 4: Master Lease Terms & Rent Expectation</h3>
        <p class="text-sm" style="margin-bottom: 1.5rem;">Set your financial terms and operator screening criteria.</p>

        <div class="grid grid-2 gap-4">
          <div class="form-group">
            <label class="form-label">Desired Monthly Lease Rent (₹) *</label>
            <input type="number" class="form-control" step="1000" min="10000" max="1000000" value="${data.monthly_rent}" oninput="WIZARD_STATE.data.monthly_rent = parseInt(this.value, 10);" />
          </div>
          <div class="form-group">
            <label class="form-label">Security Deposit (₹)</label>
            <input type="number" class="form-control" step="5000" min="10000" max="2000000" value="${data.security_deposit || data.monthly_rent * 2}" oninput="WIZARD_STATE.data.security_deposit = parseInt(this.value, 10);" />
          </div>
        </div>

        <div class="grid grid-2 gap-4">
          <div class="form-group">
            <label class="form-label">Minimum Lease Commitment</label>
            <select class="form-select" onchange="WIZARD_STATE.data.min_lease_months = parseInt(this.value, 10);">
              <option value="11" ${data.min_lease_months === 11 ? 'selected' : ''}>11 Months</option>
              <option value="12" ${data.min_lease_months === 12 ? 'selected' : ''}>12 Months (1 Year)</option>
              <option value="24" ${data.min_lease_months === 24 ? 'selected' : ''}>24 Months (2 Years)</option>
              <option value="36" ${data.min_lease_months === 36 ? 'selected' : ''}>36 Months (3 Years)</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Estimated Airbnb ADR / Night (₹)</label>
            <input type="number" class="form-control" value="${data.est_nightly_rate}" oninput="WIZARD_STATE.data.est_nightly_rate = parseInt(this.value, 10);" />
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
          <button class="btn btn-secondary" onclick="goToStep(3)">← Back</button>
          <button class="btn btn-primary" onclick="goToStep(5)">Review & Final Preview →</button>
        </div>
      </div>
    `;
  }

  if (step === 5) {
    // Generate an instant preview card
    const previewProp = {
      id: "preview-" + Date.now(),
      title: data.title || "Spacious Airbnb-Ready Haven",
      description: data.description || "Prime property ready for STR master lease.",
      property_type: data.property_type,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      area_sqft: data.area_sqft,
      furnishing_status: data.furnishing_status,
      address: data.address || `${data.locality}, ${data.city}`,
      city: data.city,
      locality: data.locality || "City Center",
      monthly_rent: data.monthly_rent,
      security_deposit: data.security_deposit || data.monthly_rent * 2,
      min_lease_months: data.min_lease_months,
      str_friendly: true,
      str_tags: data.str_tags,
      est_nightly_rate: data.est_nightly_rate,
      est_occupancy_pct: 72,
      est_annual_roi_pct: Math.round((((data.est_nightly_rate * 22) - data.monthly_rent - (data.est_nightly_rate * 22 * 0.18)) * 12 / (data.monthly_rent * 3)) * 100),
      images: data.images,
      owner: {
        name: "Rohit Verma (You)",
        role: "Property Landlord",
        verified: true,
        phone: "+91 98200 11223",
        member_since: "Aug 2026",
        response_time: "< 1 hr",
        rating: 5.0
      },
      featured: true,
      verified: true,
      status: "live",
      created_at: new Date().toISOString().split("T")[0]
    };

    return `
      <div>
        <h3 style="margin-bottom: 0.25rem;">Step 5: Review & Publish Listing</h3>
        <p class="text-sm" style="margin-bottom: 1.5rem;">Here is how your property listing will appear to STR operators:</p>

        <div style="max-width: 440px; margin: 0 auto 2rem;">
          ${window.renderPropertyCard(previewProp)}
        </div>

        <div style="background: var(--bg-tertiary); padding: 1.25rem; border-radius: var(--radius-md); margin-bottom: 2rem; font-size: 0.88rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--success); font-weight: 700; margin-bottom: 0.5rem;">
            ✓ Free Tier Listing Selected
          </div>
          <div>Your listing is submitted as <strong>pending</strong>. It becomes public after admin approval.</div>
        </div>

        <div style="display: flex; justify-content: space-between;">
          <button class="btn btn-secondary" onclick="goToStep(4)">← Back</button>
          <button class="btn btn-primary btn-lg" onclick="publishListing()">🚀 Publish Property Live</button>
        </div>
      </div>
    `;
  }
}

function goToStep(s) {
  WIZARD_STATE.step = s;
  const container = document.getElementById("app-root");
  if (container) {
    container.innerHTML = renderListingWizardView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function validateStep1() {
  if (!WIZARD_STATE.data.title.trim()) {
    WIZARD_STATE.data.title = `Chic ${WIZARD_STATE.data.bedrooms}BHK ${WIZARD_STATE.data.property_type} in ${WIZARD_STATE.data.city}`;
  }
  if (!WIZARD_STATE.data.locality.trim()) {
    WIZARD_STATE.data.locality = `${WIZARD_STATE.data.city} Center`;
  }
  goToStep(2);
}

function toggleWizardTag(tag) {
  const tags = WIZARD_STATE.data.str_tags;
  const idx = tags.indexOf(tag);
  if (idx > -1) {
    tags.splice(idx, 1);
  } else {
    tags.push(tag);
  }
  goToStep(3);
}

function handleWizardPhotos(event) {
  WIZARD_STATE.pendingFiles = Array.from(event.target.files || []);
  window.Toast.success(`${WIZARD_STATE.pendingFiles.length} photo(s) ready to upload`);
}

async function publishListing() {
  if (!window.store.currentUser) {
    window.Toast.warning("Sign in as a landlord to list a property");
    window.location.hash = "#login";
    return;
  }
  if (window.store.currentRole !== "owner" && window.store.currentRole !== "admin") {
    window.Toast.warning("Switch to the Landlord demo account (or sign up as owner) to publish");
    return;
  }

  const d = WIZARD_STATE.data;
  const payload = {
    title: d.title || `Modern ${d.bedrooms}BHK in ${d.city}`,
    description: d.description || "STR-friendly property with pre-approved society permissions.",
    property_type: d.property_type,
    bedrooms: d.bedrooms,
    bathrooms: d.bathrooms,
    area_sqft: d.area_sqft,
    furnishing_status: d.furnishing_status,
    address: d.address || `${d.locality}, ${d.city}`,
    city: d.city,
    locality: d.locality || "Prime Area",
    map_coord_x: 45 + Math.random() * 10,
    map_coord_y: 40 + Math.random() * 10,
    monthly_rent: d.monthly_rent,
    security_deposit: d.security_deposit || d.monthly_rent * 2,
    min_lease_months: d.min_lease_months,
    str_friendly: true,
    str_tags: d.str_tags.length > 0 ? d.str_tags : ["Society NOC Ready", "Smart Lock Installed"],
    est_nightly_rate: d.est_nightly_rate,
    est_occupancy_pct: 72,
    est_annual_roi_pct: Math.round((((d.est_nightly_rate * 22) - d.monthly_rent - (d.est_nightly_rate * 22 * 0.18)) * 12 / (d.monthly_rent * 3)) * 100),
    image_urls: (WIZARD_STATE.pendingFiles && WIZARD_STATE.pendingFiles.length) ? [] : d.images,
    society_rules: d.society_rules
  };

  try {
    const created = await window.api.createProperty(payload);
    const files = WIZARD_STATE.pendingFiles || [];
    for (const file of files) {
      await window.api.uploadPropertyImage(created.id, file);
    }
    await window.store.refreshSessionData();
    window.Toast.success("Listing submitted for admin approval");
    window.location.hash = "#owner-dashboard";
  } catch (err) {
    window.Toast.warning(err.message || "Could not publish listing");
  }
}

window.renderListingWizardView = renderListingWizardView;
window.goToStep = goToStep;
window.validateStep1 = validateStep1;
window.toggleWizardTag = toggleWizardTag;
window.simulatePhotoUpload = function () { document.getElementById("wiz-photos")?.click(); };
window.handleWizardPhotos = handleWizardPhotos;
window.publishListing = publishListing;
