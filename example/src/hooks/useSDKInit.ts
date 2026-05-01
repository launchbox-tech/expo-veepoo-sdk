import { useEffect, useState } from 'react';
import sdk from 'expo-veepoo-sdk';
import type { PermissionsResult } from 'expo-veepoo-sdk';
import type { AppAction } from './appStateReducer';

export function useSDKInit(dispatch: React.Dispatch<AppAction>): {
  permissions: PermissionsResult | null;
} {
  const [permissions, setPermissions] = useState<PermissionsResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function setup() {
      await sdk.init();
      const result = await sdk.requestPermissions();
      if (!cancelled) {
        setPermissions(result);
        dispatch({ type: 'SDK_READY' });
      }
    }
    setup();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return { permissions };
}
