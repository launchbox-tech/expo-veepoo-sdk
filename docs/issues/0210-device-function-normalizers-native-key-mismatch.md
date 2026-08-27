# Device-function normalizers: 12 of 12 native keys miss their declared type — every package field is undefined at runtime

**Issue:** #210
**Status:** Open
**Labels:** bug

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
- Verified against a real band (**outstanding** — cannot be proven in a unit
  test alone).

## Notes

Instance 6 of the *plumbing built, data never arrives* family tracked in
`launchbox-tech/rayu.ai`. `readDeviceFunctions` has one consumer today, reading
only `package2.watch_data_day_number` — so this is a latent trap rather than a
live defect.

Full body, including the triage edits of 2026-08-26 and 2026-08-27:
<https://github.com/launchbox-tech/expo-veepoo-sdk/issues/210>
