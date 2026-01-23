import { useState } from 'react';
import { ThemeProvider } from './hooks/useTheme';
import { ScanProvider, useScanContext, HostInfo } from './hooks/useScan';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import TopologyView from './pages/TopologyView';
import DeviceList from './pages/DeviceList';
import Settings from './pages/Settings';
import DeviceDetailModal from './components/devices/DeviceDetailModal';

type Page = 'dashboard' | 'topology' | 'devices' | 'settings';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedDevice, setSelectedDevice] = useState<HostInfo | null>(null);
  const { scan, isScanning } = useScanContext();

  const handleDeviceSelect = (device: HostInfo) => {
    setSelectedDevice(device);
  };

  const handleCloseModal = () => {
    setSelectedDevice(null);
  };

  const handleScan = () => {
    scan();
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onDeviceClick={handleDeviceSelect} />;
      case 'topology':
        return <TopologyView onDeviceClick={handleDeviceSelect} />;
      case 'devices':
        return <DeviceList onDeviceClick={handleDeviceSelect} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onDeviceClick={handleDeviceSelect} />;
    }
  };

  return (
    <div className="flex h-screen bg-bg-primary">
      {/* Sidebar */}
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        onScan={handleScan}
        isScanning={isScanning}
      />
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {renderPage()}
      </main>

      {/* Device Detail Modal */}
      <DeviceDetailModal device={selectedDevice} onClose={handleCloseModal} />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ScanProvider>
        <AppContent />
      </ScanProvider>
    </ThemeProvider>
  );
}

export default App;
