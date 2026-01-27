/**
 * usePlatform Hook
 * React hook for accessing platform information
 */

import { useState, useEffect } from 'react';
import { getPlatform, getPlatformClass, type Platform } from '../lib/platform';

interface UsePlatformReturn {
  platform: Platform;
  isWindows: boolean;
  isMacOS: boolean;
  isLinux: boolean;
  platformClass: string;
  isLoading: boolean;
}

export function usePlatform(): UsePlatformReturn {
  const [platform, setPlatform] = useState<Platform>('unknown');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getPlatform().then((detectedPlatform) => {
      if (mounted) {
        setPlatform(detectedPlatform);
        setIsLoading(false);
        
        // Add platform class to document root for global styling
        document.documentElement.classList.add(getPlatformClass(detectedPlatform));
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return {
    platform,
    isWindows: platform === 'windows',
    isMacOS: platform === 'macos',
    isLinux: platform === 'linux',
    platformClass: getPlatformClass(platform),
    isLoading,
  };
}
