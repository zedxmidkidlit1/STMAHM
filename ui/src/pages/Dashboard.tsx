import {
  Monitor,
  Wifi,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  WifiOff,
  Loader2,
} from 'lucide-react';
import { useScanContext, HostInfo } from '../hooks/useScan';

interface DashboardProps {
  onDeviceClick?: (device: HostInfo) => void;
}

export default function Dashboard({ onDeviceClick }: DashboardProps) {
  const { scanResult, isScanning, error, lastScanTime, tauriAvailable } = useScanContext();
  
  // Calculate stats from real data
  const totalHosts = scanResult?.total_hosts ?? 0;
  const activeHosts = scanResult?.active_hosts ?? [];
  const onlineCount = activeHosts.filter(h => h.response_time_ms !== null && h.response_time_ms !== undefined).length;
  const highRiskCount = activeHosts.filter(h => h.risk_score >= 50).length;
  const scanDuration = scanResult?.scan_duration_ms ?? 0;
  const subnet = scanResult?.subnet ?? 'No scan yet';

  // Show welcome message if no scan yet
  if (!scanResult && !isScanning) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-muted mt-1">Network overview and status</p>
        </div>

        <div className="card p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-blue/20 flex items-center justify-center">
            <WifiOff className="w-8 h-8 text-accent-blue" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            No Scan Data
          </h2>
          <p className="text-text-muted mb-4 max-w-md mx-auto">
            {tauriAvailable 
              ? 'Click "Start Scan" in the sidebar to discover devices on your network.'
              : 'Please run the app with `npm run tauri dev` to enable network scanning.'}
          </p>
          {error && (
            <div className="mt-4 p-4 bg-accent-red/10 border border-accent-red/30 rounded-lg text-accent-red text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show scanning state
  if (isScanning) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-text-muted mt-1">Network overview and status</p>
        </div>

        <div className="card p-8 text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-accent-blue animate-spin" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Scanning Network...
          </h2>
          <p className="text-text-muted">
            Discovering devices via ARP, ICMP, and TCP probing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-muted mt-1">
          Network overview and status
          {lastScanTime && (
            <span className="ml-2 text-text-secondary">
              • Last scan: {lastScanTime.toLocaleTimeString()}
            </span>
          )}
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-accent-red/10 border border-accent-red/30 rounded-lg text-accent-red">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Hosts"
          value={totalHosts}
          icon={Monitor}
          color="blue"
        />
        <StatCard
          title="Online"
          value={onlineCount}
          icon={Wifi}
          color="green"
        />
        <StatCard
          title="High Risk"
          value={highRiskCount}
          icon={AlertTriangle}
          color="amber"
        />
        <StatCard
          title="Scan Time"
          value={`${(scanDuration / 1000).toFixed(1)}s`}
          icon={Clock}
          subtitle={`Subnet: ${subnet}`}
          color="purple"
        />
      </div>

      {/* Recent Hosts */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">
          Discovered Devices ({activeHosts.length})
        </h2>
        {activeHosts.length === 0 ? (
          <p className="text-text-muted text-center py-8">No devices found</p>
        ) : (
          <div className="space-y-3">
            {activeHosts.slice(0, 8).map((host) => (
              <div
                key={host.ip}
                onClick={() => onDeviceClick?.(host)}
                className="flex items-center justify-between p-4 bg-bg-tertiary/50 rounded-lg cursor-pointer hover:bg-bg-tertiary transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      host.response_time_ms !== null && host.response_time_ms !== undefined
                        ? 'bg-status-online'
                        : 'bg-status-offline'
                    }`}
                  />
                  <div>
                    <p className="font-medium text-text-primary">
                      {host.hostname || host.ip}
                    </p>
                    <p className="text-sm text-text-muted font-mono">
                      {host.ip} • {host.mac}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-text-secondary">
                    {host.device_type}
                  </p>
                  <p className="text-xs text-text-muted">
                    {host.vendor || 'Unknown vendor'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  trendLabel?: string;
  subtitle?: string;
  color: 'blue' | 'green' | 'amber' | 'purple' | 'red';
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  subtitle,
  color,
}: StatCardProps) {
  const colorClasses = {
    blue: 'bg-accent-blue/20 text-accent-blue',
    green: 'bg-accent-green/20 text-accent-green',
    amber: 'bg-accent-amber/20 text-accent-amber',
    purple: 'bg-accent-purple/20 text-accent-purple',
    red: 'bg-accent-red/20 text-accent-red',
  };

  return (
    <div className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <p className="text-text-muted text-sm mb-1">{title}</p>
      <p className="text-3xl font-bold text-text-primary">{value}</p>
      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          {trend > 0 ? (
            <ArrowUpRight className="w-4 h-4 text-accent-green" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-accent-red" />
          )}
          <span
            className={`text-sm ${
              trend > 0 ? 'text-accent-green' : 'text-accent-red'
            }`}
          >
            {Math.abs(trend)}
          </span>
          <span className="text-text-muted text-sm">{trendLabel}</span>
        </div>
      )}
      {subtitle && (
        <p className="text-text-muted text-sm mt-2">{subtitle}</p>
      )}
    </div>
  );
}
