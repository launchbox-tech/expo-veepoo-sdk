import { readFileSync } from "fs";
import { join } from "path";

import { NATIVE_SOURCES } from "@/bridge-contract/native-source";
import {
  EXPECTED_EMISSION_COUNT,
  EXPECTED_IDENTITY_EMISSION_COUNT,
  extractDeviceReadyEmissions,
  verifyDeviceReadyIdentityContract,
  verifyEmissions,
} from "@/bridge-contract/verify-device-ready-identity";
import { REPO_ROOT as repoRoot } from "./helpers/emitted-device-function-keys";

const read = (path: string) => readFileSync(join(repoRoot, path), "utf8");
const connect = read(NATIVE_SOURCES.iosConnect);
const helpers = read(NATIVE_SOURCES.iosConnectionHelpers);
const emissions = [
  ...extractDeviceReadyEmissions(connect, NATIVE_SOURCES.iosConnect),
  ...extractDeviceReadyEmissions(helpers, NATIVE_SOURCES.iosConnectionHelpers),
];

describe("device_ready identity contract (#218)", () => {
  it("no DEVICE_READY emission publishes the raw deviceAddress as `mac`", () => {
    expect(verifyDeviceReadyIdentityContract(repoRoot)).toEqual([]);
  });

  // Guards the extractor: a regex that silently matched nothing would make the
  // check above pass vacuously, which is the failure mode these checks exist
  // to prevent.
  it("finds every DEVICE_READY emission, simulator stubs included", () => {
    expect(emissions.length).toBeGreaterThanOrEqual(EXPECTED_EMISSION_COUNT);
    expect(emissions.every((e) => e.keys.has("deviceId"))).toBe(true);
  });

  it("finds both identity-carrying emissions, including the one the app never calls", () => {
    const identity = emissions.filter((e) => e.keys.has("mac"));
    expect(identity.length).toBeGreaterThanOrEqual(EXPECTED_IDENTITY_EMISSION_COUNT);
    // The `verifyPassword` JS export's site is in Connect.swift; the auto-verify
    // path the app actually hits is in ConnectionHelpers.swift. Both, or the
    // trap survives in whichever one is missed.
    expect(new Set(identity.map((e) => e.file))).toEqual(
      new Set([NATIVE_SOURCES.iosConnect, NATIVE_SOURCES.iosConnectionHelpers]),
    );
  });

  it("every identity emission carries `uuid` alongside `mac`", () => {
    for (const emission of emissions.filter((e) => e.keys.has("mac"))) {
      expect(emission.keys.has("uuid")).toBe(true);
    }
  });

  // The simulator stubs skip the vendor entirely, so they have no address to
  // split — absent is the honest shape there, not an empty string.
  it("leaves the simulator stubs without identity fields", () => {
    const stubs = emissions.filter((e) => !e.keys.has("mac"));
    expect(stubs.length).toBeGreaterThan(0);
    for (const stub of stubs) expect(stub.keys.has("uuid")).toBe(false);
  });

  // Nothing above demonstrates the check CAN fail — a verifier that only ever
  // sees compliant sources proves nothing about what it does when one drifts.
  it("rejects an emission that reverts to the raw deviceAddress", () => {
    const reverted = extractDeviceReadyEmissions(
      helpers.replace(
        '"mac": identity.macPayload',
        '"mac": manager.peripheralModel?.deviceAddress ?? ""',
      ),
      NATIVE_SOURCES.iosConnectionHelpers,
    );
    expect(verifyEmissions(reverted).join("\n")).toMatch(/raw deviceAddress/);
  });

  it("rejects an emission that publishes `mac` with no `uuid` to fall back to", () => {
    const macOnly = extractDeviceReadyEmissions(
      helpers.replace('"uuid": identity.uuidPayload,\n', ""),
      NATIVE_SOURCES.iosConnectionHelpers,
    );
    expect(verifyEmissions(macOnly).join("\n")).toMatch(/without "uuid"/);
  });

  it("the identity split keys on UUID shape, not on equality with the scan id", () => {
    const source = read(NATIVE_SOURCES.iosDeviceIdentity);
    expect(source).toContain("UUID(uuidString:");
    expect(source).not.toMatch(/\bdeviceId\b/);
  });
});
