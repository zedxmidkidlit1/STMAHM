//! Real-time network monitoring module
//!
//! Provides background scanning and live event emission

pub mod events;
pub mod watcher;
pub mod passive_integration;

pub use events::*;
pub use watcher::*;
pub use passive_integration::*;
