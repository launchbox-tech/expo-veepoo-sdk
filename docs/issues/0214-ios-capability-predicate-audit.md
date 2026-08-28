# iOS re-derives capability predicates the vendor already answers — blood_glucose reports mode 3 as glucose

**Issue:** #214
**Status:** Open
**Labels:** bug

## What to build

iOS derives each capability in `cacheDeviceFunctions` from a raw vendor value
with a predicate of our own; Android reads the vendor's already-parsed
`FunctionDeviceSupportData`. Every iOS predicate is a place we can disagree with
the vendor silently, and `check:device-function-keys` cannot see it — it compares
key spellings, and these are all spelled correctly. #210's byte 18 was one
instance; this audits the rest.

Audited against **both** vendor SDKs, changing a predicate only where the two
independently agree ours is wrong — the rule that settled byte 18.

One divergence found, latent: `blood_glucose`. The iOS header lists mode 3 as
仅有校准, "calibration only", and Android drops the same value
(`i22 == 3 → setBloodGlucose(UNSUPPORT)`), so `bloodGlucoseType > 0` reported
glucose on a band that only calibrates it. The band traced 2026-08-28 reports
mode 4.

**Correction on record:** an earlier note claimed `hrv_function` should adopt
Android's `!= 0 && != 5`. That is wrong. The iOS header documents `hrvType` as
非0代表有hrv功能, so our `> 0` already matches iOS; the two vendor SDKs disagree
with each other and there is no ground truth to move toward. `precision_sleep`
is the same shape.

## Acceptance criteria

- `blood_glucose` stops reporting mode 3 as glucose.
- The audit is written down, including the fields deliberately left alone and why.
- The contract-check gap is documented rather than left as an open suggestion.
- `isSupportHRVTest` / `isSupportBPTest` checked on a device (**outstanding** —
  needs hardware; if populated, reading them beats every predicate in this file).

## Notes

Full audit lives in `docs/research/ios-capability-predicates.md`. Extending the
contract check to compare predicates cannot work: it needs one correct predicate
per field, and for at least two fields the vendors disagree, so no such value
exists.

Full body: <https://github.com/launchbox-tech/expo-veepoo-sdk/issues/214>
