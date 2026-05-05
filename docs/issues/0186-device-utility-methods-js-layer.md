# 0186 — feat: device utility methods — JS layer

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/186
> Labels: enhancement, needs-triage
> Status: OPEN

## Parent

#180

## What to build

Extend `SessionCapability` with four small utility methods: BLE device rename, and three connection-confirmation popup controls added in vendor SDK v1.2.3. No native bridge code in this slice.

## Acceptance criteria

- [ ] `renameDevice(name: string): Promise<OperationStatus>` added to `SessionCapability`; validates name is non-empty string, max 20 characters
- [ ] `isConnectionConfirmEnabled(): Promise<boolean>` added to `SessionCapability`
- [ ] `setConnectionConfirmEnabled(enabled: boolean): Promise<OperationStatus>` added to `SessionCapability`
- [ ] `setConnectionConfirmTimeout(seconds: number): Promise<OperationStatus>` added to `SessionCapability`; validates seconds is positive integer (e.g. 5–120)
- [ ] All four native method names added to `async-native-method-registry.ts`
- [ ] All four methods wired into `VeepooSDK` facade and `VeepooSDKModuleInterface`
- [ ] Unit tests: each method delegates to native with correct arguments; validators reject out-of-range inputs before native is called

## Blocked by

None — can start immediately
