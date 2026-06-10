import React, { useState, useEffect } from "react";
import { useStore } from "./store";
import { CustomerInterface } from "./components/CustomerInterface";
import { LoginScreen } from "./components/LoginScreen";
import { StaffShell } from "./components/StaffShell";
import { UnifiedRoleNavigator } from "./components/UnifiedRoleNavigator";
import { Toaster } from "sonner";

// Dynamic view layout sub-modules
import { DashboardLive } from "./components/DashboardLive";
import { DashboardTables } from "./components/DashboardTables";
import { DashboardActiveOrders } from "./components/DashboardActiveOrders";
import { DashboardMenu } from "./components/DashboardMenu";
import { DashboardOffers } from "./components/DashboardOffers";
import { DashboardStock } from "./components/DashboardStock";
import { DashboardBills } from "./components/DashboardBills";
import { DashboardReports } from "./components/DashboardReports";
import { DashboardQRCodes } from "./components/DashboardQRCodes";
import { DashboardSettings } from "./components/DashboardSettings";

export default function App() {
  // Authentication states
  const currentUser = useStore(state => state.currentUser);
  const isAuthenticated = !!currentUser;
  
  // Simple robust state router for preview iframe reliability
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [currentSearch, setCurrentSearch] = useState(window.location.search);
  const activeTab = useStore(state => state.activeTab);
  const setActiveTab = useStore(state => state.setActiveTab);

  useEffect(() => {
    // Coordinate browser navigation events
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
      setCurrentSearch(window.location.search);
    };

    window.addEventListener("popstate", handleLocationChange);
    // Listen to store triggers too
    const interval = setInterval(handleLocationChange, 400);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      clearInterval(interval);
    };
  }, []);

  // Determine view mode: User scans QR vs. Staff dashboard
  const params = new URLSearchParams(currentSearch);
  const tableParam = params.get("table");

  // If a table is scanned or URL parameters demand Customer portal
  const isCustomerPortal = tableParam !== null || currentPath.includes("/menu");

  if (isCustomerPortal) {
    const tableNum = tableParam ? parseInt(tableParam, 10) : 1;
    return (
      <>
        <CustomerInterface currentTableNum={tableNum} />
        <Toaster richColors closeButton position="top-right" toastOptions={{ style: { borderLeft: "4px solid #D4AF37", background: "#FAF7F2", fontFamily: "Inter, sans-serif" } }} />
      </>
    );
  }

  // Otherwise, render core Staff and Administrative Hub
  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen />
        <UnifiedRoleNavigator />
        <Toaster richColors closeButton position="top-right" toastOptions={{ style: { borderLeft: "4px solid #D4AF37", background: "#FAF7F2", fontFamily: "Inter, sans-serif" } }} />
      </>
    );
  }

  // Main dashboard layout selector
  const renderTabContent = () => {
    switch (activeTab) {
      case "live":
        return <DashboardLive />;
      case "tables":
        return <DashboardTables />;
      case "checkout":
        return <DashboardActiveOrders />;
      case "menu":
        return <DashboardMenu />;
      case "offers":
        return <DashboardOffers />;
      case "stock":
        return <DashboardStock />;
      case "archive":
        return <DashboardBills />;
      case "stats":
        return <DashboardReports />;
      case "qr":
        return <DashboardQRCodes />;
      case "config":
        return <DashboardSettings />;
      default:
        return <DashboardLive />;
    }
  };

  return (
    <>
      <StaffShell activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderTabContent()}
      </StaffShell>
      <UnifiedRoleNavigator />
      <Toaster richColors closeButton position="top-right" toastOptions={{ style: { borderLeft: "4px solid #D4AF37", background: "#FAF7F2", fontFamily: "Inter, sans-serif" } }} />
    </>
  );
}
