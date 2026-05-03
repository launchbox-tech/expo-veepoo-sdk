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
- Apps calling through `VeepooSDK` receive consistent shapes

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

## Quick start

```ts
import VeepooSDK from '@gaozh1024/expo-veepoo-sdk';

await VeepooSDK.init();

const enabled = await VeepooSDK.checkBluetoothStatus();
if (!enabled) {
  throw new Error('Bluetooth is disabled');
}

const permission = await VeepooSDK.requestPermissions();
if (!permission.granted) {
  throw new Error(`Permission denied: ${permission.status}`);
}

VeepooSDK.on('deviceFound', ({ device }) => {
  console.log('deviceFound', device.id, device.name, device.rssi);
});

await VeepooSDK.startScan({ timeout: 10000 });
```

Connect:

```ts
await VeepooSDK.connect(deviceId, {
  password: '0000',
  is24Hour: true,
});

VeepooSDK.on('deviceConnected', ({ deviceId }) => {
  console.log('deviceConnected', deviceId);
});

VeepooSDK.on('deviceReady', ({ deviceId }) => {
  console.log('deviceReady', deviceId);
});
```

Read data:

```ts
const battery = await VeepooSDK.readBattery();
const version = await VeepooSDK.readDeviceVersion();
const sleepList = await VeepooSDK.readSleepData();
const sport = await VeepooSDK.readSportStepData();

console.log(battery.chargeState, battery.level);
console.log(version.deviceNumber, version.hardwareVersion);
console.log(sleepList);
console.log(sport.stepCount, sport.distance);
```

## Unified return shapes

Import:

```ts
import VeepooSDK from '@gaozh1024/expo-veepoo-sdk';
```

Do not rely on `NativeVeepooSDK` directly. `VeepooSDK` normalizes returns from:

- `requestPermissions`
- `verifyPassword`
- `readBattery`
- `readDeviceFunctions`
- `readSocialMsgData`
- `readDeviceVersion`
- `readSleepData`
- `readSportStepData`
- `readOriginData`
- `readDaySummaryData`
- `readAutoMeasureSetting`
- `modifyAutoMeasureSetting`

…and normalizes payloads for events including:

- `bluetoothStateChanged`
- `readOriginProgress`
- `deviceFunction`
- `deviceVersion`
- `passwordData`
- `socialMsgData`
- `batteryData`
- `alarmData`
- `heartRateAlarmData`
- `originFiveMinuteData`
- `originHalfHourData`
- `originSpo2Data`
- `sleepData`
- `sportStepData`
- `heartRateTestResult`
- `bloodPressureTestResult`
- `bloodOxygenTestResult`
- `temperatureTestResult`
- `stressData`
- `bloodGlucoseData`
- `hrvTestResult`
- `ecgTestResult`
- `fatigueTestResult`
- `breathingTestResult`
- `bodyCompositionTestResult`
- `findDeviceState`
- `cameraShutter`
- `musicRemoteCommand`
- `deviceBTStateChanged`
- `contactsData`
- `sosCallTimesData`

For `readOriginProgress`, `progress` means:

- Integer percent `0–100`
- Truncated from any fractional input—no rounding
- Events fire again only when the integer changes
- Completion always sends `100`

## Logging

Optional structured logging (off by default). Enable it to trace scan, connect, reads, and tests.

```ts
import VeepooSDK, { type LogEntry } from '@gaozh1024/expo-veepoo-sdk';

VeepooSDK
  .setLogEnabled(true)
  .setLogger((entry: LogEntry) => {
    console.log('[veepoo-log]', entry.level, entry.scope, entry.action, entry);
  });
```

Methods:

- `setLogEnabled(enabled: boolean): VeepooSDK`
- `isLogEnabled(): boolean`
- `setLogger(logger: ((entry: LogEntry) => void) | null): VeepooSDK`

Fields:

- `timestamp`
- `level`
- `scope`
- `action`
- `platform`
- `message`
- `deviceId`
- `data`
- `error`

## Bluetooth and Session listeners

System Bluetooth:

```ts
VeepooSDK.on('bluetoothStateChanged', (payload) => {
  console.log(payload.state, payload.authorization);
});
```

Disconnect and connection changes:

```ts
VeepooSDK.on('deviceDisconnected', ({ deviceId }) => {
  console.log('deviceDisconnected', deviceId);
});

VeepooSDK.on('connectionStatusChanged', ({ deviceId, status }) => {
  console.log('connectionStatusChanged', deviceId, status);
});

VeepooSDK.on('deviceConnectStatus', ({ deviceId, status, code }) => {
  console.log('deviceConnectStatus', deviceId, status, code);
});
```

Subscribe to all three to cover device drops and Bluetooth toggling off.

## Common APIs

### Initialization

- `init(): Promise<void>`
- `destroy(): void`
- `isSDKInitialized(): boolean`
- `checkBluetoothStatus(): Promise<boolean>`
- `requestPermissions(): Promise<PermissionsResult>`
- `setLogEnabled(enabled: boolean): VeepooSDK`
- `isLogEnabled(): boolean`
- `setLogger(logger: ((entry: LogEntry) => void) | null): VeepooSDK`

### Scan and Session

- `startScan(options?: ScanOptions): Promise<void>`
- `stopScan(): Promise<void>`
- `isScanningActive(): boolean`
- `connect(deviceId: string, options?: ConnectOptions): Promise<void>`
- `disconnect(deviceId?: string): Promise<void>`
- `getConnectionStatus(deviceId?: string): Promise<ConnectionStatus>`
- `getConnectedDeviceId(): string | null`
- `verifyPassword(password?: string, is24Hour?: boolean): Promise<PasswordData>`

### Event listeners

- `on<K>(event: K, listener: (payload: VeepooEventPayload[K]) => void): VeepooSDK`
- `off<K>(event: K, listener: (payload: VeepooEventPayload[K]) => void): VeepooSDK`
- `once<K>(event: K, listener: (payload: VeepooEventPayload[K]) => void): VeepooSDK`
- `removeAllListeners(event?: VeepooEvent): VeepooSDK`

### Band info

- `readBattery(): Promise<BatteryInfo>`
- `readDeviceFunctions(): Promise<DeviceFunctions>`
- `readDeviceVersion(): Promise<DeviceVersion>`
- `readSocialMsgData(): Promise<SocialMsgData>`
- `writeSocialMsgData(data: Partial<SocialMsgData>): Promise<OperationStatus>`
- `syncPersonalInfo(info: PersonalInfo): Promise<boolean>`
- `setLanguage(language: Language): Promise<boolean>`

### Data reads

- `startReadOriginData(): Promise<void>`
- `readDeviceAllData(): Promise<boolean>`
- `readSleepData(date?: string): Promise<SleepData[]>`
- `readSportStepData(date?: string): Promise<SportStepData>`
- `readOriginData(dayOffset?: number): Promise<OriginData[]>`
- `readDaySummaryData(dayOffset?: number): Promise<DaySummaryData>`
- `readAutoMeasureSetting(): Promise<AutoMeasureSetting[]>`
- `modifyAutoMeasureSetting(setting: Partial<AutoMeasureSetting>): Promise<AutoMeasureSetting[]>`

Historical read progress:

```ts
VeepooSDK.on('readOriginProgress', ({ progress }) => {
  console.log(progress.progress); // 0..100, integer
});
```

### Health tests

- `startHeartRateTest(): Promise<void>` / `stopHeartRateTest(): Promise<void>`
- `startBloodPressureTest(): Promise<void>` / `stopBloodPressureTest(): Promise<void>`
- `startBloodOxygenTest(): Promise<void>` / `stopBloodOxygenTest(): Promise<void>`
- `startTemperatureTest(): Promise<void>` / `stopTemperatureTest(): Promise<void>`
- `startStressTest(): Promise<void>` / `stopStressTest(): Promise<void>`
- `startBloodGlucoseTest(): Promise<void>` / `stopBloodGlucoseTest(): Promise<void>`
- `startHrvTest(): Promise<void>` / `stopHrvTest(): Promise<void>`
- `startEcgTest(options?: EcgTestOptions): Promise<void>` / `stopEcgTest(): Promise<void>`
- `startFatigueTest(): Promise<void>` / `stopFatigueTest(): Promise<void>`
- `startBreathingTest(): Promise<void>` / `stopBreathingTest(): Promise<void>`
- `startBodyCompositionTest(): Promise<void>` / `stopBodyCompositionTest(): Promise<void>`

### Device settings

Time and display:

- `setDeviceTime(time?: Date): Promise<boolean>`
- `readScreenLightSettings(): Promise<ScreenLightSettings>`
- `setScreenLightSettings(settings: ScreenLightSettings): Promise<void>`
- `readScreenLightDuration(): Promise<ScreenLightDuration>`
- `setScreenLightDuration(seconds: number): Promise<void>`

Alarms:

- `readAlarms(): Promise<DeviceAlarm[]>`
- `setAlarm(alarm: DeviceAlarm): Promise<OperationStatus>`
- `deleteAlarm(alarmId: number): Promise<OperationStatus>`
- `readHeartRateAlarm(): Promise<HeartRateAlarm>`
- `setHeartRateAlarm(alarm: HeartRateAlarm): Promise<OperationStatus>`

Reminders:

- `readSedentaryReminder(): Promise<SedentaryReminderSettings>`
- `setSedentaryReminder(settings: SedentaryReminderSettings): Promise<void>`
- `readWristFlipWakeSettings(): Promise<WristFlipWakeSettings>`
- `setWristFlipWakeSettings(settings: WristFlipWakeSettings): Promise<void>`
- `readWomenHealthSettings(): Promise<WomenHealthSettings>`
- `setWomenHealthSettings(settings: WomenHealthSettings): Promise<void>`

Weather:

- `readWeatherSettings(): Promise<WeatherSettings>`
- `setWeatherSettings(settings: WeatherSettings): Promise<void>`
- `pushWeatherData(data: WeatherData): Promise<void>`

Contacts and SOS:

- `readContacts(crc?: number): Promise<DeviceContact[]>`
- `addContact(contact: NewDeviceContact): Promise<void>`
- `deleteContact(contactId: number): Promise<void>`
- `setContactSosState(contactId: number, isOpen: boolean): Promise<void>`
- `readSosCallTimes(): Promise<SosCallTimesSettings>`
- `setSosCallTimes(times: number): Promise<void>`

Camera and music:

- `enterCameraMode(): Promise<void>`
- `exitCameraMode(): Promise<void>`
- `setMusicControlEnabled(enabled: boolean): Promise<void>`
- `pushMusicData(data: MusicData): Promise<void>`

Connectivity and location:

- `setDeviceGPSAndTimezone(data: GPSAndTimezoneData): Promise<void>`
- `readDeviceBTStatus(): Promise<DeviceBTStatus>`
- `setDeviceBTSwitch(open: boolean): Promise<void>`

Find device:

- `startFindDevice(): Promise<void>`
- `stopFindDevice(): Promise<void>`

Watch face:

- `readWatchFaceStyle(options?: { dialType?: WatchFaceDialType }): Promise<WatchFaceStyle>`
- `setWatchFaceStyle(settings: WatchFaceStyleSettings): Promise<void>`

Firmware:

- `startLocalFirmwareDfu(filePath: string): Promise<void>`

## Events

### Session and connectivity

- `deviceFound`
- `deviceConnected`
- `deviceDisconnected`
- `deviceConnectStatus`
- `connectionStatusChanged`
- `deviceReady`

### Bluetooth

- `bluetoothStateChanged`
- `deviceBTStateChanged`

### Band metadata

- `deviceFunction`
- `deviceVersion`
- `passwordData`
- `socialMsgData`
- `batteryData`
- `customSettingsData`

### Historical data reads

- `readOriginProgress`
- `readOriginComplete`
- `originFiveMinuteData`
- `originHalfHourData`
- `originSpo2Data`
- `sleepData`
- `accurateSleepData`
- `sportStepData`

### Realtime health tests

- `heartRateTestResult`
- `bloodPressureTestResult`
- `bloodOxygenTestResult`
- `temperatureTestResult`
- `stressData`
- `bloodGlucoseData`
- `hrvTestResult`
- `ecgTestResult`
- `fatigueTestResult`
- `breathingTestResult`
- `bodyCompositionTestResult`
- `bloodAnalysisTestResult`
- `gsrTestResult`
- `pttTestResult`
- `pttStateChanged`

### Stored vitals

- `storedTemperatureData`
- `storedBloodGlucoseData`
- `storedHrvData`
- `storedEcgData`
- `storedBodyCompositionData`

### Device settings and alerts

- `alarmData`
- `heartRateAlarmData` *(JS-local — emitted by `readHeartRateAlarm` / `setHeartRateAlarm`)*
- `findDeviceState`
- `firmwareDfuProgress`
- `contactsData`
- `sosCallTimesData`
- `deviceSosTriggered`
- `cameraShutter`
- `musicRemoteCommand`
- `healthRemindData`
- `apneaRemindData`
- `sportModeData`
- `exerciseSessionData`

### SDK

- `error`

## Usage tips

- Start every flow with `await VeepooSDK.init()`
- Verify Bluetooth and permissions before connecting
- For Session lifecycle, listen for `deviceDisconnected`, `connectionStatusChanged`, and `bluetoothStateChanged`
- If you depend on unified returns, call through `VeepooSDK`, not the raw native module
- Native frameworks on iOS exclude Expo Go

## Local development

```bash
npm run typecheck
npm test -- --runInBand
npm run build
```

## Pre-release checklist

```bash
npm run typecheck
npm test -- --runInBand
npm run build
npm pack --dry-run
```

## Reference documentation

Vendor SDK snapshots checked into this repo:

- `docs/vendor-api/veepoo-sdk-android-api.md`
- `docs/vendor-api/veepoo-sdk-ios-api.md`

## License

MIT
