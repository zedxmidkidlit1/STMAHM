import { useState, useMemo } from 'react';
import { Search, WifiOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useScanContext, HostInfo } from '../hooks/useScan';
import DeviceCard from '../components/dashboard/DeviceCard';
import TabFilter from '../components/common/TabFilter';

interface DeviceListProps {
  onDeviceClick?: (device: HostInfo) => void;
}

const CARD =
  'rounded-2xl border border-slate-200/70 bg-white/85 backdrop-blur-sm shadow-sm dark:border-slate-800 dark:bg-slate-950/65';

export default function DeviceList({ onDeviceClick }: DeviceListProps) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const { scanResult, isScanning, tauriAvailable } = useScanContext();
  const devices = scanResult?.active_hosts ?? [];

  const isOnline = (device: HostInfo) => {
    if (device.response_time_ms !== null && device.response_time_ms !== undefined) {
      return true;
    }

    if ((device.open_ports?.length ?? 0) > 0) {
      return true;
    }

    const method = device.discovery_method.toUpperCase();
    return method.includes('ARP') || method.includes('TCP') || method === 'LOCAL';
  };
  
  // Calculate counts for tabs
  const onlineDevices = devices.filter(isOnline);
  const warningDevices = devices.filter(d => d.risk_score >= 50);
  const offlineDevices = devices.filter(d => !isOnline(d));
  
  // Filter devices based on active tab and search
  const filteredDevices = useMemo(() => {
    let filtered = devices;
    
    // Filter by tab
    if (activeTab === 'online') {
      filtered = onlineDevices;
    } else if (activeTab === 'warning') {
      filtered = warningDevices;
    } else if (activeTab === 'offline') {
      filtered = offlineDevices;
    }
    
    // Filter by search
    if (search) {
      filtered = filtered.filter((device) =>
        device.ip.includes(search) ||
        device.mac.toLowerCase().includes(search.toLowerCase()) ||
        device.hostname?.toLowerCase().includes(search.toLowerCase()) ||
        device.vendor?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return filtered;
  }, [devices, activeTab, search, onlineDevices, warningDevices, offlineDevices]);
  
  // Tab configuration
  const tabs = [
    { id: 'all', label: 'All Devices', count: devices.length },
    { id: 'online', label: 'Online', count: onlineDevices.length },
    { id: 'warning', label: 'Warning', count: warningDevices.length },
    { id: 'offline', label: 'Offline', count: offlineDevices.length },
  ];

  // Empty state
  if (!scanResult && !isScanning) {
    return (
      <div className="relative flex-1 overflow-y-auto bg-bg-primary p-4 sm:p-6 lg:p-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-16 -left-16 h-80 w-80 rounded-full bg-cyan-300/15 blur-3xl dark:bg-cyan-500/10" />
          <div className="absolute top-20 right-0 h-96 w-96 rounded-full bg-slate-300/10 blur-3xl dark:bg-slate-500/10" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className={`${CARD} p-5 sm:p-6`}>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-300">
              Asset Inventory
            </p>
            <h1 className="mt-2 text-2xl font-black text-text-primary sm:text-4xl">Devices</h1>
            <p className="mt-2 text-sm text-text-secondary sm:text-base">No scan data available.</p>
          </div>

          <motion.div 
            className={`${CARD} flex min-h-[400px] flex-col items-center justify-center text-center`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <WifiOff className="w-16 h-16 text-text-muted mb-4" />
            <p className="text-text-muted">
              {tauriAvailable 
                ? 'Click "Start Scan" to discover devices'
                : 'Run with `npm run tauri dev` to enable scanning'}
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isScanning && !scanResult) {
    return (
      <div className="relative flex-1 overflow-y-auto bg-bg-primary p-4 sm:p-6 lg:p-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-16 -left-16 h-80 w-80 rounded-full bg-cyan-300/15 blur-3xl dark:bg-cyan-500/10" />
          <div className="absolute top-20 right-0 h-96 w-96 rounded-full bg-slate-300/10 blur-3xl dark:bg-slate-500/10" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className={`${CARD} p-5 sm:p-6`}>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-300">
              Asset Inventory
            </p>
            <h1 className="mt-2 text-2xl font-black text-text-primary sm:text-4xl">Devices</h1>
            <p className="mt-2 text-sm text-text-secondary sm:text-base">Scanning network...</p>
          </div>
          <div className={`${CARD} flex min-h-[400px] flex-col items-center justify-center`}>
            <Loader2 className="w-16 h-16 text-accent-blue animate-spin mb-4" />
            <p className="text-text-muted">Discovering devices...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 overflow-y-auto bg-bg-primary p-4 sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 -left-16 h-80 w-80 rounded-full bg-cyan-300/15 blur-3xl dark:bg-cyan-500/10" />
        <div className="absolute top-20 right-0 h-96 w-96 rounded-full bg-slate-300/10 blur-3xl dark:bg-slate-500/10" />
      </div>
      <div className="relative z-10 space-y-6">
      <div className={`${CARD} p-5 sm:p-6`}>
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-300">
          Asset Inventory
        </p>
        <h1 className="mt-2 text-2xl font-black text-text-primary sm:text-4xl">Devices</h1>
        <p className="mt-2 text-sm text-text-secondary sm:text-base">
          Search, filter, and inspect discovered network assets by state and risk.
        </p>
      </div>

      {/* Search Bar */}
      <div className={`${CARD} p-4`}>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by IP, MAC, hostname..."
            className="w-full h-10 pl-10 pr-4 bg-bg-tertiary border border-theme rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-blue/50 transition-all"
          />
        </div>
      </div>

      {/* Tab Filters */}
      <div className={`${CARD} flex items-center justify-between p-4`}>
        <TabFilter
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <span className="text-sm text-text-muted">
          {filteredDevices.length} total devices
        </span>
      </div>

      {/* Device Grid */}
      {filteredDevices.length === 0 ? (
        <motion.div 
          className={`${CARD} flex flex-col items-center justify-center py-16 text-center`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <WifiOff className="w-12 h-12 text-text-muted mb-3" />
          <p className="text-text-muted">
            {search ? 'No devices match your search' : 'No devices found'}
          </p>
        </motion.div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {filteredDevices.map((device, index) => (
            <motion.div
              key={device.ip}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <DeviceCard
                device={device}
                onClick={() => onDeviceClick?.(device)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
      </div>
    </div>
  );
}
