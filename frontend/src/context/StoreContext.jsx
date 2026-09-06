import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { store } from "../store.js";

const StoreContext = createContext(null);

function subscribe(callback) {
  return store.subscribe(callback);
}

function getSnapshot() {
  return store._tick || 0;
}

const origNotify = store.notify.bind(store);
store.notify = function (event, payload) {
  store._tick = (store._tick || 0) + 1;
  origNotify(event, payload);
};

export function StoreProvider({ children }) {
  const tick = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    store.bootstrap();
  }, []);

  const value = useMemo(
    () => ({
      store,
      tick,
      currentUser: store.currentUser,
      currentRole: store.currentRole,
      properties: store.properties,
      stats: store.stats,
      filters: store.filters,
      favorites: store.favorites,
      favoriteItems: store.favoriteItems,
      inquiries: store.inquiries,
      ownerListings: store.ownerListings,
      ownerInquiries: store.ownerInquiries,
      adminListings: store.adminListings,
      compareList: [...store.compareList],
      ready: store.ready
    }),
    [tick]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
