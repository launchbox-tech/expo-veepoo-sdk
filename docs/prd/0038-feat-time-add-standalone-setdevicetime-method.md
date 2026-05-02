# 38 — feat(time): add standalone setDeviceTime() method

## Problem Statement

Device time is currently set once at connect-time via \`ConnectOptions.timeSetting\`. There is no way for the app to resync the Band's clock after an initial connection — for example after a timezone change, after daylight-saving transitions, or when the user has drifted the Band clock manually. The \`DeviceTimeSetting\` type already exists but is only wired through the connect flow.

## Solution

Expose a standalone \`setDeviceTime(time?: Date)\` SDK method. Called with no argument it syncs the current phone time (the common case); called with a \`Date\` it sets the specified moment. Both platforms have a direct native API for this.

## User Stories

1. As a host-app developer, I want to call \`sdk.setDeviceTime()\` with no arguments to sync the Band clock to the current phone time, so that the Band always shows the correct local time after reconnection or timezone changes.
2. As a host-app developer, I want to call \`sdk.setDeviceTime(myDate)\` with a specific \`Date\` object to set a custom time on the Band, so that I can support time-adjustment workflows in the UI.
3. As a host-app developer, I want \`setDeviceTime\` to resolve \`true\` on success and \`false\` on failure, so that I can surface a retry option without subscribing to a separate event.
4. As a host-app developer, I want \`setDeviceTime\` to throw a \`VeepooError\` with code \`INVALID_ARGUMENT\` if the provided \`Date\` is not a valid \`Date\` object, so that invalid inputs fail fast before reaching the bridge.
5. As an SDK maintainer, I want \`setDeviceTime\` added to \`VeepooSDKModuleInterface\`, so that the contract is enforced at compile time across the real implementation and any test mocks.
6. As an SDK maintainer, I want the time validator in \`validators/device-settings.ts\`, so that it is co-located with the other device-setting validators.
7. As an SDK maintainer, I want no new event emitted by this method — just a resolved boolean — so that callers do not need to set up a listener for a one-shot fire-and-forget operation.
8. As an SDK maintainer, I want the Android native implementation to call the device time-setting method directly (not via confirmDevicePwd/connect), so that it is usable independently of the connect flow.
9. As an SDK maintainer, I want the iOS implementation to call \`veepooSDKSettingTimeWithResult:\` (phone-time sync) when no \`Date\` argument is given, and \`veepooSDKSettingTimeWithYear:month:day:hour:minute:second:timeSystem:result:\` when a specific \`Date\` is given, so that the correct native path is used for each case.

## Implementation Decisions

### Method signature

\`setDeviceTime(time?: Date): Promise<boolean>\`

When \`time\` is omitted or \`undefined\`, the native layer uses the phone's current system time (iOS calls \`veepooSDKSettingTimeWithResult:\`; Android reads \`System.currentTimeMillis()\`). When a \`Date\` is provided, year/month/day/hour/minute/second are extracted and sent.

### Time system / format

The \`DeviceTimeSetting\` type already has a \`system\` field (0 = 24-hour, 1 = 12-hour). \`setDeviceTime\` does not accept a format override — the 24-hour/12-hour display setting is a separate concern (language/display settings). The native layer sends \`system: 0\` unless the host app has stored a preferred format.

### No new types or events

\`DeviceTimeSetting\` (already in \`src/types/connection.ts\`) covers the time fields. The return type is a plain \`boolean\`. No event is emitted.

### Validator

\`validateDeviceTime(time?: Date): void\` in \`validators/device-settings.ts\`: throws \`INVALID_ARGUMENT\` only if \`time\` is provided but is not a valid \`Date\` instance (i.e. \`isNaN(time.getTime())\`). Undefined is always accepted.

## Testing Decisions

Good tests call through the public SDK interface and assert on the resolved value or thrown error — they do not inspect which native method was called.

**Modules with tests:**
- **Validators** — \`src/__tests__/validators/device-settings.test.ts\`: verify that \`validateDeviceTime(undefined)\` passes, \`validateDeviceTime(new Date())\` passes, \`validateDeviceTime(new Date('invalid'))\` throws \`VeepooError\` with code \`INVALID_ARGUMENT\`, and passing a non-Date value (string, number) also throws. Prior art: existing validator tests in the same file.

No normalizer tests needed — \`setDeviceTime\` returns a plain boolean with no normalization required.

## Out of Scope

- Changing the 12-hour/24-hour display format — that is a separate device-settings concern.
- Replacing the \`timeSetting\` field in \`ConnectOptions\` — the connect-time path remains unchanged.
- Automatic re-sync on reconnect — the host app owns reconnection logic per the SDK decisions in \`CLAUDE.md\`.

## Further Notes

The most common call pattern will be \`await sdk.setDeviceTime()\` with no arguments, called from the \`deviceReady\` handler. The PRD for the initial-setup flow (docs/prd/0001-initial-setup.md) may be updated to recommend this instead of relying solely on \`ConnectOptions.timeSetting\`.
