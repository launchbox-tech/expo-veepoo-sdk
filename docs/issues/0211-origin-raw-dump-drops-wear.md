# readOriginRawDump drops OriginData.wear — the vendor sqlite has 19 fields per bucket, the bridge emits 10

**Issue:** #211
**Status:** Closed 2026-08-29 — all four acceptance criteria met on a real band; fixed by #220
**Labels:** bug

## What to build

`readOriginRawDump`'s `origin` map carried only ten keys per 5-minute slot, while
the vendor's own `Documents/wypDataBase.sqlite` `original_table` stores nineteen.
`Wear` — the band's answer to "was this on a wrist for this bucket" — was among
the nine dropped, so a consumer could not tell "you did not move for three hours"
from "the band was on the nightstand". Measured over 1310 buckets across 5 days,
55–61% were NOT worn.

## Where the field was lost

Not in the bridge. `+[VPDataBaseOperation veepooSDKGetOriginalDataWithDate:andTableID:]`
is not the passthrough its name suggests. Disassembling VeepooBleSDK 2.2.101.15
(`objdump -d -r --macho VPDataBaseOperation.o`) shows three hops:

```objc
item = [[DBStoreManager shareStoreManager]
          getYTKKeyValueItemByDate:date DeviceAddress:mac fromTable:@"original_table"];
return [VPDataBaseOperation vpChangeOneDayOriginalDict:item.objectValue];
```

The third hop iterates `allKeys`, and for each time slot builds a **new** dict
from a 12-key whitelist — the twelve `__cstring` literals in that object file are
exactly `heartValue ppgs ecgs disValue calValue met motionState stress
sportValue stepValue diastolic systolic`. Everything else in the stored row is
discarded: `Wear`, `resRates`, `sleepStates`, `sleepAddStates`, `resets`,
`gesture`, `bloodGlucoses`, `bloodGlucoseLevels`, and the vendor's own
`Step`/`SportValue` spellings. Time keys are preserved, so the raw and narrowed
maps are slot-for-slot comparable.

No public header exposes the per-bucket flag — the only `wear` hit across all
headers is `VPSettingWearDetection`, which is the wear *detection setting*, a
different thing.

## What changed

`ios/VeepooSDK/VeepooSDKModule+RawDump.swift` reproduces the first two hops via
the ObjC runtime and stops before the narrowing one:

- `origin` is now the verbatim stored row — all nineteen fields under the
  vendor's own key spellings (capital `Wear`, `Step`, `SportValue`, confirmed
  against the `VPStoreOriginal*Key` literals in `VPPublicKey.o`). No
  re-mapping, no `isWorn` boolean.
- `origin_normalized` keeps the SDK's narrowed view for callers already reading
  `stepValue` et al.
- `origin_source` reports `"original_table"` or `"veepooSDKGetOriginalData"`, so
  a caller can tell a real raw row from a fallback without diffing key sets.

Every runtime hop is guarded (`NSClassFromString`, `responds(to:)` on both
selectors, non-nil `objectValue`); any miss degrades to the public getter rather
than crashing on a vendor SDK bump.

Android still rejects `CAPABILITY_UNSUPPORTED` — but the comment now records the
position explicitly: `com.veepoo.protocol.model.datas.OriginData` does carry
`private int wear`, so the field arrives for free once Android has a dump entry
point (rayu.ai#457). What is missing there is the dump, not the field.

## Acceptance criteria

- [x] `readOriginRawDump`'s `origin` slots carry `Wear` on iOS. Confirmed on a
      real band: `wear_key: "Wear"` across 169 slots.
- [x] The value is passed through verbatim — no re-mapping to a friendlier name
      or a boolean. `0` = worn and `2` = NOT worn stays visible to the consumer.
- [x] Android states its position explicitly, with the recorded reason.
- [x] **Verified on a real band, 2026-08-29** (iPhone 16 Pro Max, iOS 26.6,
      SDK pinned at `2600d26`). A live sync emitted:

      ```
      band.sync.origin_keys {"origin_source":"original_table","slot_count":169,
        "key_count":19,"wear_key":"Wear","has_normalized":true,
        "keys":["SportValue","Step","Wear","bloodGlucoseLevels","bloodGlucoses",
        "calValue","diastolic","disValue","ecgs","gesture","met","ppgs",
        "protocolType","resRates","resets","sleepAddStates","sleepStates",
        "stress","systolic"]}
      ```

      `origin_source` reads `original_table`, so this is the verbatim path and
      not the fallback. The key set diffed against the `original_table` listing
      in the issue body is **empty both ways** — 19 of 19, nothing missing,
      nothing extra. No test was added on purpose: a hand-written fixture is
      what let this family of defects ship.

## `Wear` semantics — independently reproduced

The issue body's `Wear`/PPG table was measured against the vendor's sqlite. It
now reproduces through the **bridge**, on 1039 buckets across four days
(2026-08-26..29, three of them complete at 288 five-minute slots), all with
`origin_source: "original_table"`:

| `Wear` | buckets | % of all | PPG>0 | steps>0 | sport>0 | stress>0 | issue claimed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | 558 | 53.7% | **100%** | 23% | 67% | 43% | 100% → worn |
| 1 | 88 | 8.5% | **9%** | 7% | 26% | 2% | 6% → transitional |
| 2 | 393 | 37.8% | **0%** | 0% | 0% | 0% | 0% → NOT worn |

`0` = worn and `2` = NOT worn holds. `Wear:2` is not merely PPG-less — it is
inert on every channel at once (no steps, no sport, no stress), which is what a
band on a nightstand looks like and what a "quiet log" would otherwise be
mistaken for. `Wear:6` did not occur in this window.

**Every value in a slot is a STRING** (`"SportValue": "78"`, `ppgs: ["81",
"81", ...]`). Coerce before comparing: a naive `value != 0` in a dynamically
typed consumer is true for `"0"` and silently reports every bucket as active.
That is not a bridge defect — it is the vendor's own storage format, passed
through verbatim as criterion 2 requires — but it is the first thing a parser
gets wrong.

## Notes

Blocks launchbox-tech/rayu.ai#477. Ninth instance of the rayu.ai-tracked family
*plumbing built, data never arrives, absence looks like a quiet log*.

Consumer side landed in launchbox-tech/rayu.ai#545. Worth knowing before the
next consumer pins this: `stepValue` and `sportValue` are **absent** from the
new payload, so a parser still reading them gets `0` — and because `calValue`
and `disValue` are spelled the same in both shapes, the row is still written
rather than skipped. Half-populated, nothing thrown. That is the same failure
mode as this issue, one layer up, and it is why the shape change and the
parser change had to land together.
