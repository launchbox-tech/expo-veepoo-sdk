# @gaozh1024/expo-veepoo-sdk

An Expo SDK for integrating HBand wearable devices into React Native / Expo applications.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)](https://github.com/launchbox-tech/expo-veepoo-sdk)

Expo module for Bluetooth connectivity to Veepoo hardware, data reads, and health tests.

**Latest release:** `1.2.11`

- Usage: this `README.md`
- Upgrade notes: [docs/release-notes/1.2.11.md](docs/release-notes/1.2.11.md)
- Older releases: [docs/README.md](docs/README.md)
- Vendor API parity table: [docs/vendor-api/vendor-parity-matrix.md](docs/vendor-api/vendor-parity-matrix.md)

Design goals:

- Keep Android / iOS native layers close to each vendor SDK
- Normalize values exposed to the app in TypeScript
- Apps calling through the SDK receive consistent shapes

## Platform requirements

| Platform | Minimum | Expo Go | Notes |
| --- | --- | --- | --- |
| iOS | 15.1+ | No | Dev build required; Simulator builds run without real Bluetooth |
| Android | 6.0+ (API 23+) | No | Dev build required |

## Installation

Private, GitHub-only distribution:

```bash
npm install github:launchbox-tech/expo-veepoo-sdk
```

or

```bash
yarn add github:launchbox-tech/expo-veepoo-sdk
```

## Expo configuration

**Metro:** After installing, you do **not** need a custom `metro.config.js`. Metro resolves the package from `node_modules` using `package.json` `main` and `exports` (including the `react-native` condition used by Metro 0.82+).

### iOS

Add the config plugin in `app.json` or `app.config.js`:

```json
{
  "expo": {
    "plugins": [
      [
        "@gaozh1024/expo-veepoo-sdk",
        {
          "bluetoothAlwaysPermission": "Bluetooth access is required to connect to your Band",
          "bluetoothPeripheralPermission": "Bluetooth access is required to scan for Bands"
        }
      ]
    ]
  }
}
```

Then prebuild again:

```bash
npx expo prebuild --clean
cd ios && pod install && cd ..
npx expo run:ios
```

iOS notes:

- Physical devices support full Bluetooth behavior.
- The Simulator can compile and run dev builds.
- Vendor binaries are device-only; on Simulator the frameworks use a stub/no-op path—do not use it for real BLE debugging.
- `1.2.1` fixes `FRAMEWORK_SEARCH_PATHS` incorrectly quoting `$(inherited)` on device builds.
- `1.2.2` fixes missing embed for dynamic frameworks on real devices (startup crashes).
- `1.2.3` fixes the embed script when `FRAMEWORKS_FOLDER_PATH` is unset in some Xcode/CocoaPods setups.

### Android

Permissions are injected automatically. After first integrating, rebuild:

```bash
npx expo prebuild --clean
npx expo run:android
```

## React integration

The preferred way to use this SDK in a React / Expo app is through the provider and hooks. The provider handles SDK initialization, cleanup, and makes the SDK instance available anywhere in the tree via context.

### Provider setup

Wrap your app (or the relevant subtree) once at the root:

```tsx
// app/_layout.tsx
import { VeepooSDKProvider } from '@gaozh1024/expo-veepoo-sdk';
import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <VeepooSDKProvider>
      <Stack />
    </VeepooSDKProvider>
  );
}
```

Optional props:

| Prop | Type | Description |
| --- | --- | --- |
| `logEnabled` | `boolean` | Enable structured SDK logging on mount |
| `logger` | `(entry: LogEntry) => void` | Custom log sink |

The provider calls `sdk.init()` automatically on mount and `sdk.destroy()` on unmount. You do not need to call these yourself.

### Hooks

All hooks must be called inside `<VeepooSDKProvider>`.

| Hook | Returns | Description |
| --- | --- | --- |
| `useVeepooSDK()` | `{ sdk, status, error }` | SDK instance, current state snapshot, and last error |
| `useSDKState(selector)` | `T` | Reactive selector over the SDK state snapshot |
| `useIsSessionReady()` | `boolean` | `true` when connected and Band is ready |
| `useIsConnected()` | `boolean` | `true` when BLE connection is established |
| `useIsScanning()` | `boolean` | `true` while Band Discovery is active |
| `useConnectedDeviceId()` | `string \| null` | ID of the currently connected Band |
| `useSDKInitialized()` | `boolean` | `true` after `sdk.init()` resolves |

`useSDKState` accepts a selector function and re-renders only when the selected value changes:

```ts
import { useSDKState } from '@gaozh1024/expo-veepoo-sdk';

const isReady = useSDKState(s => s.isReady);
const deviceId = useSDKState(s => s.connectedDeviceId);
```

The `SDKStateSnapshot` shape:

```ts
type SDKStateSnapshot = {
  initialized: boolean;
  isConnected: boolean;
  isReady: boolean;
  isScanning: boolean;
  connectedDeviceId: string | null;
};
```

### Accessing the SDK

Use `useVeepooSDK()` to get the SDK instance and current state for any imperative call:

```tsx
import { useVeepooSDK } from '@gaozh1024/expo-veepoo-sdk';

function ScanButton() {
  const { sdk, status } = useVeepooSDK();
  return (
    <Button
      title={status.isScanning ? 'Stop' : 'Scan'}
      onPress={() =>
        status.isScanning ? sdk.discovery.stopScan() : sdk.discovery.startScan()
      }
    />
  );
}
```

### Subscribing to events

Use a `useSDKEvent` hook (copy this into your app — the example app in this repo includes a ready-made version):

```ts
import { useEffect, useRef } from 'react';
import { useVeepooSDK } from '@gaozh1024/expo-veepoo-sdk';
import type { VeepooEvent, VeepooEventPayload } from '@gaozh1024/expo-veepoo-sdk';

export function useSDKEvent<K extends VeepooEvent>(
  event: K,
  handler: (payload: VeepooEventPayload[K]) => void,
  active = true,
): void {
  const { sdk } = useVeepooSDK();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!active) return;
    const stable = (payload: VeepooEventPayload[K]) => handlerRef.current(payload);
    sdk.on(event, stable);
    return () => { sdk.off(event, stable); };
  }, [sdk, event, active]);
}
```

The "latest ref" pattern (`handlerRef.current = handler` in the render body) ensures the subscription never goes stale even when the handler is an inline arrow function, without causing extra subscribe/unsubscribe cycles.

Usage:

```tsx
useSDKEvent('heart_rate_test_result', ({ result }) => {
  setHrResult(result);
}, isReady);

useSDKEvent('device_found', ({ device }) => {
  setDevices(prev => [...prev, device]);
}, isScanning);
```

### Quick start

```tsx
// app/_layout.tsx
import { VeepooSDKProvider } from '@gaozh1024/expo-veepoo-sdk';
import { Stack } from 'expo-router';

export default function Layout() {
  return <VeepooSDKProvider><Stack /></VeepooSDKProvider>;
}
```

```tsx
// ScanScreen.tsx
import { useVeepooSDK, useIsScanning } from '@gaozh1024/expo-veepoo-sdk';
import type { VeepooDevice } from '@gaozh1024/expo-veepoo-sdk';
import { useState } from 'react';
import { Button, FlatList, Text } from 'react-native';

export function ScanScreen() {
  const { sdk } = useVeepooSDK();
  const isScanning = useIsScanning();
  const [devices, setDevices] = useState<VeepooDevice[]>([]);

  useSDKEvent('device_found', ({ device }) => {
    setDevices(prev => {
      const idx = prev.findIndex(d => d.id === device.id);
      if (idx !== -1) {
        const next = [...prev]; next[idx] = device; return next;
      }
      return [...prev, device];
    });
  }, isScanning);

  return (
    <>
      <Button
        title={isScanning ? 'Stop' : 'Scan'}
        onPress={() =>
          isScanning ? sdk.discovery.stopScan() : sdk.discovery.startScan()
        }
      />
      <FlatList
        data={devices}
        keyExtractor={d => d.id}
        renderItem={({ item }) => (
          <Text onPress={() => sdk.session.connect(item.id)}>
            {item.name} ({item.rssi} dBm)
          </Text>
        )}
      />
    </>
  );
}
```

The full working example app is in the `example/` directory of this repo.

## SDK modules

The SDK is accessed via `const { sdk } = useVeepooSDK()`. All methods are organized into sub-modules.

### `sdk.discovery` — Band Discovery

```ts
await sdk.discovery.startScan()
await sdk.discovery.stopScan()
await sdk.discovery.requestPermissions()   // → PermissionsResult
await sdk.discovery.checkBluetoothStatus() // → boolean
```

Events: `device_found`, `bluetooth_state_changed`

### `sdk.session` — Session

```ts
await sdk.session.connect(deviceId: string)
await sdk.session.disconnect()
```

Events: `device_connected`, `device_disconnected`, `device_ready`, `device_connect_status`, `connection_status_changed`

### `sdk.personalInfo` — Personal Info

```ts
await sdk.personalInfo.syncPersonalInfo(info: PersonalInfo) // → boolean
```

### `sdk.battery` — Battery

```ts
await sdk.battery.readBattery() // → BatteryInfo
```

Events: `battery_data`

### `sdk.device_version` — Device Version

```ts
await sdk.device_version.readDeviceVersion() // → DeviceVersion
```

Events: `device_version`

### `sdk.deviceFunctions` — Device Functions

```ts
await sdk.deviceFunctions.readDeviceFunctions() // → DeviceFunctions
```

Events: `device_function`

### `sdk.deviceTime` — Device Time

```ts
await sdk.deviceTime.setDeviceTime(time?: Date) // → boolean
```

### `sdk.language` — Language

```ts
await sdk.language.setLanguage(language: Language) // → boolean
```

### `sdk.realtimeTests` — Realtime Health Tests

```ts
import { RealtimeTest } from '@gaozh1024/expo-veepoo-sdk';

await sdk.realtimeTests.startTest(modality: RealtimeTest)
await sdk.realtimeTests.stopTest(modality: RealtimeTest)
await sdk.realtimeTests.startEcgTest(options?: EcgTestOptions)
await sdk.realtimeTests.stopEcgTest()
```

`RealtimeTest` values: `HEART_RATE`, `BLOOD_PRESSURE`, `BLOOD_OXYGEN`, `TEMPERATURE`, `STRESS`, `BLOOD_GLUCOSE`, `HRV`, `FATIGUE`, `BREATHING`, `BODY_COMPOSITION`

Events: `heart_rate_test_result`, `blood_pressure_test_result`, `blood_oxygen_test_result`, `temperature_test_result`, `stress_data`, `blood_glucose_data`, `hrv_test_result`, `ecg_test_result`, `fatigue_test_result`, `breathing_test_result`, `body_composition_test_result`, `ptt_test_result`, `ptt_state_changed`, `gsr_test_result`

### `sdk.historicalQuery` — Historical Data

```ts
await sdk.historicalQuery.startReadOriginData()
```

Events: `read_origin_progress`, `read_origin_complete`, `origin_five_minute_data`, `origin_half_hour_data`, `origin_spo2_data`, `sleep_data`, `accurate_sleep_data`, `sport_step_data`

`read_origin_progress.progress` is an integer 0–100 (truncated, not rounded). Events fire only when the integer changes. Completion always sends 100.

### `sdk.sleep_data` — Sleep Data

```ts
await sdk.sleep_data.readSleepData(date?: string) // → SleepData[]
```

### `sdk.sportSteps` — Sport / Steps

```ts
await sdk.sportSteps.readSportStepData(date?: string) // → SportStepData
```

### `sdk.originData` — Origin / Half-hour Data

```ts
await sdk.originData.readOriginData(dayOffset?: number)      // → OriginData[]
await sdk.originData.readDaySummaryData(dayOffset?: number)  // → DaySummaryData
```

### `sdk.daySummary` — Day Summary

```ts
await sdk.daySummary.readDaySummaryData(dayOffset?: number) // → DaySummaryData
```

### `sdk.autoMeasure` — Auto Measure

```ts
await sdk.autoMeasure.readAutoMeasureSetting()                       // → AutoMeasureSetting[]
await sdk.autoMeasure.modifyAutoMeasureSetting(Partial<AutoMeasureSetting>) // → AutoMeasureSetting[]
```

### `sdk.socialMsg` — Social Messages

```ts
await sdk.socialMsg.readSocialMsgData()               // → SocialMsgData
await sdk.socialMsg.writeSocialMsgData(Partial<SocialMsgData>) // → OperationStatus
```

Events: `social_msg_data`

### `sdk.alarms` — Alarms

```ts
await sdk.alarms.readAlarms()                      // → DeviceAlarm[]
await sdk.alarms.setAlarm(alarm: DeviceAlarm)      // → OperationStatus
await sdk.alarms.deleteAlarm(alarmId: number)      // → OperationStatus
await sdk.alarms.readHeartRateAlarm()              // → HeartRateAlarm
await sdk.alarms.setHeartRateAlarm(alarm: HeartRateAlarm) // → OperationStatus
```

Events: `alarm_data`, `heart_rate_alarm_data` *(JS-local — emitted by `readHeartRateAlarm` / `setHeartRateAlarm`)*

### `sdk.screenLight` — Screen Brightness and On-time

```ts
await sdk.screenLight.readScreenLightSettings()             // → ScreenLightSettings
await sdk.screenLight.setScreenLightSettings(ScreenLightSettings)
await sdk.screenLight.readScreenLightDuration()             // → ScreenLightDuration
await sdk.screenLight.setScreenLightDuration(seconds: number)
```

### `sdk.sedentaryReminder` — Sedentary Reminder

```ts
await sdk.sedentaryReminder.readSedentaryReminder()                   // → SedentaryReminderSettings
await sdk.sedentaryReminder.setSedentaryReminder(SedentaryReminderSettings)
```

### `sdk.wristFlip` — Wrist Flip Wake

```ts
await sdk.wristFlip.readWristFlipWakeSettings()             // → WristFlipWakeSettings
await sdk.wristFlip.setWristFlipWakeSettings(WristFlipWakeSettings)
```

### `sdk.womenHealth` — Women's Health

```ts
await sdk.womenHealth.readWomenHealthSettings()             // → WomenHealthSettings
await sdk.womenHealth.setWomenHealthSettings(WomenHealthSettings)
```

### `sdk.watchFace` — Watch Face

```ts
await sdk.watchFace.readWatchFaceStyle(options?: { dialType?: WatchFaceDialType }) // → WatchFaceStyle
await sdk.watchFace.setWatchFaceStyle(WatchFaceStyleSettings)
```

### `sdk.weather` — Weather

```ts
await sdk.weather.readWeatherSettings()            // → WeatherSettings
await sdk.weather.setWeatherSettings(WeatherSettings)
await sdk.weather.pushWeatherData(WeatherData)
```

### `sdk.contacts` — Contacts

```ts
await sdk.contacts.readContacts(crc?: number)                            // → DeviceContact[]
await sdk.contacts.addContact(contact: NewDeviceContact)
await sdk.contacts.deleteContact(contactId: number)
await sdk.contacts.setContactSosState(contactId: number, isOpen: boolean)
```

Events: `contacts_data`

### `sdk.sos` — SOS

```ts
await sdk.sos.readSosCallTimes()           // → SosCallTimesSettings
await sdk.sos.setSosCallTimes(times: number)
```

Events: `sos_call_times_data`, `device_sos_triggered`

### `sdk.camera` — Camera

```ts
await sdk.camera.enterCameraMode()
await sdk.camera.exitCameraMode()
```

Events: `camera_shutter`

### `sdk.music` — Music Remote

```ts
await sdk.music.setMusicControlEnabled(enabled: boolean)
await sdk.music.pushMusicData(data: MusicData)
```

Events: `music_remote_command`

### `sdk.findDevice` — Find Device

```ts
await sdk.findDevice.startFindDevice()
await sdk.findDevice.stopFindDevice()
```

Events: `find_device_state`

### `sdk.btStatus` — Band Bluetooth

```ts
await sdk.btStatus.readDeviceBTStatus() // → DeviceBTStatus
await sdk.btStatus.setDeviceBTSwitch(open: boolean)
```

Events: `device_bt_state_changed`

### `sdk.gpsTimezone` — GPS and Timezone

```ts
await sdk.gpsTimezone.setDeviceGPSAndTimezone(data: GPSAndTimezoneData)
```

### `sdk.dfu` — Firmware Update

```ts
await sdk.dfu.startLocalFirmwareDfu(filePath: string)
```

Events: `firmware_dfu_progress`

## Events

### Session and connectivity

- `device_found`
- `device_connected`
- `device_disconnected`
- `device_connect_status`
- `connection_status_changed`
- `device_ready`

### Bluetooth

- `bluetooth_state_changed`
- `device_bt_state_changed`

### Band metadata

- `device_function`
- `device_version`
- `password_data`
- `social_msg_data`
- `battery_data`
- `custom_settings_data`

### Historical data reads

- `read_origin_progress`
- `read_origin_complete`
- `origin_five_minute_data`
- `origin_half_hour_data`
- `origin_spo2_data`
- `sleep_data`
- `accurate_sleep_data`
- `sport_step_data`

### Realtime health tests

- `heart_rate_test_result`
- `blood_pressure_test_result`
- `blood_oxygen_test_result`
- `temperature_test_result`
- `stress_data`
- `blood_glucose_data`
- `hrv_test_result`
- `ecg_test_result`
- `fatigue_test_result`
- `breathing_test_result`
- `body_composition_test_result`
- `blood_analysis_test_result`
- `gsr_test_result`
- `ptt_test_result`
- `ptt_state_changed`

### Stored vitals

- `stored_temperature_data`
- `stored_blood_glucose_data`
- `stored_hrv_data`
- `stored_ecg_data`
- `stored_body_composition_data`

### Device settings and alerts

- `alarm_data`
- `heart_rate_alarm_data` *(JS-local — emitted by `readHeartRateAlarm` / `setHeartRateAlarm`)*
- `find_device_state`
- `firmware_dfu_progress`
- `contacts_data`
- `sos_call_times_data`
- `device_sos_triggered`
- `camera_shutter`
- `music_remote_command`
- `health_remind_data`
- `apnea_remind_data`
- `sport_mode_data`
- `exercise_session_data`

### SDK

- `error`

## Logging

Enable structured logging via `VeepooSDKProvider` props:

```tsx
<VeepooSDKProvider
  logEnabled
  logger={(entry) => console.log('[veepoo]', entry.level, entry.scope, entry.action, entry)}
>
  <Stack />
</VeepooSDKProvider>
```

Log entry fields: `timestamp`, `level`, `scope`, `action`, `platform`, `message`, `deviceId`, `data`, `error`

## Local development

```bash
bun run typecheck
bun test
bun run build
```

## Pre-release checklist

```bash
bun run typecheck
bun test
bun run build
npm pack --dry-run
```

## Reference documentation

Vendor SDK snapshots checked into this repo:

- `docs/vendor-api/veepoo-sdk-android-api.md`
- `docs/vendor-api/veepoo-sdk-ios-api.md`

## License

MIT
