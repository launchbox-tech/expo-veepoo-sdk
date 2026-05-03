# 0120 — feat: device SOS triggered event

> GitHub: https://github.com/launchbox-tech/expo-veepoo-sdk/issues/120
> Labels: needs-triage
> Status: open

## Parent

#118

## What to build

Emit a `deviceSosTriggered` event whenever the user presses the SOS button on the Band. No new JS methods needed — this is a pure event bridge.

End-to-end: add `deviceSosTriggered` to `VeepooEvent` union + `VeepooEventPayload` map + Android (SOS command callback) + iOS (`ReceiveDeviceSOSCommand` callback on `VPPeripheralBaseManage`) + parity matrix row.

## Acceptance criteria

- [ ] `deviceSosTriggered` event added to `VeepooEvent` union
- [ ] Payload type: `{ deviceId: string }`
- [ ] iOS: `ReceiveDeviceSOSCommand` callback wired to emit `deviceSosTriggered`
- [ ] Android: SOS command callback wired to emit `deviceSosTriggered`
- [ ] Event added to bridge-contract event registry (`verify-veepoo-events.ts`)
- [ ] Parity matrix row added under "Device information & settings" (contacts & SOS section)

## Blocked by

None — can start immediately
