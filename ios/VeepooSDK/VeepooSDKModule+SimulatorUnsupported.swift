import ExpoModulesCore

extension VeepooSDKModule {
  /// Single answer for "this needs the band, and there is no band here".
  ///
  /// The vendor ships no simulator slice at any version, so on the simulator we
  /// link an empty stub (see `scripts/build-xcframeworks.sh`) and every vendor
  /// call is compiled out behind `#if !targetEnvironment(simulator)`. What the
  /// `#if targetEnvironment(simulator)` arm answers instead is a design choice,
  /// and the vendor's own convention decides it: absence is always a distinct
  /// state, never a plausible default —
  ///
  ///   `VPDeviceBloodGlucoseTestStateUnsupported`, `VPTemperatureTestStateUnsupported`,
  ///   `VPDeviceContactsOpStateNoFunction`, `VPSearchDeviceFunctionStateUnsupported`
  ///
  /// — and where an interface carries no support flag, the vendor's iOS API doc
  /// says so explicitly: "If a failed callback is triggered, it means that the
  /// device does not support this interface."
  ///
  /// A rejection is our failed callback. It is also the repo's first governing
  /// principle: missing data is not evidence of absence, so a read with no
  /// source must not answer with a number. `readBattery` returning `88` on a
  /// machine with no Bluetooth radio is a fabrication, not a fallback.
  ///
  /// `CAPABILITY_UNSUPPORTED` is the established code for this (30 call sites,
  /// already used for the simulator by `handleStartLocalFirmwareDfu`), and is in
  /// the `VeepooErrorCode` union in `src/types/errors.ts`, so TS re-throws it as
  /// `{ code: 'CAPABILITY_UNSUPPORTED' }` with no new mapping needed.
  ///
  /// Deliberately NOT applied to `connect` / `disconnect` / `verifyPassword`:
  /// those simulator arms fake a connected band on purpose, so band UI can be
  /// developed without hardware. They report a *session*, not a measurement.
  func rejectUnavailableOnSimulator(_ promise: Promise, _ api: String) {
    promise.reject(
      "CAPABILITY_UNSUPPORTED",
      "\(api) is not available in the iOS Simulator — it requires the vendor SDK, which ships no simulator slice."
    )
  }
}
