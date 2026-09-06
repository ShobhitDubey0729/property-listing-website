import { formatINR } from "../utils/format.js";
import { useStore } from "../context/StoreContext.jsx";
import { useUi } from "../context/UiContext.jsx";

export function CompareBar() {
  const { store, compareList } = useStore();
  const { openCompare } = useUi();
  const count = compareList.length;
  if (count === 0) return null;
  const props = compareList.map((id) => store.getPropertyById(id)).filter(Boolean);

  return (
    <div id="compare-sticky-bar" className="compare-bar active">
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span className="badge badge-str">{count}/3 Selected</span>
        <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-main)" }}>Compare Deals Side-by-Side</span>
      </div>
      <div className="compare-thumbs">
        {props.map((p) => (
          <div className="compare-thumb-item" title={p.title} key={p.id}>
            <img src={p.images?.[0]} className="compare-thumb-img" alt="" />
            <div className="compare-thumb-remove" onClick={() => store.toggleCompare(p.id)}>
              ×
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <button className="btn btn-primary btn-sm" onClick={openCompare}>
          Compare Now →
        </button>
        <button className="btn btn-ghost btn-sm" onClick={() => store.clearCompare()}>
          Clear
        </button>
      </div>
    </div>
  );
}

export function CompareModal() {
  const { store, compareList, favorites } = useStore();
  const { compareOpen, closeCompare } = useUi();
  if (!compareOpen) return null;

  const list = compareList.length > 0 ? compareList : favorites.slice(0, 3);
  const props = list.map((id) => store.getPropertyById(id)).filter(Boolean);
  if (props.length === 0) {
    return (
      <div className="modal-overlay active" onClick={closeCompare}>
        <div className="modal-container" style={{ maxWidth: 420 }}>
          <div className="modal-header">
            <h3 className="modal-title">Compare deals</h3>
            <button className="modal-close-btn" onClick={closeCompare}>
              &times;
            </button>
          </div>
          <div className="modal-body">
            <p>Select at least 1 property to compare.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay active" id="compare-modal">
      <div className="modal-container" style={{ maxWidth: 960 }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span className="badge badge-roi">Deal Matrix</span>
            <h3 className="modal-title">Side-by-Side Arbitrage Comparison</h3>
          </div>
          <button className="modal-close-btn" onClick={closeCompare}>
            &times;
          </button>
        </div>
        <div className="modal-body" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border-medium)" }}>
                <th style={{ padding: "1rem", width: "25%", color: "var(--text-subtle)" }}>Feature / Metric</th>
                {props.map((p) => (
                  <th key={p.id} style={{ padding: "1rem", width: `${75 / props.length}%`, verticalAlign: "top" }}>
                    <img src={p.images?.[0]} alt="" style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: "var(--radius-md)", marginBottom: "0.5rem" }} />
                    <h4 style={{ fontSize: "0.95rem", lineHeight: 1.3 }}>{p.title}</h4>
                    <div className="text-xs text-muted" style={{ marginTop: "0.2rem" }}>
                      {p.locality}, {p.city}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", background: "var(--primary-subtle)" }}>
                <td style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Est. Annual ROI %</td>
                {props.map((p) => (
                  <td key={p.id} style={{ padding: "0.85rem 1rem", fontWeight: 800, fontSize: "1.1rem", color: "var(--success)" }}>
                    {p.est_annual_roi_pct}%
                  </td>
                ))}
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "0.85rem 1rem", fontWeight: 600, color: "var(--text-muted)" }}>Monthly Master Lease</td>
                {props.map((p) => (
                  <td key={p.id} style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>
                    {formatINR(p.monthly_rent)}
                  </td>
                ))}
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "0.85rem 1rem", fontWeight: 600, color: "var(--text-muted)" }}>Est. Nightly ADR</td>
                {props.map((p) => (
                  <td key={p.id} style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "var(--primary)" }}>
                    ₹{p.est_nightly_rate?.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "0.85rem 1rem", fontWeight: 600, color: "var(--text-muted)" }}>Bedrooms & Size</td>
                {props.map((p) => (
                  <td key={p.id} style={{ padding: "0.85rem 1rem" }}>
                    {p.bedrooms} BHK ({p.area_sqft} sqft)
                  </td>
                ))}
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "0.85rem 1rem", fontWeight: 600, color: "var(--text-muted)" }}>Furnishing Status</td>
                {props.map((p) => (
                  <td key={p.id} style={{ padding: "0.85rem 1rem" }}>
                    {p.furnishing_status}
                  </td>
                ))}
              </tr>
              <tr>
                <td style={{ padding: "1rem" }} />
                {props.map((p) => (
                  <td key={p.id} style={{ padding: "1rem" }}>
                    <a href={`#detail/${p.id}`} className="btn btn-primary btn-sm" style={{ width: "100%" }} onClick={closeCompare}>
                      View Full Analysis
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
