# 37 — feat(alarms): read, set, and delete Band alarms

## Problem Statement

The Band supports up to 20 alarms with per-alarm scene icons, repeat schedules, and optional text content. There is currently no way for the app to read, add, modify, or delete alarms — the \`DeviceAlarm\` type already exists but no SDK methods wire it to native. Users who configure alarms on the Band cannot sync them to the app, and the app cannot push alarm changes to the Band.

## Solution

Expose three SDK methods — \`readAlarms\`, \`setAlarm\`, \`deleteAlarm\` — backed by the Alarm2/TextAlarm native APIs on both platforms. A single \`alarmData\` event reports the current alarm list after each operation. Input is validated synchronously before touching the bridge.

## User Stories

1. As a host-app developer, I want to call \`sdk.readAlarms()\` and receive the current list of \`DeviceAlarm\` objects, so that I can display the Band's configured alarms to the user.
2. As a host-app developer, I want to call \`sdk.setAlarm(alarm)\` to add a new alarm or update an existing one by ID, so that users can schedule alarms from the app.
3. As a host-app developer, I want to call \`sdk.deleteAlarm(alarmId)\` to remove an alarm by its ID, so that users can clear alarms they no longer need.
4. As a host-app developer, I want \`setAlarm\` to accept an optional \`scene\` field (0–20 icon index), so that alarms can display a contextual icon on the Band face.
5. As a host-app developer, I want \`setAlarm\` to accept an optional \`text\` field (≤60 bytes) for text-alarm content, so that reminder messages appear on the Band display.
6. As a host-app developer, I want the \`repeat\` field to be an array of ISO weekday numbers (1 = Monday … 7 = Sunday) with an empty array meaning one-shot, so that the API is consistent with how the host app models calendars.
7. As a host-app developer, I want to subscribe to the \`alarmData\` event to receive the updated alarm list immediately after a read, set, or delete completes, so that my UI stays in sync without polling.
8. As a host-app developer, I want \`setAlarm\` to throw a \`VeepooError\` with code \`INVALID_ARGUMENT\` if \`hour\` is outside 0–23, \`minute\` outside 0–59, \`id\` outside 1–20, \`scene\` outside 0–20, or \`text\` exceeds 60 bytes, so that bad values never reach the bridge.
9. As a host-app developer, I want \`deleteAlarm\` to throw a \`VeepooError\` with code \`INVALID_ARGUMENT\` if \`alarmId\` is not in range 1–20, so that stale IDs fail fast.
10. As an SDK maintainer, I want the alarm validator to live in \`validators/device-settings.ts\` (already scaffolded), so that adding alarm validation is a full implementation of the stub, not a new file.
11. As an SDK maintainer, I want a \`normalizeAlarmList\` function in \`normalizers/device.ts\`, so that the alarm list from both Android and iOS is coerced into \`DeviceAlarm[]\` regardless of platform wire format differences.
12. As an SDK maintainer, I want the \`alarmData\` event wired in \`setupEventListeners\` and normalised via \`normalizeEventPayload\`, so that the alarm list flows through the same path as all other events.
13. As an SDK maintainer, I want \`DeviceAlarm\` updated to include an optional \`scene?: number\` field, so that the scene icon from Android Alarm2Setting and iOS VPDeviceNewAlarmModel is representable.
14. As an SDK maintainer, I want \`readAlarms\`, \`setAlarm\`, and \`deleteAlarm\` added to \`VeepooSDKModuleInterface\`, so that the contract is enforced at compile time.
15. As a host-app developer, I want \`DeviceAlarm\` exported from \`expo-veepoo-sdk\`, so that typed alarm objects can be passed through the host app without re-declaring the type.

## Implementation Decisions

### Alarm type unification

Both Android (Alarm2/TextAlarm2Setting) and iOS (VPDeviceNewAlarmModel/VPDeviceTextAlarmModel) support scene alarms with optional text. The native layer should prefer these richer APIs. Simple \`AlarmSetting\` (read/settingAlarm) is the legacy path for devices that do not support Alarm2; the native layer decides which to use based on device capability.

### Repeat encoding

The native repeat format is a 7-bit binary string (e.g. \`"0000011"\` = Monday+Tuesday). The SDK normalizer converts this to/from an array of ISO weekday numbers (1–7). An empty array (\`[]\`) maps to \`"0000000"\` (one-shot).

### Scene field

Add \`scene?: number\` to the existing \`DeviceAlarm\` interface in \`src/types/device.ts\`. Valid range 0–20 matching the native enum.

### JS methods

- \`readAlarms(): Promise<DeviceAlarm[]>\` — triggers native read; result arrives via \`alarmData\` event and is also resolved from the promise.
- \`setAlarm(alarm: DeviceAlarm): Promise<OperationStatus>\` — validates then calls native add-or-modify; resolves with \`'success'\` or \`'fail'\`.
- \`deleteAlarm(alarmId: number): Promise<OperationStatus>\` — validates then calls native delete.

### Validator

\`validateAlarm\` (already stubbed in \`validators/device-settings.ts\`) is fully implemented: id 1–20, hour 0–23, minute 0–59, each repeat element 1–7, scene 0–20 if present, text byte-length ≤60 if present.

### Normalizer

\`normalizeAlarmList(value: unknown): DeviceAlarm[]\` added to \`normalizers/device.ts\`. \`normalizeEventPayload\` gains an \`'alarmData'\` case.

## Testing Decisions

Good tests assert observable external behaviour through the module's declared interface — they do not inspect how many times an internal helper was called.

**Modules with tests:**
- **Validators** — \`src/__tests__/validators/device-settings.test.ts\`: call \`validateAlarm\` with every boundary value for each field (id=0, id=21, hour=-1, hour=24, minute=60, scene=21, text of exactly 60 bytes, text of 61 bytes, empty repeat array, repeat containing 0 or 8). Prior art: \`src/__tests__/validators/connection.test.ts\`.
- **Normalizers** — new cases added to the normalizers test file for \`'alarmData'\` in \`normalizeEventPayload\`: verify repeat binary string → weekday array conversion, scene passthrough, text passthrough, missing fields default to safe values.

## Out of Scope

- Simple legacy alarm API (readAlarm/settingAlarm) — not needed; Alarm2 covers all devices that support the \`alarm\` flag.
- In-app alarm scheduling UX beyond a minimal example card.
- Alarm push notification integration (OS-level scheduling) — the Band fires alarms autonomously.

## Further Notes

The \`alarm\` flag in \`DeviceFunctionPackage1\` indicates basic alarm support; \`textAlarm\` flag indicates text-alarm support. The native implementation should gate text content on the \`textAlarm\` flag. The JS layer does not need to know this distinction — it passes \`text\` if provided and the native layer decides whether to use it.
