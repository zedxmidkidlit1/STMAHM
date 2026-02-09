# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- End-to-end desktop smoke tests for core scan/alerts/export flows.
- Further Tauri security hardening (CSP/capability tightening).
- Remaining command transport consolidation behind typed API client.

## [0.3.1] - 2026-02-08

### Added
- Typed frontend/backend command client (`ui/src/lib/api/tauri-client.ts`) and shared TS API types.
- Runtime utility checks for Tauri availability (`ui/src/lib/runtime/is-tauri.ts`).
- Integration test coverage for alert generation + dedupe across consecutive scans.

### Changed
- Major UI refresh to a Mission Control design language across dashboard and core pages.
- Page-level typography consistency pass for production-quality visual hierarchy.
- URL-based page navigation with lazy-loaded page modules in the React app shell.
- Manual chunking strategy in Vite build for improved split behavior.

### Fixed
- Alert dedupe reliability across repeated scans.
- Legacy schema migration ordering for alert dedupe key/index creation.
- Monitoring auto-start loop behavior in dashboard lifecycle.
- Backend monitor start behavior made idempotent when already running.
- Windows interface selection improved for Npcap adapters.
- Reduced scan log noise by moving repeated interface/monitor logs to structured debug paths.

### Validation
- `cargo check --all-targets` (root and `ui/src-tauri`) passing.
- `cargo clippy --all-targets` (root and `ui/src-tauri`) passing.
- `cargo test --all-targets` passing.
- `cargo test --test alerts_dedupe_integration` passing.
- `npm --prefix ui run build` passing.
