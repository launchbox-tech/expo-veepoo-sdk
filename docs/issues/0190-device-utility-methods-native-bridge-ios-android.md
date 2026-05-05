# 0190 — feat: device utility methods — native bridge (iOS + Android)

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/190
> Labels: enhancement, needs-triage, ready-for-human
> Status: OPEN

## Parent

#180

## What to build

Wire `renameDevice`, `isConnectionConfirmEnabled`, `setConnectionConfirmEnabled`, and `setConnectionConfirmTimeout` on both platforms. `renameDevice` was added in Android vendor SDK v1.2.6 — confirm iOS equivalent before implementing. Connection-confirm methods were added in vendor SDK v1.2.3.

## Acceptance criteria

- [ ] Android: `renameDevice` wired via `changeBleDeviceName` (v1.2.6+); connection-confirm read/set/timeout wired (v1.2.3+)
- [ ] iOS: `renameDevice` equivalent confirmed and wired (or stubbed with `CAPABILITY_UNSUPPORTED` if not present); connection-confirm APIs wired
- [ ] Both platforms return `OperationStatus` for write methods; read returns `boolean`
- [ ] Manually verified on physical Band: rename device, confirm new name appears in BLE scan results

## Blocked by

#186
