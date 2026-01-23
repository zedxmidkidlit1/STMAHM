# 🌐 Network Topology Mapper

<div align="center">

![Rust](https://img.shields.io/badge/Rust-000000?style=for-the-badge&logo=rust&logoColor=white)
![Tauri](https://img.shields.io/badge/Tauri-FFC131?style=for-the-badge&logo=tauri&logoColor=black)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

**A high-performance network topology discovery and visualization tool built with Rust and Tauri**

[Features](#-features) • [Installation](#-installation) • [Usage](#-usage) • [Architecture](#-architecture) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

Network Topology Mapper is a cross-platform desktop application that discovers devices on your local network and visualizes the network topology in an interactive, hierarchical diagram. Built with a Rust backend for high-performance network scanning and a modern React/Tauri frontend for a beautiful user experience.

### ✨ Key Highlights

- 🚀 **High Performance** - Written in Rust for blazing-fast network scanning
- 🎨 **Beautiful UI** - Modern React interface with dark/light theme support
- 📊 **Interactive Topology** - Visualize your network as a hierarchical graph
- 🔒 **Security Analysis** - Risk scoring and device classification
- 🖥️ **Cross-Platform** - Works on Windows, macOS, and Linux

---

## 🎯 Features

### Network Discovery

- **ARP Scanning** - Layer 2 discovery for accurate device detection
- **ICMP Ping** - Latency measurement and host availability
- **TCP Port Scanning** - Service detection on common ports (22, 80, 443, 445, 3389, 8080)
- **DNS Resolution** - Automatic hostname lookup

### Device Intelligence

- **Vendor Identification** - MAC address OUI lookup
- **OS Fingerprinting** - TTL-based operating system detection
- **Device Classification** - Automatic categorization (Router, Switch, Server, PC, Mobile, IoT, etc.)
- **Risk Scoring** - Security risk assessment (0-100 scale)

### Visualization

- **Hierarchical Topology** - Router → Switch → Endpoints layout
- **Interactive Map** - Zoom, pan, and click for details
- **Device Details Modal** - Comprehensive device information
- **Color-Coded Nodes** - Visual device type identification
- **Mini-Map Navigation** - Quick overview and navigation

### User Experience

- **Dark/Light Theme** - Comfortable viewing in any environment
- **Real-Time Scanning** - Live progress updates
- **Export Functionality** - Save scan results
- **Responsive Design** - Adapts to window size

---

## 📋 Requirements

### System Requirements

- **Operating System**: Windows 10/11, macOS 10.15+, or Linux
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 200MB for installation

### Dependencies

#### Windows

- [Npcap](https://npcap.com/#download) - Network packet capture library (required for ARP scanning)
- [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) - C++ build tools

#### Linux

```bash
sudo apt install libpcap-dev build-essential
```

#### macOS

```bash
brew install libpcap
```

---

## 🚀 Installation

### Pre-built Binaries

Download the latest release from the [Releases](https://github.com/yourusername/network-topology-mapper/releases) page.

| Platform              | Download                                |
| --------------------- | --------------------------------------- |
| Windows (x64)         | `Network-Topology-Mapper_x64-setup.exe` |
| macOS (Intel)         | `Network-Topology-Mapper_x64.dmg`       |
| macOS (Apple Silicon) | `Network-Topology-Mapper_aarch64.dmg`   |
| Linux (x64)           | `network-topology-mapper_amd64.deb`     |

### Build from Source

#### Prerequisites

- [Rust](https://rustup.rs/) (1.70+)
- [Node.js](https://nodejs.org/) (18+)
- [Npcap SDK](https://npcap.com/#download) (Windows only)

#### Build Steps

```bash
# Clone the repository
git clone https://github.com/yourusername/network-topology-mapper.git
cd network-topology-mapper

# Install frontend dependencies
cd ui
npm install

# Run in development mode
npm run tauri dev

# Build production executable
npm run tauri build
```

The built executable will be located at:

- **Windows**: `ui/src-tauri/target/release/network-topology-mapper.exe`
- **macOS**: `ui/src-tauri/target/release/bundle/dmg/`
- **Linux**: `ui/src-tauri/target/release/bundle/deb/`

---

## 💻 Usage

### Running the Application

1. **Launch** the application
2. Click **"Start Scan"** in the sidebar
3. Wait for the scan to complete (typically 5-30 seconds depending on network size)
4. Explore the results in **Dashboard**, **Topology**, or **Devices** views

### Views

| View          | Description                                             |
| ------------- | ------------------------------------------------------- |
| **Dashboard** | Overview with stats, recent devices, and quick insights |
| **Topology**  | Interactive network diagram with hierarchical layout    |
| **Devices**   | Searchable, filterable table of all discovered devices  |
| **Settings**  | Application configuration options                       |

### Command Line (Scanner Only)

The Rust scanner can also be run independently:

```bash
cd src
cargo run --release
```

Output will be printed as JSON to stdout.

---

## 🏗️ Architecture

```
network-topology-mapper/
├── src/                    # Rust Network Scanner (CLI)
│   ├── main.rs             # CLI entry point
│   ├── lib.rs              # Library exports
│   ├── config.rs           # Configuration
│   ├── models.rs           # Data models (ScanResult, HostInfo)
│   ├── network/            # Network utilities
│   │   ├── interface.rs    # Interface detection
│   │   ├── ip.rs           # IP subnet calculations
│   │   ├── vendor.rs       # MAC vendor lookup
│   │   ├── device.rs       # Device classification
│   │   └── dns.rs          # DNS resolution
│   └── scanner/            # Scan modules
│       ├── arp.rs          # ARP scanning
│       ├── icmp.rs         # ICMP ping
│       ├── tcp.rs          # TCP port scanning
│       └── snmp.rs         # SNMP enrichment
│
├── ui/                     # Tauri + React Frontend
│   ├── src/                # React source
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # React hooks (useScan, useTheme)
│   │   └── lib/            # Utilities
│   ├── src-tauri/          # Tauri backend
│   │   ├── src/
│   │   │   ├── main.rs     # Tauri entry point
│   │   │   └── commands.rs # IPC commands
│   │   └── tauri.conf.json # Tauri configuration
│   └── package.json
│
└── Cargo.toml              # Rust workspace
```

### Technology Stack

| Layer                      | Technology                    |
| -------------------------- | ----------------------------- |
| **Backend (Scanner)**      | Rust, pnet, surge-ping, tokio |
| **Desktop Framework**      | Tauri 2.x                     |
| **Frontend**               | React 19, TypeScript, Vite    |
| **UI Components**          | Tailwind CSS 4, Lucide Icons  |
| **Topology Visualization** | React Flow (xyflow)           |

---

## 🔧 Configuration

### Environment Variables

| Variable    | Description                 | Default       |
| ----------- | --------------------------- | ------------- |
| `NPCAP_SDK` | Path to Npcap SDK (Windows) | Auto-detected |

### Scan Configuration

Edit `ui/src-tauri/src/commands.rs` to modify default scanning behavior:

```rust
// TCP ports to scan
let default_ports = vec![22, 80, 443, 445, 8080, 3389];
```

---

## 🔐 Security Considerations

- **Administrator/Root Required**: ARP scanning requires elevated privileges
- **Network Access**: Only scans the local subnet by default
- **No Data Transmission**: All data stays local; no internet connection required
- **MAC Address Privacy**: Detects randomized MAC addresses

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a pull request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [pnet](https://github.com/libpnet/libpnet) - Low-level networking in Rust
- [Tauri](https://tauri.app/) - Build cross-platform desktop apps
- [React Flow](https://reactflow.dev/) - Node-based graph visualization
- [Npcap](https://npcap.com/) - Windows packet capture library

---

<div align="center">

**Made with ❤️ for network administrators and security professionals**

</div>

---

---

# 🌐 Network Topology Mapper (မြန်မာဘာသာ)

<div align="center">

**Rust နှင့် Tauri ဖြင့် တည်ဆောက်ထားသော မြန်ဆန်သော Network Topology ရှာဖွေရေး နှင့် ပုံဖော်ပြသမှု Tool**

</div>

---

## 📖 အကျဉ်းချုပ်

Network Topology Mapper သည် သင့် local network ပေါ်ရှိ devices များကို ရှာဖွေပြီး network topology ကို interactive, hierarchical diagram အဖြစ် ပုံဖော်ပြသပေးသော cross-platform desktop application တစ်ခုဖြစ်ပါသည်။ မြန်ဆန်သော network scanning အတွက် Rust backend နှင့် လှပသော user experience အတွက် modern React/Tauri frontend ဖြင့် တည်ဆောက်ထားပါသည်။

### ✨ အဓိက အချက်များ

- 🚀 **မြန်ဆန်မှု** - Rust ဖြင့် ရေးသားထားသဖြင့် အလွန်မြန်ဆန်စွာ scan နိုင်ပါသည်
- 🎨 **လှပသော UI** - Dark/Light theme ပါဝင်သော modern React interface
- 📊 **Interactive Topology** - သင့် network ကို hierarchical graph အဖြစ် ကြည့်ရှုနိုင်ပါသည်
- 🔒 **Security Analysis** - Risk scoring နှင့် device classification
- 🖥️ **Cross-Platform** - Windows, macOS, Linux တို့တွင် အသုံးပြုနိုင်ပါသည်

---

## 🎯 Features များ

### Network Discovery

- **ARP Scanning** - တိကျသော device detection အတွက် Layer 2 discovery
- **ICMP Ping** - Latency တိုင်းတာခြင်း နှင့် host availability
- **TCP Port Scanning** - Common ports များပေါ်ရှိ services ရှာဖွေခြင်း
- **DNS Resolution** - Hostname အလိုအလျောက် ရှာဖွေခြင်း

### Device Intelligence

- **Vendor Identification** - MAC address OUI lookup
- **OS Fingerprinting** - TTL အခြေခံ operating system ခန့်မှန်းခြင်း
- **Device Classification** - Device အမျိုးအစား အလိုအလျောက် ခွဲခြားခြင်း
- **Risk Scoring** - Security risk အကဲဖြတ်ခြင်း (0-100)

### Visualization

- **Hierarchical Topology** - Router → Switch → Endpoints layout
- **Interactive Map** - Zoom, pan, click လုပ်၍ details ကြည့်နိုင်
- **Device Details Modal** - Device အချက်အလက် အပြည့်အစုံ
- **Color-Coded Nodes** - Device အမျိုးအစားအလိုက် အရောင်ခွဲခြားပြသခြင်း

### User Experience

- **Dark/Light Theme** - မည်သည့် ပတ်ဝန်းကျင်တွင်မဆို သက်တောင့်သက်သာ ကြည့်ရှုနိုင်
- **Real-Time Scanning** - Scan လုပ်နေစဉ် progress ပြသခြင်း
- **Export Functionality** - Scan results များ သိမ်းဆည်းနိုင်ခြင်း

---

## 📋 လိုအပ်ချက်များ

### System Requirements

- **Operating System**: Windows 10/11, macOS 10.15+, သို့မဟုတ် Linux
- **RAM**: အနည်းဆုံး 4GB, 8GB အကြံပြုပါသည်
- **Disk Space**: Installation အတွက် 200MB

### Dependencies

#### Windows

- [Npcap](https://npcap.com/#download) - ARP scanning အတွက် လိုအပ်ပါသည်
- [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)

---

## 🚀 Installation

### Source မှ Build လုပ်ခြင်း

```bash
# Repository ကို clone လုပ်ပါ
git clone https://github.com/yourusername/network-topology-mapper.git
cd network-topology-mapper

# Frontend dependencies install လုပ်ပါ
cd ui
npm install

# Development mode ဖြင့် run ပါ
npm run tauri dev

# Production executable build လုပ်ပါ
npm run tauri build
```

Build ပြီးသော executable ဖိုင်:

- **Windows**: `ui/src-tauri/target/release/network-topology-mapper.exe`

---

## 💻 အသုံးပြုပုံ

1. Application ကို **Launch** လုပ်ပါ
2. Sidebar ရှိ **"Start Scan"** ကို နှိပ်ပါ
3. Scan ပြီးဆုံးရန် စောင့်ပါ (network size ပေါ်မူတည်၍ 5-30 စက္ကန့်ခန့်)
4. **Dashboard**, **Topology**, သို့မဟုတ် **Devices** views တွင် results များကို ကြည့်ရှုပါ

### Views များ

| View          | ဖော်ပြချက်                                              |
| ------------- | ------------------------------------------------------- |
| **Dashboard** | Stats, recent devices, quick insights ပါဝင်သော overview |
| **Topology**  | Interactive network diagram                             |
| **Devices**   | Search နှင့် filter လုပ်နိုင်သော device table           |
| **Settings**  | Application settings                                    |

---

## 🏗️ Architecture

```
network-topology-mapper/
├── src/                    # Rust Network Scanner (CLI)
│   ├── main.rs             # CLI entry point
│   ├── lib.rs              # Library exports
│   ├── models.rs           # Data models
│   ├── network/            # Network utilities
│   └── scanner/            # Scan modules
│
├── ui/                     # Tauri + React Frontend
│   ├── src/                # React source
│   ├── src-tauri/          # Tauri backend
│   └── package.json
│
└── Cargo.toml              # Rust workspace
```

---

## 🔐 Security သတိပြုရန်

- **Administrator/Root လိုအပ်ခြင်း**: ARP scanning သည် elevated privileges လိုအပ်ပါသည်
- **Network Access**: Default အားဖြင့် local subnet ကိုသာ scan ပါသည်
- **Data Transmission မရှိခြင်း**: Data အားလုံး local တွင်သာ ရှိပါသည်

---

## 📄 License

ဤ project သည် MIT License အောက်တွင် ရှိပါသည်။

---

<div align="center">

**Network administrators နှင့် security professionals များအတွက် ❤️ ဖြင့် ဖန်တီးထားပါသည်**

</div>
