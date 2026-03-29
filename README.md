# @gaozh1024/expo-veepoo-sdk

[![npm version](https://badge.fury.io/js/@gaozh1024%2Fexpo-veepoo-sdk.svg)](https://badge.fury.io/js/@gaozh1024%2Fexpo-veepoo-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)](https://github.com/gaozh1024/expo-veepoo-sdk)

Expo 模块，用于 Veepoo 设备的蓝牙连接、数据读取和健康测试。

升级说明见 [docs/release-notes/1.1.0.md](/Users/gzh/Projects/framework/expo-veepoo-sdk/docs/release-notes/1.1.0.md) 和 [docs/release-notes/1.2.0.md](/Users/gzh/Projects/framework/expo-veepoo-sdk/docs/release-notes/1.2.0.md)。

这个包的原则是：

- Android 和 iOS 原生层尽量贴近各自 SDK 文档
- 对 App 暴露时，统一在 TypeScript 层做返回值归一化
- App 侧通过 `VeepooSDK` 使用时，拿到的是统一后的返回结构

## 平台要求

| 平台 | 最低版本 | Expo Go 支持 | 备注 |
| --- | --- | --- | --- |
| iOS | 15.1+ | 不支持 | 需要开发构建，Simulator 可编译但不支持真实蓝牙能力 |
| Android | 6.0+ (API 23+) | 不支持 | 需要开发构建 |

## 安装

```bash
npm install @gaozh1024/expo-veepoo-sdk
```

或

```bash
yarn add @gaozh1024/expo-veepoo-sdk
```

## Expo 配置

### iOS

在 `app.json` 或 `app.config.js` 中添加插件配置：

```json
{
  "expo": {
    "plugins": [
      [
        "@gaozh1024/expo-veepoo-sdk",
        {
          "bluetoothAlwaysPermission": "需要蓝牙权限来连接设备",
          "bluetoothPeripheralPermission": "需要蓝牙权限来扫描设备"
        }
      ]
    ]
  }
}
```

然后重新预构建：

```bash
npx expo prebuild --clean
cd ios && pod install && cd ..
npx expo run:ios
```

iOS 说明：

- 真机支持完整蓝牙能力
- Simulator 现在支持编译和启动开发构建
- 但由于上游厂商二进制仅提供 device slice，Simulator 下走的是框架内置 stub/no-op 路径，不能用于真实蓝牙联调

### Android

Android 权限会自动注入。首次接入后也需要重新构建：

```bash
npx expo prebuild --clean
npx expo run:android
```

## 快速开始

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

连接设备：

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

读取数据：

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

## 统一返回说明

App 侧请使用：

```ts
import VeepooSDK from '@gaozh1024/expo-veepoo-sdk';
```

不要直接依赖 `NativeVeepooSDK`。`VeepooSDK` 会在 TS 层统一这些返回：

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

也会统一这些事件 payload：

- `bluetoothStateChanged`
- `readOriginProgress`
- `deviceFunction`
- `deviceVersion`
- `passwordData`
- `socialMsgData`
- `originFiveMinuteData`
- `originHalfHourData`
- `sleepData`
- `sportStepData`
- `heartRateTestResult`
- `bloodPressureTestResult`
- `bloodOxygenTestResult`
- `temperatureTestResult`
- `stressData`
- `bloodGlucoseData`
- `batteryData`

## 日志

框架内置了一层轻量日志，默认关闭。开启后会把关键链路输出为统一结构，适合排查扫描、连接、读数据和测试流程问题。

```ts
import VeepooSDK, { type LogEntry } from '@gaozh1024/expo-veepoo-sdk';

VeepooSDK
  .setLogEnabled(true)
  .setLogger((entry: LogEntry) => {
    console.log('[veepoo-log]', entry.level, entry.scope, entry.action, entry);
  });
```

可用方法：

- `setLogEnabled(enabled: boolean): VeepooSDK`
- `isLogEnabled(): boolean`
- `setLogger(logger: ((entry: LogEntry) => void) | null): VeepooSDK`

日志字段：

- `timestamp`
- `level`
- `scope`
- `action`
- `platform`
- `message`
- `deviceId`
- `data`
- `error`

## 蓝牙与连接监听

系统蓝牙状态：

```ts
VeepooSDK.on('bluetoothStateChanged', (payload) => {
  console.log(payload.state, payload.authorization);
});
```

设备断开与连接状态变化：

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

建议同时监听这三类事件，以覆盖设备断开和系统蓝牙关闭。

## 常用 API

### 初始化

- `init(): Promise<void>`
- `isSDKInitialized(): boolean`
- `checkBluetoothStatus(): Promise<boolean>`
- `requestPermissions(): Promise<PermissionsResult>`
- `setLogEnabled(enabled: boolean): VeepooSDK`
- `isLogEnabled(): boolean`
- `setLogger(logger: ((entry: LogEntry) => void) | null): VeepooSDK`

### 扫描与连接

- `startScan(options?: ScanOptions): Promise<void>`
- `stopScan(): Promise<void>`
- `connect(deviceId: string, options?: ConnectOptions): Promise<void>`
- `disconnect(deviceId?: string): Promise<void>`
- `getConnectionStatus(deviceId?: string): Promise<ConnectionStatus>`
- `getConnectedDeviceId(): string | null`
- `isScanningActive(): boolean`

### 设备信息

- `verifyPassword(password?: string, is24Hour?: boolean): Promise<PasswordData>`
- `readBattery(): Promise<BatteryInfo>`
- `readDeviceFunctions(): Promise<DeviceFunctions>`
- `readSocialMsgData(): Promise<SocialMsgData>`
- `readDeviceVersion(): Promise<DeviceVersion>`
- `syncPersonalInfo(info: PersonalInfo): Promise<boolean>`
- `setLanguage(language: Language): Promise<boolean>`

### 数据读取

- `startReadOriginData(): Promise<void>`
- `readDeviceAllData(): Promise<boolean>`
- `readSleepData(date?: string): Promise<SleepData[]>`
- `readSportStepData(date?: string): Promise<SportStepData>`
- `readOriginData(dayOffset?: number): Promise<OriginData[]>`
- `readDaySummaryData(dayOffset?: number): Promise<DaySummaryData>`
- `readAutoMeasureSetting(): Promise<AutoMeasureSetting[]>`
- `modifyAutoMeasureSetting(setting: Partial<AutoMeasureSetting>): Promise<AutoMeasureSetting[]>`

### 健康测试

- `startHeartRateTest(): Promise<void>`
- `stopHeartRateTest(): Promise<void>`
- `startBloodPressureTest(): Promise<void>`
- `stopBloodPressureTest(): Promise<void>`
- `startBloodOxygenTest(): Promise<void>`
- `stopBloodOxygenTest(): Promise<void>`
- `startTemperatureTest(): Promise<void>`
- `stopTemperatureTest(): Promise<void>`
- `startStressTest(): Promise<void>`
- `stopStressTest(): Promise<void>`
- `startBloodGlucoseTest(): Promise<void>`
- `stopBloodGlucoseTest(): Promise<void>`

## 事件列表

- `deviceFound`
- `deviceConnected`
- `deviceDisconnected`
- `deviceConnectStatus`
- `connectionStatusChanged`
- `deviceReady`
- `bluetoothStateChanged`
- `deviceFunction`
- `deviceVersion`
- `passwordData`
- `socialMsgData`
- `batteryData`
- `readOriginProgress`
- `readOriginComplete`
- `originFiveMinuteData`
- `originHalfHourData`
- `sleepData`
- `sportStepData`
- `heartRateTestResult`
- `bloodPressureTestResult`
- `bloodOxygenTestResult`
- `temperatureTestResult`
- `stressData`
- `bloodGlucoseData`
- `error`

## 使用建议

- 所有调用都从 `await VeepooSDK.init()` 开始
- 在连接前先检查蓝牙和权限
- 连接相关请同时监听 `deviceDisconnected`、`connectionStatusChanged`、`bluetoothStateChanged`
- 如果业务依赖统一返回，只通过 `VeepooSDK` 调用，不直接使用 native module
- iOS 端包含原生 frameworks，不能在 Expo Go 中运行

## 本地开发

```bash
npm run typecheck
npm test -- --runInBand
npm run build
```

## 发布前检查

建议发布前执行：

```bash
npm run typecheck
npm test -- --runInBand
npm run build
npm pack --dry-run
```

如果要正式发布：

```bash
npm publish
```

## 参考文档

Vendor SDK 文档保存在仓库内：

- `docs/VeepooSDK Android Api.md`
- `docs/VeepooSDK iOS Api.md`

## 许可证

MIT
