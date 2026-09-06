import { useStore } from "../context/StoreContext.jsx";
import { useUi } from "../context/UiContext.jsx";
import { useHash } from "../utils/useHash.js";

export function Header() {
  const { store, currentUser, currentRole } = useStore();
  const { toast, mobileOpen, toggleMobile, closeMobile } = useUi();
  const hash = useHash();

  async function setRoleMode(role) {
    try {
      await store.loginDemo(role);
      toast.info(`Signed in as ${role} demo account`);
      if (role === "owner") window.location.hash = "#owner-dashboard";
      else if (role === "admin") window.location.hash = "#admin-panel";
      else window.location.hash = "#explore";
    } catch (err) {
      toast.warning(err.message || "Could not sign in to demo account");
      window.location.hash = "#login";
    }
  }

  async function handleLogout() {
    await store.logout();
    toast.info("Signed out");
    window.location.hash = "#home";
  }

  const portalHref =
    currentRole === "owner" ? "#owner-dashboard" : currentRole === "admin" ? "#admin-panel" : "#operator-dashboard";
  const portalLabel =
    currentRole === "owner" ? "Landlord Dashboard" : currentRole === "admin" ? "Admin Control" : "Operator Hub";

  const navActive = (href) => href === hash || (hash === "#" && href === "#home");

  return (
    <>
      <header className="site-header">
        <div className="container">
          <a href="#home" className="brand-logo">
            <div className="brand-icon-wrap">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span>PropLease</span>
            <span className="brand-tag">STR Arbitrage</span>
          </a>
          <nav className="nav-links">
            <a href="#explore" className={`nav-link${navActive("#explore") ? " active" : ""}`}>
              Explore Properties
            </a>
            <a href="#roi-calculator" className={`nav-link${navActive("#roi-calculator") ? " active" : ""}`}>
              ROI Simulator
            </a>
            <a href="#pricing" className={`nav-link${navActive("#pricing") ? " active" : ""}`}>
              Pricing
            </a>
            <a href="#resources" className={`nav-link${navActive("#resources") ? " active" : ""}`}>
              Legal & Guide
            </a>
            <a href={portalHref} className="nav-link" id="nav-portal-link">
              {portalLabel}
            </a>
          </nav>
          <div className="header-actions">
            <div className="role-switcher-container" title="Switch User Role Perspective">
              {["operator", "owner", "admin"].map((role) => (
                <button
                  key={role}
                  className={`role-btn${role === "admin" ? " role-admin" : ""}${currentRole === role ? " active" : ""}`}
                  onClick={() => setRoleMode(role)}
                >
                  {role === "operator" ? "Operator" : role === "owner" ? "Landlord" : "Admin"}
                </button>
              ))}
            </div>
            <a href="#list-property" className="btn btn-primary btn-sm">
              List Property
            </a>
            <div id="auth-slot" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              {currentUser ? (
                <>
                  <span className="text-xs text-muted" style={{ whiteSpace: "nowrap" }}>
                    {currentUser.name}
                  </span>
                  <button className="btn btn-ghost btn-sm" type="button" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <a href="#login" className="btn btn-ghost btn-sm">
                    Sign in
                  </a>
                  <a href="#signup" className="btn btn-outline btn-sm">
                    Sign up
                  </a>
                </>
              )}
            </div>
            <button className="mobile-menu-toggle" onClick={toggleMobile}>
              ☰
            </button>
          </div>
        </div>
      </header>
      <div className={`mobile-nav-drawer${mobileOpen ? " open" : ""}`}>
        {[
          ["#explore", "Explore Deals"],
          ["#roi-calculator", "ROI Simulator"],
          ["#list-property", "List Your Property"],
          ["#owner-dashboard", "Landlord Dashboard"],
          ["#operator-dashboard", "Operator Hub"],
          ["#admin-panel", "Admin Panel"],
          ["#pricing", "Pricing & Plans"],
          ["#resources", "Legal & Resources"],
          ["#login", "Sign in"],
          ["#signup", "Sign up"]
        ].map(([href, label]) => (
          <a key={href} href={href} className="nav-link" onClick={closeMobile}>
            {label}
          </a>
        ))}
      </div>
    </>
  );
}
