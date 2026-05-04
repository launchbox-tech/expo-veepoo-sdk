import { useEffect, useState } from 'react';
import { useVeepooSDK, useSDKInitialized } from '@gaozh1024/expo-veepoo-sdk';
import type { PermissionsResult } from '@gaozh1024/expo-veepoo-sdk';

export function useSDKInit(): { permissions: PermissionsResult | null } {
  const { sdk } = useVeepooSDK();
  const initialized = useSDKInitialized();
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
