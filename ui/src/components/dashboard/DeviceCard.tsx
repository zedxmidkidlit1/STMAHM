import { motion } from 'framer-motion';
import { Monitor, Server, Laptop, Smartphone, Printer, Camera, Router, Cpu, Activity, HardDrive, Clock, Zap } from 'lucide-react';
import { HostInfo } from '../../hooks/useScan';

interface DeviceCardProps {
  device: HostInfo;
  onClick?: () => void;
}

// Device type to icon mapping
const deviceIcons: Record<string, any> = {
  ROUTER: Router,
  SERVER: Server,
  PC: Monitor,
  LAPTOP: Laptop,
  MOBILE: Smartphone,
  PRINTER: Printer,
  CAMERA: Camera,
  SWITCH: Cpu,
};

// Device type to color mapping
const deviceColors: Record<string, string> = {
  ROUTER: '#3B82F6',
  SERVER: '#F59E0B',
  PC: '#6B7280',
  LAPTOP: '#6B7280',
  MOBILE: '#EC4899',
  PRINTER: '#14B8A6',
  CAMERA: '#F97316',
  SWITCH: '#10B981',
};

export default function DeviceCard({ device, onClick }: DeviceCardProps) {
  const Icon = deviceIcons[device.device_type] || Monitor;
  const color = deviceColors[device.device_type] || '#6B7280';
  
  // Mock data for uptime and metrics (replace with real data when available)
  const cpuUsage = Math.floor(Math.random() * 80) + 20; // 20-100%
  const memoryUsage = Math.floor(Math.random() * 70) + 30; // 30-100%
  const uptimeDays = Math.floor(Math.random() * 100);
  const uptimeHours = Math.floor(Math.random() * 24);
  
  const isOnline = device.response_time_ms !== null && device.response_time_ms !== undefined;
  const isWarning = device.risk_score >= 50;
  
  // Get status badge
  const getStatusBadge = () => {
    if (!isOnline) return { text: 'offline', color: 'bg-status-offline', textColor: 'text-status-offline' };
    if (isWarning) return { text: 'warning', color: 'bg-accent-amber', textColor: 'text-accent-amber' };
    return { text: 'online', color: 'bg-status-online', textColor: 'text-status-online' };
  };
  
  const status = getStatusBadge();
  
  return (
    <motion.div
      onClick={onClick}
      className="bg-bg-secondary border border-theme rounded-xl p-5 cursor-pointer transition-all hover:border-accent-blue/50"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Header: Icon + Name + Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-text-primary text-base truncate">
              {device.hostname || 'Unknown Device'}
            </h3>
            <p className="text-xs text-text-muted">
              {device.device_type.replace('_', ' ')}
            </p>
          </div>
        </div>
        <motion.div 
          className={`px-2 py-1 rounded-md text-xs font-semibold ${status.color}/20 ${status.textColor}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          ● {status.text}
        </motion.div>
      </div>

      {/* IP Address */}
      <div className="mb-4 pb-4 border-b border-theme">
        <p className="text-xs text-text-muted mb-1">IP Address</p>
        <p className="font-mono text-sm text-accent-blue font-medium">{device.ip}</p>
      </div>

      {/* CPU Usage */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-text-muted" />
            <span className="text-xs text-text-muted">CPU</span>
          </div>
          <span className="text-xs font-semibold text-text-primary">{cpuUsage}%</span>
        </div>
        <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              cpuUsage > 80 ? 'bg-accent-red' : cpuUsage > 60 ? 'bg-accent-amber' : 'bg-accent-green'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${cpuUsage}%` }}
            transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Memory Usage */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <HardDrive className="w-3.5 h-3.5 text-text-muted" />
            <span className="text-xs text-text-muted">Memory</span>
          </div>
          <span className="text-xs font-semibold text-text-primary">{memoryUsage}%</span>
        </div>
        <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              memoryUsage > 80 ? 'bg-accent-red' : memoryUsage > 60 ? 'bg-accent-amber' : 'bg-accent-blue'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${memoryUsage}%` }}
            transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Footer: Uptime & Last Seen */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-theme">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Clock className="w-3 h-3 text-text-muted" />
            <p className="text-xs text-text-muted">Uptime</p>
          </div>
          <p className="text-xs font-semibold text-text-primary">{uptimeDays}d {uptimeHours}h</p>
        </div>
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Activity className="w-3 h-3 text-text-muted" />
            <p className="text-xs text-text-muted">Last Seen</p>
          </div>
          <p className="text-xs font-semibold text-text-primary">
            {isOnline ? 'Now' : 'Offline'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
