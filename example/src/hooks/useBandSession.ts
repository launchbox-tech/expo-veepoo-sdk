import { useState } from 'react';
import sdk from 'expo-veepoo-sdk';
import type { BatteryInfo, DeviceVersion, PersonalInfo, VeepooDevice } from 'expo-veepoo-sdk';
import type { AppAction, AppState } from './appStateReducer';
import { useSDKEvent } from './useSDKEvent';

const DEFAULT_PERSONAL_INFO: PersonalInfo = {
  sex: 1,
  height: 175,
  weight: 70,
  age: 30,
  stepAim: 8000,
  sleepAim: 480,
};

export function useBandSession(
  appState: AppState,
  dispatch: React.Dispatch<AppAction>,
  stopScan: () => Promise<void>
): {
  connectedDevice: VeepooDevice | null;
  connectingDevice: VeepooDevice | null;
  connectError: string | null;
  syncDone: boolean;
  batteryInfo: BatteryInfo | null;
  deviceVersion: DeviceVersion | null;
  connect: (device: VeepooDevice) => Promise<void>;
  disconnect: () => Promise<void>;
  reconnect: () => Promise<void>;
} {
  const [connectedDevice, setConnectedDevice] = useState<VeepooDevice | null>(null);
  const [connectingDevice, setConnectingDevice] = useState<VeepooDevice | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [syncDone, setSyncDone] = useState(false);
  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo | null>(null);
  const [deviceVersion, setDeviceVersion] = useState<DeviceVersion | null>(null);

  const isActive = appState === 'connecting' || appState === 'ready';

  useSDKEvent(
    'deviceReady',
    async () => {
      setSyncDone(false);
      setBatteryInfo(null);
      setDeviceVersion(null);
      dispatch({ type: 'SESSION_READY' });

      const [, battery, version] = await Promise.allSettled([
        sdk.syncPersonalInfo(DEFAULT_PERSONAL_INFO),
        sdk.readBattery(),
        sdk.readDeviceVersion(),
      ]);

      setSyncDone(true);
      if (battery.status === 'fulfilled') setBatteryInfo(battery.value);
      if (version.status === 'fulfilled') setDeviceVersion(version.value);
    },
    isActive
  );

  useSDKEvent(
    'deviceDisconnected',
    () => {
      setConnectedDevice(null);
      setSyncDone(false);
      setConnectError(null);
      setBatteryInfo(null);
      setDeviceVersion(null);
      dispatch({ type: 'SESSION_ENDED' });
    },
    isActive
  );

  useSDKEvent(
    'deviceConnectStatus',
    ({ status, code }) => {
      if (status === 'error') {
        setConnectError(
          code != null
            ? `Connection failed (code ${code}). Is the device nearby?`
            : 'Connection failed. Make sure the device is nearby and try again.'
        );
        setConnectingDevice(null);
        setConnectedDevice(null);
        dispatch({ type: 'SESSION_ERROR' });
      }
    },
    isActive
  );

  useSDKEvent(
    'batteryData',
    ({ data }) => {
      setBatteryInfo(data);
    },
    appState === 'ready'
  );

  async function connect(device: VeepooDevice) {
    await stopScan();
    setConnectingDevice(device);
    setConnectedDevice(device);
    dispatch({ type: 'BAND_SELECTED' });
    await sdk.connect(device.id);
  }

  async function disconnect() {
    await sdk.disconnect();
    setConnectedDevice(null);
    setSyncDone(false);
    setConnectError(null);
    setBatteryInfo(null);
    setDeviceVersion(null);
    dispatch({ type: 'DISCONNECT' });
  }

  async function reconnect() {
    setConnectingDevice(null);
    setConnectError(null);
    dispatch({ type: 'RECONNECT' });
    await sdk.startScan();
  }

  return {
    connectedDevice,
    connectingDevice,
    connectError,
    syncDone,
    batteryInfo,
    deviceVersion,
    connect,
    disconnect,
    reconnect,
  };
}
