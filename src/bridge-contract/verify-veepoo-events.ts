import { readFileSync } from "fs";
import { join } from "path";

export interface VeepooEventsContract {
  nativeEmitted: string[];
  jsLocalOnly: string[];
}

export function loadContract(repoRoot: string): VeepooEventsContract {
  const raw = readFileSync(
    join(repoRoot, "bridge-contract", "veepoo-events.json"),
    "utf8",
  );
  const data = JSON.parse(raw) as VeepooEventsContract;
  if (!Array.isArray(data.nativeEmitted) || !Array.isArray(data.jsLocalOnly)) {
    throw new Error("bridge-contract/veepoo-events.json: invalid shape");
  }
  return data;
}

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

/** `setupEventListeners` string literals in `veepoo-sdk-runtime.ts` */
export function extractVeepooSDKListenerEvents(source: string): Set<string> {
  const start = source.indexOf("const events: VeepooEvent[] = [");
  if (start === -1) {
    throw new Error("src/sdk/veepoo-sdk-runtime.ts: missing events array");
  }
  const sub = source.slice(start);
  const close = sub.indexOf("];");
  if (close === -1) {
    throw new Error("src/sdk/veepoo-sdk-runtime.ts: unclosed events array");
  }
  const block = sub.slice(0, close);
  const out = new Set<string>();
  for (const m of block.matchAll(/"([a-z][a-zA-Z0-9]*)"/g)) {
    out.add(m[1]);
  }
  return out;
}

/** `VeepooEvent` union members in types/events.ts */
export function extractTsVeepooEventUnion(source: string): Set<string> {
  const start = source.indexOf("export type VeepooEvent =");
  if (start === -1) {
    throw new Error("src/types/events.ts: missing VeepooEvent type");
  }
  const brace = source.indexOf(";", start);
  if (brace === -1) throw new Error("src/types/events.ts: unterminated VeepooEvent");
  const block = source.slice(start, brace);
  const out = new Set<string>();
  for (const m of block.matchAll(/\| '([^']+)'/g)) {
    out.add(m[1]);
  }
  return out;
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
  let contract: VeepooEventsContract;
  try {
    contract = loadContract(repoRoot);
  } catch (e) {
    return [String(e)];
  }

  const expectedNative = new Set(contract.nativeEmitted);
  const expectedUnion = new Set([
    ...contract.nativeEmitted,
    ...contract.jsLocalOnly,
  ]);

  const kotlinPath = join(
    repoRoot,
    "android/src/main/kotlin/expo/modules/veepoo/VeepooSDKConstants.kt",
  );
  const kotlin = extractKotlinNativeEvents(readFileSync(kotlinPath, "utf8"));
  const swiftPath = join(repoRoot, "ios/VeepooSDK/VeepooSDK.swift");
  const swift = extractSwiftNativeEvents(
    sliceSwiftEventsHeader(readFileSync(swiftPath, "utf8")),
  );
  const sdkPath = join(repoRoot, "src/sdk/veepoo-sdk-runtime.ts");
  const listeners = extractVeepooSDKListenerEvents(readFileSync(sdkPath, "utf8"));
  const typesPath = join(repoRoot, "src/types/events.ts");
  const tsUnion = extractTsVeepooEventUnion(readFileSync(typesPath, "utf8"));

  const checks: Array<[string, Set<string>, Set<string>]> = [
    ["Kotlin VeepooSDKConstants.kt", expectedNative, kotlin],
    ["Swift VeepooSDK.swift (header)", expectedNative, swift],
    ["veepoo-sdk-runtime.ts setupEventListeners", expectedNative, listeners],
    ["TypeScript VeepooEvent ∪ contract", expectedUnion, tsUnion],
  ];

  for (const [label, exp, act] of checks) {
    const { onlyA, onlyB } = setDiff(exp, act);
    if (onlyA.length || onlyB.length) {
      errors.push(
        `${label}: mismatch — missing ${JSON.stringify(onlyA)}; extra ${JSON.stringify(onlyB)}`,
      );
    }
  }

  for (const e of contract.jsLocalOnly) {
    if (expectedNative.has(e)) {
      errors.push(`jsLocalOnly event "${e}" must not appear in nativeEmitted`);
    }
  }

  return errors;
}
