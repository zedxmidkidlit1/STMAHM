import { MappingDesign } from '../components/topology/TopologyControls';

export interface MappingThemeConfig {
  // Node component
  nodeComponent: 'default' | 'cyber' | 'mesh';
  
  // Background
  backgroundColor: string;
  backgroundGradient: string | null;
  patternColor: string;
  
  // Edges
  edgeStyle: 'smoothstep' | 'straight' | 'step';
  edgeWidth: number;
  edgeOpacity: number;
  edgeColor: string;
  edgeGlow: boolean;
  
  // Node styling
  nodeBoxShadow: string;
  
  // Features
  showMetrics: boolean;
  showTrafficMonitor: boolean;
}

// Visual theme configurations for mapping designs
export function getMappingTheme(design: MappingDesign, isDark: boolean): MappingThemeConfig {
  const themes: Record<MappingDesign, MappingThemeConfig> = {
    default: {
      // Clean, professional style (current)
      nodeComponent: 'default',
      backgroundColor: isDark ? '#0F172A' : '#F8FAFC', // Slate-900 dark, slate-50 light
      backgroundGradient: null,
      patternColor: isDark ? 'rgba(71, 85, 105, 0.3)' : 'rgba(148, 163, 184, 0.2)', // Visible dots in both modes
      edgeStyle: 'smoothstep',
      edgeWidth: 2,
      edgeOpacity: isDark ? 0.8 : 0.6,
      edgeColor: isDark ? '#3B82F6' : '#2563EB',
      edgeGlow: false,
      nodeBoxShadow: isDark
        ? '0 4px 12px rgba(0, 0, 0, 0.3)'
        : '0 2px 8px rgba(0, 0, 0, 0.1)',
      showMetrics: false,
      showTrafficMonitor: true, // ✅ Enabled for Default theme
    },
    cyber: {
      // Neon, futuristic style with detailed metrics
      nodeComponent: 'cyber',
      backgroundColor: isDark ? '#0A0E27' : '#EFF6FF', // Dark navy vs light blue
      backgroundGradient: isDark 
        ? 'linear-gradient(135deg, #0A0E27 0%, #1a1f3a 50%, #0A0E27 100%)'
        : 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #EFF6FF 100%)',
      patternColor: isDark ? '#0E3A5A' : 'rgba(59, 130, 246, 0.1)',
      edgeStyle: 'straight',
      edgeWidth: 2.5,
      edgeOpacity: isDark ? 0.85 : 0.7,
      edgeColor: isDark ? '#00D9FF' : '#2563EB',
      edgeGlow: isDark,
      nodeBoxShadow: isDark 
        ? '0 0 20px rgba(0, 217, 255, 0.3)'
        : '0 4px 12px rgba(37, 99, 235, 0.15)',
      showMetrics: true,
      showTrafficMonitor: true,
    },
    mesh: {
      // Grid/mesh network style with mission-control tones
      nodeComponent: 'mesh',
      backgroundColor: isDark ? '#061a2b' : '#F0F9FF',
      backgroundGradient: isDark
        ? 'linear-gradient(135deg, #061a2b 0%, #0b2b45 50%, #061a2b 100%)'
        : 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 50%, #F0F9FF 100%)',
      patternColor: isDark ? '#0E3A5A' : 'rgba(14, 165, 233, 0.1)',
      edgeStyle: 'smoothstep',
      edgeWidth: 1.5,
      edgeOpacity: isDark ? 0.5 : 0.4,
      edgeColor: isDark ? '#22D3EE' : '#0284C7',
      edgeGlow: false,
      nodeBoxShadow: isDark
        ? '0 4px 12px rgba(0, 0, 0, 0.4)'
        : '0 4px 12px rgba(14, 165, 233, 0.15)',
      showMetrics: false,
      showTrafficMonitor: true,
    },
  };

  return themes[design];
}
