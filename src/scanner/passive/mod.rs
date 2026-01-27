//! Passive network discovery module
//!
//! Discovers devices without sending packets:
//! - mDNS/DNS-SD: Listen for service announcements
//! - ARP monitoring: Observe ARP traffic
//! - DHCP snooping: Capture DHCP requests

pub mod mdns;
pub mod arp;

pub use mdns::PassiveScanner;
pub use arp::{ArpMonitor, ArpEvent};
