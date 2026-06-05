import { useEffect, useState } from 'react';
import { useVeepooSDK, useSDKState } from 'expo-veepoo-sdk';
import type { PermissionsResult } from 'expo-veepoo-sdk';

export function useSDKInit(): { permissions: PermissionsResult | null } {
  const { sdk } = useVeepooSDK();
  const initialized = useSDKState((s) => s.initialized);
  const [permissions, setPermissions] = useState<PermissionsResult | null>(null);

  useEffect(() => {
    if (!initialized) return;
    let cancelled = false;
    sdk.discovery.requestPermissions().then((result) => {
      if (!cancelled) setPermissions(result);
    });
    return () => { cancelled = true; };
  }, [sdk, initialized]);

  return { permissions };
}
