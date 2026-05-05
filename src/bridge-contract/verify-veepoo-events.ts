import { readFileSync } from "fs";
import { join } from "path";

import { NATIVE_EMITTED_EVENTS, JS_LOCAL_ONLY_EVENTS } from "../bridge/veepoo-events-registry";

/** Kotlin `VeepooSDKConstants.kt` event string literals (excludes TAG). */
export function extractKotlinNativeEvents(source: string): Set<string> {
  const out = new Set<string>();
  for (const m of source.matchAll(/const val (\w+) = "([^"]+)"/g)) {
    if (m[1] === "TAG") continue;
    out.add(m[2]);
  }
  return out;
}

/** Swift header before `PermissionDelegate`: `= "eventName"` literals only. */
export function extractSwiftNativeEvents(swiftHeader: string): Set<string> {
  const out = new Set<string>();
  for (const m of swiftHeader.matchAll(/= "([^"]+)"/g)) {
    const s = m[1];
    if (/^[a-z][a-zA-Z0-9]*$/.test(s)) out.add(s);
  }
  return out;
}

export function sliceSwiftEventsHeader(swiftSource: string): string {
  const marker = "// MARK: - 权限";
  const idx = swiftSource.indexOf(marker);
  if (idx === -1) {
    throw new Error(
      "ios/VeepooSDK/VeepooSDK.swift: missing expected // MARK: - 权限",
    );
  }
  return swiftSource.slice(0, idx);
}

export function setDiff(a: Set<string>, b: Set<string>): {
  onlyA: string[];
  onlyB: string[];
} {
  const onlyA = [...a].filter(x => !b.has(x)).sort();
  const onlyB = [...b].filter(x => !a.has(x)).sort();
  return { onlyA, onlyB };
}

export function verifyVeepooEventsContract(repoRoot: string): string[] {
  const errors: string[] = [];
  const expectedNative: Set<string> = new Set(NATIVE_EMITTED_EVENTS);

  const kotlinPath = join(
    repoRoot,
    "android/src/main/kotlin/expo/modules/veepoo/VeepooSDKConstants.kt",
  );
  const kotlin = extractKotlinNativeEvents(readFileSync(kotlinPath, "utf8"));

  const swiftPath = join(repoRoot, "ios/VeepooSDK/VeepooSDK.swift");
  const swift = extractSwiftNativeEvents(
    sliceSwiftEventsHeader(readFileSync(swiftPath, "utf8")),
  );

  const checks: Array<[string, Set<string>, Set<string>]> = [
    ["Kotlin VeepooSDKConstants.kt", expectedNative, kotlin],
    ["Swift VeepooSDK.swift (header)", expectedNative, swift],
  ];

  for (const [label, exp, act] of checks) {
    const { onlyA, onlyB } = setDiff(exp, act);
    if (onlyA.length || onlyB.length) {
      errors.push(
        `${label}: mismatch — missing ${JSON.stringify(onlyA)}; extra ${JSON.stringify(onlyB)}`,
      );
    }
  }

  for (const e of JS_LOCAL_ONLY_EVENTS) {
    if (expectedNative.has(e)) {
      errors.push(`jsLocalOnly event "${e}" must not appear in NATIVE_EMITTED_EVENTS`);
    }
  }

  return errors;
}
