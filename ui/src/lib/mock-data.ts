// Mock data matching the Rust scanner output format
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
  neighbors?: NeighborInfo[];
}

export interface NeighborInfo {
  local_port: string;
  remote_device: string;
  remote_port: string;
  remote_ip?: string;
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

// Mock scan result data
export const mockScanResult: ScanResult = {
  interface_name: 'Ethernet',
  local_ip: '192.168.1.100',
  local_mac: '00:11:22:33:44:55',
  subnet: '192.168.1.0/24',
  scan_method: 'Active ARP + ICMP',
  arp_discovered: 12,
  icmp_discovered: 10,
  total_hosts: 12,
  scan_duration_ms: 4250,
  active_hosts: [
    {
      ip: '192.168.1.1',
      mac: 'AA:BB:CC:DD:EE:01',
      vendor: 'TP-Link Technologies',
      response_time_ms: 2,
      ttl: 64,
      os_guess: 'Linux/Unix/macOS',
      device_type: 'ROUTER',
      risk_score: 15,
      open_ports: [80, 443],
      discovery_method: 'ARP+ICMP+TCP',
      hostname: 'router.local',
    },
    {
      ip: '192.168.1.2',
      mac: 'AA:BB:CC:DD:EE:02',
      vendor: 'Cisco Systems',
      response_time_ms: 1,
      ttl: 255,
      os_guess: 'Network Device (Router/Switch)',
      device_type: 'SWITCH',
      risk_score: 10,
      open_ports: [22, 443],
      discovery_method: 'ARP+ICMP+TCP',
      hostname: 'switch-01',
    },
    {
      ip: '192.168.1.10',
      mac: 'AA:BB:CC:DD:EE:10',
      vendor: 'Dell Technologies',
      response_time_ms: 5,
      ttl: 128,
      os_guess: 'Windows',
      device_type: 'SERVER',
      risk_score: 35,
      open_ports: [22, 80, 443, 3389],
      discovery_method: 'ARP+ICMP+TCP',
      hostname: 'file-server',
      system_description: 'Windows Server 2022',
    },
    {
      ip: '192.168.1.20',
      mac: 'AA:BB:CC:DD:EE:20',
      vendor: 'Apple Inc',
      response_time_ms: 3,
      ttl: 64,
      os_guess: 'Linux/Unix/macOS',
      device_type: 'LAPTOP',
      risk_score: 12,
      open_ports: [],
      discovery_method: 'ARP+ICMP',
      hostname: 'MacBook-Pro',
    },
    {
      ip: '192.168.1.21',
      mac: 'AA:BB:CC:DD:EE:21',
      vendor: 'Lenovo',
      response_time_ms: 8,
      ttl: 128,
      os_guess: 'Windows',
      device_type: 'PC',
      risk_score: 25,
      open_ports: [445, 3389],
      discovery_method: 'ARP+ICMP+TCP',
      hostname: 'DESKTOP-USER01',
    },
    {
      ip: '192.168.1.30',
      mac: 'AA:BB:CC:DD:EE:30',
      vendor: 'Samsung Electronics',
      response_time_ms: 12,
      ttl: 64,
      device_type: 'MOBILE',
      risk_score: 5,
      open_ports: [],
      discovery_method: 'ARP+ICMP',
      hostname: 'Galaxy-S24',
    },
    {
      ip: '192.168.1.31',
      mac: 'AA:BB:CC:DD:EE:31',
      vendor: 'Apple Inc',
      response_time_ms: 15,
      ttl: 64,
      device_type: 'MOBILE',
      risk_score: 5,
      open_ports: [],
      discovery_method: 'ARP+ICMP',
      hostname: 'iPhone-Ryan',
    },
    {
      ip: '192.168.1.40',
      mac: 'AA:BB:CC:DD:EE:40',
      vendor: 'Hikvision Digital Technology',
      response_time_ms: 20,
      ttl: 64,
      device_type: 'CAMERA',
      risk_score: 55,
      open_ports: [80, 554, 8080],
      discovery_method: 'ARP+ICMP+TCP',
      hostname: 'cam-entrance',
    },
    {
      ip: '192.168.1.41',
      mac: 'AA:BB:CC:DD:EE:41',
      vendor: 'Hikvision Digital Technology',
      response_time_ms: 18,
      ttl: 64,
      device_type: 'CAMERA',
      risk_score: 55,
      open_ports: [80, 554],
      discovery_method: 'ARP+ICMP+TCP',
      hostname: 'cam-backyard',
    },
    {
      ip: '192.168.1.50',
      mac: 'AA:BB:CC:DD:EE:50',
      vendor: 'Canon Inc',
      response_time_ms: 25,
      ttl: 64,
      device_type: 'PRINTER',
      risk_score: 20,
      open_ports: [80, 631, 9100],
      discovery_method: 'ARP+ICMP+TCP',
      hostname: 'Canon-LBP',
    },
    {
      ip: '192.168.1.60',
      mac: 'AA:BB:CC:DD:EE:60',
      vendor: 'Espressif Systems',
      response_time_ms: 30,
      ttl: 64,
      device_type: 'IOT_DEVICE',
      risk_score: 45,
      open_ports: [80],
      discovery_method: 'ARP+ICMP+TCP',
      hostname: 'smart-plug-01',
    },
    {
      ip: '192.168.1.100',
      mac: '00:11:22:33:44:55',
      vendor: 'Intel Corporate',
      response_time_ms: 0,
      device_type: 'PC',
      risk_score: 0,
      open_ports: [],
      discovery_method: 'LOCAL',
      hostname: 'my-computer',
    },
  ],
};
