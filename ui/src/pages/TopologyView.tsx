import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Loader2, WifiOff } from 'lucide-react';

import DeviceNode from '../components/topology/DeviceNode';
import { useScanContext, HostInfo } from '../hooks/useScan';
import { generateTopologyLayout } from '../lib/topology-layout';
import { useTheme } from '../hooks/useTheme';

// Custom node types
const nodeTypes = {
  device: DeviceNode,
};

interface TopologyViewProps {
  onDeviceClick?: (device: HostInfo) => void;
}

export default function TopologyView({ onDeviceClick }: TopologyViewProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { scanResult, isScanning, tauriAvailable } = useScanContext();

  // Generate nodes and edges from real scan data
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (!scanResult?.active_hosts || scanResult.active_hosts.length === 0) {
      return { nodes: [], edges: [] };
    }
    return generateTopologyLayout(scanResult.active_hosts);
  }, [scanResult]);

  const [nodes, _setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, _setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Handle node click
  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    if (!scanResult?.active_hosts) return;
    const device = scanResult.active_hosts.find(h => h.ip === node.id);
    if (device && onDeviceClick) {
      onDeviceClick(device);
    }
  }, [onDeviceClick, scanResult]);

  // Theme-aware colors
  const bgColor = isDark ? '#0F172A' : '#F1F5F9';
  const dotColor = isDark ? '#334155' : '#CBD5E1';
  const edgeColor = isDark ? '#3B82F6' : '#2563EB';
  const controlsBg = isDark ? '#1E293B' : '#FFFFFF';
  const controlsBorder = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

  // Empty state
  if (!scanResult && !isScanning) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-6 border-b border-theme">
          <h1 className="text-2xl font-bold text-text-primary">Network Topology</h1>
          <p className="text-text-muted mt-1">No scan data available</p>
        </div>
        <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: bgColor }}>
          <div className="text-center">
            <WifiOff className="w-16 h-16 mx-auto mb-4 text-text-muted" />
            <p className="text-text-muted text-lg">
              {tauriAvailable 
                ? 'Click "Start Scan" to discover network topology'
                : 'Run with `npm run tauri dev` to enable scanning'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isScanning) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-6 border-b border-theme">
          <h1 className="text-2xl font-bold text-text-primary">Network Topology</h1>
          <p className="text-text-muted mt-1">Scanning network...</p>
        </div>
        <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: bgColor }}>
          <div className="text-center">
            <Loader2 className="w-16 h-16 mx-auto mb-4 text-accent-blue animate-spin" />
            <p className="text-text-muted text-lg">Discovering network topology...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-theme">
        <h1 className="text-2xl font-bold text-text-primary">Network Topology</h1>
        <p className="text-text-muted mt-1">
          Interactive network map • {nodes.length} devices • Click any device for details
        </p>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1" style={{ backgroundColor: bgColor }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={2}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
            style: { stroke: edgeColor, strokeWidth: 2 },
          }}
          proOptions={{ hideAttribution: true }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={2}
            color={dotColor}
          />
          <Controls
            style={{
              backgroundColor: controlsBg,
              border: `1px solid ${controlsBorder}`,
              borderRadius: 8,
            }}
            showInteractive={false}
          />
          <MiniMap
            style={{
              backgroundColor: controlsBg,
              border: `1px solid ${controlsBorder}`,
              borderRadius: 8,
            }}
            nodeColor={(node) => {
              const deviceType = node.data?.deviceType as string;
              const colors: Record<string, string> = {
                ROUTER: '#3B82F6',
                SWITCH: '#10B981',
                ACCESS_POINT: '#8B5CF6',
                SERVER: '#F59E0B',
                PC: '#6B7280',
                LAPTOP: '#6B7280',
                MOBILE: '#EC4899',
                IOT_DEVICE: '#EF4444',
                PRINTER: '#14B8A6',
                CAMERA: '#F97316',
              };
              return colors[deviceType] || '#9CA3AF';
            }}
            maskColor={isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(241, 245, 249, 0.85)'}
            pannable
            zoomable
          />
        </ReactFlow>
      </div>
    </div>
  );
}
