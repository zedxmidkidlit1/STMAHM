//! Network Topology Mapper - Host Discovery Library
//!
//! This crate provides network scanning capabilities:
//! - Active ARP scanning for Layer 2 discovery
//! - ICMP ping for latency measurement
//! - TCP port probing for service detection
//! - SNMP enrichment for device details (optional)

pub mod config;
pub mod models;
pub mod network;
pub mod scanner;

pub use config::*;
pub use models::*;
pub use network::{calculate_risk_score, calculate_subnet_ips, dns_scan, find_valid_interface, infer_device_type, is_local_subnet, is_special_address, lookup_vendor, lookup_vendor_info, DeviceType};
pub use scanner::{active_arp_scan, icmp_scan, guess_os_from_ttl, IcmpResult, snmp_enrich, tcp_probe_scan, SnmpData, SnmpNeighbor};
