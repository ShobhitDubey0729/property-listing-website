export function formatINR(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount || 0);
}

export function formatStatMoney(n) {
  if (n == null || Number.isNaN(Number(n))) return "—";
  const v = Number(n);
  if (Math.abs(v) >= 100000) return "₹" + (v / 100000).toFixed(1) + "L";
  return formatINR(v);
}

export const DEMO_ACCOUNTS = {
  operator: { email: "operator@proplease.local", password: "password123" },
  owner: { email: "owner@proplease.local", password: "password123" },
  admin: { email: "admin@proplease.local", password: "password123" }
};

export function navigate(hash) {
  window.location.hash = hash;
}
