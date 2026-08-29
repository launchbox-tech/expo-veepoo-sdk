# DEVICE_READY publishes an unsettled deviceAddress as `mac`, so the same verify emits two different device identities

**Issue:** #218
**Status:** Closed
**Labels:** bug

Mirror of rayu.ai#464. The Swift lives here; landing it in the app is a pin bump.

## What to build

`DEVICE_READY` reads `peripheralModel?.deviceAddress` and publishes it as `mac`
unconditionally. The vendor header documents that address as unstable at exactly
that moment — 设备地址，密码验证成功之后可能会改变 ("may change after successful
verification") — so before it settles it holds the iOS CBPeripheral UUID and
afterwards the hardware MAC.

The event fires more than once per verify: `veepooSDKSynchronousPasswordWithType`
retains its result block and re-invokes it on each auto-send of the password,
which the vendor does on every service discovery. So one verify publishes two
different identities under the same field name, ~15–480 ms apart, and
`rawStatus` cannot discriminate them (a device trace of 15 readies reported
`PasswordValidationAllSuccess (6)` for all 15). Measured: 6 of 15 `device_ready`
events carried a UUID in `mac` — 40%.

Fix: `mac` carries a hardware MAC or nothing. An unsettled address yields
`mac: null` and surfaces the identifier under its own `uuid` field — the same
two-field shape `DEVICE_FOUND` already publishes. Note the shape is all that is
shared: `DEVICE_FOUND` sets `mac` to `rawAddr ?? uuid`, so it still falls back to
the UUID. Changing that is out of scope here.

**The discriminating predicate:** a UUID-format check on `deviceAddress`. *Not*
`mac == deviceId` equality — traces contain readies where `deviceId` is itself
the hardware MAC and equals a genuine `mac`, so an equality rule would null out
good values.

## Acceptance criteria

- [x] No `DEVICE_READY` payload carries a CBPeripheral UUID in `mac`; an
      unsettled address yields `mac: null` plus a populated `uuid`
- [x] A settled address yields the hardware MAC in `mac` unchanged — the fix
      must not null out good values. The split is one-directional: only a
      canonical UUID is diverted, everything else falls through as `mac`.
      Regression-tested including the `deviceId`-is-a-MAC case, by
      `scripts/ios-device-identity-check.sh`, which compiles and runs the
      shipped `VeepooDeviceIdentity.swift`. Verified load-bearing: inverting the
      predicate to recognise MACs instead fails 5 of its 15 cases.
- [x] Every `mac`-publishing emission site is covered, including the one not
      reachable from the app today (`handleVerifyPassword`)
- [x] The JS-side event type marks `mac` nullable and exposes `uuid`
- [x] Verified on a **physical device** — a simulator run skips the `#else` in
      the connect/verify handlers and gives a false pass. Release staging build
      of rayu.ai on SAILESHBRO (iPhone 16 Pro Max), band 27:B5:E7:4B:AE:F6.
- [x] A device trace shows `device_ready` `mac` values that are 100% MAC or
      explicitly null, across at least 20 readies. **29 readies, 0 UUIDs in
      `mac`** (2026-08-29). One unsettled read split correctly:
      `mac=null uuid=4CFE8D70-0C19-D4D5-8940-C53F952A4A51` — the same UUID that
      appeared 13 times *inside* `mac` on the pre-fix build.

Same phone, same band, across the build changeover:

| | readies | real MAC | UUID in `mac` |
|---|---|---|---|
| before | 35 | 22 | **13 (37%)** |
| after | 29 | 28 | **0** |

All criteria met. The trace was pulled with `pull-logs` from rayu.ai; the app
side needed rayu.ai#558 first, because the `band.device_ready.mac=` log line
recorded only `mac`, and `mac=null` alone cannot distinguish "unsettled, the
identifier is in `uuid`" from "no address at all".

## Out of scope

- Removing the double emission. It is vendor behaviour driven by re-sending the
  password on each service discovery, and consumers already absorb it with a
  settle window.
- Changing `DEVICE_FOUND` or any other event's payload shape.
- The rayu.ai client-side guard, which stays as defence in depth.

## Implementation

- `ios/VeepooSDK/VeepooDeviceIdentity.swift` — Foundation-only split of
  `deviceAddress` into `mac`/`uuid` by UUID shape, plus the `NSNull`-backed
  payload values so an unknown MAC reaches JS as an explicit `null`.
- Both emission sites route through it: `VeepooSDKModule+ConnectionHelpers.swift`
  (`verifyPasswordInternal`, the auto-verify path the app hits) and
  `VeepooSDKModule+Connect.swift` (`handleVerifyPassword`, the unused export).
- `check:device-ready-identity` — a contract check that scans every
  `ios/VeepooSDK/*.swift` for the emission (not an allowlist, so a third emitting
  file added later is covered too) and fails if any `DEVICE_READY` emission
  assigns `deviceAddress` to `mac`, or publishes `mac` without `uuid`. It also
  reads `src/types/events.ts` and fails if `mac`/`uuid` are declared without
  `| null`, so the JS type is fenced against the Swift rather than hand-copied
  from it.
- `check:ios-device-identity` — compiles `VeepooDeviceIdentity.swift` with
  `swiftc` and runs 15 behavioural cases against it. The contract check proves
  the emission sites *call* the type; this proves the type *decides* correctly.
  Foundation-only, so it needs no pods and runs in ~1s; wired into `ci-local.sh`
  and the `ios-swift` CI job ahead of the pod build.

**Settled by the device trace:** `NSNull` in a `sendEvent` dictionary does reach
JS as `null` rather than a dropped key — the unsettled ready logged a literal
`mac=null`, which only happens if the key arrives carrying null. The Swift-side
value was already asserted; the Expo bridge conversion was observable only on a
device. Consumers should still treat `mac` as "absent or null", which is what
the type says.

## Reference

- App-side issue and full triage record: rayu.ai#464
- Client mitigation already shipped: rayu.ai `6339f051`
- App-side follow-up that made the trace legible: rayu.ai#558
- Vendor comparison: rayu.ai `docs/research/gband-ios-device-identity.md` — the
  G Band app writes this identity at **one** site and reads it twelve times, so
  it never observes the unsettled value
