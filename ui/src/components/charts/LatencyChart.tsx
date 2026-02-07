import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from '../../hooks/useTheme';

interface LatencyChartProps {
  data?: Array<{ time: string; value: number }>;
}

// Mock data for demonstration
const mockData = [
  { time: '00:00', value: 12 },
  { time: '04:00', value: 14 },
  { time: '08:00', value: 18 },
  { time: '12:00', value: 22 },
  { time: '16:00', value: 24 },
  { time: '20:00', value: 20 },
  { time: '24:00', value: 15 },
];

export default function LatencyChart({ data = mockData }: LatencyChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-bg-secondary border border-theme rounded-lg px-3 py-2 shadow-lg">
          <p className="text-xs text-text-muted mb-1">{payload[0].payload.time}</p>
          <p className="text-sm font-semibold text-accent-blue">
            {payload[0].value}ms
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
      transition={{ delay: 0.5 }}
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-text-primary mb-1">Average Latency</h3>
        <p className="text-xs text-text-muted">Response time over 24 hours</p>
      </div>

      {/* Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
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
              label={{ value: 'ms', angle: -90, position: 'insideLeft', fill: isDark ? '#94A3B8' : '#64748B', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#areaGradient)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-theme">
        <div>
          <p className="text-xs text-text-muted mb-1">Min</p>
          <p className="text-lg font-bold text-accent-green">12 <span className="text-xs font-normal text-text-muted">ms</span></p>
        </div>
        <div>
          <p className="text-xs text-text-muted mb-1">Avg</p>
          <p className="text-lg font-bold text-text-primary">18 <span className="text-xs font-normal text-text-muted">ms</span></p>
        </div>
        <div>
          <p className="text-xs text-text-muted mb-1">Max</p>
          <p className="text-lg font-bold text-accent-amber">24 <span className="text-xs font-normal text-text-muted">ms</span></p>
        </div>
      </div>
    </motion.div>
  );
}
