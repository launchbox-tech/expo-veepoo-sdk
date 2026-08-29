# readOriginRawDump drops OriginData.wear — the vendor sqlite has 19 fields per bucket, the bridge emits 10

**Issue:** #211
**Status:** Open — criteria 2–3 met; 1 implemented but unrun, 4 pending hardware
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

- [ ] `readOriginRawDump`'s `origin` slots carry `Wear` on iOS. Implemented,
      but **unrun** — `handleReadOriginRawDump` rejects under
      `#if targetEnvironment(simulator)`, so the reflection path has never
      executed. Settled only by criterion 4.
- [x] The value is passed through verbatim — no re-mapping to a friendlier name
      or a boolean. `0` = worn and `2` = NOT worn stays visible to the consumer.
- [x] Android states its position explicitly, with the recorded reason.
- [ ] **Pending a real band.** Capture a fresh dump and (1) confirm
      `origin_source` reads `"original_table"` — a `"veepooSDKGetOriginalData"`
      there means the reflection path missed and the payload silently degraded
      to the old 10 keys; (2) diff the `origin` key set against
      `original_table`'s; (3) spot-check a few slot **values** against the
      sqlite rows, since a matching key set alone does not prove the values
      came through unreshaped. Not provable in a unit test, and a hand-written
      fixture is what let this family of defects ship — so no test was added.

## Notes

Blocks launchbox-tech/rayu.ai#477. Ninth instance of the rayu.ai-tracked family
*plumbing built, data never arrives, absence looks like a quiet log*.
