# Device-function normalizers: 12 of 12 native keys miss their declared type — every package field is undefined at runtime

**Issue:** #210
**Status:** Open — all four acceptance criteria met; open awaiting the maintainer's close
**Labels:** bug, ready-for-agent

## What to build

`normalizeDeviceFunctions` read a nested `packageN` object by spreading its keys
through verbatim behind a cast. Native emitted **camelCase**
(`bloodPressure`, `ecgFunction`, `agpsFunction`); `DeviceFunctionPackage1/2/3`
declare **snake_case** (`blood_pressure`, `ecg_function`, `agps_function`). All
twelve keys missed, so every declared field was `undefined` at runtime. The one
exception was `watch_data_day_number`, deliberately emitted snake_case by #209.

Two further splits were measured during triage:

- iOS emitted `agpsFunction` while Android emitted `agps` — the platforms
  disagreed with each other, not only with the type.
- Android's `toSupportedStatus` branches on Boolean/Number/String, and the
  vendor's fields are the `EFunctionStatus` **enum**, which matches none of
  them — so every Android status fell through to `"unsupported"` regardless of
  what the band reported.

Chosen fix: **option 2** — emit the declared snake_case key from native on both
platforms, so one spelling of each field spans native, normalizer, type and
test.

## Acceptance criteria

- Every declared field of `DeviceFunctionPackage1/2/3` is populated when the
  native layer reports it.
- Tests feed the real native shape, not an invented snake_case record.
- A test fails if native and the declared type ever disagree on a key again.
- Verified against a real band (met — see Status).

## Status

The code fix landed in `48e643f`. Both platforms emit the declared snake_case
keys, Android's `toFunctionStatus` reads the vendor `EFunctionStatus` enum
(`UNKONW` maps to `"unknown"`, not `"unsupported"`), `declared-keys.ts` ties the
field tables to the interfaces via `satisfies`, and
`npm run check:device-function-keys` fails the build if native emits an
undeclared key or the two platforms spell one differently. That check runs in CI
(`.github/workflows/ci.yml`) and again as a unit test
(`src/__tests__/device-function-keys-contract.test.ts`), so a future divergence
cannot land green.

**All four criteria are met.** Criteria 1–3 by `48e643f`; criterion 4 on
2026-08-28, when the `0xa7` device-function frames were pulled off a real band
(SAILESHBRO, `ai.rayu.app.stg`) and decoded. The decode was sanity-checked
against a known quantity first — package 2's `bArr[2] = 3` reproduces the
`saveDays = 3` measured for `launchbox-tech/rayu.ai#474`.

The band run was not a formality: it caught a live defect. Byte 18 read `3`,
which the vendor rule (`!= 1`) calls *support* and the old iOS predicate
(`== 0`) called *unsupported* — so iOS was reporting no heart-rate detection on
a band that has it. `dfc40f5` flipped the predicate and `bb1ccd8` pinned that an
omitted field stays omitted. All thirteen decoded fields carry plausible values
rather than a uniform block: `agps_function` is genuinely unsupported and the
retention window is a real `3`.

**Scope of the claim.** The frames prove what the *band reported*. Apart from
`heart_rate_detect` — the one field where iOS reads the raw byte array — our
iOS emitters read vendor-parsed properties (`ecgType`, `stressType`, …), so
frame-to-property agreement is inferred from the vendor deriving both from the
same frame. Still unproven end to end: a device run of `readDeviceFunctions`
observing the emitted JS object itself. That is hardware work, not code work.

A divergence flagged in passing (iOS `hrv_function` as `hrvType > 0`) was
**withdrawn**: the iOS header documents `hrvType` as non-zero meaning HRV
present, so `> 0` matches the iOS vendor's own rule. The two vendor SDKs
disagree with each other and there is no single ground truth. The audit that
followed found one genuine divergence — `blood_glucose` mode 3 — tracked in
#214 / #215 with the reasoning in `docs/research/ios-capability-predicates.md`.

Do not close on green tests alone — a prior fix here auto-closed while fixing
nothing. The close is the maintainer's call.

## Notes

Instance 6 of the *plumbing built, data never arrives* family tracked in
`launchbox-tech/rayu.ai`. `readDeviceFunctions` has one consumer today, reading
only `package2.watch_data_day_number` — so this is a latent trap rather than a
live defect.

Full body, including the triage edits of 2026-08-26 and 2026-08-27:
<https://github.com/launchbox-tech/expo-veepoo-sdk/issues/210>
