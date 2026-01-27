import { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  NodeMouseHandler,
  Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'framer-motion';
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

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when scan result changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Handle node click
  const onNodeClick: NodeMouseHandler = useCallback((_event, node) => {
    if (!scanResult?.active_hosts) return;
    const device = scanResult.active_hosts.find(h => h.ip === node.id);
    if (device && onDeviceClick) {
      onDeviceClick(device);
    }
  }, [onDeviceClick, scanResult]);

  // Theme-aware colors - Professional for BOTH modes
  const bgColor = isDark ? '#020617' : '#FFFFFF'; // Dark: slate-950, Light: pure white
  const patternColor = isDark ? '#1E293B' : '#CBD5E1'; // More visible dots for light mode
  const edgeColor = isDark ? '#3B82F6' : '#2563EB';
  const controlsBg = isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const controlsBorder = isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(148, 163, 184, 0.3)'; // Blue for dark, grey for light
  const controlsText = isDark ? '#F8FAFC' : '#0F172A';

  // Enhanced edge styling with latency-based colors
  const enhancedEdges: Edge[] = useMemo(() => {
    return edges.map(edge => {
      // Get latency from source node data (if available)
      const sourceNode = nodes.find(n => n.id === edge.source);
      const latency = (sourceNode?.data as any)?.responseTime || 50;
      
      // Color based on latency: green (<50ms), yellow (<100ms), red (>100ms)
      let strokeColor = edgeColor;
      if (latency < 50) strokeColor = '#10B981'; // green
      else if (latency < 100) strokeColor = '#F59E0B'; // yellow
      else strokeColor = '#EF4444'; // red

      return {
        ...edge,
        animated: true,
        style: { 
          stroke: strokeColor, 
          strokeWidth: 2,
          opacity: isDark ? 0.8 : 0.6,
        },
      };
    });
  }, [edges, nodes, edgeColor, isDark]);

  // Empty state
  if (!scanResult && !isScanning) {
    return (
      <div className="h-full flex flex-col">
        <motion.div 
          className="p-6 border-b border-theme"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-text-primary">Network Topology</h1>
          <p className="text-text-muted mt-1">No scan data available</p>
        </motion.div>
        <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: bgColor }}>
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <WifiOff className="w-16 h-16 mx-auto mb-4 text-text-muted" />
            </motion.div>
            <p className="text-text-muted text-lg">
              {tauriAvailable 
                ? 'Click "Start Scan" to discover network topology'
                : 'Run with `npm run tauri dev` to enable scanning'}
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isScanning) {
    return (
      <div className="h-full flex flex-col">
        <motion.div 
          className="p-6 border-b border-theme"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h1 className="text-2xl font-bold text-text-primary">Network Topology</h1>
          <p className="text-text-muted mt-1">Scanning network...</p>
        </motion.div>
        <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: bgColor }}>
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat:Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-16 h-16 mx-auto mb-4 text-accent-blue" />
            </motion.div>
            <p className="text-text-muted text-lg">Discovering network topology...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <motion.div 
        className="p-6 border-b border-theme"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-text-primary">Network Topology</h1>
        <p className="text-text-muted mt-1">
          Interactive network map • {nodes.length} devices • Click any device for details
        </p>
      </motion.div>

      {/* React Flow Canvas */}
      <motion.div 
        className="flex-1" 
        style={{ backgroundColor: bgColor }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <ReactFlow
          nodes={nodes}
          edges={enhancedEdges}
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
          }}
          proOptions={{ hideAttribution: true }}
          style={{
            backgroundColor: bgColor,
          }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={isDark ? 20 : 20}
            size={isDark ? 1.5 : 2}
            color={patternColor}
          />
          <Controls
            style={{
              backgroundColor: controlsBg,
              border: `1px solid ${controlsBorder}`,
              borderRadius: 12,
              color: controlsText,
              backdropFilter: 'blur(12px)',
              boxShadow: isDark 
                ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
                : '0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(148, 163, 184, 0.1)',
            }}
            showInteractive={false}
          />
          <MiniMap
            style={{
              backgroundColor: controlsBg,
              border: `1px solid ${controlsBorder}`,
              borderRadius: 12,
              backdropFilter: 'blur(12px)',
              boxShadow: isDark 
                ? '0 8px 32px rgba(0, 0, 0, 0.4)' 
                : '0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(148, 163, 184, 0.1)',
            }}
            nodeColor={(node) => {
              const deviceType = node.data?.deviceType as string;
              const colors: Record<string, string> = {
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
              };
              return colors[deviceType] || '#9CA3AF';
            }}
            maskColor={isDark ? 'rgba(2, 6, 23, 0.9)' : 'rgba(248, 250, 252, 0.85)'}
            pannable
            zoomable
          />
        </ReactFlow>
      </motion.div>
    </div>
  );
}
