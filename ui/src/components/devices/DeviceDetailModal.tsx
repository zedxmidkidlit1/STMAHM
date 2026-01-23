import { X, Wifi, WifiOff, AlertTriangle, Clock } from 'lucide-react';
import { HostInfo } from '../../hooks/useScan';
import clsx from 'clsx';

interface DeviceDetailModalProps {
  device: HostInfo | null;
  onClose: () => void;
}

export default function DeviceDetailModal({ device, onClose }: DeviceDetailModalProps) {
  if (!device) return null;

  const isOnline = device.response_time_ms !== null && device.response_time_ms !== undefined;
  
  // Risk level
  const riskLevel = device.risk_score >= 70 ? 'high' : device.risk_score >= 40 ? 'medium' : 'low';
  const riskColors = {
    low: 'bg-accent-green/20 text-accent-green border-accent-green/30',
    medium: 'bg-accent-amber/20 text-accent-amber border-accent-amber/30',
    high: 'bg-accent-red/20 text-accent-red border-accent-red/30',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-bg-secondary rounded-2xl shadow-2xl border border-theme overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-theme">
          <div className="flex items-center gap-4">
            <div className={clsx(
              'w-4 h-4 rounded-full',
              isOnline ? 'bg-status-online' : 'bg-status-offline'
            )} />
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                {device.hostname || device.ip}
              </h2>
              <p className="text-sm text-text-muted">{device.device_type}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status & Risk */}
          <div className="flex items-center gap-4">
            <div className={clsx(
              'flex-1 p-4 rounded-xl border',
              isOnline 
                ? 'bg-accent-green/10 border-accent-green/30' 
                : 'bg-accent-red/10 border-accent-red/30'
            )}>
              <div className="flex items-center gap-3">
                {isOnline ? (
                  <Wifi className="w-5 h-5 text-accent-green" />
                ) : (
                  <WifiOff className="w-5 h-5 text-accent-red" />
                )}
                <div>
                  <p className="text-sm text-text-muted">Status</p>
                  <p className={clsx(
                    'font-semibold',
                    isOnline ? 'text-accent-green' : 'text-accent-red'
                  )}>
                    {isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className={clsx('flex-1 p-4 rounded-xl border', riskColors[riskLevel])}>
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5" />
                <div>
                  <p className="text-sm opacity-70">Risk Score</p>
                  <p className="font-semibold">{device.risk_score}/100</p>
                </div>
              </div>
            </div>
          </div>

          {/* Network Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider">
              Network Information
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <InfoRow label="IP Address" value={device.ip} mono />
              <InfoRow label="MAC Address" value={device.mac} mono />
              <InfoRow label="Vendor" value={device.vendor || 'Unknown'} />
              <InfoRow label="Discovery" value={device.discovery_method} />
              {device.response_time_ms !== null && device.response_time_ms !== undefined && (
                <InfoRow label="Latency" value={`${device.response_time_ms}ms`} />
              )}
              {device.ttl && (
                <InfoRow label="TTL" value={device.ttl.toString()} />
              )}
              {device.os_guess && (
                <InfoRow label="OS Guess" value={device.os_guess} span2 />
              )}
            </div>
          </div>

          {/* Open Ports */}
          {device.open_ports && device.open_ports.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider">
                Open Ports
              </h3>
              <div className="flex flex-wrap gap-2">
                {device.open_ports.map((port) => (
                  <span
                    key={port}
                    className="px-3 py-1.5 bg-bg-tertiary rounded-lg font-mono text-sm text-text-secondary"
                  >
                    {port}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* System Info */}
          {(device.system_description || device.uptime_seconds) && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider">
                System Information
              </h3>
              {device.system_description && (
                <p className="text-sm text-text-secondary bg-bg-tertiary p-3 rounded-lg">
                  {device.system_description}
                </p>
              )}
              {device.uptime_seconds && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <Clock className="w-4 h-4" />
                  <span>Uptime: {formatUptime(device.uptime_seconds)}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-theme flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-bg-tertiary hover:bg-bg-hover text-text-secondary rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ 
  label, 
  value, 
  mono = false,
  span2 = false 
}: { 
  label: string; 
  value: string; 
  mono?: boolean;
  span2?: boolean;
}) {
  return (
    <div className={clsx('p-3 bg-bg-tertiary/50 rounded-lg', span2 && 'col-span-2')}>
      <p className="text-xs text-text-muted mb-1">{label}</p>
      <p className={clsx(
        'text-text-primary truncate',
        mono && 'font-mono text-sm'
      )}>
        {value}
      </p>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}
