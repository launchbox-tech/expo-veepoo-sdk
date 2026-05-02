# Pre-Feature Refactor Checklist

> **Vendor / API inventory:** [`vendor-parity-matrix.md`](vendor-api/vendor-parity-matrix.md) is the canonical map from vendor wiki capability areas to `VeepooSDK` methods and events. Update it when you ship features. Upstream drift: [`vendor-manifest.json`](../vendor-manifest.json) · `npm run vendor:check`.

> **Last synced with repo:** 2026-05-02. Start at §0 and work top to bottom. Answer §8 grilling questions (still open where marked) before expanding feature scope.

---

## §0. Triage
- [x] Close GitHub issue #32 — all sub-issues (#33, #34, #35, #36) shipped
- [x] Clear **`needs-triage`** from closed GitHub issues and local **`docs/issues/`** / **`docs/prd/`** mirrors (queue label only — remove after triage).

---

## §1. `expo-module.config.json` audit
- [ ] **`"ios"` → `"apple"`** — skill recommends `"apple"` as the platform key (covers iOS + macOS). Current config uses legacy `"ios"`. Verify with `references/module-config.md`.
- [x] **No `"web"` platform** — correct; repo has no `*.web.ts` files.
- [ ] **AAR project names** — 10 vendor AARs in `gradleAarProjects`; verify each name matches the actual `.aar` file and that no new AARs are needed for upcoming features (OTA needs `libdfu`/`libfastdfu`, already listed ✓).

---

## §2. Native ↔ TypeScript event parity

Both native modules declare an `Events(...)` block. Every event in that block must exist in the TS `VeepooEvent` union, `VeepooEventPayload`, `setupEventListeners()`, and `normalizeEventPayload`.

| Event | Android | iOS | TS union | `setupEventListeners` | normalizer |
|---|---|---|---|---|---|
| `originSpo2Data` | ✅ | ✅ | ✅ | ✅ | ✅ |

`originSpo2Data` parity is **done** — keep this row when adding **new** native events (mirror checklist for each).

---

## §3. PRD audit — `/grill-with-docs` on every doc

- [ ] **`docs/prd/0001-initial-setup.md`** — verify config plugin still injects all 6 Android + 3 iOS permissions after recent refactors; confirm `npx expo prebuild --clean` is still clean
- [x] **`docs/prd/0018-component-extraction.md`** — `example/src/components/` has `DeviceRow`, `InfoRow`, `HealthTestCard`, `theme.ts`, `index.ts`. **Note:** the old “`index.tsx` ≤ ~200 lines” target referred to a monolithic screen; the example now uses `example/src/app/index.tsx` (large file) plus hooks under `example/src/hooks/`. Revisit PRD wording or trim the app screen if a hard line budget matters.
- [x] **`docs/prd/0022-sdk-refactor-tdd.md`** — US7 (single bootstrap in `NativeVeepooSDK.ts`), US9 (arrow delegates on `readDeviceAllData`, `setLanguage`, `syncPersonalInfo`), and US11 (`typeof __DEV__ === 'undefined' || __DEV__` in `veepoo-sdk-runtime.ts`) are **implemented**; spot-check remaining user stories if any stragglers remain.
- [x] **`docs/prd/0029-emitlocal-ternary-cleanup.md`** — `emitLocal` uses a single `normalizeEventPayload(event, payload)` path (`src/sdk/veepoo-sdk-runtime.ts`).
- [ ] **`docs/prd/0032-src-foundation-refactor.md`** — verify all 4 sub-issues' acceptance criteria fully green on GitHub; confirm #32 closed if not already

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
- [ ] Currently `validateDeviceId('')` throws to the caller; `sdk.on('error', ...)` does NOT fire
- [ ] Options: (1) keep current — synchronous throw only, (2) wrap in `handleError` to also emit
- [ ] Must decide — all upcoming feature validators will follow the same model

**D. Native layer organization for new features**
- [ ] Android pattern: one `VeepooSDKModule<Feature>.kt` extension file per feature (matches existing structure)
- [ ] iOS pattern: one `VeepooSDKModule+<Feature>.swift` extension per feature (matches existing structure)
- [ ] Each new feature = 1 Kotlin + 1 Swift + 1 TS validator + new types + new normalizer(s)

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

## §7. Feature backlog — PRD queue (grill with docs before each, do not implement yet)

Run `/grill-with-docs` against `docs/vendor-api/veepoo-sdk-android-api.md` + `docs/vendor-api/veepoo-sdk-ios-api.md` for each.

### Group A — Device control (high: stubs/flags already exist)
- [ ] **Alarms read/write** — `DeviceAlarm` type exists; `alarm` flag in `DeviceFunctionPackage1`; Android: `settingAlarm`/`readAlarm`; iOS: `VPAlarmSetting`
- [ ] **Set device time** — `DeviceTimeSetting` type exists; exposed via `ConnectOptions.timeSetting` but no standalone `setDeviceTime()` method
- [ ] **Write notification settings** — `SocialMsgData` read exists; no write; Android: `settingSocialMsgData()`; iOS: `veepooSDKSettingSocialMsgData:`
- [ ] **Heart rate alarm thresholds** — read + write `HeartWaringData`; `heartRateWarning` flag in `DeviceFunctionPackage1`

### Group B — Real-time health measurements (high: core value)
- [ ] **HRV test** — `hrvFunction` flag in `DeviceFunctionPackage2`; Android: `HRVOriginData`, `RRIntervalData`; iOS: `veepooSDKGetDeviceHrvDataWithDate:`
- [ ] **ECG test** — waveform at 250/512 Hz; `ecgFunction`, `ecgType` in `DeviceFunctionPackage2`; Android: `startDetectECG`, `EcgDetectResult`; iOS: `veepooSDKTestECGStart`, `VPECGTestDataModel`
- [ ] **Fatigue test** — `startDetectFatigue`/`stopDetectFatigue`, `FatigueData`
- [ ] **Breathing / respiration** — `startDetectBreath`, `BreathData`; `breathFunction` in `DeviceFunctionPackage2`

### Group C — Device personalization (medium)
- [ ] **Anti-loss / find device** — `sendFindDevice()`; `findDeviceByPhoneFunction` in `DeviceFunctionPackage3`
- [ ] **Screen settings** — brightness + duration; `screenLight`, `screenLightTime` in packages 1 and 2
- [ ] **Sedentary reminder** — `LongSeatSetting`; `sedentaryRemind` in `DeviceFunctionPackage1`
- [ ] **Wrist-flip wake** — `NightTurnWristSetting`; `nightTurnSetting` in `DeviceFunctionPackage1`; iOS: `VPSettingWristUp`

### Group D — Advanced (lower priority)
- [ ] **OTA firmware upgrade** — `isOadModel` flag emitted; `libdfu`/`libfastdfu` AARs already in config; iOS: `VPDFUController`
- [ ] **Watch face / dial management** — `screenStyleFunction` in `DeviceFunctionPackage2`
- [ ] **Body composition** — iOS `VPBodyCompositionModel`; `bodyComponent` in packages 3 and 4
- [ ] **Women's health** — `woman` in `DeviceFunctionPackage1`; iOS `VPWomenHealthSetting`
- [ ] **Weather push** — `weatherFunction` in `DeviceFunctionPackage2`; iOS `VPWeatherSettingModel`
- [ ] **Contact management with SOS** — `contactFunction` in `DeviceFunctionPackage3`
- [ ] **GPS / location settings** — `agpsFunction` in `DeviceFunctionPackage3`
- [ ] **Music / camera control** — `musicStyle` in `DeviceFunctionPackage3`
- [ ] **Bluetooth on/off** — Android-only (`openBluetooth`, `closeBluetooth`)

---

## §8. Grilling questions — answer before starting

1. **Error event on validation failure?** `connect('')` throws without emitting `error`. Should `INVALID_ARGUMENT` also trigger `sdk.on('error', ...)` listeners?
2. **`normalizers.ts` split: now or after features?** **Resolved:** split landed under `src/normalizers/`; new work extends domain files + `events.ts`.
3. **`VeepooSDK.ts` split: now or after Group A?** **Resolved:** façade + `src/sdk/*` split is in place; monitor size of individual `sdk/` modules as features land.
4. **Native layer in scope for this refactor pass?** Kotlin/Swift style/organization audit before features, or TS-only for now?
5. **`"ios"` → `"apple"` in config: safe to change now?** Or wait until a device build is possible to verify it doesn't break anything?
6. **Example app demos for new features?** When alarms and ECG land, should the example app expose them? Or is it frozen at current scope?

---

## Quick-start — next actions

```
1.  §1 — Decide `"ios"` → `"apple"` + run a device/prebuild smoke test, or defer with rationale
2.  §1 — Spot-check AAR names vs android/libs/*.aar
3.  §3 — Manual: 0001 prebuild/permissions; confirm 0032 / #32 status on GitHub
4.  §5 — Answer §8 Q1, Q4, Q5, Q6 (validation errors, native audit scope, apple key, example demos)
5.  §5-B — Optional: move VeepooSDKModuleInterface to src/types/module.ts
6.  §7 — Group A PRDs — start with alarms (after §8 decisions)
```
