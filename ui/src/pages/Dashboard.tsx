import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Bell,
  CheckCircle2,
  Cpu,
  Gauge,
  Loader2,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  Shield,
  ShieldAlert,
  Timer,
  Wifi,
  WifiOff,
} from "lucide-react";
import { useMonitoring, type NetworkEventType } from "../hooks/useMonitoring";
import { useScanContext } from "../hooks/useScan";
import { tauriClient } from "../lib/api/tauri-client";

interface DeviceRecord {
  mac: string;
  vendor?: string | null;
  device_type?: string | null;
  last_seen: string;
}

interface NetworkStats {
  total_devices: number;
  online_devices: number;
  offline_devices: number;
  new_devices_24h: number;
  high_risk_devices: number;
  total_scans: number;
  last_scan_time?: string;
}

interface NetworkHealth {
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

interface ScanRecord {
  id: number;
  scan_time: string;
  subnet: string;
  total_hosts: number;
  duration_ms: number;
}

interface AlertRecord {
  id: number;
  severity: string;
  is_read: boolean;
}

interface DashboardPayload {
  devices: DeviceRecord[];
  stats: NetworkStats | null;
  health: NetworkHealth | null;
  scans: ScanRecord[];
  alerts: AlertRecord[];
  distribution: Record<string, number> | null;
  fetchedAt: Date;
}

const CARD =
  "rounded-2xl border border-slate-200/70 bg-white/85 backdrop-blur-sm shadow-sm dark:border-slate-800 dark:bg-slate-950/65";

const ScanThroughputChart = lazy(() => import("../components/dashboard/charts/ScanThroughputChart"));
const DeviceCompositionChart = lazy(
  () => import("../components/dashboard/charts/DeviceCompositionChart"),
);

function ChartFallback({ heightClass }: { heightClass: string }) {
  return (
    <div className={`${heightClass} animate-pulse rounded-xl bg-slate-100/70 dark:bg-slate-900/60`} />
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  tone,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  tone: "cyan" | "emerald" | "amber" | "rose";
}) {
  const toneClasses = {
    cyan: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",
    emerald:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    amber:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    rose: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  };

  return (
    <div className={`${CARD} p-5`}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wider text-text-muted">{title}</p>
          <p className="text-3xl font-black text-text-primary">{value}</p>
          <p className="text-xs text-text-secondary">{subtitle}</p>
        </div>
        <div className={`rounded-xl p-3 ${toneClasses[tone]}`}>{icon}</div>
      </div>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  colorClass,
}: {
  label: string;
  value: number;
  colorClass: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-secondary">{label}</span>
        <span className="font-semibold text-text-primary">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
        <motion.div
          className={`h-2 rounded-full ${colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function eventLabel(event: NetworkEventType): string {
  switch (event.type) {
    case "MonitoringStarted":
      return `Monitoring started (${event.data.interval_seconds}s interval)`;
    case "MonitoringStopped":
      return "Monitoring stopped";
    case "ScanStarted":
      return `Scan #${event.data.scan_number} started`;
    case "ScanProgress":
      return `${event.data.phase}: ${event.data.message}`;
    case "ScanCompleted":
      return `Scan #${event.data.scan_number} completed (${event.data.hosts_found} hosts)`;
    case "NewDeviceDiscovered":
      return `New device ${event.data.hostname || event.data.ip}`;
    case "DeviceWentOffline":
      return `Device offline ${event.data.hostname || event.data.last_ip}`;
    case "DeviceCameOnline":
      return `Device online ${event.data.hostname || event.data.ip}`;
    case "DeviceIpChanged":
      return `IP changed ${event.data.old_ip} -> ${event.data.new_ip}`;
    case "MonitoringError":
      return `Error: ${event.data.message}`;
    default:
      return "Unknown event";
  }
}

function eventIcon(event: NetworkEventType) {
  if (event.type === "MonitoringError") {
    return <AlertTriangle className="h-4 w-4 text-rose-500" />;
  }
  if (event.type === "NewDeviceDiscovered" || event.type === "DeviceCameOnline") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
  }
  if (event.type === "DeviceWentOffline") {
    return <WifiOff className="h-4 w-4 text-amber-500" />;
  }
  return <Activity className="h-4 w-4 text-cyan-500" />;
}

export default function Dashboard() {
  const { scanResult } = useScanContext();
  const monitor = useMonitoring();
  const autoStartedMonitor = useRef(false);

  const [payload, setPayload] = useState<DashboardPayload>({
    devices: [],
    stats: null,
    health: null,
    scans: [],
    alerts: [],
    distribution: null,
    fetchedAt: new Date(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(
    async (background = false) => {
      if (background) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        setError(null);
        const [devices, stats, health, scans, alerts, distributionPayload] =
          await Promise.all([
          tauriClient.getAllDevices().catch(() => []),
          tauriClient.getNetworkStats().catch(() => null),
          tauriClient.getNetworkHealth().catch(() => null),
          tauriClient.getScanHistory(14).catch(() => []),
          tauriClient.getUnreadAlerts().catch(() => []),
          tauriClient.getDeviceDistribution().catch(() => null),
        ]);

        const distribution =
          distributionPayload &&
          typeof distributionPayload === "object" &&
          distributionPayload.by_type &&
          typeof distributionPayload.by_type === "object"
            ? (distributionPayload.by_type as Record<string, number>)
            : null;

        setPayload({
          devices,
          stats,
          health,
          scans,
          alerts,
          distribution,
          fetchedAt: new Date(),
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    void fetchDashboardData(false);
    const timer = setInterval(() => {
      void fetchDashboardData(true);
    }, 30000);
    return () => clearInterval(timer);
  }, [fetchDashboardData]);

  useEffect(() => {
    let shouldStopOnUnmount = false;

    // Prevent repeated auto-start attempts on re-renders.
    if (autoStartedMonitor.current) {
      return;
    }

    try {
      const rawSettings = localStorage.getItem("netmapper-settings");
      if (rawSettings) {
        const parsed = JSON.parse(rawSettings);
        const monitoringEnabled = parsed?.monitoringEnabled === true;
        const interval = Number(parsed?.monitoringInterval);
        const monitoringInterval =
          Number.isFinite(interval) && interval > 0 ? interval : undefined;

        if (monitoringEnabled) {
          shouldStopOnUnmount = true;
          autoStartedMonitor.current = true;
          void monitor.startMonitoring(monitoringInterval);
        }
      }
    } catch {
      // Ignore malformed settings and keep default behavior.
    }

    return () => {
      if (shouldStopOnUnmount && autoStartedMonitor.current) {
        autoStartedMonitor.current = false;
        void monitor.stopMonitoring();
      }
    };
  }, [monitor.startMonitoring, monitor.stopMonitoring]);

  useEffect(() => {
    if (monitor.events.length > 0) {
      void fetchDashboardData(true);
    }
  }, [monitor.events.length, fetchDashboardData]);

  const activeDevices24h = useMemo(() => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return payload.devices.filter((d) => new Date(d.last_seen).getTime() > cutoff).length;
  }, [payload.devices]);

  const unknownDevices = useMemo(
    () =>
      payload.devices.filter(
        (d) => !d.device_type || d.device_type === "UNKNOWN" || !d.vendor,
      ).length,
    [payload.devices],
  );

  const criticalAlerts = useMemo(
    () =>
      payload.alerts.filter(
        (a) => !a.is_read && a.severity.toLowerCase() === "critical",
      ).length,
    [payload.alerts],
  );

  const avgLatency = useMemo(() => {
    const latencies =
      scanResult?.active_hosts
        .map((h) => h.response_time_ms)
        .filter((n): n is number => n !== null && n !== undefined) ?? [];
    if (latencies.length === 0) return null;
    return Math.round(latencies.reduce((sum, n) => sum + n, 0) / latencies.length);
  }, [scanResult]);

  const scanTrendData = useMemo(
    () =>
      [...payload.scans]
        .reverse()
        .map((scan) => ({
          label: new Date(scan.scan_time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          hosts: scan.total_hosts,
          duration: Number((scan.duration_ms / 1000).toFixed(1)),
        })),
    [payload.scans],
  );

  const deviceTypeData = useMemo(() => {
    if (payload.distribution) {
      return Object.entries(payload.distribution)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);
    }

    const counts = new Map<string, number>();
    for (const d of payload.devices) {
      const key = d.device_type || "UNKNOWN";
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return [...counts.entries()]
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [payload.devices]);

  const riskLabel = useMemo(() => {
    const score = payload.health?.score ?? 0;
    if (score >= 85) return "Hardened";
    if (score >= 70) return "Stable";
    if (score >= 50) return "At Risk";
    return "Critical";
  }, [payload.health]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-bg-primary">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-cyan-500" />
          <p className="text-sm text-text-secondary">Loading command center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 overflow-y-auto bg-bg-primary p-4 sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 -left-16 h-80 w-80 rounded-full bg-cyan-300/15 blur-3xl dark:bg-cyan-500/10" />
        <div className="absolute top-20 right-0 h-96 w-96 rounded-full bg-amber-300/10 blur-3xl dark:bg-amber-500/10" />
      </div>

      <div className="relative z-10 space-y-6">
        <motion.section
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${CARD} overflow-hidden p-5 sm:p-6`}
        >
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-300">
                Network Command Center
              </p>
              <h1 className="text-2xl font-black text-text-primary sm:text-4xl">
                Operational Dashboard
              </h1>
              <p className="max-w-2xl text-sm text-text-secondary sm:text-base">
                Live monitoring, security posture, scan telemetry, and device intelligence in a
                single control surface.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => void fetchDashboardData(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300/80 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button
                onClick={() =>
                  monitor.status.is_running
                    ? void monitor.stopMonitoring()
                    : void monitor.startMonitoring(monitor.status.interval_seconds || 60)
                }
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm shadow-cyan-800/30 transition hover:brightness-110"
              >
                {monitor.status.is_running ? (
                  <>
                    <PauseCircle className="h-4 w-4" />
                    Stop Monitor
                  </>
                ) : (
                  <>
                    <PlayCircle className="h-4 w-4" />
                    Start Monitor
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-cyan-200/80 bg-cyan-50/80 p-3 dark:border-cyan-500/30 dark:bg-cyan-500/10">
              <p className="text-xs text-text-secondary">Monitoring</p>
              <p className="text-sm font-bold text-text-primary">
                {monitor.status.is_running ? "Active" : "Idle"}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/80 p-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <p className="text-xs text-text-secondary">Scan Cycles</p>
              <p className="text-sm font-bold text-text-primary">{monitor.status.scan_count}</p>
            </div>
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 p-3 dark:border-amber-500/30 dark:bg-amber-500/10">
              <p className="text-xs text-text-secondary">Risk Tier</p>
              <p className="text-sm font-bold text-text-primary">{riskLabel}</p>
            </div>
            <div className="rounded-xl border border-slate-300/80 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-900/60">
              <p className="text-xs text-text-secondary">Last Sync</p>
              <p className="text-sm font-bold text-text-primary">
                {payload.fetchedAt.toLocaleTimeString()}
              </p>
            </div>
          </div>

          {monitor.currentPhase && (
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>{monitor.currentPhase}</span>
                <span>{monitor.currentProgress}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                <motion.div
                  className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500"
                  animate={{ width: `${monitor.currentProgress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>
          )}
        </motion.section>

        {error && (
          <div className="rounded-2xl border border-rose-300/60 bg-rose-100/80 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Active (24h)"
            value={String(activeDevices24h)}
            subtitle={`${payload.devices.length} known devices`}
            icon={<Wifi className="h-5 w-5" />}
            tone="cyan"
          />
          <StatCard
            title="Security Score"
            value={`${payload.health?.score ?? 0}%`}
            subtitle={`Grade ${payload.health?.grade ?? "N/A"} • ${payload.health?.status ?? "No Data"}`}
            icon={<Shield className="h-5 w-5" />}
            tone="emerald"
          />
          <StatCard
            title="Unidentified"
            value={String(unknownDevices)}
            subtitle="Missing vendor/type fingerprint"
            icon={<Cpu className="h-5 w-5" />}
            tone="amber"
          />
          <StatCard
            title="Critical Alerts"
            value={String(criticalAlerts)}
            subtitle={`${payload.alerts.length} unread alerts`}
            icon={<ShieldAlert className="h-5 w-5" />}
            tone="rose"
          />
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${CARD} p-5 xl:col-span-8`}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-primary">Scan Throughput</h2>
              <p className="text-xs text-text-secondary">Hosts and duration per scan</p>
            </div>
            <div className="h-72">
              <Suspense fallback={<ChartFallback heightClass="h-72" />}>
                <ScanThroughputChart data={scanTrendData} />
              </Suspense>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${CARD} space-y-5 p-5 xl:col-span-4`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-primary">Security Posture</h2>
              <Gauge className="h-5 w-5 text-emerald-500" />
            </div>
            <BreakdownRow
              label="Security"
              value={payload.health?.breakdown.security ?? 0}
              colorClass="bg-emerald-500"
            />
            <BreakdownRow
              label="Stability"
              value={payload.health?.breakdown.stability ?? 0}
              colorClass="bg-cyan-500"
            />
            <BreakdownRow
              label="Compliance"
              value={payload.health?.breakdown.compliance ?? 0}
              colorClass="bg-amber-500"
            />
            <div className="space-y-2 rounded-xl border border-slate-200/70 bg-slate-100/80 p-3 dark:border-slate-700 dark:bg-slate-900/60">
              {(payload.health?.insights ?? ["No insights available"]).slice(0, 4).map((i) => (
                <p key={i} className="text-xs text-text-secondary">
                  {i}
                </p>
              ))}
            </div>
          </motion.div>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <div className={`${CARD} p-5 xl:col-span-5`}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-primary">Device Composition</h2>
              <Cpu className="h-5 w-5 text-cyan-500" />
            </div>
            <div className="h-64">
              <Suspense fallback={<ChartFallback heightClass="h-64" />}>
                <DeviceCompositionChart data={deviceTypeData} />
              </Suspense>
            </div>
          </div>

          <div className={`${CARD} p-5 xl:col-span-7`}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-primary">Live Activity Stream</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={monitor.clearEvents}
                  className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Clear
                </button>
                <div className="rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300">
                  {monitor.status.is_running ? "Live" : "Paused"}
                </div>
              </div>
            </div>

            {monitor.error && (
              <div className="mb-3 rounded-lg border border-rose-300/70 bg-rose-100/70 px-3 py-2 text-xs text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
                {monitor.error}
              </div>
            )}

            <div className="max-h-72 space-y-2 overflow-y-auto">
              {monitor.events.length === 0 ? (
                <div className="flex min-h-44 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300/80 text-sm text-text-muted dark:border-slate-700">
                  <Bell className="h-6 w-6" />
                  <p>No recent events captured</p>
                </div>
              ) : (
                monitor.events.slice(0, 10).map((event, idx) => (
                  <div
                    key={`${event.type}-${idx}`}
                    className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-slate-100/70 px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900/60"
                  >
                    {eventIcon(event)}
                    <div className="min-w-0">
                      <p className="text-sm text-text-primary">{eventLabel(event)}</p>
                      <p className="text-xs text-text-muted">Event #{monitor.events.length - idx}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className={`${CARD} p-4`}>
            <div className="mb-2 flex items-center gap-2">
              <Timer className="h-4 w-4 text-cyan-500" />
              <p className="text-sm font-bold text-text-primary">Average Latency</p>
            </div>
            <p className="text-2xl font-black text-text-primary">
              {avgLatency !== null ? `${avgLatency} ms` : "No data"}
            </p>
            <p className="text-xs text-text-secondary">Computed from latest active scan results.</p>
          </div>

          <div className={`${CARD} p-4`}>
            <div className="mb-2 flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-500" />
              <p className="text-sm font-bold text-text-primary">Risk Devices</p>
            </div>
            <p className="text-2xl font-black text-text-primary">
              {payload.stats?.high_risk_devices ?? 0}
            </p>
            <p className="text-xs text-text-secondary">Devices with risk score above policy threshold.</p>
          </div>

          <div className={`${CARD} p-4`}>
            <div className="mb-2 flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-500" />
              <p className="text-sm font-bold text-text-primary">Last Scan</p>
            </div>
            <p className="text-2xl font-black text-text-primary">
              {payload.stats?.last_scan_time
                ? new Date(payload.stats.last_scan_time).toLocaleTimeString()
                : "Never"}
            </p>
            <p className="text-xs text-text-secondary">Latest persisted network scan timestamp.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
