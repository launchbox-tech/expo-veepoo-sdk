# Pre-Feature Refactor Checklist

> **Vendor / API inventory:** [`vendor-parity-matrix.md`](vendor-api/vendor-parity-matrix.md) is the canonical map from vendor wiki capability areas to `VeepooSDK` methods and events. Update it when you ship features. Upstream drift: [`vendor-manifest.json`](../vendor-manifest.json) · `npm run vendor:check`.

> **Last synced with repo:** 2026-05-03. Start at §0 and work top to bottom. Answer §8 grilling questions (still open where marked) before expanding feature scope.

---

## §0. Triage
- [x] Close GitHub issue #32 — all sub-issues (#33, #34, #35, #36) shipped
- [x] Clear **`needs-triage`** from closed GitHub issues and local **`docs/issues/`** / **`docs/prd/`** mirrors (queue label only — remove after triage).

---

## §1. `expo-module.config.json` audit
- [x] **`"ios"` → `"apple"`** — config uses **`apple`** and **`platforms`: `["apple", "android"]`**. Confirm autolinking after changes via `example/` **`expo prebuild --clean`** or **`expo run:ios`**.
- [x] **No `"web"` platform** — correct; repo has no `*.web.ts` files.
- [x] **AAR project names** — All 10 entries in `gradleAarProjects` have explicit `aarFilePath` fields pointing to existing files in `android/libs/`. Every `.aar` is accounted for. OTA DFU AARs (`libdfu`, `libfastdfu`) confirmed present.

---

## §2. Native ↔ TypeScript event parity

Both native modules declare an `Events(...)` block. Every event in that block must exist in the TS `VeepooEvent` union, `VeepooEventPayload`, `setupEventListeners()`, and `normalizeEventPayload`.

| Event | Android | iOS | TS union | `setupEventListeners` | normalizer |
|---|---|---|---|---|---|
| `findDeviceState` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `originSpo2Data` | ✅ | ✅ | ✅ | ✅ | ✅ |

`originSpo2Data` parity is **done** — keep this row when adding **new** native events (mirror checklist for each).

---

## §3. PRD audit — `/grill-with-docs` on every doc

- [x] **`docs/prd/0001-initial-setup.md`** — `src/plugin/index.ts` verified: injects exactly 6 Android permissions (`BLUETOOTH`, `BLUETOOTH_ADMIN`, `BLUETOOTH_CONNECT`, `BLUETOOTH_SCAN`, `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`) and 3 iOS usage strings (`NSBluetoothAlwaysUsageDescription`, `NSBluetoothPeripheralUsageDescription`, `NSLocationWhenInUseUsageDescription`). Matches PRD. No drift.
- [x] **`docs/prd/0018-component-extraction.md`** — `example/src/components/` has `DeviceRow`, `InfoRow`, `HealthTestCard`, `theme.ts`, `index.ts`. **Note:** the old “`index.tsx` ≤ ~200 lines” target referred to a monolithic screen; the example now uses `example/src/app/index.tsx` (large file) plus hooks under `example/src/hooks/`. Revisit PRD wording or trim the app screen if a hard line budget matters.
- [x] **`docs/prd/0022-sdk-refactor-tdd.md`** — US7 (single bootstrap in `NativeVeepooSDK.ts`), US9 (arrow delegates on `readDeviceAllData`, `setLanguage`, `syncPersonalInfo`), and US11 (`typeof __DEV__ === 'undefined' || __DEV__` in `veepoo-sdk-runtime.ts`) are **implemented**; spot-check remaining user stories if any stragglers remain.
- [x] **`docs/prd/0029-emitlocal-ternary-cleanup.md`** — `emitLocal` uses a single `normalizeEventPayload(event, payload)` path (`src/sdk/veepoo-sdk-runtime.ts`).
- [x] **`docs/prd/0032-src-foundation-refactor.md`** — GitHub #32 is **CLOSED**. All sub-issues (#33, #34, #35, #36) shipped. Foundation refactor complete.

---

## §4. TS-layer code issues (known, no decision needed)

**`src/VeepooSDK.ts` — bootstrap duplication (PRD #22 US7)**
- [x] Remove `LINKING_ERROR` constant and the `requireNativeModule` / `Proxy` block from `VeepooSDK.ts` (owned by `NativeVeepooSDK.ts`)
- [x] Import `NativeVeepooSDK` from `./NativeVeepooSDK.js` and use as constructor default: `constructor(native: NativeVeepooSDKInterface = NativeVeepooSDK)`
- [x] One `requireNativeModule` call, one `Proxy` fallback, one `LINKING_ERROR` — all owned by `NativeVeepooSDK.ts`

**`src/VeepooSDK.ts` — arrow function class properties (PRD #22 US9)**
- [x] `readDeviceAllData` — arrow property delegating to `HealthData`
- [x] `setLanguage` — arrow property delegating to `DeviceSettings`
- [x] `syncPersonalInfo` — arrow property delegating to `DeviceSettings`

**`src/index.ts` — missing exports**
- [x] Export `Spo2OriginData`
- [x] Export `PermissionStatus`
- [x] Export `VeepooSDKModuleInterface`, `LogListener` from `VeepooSDKModule.ts`

**`src/types/health-data.ts` — incomplete type**
- [x] `BloodGlucoseData` includes `state?: TestState`

**`__DEV__` gate correctness (PRD #22 US11)**
- [x] Runtime uses `this.logEnabled && (typeof __DEV__ === 'undefined' || __DEV__)` in `veepoo-sdk-runtime.ts`
- [x] `src/__tests__/VeepooSDK.test.ts` includes production-mode (`__DEV__ = false`) logging test

---

## §5. Architecture decisions (answer before writing any feature code)

**A. Split `normalizers.ts`?**
- [x] **Done** — `src/normalizers/` is split into `connection.ts`, `device.ts`, `health-tests.ts`, `health-data.ts`, `settings.ts`, `events.ts` (`normalizeEventPayload`), `shared.ts`, `index.ts`. Add new feature normalizers in the appropriate domain file (or a new file) and wire through `events.ts` as needed.

**B. Move `VeepooSDKModuleInterface` into `src/types/`?**
- [ ] Currently `src/VeepooSDKModule.ts` — standalone file inconsistent with types-domain-split
- [ ] Candidate location: `src/types/module.ts`, re-exported from `src/types/index.ts`
- [ ] Optional cleanup; bundle when touching public API surface

**C. Do validation failures emit the `error` event?**
- [x] **Resolved** — synchronous validators throw only; `sdk.on('error', ...)` fires only on async/native paths. See **CONTEXT.md** (*Validator vs `error` event*). All future validators follow this model.

**D. Native layer organization for new features**
- [x] Android pattern: one `VeepooSDKModule<Feature>.kt` extension file per feature (established by existing modules)
- [x] iOS pattern: one `VeepooSDKModule+<Feature>.swift` extension per feature (established by existing modules)
- [x] Each new feature = 1 Kotlin + 1 Swift + 1 TS validator + new types + new normalizer(s) — see **CONTEXT.md** (*Native work scope*)

**E. Split `VeepooSDK.ts` by concern?**
- [x] **Substantially done** — `VeepooSDK.ts` is a thin façade (~274 lines) delegating to `src/sdk/` (`VeepooSDKRuntime`, `SdkLifecycle`, `BandDiscovery`, `SessionConnection`, `HealthData`, `DeviceSettings`, `RealtimeTests`). Revisit only if a single `sdk/` file grows unwieldy.

---

## §6. Feature issue template (write before any feature PRDs)

- [x] **`docs/templates/feature-issue.md`** exists — reusable vertical-slice checklist for feature PRs.

Reference layout (keep template file in sync):

```
Native (Android):   VeepooSDKModule<Feature>.kt + event constants in VeepooSDKConstants.kt
Native (iOS):       VeepooSDKModule+<Feature>.swift
Types:              src/types/<domain>.ts — new type(s)
Events:             src/types/events.ts — VeepooEvent + VeepooEventPayload updated
Validators:         src/validators/<domain>.ts
Normalizers:        src/normalizers/<domain>.ts
SDK:                src/VeepooSDK.ts — new public method(s), delegate to src/sdk/* as appropriate
Module interface:   src/VeepooSDKModule.ts — VeepooSDKModuleInterface (or src/types/module.ts if relocated)
Public API:         src/index.ts — new type(s) exported
Tests:              src/__tests__/validators/ + normalizers.test.ts
```

---

## §7. Feature backlog — PRD queue

**Inventory audit (2026-05-02):** Compared each item to `VeepooSDKModuleInterface`, `NATIVE_ASYNC_METHOD_NAMES`, and native modules. Groups A–B are **already shipped** in the JS public API unless marked partial. Groups C–D have **capability flags** on `DeviceFunctions` / `ConnectionStatus` where the vendor exposes them, but **no** matching `VeepooSDK` methods or events yet. **Stub issues (needs-triage):** Group C → [#96](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/96) [#97](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/97) [#98](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/98) [#99](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/99); Group D → [#100](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/100) [#101](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/101) [#102](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/102) [#103](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/103) [#104](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/104) [#105](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/105) [#106](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/106) [#107](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/107) [#108](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/108). Parent PRD [#95](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/95).

For new work in §7, still run `/grill-with-docs` against `docs/vendor-api/veepoo-sdk-android-api.md` + `docs/vendor-api/veepoo-sdk-ios-api.md` before writing a PRD.

### Group A — Device control
- [x] **Alarms read/write** — Shipped: `readAlarms`, `setAlarm`, `deleteAlarm`; event `alarmData`. Native: `VeepooSDKModuleAlarms` (Android), `VeepooSDKModule+Alarms` (iOS).
- [x] **Set device time** — Shipped: `setDeviceTime(time?)` (in addition to `ConnectOptions.timeSetting` on connect). `DeviceTimeSetting` type remains for connect-time sync.
- [x] **Write notification settings** — Shipped: `writeSocialMsgData` (plus `readSocialMsgData`). Older checklist text was stale.
- [x] **Heart rate alarm thresholds** — Shipped: `readHeartRateAlarm`, `setHeartRateAlarm`; event `heartRateAlarmData`.

### Group B — Real-time health measurements
- [x] **HRV test (manual / realtime)** — Shipped: `startHrvTest`, `stopHrvTest`; event `hrvTestResult`. **Partial / gap:** vendor **historical** HRV origin lists (`HRVOriginData`, RR-style data, date-keyed reads) are not surfaced to JS — Android `onOriginHRVOriginListDataChange` currently only logs; no `RRInterval` types in the bridge.
- [x] **ECG test** — Shipped: `startEcgTest(options?)`, `stopEcgTest`; event `ecgTestResult`; `EcgTestOptions.includeWaveform` when supported.
- [x] **Fatigue test** — Shipped: `startFatigueTest`, `stopFatigueTest`; event `fatigueTestResult`.
- [x] **Breathing / respiration** — Shipped: `startBreathingTest`, `stopBreathingTest`; event `breathingTestResult`.

### Group C — Device personalization (not in public API yet)
- [x] **Anti-loss / find device** — [#96](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/96) shipped: `startFindDevice`, `stopFindDevice`; `findDeviceState`. Flag: `findDeviceByPhoneFunction`.
- [x] **Screen settings** — [#97](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/97) shipped: `readScreenLightSettings`, `setScreenLightSettings`, `readScreenLightDuration`, `setScreenLightDuration`. Flags: `screenLight`, `screenLightTime`.
- [x] **Sedentary reminder** — [#98](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/98) shipped: `readSedentaryReminder`, `setSedentaryReminder`. Flag: `sedentaryRemind`. Android: `readLongSeat` / `settingLongSeat` (`LongSeatSetting`); `VpSpGetUtil.isSupportLongseat`.
- [x] **Wrist-flip wake** — [#99](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/99) shipped: `readWristFlipWakeSettings`, `setWristFlipWakeSettings`. Flags: `nightTurnSetting`, `isOpenNightTurnWrist`. Android: `readNightTurnWriste` / `settingNightTurnWriste`; `VpSpGetUtil.isSupportNightturnSetting`.

### Group D — Advanced (not in public API yet)
- [x] **OTA firmware upgrade** — [#100](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/100) shipped (local file): `startLocalFirmwareDfu`, `firmwareDfuProgress`. **Android:** JL OTA (`startJLDeviceOTAUpgrade`) only. **iOS:** `VPDFUOperation.veepooSDKStartDfuWithFilePath`. Remote server check / non-JL paths not bridged.
- [x] **Dial / face management** — [#101](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/101) shipped: `readWatchFaceStyle`, `setWatchFaceStyle` (dial category + slot index). Flags: `screenStyleFunction`, `aiDial`, `videoDial`. Custom image / server catalog transfer not bridged.
- [x] **Body composition** — [#102](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/102) shipped: `startBodyCompositionTest`, `stopBodyCompositionTest`, `bodyCompositionTestResult`. Flag: `bodyComponent`. Historical `readBodyComponentData` / iOS DB export not bridged.
- [x] **Women's health** — [#103](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/103) shipped: `readWomenHealthSettings`, `setWomenHealthSettings`. Flag: `woman` on device functions.
- [x] **Weather push** — [#104](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/104) shipped: `pushWeatherData`, `readWeatherSwitch`, `setWeatherSwitch`, `readWeatherUnit`, `setWeatherUnit`; event `weatherSettingsData`.
- [x] **Contact management with SOS** — [#105](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/105) shipped: `readContacts`, `addContact`, `deleteContact`, `setContactSosState`, `readSosCallTimes`, `setSosCallTimes`.
- [ ] **GPS / location settings** — [#106](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/106) stub. Flag: `agpsFunction`. No AGPS settings API.
- [ ] **Music / camera control** — [#107](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/107) stub. Flag: `musicStyle` (and related HID flags). No music/camera remote API.
- [ ] **Bluetooth on/off** — [#108](https://github.com/launchbox-tech/expo-veepoo-sdk/issues/108) stub. No `openBluetooth` / `closeBluetooth` in the Expo module.

---

## §8. Grilling questions — answer before starting

1. **Error event on validation failure?** **Resolved** (grill-with-docs): **throw-only** for sync validators; **`error`** event stays for async/native paths — see **`CONTEXT.md`** (*Validator vs `error` event*).
2. **`normalizers.ts` split: now or after features?** **Resolved:** split landed under `src/normalizers/`; new work extends domain files + `events.ts`.
3. **`VeepooSDK.ts` split: now or after Group A?** **Resolved:** façade + `src/sdk/*` split is in place; monitor size of individual `sdk/` modules as features land.
4. **Native layer in scope for this refactor pass?** **Resolved** (grill-with-docs): **Per-PR native** for each C/D slice; incremental consistency — see **`CONTEXT.md`** (*Native work scope*).
5. **`"ios"` → `"apple"` in config: safe to change now?** **Resolved:** **`expo-module.config.json`** uses **`apple`**; verify with **`example/`** prebuild or **`expo run:ios`** — see **`CONTEXT.md`** (*expo-module.config.json*).
6. **Example app demos for new features?** **Resolved** (grill-with-docs): minimal safe demos for new **C/D** APIs; **OTA/DFU** exempt from real flash — see **`CONTEXT.md`** (*Example app*).

---

## Quick-start — next actions

```
1.  §5-B — Optional: move VeepooSDKModuleInterface to src/types/module.ts (piggyback on next API-touch PR)
2.  §7 — Next open Group D: AGPS (#106), Music/camera (#107), Bluetooth on/off (#108)
3.  §7 — Group B partial: historical HRV origin + RR interval data not yet bridged
```
