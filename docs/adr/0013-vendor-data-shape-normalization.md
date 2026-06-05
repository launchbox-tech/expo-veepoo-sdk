# Vendor data shapes normalize at the native bridge, not in JS

## Status

Accepted (2026-06-05)

## Context

Two vendor data-shape surprises were found by comparing bridge output against
the vendor sqlite database (`wypDataBase.sqlite`) pulled from a physical
device (2026-06-04):

1. **Numeric arrays are stored as string arrays.** The vendor DB stores
   `ppgs`, `ecgs`, `oxygens`, `resRates`, `sleepStates`, `apneaResults`,
   `hypoxiaTimes`, `cardiacLoads` as `["88","0","91"]`. A Swift
   `as? [Int]` cast **silently fails** (`nil`), so the field was dropped
   from every payload — per-minute heart rate vanished without any error.
2. **`VPPeripheralModel.deviceVersion` is the display version.** Per the
   framework header it is "the display version of the device" — the
   firmware version a user sees. The model exposes **no separate
   hardware/software version**. The bridge previously mapped it to
   `hardwareVersion`, leaving `firmwareVersion` empty.

The JS capability normalizers (`src/capabilities/*`) are the single payload
contract for host apps; they assume numeric arrays and a populated
`firmwareVersion`.

## Decision

1. **Element-wise conversion at the bridge:** `getIntArray` (element-wise
   `getInt`) replaces every `as? [Int]` cast on vendor-array fields, in both
   `+OriginRead` and `+ReadHelpers`. The conversion happens **on the native
   side** so the JS payload shape is typed and identical across platforms.
2. **`deviceVersion` maps to `firmwareVersion`**; `hardwareVersion` and
   `softwareVersion` are empty strings on iOS (the model has no source for
   them). Host apps fall back `firmware_version || hardware_version` for
   builds predating this fix.
3. **Rule:** any vendor field whose runtime shape differs from its declared
   shape gets normalized in the native handler with a comment citing the
   observed shape — never downstream in JS, never silently dropped.

## Android guidance (not yet implemented)

- Do **not** assume the Android vendor SDK shares these shapes: verify
  whether its origin-data arrays arrive typed or stringly, and where its
  firmware version actually lives. The JS payload contract
  (`src/capabilities/*` normalizers) is fixed — each platform's bridge bends
  its vendor shapes to match it.
- Comparing bridge output against the vendor's on-device database is the
  verification method that caught both issues; budget for it on Android
  (vendor Room DB, `adb` pull).

## Consequences

- **Positive:** per-minute HR (ppgs) and the extended arrays actually flow;
  firmware version renders; payload shape divergence between platforms is
  caught at the bridge, the one place per platform that knows the vendor.
- **Negative:** element-wise conversion costs a pass per array (negligible —
  arrays are ≤ a few hundred elements per 5-minute record).

## Links

- [`ios/VeepooSDK/VeepooSDKModule+OriginRead.swift`](../../ios/VeepooSDK/VeepooSDKModule+OriginRead.swift)
- [`ios/VeepooSDK/VeepooSDKModule+ReadHelpers.swift`](../../ios/VeepooSDK/VeepooSDKModule+ReadHelpers.swift)
- [`ios/VeepooSDK/VeepooSDKModule+DeviceInfo.swift`](../../ios/VeepooSDK/VeepooSDKModule+DeviceInfo.swift)
