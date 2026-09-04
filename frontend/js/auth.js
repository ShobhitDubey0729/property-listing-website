/**
 * PropLease authentication helpers (backend JWT is authoritative)
 */

const DEMO_ACCOUNTS = {
  operator: { email: "operator@proplease.local", password: "password123" },
  owner: { email: "owner@proplease.local", password: "password123" },
  admin: { email: "admin@proplease.local", password: "password123" }
};

function renderAuthViews(mode) {
  const isSignup = mode === "signup";
  return `
    <div class="container" style="padding: 3rem 0 5rem; max-width: 480px;">
      <div class="glass-panel" style="padding: 2rem;">
        <span class="badge badge-str" style="margin-bottom: 0.75rem;">Account</span>
        <h1 style="margin-bottom: 0.5rem;">${isSignup ? "Create your PropLease account" : "Sign in"}</h1>
        <p class="text-sm" style="margin-bottom: 1.5rem;">
          Roles are enforced by the server. Switching the header buttons logs into a demo account; it cannot grant admin rights by itself.
        </p>
        <form onsubmit="${isSignup ? "handleSignupSubmit(event)" : "handleLoginSubmit(event)"}">
          ${isSignup ? `
            <div class="form-group">
              <label class="form-label">Full name</label>
              <input class="form-control" name="name" required placeholder="Your name" />
            </div>
            <div class="form-group">
              <label class="form-label">I am a</label>
              <select class="form-select" name="role">
                <option value="operator">STR Operator</option>
                <option value="owner">Property Owner / Landlord</option>
              </select>
            </div>
          ` : ""}
          <div class="form-group">
            <label class="form-label">Email</label>
            <input class="form-control" type="email" name="email" required placeholder="you@example.com" />
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input class="form-control" type="password" name="password" required minlength="6" />
          </div>
          ${isSignup ? `
            <div class="form-group">
              <label class="form-label">Phone (optional)</label>
              <input class="form-control" name="phone" placeholder="+91 ..." />
            </div>
          ` : ""}
          <button class="btn btn-primary" type="submit" style="width:100%;">${isSignup ? "Create account" : "Sign in"}</button>
        </form>
        <p class="text-sm" style="margin-top: 1.25rem;">
          ${isSignup
            ? `Already have an account? <a href="#login">Sign in</a>`
            : `New here? <a href="#signup">Create an account</a>`}
        </p>
        <div class="text-xs text-muted" style="margin-top: 1rem; line-height: 1.6;">
          Demo password <strong>password123</strong><br/>
          operator@proplease.local · owner@proplease.local · admin@proplease.local
        </div>
      </div>
    </div>
  `;
}

async function handleLoginSubmit(event) {
  event.preventDefault();
  const fd = new FormData(event.target);
  try {
    await window.store.login(fd.get("email"), fd.get("password"));
    window.Toast.success("Signed in");
    redirectAfterAuth();
  } catch (err) {
    window.Toast.warning(err.message || "Login failed");
  }
}

async function handleSignupSubmit(event) {
  event.preventDefault();
  const fd = new FormData(event.target);
  try {
    await window.store.signup({
      name: fd.get("name"),
      email: fd.get("email"),
      password: fd.get("password"),
      role: fd.get("role"),
      phone: fd.get("phone") || null
    });
    window.Toast.success("Account created");
    redirectAfterAuth();
  } catch (err) {
    window.Toast.warning(err.message || "Signup failed");
  }
}

function redirectAfterAuth() {
  const role = window.store.currentRole;
  if (role === "owner") window.location.hash = "#owner-dashboard";
  else if (role === "admin") window.location.hash = "#admin-panel";
  else window.location.hash = "#explore";
}

async function handleLogout() {
  await window.store.logout();
  window.Toast.info("Signed out");
  window.location.hash = "#home";
}

function updateAuthHeader() {
  const slot = document.getElementById("auth-slot");
  if (!slot) return;
  const user = window.store.currentUser;
  if (user) {
    slot.innerHTML = `
      <span class="text-xs text-muted" style="white-space:nowrap;">${user.name}</span>
      <button class="btn btn-ghost btn-sm" type="button" onclick="handleLogout()">Logout</button>
    `;
  } else {
    slot.innerHTML = `
      <a href="#login" class="btn btn-ghost btn-sm">Sign in</a>
      <a href="#signup" class="btn btn-outline btn-sm">Sign up</a>
    `;
  }
}

window.DEMO_ACCOUNTS = DEMO_ACCOUNTS;
window.renderAuthViews = renderAuthViews;
window.handleLoginSubmit = handleLoginSubmit;
window.handleSignupSubmit = handleSignupSubmit;
window.handleLogout = handleLogout;
window.updateAuthHeader = updateAuthHeader;
window.redirectAfterAuth = redirectAfterAuth;
