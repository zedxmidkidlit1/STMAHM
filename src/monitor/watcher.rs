//! Background network watcher
//!
//! Provides continuous network scanning in background thread
//! Uses callbacks for event notification (Tauri-agnostic)

use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, AtomicU32, Ordering};
use std::sync::Arc;
use std::time::{Duration, Instant};
use tokio::sync::Mutex;

use super::events::{DeviceSnapshot, MonitoringStatus, NetworkEvent};
use crate::config::{DEFAULT_MONITOR_INTERVAL, MAX_MONITOR_INTERVAL, MIN_MONITOR_INTERVAL};
use crate::{
    active_arp_scan, calculate_subnet_ips, dns_scan, find_valid_interface, icmp_scan,
    infer_device_type, lookup_vendor_info, tcp_probe_scan,
};

/// Event callback type
pub type EventCallback = Arc<dyn Fn(NetworkEvent) + Send + Sync>;

/// Background network monitor
pub struct BackgroundMonitor {
    is_running: Arc<AtomicBool>,
    interval_seconds: Arc<Mutex<u64>>,
    scan_count: Arc<AtomicU32>,
    last_scan_time: Arc<Mutex<Option<String>>>,
    /// Previous scan results for change detection (MAC -> DeviceSnapshot)
    previous_devices: Arc<Mutex<HashMap<String, DeviceSnapshot>>>,
}

impl BackgroundMonitor {
    pub fn new() -> Self {
        Self {
            is_running: Arc::new(AtomicBool::new(false)),
            interval_seconds: Arc::new(Mutex::new(DEFAULT_MONITOR_INTERVAL)),
            scan_count: Arc::new(AtomicU32::new(0)),
            last_scan_time: Arc::new(Mutex::new(None)),
            previous_devices: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// Start background monitoring with event callback
    pub async fn start<F>(&self, callback: F, interval: Option<u64>) -> Result<(), String>
    where
        F: Fn(NetworkEvent) + Send + Sync + 'static,
    {
        if self.is_running.load(Ordering::SeqCst) {
            return Err("Monitoring already running".to_string());
        }

        let interval_secs = interval
            .unwrap_or(DEFAULT_MONITOR_INTERVAL)
            .clamp(MIN_MONITOR_INTERVAL, MAX_MONITOR_INTERVAL);

        *self.interval_seconds.lock().await = interval_secs;
        self.is_running.store(true, Ordering::SeqCst);
        self.scan_count.store(0, Ordering::SeqCst);

        // Wrap callback in Arc
        let callback = Arc::new(callback);

        // Emit monitoring started event
        callback(NetworkEvent::MonitoringStarted {
            interval_seconds: interval_secs,
        });

        // Clone Arc references for the spawned task
        let is_running = Arc::clone(&self.is_running);
        let scan_count = Arc::clone(&self.scan_count);
        let last_scan_time = Arc::clone(&self.last_scan_time);
        let previous_devices = Arc::clone(&self.previous_devices);
        let interval_seconds = Arc::clone(&self.interval_seconds);
        let cb = Arc::clone(&callback);

        // Spawn background scanning task
        tokio::spawn(async move {
            eprintln!(
                "[MONITOR] Background monitoring started (interval: {}s)",
                interval_secs
            );

            while is_running.load(Ordering::SeqCst) {
                let current_scan = scan_count.fetch_add(1, Ordering::SeqCst) + 1;
                let interval = *interval_seconds.lock().await;

                // Emit scan started
                (*cb)(NetworkEvent::ScanStarted {
                    scan_number: current_scan,
                });

                eprintln!("[MONITOR] Starting scan #{}", current_scan);
                let start = Instant::now();

                // Run the actual scan
                match run_background_scan(&*cb).await {
                    Ok(devices) => {
                        let duration = start.elapsed().as_millis() as u64;

                        // Update last scan time
                        *last_scan_time.lock().await = Some(chrono::Utc::now().to_rfc3339());

                        // Detect changes
                        let mut prev = previous_devices.lock().await;
                        detect_and_emit_changes(&*cb, &prev, &devices);

                        // Update previous devices
                        *prev = devices.iter().map(|d| (d.mac.clone(), d.clone())).collect();

                        // Emit scan completed
                        (*cb)(NetworkEvent::ScanCompleted {
                            scan_number: current_scan,
                            hosts_found: devices.len(),
                            duration_ms: duration,
                        });

                        eprintln!(
                            "[MONITOR] Scan #{} complete: {} hosts in {}ms",
                            current_scan,
                            devices.len(),
                            duration
                        );
                    }
                    Err(e) => {
                        eprintln!("[MONITOR] Scan #{} failed: {}", current_scan, e);
                        (*cb)(NetworkEvent::MonitoringError { message: e });
                    }
                }

                // Wait for next interval (check every second to allow quick stop)
                for _ in 0..interval {
                    if !is_running.load(Ordering::SeqCst) {
                        break;
                    }
                    tokio::time::sleep(Duration::from_secs(1)).await;
                }
            }

            eprintln!("[MONITOR] Background monitoring stopped");
            (*cb)(NetworkEvent::MonitoringStopped);
        });

        Ok(())
    }

    /// Stop background monitoring
    pub fn stop(&self) {
        self.is_running.store(false, Ordering::SeqCst);
    }

    /// Get current monitoring status
    pub async fn status(&self) -> MonitoringStatus {
        let prev = self.previous_devices.lock().await;
        let online_count = prev.values().filter(|d| d.is_online).count();

        MonitoringStatus {
            is_running: self.is_running.load(Ordering::SeqCst),
            interval_seconds: *self.interval_seconds.lock().await,
            scan_count: self.scan_count.load(Ordering::SeqCst),
            last_scan_time: self.last_scan_time.lock().await.clone(),
            devices_online: online_count,
            devices_total: prev.len(),
        }
    }

    /// Check if monitoring is running
    pub fn is_running(&self) -> bool {
        self.is_running.load(Ordering::SeqCst)
    }
}

impl Default for BackgroundMonitor {
    fn default() -> Self {
        Self::new()
    }
}

/// Run a background scan and return device snapshots
async fn run_background_scan<F>(callback: &F) -> Result<Vec<DeviceSnapshot>, String>
where
    F: Fn(NetworkEvent),
{
    // Emit progress: Finding interface
    callback(NetworkEvent::ScanProgress {
        phase: "INIT".to_string(),
        percent: 5,
        message: "Finding network interface...".to_string(),
    });

    let interface = find_valid_interface().map_err(|e| format!("Interface error: {}", e))?;

    let (subnet, ips) =
        calculate_subnet_ips(&interface).map_err(|e| format!("Subnet error: {}", e))?;

    // Emit progress: ARP scan
    callback(NetworkEvent::ScanProgress {
        phase: "ARP".to_string(),
        percent: 20,
        message: format!("ARP scanning {} hosts...", ips.len()),
    });

    let arp_hosts = {
        let interface_clone = interface.clone();
        let ips_clone = ips.clone();
        let subnet_clone = subnet;

        tokio::task::spawn_blocking(move || {
            active_arp_scan(&interface_clone, &ips_clone, &subnet_clone)
        })
        .await
        .map_err(|e| format!("ARP task error: {}", e))?
        .map_err(|e| format!("ARP scan error: {}", e))?
    };

    // Emit progress: ICMP scan
    callback(NetworkEvent::ScanProgress {
        phase: "ICMP".to_string(),
        percent: 50,
        message: format!("ICMP scanning {} hosts...", arp_hosts.len()),
    });

    let (response_times, port_results) =
        tokio::join!(icmp_scan(&arp_hosts), tcp_probe_scan(&arp_hosts));

    let _response_times = response_times.unwrap_or_default();
    let port_results = port_results.unwrap_or_default();

    // Emit progress: DNS lookup
    callback(NetworkEvent::ScanProgress {
        phase: "DNS".to_string(),
        percent: 80,
        message: "Resolving hostnames...".to_string(),
    });

    let host_ips: Vec<std::net::Ipv4Addr> = arp_hosts
        .keys()
        .filter(|ip| **ip != interface.ip)
        .copied()
        .collect();

    let dns_hostnames = dns_scan(&host_ips).await;

    // Build device snapshots
    callback(NetworkEvent::ScanProgress {
        phase: "COMPLETE".to_string(),
        percent: 100,
        message: "Scan complete".to_string(),
    });

    let devices: Vec<DeviceSnapshot> = arp_hosts
        .iter()
        .filter(|(ip, _)| **ip != interface.ip)
        .map(|(ip, mac)| {
            let mac_str = format!("{}", mac);
            let vendor_info = lookup_vendor_info(&mac_str);
            let open_ports = port_results.get(ip).cloned().unwrap_or_default();
            let is_gateway = ip.octets()[3] == 1 || open_ports.contains(&80);

            let device_type = infer_device_type(
                vendor_info.vendor.as_deref(),
                dns_hostnames.get(ip).map(|s| s.as_str()),
                &open_ports,
                is_gateway,
            );

            DeviceSnapshot {
                mac: mac_str,
                ip: ip.to_string(),
                hostname: dns_hostnames.get(ip).cloned(),
                device_type: device_type.as_str().to_string(),
                is_online: true,
            }
        })
        .collect();

    Ok(devices)
}

/// Detect changes between scans and emit events
fn detect_and_emit_changes<F>(
    callback: &F,
    previous: &HashMap<String, DeviceSnapshot>,
    current: &[DeviceSnapshot],
) where
    F: Fn(NetworkEvent),
{
    let current_macs: HashMap<String, &DeviceSnapshot> =
        current.iter().map(|d| (d.mac.clone(), d)).collect();

    // Check for new devices
    for device in current {
        if !previous.contains_key(&device.mac) {
            eprintln!("[MONITOR] New device: {} ({})", device.ip, device.mac);
            callback(NetworkEvent::NewDeviceDiscovered {
                ip: device.ip.clone(),
                mac: device.mac.clone(),
                hostname: device.hostname.clone(),
                device_type: device.device_type.clone(),
            });
        }
    }

    // Check for offline devices
    for (mac, prev_device) in previous {
        if !current_macs.contains_key(mac) {
            eprintln!("[MONITOR] Device offline: {} ({})", prev_device.ip, mac);
            callback(NetworkEvent::DeviceWentOffline {
                mac: mac.clone(),
                last_ip: prev_device.ip.clone(),
                hostname: prev_device.hostname.clone(),
            });
        }
    }

    // Check for IP changes
    for device in current {
        if let Some(prev_device) = previous.get(&device.mac) {
            if prev_device.ip != device.ip {
                eprintln!(
                    "[MONITOR] IP changed: {} -> {} ({})",
                    prev_device.ip, device.ip, device.mac
                );
                callback(NetworkEvent::DeviceIpChanged {
                    mac: device.mac.clone(),
                    old_ip: prev_device.ip.clone(),
                    new_ip: device.ip.clone(),
                });
            }
        }
    }
}
