import { useEffect } from "react";
import { StoreProvider } from "./context/StoreContext.jsx";
import { UiProvider } from "./context/UiContext.jsx";
import { Header } from "./layout/Header.jsx";
import { Footer } from "./layout/Footer.jsx";
import { ToastStack } from "./components/ToastStack.jsx";
import { MapPopup } from "./components/MapPopup.jsx";
import { CompareBar, CompareModal } from "./components/CompareBar.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { ExplorePage } from "./pages/ExplorePage.jsx";
import { AuthPage } from "./pages/AuthPage.jsx";
import { PricingPage, ResourcesPage } from "./pages/StaticPages.jsx";
import { RoiCalculatorPage } from "./pages/RoiCalculatorPage.jsx";
import { PropertyDetailPage, ProposalModal, ContactModal } from "./pages/PropertyDetailPage.jsx";
import { ListingWizardPage } from "./pages/ListingWizardPage.jsx";
import { OwnerDashboardPage, OperatorDashboardPage, AdminPanelPage } from "./pages/Dashboards.jsx";
import { parseRoute, useHash } from "./utils/useHash.js";

function RouterView() {
  const hash = useHash();
  const route = parseRoute(hash);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [hash]);

  switch (route.name) {
    case "login":
      return <AuthPage mode="login" />;
    case "signup":
      return <AuthPage mode="signup" />;
    case "explore":
      return <ExplorePage />;
    case "detail":
      return <PropertyDetailPage propertyId={route.id} />;
    case "list-property":
      return <ListingWizardPage />;
    case "owner-dashboard":
      return <OwnerDashboardPage />;
    case "operator-dashboard":
      return <OperatorDashboardPage />;
    case "admin-panel":
      return <AdminPanelPage />;
    case "roi-calculator":
      return <RoiCalculatorPage />;
    case "pricing":
      return <PricingPage />;
    case "resources":
      return <ResourcesPage />;
    default:
      return <HomePage />;
  }
}

export default function App() {
  return (
    <StoreProvider>
      <UiProvider>
        <Header />
        <main id="app-root">
          <RouterView />
        </main>
        <Footer />
        <ToastStack />
        <MapPopup />
        <CompareBar />
        <CompareModal />
        <ProposalModal />
        <ContactModal />
      </UiProvider>
    </StoreProvider>
  );
}
