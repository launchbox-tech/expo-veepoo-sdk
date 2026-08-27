import {
  extractIosPackageKeys,
  verifyDeviceFunctionKeysContract,
} from "@/bridge-contract/verify-device-function-keys";
import { DECLARED_PACKAGE_FIELDS } from "@/capabilities/device-functions/declared-keys";
import {
  loadEmittedPackageKeys,
  REPO_ROOT as repoRoot,
} from "./helpers/emitted-device-function-keys";
import goldenPayloads from "./fixtures/device-function-payloads.golden.json";

const { ios: iosKeys, android: androidKeys } = loadEmittedPackageKeys(repoRoot);

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
