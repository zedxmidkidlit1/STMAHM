import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileDown, FileText, FileSpreadsheet, Shield, Network, BarChart3, Database } from 'lucide-react';
import { useScanContext } from '../hooks/useScan';
import { useExport } from '../hooks/useExport';

interface ExportCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  format: string;
  formatColor: string;
  bgColor: string;
  onExport: () => void | Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
}

const CARD =
  'rounded-2xl border border-slate-200/70 bg-white/85 backdrop-blur-sm shadow-sm dark:border-slate-800 dark:bg-slate-950/65';

function ExportCard({ title, description, icon, format, formatColor, bgColor, onExport, isLoading, disabled }: ExportCardProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      await onExport();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${CARD} ${bgColor} p-6 transition-all ${
        disabled ? 'cursor-not-allowed opacity-50' : 'hover:scale-[1.02]'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 bg-white/80 dark:bg-slate-800/80 rounded-xl">
          {icon}
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${formatColor}`}>
          {format}
        </span>
      </div>

      <h3 className="text-lg font-bold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary mb-6 leading-relaxed">{description}</p>

      <button
        onClick={handleExport}
        disabled={disabled || loading || isLoading}
        className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold text-sm shadow-lg transition-all ${
          disabled 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-accent-blue to-accent-sapphire hover:brightness-110 text-white shadow-accent-blue/30'
        }`}
      >
        {loading || isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <FileDown className="w-4 h-4" />
            Export
          </>
        )}
      </button>
    </div>
  );
}

export default function Reports() {
  const { scanResult } = useScanContext();
  const {
    exportDevicesCSV,
    exportScanCSV,
    exportTopologyJSON,
    exportScanJSON,
    exportScanReportPDF,
    exportSecurityReportPDF,
    exportingType,
    error,
  } = useExport();

  const hasData = scanResult && scanResult.active_hosts && scanResult.active_hosts.length > 0;

  return (
    <div className="relative flex-1 overflow-y-auto bg-bg-primary p-4 sm:p-6 lg:p-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 -left-16 h-80 w-80 rounded-full bg-cyan-300/15 blur-3xl dark:bg-cyan-500/10" />
        <div className="absolute top-20 right-0 h-96 w-96 rounded-full bg-emerald-300/10 blur-3xl dark:bg-emerald-500/10" />
      </div>

      <div className="relative z-10 space-y-6">
      <motion.section
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${CARD} p-5 sm:p-6`}
      >
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-600 dark:text-cyan-300">
            Export Hub
          </p>
          <h1 className="text-2xl font-black text-text-primary sm:text-4xl">Reports & Artifacts</h1>
          <p className="max-w-2xl text-sm text-text-secondary sm:text-base">
            Generate production-grade reports and structured exports for audits, handoffs, and automation.
          </p>
        </div>
      </motion.section>

      {/* Error Alert */}
      {error && (
        <div className={`${CARD} border-accent-red/30 bg-accent-red/10 p-3`}>
          <p className="text-accent-red text-sm">❌ Error: {error}</p>
        </div>
      )}

      {/* No Data Warning */}
      {!hasData && (
        <div className={`${CARD} border-accent-amber/30 bg-accent-amber/10 p-3`}>
          <p className="text-accent-amber text-sm">⚠️ No scan data available. Run a network scan first.</p>
        </div>
      )}

      {/* Export Cards Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Scan Report PDF - Red/Pink theme */}
        <ExportCard
          title="Scan Report"
          description="Professional PDF report with network analysis, device inventory, and statistics."
          icon={<FileText className="w-6 h-6 text-accent-red" />}
          format="PDF"
          formatColor="bg-accent-red/20 text-accent-red"
          bgColor="bg-gradient-to-br from-accent-red/5 to-accent-red/10"
          onExport={async () => {
            if (scanResult) {
              await exportScanReportPDF(scanResult, scanResult.active_hosts);
            }
          }}
          isLoading={exportingType === 'scan-pdf'}
          disabled={!hasData}
        />

        {/* Security Report PDF - Red theme */}
        <ExportCard
          title="Security Report"
          description="Network health assessment with security recommendations and risk analysis."
          icon={<Shield className="w-6 h-6 text-accent-red" />}
          format="PDF"
          formatColor="bg-accent-red/20 text-accent-red"
          bgColor="bg-gradient-to-br from-accent-red/5 to-accent-red/10"
          onExport={async () => {
            if (scanResult && scanResult.active_hosts) {
              await exportSecurityReportPDF(scanResult.active_hosts);
            }
          }}
          isLoading={exportingType === 'security-pdf'}
          disabled={!hasData}
        />

        {/* Device List CSV - Green theme */}
        <ExportCard
          title="Device List"
          description="Export all discovered devices to CSV format for spreadsheet analysis."
          icon={<FileSpreadsheet className="w-6 h-6 text-accent-green" />}
          format="CSV"
          formatColor="bg-accent-green/20 text-accent-green"
          bgColor="bg-gradient-to-br from-accent-green/5 to-accent-green/10"
          onExport={exportDevicesCSV}
          isLoading={exportingType === 'devices-csv'}
          disabled={!hasData}
        />

        {/* Scan Results CSV - Green theme */}
        <ExportCard
          title="Scan Results"
          description="Export current scan results to CSV with all device details and metrics."
          icon={<BarChart3 className="w-6 h-6 text-accent-green" />}
          format="CSV"
          formatColor="bg-accent-green/20 text-accent-green"
          bgColor="bg-gradient-to-br from-accent-green/5 to-accent-green/10"
          onExport={async () => {
            if (scanResult && scanResult.active_hosts) {
              await exportScanCSV(scanResult.active_hosts);
            }
          }}
          isLoading={exportingType === 'scan-csv'}
          disabled={!hasData}
        />

        {/* Topology Data JSON - Orange theme */}
        <ExportCard
          title="Topology Data"
          description="Export network topology structure as JSON for custom visualization or analysis."
          icon={<Network className="w-6 h-6 text-accent-amber" />}
          format="JSON"
          formatColor="bg-accent-amber/20 text-accent-amber"
          bgColor="bg-gradient-to-br from-accent-amber/5 to-accent-amber/10"
          onExport={async () => {
            if (scanResult && scanResult.active_hosts) {
              await exportTopologyJSON(scanResult.active_hosts, scanResult.subnet);
            }
          }}
          isLoading={exportingType === 'topology-json'}
          disabled={!hasData}
        />

        {/* Raw Scan Data JSON - Orange theme */}
        <ExportCard
          title="Raw Scan Data"
          description="Export complete scan result with all metadata in JSON format."
          icon={<Database className="w-6 h-6 text-accent-amber" />}
          format="JSON"
          formatColor="bg-accent-amber/20 text-accent-amber"
          bgColor="bg-gradient-to-br from-accent-amber/5 to-accent-amber/10"
          onExport={async () => {
            if (scanResult) {
              await exportScanJSON(scanResult);
            }
          }}
          isLoading={exportingType === 'scan-json'}
          disabled={!hasData}
        />
      </div>
      </div>
    </div>
  );
}
