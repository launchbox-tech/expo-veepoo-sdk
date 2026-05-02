import { useState } from 'react';
import sdk from '@gaozh1024/expo-veepoo-sdk';
import type { VeepooDevice } from '@gaozh1024/expo-veepoo-sdk';
import type { AppAction, AppState } from './appStateReducer';
import { useSDKEvent } from './useSDKEvent';

export function useBandScan(
  appState: AppState,
  dispatch: React.Dispatch<AppAction>
): {
  devices: VeepooDevice[];
  startScan: () => Promise<void>;
  stopScan: () => Promise<void>;
} {
  const [devices, setDevices] = useState<VeepooDevice[]>([]);

  useSDKEvent(
    'deviceFound',
    ({ device, timestamp: _ }) => {
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
    dispatch({ type: 'SCAN_START' });
    await sdk.startScan();
  }

  async function stopScan() {
    await sdk.stopScan();
    dispatch({ type: 'SCAN_STOP' });
  }

  return { devices, startScan, stopScan };
}
