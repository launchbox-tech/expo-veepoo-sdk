import { readFileSync } from "fs";
import { join } from "path";

import { NATIVE_EMITTED_EVENTS, JS_LOCAL_ONLY_EVENTS } from "../bridge/event-registry";

/** Kotlin `VeepooSDKConstants.kt` event string literals (excludes TAG). */
export function extractKotlinNativeEvents(source: string): Set<string> {
  const out = new Set<string>();
  for (const m of source.matchAll(/const val (\w+) = "([^"]+)"/g)) {
    const name = m[1];
    const value = m[2];
    if (!name || !value) continue;
    if (name === "TAG") continue;
    out.add(value);
  }
  return out;
}

/** Swift event-constants file: `= "eventName"` string literals only. */
export function extractSwiftNativeEvents(swiftHeader: string): Set<string> {
  const out = new Set<string>();
  for (const m of swiftHeader.matchAll(/= "([^"]+)"/g)) {
    const s = m[1];
    if (s && /^[a-z][a-zA-Z0-9]*$/.test(s)) out.add(s);
  }
  return out;
}

/**
 * Until #194 the event constants lived inside VeepooSDK.swift and the
 * verifier had to slice the top of the file. They now live in their own
 * VeepooEvents.swift, but we keep this helper so older callers that still
 * pass the whole module file see the same behaviour: take everything up to
 * the permission-delegate marker if present, otherwise the whole file.
 */
export function sliceSwiftEventsHeader(swiftSource: string): string {
  const marker = "// MARK: - 权限";
  const idx = swiftSource.indexOf(marker);
  if (idx === -1) return swiftSource;
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

  const swiftPath = join(repoRoot, "ios/VeepooSDK/VeepooEvents.swift");
  const swift = extractSwiftNativeEvents(
    sliceSwiftEventsHeader(readFileSync(swiftPath, "utf8")),
  );

  const checks: Array<[string, Set<string>, Set<string>]> = [
    ["Kotlin VeepooSDKConstants.kt", expectedNative, kotlin],
    ["Swift VeepooEvents.swift", expectedNative, swift],
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
