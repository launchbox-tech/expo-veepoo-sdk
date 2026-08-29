# Historical reads use the simple-read tier + SDK-DB extraction (never the CRC/block protocol)

## Status

Accepted (2026-06-06)

## Context

The vendor's iOS framework exposes TWO tiers for pulling stored data off the
Band:

1. **Simple read** (`#pragma mark - Simple reading method` in
   `VPPeripheralBaseManage.h`): `veepooSdkStartReadDeviceAllData…`,
   `veepooSDKStartReadDeviceRunningData`, etc. One call transfers the data
   into the **SDK's local database**; afterwards it is extracted
   synchronously via `VPDataBaseOperation.veepooSDKGet*Data(withDate:andTableID:)`.
   Origin, sleep, oxygen, and blood-glucose reads already work this way.

2. **CRC/block protocol**: `veepooSDK_readDeviceRunningCrcResult` +
   `veepooSDK_readDeviceRunningData(withBlockNumber:)` — slot-level reads
   that look like the "direct" API.

The first exercise-history implementation used tier 2 for the extraction
step. Five instrumented device runs (2026-06-06) showed the simple-read
transfer completing (`3/3 → 100% → complete`) and the CRC/block calls never
invoking their callbacks — after Start, standalone before Start, from main,
with watchdogs. The reason is in the header itself: tier 2 sits under
`#pragma mark - …It is implemented by subclass VPPeripheralAddManage,
temporarily not implemented` — **the whole store-it-yourself section is a
stub in framework 2.2.66.15** (sibling APIs are annotated 此接口无效 /
不可用 — invalid/unusable). The tier is not dead firmware; it is unshipped
SDK.

## Decision

Historical reads on iOS follow ONE pattern, the same one the working reads
already use:

```
start<X>Read (vendor transfer, progress events)  →  vendor .complete
  →  VPDataBaseOperation.veepooSDKGet<X>Data(withDate:andTableID:)   (sync, local)
  →  emit per-record events + dedicated completion event (ADR 0015)
```

The CRC/block protocol is not used anywhere. Exercise history specifically:
`veepooSDKStartReadDeviceRunningData` → `.complete` →
`veepooSDKGetDeviceRunningDataWithDate(nil, mac)` (nil = all stored days) →
filter `isHide == 1` (user-deleted on device) → emit.

**Unit normalization happens at this native boundary** (ADR-0013): the iOS
SDK DB stores distance in METRES and calories in CAL (documented in
`VPDataBaseOperation.h`), while Android's vendor types carry km/kcal. The JS
contract is km + kcal on both platforms; iOS divides by 1000 when parsing.
DB values mix strings and numbers — everything is coerced to numbers before
crossing the bridge.

## Consequences

- Nothing in the extraction step can hang: the only async hop left is the
  vendor transfer, which streams progress (watchdog-armed, ADR 0015).
- Re-reads return every stored session each sync; consumers dedup (the host
  app's UNIQUE source_event_id makes this idempotent) — same wholesale-read
  philosophy as the origin pipeline.
- If a future Band model genuinely requires the CRC tier, that's a new ADR
  with device evidence — not a silent fallback.
- **Band-recorded sessions (resolved same day):** they never surface through
  the legacy tier — the Start transfer reads/parses them
  (`VPDeviceGPSSportModel` machinery) but `veepooSDKGetDeviceRunningDataWithDate`
  returns nothing (probe trail 2026-06-06:
  `crc:timeout,b0..b2:timeout,start:complete,db:0 rows`). The fix was already
  upstream: framework **2.2.88.15** (2026-06-03) ships the typed sport API —
  the iOS mirror of Android's `readSportModelOrigin` —
  `readDeviceSportCRCArr` → `readDeviceSportWithCRC` →
  `VPDeviceSportModel[]` / `VPDeviceSportWithGPSModel[]`. Vendored framework
  bumped (release note 1.3.1); the typed API is now the primary read path,
  legacy Start+DB sweep the fallback. The bundled binary swiftmodule is
  removed on every bump (compiler-version-locked, no `.swiftinterface`; the
  ObjC projection `VeepooBleSDK-Swift.h` is retained).
- The slot-phase progress events now describe DB iteration (instant), so the
  visible progress weight lives almost entirely in the transfer phase.
- **Amendment 2026-08-29 (#211), one table only:** `veepooSDKGetOriginalData`
  is not the passthrough the decision above assumes. Disassembly of
  VeepooBleSDK 2.2.101.15 shows it reads the stored row and then runs it
  through the private `+[VPDataBaseOperation vpChangeOneDayOriginalDict:]`,
  which rebuilds each 5-minute slot from a 12-key whitelist and drops nine
  stored fields — including `Wear`, the band's own per-bucket "was this on a
  wrist" flag. `readOriginRawDump` therefore reproduces the getter's first two
  hops (`[[DBStoreManager shareStoreManager] getYTKKeyValueItemByDate:…
  fromTable:@"original_table"].objectValue`) and stops before the narrowing
  one. This is the SAME tier, one layer lower — not the CRC/block protocol,
  and not a new tier. It applies **only** to the `origin` slot of the raw
  dump; every other extraction still goes through the public getter. Because
  the entry points are absent from the public headers, each hop is guarded and
  a miss degrades to the public getter, with the path taken reported in the
  payload's `origin_source` so the degradation is visible rather than silent.
