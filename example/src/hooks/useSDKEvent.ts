import { useEffect } from 'react';
import sdk from '@gaozh1024/expo-veepoo-sdk';
import type { VeepooEvent, VeepooEventPayload } from '@gaozh1024/expo-veepoo-sdk';

export function useSDKEvent<K extends VeepooEvent>(
  event: K,
  handler: (payload: VeepooEventPayload[K]) => void,
  active: boolean
): void {
  useEffect(() => {
    if (!active) return;
    sdk.on(event, handler);
    return () => {
      sdk.off(event, handler);
    };
  }, [event, active, handler]);
}
