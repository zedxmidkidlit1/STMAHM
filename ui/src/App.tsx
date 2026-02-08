import { lazy, Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { ThemeProvider, useTheme } from "./hooks/useTheme";
import { ScanProvider, useScanContext, type HostInfo } from "./hooks/useScan";
import { useKeyboardShortcuts, SHORTCUTS } from "./hooks/useKeyboardShortcuts";
import Sidebar from "./components/layout/Sidebar";
import Titlebar from "./components/layout/Titlebar";
import TopHeader from "./components/layout/TopHeader";
import DeviceDetailModal from "./components/devices/DeviceDetailModal";
import WelcomeScreen, {
  useWelcomeScreen,
} from "./components/common/WelcomeScreen";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { ToastProvider } from "./components/common/Toast";
import DemoBanner from "./components/common/DemoBanner";
import { tauriClient } from "./lib/api/tauri-client";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const TopologyView = lazy(() => import("./pages/TopologyView"));
const DeviceList = lazy(() => import("./pages/DeviceList"));
const Settings = lazy(() => import("./pages/Settings"));
const Reports = lazy(() => import("./pages/Reports"));
const Vulnerabilities = lazy(() => import("./pages/Vulnerabilities"));
const Alerts = lazy(() => import("./pages/Alerts"));
const Tools = lazy(() => import("./pages/Tools"));
const ComponentDemo = lazy(() => import("./pages/ComponentDemo"));

type Page =
  | "dashboard"
  | "topology"
  | "devices"
  | "vulnerabilities"
  | "alerts"
  | "tools"
  | "reports"
  | "settings"
  | "profile"
  | "demo";

const PAGE_PATHS: Record<Page, string> = {
  dashboard: "/",
  topology: "/topology",
  devices: "/devices",
  vulnerabilities: "/vulnerabilities",
  alerts: "/alerts",
  tools: "/tools",
  reports: "/reports",
  settings: "/settings",
  profile: "/profile",
  demo: "/demo",
};

function pageFromPath(pathname: string): Page {
  const match = (Object.entries(PAGE_PATHS) as [Page, string][]).find(
    ([, path]) => path === pathname,
  );
  return match?.[0] ?? "dashboard";
}

function withSuspense(node: ReactNode) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center text-text-muted">
          Loading page...
        </div>
      }
    >
      {node}
    </Suspense>
  );
}

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>(() =>
    pageFromPath(window.location.pathname),
  );
  const [selectedDevice, setSelectedDevice] = useState<HostInfo | null>(null);
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);
  const { scan, stopScan, isScanning, scanStatus } = useScanContext();
  const { toggleTheme } = useTheme();
  const { shouldShow: showWelcome, markAsShown } = useWelcomeScreen();

  const fetchUnreadAlertsCount = async () => {
    try {
      const alerts = await tauriClient.getUnreadAlerts();
      setUnreadAlertsCount(alerts.filter((a) => !a.is_read).length);
    } catch {
      setUnreadAlertsCount(0);
    }
  };

  useEffect(() => {
    fetchUnreadAlertsCount();
  }, [currentPage]);

  useEffect(() => {
    const interval = setInterval(fetchUnreadAlertsCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setCurrentPage(pageFromPath(window.location.pathname));
    };

    const knownPaths = new Set(Object.values(PAGE_PATHS));
    if (!knownPaths.has(window.location.pathname)) {
      window.history.replaceState({ page: "dashboard" }, "", PAGE_PATHS.dashboard);
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useKeyboardShortcuts([
    { ...SHORTCUTS.DASHBOARD, handler: () => handlePageChange("dashboard") },
    { ...SHORTCUTS.TOPOLOGY, handler: () => handlePageChange("topology") },
    { ...SHORTCUTS.DEVICES, handler: () => handlePageChange("devices") },
    { ...SHORTCUTS.SETTINGS, handler: () => handlePageChange("settings") },
    { ...SHORTCUTS.SCAN, handler: () => !isScanning && scan() },
    { ...SHORTCUTS.TOGGLE_THEME, handler: toggleTheme },
  ]);

  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
    const nextPath = PAGE_PATHS[page];
    if (window.location.pathname !== nextPath) {
      window.history.pushState({ page }, "", nextPath);
    }
  };

  const renderedPage = useMemo(() => {
    switch (currentPage) {
      case "dashboard":
        return withSuspense(<Dashboard />);
      case "topology":
        return withSuspense(<TopologyView onDeviceClick={setSelectedDevice} />);
      case "devices":
        return withSuspense(<DeviceList onDeviceClick={setSelectedDevice} />);
      case "settings":
        return withSuspense(<Settings />);
      case "demo":
        return withSuspense(<ComponentDemo />);
      case "vulnerabilities":
        return withSuspense(<Vulnerabilities />);
      case "alerts":
        return withSuspense(<Alerts />);
      case "tools":
        return withSuspense(<Tools />);
      case "reports":
        return withSuspense(<Reports />);
      default:
        return withSuspense(<Dashboard />);
    }
  }, [currentPage]);

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      {showWelcome && (
        <WelcomeScreen
          onStartScan={() => {
            markAsShown();
            void scan();
          }}
          isScanning={isScanning}
        />
      )}

      <Sidebar currentPage={currentPage} onNavigate={handlePageChange} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Titlebar />
        <DemoBanner />
        <TopHeader
          currentPage={currentPage}
          isScanning={isScanning}
          scanStatus={scanStatus}
          onStartScan={() => void scan()}
          onStopScan={stopScan}
          onNavigateToAlerts={() => handlePageChange("alerts")}
          unreadAlertsCount={unreadAlertsCount}
        />

        <main className="flex-1 overflow-auto">{renderedPage}</main>
      </div>

      <DeviceDetailModal device={selectedDevice} onClose={() => setSelectedDevice(null)} />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ScanProvider>
          <AppContent />
          <ToastProvider />
        </ScanProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
