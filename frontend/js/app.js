/**
 * PropLease App Entry Point & Event Delegation
 */

document.addEventListener("DOMContentLoaded", async () => {
  window.Toast.init();
  window.addEventListener("hashchange", window.route);

  window.store.subscribe((event, payload) => {
    const hash = window.location.hash || "#";

    if (event === "filterChanged" && hash === "#explore") {
      const appRoot = document.getElementById("app-root");
      if (appRoot) appRoot.innerHTML = window.renderExploreView();
    }

    if (event === "propertiesLoaded" && (hash === "#explore" || hash === "#home" || hash === "" || hash === "#")) {
      window.route();
    }

    if (event === "favoritesChanged") {
      document.querySelectorAll(`[data-action="toggle-favorite"][data-id="${payload.propertyId}"]`).forEach((btn) => {
        if (payload.isFavorite) {
          btn.classList.add("active");
          const svg = btn.querySelector("svg");
          if (svg) svg.setAttribute("fill", "currentColor");
        } else {
          btn.classList.remove("active");
          const svg = btn.querySelector("svg");
          if (svg) svg.setAttribute("fill", "none");
        }
      });
      window.Toast.success(payload.isFavorite ? "Property added to Shortlist" : "Removed from Shortlist");
    }

    if (event === "compareChanged") {
      window.renderCompareBar();
      if (payload.propertyId) {
        document.querySelectorAll(`[data-action="toggle-compare"][data-id="${payload.propertyId}"]`).forEach((btn) => {
          if (payload.added) btn.classList.add("active");
          else btn.classList.remove("active");
        });
        if (payload.added) {
          window.Toast.info(`Added to comparison (${payload.count}/3)`);
        }
      }
    }

    if (event === "roleChanged") {
      updateRoleUI(payload, { silent: false });
      if (window.updateAuthHeader) window.updateAuthHeader();
    }
  });

  document.addEventListener("click", (e) => {
    const favBtn = e.target.closest('[data-action="toggle-favorite"]');
    if (favBtn) {
      e.preventDefault();
      e.stopPropagation();
      const propId = favBtn.getAttribute("data-id");
      if (propId) window.store.toggleFavorite(propId);
      return;
    }

    const compBtn = e.target.closest('[data-action="toggle-compare"]');
    if (compBtn) {
      e.preventDefault();
      e.stopPropagation();
      const propId = compBtn.getAttribute("data-id");
      if (propId) {
        const res = window.store.toggleCompare(propId);
        if (!res.success && res.reason) window.Toast.warning(res.reason);
      }
      return;
    }

    const mapBtn = e.target.closest('[data-action="view-map"]');
    if (mapBtn) {
      e.preventDefault();
      e.stopPropagation();
      const propId = mapBtn.getAttribute("data-id");
      if (propId && window.openPropertyMapPopup) window.openPropertyMapPopup(propId, e);
    }
  });

  await window.store.bootstrap();
  setupRoleSwitcher();
  if (window.updateAuthHeader) window.updateAuthHeader();
  window.route();
});

function setupRoleSwitcher() {
  updateRoleUI(window.store.currentRole, { silent: true });
}

async function setRoleMode(role) {
  try {
    await window.store.loginDemo(role);
    window.Toast.info(`Signed in as ${role} demo account`);
    if (role === "owner") window.location.hash = "#owner-dashboard";
    else if (role === "admin") window.location.hash = "#admin-panel";
    else window.location.hash = "#explore";
    window.route();
  } catch (err) {
    window.Toast.warning(err.message || "Could not sign in to demo account");
    window.location.hash = "#login";
  }
}

function updateRoleUI(role, opts = {}) {
  document.querySelectorAll(".role-btn").forEach((btn) => {
    if (btn.getAttribute("data-role") === role) btn.classList.add("active");
    else btn.classList.remove("active");
  });

  const portalLink = document.getElementById("nav-portal-link");
  if (portalLink) {
    if (role === "owner") {
      portalLink.textContent = "Landlord Dashboard";
      portalLink.setAttribute("href", "#owner-dashboard");
    } else if (role === "admin") {
      portalLink.textContent = "Admin Control";
      portalLink.setAttribute("href", "#admin-panel");
    } else {
      portalLink.textContent = "Operator Hub";
      portalLink.setAttribute("href", "#operator-dashboard");
    }
  }
}

function toggleMobileMenu() {
  const drawer = document.getElementById("mobile-nav-drawer");
  if (drawer) drawer.classList.toggle("open");
}

window.setRoleMode = setRoleMode;
window.toggleMobileMenu = toggleMobileMenu;
window.updateRoleUI = updateRoleUI;
