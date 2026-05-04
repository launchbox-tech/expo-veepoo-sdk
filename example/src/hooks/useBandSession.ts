import { useCallback, useState } from 'react';
import { useVeepooSDK } from '@gaozh1024/expo-veepoo-sdk';
import type { BatteryInfo, DeviceVersion, PersonalInfo, VeepooDevice } from '@gaozh1024/expo-veepoo-sdk';
import { useSDKEvent } from './useSDKEvent';
import type { AppState } from './useAppState';

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
  onIntentionalDisconnect: () => void,
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
  const { sdk } = useVeepooSDK();
  const [connectedDevice, setConnectedDevice] = useState<VeepooDevice | null>(null);
  const [connectingDevice, setConnectingDevice] = useState<VeepooDevice | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [syncDone, setSyncDone] = useState(false);
  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo | null>(null);
  const [deviceVersion, setDeviceVersion] = useState<DeviceVersion | null>(null);

  const isActive = appState === 'connecting' || appState === 'ready';

  useSDKEvent(
    'deviceReady',
    async ({ deviceId: _ }) => {
      setSyncDone(false);
      setBatteryInfo(null);
      setDeviceVersion(null);

      const [, battery, version] = await Promise.allSettled([
        sdk.personalInfo.syncPersonalInfo(DEFAULT_PERSONAL_INFO),
        sdk.battery.readBattery(),
        sdk.deviceVersion.readDeviceVersion(),
      ]);

      setSyncDone(true);
      if (battery.status === 'fulfilled') setBatteryInfo(battery.value);
      if (version.status === 'fulfilled') setDeviceVersion(version.value);
    },
    isActive
  );

  useSDKEvent(
    'deviceDisconnected',
    ({ deviceId: _ }) => {
      setConnectedDevice(null);
      setSyncDone(false);
      setConnectError(null);
      setBatteryInfo(null);
      setDeviceVersion(null);
    },
    isActive
  );

  useSDKEvent(
    'deviceConnectStatus',
    ({ deviceId: _, status, code }) => {
      if (status === 'error') {
        setConnectError(
          code != null
            ? `Connection failed (code ${code}). Is the device nearby?`
            : 'Connection failed. Make sure the device is nearby and try again.'
        );
        setConnectingDevice(null);
        setConnectedDevice(null);
      }
    },
    isActive
  );

  useSDKEvent(
    'batteryData',
    ({ deviceId: _, data }) => {
      setBatteryInfo(data);
    },
    appState === 'ready'
  );

  const connect = useCallback(async (device: VeepooDevice) => {
    await stopScan();
    setConnectingDevice(device);
    setConnectedDevice(device);
    await sdk.session.connect(device.id);
  }, [sdk, stopScan]);

  const disconnect = useCallback(async () => {
    onIntentionalDisconnect();
    await sdk.session.disconnect();
    setConnectedDevice(null);
    setSyncDone(false);
    setConnectError(null);
    setBatteryInfo(null);
    setDeviceVersion(null);
  }, [sdk, onIntentionalDisconnect]);

  const reconnect = useCallback(async () => {
    setConnectingDevice(null);
    setConnectError(null);
    await sdk.discovery.startScan();
  }, [sdk]);

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
