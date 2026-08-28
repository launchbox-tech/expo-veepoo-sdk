# iOS capability predicates, audited against both vendor SDKs

**Provenance:** `ios/VeepooSDK/VeepooSDKModule+ReadHelpers.swift` (`cacheDeviceFunctions`)
read against the iOS vendor header `VPPeripheralModel.h` and the decompiled
Android app `com.vpgband.app` 2.1.17, `sources/p208jf/C8887y.java`. Raw values
from a band traced 2026-08-28 (see #210). Written after `dfc40f5` fixed
`heart_rate_detect`, to find out whether the rest of `cacheDeviceFunctions`
carried the same defect.

## The method, and why it matters more than the result

iOS re-derives each capability from a raw vendor value with a predicate of our
own. Android does not — it reads the vendor's already-parsed
`FunctionDeviceSupportData`. So every iOS predicate is a place we can disagree
with the vendor, and the key contract in `48e643f` cannot see it: it compares
key *spellings*, and these are all spelled correctly.

The rule applied here: **change a predicate only where both vendor SDKs
independently agree ours is wrong.** That is what settled `heart_rate_detect` —
the iOS header and the Android parser said the same thing, and our code said
something else. Where the two vendors disagree with *each other*, there is no
ground truth to move toward, and picking one is how you ship a parse that is
plausible and false.

## Result

One field changed. Nothing found here is live: at the values this band reports,
every predicate below returns the right answer. This is hygiene against a future
band, not an incident.

### Changed — both sources agree we were wrong

| field | property | was | now |
| --- | --- | --- | --- |
| `blood_glucose` | `bloodGlucoseType` | `> 0` | `!= 0 && != 3` |

Mode 3 is `仅有校准` — "calibration only" — in the iOS header, and Android drops
exactly that value while keeping its calibration flag
(`i22 == 3 → setBloodGlucose(UNSUPPORT); setBloodGlucoseAdjusting(SUPPORT)`).
`> 0` reported glucose on a band that only calibrates it. Band reports 4, so
latent.

### Left alone — the two vendor SDKs disagree with each other

| field | iOS header | Android parser |
| --- | --- | --- |
| `hrv_function` | `非0代表有hrv功能` — non-zero means has HRV | `b33 != 0 && b33 != 5` — 5 is unsupported |
| `precision_sleep` | `0代表普通睡眠,1/3代表精准睡眠` — 1/3 are precise | `b36 != 0` — any non-zero |

Our `hrv_function` uses `> 0`, which **matches the iOS header exactly**. Importing
Android's `!= 5` would be applying an Android rule to iOS on no iOS evidence —
the inverse of the `heart_rate_detect` case, where both agreed. `precision_sleep`
is the same shape: iOS documents 1/3, Android accepts anything non-zero, and
neither is evidence about the other. Band reports `hrvType` 3 and `sleepType` 1;
both predicates agree there.

`VPPeripheralModel.h` also exposes derived booleans — `isSupportHRVTest`,
`isSupportBPTest` — which look like the principled read, the same move that makes
Android correct. **They must not be adopted: the SDK never writes them.**

Measured against the bundled `VeepooBleSDK` arm64 static archive (453 objects):

| selector | call sites | conclusion |
| --- | --- | --- |
| `setHrvType:` | 2 | populated during parsing |
| `setEcgType:` | 2 | populated |
| `setStressType:`, `setBloodGlucoseType:`, `setSaveDays:` | 1 each | populated |
| `setIsSupportHRVTest:` | **0** | never called |
| `setIsSupportBPTest:` | **0** | never called |
| `setIsSupportMetTest:`, `setHrvSupportAllDay:` | **0** | never called |

Three independent checks agree. No object file contains an
`_objc_msgSend$setIsSupportHRVTest:` reference; the selector string appears in no
object other than `VPPeripheralModel.o`, which merely defines the accessor; and
disassembling that object shows the only stores to the two ivars are the
synthesized setters themselves:

    -[VPPeripheralModel setIsSupportHRVTest:]:  strb w2, [x0, #0xd]
    -[VPPeripheralModel setIsSupportBPTest:]:   strb w2, [x0, #0xe]

Nothing reaches them. The ivars are zero-initialised and stay `NO` for the life
of the object, on every band.

So reading `device.isSupportHRVTest` would have made `hrv_function` report
`unsupported` **unconditionally** — trading a predicate that is correct per the
iOS header for a constant `false`. That is not a refactor, it is a fresh
instance of the *plumbing built, data never arrives* family this audit exists to
close.

Note this is stronger evidence than a device run could give: a device shows one
band's value and cannot distinguish "this band lacks HRV" from "the property is
never written". The archive answers it for all bands. Re-check when the vendor
SDK is upgraded — this is a fact about the bundled version, not about the API.

### Left alone — sources confirm the current predicate

| field | property | predicate | basis |
| --- | --- | --- | --- |
| `spo_h` | `oxygenType` | `> 0` | `非0代表有血氧功能` |
| `temperature_function` | `temperatureType` | `> 0` | `0表示没有`, 1/2/4/5 all carry temperature |
| `agps_function` | `agpsFunction` | `> 0` | `1代表有 0表示没有` |
| `ecg_function` | `ecgType` | `> 0` | `0代没有此功能`, 1 = E series, 2 = G series |
| `stress_function` | `stressType` | `> 1` | `0/1为不支持` — already correct |

### Left alone — no documented semantics

`blood_pressure` (`bloodPressureType`, 「血压类型」) and `blood_component`
(`bloodAnalysisType`, 「血液成分」) carry a bare label and no value table. Android's
rules are `!= 0` for both, which is what we do, but with nothing on the iOS side
to corroborate it that is agreement by coincidence rather than evidence.
`body_component` is weaker still: Android supports only `i27 == 1` while we use
`> 0`, and the iOS header says nothing at all.

## Why the contract check cannot be extended to cover this

`check:device-function-keys` compares key spellings across native, normalizer and
type. Extending it to compare *predicates* would need a single correct predicate
per field to check against. As the second table shows, for at least two fields
the two vendor SDKs genuinely disagree, so no such value exists. This is a known
gap, not a backlog item: the defect class is real and the automated check for it
is not available. A predicate can only be audited against documentation, by hand,
as here.

## Related

- #210 — `heart_rate_detect` read byte 18 as `== 0`; both sources said `!= 1`.
  Fixed in `dfc40f5`, confirmed live-wrong on a real band.
- `launchbox-tech/rayu.ai` `docs/research/veepoo-device-function-frame-layout.md`
  — the `bArr[19]` trap, and the header comment that "does not crash, it is
  plausible and false".
