import { useEffect, useRef } from 'react';
import { useVeepooSDK } from '@gaozh1024/expo-veepoo-sdk';
import type { VeepooEvent, VeepooEventPayload } from '@gaozh1024/expo-veepoo-sdk';

export function useSDKEvent<K extends VeepooEvent>(
  event: K,
  handler: (payload: VeepooEventPayload[K]) => void,
  active: boolean
): void {
  const { sdk } = useVeepooSDK();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!active) return;
    const stable = (payload: VeepooEventPayload[K]) => handlerRef.current(payload);
    sdk.on(event, stable);
    return () => {
      sdk.off(event, stable);
    };
  }, [sdk, event, active]);
}
