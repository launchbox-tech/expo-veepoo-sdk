# Pre-Feature Refactor Checklist

> **Vendor / API inventory:** [`vendor-parity-matrix.md`](vendor-parity-matrix.md) is the canonical map from vendor wiki capability areas to `VeepooSDK` methods and events. Update it when you ship features. Upstream drift: [`vendor-manifest.json`](../vendor-manifest.json) · `npm run vendor:check`.

> Created: 2026-05-01. Continue from here tomorrow.
> Start at §0 and work top to bottom. Answer §8 grilling questions before touching any feature code.

---

## §0. Triage
- [x] Close GitHub issue #32 — all sub-issues (#33, #34, #35, #36) shipped
- [x] Clear **`needs-triage`** from closed GitHub issues and local **`docs/issues/`** / **`docs/prd/`** mirrors (queue label only — remove after triage).

---

## §1. `expo-module.config.json` audit
- [ ] **`"ios"` → `"apple"`** — skill recommends `"apple"` as the platform key (covers iOS + macOS). Current config uses legacy `"ios"`. Verify with `references/module-config.md`.
- [ ] **No `"web"` platform** — correct; confirm no `*.web.ts` files exist that should be removed.
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
- [ ] **`docs/prd/0018-component-extraction.md`** — confirm `example/src/components/` exists with `DeviceRow`, `InfoRow`, `HealthTestCard`, `theme.ts`, `index.ts`; confirm `index.tsx` is ≤ ~200 lines
- [ ] **`docs/prd/0022-sdk-refactor-tdd.md`** — check all 19 user stories; known open items:
  - US7 (bootstrap lives in one place) — **open**, see §4
  - US9 (3 arrow function class properties) — **open**, see §4
  - US11 (`__DEV__` defensive gate) — **verify**: current code is `(globalThis as any).__DEV__ !== false`; PRD spec was `typeof __DEV__ === 'undefined' || __DEV__`
- [ ] **`docs/prd/0029-emitlocal-ternary-cleanup.md`** — confirm ternary gone; single `normalizeEventPayload(event, payload)` is the only normalization point in `emitLocal`
- [ ] **`docs/prd/0032-src-foundation-refactor.md`** — verify all 4 sub-issues' acceptance criteria fully green; then close #32

---

## §4. TS-layer code issues (known, no decision needed)

**`src/VeepooSDK.ts` — bootstrap duplication (PRD #22 US7)**
- [ ] Remove `LINKING_ERROR` constant (lines 49–51) and the `requireNativeModule` / `Proxy` block (lines 53–62)
- [ ] Import `NativeVeepooSDK` from `./NativeVeepooSDK.js` and use as constructor default: `constructor(native: NativeVeepooSDKInterface = NativeVeepooSDK)`
- [ ] One `requireNativeModule` call, one `Proxy` fallback, one `LINKING_ERROR` — all owned by `NativeVeepooSDK.ts`

**`src/VeepooSDK.ts` — arrow function class properties (PRD #22 US9)**
- [ ] `readDeviceAllData` — pure delegate, no validation → convert to arrow property
- [ ] `setLanguage` — pure delegate, no validation → convert to arrow property
- [ ] `syncPersonalInfo` — validators throw synchronously → still convertible: `syncPersonalInfo = (info: PersonalInfo): Promise<boolean> => { validatePersonalInfo(info); return this.native.syncPersonalInfo(info); }`

**`src/index.ts` — missing exports**
- [ ] Export `Spo2OriginData` (after §2)
- [ ] Export `PermissionStatus` (defined in `src/types/connection.ts`, missing from barrel)
- [ ] Decide and add: `VeepooSDKModuleInterface`, `LogListener` from `src/VeepooSDKModule.ts` — these are the JS-layer public contract

**`src/types/health-data.ts` — incomplete type**
- [ ] Add `state?: TestState` to `BloodGlucoseData` — Android SDK emits this field alongside `glucose`

**`__DEV__` gate correctness (PRD #22 US11)**
- [ ] Current: `this.logEnabled && (globalThis as any).__DEV__ !== false`
- [ ] PRD spec: `this.logEnabled && (typeof __DEV__ === 'undefined' || __DEV__)`
- [ ] Verify `__DEV__ = false` test still passes after fix

---

## §5. Architecture decisions (answer before writing any feature code)

**A. Split `normalizers.ts`?**
- [ ] Run `/improve-codebase-architecture` targeting `src/normalizers.ts` (850 lines, 21 functions — same shape as `types.ts` before its split)
- [ ] Proposed: `normalizers/connection.ts`, `normalizers/device.ts`, `normalizers/health-tests.ts`, `normalizers/health-data.ts`, `normalizers/settings.ts`, `normalizers/events.ts` (`normalizeEventPayload` only), `normalizers/index.ts`
- [ ] **Do this before adding new feature normalizers**

**B. Move `VeepooSDKModuleInterface` into `src/types/`?**
- [ ] Currently `src/VeepooSDKModule.ts` — standalone file inconsistent with types-domain-split
- [ ] Candidate location: `src/types/module.ts`, re-exported from `src/types/index.ts`
- [ ] 2-line move + barrel update; bundle with normalizers split issue

**C. Do validation failures emit the `error` event?**
- [ ] Currently `validateDeviceId('')` throws to the caller; `sdk.on('error', ...)` does NOT fire
- [ ] Options: (1) keep current — synchronous throw only, (2) wrap in `handleError` to also emit
- [ ] Must decide now — all upcoming feature validators will follow the same model

**D. Native layer organization for new features**
- [ ] Android pattern: one `VeepooSDKModule<Feature>.kt` extension file per feature (matches existing structure)
- [ ] iOS pattern: one `VeepooSDKModule+<Feature>.swift` extension per feature (matches existing structure)
- [ ] Each new feature = 1 Kotlin + 1 Swift + 1 TS validator + new types + new normalizer(s)

**E. Split `VeepooSDK.ts` by concern?**
- [ ] Run `/improve-codebase-architecture` — currently ~1000 lines; will be ~1500+ after alarms, ECG, HRV
- [ ] Resolve before Group A features so the split (if decided) lands before new methods are added

---

## §6. Feature issue template (write before any feature PRDs)

Create `docs/templates/feature-issue.md` — a reusable vertical-slice checklist that every feature PR must satisfy:

```
Native (Android):   VeepooSDKModule<Feature>.kt + event constants in VeepooSDKConstants.kt
Native (iOS):       VeepooSDKModule+<Feature>.swift
Types:              src/types/<domain>.ts — new type(s)
Events:             src/types/events.ts — VeepooEvent + VeepooEventPayload updated
Validators:         src/validators/<domain>.ts
Normalizers:        src/normalizers/<domain>.ts
SDK:                src/VeepooSDK.ts — new public method(s)
Module interface:   src/types/module.ts — new method(s) in VeepooSDKModuleInterface
Public API:         src/index.ts — new type(s) exported
Tests:              src/__tests__/validators/ + normalizers.test.ts
```

---

## §7. Feature backlog — PRD queue (grill with docs before each, do not implement yet)

Run `/grill-with-docs` against `docs/veepoo-sdk-android-api.md` + `docs/veepoo-sdk-ios-api.md` for each.

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
2. **`normalizers.ts` split: now or after features?** Splitting now = one extra issue before features; splitting later = new normalizers land in an 850-line monolith.
3. **`VeepooSDK.ts` split: now or after Group A?** Currently manageable at ~1000 lines; will be ~1500+ after alarms + ECG + HRV.
4. **Native layer in scope for this refactor pass?** Kotlin/Swift style/organization audit before features, or TS-only for now?
5. **`"ios"` → `"apple"` in config: safe to change now?** Or wait until a device build is possible to verify it doesn't break anything?
6. **Example app demos for new features?** When alarms and ECG land, should the example app expose them? Or is it frozen at current scope?

---

## Quick-start order for tomorrow morning

```
1.  Close #32                                               (2 min)
2.  Fix originSpo2Data parity (§2)                         (30 min, one commit)
3.  Fix missing index.ts exports + BloodGlucoseData (§4)   (10 min, one commit)
4.  /grill-with-docs PRD #22 US7 + US9 + US11 → fix (§4)  (45 min, one commit)
5.  Answer §8 grilling questions                           (20 min)
6.  /improve-codebase-architecture normalizers.ts (§5-A)   (30 min)
7.  /improve-codebase-architecture VeepooSDK.ts (§5-E)     (30 min)
8.  Write feature template docs/templates/feature-issue.md (§6)  (20 min)
9.  Group A PRDs — start with alarms (§7)
```
