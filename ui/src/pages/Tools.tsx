import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Search,
  Loader2,
  AlertCircle,
  Network,
  Play,
  Hash,
  Terminal,
} from 'lucide-react';
import { tauriClient } from '../lib/api/tauri-client';
import type {
  PingResult,
  PortScanResult,
  VendorLookupResult,
} from '../lib/api/types';

type Tab = 'ping' | 'portscan' | 'maclookup';
const CARD =
  'rounded-2xl border border-slate-200/70 bg-white/85 backdrop-blur-sm shadow-sm dark:border-slate-800 dark:bg-slate-950/65';

export default function Tools() {
  const [activeTab, setActiveTab] = useState<Tab>('ping');

  return (
    <div className="relative flex-1 overflow-y-auto bg-bg-primary p-4 sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 -left-16 h-80 w-80 rounded-full bg-cyan-300/15 blur-3xl dark:bg-cyan-500/10" />
        <div className="absolute top-20 right-0 h-96 w-96 rounded-full bg-teal-300/10 blur-3xl dark:bg-teal-500/10" />
      </div>

      <div className="relative z-10 space-y-6">
        <motion.section
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${CARD} p-5 sm:p-6`}
        >
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-300">
              Operator Toolkit
            </p>
            <h1 className="text-2xl font-black text-text-primary sm:text-4xl">Network Tools</h1>
            <p className="max-w-2xl text-sm text-text-secondary sm:text-base">
              Run active diagnostics for reachability, open ports, and vendor fingerprinting.
            </p>
          </div>
        </motion.section>

        {/* Tool Tabs */}
        <div className={`${CARD} flex flex-wrap items-center gap-2 p-3`}>
        <button
            onClick={() => setActiveTab('ping')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'ping'
              ? 'bg-accent-blue text-white shadow-lg shadow-accent-blue/30'
              : 'bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-hover'
          }`}
        >
          <Activity className="w-4 h-4" />
          Ping Tool
        </button>

        <button
            onClick={() => setActiveTab('portscan')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'portscan'
              ? 'bg-accent-blue text-white shadow-lg shadow-accent-blue/30'
              : 'bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-hover'
          }`}
        >
          <Hash className="w-4 h-4" />
          Port Scanner
        </button>

        <button
            onClick={() => setActiveTab('maclookup')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'maclookup'
              ? 'bg-accent-blue text-white shadow-lg shadow-accent-blue/30'
              : 'bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-hover'
          }`}
        >
          <Network className="w-4 h-4" />
          MAC Lookup
        </button>
        </div>

        {/* Tool Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'ping' && <PingTool />}
            {activeTab === 'portscan' && <PortScanTool />}
            {activeTab === 'maclookup' && <MACLookupTool />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ==================== PING TOOL ====================

function PingTool() {
  const [target, setTarget] = useState('');
  const [count, setCount] = useState(4);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PingResult[]>([]);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);

  const handlePing = async () => {
    if (!target.trim()) return;

    setLoading(true);
    setResults([]);
    setTerminalOutput(['$ ping ' + target.trim(), 'Sending ' + count + ' packets...', '']);

    try {
      const pingResults = await tauriClient.pingHost(target.trim(), count);
      setResults(pingResults);
      
      const output = pingResults.map((r) => 
        r.success 
          ? `Reply from ${target}: bytes=32 time=${r.latency_ms}ms TTL=${r.ttl}`
          : `Request timed out`
      );
      setTerminalOutput(prev => [...prev, ...output, '', 'Ping statistics:', `Sent = ${count}, Received = ${pingResults.filter(r => r.success).length}`]);
    } catch (error) {
      console.error('Ping failed:', error);
      setTerminalOutput(prev => [...prev, `Error: ${error}`]);
    } finally {
      setLoading(false);
    }
  };

  const successfulPings = results.filter(r => r.success).length;
  const avgLatency = results.filter(r => r.latency_ms !== null)
    .reduce((sum, r) => sum + (r.latency_ms || 0), 0) / (successfulPings || 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {/* Configuration */}
      <div className={CARD + ' p-5'}>
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-accent-blue" />
          <h2 className="text-lg font-bold text-text-primary">Configuration</h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase">Target Host</label>
            <input
              type="text"
              placeholder="e.g. google.com"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePing()}
              className="w-full px-3 py-2 bg-bg-tertiary border border-theme rounded text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase">Packet Count</label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-bg-tertiary border border-theme rounded text-sm text-text-primary focus:outline-none focus:border-accent-blue transition-colors"
            >
              <option value={4}>4 packets (Default)</option>
              <option value={1}>1 packet</option>
              <option value={10}>10 packets</option>
            </select>
          </div>

          <button
            onClick={handlePing}
            disabled={loading || !target.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-accent-blue to-accent-sapphire hover:brightness-110 text-white rounded font-bold text-sm shadow-lg shadow-accent-blue/30 transition-all disabled:opacity-50"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Pinging...</> : <><Play className="w-4 h-4" />Start Ping</>}
          </button>
        </div>
      </div>

      {/* Terminal & Results */}
      <div className="space-y-3">
        <div className={CARD + ' overflow-hidden'}>
          <div className="flex items-center justify-between px-3 py-2 bg-slate-800 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-green-400" />
              <h3 className="text-sm font-semibold text-white">Output</h3>
            </div>
          </div>
          <div className="p-3 font-mono text-xs text-green-400 h-48 overflow-y-auto">
            {terminalOutput.length <= 3 && !loading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <Terminal className="w-10 h-10 mb-2 opacity-20" />
                <p className="text-xs">Ready...</p>
              </div>
            ) : (
              <>
                {terminalOutput.map((line, i) => <div key={i}>{line || <br />}</div>)}
                {loading && <div className="flex items-center gap-1 mt-1"><div className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></div>Processing...</div>}
              </>
            )}
          </div>
        </div>

        {results.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            <div className={CARD + ' rounded-xl p-2'}>
              <p className="text-xs text-text-muted uppercase font-semibold">Sent</p>
              <p className="text-xl font-bold text-text-primary">{results.length}</p>
            </div>
            <div className={CARD + ' rounded-xl p-2'}>
              <p className="text-xs text-text-muted uppercase font-semibold">Got</p>
              <p className="text-xl font-bold text-accent-green">{successfulPings}</p>
            </div>
            <div className={CARD + ' rounded-xl p-2'}>
              <p className="text-xs text-text-muted uppercase font-semibold">Lost</p>
              <p className="text-xl font-bold text-accent-red">{results.length - successfulPings}</p>
            </div>
            <div className={CARD + ' rounded-xl p-2'}>
              <p className="text-xs text-text-muted uppercase font-semibold">Avg</p>
              <p className="text-xl font-bold text-accent-blue">{avgLatency.toFixed(1)}ms</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== PORT SCAN TOOL ====================

function PortScanTool() {
  const [target, setTarget] = useState('');
  const [startPort, setStartPort] = useState('1');
  const [endPort, setEndPort] = useState('1000');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PortScanResult[]>([]);

  const handleScan = async () => {
    if (!target.trim()) return;
    const start = parseInt(startPort);
    const end = parseInt(endPort);
    if (isNaN(start) || isNaN(end)) return;

    setLoading(true);
    setResults([]);

    try {
      const ports = Array.from({ length: Math.min(end - start + 1, 100) }, (_, i) => start + i);
      const scanResults = await tauriClient.scanPorts(target.trim(), ports);
      setResults(scanResults);
    } catch (error) {
      console.error('Scan failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const openPorts = results.filter(r => r.is_open);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div className={CARD + ' p-5'}>
        <div className="flex items-center gap-2 mb-3">
          <Hash className="w-4 h-4 text-accent-blue" />
          <h2 className="text-lg font-bold text-text-primary">Configuration</h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase">Target IP</label>
            <input
              type="text"
              placeholder="192.168.1.1"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full px-3 py-2 bg-bg-tertiary border border-theme rounded text-sm text-text-primary focus:outline-none focus:border-accent-blue"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase">Start Port</label>
              <input
                type="number"
                value={startPort}
                onChange={(e) => setStartPort(e.target.value)}
                className="w-full px-3 py-2 bg-bg-tertiary border border-theme rounded text-sm text-text-primary focus:outline-none focus:border-accent-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase">End Port</label>
              <input
                type="number"
                value={endPort}
                onChange={(e) => setEndPort(e.target.value)}
                className="w-full px-3 py-2 bg-bg-tertiary border border-theme rounded text-sm text-text-primary focus:outline-none focus:border-accent-blue"
              />
            </div>
          </div>

          <button
            onClick={handleScan}
            disabled={loading || !target.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-accent-blue to-accent-sapphire text-white rounded font-bold text-sm shadow-lg shadow-accent-blue/30 transition-all disabled:opacity-50"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Scanning...</> : <><Play className="w-4 h-4" />Start Scan</>}
          </button>
        </div>
      </div>

      <div className={CARD + ' p-5'}>
        <h3 className="text-sm font-semibold text-text-primary mb-2">Results {openPorts.length > 0 && `(${openPorts.length} open)`}</h3>
        <div className="h-56 overflow-y-auto space-y-1">
          {openPorts.length === 0 && !loading && (
            <div className="flex items-center justify-center h-full text-text-muted text-xs">No open ports found</div>
          )}
          {openPorts.map((r) => (
            <div key={r.port} className="flex items-center justify-between p-2 bg-accent-green/10 border border-accent-green/30 rounded text-xs">
              <span className="font-mono font-bold text-accent-green">Port {r.port}</span>
              <span className="text-accent-green">{r.service || 'Unknown'}</span>
            </div>
          ))}
          {loading && <div className="text-center text-text-muted text-xs py-4">Scanning...</div>}
        </div>
      </div>
    </div>
  );
}

// ==================== MAC LOOKUP TOOL ====================

function MACLookupTool() {
  const [mac, setMac] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VendorLookupResult | null>(null);

  const handleLookup = async () => {
    if (!mac.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const lookupResult = await tauriClient.lookupMacVendor(mac.trim());
      setResult(lookupResult);
    } catch (error) {
      console.error('Lookup failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div className={CARD + ' p-5'}>
        <div className="flex items-center gap-2 mb-3">
          <Network className="w-4 h-4 text-accent-blue" />
          <h2 className="text-lg font-bold text-text-primary">Configuration</h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-1.5 uppercase">MAC Address</label>
            <input
              type="text"
              placeholder="00:1C:B3:00:00:00"
              value={mac}
              onChange={(e) => setMac(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLookup()}
              className="w-full px-3 py-2 bg-bg-tertiary border border-theme rounded text-sm font-mono text-text-primary focus:outline-none focus:border-accent-blue"
            />
          </div>

          <button
            onClick={handleLookup}
            disabled={loading || !mac.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-accent-blue to-accent-sapphire text-white rounded font-bold text-sm shadow-lg shadow-accent-blue/30 transition-all disabled:opacity-50"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Looking up...</> : <><Search className="w-4 h-4" />Lookup</>}
          </button>

          <div className="text-xs text-text-muted">
            <p className="font-semibold mb-1">Examples:</p>
            <button onClick={() => setMac('34:4a:c3:22:6f:90')} className="block w-full text-left p-1.5 bg-bg-tertiary hover:bg-bg-hover rounded font-mono">34:4a:c3:22:6f:90</button>
          </div>
        </div>
      </div>

      <div className={CARD + ' p-5'}>
        <h3 className="text-sm font-semibold text-text-primary mb-2">Vendor Information</h3>
        {!result ? (
          <div className="flex items-center justify-center h-32 text-text-muted text-xs">Enter MAC to lookup</div>
        ) : result.is_randomized ? (
          <div className="bg-accent-amber/10 border border-accent-amber/30 rounded p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-accent-amber shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-accent-amber text-sm mb-1">Randomized MAC</p>
                <p className="text-xs text-text-secondary">This is a locally administered MAC address used for privacy.</p>
              </div>
            </div>
          </div>
        ) : result.vendor ? (
          <div className="bg-accent-green/10 border border-accent-green/30 rounded p-4">
            <p className="text-xs text-text-muted mb-1 uppercase">Vendor</p>
            <p className="text-lg font-bold text-accent-green">{result.vendor}</p>
          </div>
        ) : (
          <div className="bg-accent-red/10 border border-accent-red/30 rounded p-3 text-xs text-accent-red">Vendor not found</div>
        )}
      </div>
    </div>
  );
}
