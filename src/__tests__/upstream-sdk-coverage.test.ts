import { join } from "path";
import {
  verifyUpstreamSdkCoverage,
  type CoverageDoc,
} from "@/bridge-contract/verify-upstream-sdk-coverage";
import { NATIVE_EMITTED_EVENTS } from "@/bridge/veepoo-events-registry";

const repoRoot = join(__dirname, "..", "..");

describe("upstream SDK coverage contract", () => {
  it("all NATIVE_EMITTED_EVENTS are documented in sdk-callback-coverage.json", () => {
    const errors = verifyUpstreamSdkCoverage(repoRoot);
    expect(errors).toEqual([]);
  });

  it("coverage doc has no stale events absent from NATIVE_EMITTED_EVENTS", () => {
    const coverageDoc = require("../../docs/vendor-sdk-snapshot/sdk-callback-coverage.json") as CoverageDoc;
    const registered = new Set<string>(NATIVE_EMITTED_EVENTS);
    const stale = Object.keys(coverageDoc.events).filter((e) => !registered.has(e));
    expect(stale).toEqual([]);
  });

  it("coverage doc SHA pins match vendor-manifest.json", () => {
    const coverageDoc = require("../../docs/vendor-sdk-snapshot/sdk-callback-coverage.json") as CoverageDoc;
    const manifest = require("../../vendor-manifest.json");
    expect(coverageDoc.androidSdkSha).toBe(
      manifest.upstreamReference.androidBleSdk.lastReviewedHeadSha,
    );
    expect(coverageDoc.iosSdkSha).toBe(
      manifest.upstreamReference.iosBleSdk.lastReviewedHeadSha,
    );
  });

  it("every bridged event has both android and ios coverage entries", () => {
    const coverageDoc = require("../../docs/vendor-sdk-snapshot/sdk-callback-coverage.json") as CoverageDoc;
    const missingAndroid: string[] = [];
    const missingIos: string[] = [];
    for (const [event, entry] of Object.entries(coverageDoc.events)) {
      if (!entry.android?.via) missingAndroid.push(event);
      if (!entry.ios?.via)    missingIos.push(event);
    }
    expect(missingAndroid).toEqual([]);
    expect(missingIos).toEqual([]);
  });

  it("notBridged entries have non-empty reason fields", () => {
    const coverageDoc = require("../../docs/vendor-sdk-snapshot/sdk-callback-coverage.json") as CoverageDoc;
    const missing: string[] = [];
    for (const entry of coverageDoc.notBridged.android) {
      if (!entry.reason?.trim()) missing.push(`android:${entry.interface}`);
    }
    for (const entry of coverageDoc.notBridged.ios) {
      if (!entry.reason?.trim()) missing.push(`ios:${entry.method}`);
    }
    expect(missing).toEqual([]);
  });
});

// Unit tests for the verifier logic with synthetic data

describe("verifyUpstreamSdkCoverage edge cases", () => {
  const tmpFs: Record<string, string> = {};
  const origExistsSync = require("fs").existsSync;
  const origReadFileSync = require("fs").readFileSync;

  function withMockedFs(files: Record<string, string>, fn: () => void): void {
    const { existsSync, readFileSync } = require("fs") as typeof import("fs");
    jest.spyOn(require("fs"), "existsSync").mockImplementation((p) =>
      p.toString() in files ? true : origExistsSync(p),
    );
    jest.spyOn(require("fs"), "readFileSync").mockImplementation((p, ...args) =>
      p.toString() in files ? files[p.toString()] : origReadFileSync(p, ...args),
    );
    try { fn(); } finally { jest.restoreAllMocks(); }
  }

  it("reports orphaned TS events missing from coverage doc", () => {
    const doc: CoverageDoc = {
      schemaVersion: 1,
      androidSdkSha: "abc",
      iosSdkSha: "def",
      events: {},
      notBridged: { android: [], ios: [] },
    };
    const fakeManifest = {
      upstreamReference: {
        androidBleSdk: { lastReviewedHeadSha: "abc" },
        iosBleSdk: { lastReviewedHeadSha: "def" },
      },
    };
    const files: Record<string, string> = {
      [join(repoRoot, "docs/vendor-sdk-snapshot/sdk-callback-coverage.json")]:
        JSON.stringify(doc),
      [join(repoRoot, "vendor-manifest.json")]: JSON.stringify(fakeManifest),
    };
    let errors: string[] = [];
    withMockedFs(files, () => {
      errors = verifyUpstreamSdkCoverage(repoRoot);
    });
    // Every NATIVE_EMITTED_EVENTS entry should be flagged (no SHA drift errors)
    expect(errors.length).toBe(NATIVE_EMITTED_EVENTS.length);
    expect(errors[0]).toMatch(/missing from sdk-callback-coverage\.json/);
  });

  it("reports stale coverage doc entry absent from NATIVE_EMITTED_EVENTS", () => {
    const doc: CoverageDoc = {
      schemaVersion: 1,
      androidSdkSha: "abc",
      iosSdkSha: "def",
      events: {
        // Valid entries for all current events
        ...Object.fromEntries(
          NATIVE_EMITTED_EVENTS.map((e) => [
            e,
            { android: { via: "android stub" }, ios: { via: "ios stub" } },
          ]),
        ),
        // Stale entry that no longer exists in the registry
        nonExistentEvent: {
          android: { via: "old android callback" },
          ios: { via: "old ios callback" },
        },
      },
      notBridged: { android: [], ios: [] },
    };
    const fakeManifest = {
      upstreamReference: {
        androidBleSdk: { lastReviewedHeadSha: "abc" },
        iosBleSdk: { lastReviewedHeadSha: "def" },
      },
    };
    const files: Record<string, string> = {
      [join(repoRoot, "docs/vendor-sdk-snapshot/sdk-callback-coverage.json")]:
        JSON.stringify(doc),
      [join(repoRoot, "vendor-manifest.json")]: JSON.stringify(fakeManifest),
    };
    let errors: string[] = [];
    withMockedFs(files, () => {
      errors = verifyUpstreamSdkCoverage(repoRoot);
    });
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatch(/stale/);
  });
});
