import { X, Wifi, WifiOff, AlertTriangle, Clock, Shield, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { HostInfo } from '../../hooks/useScan';
import { useTheme } from '../../hooks/useTheme';
import clsx from 'clsx';

interface DeviceDetailModalProps {
  device: HostInfo | null;
  onClose: () => void;
}

export default function DeviceDetailModal({ device, onClose }: DeviceDetailModalProps) {
  if (!device) return null;

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const isOnline = device.response_time_ms !== null && device.response_time_ms !== undefined;
  
  // Risk level
  const riskLevel = device.risk_score >= 70 ? 'high' : device.risk_score >= 40 ? 'medium' : 'low';
  const riskConfig = {
    low: { bg: 'bg-accent-green/15', border: 'border-accent-green/30', text: 'text-accent-green', glow: '#10B981' },
    medium: { bg: 'bg-accent-amber/15', border: 'border-accent-amber/30', text: 'text-accent-amber', glow: '#F59E0B' },
    high: { bg: 'bg-accent-red/15', border: 'border-accent-red/30', text: 'text-accent-red', glow: '#EF4444' },
  };

  const statusConfig = isOnline 
    ? { bg: 'bg-accent-green/15', border: 'border-accent-green/30', text: 'text-accent-green', icon: Wifi, glow: '#10B981' }
    : { bg: 'bg-accent-red/15', border: 'border-accent-red/30', text: 'text-accent-red', icon: WifiOff, glow: '#EF4444' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Clean Backdrop */}
      <motion.div 
        className={clsx(
          "absolute inset-0",
          isDark ? "bg-black/80" : "bg-black/40"
        )}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
      
      {/* Modal */}
      <motion.div 
        className={clsx(
          "relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden",
          isDark ? "bg-[#1a1f2e]" : "bg-white"
        )}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Header */}
        <div className={clsx(
          "relative flex items-center justify-between p-4 border-b",
          isDark 
            ? "bg-[#0f1419] border-white/10" 
            : "bg-slate-50 border-slate-200"
        )}>
          <div className="flex items-center gap-3">
            <div className={clsx(
              'w-2.5 h-2.5 rounded-full',
              isOnline ? 'bg-emerald-500' : 'bg-red-500'
            )} />
            <div>
              <h2 className={clsx(
                "text-lg font-bold tracking-tight",
                isDark ? "text-white" : "text-slate-900"
              )}>
                {device.hostname || device.ip}
              </h2>
              <p className={clsx(
                "text-xs font-medium mt-0.5",
                isDark ? "text-slate-400" : "text-slate-600"
              )}>
                {device.device_type}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={clsx(
              "p-2 rounded-lg transition-colors",
              isDark
                ? "hover:bg-white/10 text-slate-400 hover:text-white"
                : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Status & Risk Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Status Card */}
            <div className={clsx(
              'p-3 rounded-lg border',
              isOnline
                ? isDark
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-emerald-50 border-emerald-200'
                : isDark
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-red-50 border-red-200'
            )}>
              <div className="flex items-center gap-2">
                <div className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  isOnline
                    ? isDark
                      ? 'bg-emerald-500/20'
                      : 'bg-emerald-100'
                    : isDark
                      ? 'bg-red-500/20'
                      : 'bg-red-100'
                )}>
                  <statusConfig.icon className={clsx(
                    "w-4 h-4",
                    isOnline ? 'text-emerald-500' : 'text-red-500'
                  )} />
                </div>
                <div>
                  <p className={clsx(
                    "text-[10px] font-medium uppercase tracking-wide",
                    isDark ? "text-slate-500" : "text-slate-600"
                  )}>Status</p>
                  <p className={clsx(
                    'text-base font-bold',
                    isOnline ? 'text-emerald-500' : 'text-red-500'
                  )}>
                    {isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Risk Card */}
            <div className={clsx(
              'p-3 rounded-lg border',
              riskLevel === 'low'
                ? isDark
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-emerald-50 border-emerald-200'
                : riskLevel === 'medium'
                  ? isDark
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-amber-50 border-amber-200'
                  : isDark
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-red-50 border-red-200'
            )}>
              <div className="flex items-center gap-2">
                <div className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  riskLevel === 'low'
                    ? isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'
                    : riskLevel === 'medium'
                      ? isDark ? 'bg-amber-500/20' : 'bg-amber-100'
                      : isDark ? 'bg-red-500/20' : 'bg-red-100'
                )}>
                  <AlertTriangle className={clsx(
                    "w-4 h-4",
                    riskLevel === 'low' ? 'text-emerald-500' : riskLevel === 'medium' ? 'text-amber-500' : 'text-red-500'
                  )} />
                </div>
                <div>
                  <p className={clsx(
                    "text-[10px] font-medium uppercase tracking-wide",
                    isDark ? "text-slate-500" : "text-slate-600"
                  )}>Risk Score</p>
                  <p className={clsx(
                    'text-base font-bold',
                    riskLevel === 'low' ? 'text-emerald-500' : riskLevel === 'medium' ? 'text-amber-500' : 'text-red-500'
                  )}>
                    {device.risk_score}/100
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Network Information Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              <h3 className={clsx(
                "text-xs font-semibold uppercase tracking-wider",
                isDark ? "text-white" : "text-slate-900"
              )}>
                Network Information
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <InfoCard label="IP Address" value={device.ip} mono />
              <InfoCard label="MAC Address" value={device.mac} mono />
              <InfoCard label="Vendor" value={device.vendor || 'Unknown'} />
              <InfoCard label="Discovery" value={device.discovery_method} />
              {device.response_time_ms !== null && device.response_time_ms !== undefined && (
                <InfoCard label="Latency" value={`${device.response_time_ms.toFixed(1)}ms`} accent="#3B82F6" />
              )}
              {device.ttl && (
                <InfoCard label="TTL" value={device.ttl.toString()} />
              )}
              {device.os_guess && (
                <InfoCard label="OS Detection" value={device.os_guess} span2 accent="#8B5CF6" />
              )}
            </div>
          </div>

          {/* Open Ports */}
          {device.open_ports && device.open_ports.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-purple-500" />
                <h3 className={clsx(
                  "text-xs font-semibold uppercase tracking-wider",
                  isDark ? "text-white" : "text-slate-900"
                )}>
                  Open Ports ({device.open_ports.length})
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {device.open_ports.map((port) => (
                  <span
                    key={port}
                    className={clsx(
                      "px-3 py-1.5 rounded-md font-mono text-sm border transition-colors",
                      isDark
                        ? "bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                        : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                    )}
                  >
                    {port}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* System Information */}
          {(device.system_description || device.uptime_seconds) && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                System Information
              </h3>
              {device.system_description && (
                <div className="p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <p className="text-sm text-text-primary leading-relaxed">
                    {device.system_description}
                  </p>
                </div>
              )}
              {device.uptime_seconds && (
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-accent-green" />
                  <span className="text-text-secondary font-medium">
                    Uptime: <span className="text-white font-semibold">{formatUptime(device.uptime_seconds)}</span>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={clsx(
          "p-4 border-t flex justify-end",
          isDark ? "bg-[#0f1419] border-white/10" : "bg-slate-50 border-slate-200"
        )}>
          <button
            onClick={onClose}
            className={clsx(
              "px-5 py-2 font-semibold rounded-lg transition-colors text-sm",
              isDark
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            )}
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function InfoCard({ 
  label, 
  value, 
  mono = false,
  span2 = false,
  accent
}: { 
  label: string; 
  value: string; 
  mono?: boolean;
  span2?: boolean;
  accent?: string;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className={clsx(
      'p-2.5 rounded-lg border transition-colors',
      isDark
        ? 'bg-white/5 border-white/10 hover:border-white/20'
        : 'bg-slate-50 border-slate-200 hover:border-blue-300',
      span2 && 'col-span-2'
    )}>
      <p className={clsx(
        "text-[10px] font-medium mb-1 uppercase tracking-wide",
        isDark ? "text-slate-500" : "text-slate-600"
      )}>{label}</p>
      <p className={clsx(
        'font-semibold truncate transition-colors text-xs',
        mono 
          ? 'font-mono text-blue-500' 
          : isDark ? 'text-white' : 'text-slate-900',
        accent && 'text-transparent bg-clip-text',
      )}
      style={accent ? { backgroundImage: `linear-gradient(135deg, ${accent}, ${accent}AA)` } : undefined}
      >
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
