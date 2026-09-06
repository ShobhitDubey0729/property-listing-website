import { useSyncExternalStore } from "react";

export function useHash() {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener("hashchange", cb);
      return () => window.removeEventListener("hashchange", cb);
    },
    () => window.location.hash || "#",
    () => "#"
  );
}

export function parseRoute(hash) {
  const raw = hash || "#";
  if (raw === "" || raw === "#" || raw === "#home" || raw === "#/") return { name: "home" };
  if (raw === "#login") return { name: "login" };
  if (raw === "#signup") return { name: "signup" };
  if (raw === "#explore") return { name: "explore" };
  if (raw.startsWith("#detail/")) return { name: "detail", id: raw.replace("#detail/", "") };
  if (raw === "#list-property") return { name: "list-property" };
  if (raw === "#owner-dashboard") return { name: "owner-dashboard" };
  if (raw === "#operator-dashboard") return { name: "operator-dashboard" };
  if (raw === "#admin-panel") return { name: "admin-panel" };
  if (raw === "#roi-calculator") return { name: "roi-calculator" };
  if (raw === "#pricing") return { name: "pricing" };
  if (raw === "#resources") return { name: "resources" };
  return { name: "home" };
}
