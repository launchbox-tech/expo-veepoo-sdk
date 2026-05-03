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

/** `setupEventListeners` string literals in `event-bus.ts` */
export function extractVeepooSDKListenerEvents(source: string): Set<string> {
  const start = source.indexOf("const events: VeepooEvent[] = [");
  if (start === -1) {
    throw new Error("src/bridge/event-bus.ts: missing events array");
  }
  const sub = source.slice(start);
  const close = sub.indexOf("];");
  if (close === -1) {
    throw new Error("src/bridge/event-bus.ts: unclosed events array");
  }
  const block = sub.slice(0, close);
  const out = new Set<string>();
  for (const m of block.matchAll(/"([a-z][a-zA-Z0-9]*)"/g)) {
    out.add(m[1]);
  }
  return out;
}

/**
 * Top-level keys of `VeepooEventPayload` in types/events.ts (these are {@link VeepooEvent}).
 * Parses brace-balanced object type body; top-level properties use two-space indent.
 */
export function extractTsVeepooEventPayloadKeys(source: string): Set<string> {
  const marker = "export type VeepooEventPayload = ";
  const start = source.indexOf(marker);
  if (start === -1) {
    throw new Error("src/types/events.ts: missing VeepooEventPayload type");
  }
  const open = source.indexOf("{", start);
  if (open === -1) {
    throw new Error("src/types/events.ts: VeepooEventPayload missing opening brace");
  }
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    const c = source[i];
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) {
        const body = source.slice(open + 1, i);
        const out = new Set<string>();
        const keyLine = /^ {2}([a-zA-Z][a-zA-Z0-9]*)\???:/;
        for (const line of body.split(/\r?\n/)) {
          const m = line.match(keyLine);
          if (m) out.add(m[1]);
        }
        return out;
      }
    }
  }
  throw new Error("src/types/events.ts: unterminated VeepooEventPayload");
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
  const sdkPath = join(repoRoot, "src/bridge/event-bus.ts");
  const listeners = extractVeepooSDKListenerEvents(readFileSync(sdkPath, "utf8"));
  const typesPath = join(repoRoot, "src/types/events.ts");
  const tsUnion = extractTsVeepooEventPayloadKeys(readFileSync(typesPath, "utf8"));

  const checks: Array<[string, Set<string>, Set<string>]> = [
    ["Kotlin VeepooSDKConstants.kt", expectedNative, kotlin],
    ["Swift VeepooSDK.swift (header)", expectedNative, swift],
    ["veepoo-sdk-runtime.ts setupEventListeners", expectedNative, listeners],
    ["TypeScript VeepooEventPayload keys ∪ contract", expectedUnion, tsUnion],
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
