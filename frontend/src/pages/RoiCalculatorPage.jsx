import { useMemo, useState } from "react";
import { formatINR } from "../utils/format.js";

export function RoiCalculatorPage() {
  const [lease, setLease] = useState(80000);
  const [adr, setAdr] = useState(7500);
  const [occ, setOcc] = useState(72);
  const [setup, setSetup] = useState(150000);
  const [depMonths, setDepMonths] = useState(2);

  const calc = useMemo(() => {
    const nights = (30 * occ) / 100;
    const grossRev = Math.round(adr * nights);
    const otaFee = Math.round(grossRev * 0.035);
    const utilities = Math.round(5000 + lease * 0.03);
    const cleaning = Math.round(grossRev * 0.09);
    const totalOpex = otaFee + utilities + cleaning;
    const netMonthly = grossRev - lease - totalOpex;
    const annualNet = netMonthly * 12;
    const totalUpfront = setup + lease * depMonths;
    const roi = totalUpfront > 0 ? Math.round((annualNet / totalUpfront) * 100) : 0;
    const paybackMonths = netMonthly > 0 ? (totalUpfront / netMonthly).toFixed(1) : "N/A";
    const margin = grossRev > 0 ? ((netMonthly / grossRev) * 100).toFixed(1) : 0;
    return { nights, grossRev, otaFee, utilities, cleaning, netMonthly, annualNet, roi, paybackMonths, margin };
  }, [lease, adr, occ, setup, depMonths]);

  return (
    <div className="container" style={{ paddingTop: "2rem", paddingBottom: "5rem" }}>
      <div style={{ textAlign: "center", maxWidth: 800, margin: "0 auto 3rem" }}>
        <span className="badge badge-roi" style={{ marginBottom: "0.5rem" }}>
          STR Investment Tool
        </span>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>Rental Arbitrage Profitability Simulator</h1>
        <p style={{ fontSize: "1.05rem", color: "var(--text-muted)" }}>
          Calculate your exact cash-on-cash return, payback period, and monthly net cash flow before signing a master lease.
        </p>
      </div>
      <div className="grid grid-2 gap-8" style={{ alignItems: "flex-start" }}>
        <div className="glass-panel" style={{ padding: "2.25rem" }}>
          <h3 style={{ marginBottom: "1.5rem" }}>⚙️ Deal Parameters</h3>
          <div className="form-group">
            <div className="range-header">
              <span className="form-label" style={{ margin: 0 }}>
                Monthly Lease Paid to Landlord
              </span>
              <span className="range-val">{formatINR(lease)}</span>
            </div>
            <input type="range" min="30000" max="300000" step="5000" value={lease} onChange={(e) => setLease(parseInt(e.target.value, 10))} />
          </div>
          <div className="form-group">
            <div className="range-header">
              <span className="form-label" style={{ margin: 0 }}>
                Expected Nightly ADR (Airbnb / Booking.com)
              </span>
              <span className="range-val">₹{adr.toLocaleString()}</span>
            </div>
            <input type="range" min="2000" max="30000" step="250" value={adr} onChange={(e) => setAdr(parseInt(e.target.value, 10))} />
          </div>
          <div className="form-group">
            <div className="range-header">
              <span className="form-label" style={{ margin: 0 }}>
                Monthly Occupancy Rate %
              </span>
              <span className="range-val">
                {occ}% ({((30 * occ) / 100).toFixed(1)} nights)
              </span>
            </div>
            <input type="range" min="40" max="95" step="1" value={occ} onChange={(e) => setOcc(parseInt(e.target.value, 10))} />
          </div>
          <div className="form-group">
            <div className="range-header">
              <span className="form-label" style={{ margin: 0 }}>
                Upfront Setup & Furnishing Budget
              </span>
              <span className="range-val">{formatINR(setup)}</span>
            </div>
            <input type="range" min="0" max="600000" step="10000" value={setup} onChange={(e) => setSetup(parseInt(e.target.value, 10))} />
          </div>
          <div className="form-group">
            <label className="form-label">Security Deposit (Months of Rent)</label>
            <select className="form-select" value={depMonths} onChange={(e) => setDepMonths(parseInt(e.target.value, 10))}>
              <option value={2}>2 Months Rent (Standard)</option>
              <option value={3}>3 Months Rent</option>
              <option value={4}>4 Months Rent</option>
            </select>
          </div>
        </div>
        <div>
          <div className="glass-panel-glow glass-panel" style={{ padding: "2rem", marginBottom: "1.5rem", textAlign: "center" }}>
            <span style={{ fontSize: "0.85rem", textTransform: "uppercase", fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em" }}>
              Projected Monthly Net Cash Flow
            </span>
            <div style={{ fontFamily: "var(--font-heading)", fontSize: "3rem", fontWeight: 800, color: calc.netMonthly >= 0 ? "var(--success)" : "var(--danger)", margin: "0.5rem 0" }}>
              {formatINR(calc.netMonthly)}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
              <div>
                <span className="text-xs text-muted">Annual Net Profit</span>
                <p style={{ fontSize: "1.25rem", fontWeight: 800 }}>{formatINR(calc.annualNet)}</p>
              </div>
              <div>
                <span className="text-xs text-muted">Cash-on-Cash ROI</span>
                <p style={{ fontSize: "1.25rem", fontWeight: 800, color: calc.roi >= 0 ? "var(--primary)" : "var(--danger)" }}>{calc.roi}%</p>
              </div>
              <div>
                <span className="text-xs text-muted">Payback Period</span>
                <p style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--secondary)" }}>
                  {calc.paybackMonths === "N/A" ? "Negative Return" : `${calc.paybackMonths} Months`}
                </p>
              </div>
            </div>
          </div>
          <div className="glass-panel" style={{ padding: "1.75rem" }}>
            <h4 style={{ marginBottom: "1rem" }}>Monthly Financial Statement</h4>
            <div className="roi-calc-row">
              <span>Gross Rental Revenue ({calc.nights.toFixed(1)} nights × ₹{adr.toLocaleString()}):</span>
              <strong>{formatINR(calc.grossRev)}</strong>
            </div>
            <div className="roi-calc-row">
              <span>- Fixed Master Lease Rent:</span>
              <strong style={{ color: "var(--danger)" }}>-{formatINR(lease)}</strong>
            </div>
            <div className="roi-calc-row">
              <span>- OTA Commissions (Airbnb 3% + PG):</span>
              <span style={{ color: "var(--danger)" }}>-{formatINR(calc.otaFee)}</span>
            </div>
            <div className="roi-calc-row">
              <span>- Utilities (Electricity, High-speed Wifi, Water):</span>
              <span style={{ color: "var(--danger)" }}>-{formatINR(calc.utilities)}</span>
            </div>
            <div className="roi-calc-row">
              <span>- Turnaround Cleaning, Laundry & Consumables:</span>
              <span style={{ color: "var(--danger)" }}>-{formatINR(calc.cleaning)}</span>
            </div>
            <div className="roi-calc-row" style={{ borderTop: "1px solid var(--border-medium)", marginTop: "0.5rem", paddingTop: "0.75rem" }}>
              <strong>Net Monthly Operating Margin:</strong>
              <strong style={{ color: "var(--success)", fontSize: "1.1rem" }}>{calc.margin}%</strong>
            </div>
          </div>
          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <a href="#explore" className="btn btn-primary btn-lg" style={{ width: "100%" }}>
              Find Properties Matching These Numbers →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
