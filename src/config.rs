//! Configuration constants for the Network Topology Mapper

use std::time::Duration;

/// Maximum concurrent ping operations
pub const MAX_CONCURRENT_PINGS: usize = 100;

/// Timeout for each ICMP ping request
pub const PING_TIMEOUT: Duration = Duration::from_secs(2);

/// Number of ping retries per host
pub const PING_RETRIES: u8 = 2;

/// Default subnet prefix length when interface doesn't provide one
pub const DEFAULT_PREFIX_LEN: u8 = 24;

// ====== ARP Adaptive Scan Configuration ======

/// Maximum total wait time for ARP replies (ms)
pub const ARP_MAX_WAIT_MS: u64 = 1500;

/// Interval to check for new hosts (ms)
pub const ARP_CHECK_INTERVAL_MS: u64 = 200;

/// Stop early if no new hosts for this duration (ms)
pub const ARP_IDLE_TIMEOUT_MS: u64 = 400;

/// Number of ARP scan rounds (optional 2nd round for stragglers)
pub const ARP_ROUNDS: u8 = 2;

/// TCP probe timeout
pub const TCP_PROBE_TIMEOUT: Duration = Duration::from_millis(500);

/// Common ports to probe for host detection
pub const TCP_PROBE_PORTS: &[u16] = &[22, 80, 443, 445, 8080, 3389, 5353, 62078];

// ====== SNMP Configuration (Optional Feature) ======

/// Enable SNMP enrichment for discovered hosts (disabled by default)
pub const SNMP_ENABLED: bool = false;

/// SNMP community string for v1/v2c
pub const SNMP_COMMUNITY: &str = "public";

/// SNMP query timeout
pub const SNMP_TIMEOUT: Duration = Duration::from_secs(2);

/// SNMP port
pub const SNMP_PORT: u16 = 161;
