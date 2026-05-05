import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { NATIVE_EMITTED_EVENTS } from "../bridge/veepoo-events-registry";

export type CoverageDoc = {
  schemaVersion: number;
  androidSdkSha: string;
  iosSdkSha: string;
  events: Record<string, { android: { via: string }; ios: { via: string } }>;
  notBridged: {
    android: Array<{ interface: string; reason: string }>;
    ios: Array<{ method: string; reason: string }>;
  };
};

function loadCoverageDoc(repoRoot: string): CoverageDoc {
  const path = join(repoRoot, "docs/vendor-sdk-snapshot/sdk-callback-coverage.json");
  if (!existsSync(path)) {
    throw new Error(`sdk-callback-coverage.json not found at ${path}`);
  }
  return JSON.parse(readFileSync(path, "utf8")) as CoverageDoc;
}

/**
 * Checks that coverage doc SHAs match vendor-manifest.json pins.
 * Mismatches signal a stale document after a vendor bump.
 */
function checkShaDrift(repoRoot: string, doc: CoverageDoc): string[] {
  const manifestPath = join(repoRoot, "vendor-manifest.json");
  if (!existsSync(manifestPath)) return [];

  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const errors: string[] = [];

  const androidPin: string = manifest?.upstreamReference?.androidBleSdk?.lastReviewedHeadSha ?? "";
  const iosPin: string = manifest?.upstreamReference?.iosBleSdk?.lastReviewedHeadSha ?? "";

  if (androidPin && doc.androidSdkSha !== androidPin) {
    errors.push(
      `sdk-callback-coverage.json androidSdkSha "${doc.androidSdkSha}" ` +
      `does not match vendor-manifest.json lastReviewedHeadSha "${androidPin}" — ` +
      `update the coverage doc after reviewing the new Android SDK version`,
    );
  }
  if (iosPin && doc.iosSdkSha !== iosPin) {
    errors.push(
      `sdk-callback-coverage.json iosSdkSha "${doc.iosSdkSha}" ` +
      `does not match vendor-manifest.json lastReviewedHeadSha "${iosPin}" — ` +
      `update the coverage doc after reviewing the new iOS SDK version`,
    );
  }
  return errors;
}

/**
 * Every event in NATIVE_EMITTED_EVENTS must appear in the coverage doc's `events` map.
 * Orphaned events (in TS but not in coverage doc) indicate either:
 *   - A new TS event that hasn't been documented yet, OR
 *   - An event that was removed from the native SDK
 */
function checkOrphanedTsEvents(doc: CoverageDoc): string[] {
  const documented = new Set(Object.keys(doc.events));
  const errors: string[] = [];
  for (const event of NATIVE_EMITTED_EVENTS) {
    if (!documented.has(event)) {
      errors.push(
        `Native event "${event}" is in NATIVE_EMITTED_EVENTS but missing from ` +
        `sdk-callback-coverage.json — add an android + ios entry documenting its upstream source`,
      );
    }
  }
  return errors;
}

/**
 * Every event documented in the coverage doc must still be in NATIVE_EMITTED_EVENTS.
 * Stale entries indicate events that were removed from the TS registry but not cleaned up.
 */
function checkStaleDocEntries(doc: CoverageDoc): string[] {
  const registered = new Set<string>(NATIVE_EMITTED_EVENTS);
  const errors: string[] = [];
  for (const event of Object.keys(doc.events)) {
    if (!registered.has(event)) {
      errors.push(
        `sdk-callback-coverage.json has entry for "${event}" but it is not in NATIVE_EMITTED_EVENTS — ` +
        `remove the stale entry or add the event back to the registry`,
      );
    }
  }
  return errors;
}

/**
 * Validates the vendor SDK snapshot files when present in vendor-sdk-snapshots/.
 * When the snapshots directory is absent (local dev without running fetch-sdk-snapshots.sh),
 * this check is skipped (not an error).
 */
function checkSnapshotFiles(repoRoot: string, doc: CoverageDoc): string[] {
  const snapshotRoot = join(repoRoot, "vendor-sdk-snapshots");
  if (!existsSync(snapshotRoot)) return [];

  const errors: string[] = [];

  // iOS: verify the primary manager headers were fetched successfully
  const iosHeadersPath = join(
    snapshotRoot,
    "ios/iOS_sdk_source/Framework/2.2.XX.15/VeepooBleSDK.framework/Headers",
  );
  if (existsSync(iosHeadersPath)) {
    const requiredHeaders = [
      "VPPeripheralBaseManage.h",
      "VPPeripheralManage.h",
      "VPBleCentralManage.h",
    ];
    for (const h of requiredHeaders) {
      if (!existsSync(join(iosHeadersPath, h))) {
        errors.push(
          `iOS SDK snapshot is missing expected header ${h} — ` +
          `re-run scripts/fetch-sdk-snapshots.sh to refresh (sha ${doc.iosSdkSha})`,
        );
      }
    }
  }

  return errors;
}

export function verifyUpstreamSdkCoverage(repoRoot: string): string[] {
  const doc = loadCoverageDoc(repoRoot);
  return [
    ...checkShaDrift(repoRoot, doc),
    ...checkOrphanedTsEvents(doc),
    ...checkStaleDocEntries(doc),
    ...checkSnapshotFiles(repoRoot, doc),
  ];
}
