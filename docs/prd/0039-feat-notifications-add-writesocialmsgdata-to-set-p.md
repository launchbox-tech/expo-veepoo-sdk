# 39 — feat(notifications): add writeSocialMsgData() to set per-channel notification switches

## Problem Statement

The SDK can read the Band's per-channel notification switches via \`readSocialMsgData()\`, but there is no corresponding write method. Users cannot toggle individual channels (calls, SMS, WhatsApp, etc.) from the app — they must configure notification preferences on the Band itself. The \`SocialMsgData\` type and \`FunctionStatus\` vocabulary already exist; only the write path is missing.

## Solution

Add \`writeSocialMsgData(data: Partial<SocialMsgData>): Promise<OperationStatus>\`. Only the channels included in the partial object are sent to the Band; unspecified channels are left unchanged. The method validates that at least one channel is provided and that every provided value is a valid \`FunctionStatus\`.

## User Stories

1. As a host-app developer, I want to call \`sdk.writeSocialMsgData({ whatsapp: 'open', instagram: 'close' })\` to toggle specific notification channels without affecting the rest, so that the user can manage individual apps without resetting their full notification profile.
2. As a host-app developer, I want \`writeSocialMsgData\` to resolve with \`'success'\` or \`'fail'\`, so that I can surface a retry option without subscribing to a separate event.
3. As a host-app developer, I want \`writeSocialMsgData\` to throw a \`VeepooError\` with code \`INVALID_ARGUMENT\` if the input object is empty (no channels specified), so that accidental no-op calls are caught before reaching the bridge.
4. As a host-app developer, I want \`writeSocialMsgData\` to throw a \`VeepooError\` with code \`INVALID_ARGUMENT\` if any channel value is not a valid \`FunctionStatus\`, so that only legal values reach the native layer.
5. As a host-app developer, I want to use \`FunctionStatus\` values (\`'open'\`, \`'close'\`) to enable or disable a channel, so that the write API uses the same vocabulary as the read API.
6. As an SDK maintainer, I want \`writeSocialMsgData\` added to \`VeepooSDKModuleInterface\`, so that the contract is enforced at compile time.
7. As an SDK maintainer, I want the write validator in \`validators/device-settings.ts\`, so that it is co-located with the other device-setting validators.
8. As an SDK maintainer, I want the Android implementation to call \`VPOperateManager.settingSocialMsg\` with a \`FunctionSocailMsgData\` built from the partial input merged over the last-read state, so that channels not mentioned in the partial retain their current values.
9. As an SDK maintainer, I want the iOS implementation to use \`veepooSDKBatchSettingWithMessageTypeModels:\` with only the channels present in the partial, so that the native batch API handles the per-channel BLE traffic.
10. As an SDK maintainer, I want no new event type — \`writeSocialMsgData\` resolves the result inline — so that the write path is symmetric with \`setLanguage\` and similar fire-and-resolve methods.
11. As an SDK maintainer, I want the method to work with the existing 13-channel \`SocialMsgData\` type without requiring the type to be expanded to match the full 24-channel native surface, so that scope stays bounded to the channels the host app currently needs.

## Implementation Decisions

### Method signature

\`writeSocialMsgData(data: Partial<SocialMsgData>): Promise<OperationStatus>\`

The partial is applied on top of whatever state the native layer last cached. Channels not in \`data\` are unchanged. The Android layer reads its cached \`FunctionSocailMsgData\` and updates the relevant fields; iOS uses the batch API sending only the channels in \`data\`.

### No new types

\`SocialMsgData\` (13 channels) and \`OperationStatus\` (\`'success' | 'fail' | 'unknown'\`) are already defined. No new types are added in this issue.

### Validator

\`validateSocialMsgData(data: Partial<SocialMsgData>): void\` in \`validators/device-settings.ts\`. Throws \`INVALID_ARGUMENT\` if \`data\` is empty (zero keys) or if any value is not one of the valid \`FunctionStatus\` literals (\`'unsupported' | 'support' | 'open' | 'close' | 'unknown'\`).

### No normalizer needed

The return value is \`OperationStatus\` derived from the native callback's success/failure flag. No complex normalization required; the native module method returns a plain boolean or status string.

## Testing Decisions

Good tests assert on what the caller observes — the resolved \`OperationStatus\` or the thrown \`VeepooError\` — not on which internal native method was invoked.

**Modules with tests:**
- **Validators** — \`src/__tests__/validators/device-settings.test.ts\`: verify that an empty object throws \`INVALID_ARGUMENT\`, a valid partial passes, an invalid \`FunctionStatus\` value throws, and all 13 channel keys accept valid values. Prior art: existing validator tests in the same directory.

No normalizer or event tests required for this issue.

## Out of Scope

- Reading notification settings — already covered by \`readSocialMsgData()\`.
- Expanding \`SocialMsgData\` to include the additional channels present in the native API (TikTok, Telegram, KakaoTalk, etc.) — that is a separate type-expansion issue.
- Push notification delivery (OS-level) — the Band handles notification display autonomously once switches are configured.

## Further Notes

The read-then-write pattern is important: \`readSocialMsgData()\` should be called first to populate the Band's current state before calling \`writeSocialMsgData\` with a partial update, so that unchanged channels are not accidentally reset. The SDK does not enforce this order, but the example app demo should illustrate the pattern.
