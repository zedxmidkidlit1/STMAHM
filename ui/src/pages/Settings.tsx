import { useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';

export default function Settings() {
  const [snmpEnabled, setSnmpEnabled] = useState(false);
  const [snmpCommunity, setSnmpCommunity] = useState('public');
  const [scanInterval, setScanInterval] = useState(60);
  const [tcpPorts, setTcpPorts] = useState('22,80,443,445,8080,3389');

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
        <p className="text-text-muted mt-1">Configure scanner and application settings</p>
      </div>

      {/* Scan Settings */}
      <section className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Scan Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Auto-scan Interval (seconds)
            </label>
            <input
              type="number"
              value={scanInterval}
              onChange={(e) => setScanInterval(Number(e.target.value))}
              className="w-full px-4 py-2.5 bg-bg-tertiary border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-blue transition-colors"
              min={10}
              max={3600}
            />
            <p className="text-xs text-text-muted mt-1">
              Set to 0 to disable automatic scanning
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              TCP Ports to Probe
            </label>
            <input
              type="text"
              value={tcpPorts}
              onChange={(e) => setTcpPorts(e.target.value)}
              className="w-full px-4 py-2.5 bg-bg-tertiary border border-white/10 rounded-lg text-text-primary font-mono text-sm focus:outline-none focus:border-accent-blue transition-colors"
              placeholder="22,80,443,8080"
            />
            <p className="text-xs text-text-muted mt-1">
              Comma-separated list of ports
            </p>
          </div>
        </div>
      </section>

      {/* SNMP Settings */}
      <section className="card p-6 mb-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">SNMP Settings</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text-primary">Enable SNMP Enrichment</p>
              <p className="text-sm text-text-muted">
                Query devices for additional information via SNMP
              </p>
            </div>
            <button
              onClick={() => setSnmpEnabled(!snmpEnabled)}
              className={`w-12 h-6 rounded-full transition-colors ${
                snmpEnabled ? 'bg-accent-blue' : 'bg-bg-tertiary'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                  snmpEnabled ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {snmpEnabled && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                SNMP Community String
              </label>
              <input
                type="text"
                value={snmpCommunity}
                onChange={(e) => setSnmpCommunity(e.target.value)}
                className="w-full px-4 py-2.5 bg-bg-tertiary border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-accent-blue transition-colors"
                placeholder="public"
              />
            </div>
          )}
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-6 py-3 bg-accent-blue hover:bg-accent-blue/80 text-white rounded-lg font-medium transition-colors">
          <Save className="w-5 h-5" />
          <span>Save Settings</span>
        </button>
        <button className="flex items-center gap-2 px-6 py-3 bg-bg-tertiary hover:bg-bg-hover text-text-secondary rounded-lg font-medium transition-colors">
          <RefreshCw className="w-5 h-5" />
          <span>Reset to Defaults</span>
        </button>
      </div>
    </div>
  );
}
