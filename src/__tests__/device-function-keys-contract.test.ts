import { readFileSync } from "fs";
import { join } from "path";

import { NATIVE_SOURCES } from "@/bridge-contract/native-source";
import {
  extractCacheReads,
  extractIosPackageKeys,
  verifyAndroidPackageEmitter,
  verifyCacheReads,
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

// A guard reading a key its platform never writes gets null forever, so its
// answer cannot depend on the band. That was `pkg1`/`weatherFunction` and
// `pkg3`/`contactFunction` — fail-open for weather and contacts, fail-CLOSED
// for the SOS checks, which rejected every call.
describe("native code only reads device-function keys its platform writes", () => {
  const emitted = { android: androidKeys, ios: iosKeys };

  it("passes on the shipped sources", () => {
    expect(verifyCacheReads(repoRoot, emitted)).toEqual([]);
  });

  // Guards the sweep itself: finding nothing would make the check above pass
  // vacuously, which is the failure mode it exists to prevent.
  it("finds the guards it is meant to be watching", () => {
    const contacts = extractCacheReads(
      "VeepooSDKModuleContacts.kt",
      readFileSync(
        join(repoRoot, "android/src/main/kotlin/expo/modules/veepoo/VeepooSDKModuleContacts.kt"),
        "utf8",
      ),
    );
    expect(contacts.length).toBeGreaterThan(0);
    expect(new Set(contacts.map((read) => `${read.packageName}.${read.key}`))).toEqual(
      new Set(["package3.contact_function", "package3.contact_type"]),
    );
  });

  it.each([
    [
      "a package no writer emits",
      'val pkg = module.cachedDeviceFunctions["pkg3"]\nval x = pkg?.get("contact_function")',
      /cachedDeviceFunctions\["pkg3"\], which nothing writes/,
    ],
    [
      "a key the platform does not emit",
      'val pkg = module.cachedDeviceFunctions["package1"]\nval x = pkg?.get("textAlarm")',
      /reads package1\.textAlarm, which this platform does not emit/,
    ],
  ])("reports %s", (_label, source, expected) => {
    const reads = extractCacheReads("Fake.kt", source);
    const errors = reads.flatMap(({ file, packageName, key }) => {
      const keys = androidKeys.get(packageName);
      if (!keys) {
        return [
          `${file} reads cachedDeviceFunctions["${packageName}"], which nothing writes — ` +
            `the emitter writes [${[...androidKeys.keys()].sort().join(", ")}]`,
        ];
      }
      return keys.has(key)
        ? []
        : [`${file} reads ${packageName}.${key}, which this platform does not emit`];
    });
    expect(errors.join("\n")).toMatch(expected);
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
