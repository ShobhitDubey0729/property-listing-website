import { formatINR } from "../utils/format.js";
import { api } from "../api/client.js";
import { useStore } from "../context/StoreContext.jsx";
import { useUi } from "../context/UiContext.jsx";
import { PropertyCard } from "../components/PropertyCard.jsx";

export function OwnerDashboardPage() {
  const { store, ownerListings, ownerInquiries } = useStore();
  const { toast } = useUi();
  const myProperties = ownerListings || [];
  const inquiries = ownerInquiries || [];
  const totalMonthlyIncome = myProperties.reduce((sum, p) => sum + (p.monthly_rent || 0), 0);

  async function toggleListingLive(propertyId, currentStatus) {
    const newStatus = currentStatus === "live" ? "paused" : "live";
    try {
      await store.updatePropertyStatus(propertyId, newStatus);
      toast.info(`Property is now ${newStatus}`);
    } catch (err) {
      toast.warning(err.message || "Could not update listing");
    }
  }

  async function updateLeadStatus(inquiryId, status) {
    try {
      await api.updateInquiryStatus(inquiryId, status);
      await store.refreshSessionData();
      toast.success("Inquiry updated");
    } catch (err) {
      toast.warning(err.message || "Could not update inquiry");
    }
  }

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <span className="badge badge-str" style={{ marginBottom: "0.5rem" }}>
            Landlord Portal
          </span>
          <h1>Property Owner Dashboard</h1>
          <p>Manage your STR-friendly property listings, incoming operator proposals, and e-leases.</p>
        </div>
        <a href="#list-property" className="btn btn-primary">
          + List Another Property
        </a>
      </div>
      <div className="dash-stats-row">
        <div className="dash-stat-box">
          <div style={{ color: "var(--text-subtle)", fontSize: "0.85rem", textTransform: "uppercase", fontWeight: 700 }}>Active Listings</div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "var(--font-heading)", marginTop: "0.25rem" }}>{myProperties.length}</div>
        </div>
        <div className="dash-stat-box">
          <div style={{ color: "var(--text-subtle)", fontSize: "0.85rem", textTransform: "uppercase", fontWeight: 700 }}>Operator Inquiries / Proposals</div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "var(--font-heading)", color: "var(--primary)", marginTop: "0.25rem" }}>{inquiries.length}</div>
        </div>
        <div className="dash-stat-box">
          <div style={{ color: "var(--text-subtle)", fontSize: "0.85rem", textTransform: "uppercase", fontWeight: 700 }}>Potential Lease Cashflow</div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "var(--font-heading)", color: "var(--success)", marginTop: "0.25rem" }}>{formatINR(totalMonthlyIncome)}</div>
        </div>
      </div>
      <div style={{ marginBottom: "3.5rem" }}>
        <h3 style={{ marginBottom: "1.25rem" }}>Operator Proposals & Leads Inbox</h3>
        {inquiries.length === 0 ? (
          <div className="glass-panel" style={{ padding: "2.5rem", textAlign: "center" }}>
            <p>No proposals received yet. Your listings are live and visible to STR operators!</p>
          </div>
        ) : (
          inquiries.map((inq) => (
            <div className="lead-item-card" key={inq.id}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--primary-subtle)", color: "var(--primary-light)", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {inq.operator_name ? inq.operator_name.charAt(0) : "O"}
                </div>
                <div>
                  <h4 style={{ margin: 0 }}>{inq.operator_name}</h4>
                  <p className="text-sm" style={{ marginTop: "0.2rem" }}>
                    <strong>Portfolio:</strong> {inq.portfolio_size} • <strong>Applied For:</strong> {inq.property_title}
                  </p>
                  <p className="text-xs text-muted" style={{ marginTop: "0.2rem" }}>
                    &quot;{inq.proposed_terms}&quot;
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                <button className="btn btn-secondary btn-sm" onClick={() => updateLeadStatus(inq.id, "reviewing")}>
                  Reviewing
                </button>
                <button className="btn btn-roi btn-sm" onClick={() => updateLeadStatus(inq.id, "accepted")}>
                  Accept
                </button>
                <button className="btn btn-outline btn-sm" onClick={() => updateLeadStatus(inq.id, "rejected")}>
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <div>
        <h3 style={{ marginBottom: "1.25rem" }}>My Properties Portfolio</h3>
        <div className="glass-panel" style={{ padding: "1rem", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-subtle)", fontSize: "0.8rem", textTransform: "uppercase" }}>
                <th style={{ padding: "1rem 0.75rem" }}>Property</th>
                <th style={{ padding: "1rem 0.75rem" }}>City & Type</th>
                <th style={{ padding: "1rem 0.75rem" }}>Monthly Rent</th>
                <th style={{ padding: "1rem 0.75rem" }}>Status</th>
                <th style={{ padding: "1rem 0.75rem", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {myProperties.map((p) => (
                <tr key={p.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <td style={{ padding: "1rem 0.75rem" }}>
                    <strong>{p.title}</strong>
                    <div className="text-xs text-muted">
                      {p.bedrooms} BHK • {p.area_sqft} sqft
                    </div>
                  </td>
                  <td style={{ padding: "1rem 0.75rem" }}>
                    {p.locality}, {p.city}
                  </td>
                  <td style={{ padding: "1rem 0.75rem", fontWeight: 700 }}>{formatINR(p.monthly_rent)}/mo</td>
                  <td style={{ padding: "1rem 0.75rem" }}>
                    <span className={`badge ${p.status === "live" ? "badge-verified" : "badge-neutral"}`}>{(p.status || "").toUpperCase()}</span>
                  </td>
                  <td style={{ padding: "1rem 0.75rem", textAlign: "right" }}>
                    <a href={`#detail/${p.id}`} className="btn btn-ghost btn-sm">
                      View
                    </a>
                    <button className="btn btn-outline btn-sm" onClick={() => toggleListingLive(p.id, p.status)}>
                      {p.status === "live" ? "Pause" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function OperatorDashboardPage() {
  const { store, favoriteItems, favorites, inquiries } = useStore();
  const { openCompare, toast } = useUi();
  const favProps = favoriteItems?.length ? favoriteItems : favorites.map((id) => store.getPropertyById(id)).filter(Boolean);

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <span className="badge badge-str" style={{ marginBottom: "0.5rem" }}>
            Operator Portal
          </span>
          <h1>STR Operator / Investor Hub</h1>
          <p>Track your saved arbitrage deals, submitted proposals, and landlord negotiation status.</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <a href="#explore" className="btn btn-primary">
            Explore More Deals
          </a>
          <a href="#roi-calculator" className="btn btn-outline">
            ROI Calculator
          </a>
        </div>
      </div>
      <div className="dash-stats-row">
        <div className="dash-stat-box">
          <div style={{ color: "var(--text-subtle)", fontSize: "0.85rem", textTransform: "uppercase", fontWeight: 700 }}>Shortlisted Deals</div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "var(--font-heading)", marginTop: "0.25rem" }}>{favProps.length}</div>
        </div>
        <div className="dash-stat-box">
          <div style={{ color: "var(--text-subtle)", fontSize: "0.85rem", textTransform: "uppercase", fontWeight: 700 }}>Proposals Submitted</div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, fontFamily: "var(--font-heading)", color: "var(--primary)", marginTop: "0.25rem" }}>{inquiries.length}</div>
        </div>
        <div className="dash-stat-box">
          <div style={{ color: "var(--text-subtle)", fontSize: "0.85rem", textTransform: "uppercase", fontWeight: 700 }}>Operator Verification</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--success)", marginTop: "0.5rem" }}>Verified Superhost</div>
        </div>
      </div>
      <div style={{ marginBottom: "3.5rem" }}>
        <h3 style={{ marginBottom: "1.25rem" }}>My Submitted Master Lease Applications</h3>
        {inquiries.length === 0 ? (
          <div className="glass-panel" style={{ padding: "2.5rem", textAlign: "center" }}>
            <p>You haven&apos;t submitted any master lease proposals yet.</p>
            <a href="#explore" className="btn btn-primary btn-sm" style={{ marginTop: "1rem" }}>
              Find Properties
            </a>
          </div>
        ) : (
          <div className="grid grid-2 gap-4">
            {inquiries.map((inq) => (
              <div className="glass-panel" key={inq.id} style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                  <span className="badge badge-featured">{inq.status}</span>
                  <span className="text-xs text-muted">{inq.date}</span>
                </div>
                <h4 style={{ marginBottom: "0.25rem" }}>{inq.property_title}</h4>
                <p className="text-sm" style={{ marginBottom: "1rem" }}>
                  {inq.proposed_terms}
                </p>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => toast.info("Opening chat with owner...")}>
                    Message Owner
                  </button>
                  <a href={`#detail/${inq.property_id}`} className="btn btn-outline btn-sm">
                    View Deal
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <h3>Shortlisted / Saved Deals</h3>
          {favProps.length >= 2 ? (
            <button className="btn btn-secondary btn-sm" onClick={openCompare}>
              Compare Shortlist Side-by-Side ({favProps.length})
            </button>
          ) : null}
        </div>
        {favProps.length === 0 ? (
          <div className="glass-panel" style={{ padding: "3rem", textAlign: "center" }}>
            <p>You have not saved any properties to your shortlist yet.</p>
            <a href="#explore" className="btn btn-primary btn-sm" style={{ marginTop: "1rem" }}>
              Browse Properties
            </a>
          </div>
        ) : (
          <div className="grid grid-3 gap-6">
            {favProps.map((p) => (
              <PropertyCard key={p.id} prop={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminPanelPage() {
  const { store, adminListings, properties } = useStore();
  const { toast } = useUi();
  const list = adminListings.length ? adminListings : properties;

  async function adminModerate(propertyId, action) {
    try {
      if (action === "approve") await api.adminApprove(propertyId);
      else await api.adminReject(propertyId);
      await store.refreshSessionData();
      await store.loadPublicProperties();
      toast.success(action === "approve" ? "Listing approved" : "Listing rejected");
    } catch (err) {
      toast.warning(err.message || "Admin action failed");
    }
  }

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "5rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <span className="badge badge-roi" style={{ marginBottom: "0.5rem" }}>
            Admin Moderation
          </span>
          <h1>PropLease Platform Control Center</h1>
          <p>Moderate new owner listings, verify STR society compliance, and track marketplace metrics.</p>
        </div>
        <button className="btn btn-secondary" onClick={() => toast.success("Platform stats refreshed")}>
          🔄 Refresh Feed
        </button>
      </div>
      <div className="dash-stats-row">
        <div className="dash-stat-box">
          <div style={{ color: "var(--text-subtle)", fontSize: "0.85rem", textTransform: "uppercase", fontWeight: 700 }}>Total Listings</div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, marginTop: "0.25rem" }}>{list.length}</div>
        </div>
        <div className="dash-stat-box">
          <div style={{ color: "var(--text-subtle)", fontSize: "0.85rem", textTransform: "uppercase", fontWeight: 700 }}>Verified Landlords</div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--success)", marginTop: "0.25rem" }}>{list.filter((p) => p.verified).length}</div>
        </div>
        <div className="dash-stat-box">
          <div style={{ color: "var(--text-subtle)", fontSize: "0.85rem", textTransform: "uppercase", fontWeight: 700 }}>Dispute Rate</div>
          <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--primary)", marginTop: "0.25rem" }}>0.0%</div>
        </div>
      </div>
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
        <h3 style={{ marginBottom: "1rem" }}>Listing Moderation Queue</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-subtle)", fontSize: "0.8rem", textTransform: "uppercase" }}>
              <th style={{ padding: "1rem 0.75rem" }}>Listing Title</th>
              <th style={{ padding: "1rem 0.75rem" }}>Landlord</th>
              <th style={{ padding: "1rem 0.75rem" }}>City</th>
              <th style={{ padding: "1rem 0.75rem", textAlign: "right" }}>Moderation</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "1rem 0.75rem" }}>
                  <strong>{p.title}</strong>
                  <div className="text-xs text-muted">
                    {formatINR(p.monthly_rent)}/mo • {p.property_type}
                  </div>
                </td>
                <td style={{ padding: "1rem 0.75rem" }}>{p.owner ? p.owner.name : "Unknown"}</td>
                <td style={{ padding: "1rem 0.75rem" }}>{p.city}</td>
                <td style={{ padding: "1rem 0.75rem", textAlign: "right" }}>
                  <button className="btn btn-sm btn-roi" onClick={() => adminModerate(p.id, "approve")}>
                    Approve
                  </button>
                  <button className="btn btn-sm btn-outline" onClick={() => adminModerate(p.id, "reject")}>
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
