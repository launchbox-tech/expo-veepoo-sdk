import { useState } from 'react';
import { useVeepooSDK } from '@gaozh1024/expo-veepoo-sdk';
import type { BatteryInfo, DeviceVersion, PersonalInfo, VeepooDevice } from '@gaozh1024/expo-veepoo-sdk';
import { useSDKEvent } from './useSDKEvent';
import type { AppState } from './useAppState';

const DEFAULT_PERSONAL_INFO: PersonalInfo = {
  sex: 1,
  height: 175,
  weight: 70,
  age: 30,
  step_aim: 8000,
  sleep_aim: 480,
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
    async ({ device_id: _ }) => {
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
    ({ device_id: _ }) => {
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
    ({ device_id: _, status, code }) => {
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
    ({ device_id: _, data }) => {
      setBatteryInfo(data);
    },
    appState === 'ready'
  );

  async function connect(device: VeepooDevice) {
    await stopScan();
    setConnectingDevice(device);
    setConnectedDevice(device);
    await sdk.session.connect(device.id);
  }

  async function disconnect() {
    onIntentionalDisconnect();
    await sdk.session.disconnect();
    setConnectedDevice(null);
    setSyncDone(false);
    setConnectError(null);
    setBatteryInfo(null);
    setDeviceVersion(null);
  }

  async function reconnect() {
    setConnectingDevice(null);
    setConnectError(null);
    await sdk.discovery.startScan();
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
