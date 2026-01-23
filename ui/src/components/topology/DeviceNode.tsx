import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import {
  Router,
  Server,
  Laptop,
  Smartphone,
  Wifi,
  Printer,
  Camera,
  Cpu,
  HelpCircle,
  MonitorSmartphone,
  Tv,
  Gamepad2,
  HardDrive,
  Shield,
} from 'lucide-react';

// Device type to icon mapping
const deviceIcons: Record<string, React.ElementType> = {
  ROUTER: Router,
  SWITCH: Cpu,
  ACCESS_POINT: Wifi,
  FIREWALL: Shield,
  SERVER: Server,
  NAS: HardDrive,
  PC: Laptop,
  LAPTOP: Laptop,
  MOBILE: Smartphone,
  TABLET: MonitorSmartphone,
  SMART_TV: Tv,
  IOT_DEVICE: Cpu,
  PRINTER: Printer,
  CAMERA: Camera,
  GAME_CONSOLE: Gamepad2,
  UNKNOWN: HelpCircle,
};

// Device type to color mapping
const deviceColors: Record<string, string> = {
  ROUTER: '#3B82F6',
  SWITCH: '#10B981',
  ACCESS_POINT: '#8B5CF6',
  FIREWALL: '#EF4444',
  SERVER: '#F59E0B',
  NAS: '#F59E0B',
  PC: '#6B7280',
  LAPTOP: '#6B7280',
  MOBILE: '#EC4899',
  TABLET: '#EC4899',
  SMART_TV: '#14B8A6',
  IOT_DEVICE: '#EF4444',
  PRINTER: '#14B8A6',
  CAMERA: '#F97316',
  GAME_CONSOLE: '#8B5CF6',
  UNKNOWN: '#9CA3AF',
};

interface DeviceNodeData {
  label: string;
  ip: string;
  mac?: string;
  deviceType: string;
  isOnline: boolean;
  riskScore?: number;
  vendor?: string;
}

function DeviceNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as DeviceNodeData;
  const Icon = deviceIcons[nodeData.deviceType] || HelpCircle;
  const color = deviceColors[nodeData.deviceType] || '#9CA3AF';

  // Inline styles for React Flow compatibility (CSS vars don't work well inside RF nodes)
  const bgColor = '#1E293B';
  const borderColor = selected ? color : 'rgba(255, 255, 255, 0.15)';
  const textPrimary = '#F8FAFC';
  const textMuted = '#94A3B8';

  return (
    <div
      style={{
        backgroundColor: bgColor,
        border: `2px solid ${borderColor}`,
        borderRadius: '12px',
        padding: '12px 16px',
        minWidth: '160px',
        maxWidth: '200px',
        boxShadow: selected 
          ? `0 8px 16px rgba(0,0,0,0.3), 0 0 0 2px ${color}40` 
          : '0 4px 12px rgba(0,0,0,0.2)',
        transform: selected ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
      }}
    >
      {/* Handles for edges */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: 10,
          height: 10,
          background: color,
          border: '2px solid #0F172A',
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: 10,
          height: 10,
          background: color,
          border: '2px solid #0F172A',
        }}
      />

      {/* Content */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Icon */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            backgroundColor: `${color}25`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon style={{ width: 22, height: 22, color }} />
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
          <p
            style={{
              margin: 0,
              fontWeight: 600,
              fontSize: '13px',
              color: textPrimary,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {nodeData.label}
          </p>
          <p
            style={{
              margin: '2px 0 0 0',
              fontFamily: 'monospace',
              fontSize: '11px',
              color: textMuted,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {nodeData.ip}
          </p>
        </div>

        {/* Status indicator */}
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: nodeData.isOnline ? '#22C55E' : '#EF4444',
            flexShrink: 0,
            boxShadow: nodeData.isOnline 
              ? '0 0 8px rgba(34, 197, 94, 0.5)' 
              : '0 0 8px rgba(239, 68, 68, 0.5)',
          }}
        />
      </div>

      {/* Bottom info */}
      <div
        style={{
          marginTop: 10,
          paddingTop: 10,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: '10px',
            color: textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {nodeData.deviceType.replace('_', ' ')}
        </span>
        {nodeData.riskScore !== undefined && nodeData.riskScore > 0 && (
          <span
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: 4,
              backgroundColor: nodeData.riskScore >= 50 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              color: nodeData.riskScore >= 50 ? '#EF4444' : '#F59E0B',
              fontWeight: 500,
            }}
          >
            Risk: {nodeData.riskScore}
          </span>
        )}
      </div>
    </div>
  );
}

export default memo(DeviceNode);
