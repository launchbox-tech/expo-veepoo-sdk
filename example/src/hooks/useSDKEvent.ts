import { useEffect } from 'react';
import sdk from 'expo-veepoo-sdk';
import type { VeepooEvent, VeepooEventPayload } from 'expo-veepoo-sdk';

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
