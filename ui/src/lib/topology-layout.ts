import { Node, Edge } from '@xyflow/react';
import { HostInfo } from '../hooks/useScan';

interface TopologyResult {
  nodes: Node[];
  edges: Edge[];
}

/**
 * Generate a hierarchical topology layout from host data
 * Router at top, then switches/APs, then end devices
 */
export function generateTopologyLayout(hosts: HostInfo[]): TopologyResult {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  if (!hosts || hosts.length === 0) {
    return { nodes, edges };
  }

  // Separate hosts by type for hierarchical layout
  const routers = hosts.filter((h) => h.device_type === 'ROUTER');
  const infrastructure = hosts.filter((h) =>
    ['SWITCH', 'ACCESS_POINT', 'FIREWALL'].includes(h.device_type)
  );
  const servers = hosts.filter((h) =>
    ['SERVER', 'NAS'].includes(h.device_type)
  );
  const endpoints = hosts.filter(
    (h) =>
      !['ROUTER', 'SWITCH', 'ACCESS_POINT', 'FIREWALL', 'SERVER', 'NAS'].includes(
        h.device_type
      )
  );

  const nodeWidth = 180;
  const nodeHeight = 100;
  const horizontalGap = 40;
  const verticalGap = 120;

  let currentY = 50;

  // Helper to position nodes in a row
  const positionRow = (items: HostInfo[], y: number): Node[] => {
    const totalWidth = items.length * nodeWidth + (items.length - 1) * horizontalGap;
    const startX = -totalWidth / 2 + nodeWidth / 2;

    return items.map((host, index) => ({
      id: host.ip,
      type: 'device',
      position: {
        x: startX + index * (nodeWidth + horizontalGap),
        y,
      },
      data: {
        label: host.hostname || host.ip,
        ip: host.ip,
        mac: host.mac,
        deviceType: host.device_type,
        isOnline: host.response_time_ms !== null && host.response_time_ms !== undefined,
        riskScore: host.risk_score,
        vendor: host.vendor,
      },
    }));
  };

  // Layer 1: Routers (top)
  if (routers.length > 0) {
    nodes.push(...positionRow(routers, currentY));
    currentY += nodeHeight + verticalGap;
  }

  // Layer 2: Infrastructure (switches, APs)
  if (infrastructure.length > 0) {
    nodes.push(...positionRow(infrastructure, currentY));
    currentY += nodeHeight + verticalGap;
  }

  // Layer 3: Servers
  if (servers.length > 0) {
    nodes.push(...positionRow(servers, currentY));
    currentY += nodeHeight + verticalGap;
  }

  // Layer 4: End devices (split into rows if too many)
  const maxPerRow = 6;
  for (let i = 0; i < endpoints.length; i += maxPerRow) {
    const rowItems = endpoints.slice(i, i + maxPerRow);
    nodes.push(...positionRow(rowItems, currentY));
    currentY += nodeHeight + verticalGap;
  }

  // Create edges
  const routerIds = routers.map((r) => r.ip);
  const infrastructureIds = infrastructure.map((i) => i.ip);

  if (routerIds.length > 0) {
    // Connect infrastructure to first router
    infrastructureIds.forEach((infraId) => {
      edges.push({
        id: `${routerIds[0]}-${infraId}`,
        source: routerIds[0],
        target: infraId,
        type: 'smoothstep',
        animated: true,
      });
    });

    // Connect servers to router (or switch if available)
    const connectTo = infrastructureIds.length > 0 ? infrastructureIds[0] : routerIds[0];
    servers.forEach((server) => {
      edges.push({
        id: `${connectTo}-${server.ip}`,
        source: connectTo,
        target: server.ip,
        type: 'smoothstep',
      });
    });

    // Connect endpoints to infrastructure or router
    endpoints.forEach((endpoint, idx) => {
      const possibleTargets = infrastructureIds.length > 0 ? infrastructureIds : routerIds;
      const targetId = possibleTargets[idx % possibleTargets.length];

      edges.push({
        id: `${targetId}-${endpoint.ip}`,
        source: targetId,
        target: endpoint.ip,
        type: 'smoothstep',
      });
    });
  } else if (nodes.length > 1) {
    // No router found, connect all to first node
    const firstNode = nodes[0];
    nodes.slice(1).forEach((node) => {
      edges.push({
        id: `${firstNode.id}-${node.id}`,
        source: firstNode.id,
        target: node.id,
        type: 'smoothstep',
      });
    });
  }

  return { nodes, edges };
}
