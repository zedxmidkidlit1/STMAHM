//! Build script for the Tauri application
//! 
//! Configures library paths for Npcap SDK on Windows

fn main() {
    // Tauri build setup
    tauri_build::build();

    // Configure Npcap SDK path for Windows
    // The Npcap SDK is required for pnet crate to work on Windows
    #[cfg(target_os = "windows")]
    {
        // Try common Npcap SDK locations
        let possible_paths = [
            "C:\\npcap-sdk\\Lib\\x64",
            "C:\\Program Files\\Npcap\\SDK\\Lib\\x64",
            "C:\\Npcap SDK\\Lib\\x64",
        ];

        for path in &possible_paths {
            if std::path::Path::new(path).exists() {
                println!("cargo:rustc-link-search=native={}", path);
                return;
            }
        }

        // If not found in common locations, check environment variable
        if let Ok(npcap_path) = std::env::var("NPCAP_SDK") {
            println!("cargo:rustc-link-search=native={}\\Lib\\x64", npcap_path);
        } else {
            // Print warning but still try to link
            println!("cargo:warning=Npcap SDK not found. Please install Npcap SDK and set NPCAP_SDK environment variable.");
            println!("cargo:warning=Download from: https://npcap.com/#download");
            
            // Try the user's path as fallback
            println!("cargo:rustc-link-search=native=C:\\npcap-sdk\\Lib\\x64");
        }
    }
}
