import { readFileSync } from "fs";
import { join } from "path";
import {
  DECLARED_PACKAGE_FIELDS,
  isDeclaredPackage,
  type FieldKind,
} from "@/capabilities/device-functions/declared-keys";
import { NATIVE_SOURCES, sliceBody } from "./native-source";

const SWIFT_PATH = NATIVE_SOURCES.iosReadHelpers;
const KOTLIN_PATH = NATIVE_SOURCES.androidFunctionStatus;
const EMITTER_PATH = NATIVE_SOURCES.androidHelpers;

/** `type` is a package discriminator, not a field — the normalizers ignore it. */
const NON_FIELD_KEYS = new Set(["type"]);

export type PackageKeys = Map<string, Set<string>>;

/**
 * Collects the literal keys each `packageN` map is built from. Both emitters
 * are plain dictionary literals, so key positions are matched directly rather
 * than by bracket-balancing: Swift `"key":` / `package2["key"] =`, Kotlin
 * `"key" to` / `put("key",`.
 */
function extractPackageKeys(body: string): PackageKeys {
  const packages: PackageKeys = new Map();
  let current: Set<string> | undefined;

  for (const line of body.split("\n")) {
    const declared = /\b(?:let|var|val)\s+(package\d+)\b/.exec(line)?.[1];
    if (declared) {
      current = packages.get(declared) ?? new Set<string>();
      packages.set(declared, current);
    }

    // Swift assigns the retention window after the literal: package2["key"] = …
    const indexed = /\b(package\d+)\["([^"]+)"\]\s*=/.exec(line);
    if (indexed?.[1] && indexed[2]) {
      const target = packages.get(indexed[1]) ?? new Set<string>();
      packages.set(indexed[1], target);
      target.add(indexed[2]);
      continue;
    }

    if (!current) continue;
    const key =
      /"([^"]+)"\s*:/.exec(line)?.[1] ??
      /"([^"]+)"\s+to\b/.exec(line)?.[1] ??
      /\bput\(\s*"([^"]+)"/.exec(line)?.[1];
    if (key) current.add(key);
  }

  for (const keys of packages.values()) {
    for (const key of NON_FIELD_KEYS) keys.delete(key);
  }
  return packages;
}

export function extractIosPackageKeys(source: string): PackageKeys {
  return extractPackageKeys(
    sliceBody(
      source,
      "func cacheDeviceFunctions()",
      // Stops before the wrapper literal, whose keys are package NAMES, not fields.
      "cachedDeviceFunctions = [",
      "iOS cacheDeviceFunctions",
    ),
  );
}

export function extractAndroidPackageKeys(source: string): PackageKeys {
  return extractPackageKeys(
    sliceBody(
      source,
      "fun deviceFunctionPackages(",
      // Stops before the wrapper literal, whose keys are package NAMES, not fields.
      "return mapOf(",
      "Android deviceFunctionPackages",
    ),
  );
}

/**
 * Fails when `updateFunctionsFromSupportData` stops handing the cache what
 * [deviceFunctionPackages] built.
 *
 * The keys above are read from the mapper's file, which is not where #210 was
 * filed. A helper that builds its own map bypasses both this check's real
 * subject and the executable one that runs the mapper, with the mapper sitting
 * correct and untouched beside it — the hole the #212 follow-up shipped and had
 * to close.
 */
export function verifyAndroidPackageEmitter(source: string): string[] {
  const errors: string[] = [];
  const body = sliceBody(
    source,
    "fun VeepooSDKModule.updateFunctionsFromSupportData",
    "\n}",
    "Android updateFunctionsFromSupportData",
  );

  if (!/cachedDeviceFunctions\.putAll\(\s*deviceFunctionPackages\(\s*data\s*\)\s*\)/.test(body)) {
    errors.push(
      `Android updateFunctionsFromSupportData must fill the cache from ` +
        `deviceFunctionPackages(data) (${EMITTER_PATH})`,
    );
  }

  const built = [...body.matchAll(/"([^"]+)"\s+to\b|\bput\(\s*"([^"]+)"/g)].map(
    (match) => (match[1] ?? match[2]) as string,
  );
  if (built.length) {
    errors.push(
      `Android updateFunctionsFromSupportData names the keys [${built.join(", ")}] itself — a map ` +
        `built here bypasses deviceFunctionPackages and the check that runs it (${EMITTER_PATH})`,
    );
  }

  return errors;
}

function sorted(keys: Iterable<string>): string[] {
  return [...keys].sort();
}

/**
 * Fails when the native layer emits a device-function key the declared types do
 * not have, or when the two platforms disagree on the spelling of one.
 *
 * Deliberately one-directional: the interfaces declare far more fields than
 * either platform reports today, and a declared-but-unemitted field is a gap,
 * not drift. Emitting a placeholder for it would recreate exactly the defect
 * this check exists to catch (#210).
 */
export function verifyDeviceFunctionKeysContract(repoRoot: string): string[] {
  const errors: string[] = [];
  const ios = extractIosPackageKeys(readFileSync(join(repoRoot, SWIFT_PATH), "utf8"));
  const android = extractAndroidPackageKeys(readFileSync(join(repoRoot, KOTLIN_PATH), "utf8"));
  errors.push(...verifyAndroidPackageEmitter(readFileSync(join(repoRoot, EMITTER_PATH), "utf8")));

  for (const [platform, path, packages] of [
    ["iOS", SWIFT_PATH, ios],
    ["Android", KOTLIN_PATH, android],
  ] as const) {
    if (packages.size === 0) {
      errors.push(`${platform} ${path}: no device-function packages found — the extractor is stale`);
    }
    for (const [packageName, keys] of packages) {
      if (!isDeclaredPackage(packageName)) {
        errors.push(
          `${platform} emits "${packageName}", which no DeviceFunctionPackage type declares — ` +
            `add the interface and its entry in declared-keys.ts`,
        );
        continue;
      }
      const declared: Readonly<Record<string, FieldKind>> = DECLARED_PACKAGE_FIELDS[packageName];
      if (keys.size === 0) {
        errors.push(`${platform} ${packageName} has no keys — the extractor is stale`);
      }
      for (const key of sorted(keys)) {
        if (!(key in declared)) {
          errors.push(
            `${platform} emits ${packageName}.${key}, which the declared type does not have — ` +
              `JS drops it. Use a declared key from declared-keys.ts (${path}).`,
          );
        }
      }
    }
  }

  for (const packageName of sorted(new Set([...ios.keys(), ...android.keys()]))) {
    const iosKeys = sorted(ios.get(packageName) ?? []);
    const androidKeys = sorted(android.get(packageName) ?? []);
    const onlyIos = iosKeys.filter((key) => !androidKeys.includes(key));
    const onlyAndroid = androidKeys.filter((key) => !iosKeys.includes(key));
    if (onlyIos.length || onlyAndroid.length) {
      errors.push(
        `${packageName} differs between platforms — iOS only: [${onlyIos.join(", ")}], ` +
          `Android only: [${onlyAndroid.join(", ")}]. One spelling per field, on both platforms.`,
      );
    }
  }

  return errors;
}
