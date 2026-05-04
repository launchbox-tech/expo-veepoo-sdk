import { useEffect } from 'react';
import { useVeepooSDK } from '@gaozh1024/expo-veepoo-sdk';
import type { VeepooEvent, VeepooEventPayload } from '@gaozh1024/expo-veepoo-sdk';

export function useSDKEvent<K extends VeepooEvent>(
  event: K,
  handler: (payload: VeepooEventPayload[K]) => void,
  active: boolean
): void {
  const { sdk } = useVeepooSDK();
  useEffect(() => {
    if (!active) return;
    sdk.on(event, handler);
    return () => {
      sdk.off(event, handler);
    };
  }, [sdk, event, active, handler]);
}
