import { motion } from 'framer-motion';
import { Scan, Loader2, TrendingUp, Shield, Activity, Server } from 'lucide-react';

interface EmptyDashboardProps {
  onScan?: () => void;
  isScanning?: boolean;
}

export default function EmptyDashboard({ onScan, isScanning = false }: EmptyDashboardProps) {
  return (
    <motion.div 
      className="p-6 lg:p-8 space-y-6 mesh-gradient relative"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.3 }}
    >
      <div className="relative z-10 space-y-6">
        {/* Skeleton Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Server, label: 'Total Devices', color: '#3B82F6' },
            { icon: Activity, label: 'Online Devices', color: '#10B981' },
            { icon: TrendingUp, label: 'Average Latency', color: '#F59E0B' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              className="glass-card p-6 noise-texture relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm text-text-muted font-medium uppercase tracking-wide">
                  {stat.label}
                </h3>
                <div 
                  className="w-11 h-11 rounded-xl flex items-center justify-center backdrop-blur-sm opacity-50"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
              </div>
              
              {/* Skeleton */}
              <div className="mb-2">
                <div className="h-12 w-24 bg-white/10 rounded-lg animate-pulse" />
              </div>
              
              <p className="text-xs text-text-muted italic">
                Start a scan to see metrics
              </p>
            </motion.div>
          ))}
        </div>

        {/* Network Health - Unknown State */}
        <motion.div
          className="glass-card p-6 noise-texture relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-1">Network Health</h3>
              <p className="text-sm text-text-muted">System performance and stability metrics</p>
            </div>
            
            {/* Unknown Score Badge */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-6xl font-bold text-text-muted/30">?</div>
                <p className="text-sm font-medium text-text-muted mt-2">Unknown</p>
              </div>
            </div>
          </div>

          {/* Skeleton Progress Bar */}
          <div className="relative h-3 bg-bg-tertiary/50 rounded-full overflow-hidden mb-6 backdrop-blur-sm">
            <div className="h-full w-full bg-gradient-to-r from-white/5 via-white/10 to-white/5 animate-pulse" />
          </div>

          {/* Skeleton Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            {['Uptime', 'Packet Loss', 'Security', 'Stability'].map((label) => (
              <div
                key={label}
                className="bg-bg-tertiary/30 backdrop-blur-sm rounded-xl p-4 border border-white/5"
              >
                <p className="text-xs text-text-muted font-medium mb-2 uppercase tracking-wide">{label}</p>
                <div className="h-6 w-16 bg-white/10 rounded animate-pulse mb-2" />
                <div className="h-1.5 bg-bg-primary/50 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-white/5" />
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary/95 via-bg-secondary/80 to-transparent flex items-center justify-center pointer-events-none">
            <div className="text-center max-w-md px-4">
              <p className="text-text-primary font-medium mb-1">
                Scan your network to calculate health score
              </p>
              <p className="text-sm text-text-muted">
                Discover devices and analyze network performance
              </p>
            </div>
          </div>
        </motion.div>

        {/* Prominent Scan CTA - Center */}
        <motion.div
          className="flex items-center justify-center py-12"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          <div className="text-center max-w-xl">
            {/* Icon */}
            <motion.div
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-accent-blue to-accent-sapphire flex items-center justify-center shadow-2xl"
              style={{
                boxShadow: '0 20px 60px rgba(14, 165, 233, 0.35), 0 0 40px rgba(37, 99, 235, 0.25)',
              }}
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>

            {/* Title */}
            <h2 className="text-3xl font-bold text-text-primary mb-3">
              Discover Your Network
            </h2>
            <p className="text-lg text-text-secondary mb-8 max-w-md mx-auto">
              Start scanning to identify devices, analyze performance, and monitor network health in real-time
            </p>

            {/* Large Scan Button */}
            <motion.button
              onClick={onScan}
              disabled={isScanning}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              className="relative px-12 py-5 rounded-2xl bg-gradient-to-br from-accent-blue via-accent-sapphire to-accent-teal text-white font-bold text-lg transition-all duration-300 overflow-hidden group shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                boxShadow: isScanning 
                  ? '0 10px 40px rgba(14, 165, 233, 0.35)' 
                  : '0 10px 40px rgba(14, 165, 233, 0.45), 0 0 60px rgba(37, 99, 235, 0.25)',
              }}
            >
              {/* Animated gradient overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{
                  x: isScanning ? ['-100%', '200%'] : ['0%', '0%'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: isScanning ? Infinity : 0,
                  ease: 'linear',
                }}
              />

              {/* Pulse ring */}
              {!isScanning && (
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-white/50"
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}

              {/* Content */}
              <div className="relative z-10 flex items-center gap-3 justify-center">
                {isScanning ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Scan className="w-6 h-6" />
                )}
                <span className="tracking-wide">
                  {isScanning ? 'Scanning Network...' : 'START NETWORK SCAN'}
                </span>
              </div>
            </motion.button>

            {/* Hint Text */}
            <p className="text-sm text-text-muted mt-6">
              Scanning typically takes 30-60 seconds
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
