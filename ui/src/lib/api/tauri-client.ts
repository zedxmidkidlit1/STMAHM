import { invoke } from "@tauri-apps/api/core";
import type {
  AlertRecord,
  DeviceRecord,
  HostInfo,
  MonitoringStatus,
  NetworkHealth,
  NetworkStats,
  PingResult,
  PortScanResult,
  ScanRecord,
  ScanResult,
  VendorLookupResult,
} from "./types";
import { isTauri } from "../runtime/is-tauri";

type InvokeArgs = Record<string, unknown> | undefined;

function normalizeError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown Tauri command error";
}

async function invokeCommand<T>(command: string, args?: InvokeArgs): Promise<T> {
  if (!isTauri()) {
    throw new Error("Tauri runtime unavailable");
  }

  try {
    return await invoke<T>(command, args);
  } catch (error) {
    throw new Error(normalizeError(error));
  }
}

export const tauriClient = {
  // Scanner
  scanNetwork: () => invokeCommand<ScanResult>("scan_network"),
  mockScanNetwork: () => invokeCommand<ScanResult>("mock_scan_network"),
  getInterfaces: () => invokeCommand<string[]>("get_interfaces"),

  // Database
  getScanHistory: (limit = 20) =>
    invokeCommand<ScanRecord[]>("get_scan_history", { limit }),
  getAllDevices: () => invokeCommand<DeviceRecord[]>("get_all_devices"),
  getDeviceByMac: (mac: string) =>
    invokeCommand<DeviceRecord | null>("get_device_by_mac", { mac }),
  updateDeviceName: (mac: string, name: string) =>
    invokeCommand<void>("update_device_name", { mac, name }),
  getNetworkStats: () => invokeCommand<NetworkStats>("get_network_stats"),
  getUnreadAlerts: () => invokeCommand<AlertRecord[]>("get_unread_alerts"),
  markAlertRead: (alertId: number) =>
    invokeCommand<void>("mark_alert_read", { alertId }),
  markAllAlertsRead: () => invokeCommand<void>("mark_all_alerts_read"),
  clearAllAlerts: () => invokeCommand<void>("clear_all_alerts"),
  getDatabasePath: () => invokeCommand<string>("get_database_path"),

  // Monitoring
  startMonitoring: (intervalSeconds?: number) =>
    invokeCommand<void>("start_monitoring", { intervalSeconds }),
  stopMonitoring: () => invokeCommand<void>("stop_monitoring"),
  getMonitoringStatus: () =>
    invokeCommand<MonitoringStatus>("get_monitoring_status"),

  // Insights
  getNetworkHealth: () => invokeCommand<NetworkHealth>("get_network_health"),
  getDeviceDistribution: () =>
    invokeCommand<Record<string, unknown>>("get_device_distribution"),
  getScanResultSchema: () =>
    invokeCommand<Record<string, unknown>>("get_scan_result_schema"),

  // Exports
  exportDevicesToCsv: () => invokeCommand<string>("export_devices_to_csv"),
  exportScanToCsv: (hosts: HostInfo[]) =>
    invokeCommand<string>("export_scan_to_csv", { hosts }),
  exportTopologyToJson: (hosts: HostInfo[], network: string) =>
    invokeCommand<string>("export_topology_to_json", { hosts, network }),
  exportScanToJson: (scan: ScanResult) =>
    invokeCommand<string>("export_scan_to_json", { scan }),
  exportScanReport: (scan: ScanResult, hosts: HostInfo[]) =>
    invokeCommand<number[]>("export_scan_report", { scan, hosts }),
  exportSecurityReport: (hosts: HostInfo[]) =>
    invokeCommand<number[]>("export_security_report", { hosts }),

  // Tools
  pingHost: (target: string, count: number) =>
    invokeCommand<PingResult[]>("ping_host", { target, count }),
  scanPorts: (target: string, ports: number[]) =>
    invokeCommand<PortScanResult[]>("scan_ports", { target, ports }),
  lookupMacVendor: (mac: string) =>
    invokeCommand<VendorLookupResult>("lookup_mac_vendor", { mac }),

  // Demo
  getDemoAlerts: () => invokeCommand<AlertRecord[]>("get_demo_alerts"),
};

