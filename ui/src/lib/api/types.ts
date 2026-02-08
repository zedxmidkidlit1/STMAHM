export interface VulnerabilityInfo {
  cve_id: string;
  description: string;
  severity: string;
  cvss_score?: number;
}

export interface PortWarning {
  port: number;
  service: string;
  warning: string;
  severity: string;
  recommendation?: string;
}

export interface HostInfo {
  ip: string;
  mac: string;
  vendor?: string;
  is_randomized?: boolean;
  response_time_ms?: number | null;
  ttl?: number;
  os_guess?: string;
  device_type: string;
  risk_score: number;
  open_ports?: number[];
  discovery_method: string;
  hostname?: string;
  system_description?: string;
  uptime_seconds?: number;
  vulnerabilities?: VulnerabilityInfo[];
  port_warnings?: PortWarning[];
  security_grade?: string;
  last_seen?: string;
}

export interface ScanResult {
  interface_name: string;
  local_ip: string;
  local_mac: string;
  subnet: string;
  scan_method: string;
  arp_discovered: number;
  icmp_discovered: number;
  total_hosts: number;
  scan_duration_ms: number;
  active_hosts: HostInfo[];
}

export interface ScanRecord {
  id: number;
  scan_time: string;
  interface_name: string;
  local_ip: string;
  local_mac: string;
  subnet: string;
  scan_method: string;
  arp_discovered: number;
  icmp_discovered: number;
  total_hosts: number;
  duration_ms: number;
}

export interface DeviceRecord {
  id: number;
  mac: string;
  first_seen: string;
  last_seen: string;
  last_ip?: string;
  vendor?: string;
  device_type?: string;
  hostname?: string;
  os_guess?: string;
  custom_name?: string;
  notes?: string;
}

export interface AlertRecord {
  id: number;
  created_at: string;
  alert_type: string;
  device_id?: number;
  device_mac?: string;
  device_ip?: string;
  message: string;
  severity: string;
  is_read: boolean;
}

export interface NetworkStats {
  total_devices: number;
  online_devices: number;
  offline_devices: number;
  new_devices_24h: number;
  high_risk_devices: number;
  total_scans: number;
  last_scan_time?: string;
}

export interface NetworkHealth {
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

export interface MonitoringStatus {
  is_running: boolean;
  interval_seconds: number;
  scan_count: number;
  last_scan_time?: string;
  devices_online: number;
  devices_total: number;
}

export type NetworkEventType =
  | { type: "MonitoringStarted"; data: { interval_seconds: number } }
  | { type: "MonitoringStopped" }
  | { type: "ScanStarted"; data: { scan_number: number } }
  | {
      type: "ScanProgress";
      data: { phase: string; percent: number; message: string };
    }
  | {
      type: "ScanCompleted";
      data: { scan_number: number; hosts_found: number; duration_ms: number };
    }
  | {
      type: "NewDeviceDiscovered";
      data: { ip: string; mac: string; hostname?: string; device_type: string };
    }
  | {
      type: "DeviceWentOffline";
      data: { mac: string; last_ip: string; hostname?: string };
    }
  | {
      type: "DeviceCameOnline";
      data: { mac: string; ip: string; hostname?: string };
    }
  | {
      type: "DeviceIpChanged";
      data: { mac: string; old_ip: string; new_ip: string };
    }
  | { type: "MonitoringError"; data: { message: string } };

export interface PingResult {
  success: boolean;
  latency_ms: number | null;
  ttl: number | null;
  os_guess: string | null;
  error: string | null;
}

export interface PortScanResult {
  port: number;
  is_open: boolean;
  service: string | null;
}

export interface VendorLookupResult {
  mac: string;
  vendor: string | null;
  is_randomized: boolean;
}

