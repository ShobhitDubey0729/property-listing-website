/**
 * PropLease Property Comparison Modal & Bottom Sticky Tray
 */

function renderCompareBar() {
  const store = window.store;
  const count = store.compareList.length;
  let bar = document.getElementById("compare-sticky-bar");

  if (count === 0) {
    if (bar) bar.classList.remove("active");
    return;
  }

  if (!bar) {
    bar = document.createElement("div");
    bar.id = "compare-sticky-bar";
    bar.className = "compare-bar";
    document.body.appendChild(bar);
  }

  const props = store.compareList.map(id => store.getPropertyById(id)).filter(Boolean);

  bar.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.75rem;">
      <span class="badge badge-str">${count}/3 Selected</span>
      <span style="font-size: 0.9rem; font-weight: 700; color: var(--text-main);">Compare Deals Side-by-Side</span>
    </div>

    <div class="compare-thumbs">
      ${props.map(p => `
        <div class="compare-thumb-item" title="${p.title}">
          <img src="${p.images[0]}" class="compare-thumb-img" />
          <div class="compare-thumb-remove" onclick="window.store.toggleCompare('${p.id}')">×</div>
        </div>
      `).join('')}
    </div>

    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <button class="btn btn-primary btn-sm" onclick="openCompareDrawer()">
        Compare Now →
      </button>
      <button class="btn btn-ghost btn-sm" onclick="window.store.clearCompare()">
        Clear
      </button>
    </div>
  `;

  bar.classList.add("active");
}

function openCompareDrawer() {
  const store = window.store;
  const list = store.compareList.length > 0 ? store.compareList : store.favorites.slice(0, 3);
  const props = list.map(id => store.getPropertyById(id)).filter(Boolean);

  if (props.length === 0) {
    window.Toast.warning("Select at least 1 property to compare");
    return;
  }

  const modalHtml = `
    <div class="modal-overlay active" id="compare-modal">
      <div class="modal-container" style="max-width: 960px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="badge badge-roi">Deal Matrix</span>
            <h3 class="modal-title">Side-by-Side Arbitrage Comparison</h3>
          </div>
          <button class="modal-close-btn" onclick="closeModal('compare-modal')">&times;</button>
        </div>

        <div class="modal-body" style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
            <thead>
              <tr style="border-bottom: 2px solid var(--border-medium);">
                <th style="padding: 1rem; width: 25%; color: var(--text-subtle);">Feature / Metric</th>
                ${props.map(p => `
                  <th style="padding: 1rem; width: ${75 / props.length}%; vertical-align: top;">
                    <img src="${p.images[0]}" style="width: 100%; height: 110px; object-fit: cover; border-radius: var(--radius-md); margin-bottom: 0.5rem;" />
                    <h4 style="font-size: 0.95rem; line-height: 1.3;">${p.title}</h4>
                    <div class="text-xs text-muted" style="margin-top: 0.2rem;">${p.locality}, ${p.city}</div>
                  </th>
                `).join('')}
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid var(--border-subtle); background: var(--primary-subtle);">
                <td style="padding: 0.85rem 1rem; font-weight: 700;">Est. Annual ROI %</td>
                ${props.map(p => `<td style="padding: 0.85rem 1rem; font-weight: 800; font-size: 1.1rem; color: var(--success);">${p.est_annual_roi_pct}%</td>`).join('')}
              </tr>
              <tr style="border-bottom: 1px solid var(--border-subtle);">
                <td style="padding: 0.85rem 1rem; font-weight: 600; color: var(--text-muted);">Monthly Master Lease</td>
                ${props.map(p => `<td style="padding: 0.85rem 1rem; font-weight: 700; color: var(--text-main);">${window.formatINR(p.monthly_rent)}</td>`).join('')}
              </tr>
              <tr style="border-bottom: 1px solid var(--border-subtle);">
                <td style="padding: 0.85rem 1rem; font-weight: 600; color: var(--text-muted);">Est. Nightly ADR</td>
                ${props.map(p => `<td style="padding: 0.85rem 1rem; font-weight: 700; color: var(--primary);">₹${p.est_nightly_rate?.toLocaleString()}</td>`).join('')}
              </tr>
              <tr style="border-bottom: 1px solid var(--border-subtle);">
                <td style="padding: 0.85rem 1rem; font-weight: 600; color: var(--text-muted);">Bedrooms & Size</td>
                ${props.map(p => `<td style="padding: 0.85rem 1rem;">${p.bedrooms} BHK (${p.area_sqft} sqft)</td>`).join('')}
              </tr>
              <tr style="border-bottom: 1px solid var(--border-subtle);">
                <td style="padding: 0.85rem 1rem; font-weight: 600; color: var(--text-muted);">Furnishing Status</td>
                ${props.map(p => `<td style="padding: 0.85rem 1rem;">${p.furnishing_status}</td>`).join('')}
              </tr>
              <tr style="border-bottom: 1px solid var(--border-subtle);">
                <td style="padding: 0.85rem 1rem; font-weight: 600; color: var(--text-muted);">Society NOC Status</td>
                ${props.map(p => `<td style="padding: 0.85rem 1rem;"><span class="badge badge-verified">✓ 100% Pre-Approved</span></td>`).join('')}
              </tr>
              <tr style="border-bottom: 1px solid var(--border-subtle);">
                <td style="padding: 0.85rem 1rem; font-weight: 600; color: var(--text-muted);">Smart Lock Allowed</td>
                ${props.map(() => `<td style="padding: 0.85rem 1rem; color: var(--success);">Yes</td>`).join('')}
              </tr>
              <tr>
                <td style="padding: 1rem;"></td>
                ${props.map(p => `
                  <td style="padding: 1rem;">
                    <a href="#detail/${p.id}" class="btn btn-primary btn-sm" style="width: 100%;" onclick="closeModal('compare-modal')">
                      View Full Analysis
                    </a>
                  </td>
                `).join('')}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  const existing = document.getElementById("compare-modal");
  if (existing) existing.remove();

  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

window.renderCompareBar = renderCompareBar;
window.openCompareDrawer = openCompareDrawer;
