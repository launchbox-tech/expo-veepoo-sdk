"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractIosPackageKeys = extractIosPackageKeys;
exports.extractAndroidPackageKeys = extractAndroidPackageKeys;
exports.verifyDeviceFunctionKeysContract = verifyDeviceFunctionKeysContract;
const fs_1 = require("fs");
const path_1 = require("path");
const declared_keys_1 = require("../capabilities/device-functions/declared-keys");
const native_source_1 = require("./native-source");
const SWIFT_PATH = native_source_1.NATIVE_SOURCES.iosReadHelpers;
const KOTLIN_PATH = native_source_1.NATIVE_SOURCES.androidHelpers;
/** `type` is a package discriminator, not a field — the normalizers ignore it. */
const NON_FIELD_KEYS = new Set(["type"]);
/**
 * Collects the literal keys each `packageN` map is built from. Both emitters
 * are plain dictionary literals, so key positions are matched directly rather
 * than by bracket-balancing: Swift `"key":` / `package2["key"] =`, Kotlin
 * `"key" to` / `put("key",`.
 */
function extractPackageKeys(body) {
    const packages = new Map();
    let current;
    for (const line of body.split("\n")) {
        const declared = /\b(?:let|var|val)\s+(package\d+)\b/.exec(line)?.[1];
        if (declared) {
            current = packages.get(declared) ?? new Set();
            packages.set(declared, current);
        }
        // Swift assigns the retention window after the literal: package2["key"] = …
        const indexed = /\b(package\d+)\["([^"]+)"\]\s*=/.exec(line);
        if (indexed?.[1] && indexed[2]) {
            const target = packages.get(indexed[1]) ?? new Set();
            packages.set(indexed[1], target);
            target.add(indexed[2]);
            continue;
        }
        if (!current)
            continue;
        const key = /"([^"]+)"\s*:/.exec(line)?.[1] ??
            /"([^"]+)"\s+to\b/.exec(line)?.[1] ??
            /\bput\(\s*"([^"]+)"/.exec(line)?.[1];
        if (key)
            current.add(key);
    }
    for (const keys of packages.values()) {
        for (const key of NON_FIELD_KEYS)
            keys.delete(key);
    }
    return packages;
}
function extractIosPackageKeys(source) {
    return extractPackageKeys((0, native_source_1.sliceBody)(source, "func cacheDeviceFunctions()", 
    // Stops before the wrapper literal, whose keys are package NAMES, not fields.
    "cachedDeviceFunctions = [", "iOS cacheDeviceFunctions"));
}
function extractAndroidPackageKeys(source) {
    return extractPackageKeys((0, native_source_1.sliceBody)(source, "fun VeepooSDKModule.updateFunctionsFromSupportData", "cachedDeviceFunctions[", "Android updateFunctionsFromSupportData"));
}
function sorted(keys) {
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
function verifyDeviceFunctionKeysContract(repoRoot) {
    const errors = [];
    const ios = extractIosPackageKeys((0, fs_1.readFileSync)((0, path_1.join)(repoRoot, SWIFT_PATH), "utf8"));
    const android = extractAndroidPackageKeys((0, fs_1.readFileSync)((0, path_1.join)(repoRoot, KOTLIN_PATH), "utf8"));
    for (const [platform, path, packages] of [
        ["iOS", SWIFT_PATH, ios],
        ["Android", KOTLIN_PATH, android],
    ]) {
        if (packages.size === 0) {
            errors.push(`${platform} ${path}: no device-function packages found — the extractor is stale`);
        }
        for (const [packageName, keys] of packages) {
            if (!(0, declared_keys_1.isDeclaredPackage)(packageName)) {
                errors.push(`${platform} emits "${packageName}", which no DeviceFunctionPackage type declares — ` +
                    `add the interface and its entry in declared-keys.ts`);
                continue;
            }
            const declared = declared_keys_1.DECLARED_PACKAGE_FIELDS[packageName];
            if (keys.size === 0) {
                errors.push(`${platform} ${packageName} has no keys — the extractor is stale`);
            }
            for (const key of sorted(keys)) {
                if (!(key in declared)) {
                    errors.push(`${platform} emits ${packageName}.${key}, which the declared type does not have — ` +
                        `JS drops it. Use a declared key from declared-keys.ts (${path}).`);
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
            errors.push(`${packageName} differs between platforms — iOS only: [${onlyIos.join(", ")}], ` +
                `Android only: [${onlyAndroid.join(", ")}]. One spelling per field, on both platforms.`);
        }
    }
    return errors;
}
//# sourceMappingURL=verify-device-function-keys.js.map