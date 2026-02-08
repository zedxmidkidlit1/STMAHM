import { motion } from 'framer-motion';
import { Activity, Shield, Zap, TrendingUp } from 'lucide-react';

interface NetworkHealthCardProps {
  score: number;
  status: string;
  grade: string;
  uptime: number;
  packetLossPercent: number;
  security?: number;
  stability?: number;
}

export default function NetworkHealthCard({
  score,
  status,
  uptime,
  packetLossPercent,
  security = 94,
  stability = 98,
}: NetworkHealthCardProps) {
  // Color mapping based on score
  const getStatusColor = () => {
    if (score >= 80) return 'text-accent-green';
    if (score >= 60) return 'text-accent-amber';
    return 'text-accent-red';
  };

  const getGradientStops = () => {
    if (score >= 80) return ['#10B981', '#3B82F6', '#0EA5E9'];
    if (score >= 60) return ['#F59E0B', '#3B82F6', '#0EA5E9'];
    return ['#EF4444', '#F59E0B', '#3B82F6'];
  };

  const gradientStops = getGradientStops();

  const metrics = [
    { icon: Activity, label: 'Uptime', value: uptime, color: '#10B981', delay: 0.4 },
    { icon: TrendingUp, label: 'Packet Loss', value: packetLossPercent, color: '#3B82F6', delay: 0.5 },
    { icon: Shield, label: 'Security', value: security, color: '#0EA5E9', delay: 0.6 },
    { icon: Zap, label: 'Stability', value: stability, color: '#F59E0B', delay: 0.7 },
  ];

  return (
    <motion.div
      className="glass-card p-3 noise-texture relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Subtle glow background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 50% at 50% 100%, ${gradientStops[0]}15, transparent 60%)`
        }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-text-primary mb-0.5">Network Health</h3>
            <p className="text-xs text-text-muted">System performance and stability metrics</p>
          </div>
          
          {/* Score Badge */}
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className={`text-2xl font-bold tracking-tight ${getStatusColor()}`}>{score}%</p>
              <p className={`text-xs font-medium ${getStatusColor()}`}>{status}</p>
            </div>
          </div>
        </div>

        {/* Premium Gradient Progress Bar */}
        <div className="relative h-1.5 bg-bg-tertiary/50 rounded-full overflow-hidden mb-3 backdrop-blur-sm">
          <motion.div
            className="h-full rounded-full relative"
            style={{
              background: `linear-gradient(90deg, ${gradientStops[0]} 0%, ${gradientStops[1]} 50%, ${gradientStops[2]} 100%)`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          >
            {/* Shimmer effect */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              style={{
                animation: 'shimmer 2s infinite',
              }}
            />
          </motion.div>
        </div>

        {/* Metrics Grid - 2x2 */}
        <div className="grid grid-cols-2 gap-2">
          {metrics.map(({ icon: Icon, label, value, color, delay }) => (
            <motion.div
              key={label}
              className="bg-bg-tertiary/30 backdrop-blur-sm rounded-lg p-2 border border-white/5 hover:border-white/10 transition-colors"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <div 
                  className="w-5 h-5 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <Icon className="w-3 h-3" style={{ color }} />
                </div>
                <p className="text-xs text-text-muted font-medium">{label}</p>
              </div>
              <p className="text-lg font-bold text-text-primary mb-1">{value}%</p>
              <div className="h-1 bg-bg-primary/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ 
                    backgroundColor: color,
                    boxShadow: `0 0 10px ${color}50`
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${label === 'Packet Loss' ? Math.min(value * 10, 100) : value}%` }}
                  transition={{ duration: 1, delay: delay + 0.1 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
