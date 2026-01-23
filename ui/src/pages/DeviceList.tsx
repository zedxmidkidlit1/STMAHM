import { useState } from 'react';
import { Search, Filter, Download, Loader2, WifiOff } from 'lucide-react';
import { useScanContext, HostInfo } from '../hooks/useScan';
import clsx from 'clsx';

interface DeviceListProps {
  onDeviceClick?: (device: HostInfo) => void;
}

export default function DeviceList({ onDeviceClick }: DeviceListProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  
  const { scanResult, isScanning, tauriAvailable } = useScanContext();
  const devices = scanResult?.active_hosts ?? [];
  
  // Filter devices
  const filteredDevices = devices.filter((device) => {
    const matchesSearch =
      device.ip.includes(search) ||
      device.mac.toLowerCase().includes(search.toLowerCase()) ||
      device.hostname?.toLowerCase().includes(search.toLowerCase()) ||
      device.vendor?.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = filterType === 'all' || device.device_type === filterType;
    
    return matchesSearch && matchesType;
  });

  // Get unique device types
  const deviceTypes = [...new Set(devices.map((d) => d.device_type))];

  // Empty state
  if (!scanResult && !isScanning) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Devices</h1>
          <p className="text-text-muted mt-1">No scan data available</p>
        </div>
        <div className="card p-8 text-center">
          <WifiOff className="w-12 h-12 mx-auto mb-4 text-text-muted" />
          <p className="text-text-muted">
            {tauriAvailable 
              ? 'Click "Start Scan" to discover devices'
              : 'Run with `npm run tauri dev` to enable scanning'}
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isScanning) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Devices</h1>
          <p className="text-text-muted mt-1">Scanning network...</p>
        </div>
        <div className="card p-8 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-accent-blue animate-spin" />
          <p className="text-text-muted">Discovering devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Devices</h1>
          <p className="text-text-muted mt-1">
            {filteredDevices.length} of {devices.length} devices
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-bg-tertiary hover:bg-bg-hover text-text-secondary rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Search by IP, MAC, hostname..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-bg-secondary border border-theme rounded-lg text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-blue transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-text-muted" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 bg-bg-secondary border border-theme rounded-lg text-text-primary focus:outline-none focus:border-accent-blue transition-colors"
          >
            <option value="all">All Types</option>
            {deviceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-theme">
              <th className="text-left p-4 text-text-muted font-medium">Status</th>
              <th className="text-left p-4 text-text-muted font-medium">IP Address</th>
              <th className="text-left p-4 text-text-muted font-medium">MAC Address</th>
              <th className="text-left p-4 text-text-muted font-medium">Hostname</th>
              <th className="text-left p-4 text-text-muted font-medium">Vendor</th>
              <th className="text-left p-4 text-text-muted font-medium">Type</th>
              <th className="text-left p-4 text-text-muted font-medium">Risk</th>
              <th className="text-left p-4 text-text-muted font-medium">Latency</th>
            </tr>
          </thead>
          <tbody>
            {filteredDevices.map((device, index) => (
              <tr
                key={device.ip}
                onClick={() => onDeviceClick?.(device)}
                className={clsx(
                  'border-b border-theme hover:bg-bg-tertiary/50 transition-colors cursor-pointer',
                  index % 2 === 0 ? 'bg-transparent' : 'bg-bg-tertiary/20'
                )}
              >
                <td className="p-4">
                  <div
                    className={clsx(
                      'w-3 h-3 rounded-full',
                      device.response_time_ms !== null && device.response_time_ms !== undefined
                        ? 'bg-status-online'
                        : 'bg-status-offline'
                    )}
                  />
                </td>
                <td className="p-4 font-mono text-text-primary">{device.ip}</td>
                <td className="p-4 font-mono text-text-secondary text-sm">
                  {device.mac}
                </td>
                <td className="p-4 text-text-primary">
                  {device.hostname || '-'}
                </td>
                <td className="p-4 text-text-secondary text-sm">
                  {device.vendor || 'Unknown'}
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-bg-tertiary rounded text-xs font-medium text-text-secondary">
                    {device.device_type}
                  </span>
                </td>
                <td className="p-4">
                  <RiskBadge score={device.risk_score} />
                </td>
                <td className="p-4 text-text-secondary">
                  {device.response_time_ms !== null && device.response_time_ms !== undefined
                    ? `${device.response_time_ms}ms`
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RiskBadge({ score }: { score: number }) {
  const level = score >= 70 ? 'high' : score >= 40 ? 'medium' : 'low';
  
  const classes = {
    low: 'bg-accent-green/20 text-accent-green',
    medium: 'bg-accent-amber/20 text-accent-amber',
    high: 'bg-accent-red/20 text-accent-red',
  };

  return (
    <span className={clsx('px-2 py-1 rounded text-xs font-medium', classes[level])}>
      {score}
    </span>
  );
}
