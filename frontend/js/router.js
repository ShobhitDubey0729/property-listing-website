/**
 * PropLease Client-Side Hash Router
 */

function renderHomeView() {
  const store = window.store;
  const featured = store.properties.filter(p => p.featured).slice(0, 3);
  const regularProps = store.properties.slice(0, 4);
  const displayProps = featured.length > 0 ? featured : regularProps;

  return `
    <!-- 1. HERO SECTION -->
    <section class="hero-section">
      <div class="hero-glow-1"></div>
      <div class="hero-glow-2"></div>

      <div class="container">
        <div class="hero-content">
          <div class="hero-badge">
            <span>✨</span> The Airbnb Rental Arbitrage Marketplace
          </div>

          <h1 class="hero-title">
            Find <span class="gradient-text-accent">STR-Friendly</span> Properties For Your Airbnb Business
          </h1>

          <p class="hero-subtitle">
            Connect directly with verified property owners who explicitly permit short-term rental subletting. Master leases, society NOCs, and real ROI projections — all in one place.
          </p>

          <!-- Main Hero Search Bar -->
          <div class="hero-search-box">
            <div class="hero-search-field">
              <span class="hero-search-label">Location / City</span>
              <select class="hero-search-select" id="hero-city-select">
                <option value="All Cities">All Hotspots (India)</option>
                <option value="Goa" selected>Goa (Anjuna, Candolim)</option>
                <option value="Bengaluru">Bengaluru (Indiranagar, Koramangala)</option>
                <option value="Mumbai">Mumbai (Bandra, Juhu)</option>
                <option value="Jaipur">Jaipur (C-Scheme, Heritage)</option>
                <option value="Manali">Manali (Old Manali, Chalets)</option>
                <option value="Rishikesh">Rishikesh (Tapovan, Ganga-view)</option>
              </select>
            </div>

            <div class="hero-search-field">
              <span class="hero-search-label">Property Type</span>
              <select class="hero-search-select" id="hero-type-select">
                <option value="All Types">Any Property Type</option>
                <option value="Villa">Villas & Independent Plots</option>
                <option value="Apartment">Luxury Apartments</option>
                <option value="Penthouse">Penthouses with Terraces</option>
              </select>
            </div>

            <div class="hero-search-field">
              <span class="hero-search-label">Max Lease Budget</span>
              <select class="hero-search-select" id="hero-budget-select">
                <option value="250000">Up to ₹2,50,000 / mo</option>
                <option value="150000" selected>Up to ₹1,50,000 / mo</option>
                <option value="100000">Up to ₹1,00,000 / mo</option>
                <option value="60000">Up to ₹60,000 / mo</option>
              </select>
            </div>

            <button class="btn btn-primary hero-search-submit" onclick="executeHeroSearch()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Search STR Deals
            </button>
          </div>

          <!-- Quick City Shortcuts -->
          <div class="city-shortcuts">
            <span style="font-size: 0.85rem; color: var(--text-subtle); margin-right: 0.5rem;">Popular Markets:</span>
            <span class="city-pill" onclick="quickFilterCity('Goa')">🌴 Goa</span>
            <span class="city-pill" onclick="quickFilterCity('Bengaluru')">🏙️ Bengaluru</span>
            <span class="city-pill" onclick="quickFilterCity('Mumbai')">🌊 Mumbai</span>
            <span class="city-pill" onclick="quickFilterCity('Jaipur')">🏰 Jaipur</span>
            <span class="city-pill" onclick="quickFilterCity('Manali')">🏔️ Manali</span>
            <span class="city-pill" onclick="quickFilterCity('Rishikesh')">🧘 Rishikesh</span>
          </div>
        </div>

        <!-- Stats Bar (from GET /api/stats) -->
        <div class="hero-stats-banner">
          <div class="stat-item">
            <div class="stat-num gradient-text">${store.stats.verified_listing_percentage != null ? store.stats.verified_listing_percentage + "%" : "—"}</div>
            <div class="stat-label">Verified Share of ${store.stats.total_active_listings || 0} Live Listings</div>
          </div>
          <div class="stat-item">
            <div class="stat-num gradient-text-roi">${formatStatMoney(store.stats.average_operator_net_profit)}</div>
            <div class="stat-label">Avg. Monthly Operator Net Profit</div>
          </div>
          <div class="stat-item">
            <div class="stat-num gradient-text">${store.stats.average_estimated_roi != null ? store.stats.average_estimated_roi + "%" : "—"}</div>
            <div class="stat-label">Avg. Arbitrage Cash-on-Cash ROI</div>
          </div>
          <div class="stat-item">
            <div class="stat-num gradient-text-accent">${formatStatMoney(store.stats.average_monthly_rent)}</div>
            <div class="stat-label">Average Monthly Master Lease</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. FEATURED PROPERTIES SECTION -->
    <section style="padding: 4rem 0;">
      <div class="container">
        <div style="display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 2.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <span class="badge badge-featured" style="margin-bottom: 0.5rem;">Handpicked Deals</span>
            <h2>Top Performing Rental Arbitrage Opportunities</h2>
            <p>Pre-vetted properties with highest projected revenue and verified landlord subletting NOCs.</p>
          </div>

          <a href="#explore" class="btn btn-outline">
            View All Properties →
          </a>
        </div>

        <div class="grid grid-3 gap-6">
          ${displayProps.map(p => window.renderPropertyCard(p)).join("")}
        </div>
      </div>
    </section>

    <!-- 3. HOW IT WORKS (SPLIT VALUE PROPOSITION) -->
    <section style="padding: 4rem 0; background: var(--bg-tertiary); border-top: 1px solid var(--border-subtle); border-bottom: 1px solid var(--border-subtle);">
      <div class="container">
        <div style="text-align: center; max-width: 720px; margin: 0 auto 3.5rem;">
          <span class="badge badge-str" style="margin-bottom: 0.5rem;">The Ecosystem</span>
          <h2>A Win-Win for Landlords and STR Operators</h2>
          <p>We eliminate the friction of finding STR-friendly landlords and provide clear legal contracts.</p>
        </div>

        <div class="how-it-works-grid">
          <!-- Property Owners Flow -->
          <div class="role-flow-column owner-col">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
              <span class="badge badge-str">For Property Owners</span>
              <span style="font-size: 1.5rem;">🏡</span>
            </div>
            <h3 style="margin-bottom: 0.75rem;">Earn Predictable, Premium Lease Income</h3>
            <p style="margin-bottom: 2rem;">Lease your unit to seasoned Superhosts who maintain your property immaculately.</p>

            <div class="step-timeline-item">
              <div class="step-num-bubble">1</div>
              <div>
                <h4>List with STR Clauses</h4>
                <p class="text-sm">Set your lease expectations, security deposit, and approved guest turnover rules in 5 minutes.</p>
              </div>
            </div>

            <div class="step-timeline-item">
              <div class="step-num-bubble">2</div>
              <div>
                <h4>Screen Vetted Operators</h4>
                <p class="text-sm">Review operator Airbnb track record, decibel monitoring tools, and guest screening protocols.</p>
              </div>
            </div>

            <div class="step-timeline-item">
              <div class="step-num-bubble">3</div>
              <div>
                <h4>Sign E-Lease & Collect Rent</h4>
                <p class="text-sm">Execute standardized master lease agreements with explicit property damage indemnity.</p>
              </div>
            </div>

            <a href="#list-property" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
              List Your Property Now →
            </a>
          </div>

          <!-- STR Operators Flow -->
          <div class="role-flow-column operator-col">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
              <span class="badge badge-roi">For STR Operators & Investors</span>
              <span style="font-size: 1.5rem;">📈</span>
            </div>
            <h3 style="margin-bottom: 0.75rem;">Scale an Airbnb Empire Without Buying Real Estate</h3>
            <p style="margin-bottom: 2rem;">Stop getting rejected by landlords. Find properties where subletting is 100% welcomed.</p>

            <div class="step-timeline-item">
              <div class="step-num-bubble" style="background: var(--success-subtle); color: var(--success); border-color: #a7f3d0;">1</div>
              <div>
                <h4>Filter Pre-Approved Deals</h4>
                <p class="text-sm">Filter by city, tourist hubs, society NOC readiness, smart lock support, and projected ROI.</p>
              </div>
            </div>

            <div class="step-timeline-item">
              <div class="step-num-bubble" style="background: var(--success-subtle); color: var(--success); border-color: #a7f3d0;">2</div>
              <div>
                <h4>Model Cash Flow & ROI</h4>
                <p class="text-sm">Use our interactive deal analyzer to stress-test nightly ADRs, occupancy, and operating margins.</p>
              </div>
            </div>

            <div class="step-timeline-item">
              <div class="step-num-bubble" style="background: var(--success-subtle); color: var(--success); border-color: #a7f3d0;">3</div>
              <div>
                <h4>Submit Master Lease Proposals</h4>
                <p class="text-sm">Send business proposals directly to landlords with 1-click verified contact unlock.</p>
              </div>
            </div>

            <a href="#explore" class="btn btn-roi" style="width: 100%; margin-top: 1rem;">
              Browse Pre-Approved Properties →
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. INTERACTIVE ROI TEASER SECTION -->
    <section style="padding: 5rem 0;">
      <div class="container">
        <div class="glass-panel" style="padding: 3rem; background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border-color: var(--border-subtle); box-shadow: var(--shadow-lg);">
          <div class="grid grid-2 gap-8" style="align-items: center;">
            <div>
              <span class="badge badge-roi" style="margin-bottom: 0.75rem;">Interactive Simulator</span>
              <h2>How Much Can You Earn from Rental Arbitrage?</h2>
              <p style="margin: 1rem 0 1.75rem; font-size: 1.05rem;">
                A 3BHK villa in Goa leased at ₹1,40,000/month generates ~₹3,19,000/month at 72% occupancy (₹14,500 ADR). After utilities and OTA fees, net cashflow exceeds <strong>₹1,20,000/month</strong>.
              </p>
              <a href="#roi-calculator" class="btn btn-primary btn-lg">
                Launch Full ROI Simulator →
              </a>
            </div>

            <div style="background: #ffffff; border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 1.75rem; box-shadow: var(--shadow-sm);">
              <div style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Sample Goa 3BHK Deal</div>
              <div style="font-size: 2.25rem; font-weight: 800; font-family: var(--font-heading); color: var(--success); margin: 0.25rem 0 1rem;">
                ₹1,21,580 <span style="font-size: 0.9rem; color: var(--text-muted); font-weight: normal;">/ month net profit</span>
              </div>
              <div class="roi-calc-row"><span>Gross Airbnb Revenue:</span><strong style="color: var(--text-main);">₹3,13,200</strong></div>
              <div class="roi-calc-row"><span>Fixed Master Lease:</span><span style="color: var(--danger);">-₹1,40,000</span></div>
              <div class="roi-calc-row"><span>Cleaning, Linen & Utilities:</span><span style="color: var(--danger);">-₹51,620</span></div>
              <div class="roi-calc-row"><span>Annual Cash-on-Cash Return:</span><strong style="color: var(--primary);">128%</strong></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderPricingView() {
  return `
    <div class="container" style="padding-top: 2rem; padding-bottom: 5rem;">
      <div style="text-align: center; max-width: 720px; margin: 0 auto 3rem;">
        <span class="badge badge-featured" style="margin-bottom: 0.5rem;">Transparent Pricing</span>
        <h1 style="font-size: clamp(2rem, 4vw, 3rem);">Plans for Landlords & Operators</h1>
        <p>Simple, success-aligned tiers with zero hidden lock-ins.</p>
      </div>

      <div class="pricing-grid">
        <!-- Tier 1: Free Basic -->
        <div class="pricing-card">
          <span class="badge badge-neutral" style="align-self: flex-start;">Standard Listing</span>
          <h3 style="margin-top: 0.75rem;">Free Landlord Listing</h3>
          <p class="text-sm">Ideal for individual owners with 1 property.</p>
          <div class="price-tag">₹0 <span style="font-size: 1rem; font-weight: normal; color: var(--text-muted);">/ forever</span></div>

          <div class="feature-check-list">
            <div class="feature-check-item">✓ Standard marketplace visibility</div>
            <div class="feature-check-item">✓ STR-friendly badges & tags</div>
            <div class="feature-check-item">✓ Up to 10 incoming proposals</div>
            <div class="feature-check-item">✓ Standard e-lease template</div>
          </div>

          <a href="#list-property" class="btn btn-outline" style="margin-top: auto;">List for Free</a>
        </div>

        <!-- Tier 2: Featured Boost -->
        <div class="pricing-card featured">
          <span class="badge badge-featured" style="align-self: flex-start;">Most Popular</span>
          <h3 style="margin-top: 0.75rem;">Featured Landlord Boost</h3>
          <p class="text-sm">Get verified Superhost operators within 48 hours.</p>
          <div class="price-tag">₹2,999 <span style="font-size: 1rem; font-weight: normal; color: var(--text-muted);">/ listing</span></div>

          <div class="feature-check-list">
            <div class="feature-check-item">✓ Top rank in Search & Map view</div>
            <div class="feature-check-item">✓ "Verified Landlord" badge</div>
            <div class="feature-check-item">✓ Unlimited operator proposals</div>
            <div class="feature-check-item">✓ Operator KYC & background audit</div>
            <div class="feature-check-item">✓ Dedicated lease advisor support</div>
          </div>

          <button class="btn btn-primary" style="margin-top: auto;" onclick="window.Toast.success('Featured listing boost selected!'); window.location.hash='#list-property';">
            Boost My Listing
          </button>
        </div>

        <!-- Tier 3: Operator Pro -->
        <div class="pricing-card">
          <span class="badge badge-roi" style="align-self: flex-start;">For Operators</span>
          <h3 style="margin-top: 0.75rem;">Operator Pro Pass</h3>
          <p class="text-sm">For ambitious entrepreneurs scaling an STR portfolio.</p>
          <div class="price-tag">₹4,999 <span style="font-size: 1rem; font-weight: normal; color: var(--text-muted);">/ month</span></div>

          <div class="feature-check-list">
            <div class="feature-check-item">✓ Instant Landlord Contact Unlock (Unlimited)</div>
            <div class="feature-check-item">✓ 24-hour early access to new listings</div>
            <div class="feature-check-item">✓ Comprehensive AirDNA/Revenue benchmarking</div>
            <div class="feature-check-item">✓ Custom master sublease legal pack</div>
          </div>

          <button class="btn btn-roi" style="margin-top: auto;" onclick="window.Toast.success('Operator Pro Pass activated!')">
            Get Pro Access
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderResourcesView() {
  return `
    <div class="container" style="padding-top: 2rem; padding-bottom: 5rem;">
      <div style="max-width: 800px; margin: 0 auto;">
        <span class="badge badge-str" style="margin-bottom: 0.5rem;">Knowledge Base</span>
        <h1 style="margin-bottom: 1rem;">Master Lease & STR Arbitrage Guide</h1>
        <p style="font-size: 1.05rem; margin-bottom: 2.5rem;">
          Everything you need to know about legally compliant short-term rental subleasing in Indian and global metros.
        </p>

        <div class="glass-panel" style="padding: 2rem; margin-bottom: 2rem;">
          <h3>1. What is Rental Arbitrage / Master Leasing?</h3>
          <p style="margin-top: 0.5rem; color: var(--text-muted); line-height: 1.7;">
            Rental arbitrage is a proven business model where an operator leases a residential property on a 1-3 year master lease from a landlord and furnishes it to host guests on platforms like Airbnb, Booking.com, and Agoda. The landlord enjoys guaranteed monthly rental without vacancies, while the operator earns the margin between nightly tourist revenue and fixed monthly expenses.
          </p>
        </div>

        <div class="glass-panel" style="padding: 2rem; margin-bottom: 2rem;">
          <h3>2. Society / RWA Compliance in India</h3>
          <p style="margin-top: 0.5rem; color: var(--text-muted); line-height: 1.7;">
            Different housing societies and RWAs have varied bylaws. On PropLease, all properties are pre-tagged with their specific society approvals. Standalone villas, independent floors, and commercial-zoned apartment complexes offer maximum flexibility.
          </p>
        </div>

        <div class="glass-panel" style="padding: 2rem;">
          <h3>3. Key Clauses in a PropLease Master Lease Agreement</h3>
          <ul style="margin-top: 0.75rem; display: flex; flex-direction: column; gap: 0.75rem; color: var(--text-muted);">
            <li>• <strong>Express Subletting Authorization:</strong> Explicit clause authorizing transient tourist occupancies.</li>
            <li>• <strong>Operator Indemnity & Insurance:</strong> Landlord is held completely harmless from any guest damages or third-party liability.</li>
            <li>• <strong>Maintenance Threshold:</strong> Operator covers minor maintenance (up to ₹5,000 per incident) directly.</li>
            <li>• <strong>Noise Decibel Monitoring:</strong> Mandatory installation of smart decibel sensors to enforce quiet hours.</li>
          </ul>
        </div>
      </div>
    </div>
  `;
}

function formatStatMoney(n) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  const v = Number(n);
  if (Math.abs(v) >= 100000) return "₹" + (v / 100000).toFixed(1) + "L";
  return window.formatINR ? window.formatINR(v) : "₹" + Math.round(v).toLocaleString("en-IN");
}

function executeHeroSearch() {
  const city = document.getElementById("hero-city-select").value;
  const type = document.getElementById("hero-type-select").value;
  const budget = parseInt(document.getElementById("hero-budget-select").value, 10);

  window.store.setFilter("city", city);
  window.store.setFilter("propertyType", type);
  window.store.setFilter("maxPrice", budget);

  window.location.hash = "#explore";
}

function quickFilterCity(city) {
  window.store.setFilter("city", city);
  window.location.hash = "#explore";
}

// Global Router Dispatcher
function route() {
  const hash = window.location.hash || "#";
  const appRoot = document.getElementById("app-root");
  if (!appRoot) return;

  // Sync active nav links
  document.querySelectorAll(".nav-link").forEach(link => {
    const href = link.getAttribute("href");
    if (href === hash || (hash === "#" && href === "#home")) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });

  if (hash === "" || hash === "#" || hash === "#home") {
    appRoot.innerHTML = renderHomeView();
  } else if (hash === "#login") {
    appRoot.innerHTML = window.renderAuthViews("login");
  } else if (hash === "#signup") {
    appRoot.innerHTML = window.renderAuthViews("signup");
  } else if (hash === "#explore") {
    appRoot.innerHTML = window.renderExploreView();
  } else if (hash.startsWith("#detail/")) {
    const propId = hash.replace("#detail/", "");
    const existing = window.store.getPropertyById(propId);
    if (!existing) {
      appRoot.innerHTML = `<div class="container" style="padding:4rem 0;text-align:center;"><p>Loading listing…</p></div>`;
      window.store.ensureProperty(propId).then((prop) => {
        if (window.location.hash !== `#detail/${propId}`) return;
        appRoot.innerHTML = window.renderPropertyDetailView(propId);
        if (prop) window.updateDetailRoi(propId);
      });
    } else {
      appRoot.innerHTML = window.renderPropertyDetailView(propId);
      window.updateDetailRoi(propId);
    }
  } else if (hash === "#list-property") {
    appRoot.innerHTML = window.renderListingWizardView();
  } else if (hash === "#owner-dashboard") {
    appRoot.innerHTML = window.renderOwnerDashboardView();
  } else if (hash === "#operator-dashboard") {
    appRoot.innerHTML = window.renderOperatorDashboardView();
  } else if (hash === "#admin-panel") {
    appRoot.innerHTML = window.renderAdminPanelView();
  } else if (hash === "#roi-calculator") {
    appRoot.innerHTML = window.renderRoiCalculatorView();
    window.runStandaloneCalc();
  } else if (hash === "#pricing") {
    appRoot.innerHTML = renderPricingView();
  } else if (hash === "#resources") {
    appRoot.innerHTML = renderResourcesView();
  } else {
    appRoot.innerHTML = renderHomeView();
  }

  // Check compare sticky bar
  window.renderCompareBar();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

window.renderHomeView = renderHomeView;
window.renderPricingView = renderPricingView;
window.renderResourcesView = renderResourcesView;
window.executeHeroSearch = executeHeroSearch;
window.quickFilterCity = quickFilterCity;
window.route = route;
