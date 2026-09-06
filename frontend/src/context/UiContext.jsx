import { createContext, useCallback, useContext, useMemo, useState } from "react";

const UiContext = createContext(null);

export function UiProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [mapPropertyId, setMapPropertyId] = useState(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [proposalPropertyId, setProposalPropertyId] = useState(null);
  const [contactModal, setContactModal] = useState(null);
  const [splitSelectedId, setSplitSelectedId] = useState(null);
  const [fullMapFocus, setFullMapFocus] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const showToast = useCallback((message, type = "info", duration = 3500) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const toast = useMemo(
    () => ({
      show: showToast,
      success: (msg) => showToast(msg, "success"),
      info: (msg) => showToast(msg, "info"),
      warning: (msg) => showToast(msg, "warning"),
      danger: (msg) => showToast(msg, "danger")
    }),
    [showToast]
  );

  const value = useMemo(
    () => ({
      toasts,
      toast,
      mapPropertyId,
      openMap: (id) => setMapPropertyId(id),
      closeMap: () => setMapPropertyId(null),
      compareOpen,
      openCompare: () => setCompareOpen(true),
      closeCompare: () => setCompareOpen(false),
      proposalPropertyId,
      openProposal: (id) => setProposalPropertyId(id),
      closeProposal: () => setProposalPropertyId(null),
      contactModal,
      openContact: (data) => setContactModal(data),
      closeContact: () => setContactModal(null),
      splitSelectedId,
      setSplitSelectedId,
      fullMapFocus,
      setFullMapFocus,
      mobileOpen,
      toggleMobile: () => setMobileOpen((v) => !v),
      closeMobile: () => setMobileOpen(false)
    }),
    [
      toasts,
      toast,
      mapPropertyId,
      compareOpen,
      proposalPropertyId,
      contactModal,
      splitSelectedId,
      fullMapFocus,
      mobileOpen
    ]
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUi must be used within UiProvider");
  return ctx;
}
