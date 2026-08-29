# DEVICE_READY publishes an unsettled deviceAddress as `mac`, so the same verify emits two different device identities

**Issue:** #218
**Status:** Open
**Labels:** bug, ready-for-agent

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
`mac: null` and surfaces the identifier under its own `uuid` field, the same
`mac`/`uuid` split `DEVICE_FOUND` already uses.

**The discriminating predicate:** a UUID-format check on `deviceAddress`. *Not*
`mac == deviceId` equality — traces contain readies where `deviceId` is itself
the hardware MAC and equals a genuine `mac`, so an equality rule would null out
good values.

## Acceptance criteria

- [x] No `DEVICE_READY` payload carries a CBPeripheral UUID in `mac`; an
      unsettled address yields `mac: null` plus a populated `uuid`
- [x] A settled address yields the hardware MAC in `mac` unchanged — the fix
      must not null out good values (the split is one-directional: only a
      canonical UUID is diverted, everything else falls through as `mac`)
- [x] Every `mac`-publishing emission site is covered, including the one not
      reachable from the app today (`handleVerifyPassword`)
- [x] The JS-side event type marks `mac` nullable and exposes `uuid`
- [ ] Verified on a **physical device** — a simulator run skips the `#else` in
      the connect/verify handlers and gives a false pass
- [ ] A device trace shows `device_ready` `mac` values that are 100% MAC or
      explicitly null, across at least 20 readies

The last two need a physical band and a dev-client build; they cannot be closed
by an AFK agent. Pull the trace with `pull-logs` from rayu.ai and check the
`device_ready` `mac` distribution.

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
- `check:device-ready-identity` — a contract check that parses both Swift files
  and fails if any `DEVICE_READY` emission assigns `deviceAddress` to `mac`, or
  publishes `mac` without `uuid`. The JS type is fenced against the Swift rather
  than hand-copied from it.

## Reference

- App-side issue and full triage record: rayu.ai#464
- Client mitigation already shipped: rayu.ai `6339f051`
- Vendor comparison: rayu.ai `docs/research/gband-ios-device-identity.md` — the
  G Band app writes this identity at **one** site and reads it twelve times, so
  it never observes the unsettled value
