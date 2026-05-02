# 40 — feat(heart-rate-alarm): read and write heart rate warning thresholds

## Problem Statement

The Band can alert the user when their heart rate exceeds an upper threshold or falls below a lower threshold during continuous monitoring. The \`heartRateWarning\` flag in \`DeviceFunctionPackage1\` indicates device support, but the SDK exposes no methods to read or configure these thresholds. Users cannot enable, disable, or adjust the heart rate alarm window from the app.

## Solution

Add \`readHeartRateAlarm(): Promise<HeartRateAlarm>\` and \`setHeartRateAlarm(alarm: HeartRateAlarm): Promise<OperationStatus>\`. Both platforms provide native read/write APIs. Input is validated synchronously before any BLE traffic.

## User Stories

1. As a host-app developer, I want to call \`sdk.readHeartRateAlarm()\` and receive a \`HeartRateAlarm\` object with the current thresholds and enabled state, so that I can display the user's current heart rate alarm configuration.
2. As a host-app developer, I want to call \`sdk.setHeartRateAlarm({ enabled: true, highThreshold: 120, lowThreshold: 50 })\` to configure the Band's heart rate warning window, so that users can customize their safe heart rate range.
3. As a host-app developer, I want to call \`sdk.setHeartRateAlarm({ enabled: false, highThreshold: 120, lowThreshold: 50 })\` to disable the heart rate alarm without losing the threshold values, so that users can toggle the alarm on/off without re-entering numbers.
4. As a host-app developer, I want \`setHeartRateAlarm\` to resolve with \`'success'\` or \`'fail'\`, so that I can provide feedback without subscribing to a separate event.
5. As a host-app developer, I want \`setHeartRateAlarm\` to throw a \`VeepooError\` with code \`INVALID_ARGUMENT\` if \`highThreshold\` is not greater than \`lowThreshold\`, so that an invalid window is rejected before reaching the bridge.
6. As a host-app developer, I want \`setHeartRateAlarm\` to throw a \`VeepooError\` with code \`INVALID_ARGUMENT\` if either threshold is outside the range 1–300 bpm, so that physiologically nonsensical values are rejected.
7. As a host-app developer, I want \`HeartRateAlarm\` exported from \`expo-veepoo-sdk\`, so that typed alarm objects can be passed through the host app without re-declaring the type.
8. As a host-app developer, I want to subscribe to the \`heartRateAlarmData\` event to receive the alarm configuration after a read or set completes, so that the UI updates reactively without awaiting the method promise.
9. As an SDK maintainer, I want a \`HeartRateAlarm\` type defined in \`src/types/device.ts\` with \`enabled\`, \`highThreshold\`, and \`lowThreshold\` fields, so that the type lives with the other device-capability types.
10. As an SDK maintainer, I want a \`normalizeHeartRateAlarm\` function in \`normalizers/device.ts\`, so that platform differences in the alarm response shape are absorbed before the data reaches the JS layer.
11. As an SDK maintainer, I want \`'heartRateAlarmData'\` added to the \`VeepooEvent\` union and \`VeepooEventPayload\` map, so that the event flows through the standard \`setupEventListeners\` and \`normalizeEventPayload\` paths.
12. As an SDK maintainer, I want \`validateHeartRateAlarm\` in \`validators/device-settings.ts\`, so that validation is co-located with the other device-setting validators.
13. As an SDK maintainer, I want \`readHeartRateAlarm\` and \`setHeartRateAlarm\` added to \`VeepooSDKModuleInterface\`, so that the contract is enforced at compile time.

## Implementation Decisions

### New type

\`HeartRateAlarm\` in \`src/types/device.ts\`:

\`\`\`
enabled: boolean
highThreshold: number   // bpm, must be > lowThreshold
lowThreshold: number    // bpm, must be < highThreshold
\`\`\`

### Method signatures

- \`readHeartRateAlarm(): Promise<HeartRateAlarm>\` — triggers native read; resolves with the normalised alarm; the same data is also emitted via \`heartRateAlarmData\`.
- \`setHeartRateAlarm(alarm: HeartRateAlarm): Promise<OperationStatus>\` — validates, sends to native, resolves with \`'success'\` or \`'fail'\`.

### Native mapping

Android \`HeartWaringSetting\` has \`heartHigh\`, \`heartLow\`, \`isOpen\`. iOS \`VPDeviceHeartAlarmModel\` has \`isOpen\` and corresponding high/low fields. The \`settingMode\` on iOS is 0 = close, 1 = open, 2 = read; \`setHeartRateAlarm\` derives this from \`alarm.enabled\`.

### Validator

\`validateHeartRateAlarm(alarm: HeartRateAlarm): void\` in \`validators/device-settings.ts\`:
- \`highThreshold\` must be an integer in 1–300
- \`lowThreshold\` must be an integer in 1–300
- \`highThreshold\` must be strictly greater than \`lowThreshold\`

### Normalizer

\`normalizeHeartRateAlarm(value: unknown): HeartRateAlarm\` in \`normalizers/device.ts\`. \`normalizeEventPayload\` gains a \`'heartRateAlarmData'\` case.

### Event payload

\`heartRateAlarmData: { deviceId: string; data: HeartRateAlarm }\`

## Testing Decisions

Good tests assert the observable shape of the returned \`HeartRateAlarm\` or the thrown \`VeepooError\` — they do not assert on native method call counts.

**Modules with tests:**
- **Validators** — \`src/__tests__/validators/device-settings.test.ts\`: cover all boundary cases — threshold of 0, threshold of 301, lowThreshold equal to highThreshold, lowThreshold greater than highThreshold, valid alarm passes through. Prior art: existing device-settings validator tests.
- **Normalizers** — new \`'heartRateAlarmData'\` case in the normalizers test file for \`normalizeEventPayload\`: verify \`enabled\` boolean coercion, \`highThreshold\`/\`lowThreshold\` integer coercion, missing fields default to 0/false. Prior art: existing \`normalizeEventPayload\` cases for \`batteryData\` and \`stressData\`.

## Out of Scope

- Real-time heart rate alerts emitted while a measurement is in progress — that is part of the heart rate test event stream, not the alarm configuration.
- Configuring the alert notification behaviour on the phone side — the Band fires alerts autonomously; the app only controls the thresholds.
- Per-user heart rate zone configuration beyond a single high/low pair.

## Further Notes

The \`heartRateWarning\` flag in \`DeviceFunctionPackage1\` must be checked before calling either method; the SDK does not gate on this flag internally, but the example app demo should show the flag check before rendering the threshold UI.
