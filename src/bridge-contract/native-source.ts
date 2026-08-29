/** Paths to the native sources the contract checks parse, relative to the repo root. */
export const NATIVE_SOURCES = {
  iosReadHelpers: "ios/VeepooSDK/VeepooSDKModule+ReadHelpers.swift",
  androidHelpers: "android/src/main/kotlin/expo/modules/veepoo/VeepooSDKModuleHelpers.kt",
  androidSocialMsgRead:
    "android/src/main/kotlin/expo/modules/veepoo/VeepooSDKModuleSocialMsgRead.kt",
  /**
   * The vendor-status mappers. Kept apart from `androidHelpers` because it
   * imports the vendor types and nothing else, which is what lets
   * scripts/android-function-status-check.sh compile and RUN it (#212).
   */
  androidFunctionStatus: "android/src/main/kotlin/expo/modules/veepoo/VeepooFunctionStatus.kt",
  iosConnect: "ios/VeepooSDK/VeepooSDKModule+Connect.swift",
  iosConnectionHelpers: "ios/VeepooSDK/VeepooSDKModule+ConnectionHelpers.swift",
  iosDeviceIdentity: "ios/VeepooSDK/VeepooDeviceIdentity.swift",
} as const;

/**
 * Returns the span of `source` between two literal markers.
 *
 * Throws rather than returning an empty span: a marker that has gone stale
 * means the check is no longer reading what it thinks it is, and a check that
 * silently inspects nothing is the failure mode these checks exist to prevent.
 */
export function sliceBody(source: string, start: string, end: string, label: string): string {
  const from = source.indexOf(start);
  if (from === -1) throw new Error(`${label}: could not find "${start}"`);
  const to = source.indexOf(end, from);
  if (to === -1) throw new Error(`${label}: could not find end marker "${end}"`);
  return source.slice(from, to);
}
