import { readFileSync } from "fs";
import { join } from "path";

import { NATIVE_SOURCES } from "@/bridge-contract/native-source";
import {
  extractIosPackageKeys,
  verifyAndroidPackageEmitter,
  verifyDeviceFunctionKeysContract,
} from "@/bridge-contract/verify-device-function-keys";
import { DECLARED_PACKAGE_FIELDS } from "@/capabilities/device-functions/declared-keys";
import {
  loadEmittedPackageKeys,
  REPO_ROOT as repoRoot,
} from "./helpers/emitted-device-function-keys";
import goldenPayloads from "./fixtures/device-function-payloads.golden.json";

const { ios: iosKeys, android: androidKeys } = loadEmittedPackageKeys(repoRoot);

// The packages moved into VeepooFunctionStatus.kt so the executable check can
// compile and RUN them (#212's follow-up). The keys above are therefore read
// from the mapper, not from the helper that caches them — so the helper needs
// its own guard, or it could go back to building a map of its own with the
// mapper sitting correct and untouched beside it.
describe("the Android helper caches what the mapper built", () => {
  const emitterSource = readFileSync(join(repoRoot, NATIVE_SOURCES.androidHelpers), "utf8");

  it("passes on the shipped helper", () => {
    expect(verifyAndroidPackageEmitter(emitterSource)).toEqual([]);
  });

  it.each([
    [
      "a helper that builds its own map",
      "cachedDeviceFunctions.putAll(deviceFunctionPackages(data))",
      'cachedDeviceFunctions["package1"] = mapOf("blood_pressure" to "unsupported")',
      /must fill the cache from deviceFunctionPackages\(data\)/,
    ],
    [
      "a helper that names a key itself",
      "cachedDeviceFunctions.putAll(deviceFunctionPackages(data))",
      "cachedDeviceFunctions.putAll(deviceFunctionPackages(data) + mapOf(\"package4\" to mapOf(\"ecg_function\" to \"open\")))",
      /names the keys \[package4, ecg_function\] itself/,
    ],
    [
      "a helper that stops calling the mapper at all",
      "cachedDeviceFunctions.putAll(deviceFunctionPackages(data))",
      "cachedDeviceFunctions.clear()",
      /must fill the cache from deviceFunctionPackages\(data\)/,
    ],
  ])("reports %s", (_label, from, to, expected) => {
    expect(verifyAndroidPackageEmitter(emitterSource.replace(from, to)).join("\n")).toMatch(
      expected,
    );
  });
});

describe("device-function key contract", () => {
  it("every key both platforms emit is a declared package field", () => {
    expect(verifyDeviceFunctionKeysContract(repoRoot)).toEqual([]);
  });

  // The extractors are the evidence the rest of the suite rests on: if they
  // silently matched nothing, the contract check above would pass vacuously —
  // which is the exact failure mode (#210) this file exists to prevent.
  it("finds all three packages on both platforms", () => {
    expect([...iosKeys.keys()].sort()).toEqual(["package1", "package2", "package3"]);
    expect([...androidKeys.keys()].sort()).toEqual(["package1", "package2", "package3"]);
  });

  it("iOS and Android spell every field identically", () => {
    for (const name of ["package1", "package2", "package3"]) {
      expect([...(iosKeys.get(name) ?? [])].sort()).toEqual(
        [...(androidKeys.get(name) ?? [])].sort(),
      );
    }
  });

  it("rejects a native key the declared type does not have", () => {
    const drifted = extractIosPackageKeys(`
      func cacheDeviceFunctions() {
        let package1: [String: Any] = [
          "type": "DeviceFunctionPackage1",
          "bloodPressure": "support"
        ]
        cachedDeviceFunctions = [
      `);
    const declared = DECLARED_PACKAGE_FIELDS.package1;
    expect([...(drifted.get("package1") ?? [])]).toEqual(["bloodPressure"]);
    expect("bloodPressure" in declared).toBe(false);
    expect("blood_pressure" in declared).toBe(true);
  });

  // The golden fixture is what the normalizer tests are fed, so it has to stay
  // the shape native emits — otherwise those tests prove the normalizer against
  // input no band ever sends, which is how #210 stayed green.
  it("the golden fixture carries exactly the keys each platform emits", () => {
    for (const [platform, emitted] of [
      ["ios", iosKeys],
      ["android", androidKeys],
    ] as const) {
      const payload = goldenPayloads[platform] as Record<string, Record<string, unknown>>;
      for (const [name, keys] of emitted) {
        const inFixture = Object.keys(payload[name] ?? {}).filter((key) => key !== "type");
        expect(inFixture.sort()).toEqual([...keys].sort());
      }
    }
  });

  it("reads the retention window Swift assigns after the literal", () => {
    expect(iosKeys.get("package2")?.has("watch_data_day_number")).toBe(true);
    expect(androidKeys.get("package2")?.has("watch_data_day_number")).toBe(true);
  });
});
