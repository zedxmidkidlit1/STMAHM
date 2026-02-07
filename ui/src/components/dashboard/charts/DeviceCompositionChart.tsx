import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DeviceCompositionPoint {
  type: string;
  count: number;
}

interface DeviceCompositionChartProps {
  data: DeviceCompositionPoint[];
}

export default function DeviceCompositionChart({ data }: DeviceCompositionChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ left: 12 }}>
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} />
        <YAxis type="category" dataKey="type" width={96} tick={{ fontSize: 11 }} tickLine={false} />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: "1px solid rgba(148,163,184,0.35)",
            backgroundColor: "rgba(15,23,42,0.92)",
            color: "#e2e8f0",
          }}
        />
        <Bar dataKey="count" radius={[0, 8, 8, 0]} fill="#0ea5e9" />
      </BarChart>
    </ResponsiveContainer>
  );
}
