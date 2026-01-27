/**
 * Dashboard - NetFlow Pro Style with Modern Cards
 * 
 * Redesigned dashboard with large stat cards, network health, and device grid
 */

import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { motion } from 'framer-motion';
import {
  Monitor,
  Clock,
  Loader2,
  Activity,
} from 'lucide-react';
import { useScanContext, HostInfo } from '../hooks/useScan';
import { useNetworkStats, useScanHistory } from '../hooks/useDatabase';
import StatCard from '../components/dashboard/StatCard';
import NetworkHealthCard from '../components/dashboard/NetworkHealthCard';
import BandwidthChart from '../components/charts/BandwidthChart';
import LatencyChart from '../components/charts/LatencyChart';
import RecentEventsPanel from '../components/dashboard/RecentEventsPanel';
import MonitoringPanel from '../components/MonitoringPanel';

interface DashboardProps {
  onDeviceClick?: (device: HostInfo) => void;
  onScan?: () => void;
}

interface NetworkHealthData {
  score: number;
  grade: string;
  status: string;
  breakdown: {
    security: number;
    stability: number;
    compliance: number;
  };
  insights: string[];
}

export default function Dashboard({ onDeviceClick, onScan }: DashboardProps) {
  const { scanResult, isScanning, error, lastScanTime, tauriAvailable } = useScanContext();
  const { stats, refetch: refetchStats } = useNetworkStats();
  const { history, loading: historyLoading, refetch: refetchHistory } = useScanHistory(5);
  
  // Health score state
  const [healthData, setHealthData] = useState<NetworkHealthData | null>(null);
  
  // Fetch health score
  useEffect(() => {
    async function fetchHealth() {
      try {
        const data = await invoke<NetworkHealthData>('get_network_health');
        setHealthData(data);
      } catch (e) {
        console.error('Failed to fetch health:', e);
      }
    }
    if (tauriAvailable) {
      fetchHealth();
    }
  }, [tauriAvailable, scanResult]);
  
  // Calculate stats from real data
  const totalHosts = scanResult?.total_hosts ?? 0;
  const activeHosts = scanResult?.active_hosts ?? [];
  const onlineCount = activeHosts.filter(h => h.response_time_ms !== null && h.response_time_ms !== undefined).length;
  const avgLatency = activeHosts.length > 0 
    ? Math.round(activeHosts.reduce((sum, h) => sum + (h.response_time_ms || 0), 0) / activeHosts.length)
    : 0;
  const networkLoad = onlineCount > 0 ? Math.round((onlineCount / totalHosts) * 100) : 0;

  // Empty state - minimal, clean message
  if (!scanResult && !isScanning) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-text-muted">
            <Monitor className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-sm">No scan data available</p>
            <p className="text-xs opacity-70">Run a network scan to see metrics</p>
          </div>
        </div>
      </div>
    );
  }

  // Scanning state
  if (isScanning && !scanResult) {
    return (
      <div className="p-6 lg:p-8 mesh-gradient min-h-screen relative">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center relative z-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="w-16 h-16 mb-4 text-accent-blue" />
          </motion.div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Scanning Network
          </h2>
          <p className="text-text-muted">
            Discovering devices via ARP, ICMP, and TCP probing
          </p>
        </div>
      </div>
    );
  }

  // Main dashboard with scan results
  return (
    <motion.div 
      className="p-4 lg:p-5 space-y-4 mesh-gradient min-h-screen relative"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
    >
      <div className="relative z-10 space-y-4">
      {/* Error Banner */}
      {error && (
        <motion.div 
          className="p-4 bg-accent-red/10 border border-accent-red/30 rounded-xl text-accent-red"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {error}
        </motion.div>
      )}

      {/* Top Stat Cards - 3 Column Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Active Devices */}
        <StatCard
          title="Active Devices"
          value={totalHosts}
          trend="12%"
          trendUp={true}
          icon={Monitor}
          iconColor="#3B82F6"
        />

        {/* Network Load */}
        <StatCard
          title="Network Load"
          value={`${networkLoad}%`}
          subtitle="Optimal performance"
          icon={Activity}
          iconColor="#10B981"
          valueColor={networkLoad > 80 ? '#F59E0B' : '#10B981'}
        />

        {/* Avg Latency */}
        <StatCard
          title="Avg Latency"
          value={`${avgLatency}ms`}
          subtitle="Optimal"
          icon={Clock}
          iconColor="#14B8A6"
          valueColor="#14B8A6"
        />
      </motion.div>

      {/* Network Health Card - Full Width */}
      <NetworkHealthCard
        score={healthData?.score ?? 87}
        grade={healthData?.grade ?? "A-"}
        status={healthData?.status ?? "Healthy"}
        uptime={99.9}
        packetLossPercent={0.02}
        security={healthData?.breakdown?.security ?? 94}
        stability={healthData?.breakdown?.stability ?? 98}
      />

      {/* Charts & Events Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bandwidth Chart */}
        <BandwidthChart />
        
        {/* Latency Chart */}
        <LatencyChart />
      </div>

      {/* Recent Events Panel */}
      <RecentEventsPanel />

      {/* Devices Grid */}
      {activeHosts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">
              Discovered Devices ({activeHosts.length})
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeHosts.slice(0, 6).map((host, index) => (
              <motion.div
                key={host.ip}
                onClick={() => onDeviceClick?.(host)}
                className="bg-bg-secondary border border-theme rounded-xl p-4 cursor-pointer transition-all hover:border-accent-blue/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                whileHover={{ scale: 1.02, y: -2 }}
              >
                {/* Device Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent-blue/20 flex items-center justify-center">
                      <Monitor className="w-5 h-5 text-accent-blue" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text-primary text-sm">
                        {host.hostname || 'Unknown Device'}
                      </h3>
                      <p className="text-xs text-text-muted">{host.device_type}</p>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    host.response_time_ms !== null && host.response_time_ms !== undefined
                      ? 'bg-status-online'
                      : 'bg-status-offline'
                  }`} />
                </div>

                {/* IP Address */}
                <div className="mb-3">
                  <p className="text-xs text-text-muted mb-1">IP Address</p>
                  <p className="font-mono text-sm text-text-primary">{host.ip}</p>
                </div>

                {/* Latency */}
                {host.response_time_ms !== null && host.response_time_ms !== undefined && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-muted">Latency</span>
                    <span className="font-semibold text-accent-teal">
                      {host.response_time_ms.toFixed(1)}ms
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Monitoring Panel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <MonitoringPanel 
          onScanComplete={() => {
            refetchStats();
            refetchHistory();
          }}
        />
      </motion.div>
      </div>
    </motion.div>
  );
}
