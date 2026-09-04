/**
 * PropLease Dashboards Component (Owner, Operator, and Admin views)
 */

function renderOwnerDashboardView() {
  const store = window.store;
  const myProperties = store.ownerListings || [];
  const inquiries = store.ownerInquiries || [];

  const totalMonthlyIncome = myProperties.reduce((sum, p) => sum + (p.monthly_rent || 0), 0);

  return `
    <div class="container" style="padding-top: 2rem; padding-bottom: 5rem;">
      <!-- Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <span class="badge badge-str" style="margin-bottom: 0.5rem;">Landlord Portal</span>
          <h1>Property Owner Dashboard</h1>
          <p>Manage your STR-friendly property listings, incoming operator proposals, and e-leases.</p>
        </div>

        <a href="#list-property" class="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          + List Another Property
        </a>
      </div>

      <!-- KPI Stats -->
      <div class="dash-stats-row">
        <div class="dash-stat-box">
          <div style="color: var(--text-subtle); font-size: 0.85rem; text-transform: uppercase; font-weight: 700;">Active Listings</div>
          <div style="font-size: 2.2rem; font-weight: 800; font-family: var(--font-heading); color: var(--text-main); margin-top: 0.25rem;">
            ${myProperties.length}
          </div>
          <div style="font-size: 0.8rem; color: var(--success); margin-top: 0.25rem;">✓ 100% STR-verified</div>
        </div>

        <div class="dash-stat-box">
          <div style="color: var(--text-subtle); font-size: 0.85rem; text-transform: uppercase; font-weight: 700;">Operator Inquiries / Proposals</div>
          <div style="font-size: 2.2rem; font-weight: 800; font-family: var(--font-heading); color: var(--primary); margin-top: 0.25rem;">
            ${inquiries.length}
          </div>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">2 new in last 24h</div>
        </div>

        <div class="dash-stat-box">
          <div style="color: var(--text-subtle); font-size: 0.85rem; text-transform: uppercase; font-weight: 700;">Potential Lease Cashflow</div>
          <div style="font-size: 2.2rem; font-weight: 800; font-family: var(--font-heading); color: var(--success); margin-top: 0.25rem;">
            ${window.formatINR(totalMonthlyIncome)}
          </div>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">Fixed master lease rent / mo</div>
        </div>
      </div>

      <!-- Inquiries / Lead Inbox Section -->
      <div style="margin-bottom: 3.5rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
          <h3>Operator Proposals & Leads Inbox</h3>
          <span class="badge badge-roi">${inquiries.length} Proposals</span>
        </div>

        ${inquiries.length === 0 ? `
          <div class="glass-panel" style="padding: 2.5rem; text-align: center;">
            <p>No proposals received yet. Your listings are live and visible to STR operators!</p>
          </div>
        ` : `
          <div>
            ${inquiries.map(inq => `
              <div class="lead-item-card">
                <div style="display: flex; align-items: center; gap: 1rem;">
                  <div style="width: 48px; height: 48px; border-radius: 50%; background: var(--primary-subtle); color: var(--primary-light); font-weight: 800; display: flex; align-items: center; justify-content: center;">
                    ${inq.operator_name ? inq.operator_name.charAt(0) : "O"}
                  </div>
                  <div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                      <h4 style="margin: 0;">${inq.operator_name}</h4>
                      <span class="badge badge-verified">⭐ ${inq.operator_rating || '4.9'}</span>
                    </div>
                    <p class="text-sm" style="margin-top: 0.2rem;">
                      <strong>Portfolio:</strong> ${inq.portfolio_size} • <strong>Applied For:</strong> ${inq.property_title}
                    </p>
                    <p class="text-xs text-muted" style="margin-top: 0.2rem;">"${inq.proposed_terms}"</p>
                  </div>
                </div>

                <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
                  <button class="btn btn-secondary btn-sm" onclick="updateLeadStatus('${inq.id}', 'reviewing')">Reviewing</button>
                  <button class="btn btn-roi btn-sm" onclick="updateLeadStatus('${inq.id}', 'accepted')">Accept</button>
                  <button class="btn btn-outline btn-sm" onclick="updateLeadStatus('${inq.id}', 'rejected')">Reject</button>
                </div>
              </div>
            `).join("")}
          </div>
        `}
      </div>

      <!-- My Listings Table -->
      <div>
        <h3 style="margin-bottom: 1.25rem;">My Properties Portfolio</h3>
        <div class="glass-panel" style="padding: 1rem; overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-subtle); color: var(--text-subtle); font-size: 0.8rem; text-transform: uppercase;">
                <th style="padding: 1rem 0.75rem;">Property</th>
                <th style="padding: 1rem 0.75rem;">City & Type</th>
                <th style="padding: 1rem 0.75rem;">Monthly Rent</th>
                <th style="padding: 1rem 0.75rem;">Status</th>
                <th style="padding: 1rem 0.75rem; text-align: right;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${myProperties.map(p => `
                <tr style="border-bottom: 1px solid var(--border-subtle);">
                  <td style="padding: 1rem 0.75rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <img src="${(p.images && p.images[0]) || ''}" style="width: 50px; height: 40px; border-radius: var(--radius-sm); object-fit: cover;" />
                      <div>
                        <strong>${p.title}</strong>
                        <div class="text-xs text-muted">${p.bedrooms} BHK • ${p.area_sqft} sqft</div>
                      </div>
                    </div>
                  </td>
                  <td style="padding: 1rem 0.75rem;">${p.locality}, ${p.city}<br/><span class="text-xs text-muted">${p.property_type}</span></td>
                  <td style="padding: 1rem 0.75rem; font-weight: 700; color: var(--text-main);">${window.formatINR(p.monthly_rent)}/mo</td>
                  <td style="padding: 1rem 0.75rem;">
                    <span class="badge ${p.status === 'live' ? 'badge-verified' : 'badge-neutral'}">
                      ${p.status.toUpperCase()}
                    </span>
                  </td>
                  <td style="padding: 1rem 0.75rem; text-align: right;">
                    <a href="#detail/${p.id}" class="btn btn-ghost btn-sm">View</a>
                    <button class="btn btn-outline btn-sm" onclick="toggleListingLive('${p.id}', '${p.status}')">
                      ${p.status === 'live' ? 'Pause' : 'Activate'}
                    </button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

async function toggleListingLive(propertyId, currentStatus) {
  const newStatus = currentStatus === "live" ? "paused" : "live";
  try {
    await window.store.updatePropertyStatus(propertyId, newStatus);
    window.Toast.info(`Property is now ${newStatus}`);
    window.route();
  } catch {
    /* toasted in store */
  }
}

async function updateLeadStatus(inquiryId, status) {
  try {
    await window.api.updateInquiryStatus(inquiryId, status);
    await window.store.refreshSessionData();
    window.Toast.success("Inquiry updated");
    window.route();
  } catch (err) {
    window.Toast.warning(err.message || "Could not update inquiry");
  }
}

function renderOperatorDashboardView() {
  const store = window.store;
  const favProps = (store.favoriteItems && store.favoriteItems.length)
    ? store.favoriteItems
    : store.favorites.map(id => store.getPropertyById(id)).filter(Boolean);
  const myInquiries = store.inquiries;

  return `
    <div class="container" style="padding-top: 2rem; padding-bottom: 5rem;">
      <!-- Header -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <span class="badge badge-str" style="margin-bottom: 0.5rem;">Operator Portal</span>
          <h1>STR Operator / Investor Hub</h1>
          <p>Track your saved arbitrage deals, submitted proposals, and landlord negotiation status.</p>
        </div>

        <div style="display: flex; gap: 0.5rem;">
          <a href="#explore" class="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            Explore More Deals
          </a>
          <a href="#roi-calculator" class="btn btn-outline">ROI Calculator</a>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="dash-stats-row">
        <div class="dash-stat-box">
          <div style="color: var(--text-subtle); font-size: 0.85rem; text-transform: uppercase; font-weight: 700;">Shortlisted Deals</div>
          <div style="font-size: 2.2rem; font-weight: 800; font-family: var(--font-heading); color: var(--text-main); margin-top: 0.25rem;">
            ${favProps.length}
          </div>
          <div style="font-size: 0.8rem; color: var(--primary); margin-top: 0.25rem;">Avg ROI: 114%</div>
        </div>

        <div class="dash-stat-box">
          <div style="color: var(--text-subtle); font-size: 0.85rem; text-transform: uppercase; font-weight: 700;">Proposals Submitted</div>
          <div style="font-size: 2.2rem; font-weight: 800; font-family: var(--font-heading); color: var(--primary); margin-top: 0.25rem;">
            ${myInquiries.length}
          </div>
          <div style="font-size: 0.8rem; color: var(--success); margin-top: 0.25rem;">Landlord response rate: 94%</div>
        </div>

        <div class="dash-stat-box">
          <div style="color: var(--text-subtle); font-size: 0.85rem; text-transform: uppercase; font-weight: 700;">Operator Verification</div>
          <div style="font-size: 1.4rem; font-weight: 800; font-family: var(--font-heading); color: var(--success); margin-top: 0.5rem;">
            Verified Superhost
          </div>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">KYC & GST verified</div>
        </div>
      </div>

      <!-- Submitted Proposals -->
      <div style="margin-bottom: 3.5rem;">
        <h3 style="margin-bottom: 1.25rem;">My Submitted Master Lease Applications</h3>
        ${myInquiries.length === 0 ? `
          <div class="glass-panel" style="padding: 2.5rem; text-align: center;">
            <p>You haven't submitted any master lease proposals yet.</p>
            <a href="#explore" class="btn btn-primary btn-sm" style="margin-top: 1rem;">Find Properties</a>
          </div>
        ` : `
          <div class="grid grid-2 gap-4">
            ${myInquiries.map(inq => `
              <div class="glass-panel" style="padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                  <span class="badge badge-featured">${inq.status}</span>
                  <span class="text-xs text-muted">${inq.date}</span>
                </div>
                <h4 style="margin-bottom: 0.25rem;">${inq.property_title}</h4>
                <p class="text-sm" style="margin-bottom: 1rem;">${inq.proposed_terms}</p>
                <div style="display: flex; gap: 0.5rem;">
                  <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="window.Toast.info('Opening chat with owner...')">Message Owner</button>
                  <a href="#detail/${inq.property_id}" class="btn btn-outline btn-sm">View Deal</a>
                </div>
              </div>
            `).join("")}
          </div>
        `}
      </div>

      <!-- Shortlisted Properties Grid -->
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
          <h3>Shortlisted / Saved Deals</h3>
          ${favProps.length >= 2 ? `
            <button class="btn btn-secondary btn-sm" onclick="openCompareDrawer()">
              Compare Shortlist Side-by-Side (${favProps.length})
            </button>
          ` : ''}
        </div>

        ${favProps.length === 0 ? `
          <div class="glass-panel" style="padding: 3rem; text-align: center;">
            <p>You have not saved any properties to your shortlist yet.</p>
            <a href="#explore" class="btn btn-primary btn-sm" style="margin-top: 1rem;">Browse Properties</a>
          </div>
        ` : `
          <div class="grid grid-3 gap-6">
            ${favProps.map(p => window.renderPropertyCard(p)).join("")}
          </div>
        `}
      </div>
    </div>
  `;
}

function renderAdminPanelView() {
  const store = window.store;
  const properties = store.adminListings.length ? store.adminListings : store.properties;

  return `
    <div class="container" style="padding-top: 2rem; padding-bottom: 5rem;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
        <div>
          <span class="badge badge-roi" style="margin-bottom: 0.5rem;">Admin Moderation</span>
          <h1>PropLease Platform Control Center</h1>
          <p>Moderate new owner listings, verify STR society compliance, and track marketplace metrics.</p>
        </div>

        <button class="btn btn-secondary" onclick="window.Toast.success('Platform stats refreshed')">
          🔄 Refresh Feed
        </button>
      </div>

      <!-- KPIs -->
      <div class="dash-stats-row">
        <div class="dash-stat-box">
          <div style="color: var(--text-subtle); font-size: 0.85rem; text-transform: uppercase; font-weight: 700;">Total Listings</div>
          <div style="font-size: 2.2rem; font-weight: 800; font-family: var(--font-heading); color: var(--text-main); margin-top: 0.25rem;">
            ${properties.length}
          </div>
        </div>

        <div class="dash-stat-box">
          <div style="color: var(--text-subtle); font-size: 0.85rem; text-transform: uppercase; font-weight: 700;">Verified Landlords</div>
          <div style="font-size: 2.2rem; font-weight: 800; font-family: var(--font-heading); color: var(--success); margin-top: 0.25rem;">
            ${properties.filter(p => p.verified).length}
          </div>
        </div>

        <div class="dash-stat-box">
          <div style="color: var(--text-subtle); font-size: 0.85rem; text-transform: uppercase; font-weight: 700;">Dispute Rate</div>
          <div style="font-size: 2.2rem; font-weight: 800; font-family: var(--font-heading); color: var(--primary); margin-top: 0.25rem;">
            0.0%
          </div>
        </div>
      </div>

      <!-- Moderation List -->
      <div class="glass-panel" style="padding: 1.5rem;">
        <h3 style="margin-bottom: 1rem;">Listing Moderation Queue</h3>
        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left;">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-subtle); color: var(--text-subtle); font-size: 0.8rem; text-transform: uppercase;">
                <th style="padding: 1rem 0.75rem;">Listing Title</th>
                <th style="padding: 1rem 0.75rem;">Landlord</th>
                <th style="padding: 1rem 0.75rem;">City</th>
                <th style="padding: 1rem 0.75rem;">STR Verification</th>
                <th style="padding: 1rem 0.75rem; text-align: right;">Moderation</th>
              </tr>
            </thead>
            <tbody>
              ${properties.map(p => `
                <tr style="border-bottom: 1px solid var(--border-subtle);">
                  <td style="padding: 1rem 0.75rem;">
                    <strong>${p.title}</strong>
                    <div class="text-xs text-muted">${window.formatINR(p.monthly_rent)}/mo • ${p.property_type}</div>
                  </td>
                  <td style="padding: 1rem 0.75rem;">${p.owner ? p.owner.name : 'Unknown'}</td>
                  <td style="padding: 1rem 0.75rem;">${p.city}</td>
                  <td style="padding: 1rem 0.75rem;">
                    <span class="badge badge-verified">NOC Approved</span>
                  </td>
                  <td style="padding: 1rem 0.75rem; text-align: right;">
                    <button class="btn btn-sm btn-roi" onclick="adminModerate('${p.id}', 'approve')">Approve</button>
                    <button class="btn btn-sm btn-outline" onclick="adminModerate('${p.id}', 'reject')">Reject</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

window.renderOwnerDashboardView = renderOwnerDashboardView;
window.renderOperatorDashboardView = renderOperatorDashboardView;
window.renderAdminPanelView = renderAdminPanelView;
window.toggleListingLive = toggleListingLive;
window.updateLeadStatus = updateLeadStatus;

async function adminModerate(propertyId, action) {
  try {
    if (action === "approve") await window.api.adminApprove(propertyId);
    else await window.api.adminReject(propertyId);
    await window.store.refreshSessionData();
    await window.store.loadPublicProperties();
    window.Toast.success(action === "approve" ? "Listing approved" : "Listing rejected");
    window.route();
  } catch (err) {
    window.Toast.warning(err.message || "Admin action failed");
  }
}
window.adminModerate = adminModerate;
