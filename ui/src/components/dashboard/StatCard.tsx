import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon?: LucideIcon;
  iconColor?: string;
  valueColor?: string;
  subtitle?: string;
}

export default function StatCard({
  title,
  value,
  trend,
  trendUp,
  icon: Icon,
  iconColor = '#3B82F6',
  valueColor,
  subtitle,
}: StatCardProps) {
  return (
    <motion.div
      className="glass-card p-4 noise-texture relative overflow-hidden group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {/* Glow effect on hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 120%, ${iconColor}30, transparent 70%)`
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs text-text-muted font-medium uppercase tracking-wide">{title}</h3>
          {Icon && (
            <div 
              className="w-9 h-9 rounded-lg flex items-center justify-center backdrop-blur-sm"
              style={{ 
                backgroundColor: `${iconColor}15`,
                boxShadow: `0 0 20px ${iconColor}20`
              }}
            >
              <Icon className="w-4 h-4" style={{ color: iconColor }} />
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-1">
          <span 
            className="text-5xl font-bold tracking-tight"
            style={{ color: valueColor || 'var(--color-text-primary)' }}
          >
            {value}
          </span>
        </div>

        {/* Trend or Subtitle */}
        {trend && (
          <div className="flex items-center gap-1.5">
            <span 
              className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                trendUp 
                  ? 'bg-accent-green/10 text-accent-green' 
                  : 'bg-accent-red/10 text-accent-red'
              }`}
            >
              {trendUp ? '↑' : '↓'} {trend}
            </span>
            <span className="text-xs text-text-muted">from last week</span>
          </div>
        )}
        {subtitle && (
          <p className="text-sm text-text-muted">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}
