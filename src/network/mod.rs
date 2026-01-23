//! Network module - interface detection, subnet utilities, DNS resolution, device inference

mod device;
mod dns;
mod interface;
mod subnet;
mod vendor;

pub use device::{infer_device_type, calculate_risk_score, DeviceType};
pub use dns::dns_scan;
pub use interface::{find_valid_interface, interface_score};
pub use subnet::{calculate_subnet_ips, is_local_subnet, is_special_address};
pub use vendor::{lookup_vendor, lookup_vendor_info};
