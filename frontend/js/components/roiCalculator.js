/**
 * PropLease Standalone Rental Arbitrage ROI & Deal Profitability Simulator
 */

function renderRoiCalculatorView() {
  return `
    <div class="container" style="padding-top: 2rem; padding-bottom: 5rem;">
      <div style="text-align: center; max-width: 800px; margin: 0 auto 3rem;">
        <span class="badge badge-roi" style="margin-bottom: 0.5rem;">STR Investment Tool</span>
        <h1 style="font-size: clamp(2rem, 4vw, 3rem);">Rental Arbitrage Profitability Simulator</h1>
        <p style="font-size: 1.05rem; color: var(--text-muted);">
          Calculate your exact cash-on-cash return, payback period, and monthly net cash flow before signing a master lease.
        </p>
      </div>

      <div class="grid grid-2 gap-8" style="align-items: flex-start;">
        <!-- Left: Sliders and Inputs -->
        <div class="glass-panel" style="padding: 2.25rem;">
          <h3 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>⚙️</span> Deal Parameters
          </h3>

          <!-- Monthly Lease -->
          <div class="form-group">
            <div class="range-header">
              <span class="form-label" style="margin: 0;">Monthly Lease Paid to Landlord</span>
              <span class="range-val" id="calc-val-lease">₹80,000</span>
            </div>
            <input type="range" id="calc-slider-lease" min="30000" max="300000" step="5000" value="80000" oninput="runStandaloneCalc()" />
          </div>

          <!-- Nightly ADR -->
          <div class="form-group">
            <div class="range-header">
              <span class="form-label" style="margin: 0;">Expected Nightly ADR (Airbnb / Booking.com)</span>
              <span class="range-val" id="calc-val-adr">₹7,500</span>
            </div>
            <input type="range" id="calc-slider-adr" min="2000" max="30000" step="250" value="7500" oninput="runStandaloneCalc()" />
          </div>

          <!-- Occupancy Rate -->
          <div class="form-group">
            <div class="range-header">
              <span class="form-label" style="margin: 0;">Monthly Occupancy Rate %</span>
              <span class="range-val" id="calc-val-occ">72% (21.6 nights)</span>
            </div>
            <input type="range" id="calc-slider-occ" min="40" max="95" step="1" value="72" oninput="runStandaloneCalc()" />
          </div>

          <!-- Upfront Furnishing / Setup -->
          <div class="form-group">
            <div class="range-header">
              <span class="form-label" style="margin: 0;">Upfront Setup & Furnishing Budget</span>
              <span class="range-val" id="calc-val-setup">₹1,50,000</span>
            </div>
            <input type="range" id="calc-slider-setup" min="0" max="600000" step="10000" value="150000" oninput="runStandaloneCalc()" />
          </div>

          <!-- Security Deposit (Months) -->
          <div class="form-group">
            <label class="form-label">Security Deposit (Months of Rent)</label>
            <select class="form-select" id="calc-deposit-months" onchange="runStandaloneCalc()">
              <option value="2" selected>2 Months Rent (Standard)</option>
              <option value="3">3 Months Rent</option>
              <option value="4">4 Months Rent</option>
            </select>
          </div>
        </div>

        <!-- Right: Real-time Cashflow & Returns Breakdown -->
        <div>
          <!-- Big Highlight Banner -->
          <div class="glass-panel-glow glass-panel" style="padding: 2rem; margin-bottom: 1.5rem; text-align: center;">
            <span style="font-size: 0.85rem; text-transform: uppercase; font-weight: 700; color: var(--text-muted); letter-spacing: 0.05em;">Projected Monthly Net Cash Flow</span>
            <div id="calc-res-monthly-net" style="font-family: var(--font-heading); font-size: 3rem; font-weight: 800; color: var(--success); margin: 0.5rem 0;">
              ₹54,000
            </div>
            <div style="display: flex; justify-content: center; gap: 1.5rem; margin-top: 1rem; flex-wrap: wrap;">
              <div>
                <span class="text-xs text-muted">Annual Net Profit</span>
                <p id="calc-res-annual-net" style="font-size: 1.25rem; font-weight: 800; color: var(--text-main);">₹6,48,000</p>
              </div>
              <div>
                <span class="text-xs text-muted">Cash-on-Cash ROI</span>
                <p id="calc-res-roi" style="font-size: 1.25rem; font-weight: 800; color: var(--primary);">185%</p>
              </div>
              <div>
                <span class="text-xs text-muted">Payback Period</span>
                <p id="calc-res-payback" style="font-size: 1.25rem; font-weight: 800; color: var(--secondary);">6.5 Months</p>
              </div>
            </div>
          </div>

          <!-- Detailed Monthly Statement -->
          <div class="glass-panel" style="padding: 1.75rem;">
            <h4 style="margin-bottom: 1rem;">Monthly Financial Statement</h4>
            
            <div class="roi-calc-row">
              <span>Gross Rental Revenue (21.6 nights × ₹7,500):</span>
              <strong style="color: var(--text-main);" id="calc-res-gross">₹1,62,000</strong>
            </div>

            <div class="roi-calc-row">
              <span>- Fixed Master Lease Rent:</span>
              <strong style="color: var(--danger);" id="calc-res-lease">-₹80,000</strong>
            </div>

            <div class="roi-calc-row">
              <span>- OTA Commissions (Airbnb 3% + PG):</span>
              <span style="color: var(--danger);" id="calc-res-ota">-₹5,670</span>
            </div>

            <div class="roi-calc-row">
              <span>- Utilities (Electricity, High-speed Wifi, Water):</span>
              <span style="color: var(--danger);" id="calc-res-util">-₹7,500</span>
            </div>

            <div class="roi-calc-row">
              <span>- Turnaround Cleaning, Laundry & Consumables:</span>
              <span style="color: var(--danger);" id="calc-res-clean">-₹14,830</span>
            </div>

            <div class="roi-calc-row" style="border-top: 1px solid var(--border-medium); margin-top: 0.5rem; padding-top: 0.75rem;">
              <strong style="color: var(--text-main);">Net Monthly Operating Margin:</strong>
              <strong style="color: var(--success); font-size: 1.1rem;" id="calc-res-margin">33.3%</strong>
            </div>
          </div>

          <!-- Action CTA -->
          <div style="margin-top: 1.5rem; text-align: center;">
            <a href="#explore" class="btn btn-primary btn-lg" style="width: 100%;">
              Find Properties Matching These Numbers →
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

function runStandaloneCalc() {
  const lease = parseInt(document.getElementById("calc-slider-lease")?.value || 80000, 10);
  const adr = parseInt(document.getElementById("calc-slider-adr")?.value || 7500, 10);
  const occ = parseInt(document.getElementById("calc-slider-occ")?.value || 72, 10);
  const setup = parseInt(document.getElementById("calc-slider-setup")?.value || 150000, 10);
  const depMonths = parseInt(document.getElementById("calc-deposit-months")?.value || 2, 10);

  // Update slider labels
  if (document.getElementById("calc-val-lease")) {
    document.getElementById("calc-val-lease").textContent = window.formatINR(lease);
    document.getElementById("calc-val-adr").textContent = "₹" + adr.toLocaleString();
    document.getElementById("calc-val-occ").textContent = `${occ}% (${((30 * occ)/100).toFixed(1)} nights)`;
    document.getElementById("calc-val-setup").textContent = window.formatINR(setup);
  }

  const nights = (30 * occ) / 100;
  const grossRev = Math.round(adr * nights);
  const otaFee = Math.round(grossRev * 0.035);
  const utilities = Math.round(5000 + (lease * 0.03));
  const cleaning = Math.round(grossRev * 0.09);
  const totalOpex = otaFee + utilities + cleaning;
  const netMonthly = grossRev - lease - totalOpex;
  const annualNet = netMonthly * 12;

  const totalUpfront = setup + (lease * depMonths);
  const roi = totalUpfront > 0 ? Math.round((annualNet / totalUpfront) * 100) : 0;
  const paybackMonths = netMonthly > 0 ? (totalUpfront / netMonthly).toFixed(1) : "N/A";
  const margin = grossRev > 0 ? ((netMonthly / grossRev) * 100).toFixed(1) : 0;

  if (document.getElementById("calc-res-monthly-net")) {
    document.getElementById("calc-res-monthly-net").textContent = window.formatINR(netMonthly);
    document.getElementById("calc-res-monthly-net").style.color = netMonthly >= 0 ? "var(--success)" : "var(--danger)";
    document.getElementById("calc-res-annual-net").textContent = window.formatINR(annualNet);
    document.getElementById("calc-res-roi").textContent = `${roi}%`;
    document.getElementById("calc-res-roi").style.color = roi >= 0 ? "var(--primary)" : "var(--danger)";
    document.getElementById("calc-res-payback").textContent = paybackMonths === "N/A" ? "Negative Return" : `${paybackMonths} Months`;
    
    document.getElementById("calc-res-gross").textContent = window.formatINR(grossRev);
    document.getElementById("calc-res-lease").textContent = `-${window.formatINR(lease)}`;
    document.getElementById("calc-res-ota").textContent = `-${window.formatINR(otaFee)}`;
    document.getElementById("calc-res-util").textContent = `-${window.formatINR(utilities)}`;
    document.getElementById("calc-res-clean").textContent = `-${window.formatINR(cleaning)}`;
    document.getElementById("calc-res-margin").textContent = `${margin}%`;
  }
}

window.renderRoiCalculatorView = renderRoiCalculatorView;
window.runStandaloneCalc = runStandaloneCalc;
