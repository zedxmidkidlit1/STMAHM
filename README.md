# Network Topology Mapper

Network Topology Mapper is a Rust + Tauri desktop application for local network discovery, topology visualization, monitoring, and security-focused analysis.

This README was refreshed for the current `v0.3.1` codebase state.

## Current Status (2026)

Recent updates now reflected in this repository:

- Modernized desktop UI with a consistent Mission Control design language.
- Typed frontend/backend command boundary (`ui/src/lib/api/tauri-client.ts`).
- Improved monitoring stability (idempotent monitor start handling).
- Reduced noisy scan logging and improved runtime log clarity.
- Improved Windows interface detection behavior for Npcap adapters.
- Alert generation + dedupe integration coverage across consecutive scans.

## Core Features

### Discovery and Scanning

- Active ARP scanning for layer-2 discovery.
- ICMP probing and latency capture.
- TCP probe scan for common service ports.
- DNS hostname resolution.
- MAC vendor lookup and basic OS guessing.

### Monitoring and Alerts

- Background monitoring loop with live network events.
- Device lifecycle events: new, offline, back online, IP change.
- Alert persistence and unread/read workflow.
- Alert dedupe support across repeated scans.

### Data and Insights

- Local SQLite storage for scans, devices, alerts, and history.
- Network stats and health scoring APIs.
- Device distribution and risk-related insights.
- Vulnerability/port-warning context integration.

### Desktop UI

- Pages: Dashboard, Topology, Devices, Vulnerabilities, Alerts, Tools, Reports, Settings.
- URL-based page navigation with lazy-loaded routes.
- Theme support (dark/light), shortcuts, and device detail modal.
- Demo mode hooks for mock scan/alerts.

### Export and Utility Tools

- Export devices and scan data to CSV/JSON.
- Export scan and security reports (PDF bytes from backend).
- Built-in network tools: ping, port scan, MAC vendor lookup.

## Tech Stack

- Backend Core: Rust (`host-discovery` crate)
- Desktop Shell: Tauri v2 (`ui/src-tauri`)
- Frontend: React + TypeScript + Vite (`ui`)
- Database: SQLite (`rusqlite`, bundled)
- Logging: `tracing` + local log files

## Project Layout

```text
.
|- src/                 # Rust core library + CLI entry
|- tests/               # Rust integration tests
|- ui/
|  |- src/              # React frontend
|  |- src-tauri/        # Tauri backend bridge
|  `- package.json
|- Cargo.toml           # Root Rust crate (host-discovery)
`- CODE_REVIEW_2026.md
```

## Requirements

### Common

- Rust toolchain (stable)
- Node.js + npm

### Windows

- Npcap installed (recommended with WinPcap compatibility mode)
- Visual Studio Build Tools (C++ toolchain)

### Linux

- `libpcap-dev` and standard build tools

### macOS

- `libpcap` available (typically via Homebrew)

## Quick Start (Development)

```bash
# From repository root
npm --prefix ui ci
npm --prefix ui run tauri dev
```

Frontend-only dev server:

```bash
npm --prefix ui run dev
```

## Build

```bash
npm --prefix ui run build
```

For packaged desktop builds, use Tauri build from `ui`:

```bash
cd ui
npm run tauri build
```

## Verification Commands

Run these from repository root unless noted:

```bash
cargo check --all-targets
cargo clippy --all-targets
cargo test --all-targets
cargo test --test alerts_dedupe_integration
npm --prefix ui run build
```

Optional Tauri environment check:

```bash
npm --prefix ui run tauri info
```

## Runtime Logs

Logs are written under your local app data path, for example on Windows:

```text
C:\Users\<you>\AppData\Local\netmapper\logs
```

## Troubleshooting

### "No valid interface found" when pressing Start Scan

Common causes:

- Npcap not installed or misconfigured.
- App not running with enough privileges for adapter access.
- Adapter presents placeholder IP data (`0.0.0.0/0`).

What to do:

1. Confirm Npcap is installed.
2. Run the app terminal as Administrator (Windows).
3. Disable unused virtual adapters if they dominate selection.
4. Ensure your active NIC has a real IPv4 assignment.

### Repeated scan/monitor log spam

- Monitoring start is now idempotent, but stale dev processes can still overlap.
- Fully stop previous `tauri dev` sessions before restarting.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for release history and notable updates.

## Notes

- Network scanning behavior depends on OS privileges and adapter driver support.
- This project stores scan data locally in SQLite.
- License file is not currently included in this repository root.

