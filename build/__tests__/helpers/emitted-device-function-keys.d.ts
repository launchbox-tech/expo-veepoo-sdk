import { type PackageKeys } from "../../bridge-contract/verify-device-function-keys";
declare const SOURCES: {
    readonly ios: "ios/VeepooSDK/VeepooSDKModule+ReadHelpers.swift";
    readonly android: "android/src/main/kotlin/expo/modules/veepoo/VeepooSDKModuleHelpers.kt";
};
export type Platform = keyof typeof SOURCES;
/**
 * The device-function keys each platform's emitter actually writes, read from
 * the native sources at test time. Tests take their input from here rather than
 * from a literal, so a key renamed in Swift or Kotlin fails a test instead of
 * arriving in JS as `undefined` (#210).
 */
export declare function loadEmittedPackageKeys(repoRoot: string): Record<Platform, PackageKeys>;
/** Repo root, resolved from this module rather than from each caller's depth. */
export declare const REPO_ROOT: string;
export {};
//# sourceMappingURL=emitted-device-function-keys.d.ts.map