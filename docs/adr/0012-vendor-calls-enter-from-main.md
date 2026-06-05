# Vendor calls enter from the main thread (runloop-driven completions)

## Status

Accepted (2026-06-05)

## Context

Expo `AsyncFunction` handlers run on the **module's dispatch queue**, which has
**no running RunLoop**. The vendor `VeepooBleSDK` completions fall into two
classes, and the vendor does not document which is which:

1. **CoreBluetooth-delegate-driven** replies — fire on the central's delegate
   queue regardless of the calling thread. These appear to work off-main.
2. **Runloop-driven** completions — vendor-internal timers and state machines
   (e.g. `VPDeviceDataSyncStateTimeout`) that **never fire** unless the call
   was entered from a thread with a running RunLoop. Off-main, the JS promise
   **hangs forever**: no resolution, no rejection, no log.

Class membership was discovered **hang-by-hang**, each costing a debugging
session against physical hardware:

- `handleInit` — already main-dispatched (upstream comment: 使用主线程创建
  Timer，确保 RunLoop 正确).
- `veepooSdkStartReadDeviceAllData` — stuck-at-0% sync (2026-06-04): one
  synthetic `start` progress event, then eternal silence.
- `veepooSDKReadDeviceBatteryAndChargeInfo` — `battery.read.start` logged, no
  completion, no rejection (2026-06-05).
- `HeartRateTest`, `BloodOxygenTest`, `SportStepsRead` — main-dispatched for
  the same reason before this ADR.

A hang is strictly worse than a crash: the host app's state machine strands
silently (e.g. a battery percentage that never arrives), and no error path
runs.

## Decision

1. **Blanket rule:** every call into a vendor `peripheralManage` / manager
   API is entered via `DispatchQueue.main.async`. No per-call empiricism —
   the cost of being wrong (a silent hang on hardware) dwarfs the cost of an
   unnecessary main hop (microseconds for tiny command writes; the BLE I/O
   is asynchronous regardless).
2. **Guards stay on the module queue.** `isInitialized` /
   `peripheralManage` nil / `connectionState` checks run before the hop and
   reject immediately — only the vendor entry itself hops.
3. **Promise settlement is thread-agnostic.** Expo promises may be resolved
   or rejected from whatever thread the vendor callback lands on; no hop
   back is added.
4. **Contract:** a bridge method must **resolve or reject — never hang**.
   Any newly added handler that calls the vendor SDK conforms to rule 1 from
   the start.

Files conforming as of this ADR: `+Battery`, `+Time`, `+PersonalInfo`,
`+AutoMeasure`, `+CustomSettings`, `+ReadHelpers` (readDeviceAllData),
`VeepooSDK.swift` (`handleInit`), `+HeartRateTest`, `+BloodOxygenTest`,
`+SportStepsRead`.

## Android guidance (not yet implemented)

The Android vendor SDK (`VPOperateManager`) is callback/Handler-based. When
the Android bridge is built:

- **Assume the same class split exists.** Verify whether `VPOperateManager`
  callbacks require registration from a `Looper` thread; unless proven safe,
  mirror the blanket rule — post every vendor entry to the main `Handler`.
- The JS contract is identical cross-platform: **resolve or reject, never
  hang**. Any per-platform threading quirk is absorbed below the JS surface.
- Budget hardware time for this: the hang class only reproduces against a
  physical band, never in CI or the simulator/emulator.

## Consequences

- **Positive:** the silent-hang class is eliminated structurally rather than
  hang-by-hang; new handlers inherit the rule; host-app watchdogs become a
  second line of defence instead of the only one.
- **Negative:** all vendor entries serialize through the main thread. This is
  acceptable — entries are tiny command writes and the long transfers report
  via events — but a future CPU-heavy vendor call would need its own
  treatment.
- The simulator branches (`#if targetEnvironment(simulator)`) bypass the hop;
  device builds are the only meaningful verification (no simulator slice in
  the framework — see the device-build rule in the repo docs).

## Links

- Battery hang fix: [`ios/VeepooSDK/VeepooSDKModule+Battery.swift`](../../ios/VeepooSDK/VeepooSDKModule+Battery.swift)
- readDeviceAllData fix: [`ios/VeepooSDK/VeepooSDKModule+ReadHelpers.swift`](../../ios/VeepooSDK/VeepooSDKModule+ReadHelpers.swift)
