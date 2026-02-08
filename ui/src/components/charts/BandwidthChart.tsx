import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from '../../hooks/useTheme';

interface BandwidthChartProps {
  data?: Array<{ time: string; value: number }>;
}

// Mock data for demonstration
const mockData = [
  { time: '00:00', value: 45 },
  { time: '04:00', value: 52 },
  { time: '08:00', value: 78 },
  { time: '12:00', value: 85 },
  { time: '16:00', value: 92 },
  { time: '20:00', value: 68 },
  { time: '24:00', value: 48 },
];

export default function BandwidthChart({ data = mockData }: BandwidthChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-bg-secondary border border-theme rounded-lg px-3 py-2 shadow-lg">
          <p className="text-xs text-text-muted mb-1">{payload[0].payload.time}</p>
          <p className="text-sm font-semibold text-accent-blue">
            {payload[0].value} Mbps
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      className="bg-bg-secondary border border-theme rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-text-primary mb-1">Bandwidth Usage</h3>
          <p className="text-xs text-text-muted">24-hour performance monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
          <span className="text-xs font-semibold text-accent-green">Live</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              stroke={isDark ? '#64748B' : '#94A3B8'}
              tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              stroke={isDark ? '#64748B' : '#94A3B8'}
              tick={{ fill: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              label={{ value: 'Mbps', angle: -90, position: 'insideLeft', fill: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }} />
            <Bar 
              dataKey="value" 
              fill="url(#barGradient)" 
              radius={[6, 6, 0, 0]}
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-theme">
        <div>
          <p className="text-xs text-text-muted mb-1">Peak</p>
          <p className="text-lg font-bold text-text-primary">92 <span className="text-xs font-normal text-text-muted">Mbps</span></p>
        </div>
        <div>
          <p className="text-xs text-text-muted mb-1">Avg</p>
          <p className="text-lg font-bold text-text-primary">68 <span className="text-xs font-normal text-text-muted">Mbps</span></p>
        </div>
        <div>
          <p className="text-xs text-text-muted mb-1">Current</p>
          <p className="text-lg font-bold text-accent-blue">48 <span className="text-xs font-normal text-text-muted">Mbps</span></p>
        </div>
      </div>
    </motion.div>
  );
}
