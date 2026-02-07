import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ScanTrendPoint {
  label: string;
  hosts: number;
  duration: number;
}

interface ScanThroughputChartProps {
  data: ScanTrendPoint[];
}

export default function ScanThroughputChart({ data }: ScanThroughputChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="hostsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.03} />
          </linearGradient>
          <linearGradient id="durationFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.22} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
        <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} />
        <YAxis tick={{ fontSize: 12 }} tickLine={false} />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid rgba(148,163,184,0.35)",
            backgroundColor: "rgba(15,23,42,0.92)",
            color: "#e2e8f0",
          }}
        />
        <Area
          type="monotone"
          dataKey="hosts"
          stroke="#06b6d4"
          strokeWidth={2.4}
          fill="url(#hostsFill)"
          name="Hosts"
        />
        <Area
          type="monotone"
          dataKey="duration"
          stroke="#f59e0b"
          strokeWidth={2}
          fill="url(#durationFill)"
          name="Duration (s)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
