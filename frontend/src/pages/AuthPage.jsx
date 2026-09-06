import { useStore } from "../context/StoreContext.jsx";
import { useUi } from "../context/UiContext.jsx";

function redirectAfterAuth(role) {
  if (role === "owner") window.location.hash = "#owner-dashboard";
  else if (role === "admin") window.location.hash = "#admin-panel";
  else window.location.hash = "#explore";
}

export function AuthPage({ mode }) {
  const { store } = useStore();
  const { toast } = useUi();
  const isSignup = mode === "signup";

  async function handleSubmit(event) {
    event.preventDefault();
    const fd = new FormData(event.target);
    try {
      if (isSignup) {
        await store.signup({
          name: fd.get("name"),
          email: fd.get("email"),
          password: fd.get("password"),
          role: fd.get("role"),
          phone: fd.get("phone") || null
        });
        toast.success("Account created");
      } else {
        await store.login(fd.get("email"), fd.get("password"));
        toast.success("Signed in");
      }
      redirectAfterAuth(store.currentRole);
    } catch (err) {
      toast.warning(err.message || (isSignup ? "Signup failed" : "Login failed"));
    }
  }

  return (
    <div className="container" style={{ padding: "3rem 0 5rem", maxWidth: 480 }}>
      <div className="glass-panel" style={{ padding: "2rem" }}>
        <span className="badge badge-str" style={{ marginBottom: "0.75rem" }}>
          Account
        </span>
        <h1 style={{ marginBottom: "0.5rem" }}>{isSignup ? "Create your PropLease account" : "Sign in"}</h1>
        <p className="text-sm" style={{ marginBottom: "1.5rem" }}>
          Roles are enforced by the server. Switching the header buttons logs into a demo account; it cannot grant admin rights by itself.
        </p>
        <form onSubmit={handleSubmit}>
          {isSignup ? (
            <>
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input className="form-control" name="name" required placeholder="Your name" />
              </div>
              <div className="form-group">
                <label className="form-label">I am a</label>
                <select className="form-select" name="role">
                  <option value="operator">STR Operator</option>
                  <option value="owner">Property Owner / Landlord</option>
                </select>
              </div>
            </>
          ) : null}
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" name="email" required placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" name="password" required minLength={6} />
          </div>
          {isSignup ? (
            <div className="form-group">
              <label className="form-label">Phone (optional)</label>
              <input className="form-control" name="phone" placeholder="+91 ..." />
            </div>
          ) : null}
          <button className="btn btn-primary" type="submit" style={{ width: "100%" }}>
            {isSignup ? "Create account" : "Sign in"}
          </button>
        </form>
        <p className="text-sm" style={{ marginTop: "1.25rem" }}>
          {isSignup ? (
            <>
              Already have an account? <a href="#login">Sign in</a>
            </>
          ) : (
            <>
              New here? <a href="#signup">Create an account</a>
            </>
          )}
        </p>
        <div className="text-xs text-muted" style={{ marginTop: "1rem", lineHeight: 1.6 }}>
          Demo password <strong>password123</strong>
          <br />
          operator@proplease.local · owner@proplease.local · admin@proplease.local
        </div>
      </div>
    </div>
  );
}
