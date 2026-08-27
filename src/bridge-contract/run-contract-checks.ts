#!/usr/bin/env node
/**
 * Unified entrypoint for all bridge contract checks. Each verifier returns
 * `{ errors, summary }` (empty `errors` = pass). The runner prints results
 * and exits 1 if any verifier reports errors. Run a single check by passing
 * its name as the first arg: `run-contract-checks veepoo-events`.
 */
import { join } from "path";

import {
  ALLOWED_NATIVE_REJECT_CODES,
  NATIVE_REJECT_MAPPING,
} from "../errors/native-rejection-mapping";
import {
  JS_LOCAL_ONLY_EVENTS,
  NATIVE_EMITTED_EVENTS,
} from "../bridge/event-registry";
import { SOCIAL_MSG_CHANNELS } from "../capabilities/social-msg";

import { verifyDeviceFunctionKeysContract } from "./verify-device-function-keys";
import { verifyNativeRejectionContract } from "./verify-native-rejection-contract";
import { verifySocialMsgKeysContract } from "./verify-social-msg-keys";
import { verifyUpstreamSdkCoverage } from "./verify-upstream-sdk-coverage";
import { verifyVeepooEventsContract } from "./verify-veepoo-events";

type Check = {
  name: string;
  run: (repoRoot: string) => string[];
  onSuccess: () => string;
};

const CHECKS: Check[] = [
  {
    name: "veepoo-events",
    run: verifyVeepooEventsContract,
    onSuccess: () =>
      `VeepooEvent bridge contract OK (${NATIVE_EMITTED_EVENTS.length} native + ${JS_LOCAL_ONLY_EVENTS.length} jsLocalOnly).`,
  },
  {
    name: "native-rejection",
    run: verifyNativeRejectionContract,
    onSuccess: () =>
      `Native rejection bridge contract OK (${ALLOWED_NATIVE_REJECT_CODES.length} observed codes, ${Object.keys(NATIVE_REJECT_MAPPING).length} mapping entries).`,
  },
  {
    name: "device-function-keys",
    run: verifyDeviceFunctionKeysContract,
    onSuccess: () =>
      "Device-function key contract OK — every native key is declared, and both platforms spell it the same.",
  },
  {
    name: "social-msg-keys",
    run: verifySocialMsgKeysContract,
    onSuccess: () =>
      `Social-message key contract OK (${SOCIAL_MSG_CHANNELS.length} channels agree across iOS, Android and JS).`,
  },
  {
    name: "upstream-sdk",
    run: verifyUpstreamSdkCoverage,
    onSuccess: () =>
      "upstream SDK coverage check passed — all NATIVE_EMITTED_EVENTS documented.",
  },
];

const repoRoot = join(__dirname, "..", "..");
const requested = process.argv[2];
const toRun = requested ? CHECKS.filter((c) => c.name === requested) : CHECKS;

if (requested && toRun.length === 0) {
  console.error(
    `Unknown check "${requested}". Available: ${CHECKS.map((c) => c.name).join(", ")}.`,
  );
  process.exit(2);
}

let anyFailed = false;
for (const check of toRun) {
  // A verifier that parses native source throws when its markers go stale.
  // Reported as a named failure so the output says WHICH check broke.
  let errors: string[];
  try {
    errors = check.run(repoRoot);
  } catch (error) {
    errors = [`check threw: ${error instanceof Error ? error.message : String(error)}`];
  }
  if (errors.length > 0) {
    console.error(`✗ ${check.name} check FAILED:`);
    for (const e of errors) console.error("  " + e);
    anyFailed = true;
  } else {
    console.log(check.onSuccess());
  }
}

process.exit(anyFailed ? 1 : 0);
