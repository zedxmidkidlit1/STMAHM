//! AI Insights module
//!
//! Rule-based network analysis and recommendations

pub mod health;
pub mod distribution;
pub mod recommendations;

pub use health::*;
pub use distribution::*;
pub use recommendations::*;
