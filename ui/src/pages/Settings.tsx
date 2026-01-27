import { useState, useEffect } from 'react';
import { Save, RefreshCw, Check, AlertCircle } from 'lucide-react';

// Default settings
const DEFAULT_SETTINGS = {
  snmpEnabled: false,
  snmpCommunity: 'public',
  scanInterval: 60,
  tcpPorts: '22,80,443,445,8080,3389',
};

// Storage key
const SETTINGS_KEY = 'netmapper-settings';

// Load settings from localStorage
function loadSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return DEFAULT_SETTINGS;
}

// Save settings to localStorage
function saveSettingsToStorage(settings: typeof DEFAULT_SETTINGS) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (e) {
    console.error('Failed to save settings:', e);
    return false;
  }
}

export default function Settings() {
  const [snmpEnabled, setSnmpEnabled] = useState(DEFAULT_SETTINGS.snmpEnabled);
  const [snmpCommunity, setSnmpCommunity] = useState(DEFAULT_SETTINGS.snmpCommunity);
  const [scanInterval, setScanInterval] = useState(DEFAULT_SETTINGS.scanInterval);
  const [tcpPorts, setTcpPorts] = useState(DEFAULT_SETTINGS.tcpPorts);
  
  // UI state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const settings = loadSettings();
    setSnmpEnabled(settings.snmpEnabled);
    setSnmpCommunity(settings.snmpCommunity);
    setScanInterval(settings.scanInterval);
    setTcpPorts(settings.tcpPorts);
  }, []);

  // Track changes
  useEffect(() => {
    const current = { snmpEnabled, snmpCommunity, scanInterval, tcpPorts };
    const saved = loadSettings();
    const changed = JSON.stringify(current) !== JSON.stringify(saved);
    setHasChanges(changed);
  }, [snmpEnabled, snmpCommunity, scanInterval, tcpPorts]);

  // Save settings
  const handleSave = () => {
    setSaveStatus('saving');
    const settings = { snmpEnabled, snmpCommunity, scanInterval, tcpPorts };
    
    setTimeout(() => {
      if (saveSettingsToStorage(settings)) {
        setSaveStatus('saved');
        setHasChanges(false);
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    }, 300);
  };

  // Reset to defaults
  const handleReset = () => {
    setSnmpEnabled(DEFAULT_SETTINGS.snmpEnabled);
    setSnmpCommunity(DEFAULT_SETTINGS.snmpCommunity);
    setScanInterval(DEFAULT_SETTINGS.scanInterval);
    setTcpPorts(DEFAULT_SETTINGS.tcpPorts);
    saveSettingsToStorage(DEFAULT_SETTINGS);
    setSaveStatus('saved');
    setHasChanges(false);
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

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
        <button 
          onClick={handleSave}
          disabled={!hasChanges && saveStatus === 'idle'}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            saveStatus === 'saved' 
              ? 'bg-accent-green text-white'
              : saveStatus === 'error'
              ? 'bg-accent-red text-white'
              : hasChanges
              ? 'bg-accent-blue hover:bg-accent-blue/80 text-white'
              : 'bg-accent-blue/50 text-white/70 cursor-not-allowed'
          }`}
        >
          {saveStatus === 'saving' ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : saveStatus === 'saved' ? (
            <Check className="w-5 h-5" />
          ) : saveStatus === 'error' ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>
            {saveStatus === 'saving' ? 'Saving...' 
              : saveStatus === 'saved' ? 'Saved!' 
              : saveStatus === 'error' ? 'Error!' 
              : 'Save Settings'}
          </span>
        </button>
        <button 
          onClick={handleReset}
          className="flex items-center gap-2 px-6 py-3 bg-bg-tertiary hover:bg-bg-hover text-text-secondary rounded-lg font-medium transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Reset to Defaults</span>
        </button>
        {hasChanges && (
          <span className="text-sm text-accent-amber">Unsaved changes</span>
        )}
      </div>
    </div>
  );
}
