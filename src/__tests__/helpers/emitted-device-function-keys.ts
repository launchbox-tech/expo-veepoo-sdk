import { readFileSync } from "fs";
import { join } from "path";
import {
  extractAndroidPackageKeys,
  extractIosPackageKeys,
  type PackageKeys,
} from "@/bridge-contract/verify-device-function-keys";

const SOURCES = {
  ios: "ios/VeepooSDK/VeepooSDKModule+ReadHelpers.swift",
  android: "android/src/main/kotlin/expo/modules/veepoo/VeepooSDKModuleHelpers.kt",
} as const;

export type Platform = keyof typeof SOURCES;

/**
 * The device-function keys each platform's emitter actually writes, read from
 * the native sources at test time. Tests take their input from here rather than
 * from a literal, so a key renamed in Swift or Kotlin fails a test instead of
 * arriving in JS as `undefined` (#210).
 */
export function loadEmittedPackageKeys(repoRoot: string): Record<Platform, PackageKeys> {
  return {
    ios: extractIosPackageKeys(readFileSync(join(repoRoot, SOURCES.ios), "utf8")),
    android: extractAndroidPackageKeys(readFileSync(join(repoRoot, SOURCES.android), "utf8")),
  };
}

/** Repo root, resolved from this module rather than from each caller's depth. */
export const REPO_ROOT = join(__dirname, "..", "..", "..");
