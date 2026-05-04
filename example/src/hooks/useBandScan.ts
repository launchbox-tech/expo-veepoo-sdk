import { useState } from 'react';
import { useVeepooSDK } from '@gaozh1024/expo-veepoo-sdk';
import type { VeepooDevice } from '@gaozh1024/expo-veepoo-sdk';
import { useSDKEvent } from './useSDKEvent';
import type { AppState } from './useAppState';

export function useBandScan(appState: AppState): {
  devices: VeepooDevice[];
  startScan: () => Promise<void>;
  stopScan: () => Promise<void>;
} {
  const { sdk } = useVeepooSDK();
  const [devices, setDevices] = useState<VeepooDevice[]>([]);

  useSDKEvent(
    'deviceFound',
    ({ device }) => {
      setDevices(prev => {
        const idx = prev.findIndex(d => d.id === device.id);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = device;
          return next;
        }
        return [...prev, device];
      });
    },
    appState === 'scanning'
  );

  async function startScan() {
    setDevices([]);
    await sdk.discovery.startScan();
  }

  async function stopScan() {
    await sdk.discovery.stopScan();
  }

  return { devices, startScan, stopScan };
}
