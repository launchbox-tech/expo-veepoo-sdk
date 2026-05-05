#!/usr/bin/env node
import { join } from "path";
import { verifyUpstreamSdkCoverage } from "./verify-upstream-sdk-coverage";

const repoRoot = join(__dirname, "..", "..");
const errors = verifyUpstreamSdkCoverage(repoRoot);

if (errors.length > 0) {
  console.error("upstream SDK coverage check FAILED:\n");
  for (const e of errors) {
    console.error("  ✗ " + e);
  }
  process.exit(1);
}

console.log("upstream SDK coverage check passed — all NATIVE_EMITTED_EVENTS documented.");
process.exit(0);
