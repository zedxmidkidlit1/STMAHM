//! Tauri commands that bridge the UI to the Rust scanner
//!
//! These commands are callable from the React frontend via `invoke()`.

use std::time::Instant;

// Re-export types from the scanner library
use host_discovery::{
    ScanResult, HostInfo,
    find_valid_interface, calculate_subnet_ips,
    active_arp_scan, icmp_scan, tcp_probe_scan, dns_scan,
    lookup_vendor_info, infer_device_type, calculate_risk_score,
    guess_os_from_ttl,
};

/// Perform a network scan
/// 
/// This calls the existing host-discovery scanner library.
#[tauri::command]
pub async fn scan_network() -> Result<ScanResult, String> {
    let start = Instant::now();
    
    // Find a valid network interface
    let interface = find_valid_interface()
        .map_err(|e| format!("Failed to find network interface: {}", e))?;

    // Calculate subnet IPs
    let (subnet, ips) = calculate_subnet_ips(&interface)
        .map_err(|e| format!("Failed to calculate subnet: {}", e))?;

    // Run ARP scan (blocking, so we spawn it)
    let arp_hosts = {
        let interface_clone = interface.clone();
        let ips_clone = ips.clone();
        let subnet_clone = subnet.clone();
        
        tokio::task::spawn_blocking(move || {
            active_arp_scan(&interface_clone, &ips_clone, &subnet_clone)
        })
        .await
        .map_err(|e| format!("ARP scan task failed: {}", e))?
        .map_err(|e| format!("ARP scan failed: {}", e))?
    };

    let arp_count = arp_hosts.len();

    // Run ICMP and TCP scans in parallel
    let (response_times, port_results) = tokio::join!(
        icmp_scan(&arp_hosts),
        tcp_probe_scan(&arp_hosts)
    );

    let response_times = response_times.map_err(|e| format!("ICMP scan failed: {}", e))?;
    let port_results = port_results.map_err(|e| format!("TCP scan failed: {}", e))?;

    let icmp_count = response_times.len();

    // DNS lookup
    let host_ips: Vec<std::net::Ipv4Addr> = arp_hosts
        .keys()
        .filter(|ip| **ip != interface.ip)
        .copied()
        .collect();
    
    let dns_hostnames = dns_scan(&host_ips).await;

    // Build host info list
    let mut active_hosts: Vec<HostInfo> = arp_hosts
        .iter()
        .filter(|(ip, _)| **ip != interface.ip)
        .map(|(ip, mac)| {
            let icmp_result = response_times.get(ip);
            let response_time = icmp_result.map(|r| r.duration.as_millis() as u64);
            let ttl = icmp_result.and_then(|r| r.ttl);
            let os_guess = ttl.map(guess_os_from_ttl);
            let open_ports = port_results.get(ip).cloned().unwrap_or_default();
            
            let mac_str = format!("{}", mac);
            let vendor_info = lookup_vendor_info(&mac_str);
            
            let is_gateway = ip.octets()[3] == 1 || open_ports.contains(&80);
            let device_type = infer_device_type(
                vendor_info.vendor.as_deref(),
                dns_hostnames.get(ip).map(|s| s.as_str()),
                &open_ports,
                is_gateway,
            );
            let risk_score = calculate_risk_score(
                device_type,
                &open_ports,
                vendor_info.is_randomized,
            );
            
            let method = match (response_time.is_some(), !open_ports.is_empty()) {
                (true, true) => "ARP+ICMP+TCP",
                (true, false) => "ARP+ICMP",
                (false, true) => "ARP+TCP",
                (false, false) => "ARP",
            }.to_string();

            HostInfo {
                ip: ip.to_string(),
                vendor: vendor_info.vendor,
                is_randomized: vendor_info.is_randomized,
                mac: mac_str,
                response_time_ms: response_time,
                ttl,
                os_guess,
                device_type: device_type.as_str().to_string(),
                risk_score,
                open_ports,
                discovery_method: method,
                hostname: dns_hostnames.get(ip).cloned(),
                system_description: None,
                uptime_seconds: None,
                neighbors: Vec::new(),
            }
        })
        .collect();

    // Add local machine
    let local_mac = format!("{}", interface.mac);
    let local_vendor_info = lookup_vendor_info(&local_mac);
    let local_device_type = infer_device_type(
        local_vendor_info.vendor.as_deref(),
        None,
        &[],
        false,
    );
    
    active_hosts.push(HostInfo {
        ip: interface.ip.to_string(),
        vendor: local_vendor_info.vendor,
        is_randomized: local_vendor_info.is_randomized,
        mac: local_mac,
        response_time_ms: Some(0),
        ttl: None,
        os_guess: None,
        device_type: local_device_type.as_str().to_string(),
        risk_score: 0,
        open_ports: Vec::new(),
        discovery_method: "LOCAL".to_string(),
        hostname: None,
        system_description: None,
        uptime_seconds: None,
        neighbors: Vec::new(),
    });

    // Sort by IP
    active_hosts.sort_by(|a, b| {
        let ip_a: std::net::Ipv4Addr = a.ip.parse().unwrap_or(std::net::Ipv4Addr::UNSPECIFIED);
        let ip_b: std::net::Ipv4Addr = b.ip.parse().unwrap_or(std::net::Ipv4Addr::UNSPECIFIED);
        ip_a.cmp(&ip_b)
    });

    let duration = start.elapsed().as_millis() as u64;

    Ok(ScanResult {
        interface_name: interface.name,
        local_ip: interface.ip.to_string(),
        local_mac: format!("{}", interface.mac),
        subnet: subnet.to_string(),
        scan_method: "Active ARP + ICMP + TCP".to_string(),
        arp_discovered: arp_count,
        icmp_discovered: icmp_count,
        total_hosts: active_hosts.len(),
        scan_duration_ms: duration,
        active_hosts,
    })
}

/// Get available network interfaces
#[tauri::command]
pub fn get_interfaces() -> Result<Vec<String>, String> {
    let interface = find_valid_interface()
        .map_err(|e| format!("Failed to find interfaces: {}", e))?;
    
    Ok(vec![interface.name])
}
