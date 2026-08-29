#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Unified entrypoint for all bridge contract checks. Each verifier returns
 * `{ errors, summary }` (empty `errors` = pass). The runner prints results
 * and exits 1 if any verifier reports errors. Run a single check by passing
 * its name as the first arg: `run-contract-checks veepoo-events`.
 */
const path_1 = require("path");
const native_rejection_mapping_1 = require("../errors/native-rejection-mapping");
const event_registry_1 = require("../bridge/event-registry");
const social_msg_1 = require("../capabilities/social-msg");
const verify_device_function_keys_1 = require("./verify-device-function-keys");
const verify_device_ready_identity_1 = require("./verify-device-ready-identity");
const verify_native_rejection_contract_1 = require("./verify-native-rejection-contract");
const verify_social_msg_keys_1 = require("./verify-social-msg-keys");
const verify_upstream_sdk_coverage_1 = require("./verify-upstream-sdk-coverage");
const verify_veepoo_events_1 = require("./verify-veepoo-events");
const CHECKS = [
    {
        name: "veepoo-events",
        run: verify_veepoo_events_1.verifyVeepooEventsContract,
        onSuccess: () => `VeepooEvent bridge contract OK (${event_registry_1.NATIVE_EMITTED_EVENTS.length} native + ${event_registry_1.JS_LOCAL_ONLY_EVENTS.length} jsLocalOnly).`,
    },
    {
        name: "native-rejection",
        run: verify_native_rejection_contract_1.verifyNativeRejectionContract,
        onSuccess: () => `Native rejection bridge contract OK (${native_rejection_mapping_1.ALLOWED_NATIVE_REJECT_CODES.length} observed codes, ${Object.keys(native_rejection_mapping_1.NATIVE_REJECT_MAPPING).length} mapping entries).`,
    },
    {
        name: "device-function-keys",
        run: verify_device_function_keys_1.verifyDeviceFunctionKeysContract,
        onSuccess: () => "Device-function key contract OK — every native key is declared, and both platforms spell it the same.",
    },
    {
        name: "device-ready-identity",
        run: verify_device_ready_identity_1.verifyDeviceReadyIdentityContract,
        onSuccess: () => `device_ready identity contract OK (${verify_device_ready_identity_1.EXPECTED_IDENTITY_EMISSION_COUNT} iOS emissions split deviceAddress into mac/uuid).`,
    },
    {
        name: "social-msg-keys",
        run: verify_social_msg_keys_1.verifySocialMsgKeysContract,
        onSuccess: () => `Social-message key contract OK (${social_msg_1.SOCIAL_MSG_CHANNELS.length} channels agree across iOS, Android and JS).`,
    },
    {
        name: "upstream-sdk",
        run: verify_upstream_sdk_coverage_1.verifyUpstreamSdkCoverage,
        onSuccess: () => "upstream SDK coverage check passed — all NATIVE_EMITTED_EVENTS documented.",
    },
];
const repoRoot = (0, path_1.join)(__dirname, "..", "..");
const requested = process.argv[2];
const toRun = requested ? CHECKS.filter((c) => c.name === requested) : CHECKS;
if (requested && toRun.length === 0) {
    console.error(`Unknown check "${requested}". Available: ${CHECKS.map((c) => c.name).join(", ")}.`);
    process.exit(2);
}
let anyFailed = false;
for (const check of toRun) {
    // A verifier that parses native source throws when its markers go stale.
    // Reported as a named failure so the output says WHICH check broke.
    let errors;
    try {
        errors = check.run(repoRoot);
    }
    catch (error) {
        errors = [`check threw: ${error instanceof Error ? error.message : String(error)}`];
    }
    if (errors.length > 0) {
        console.error(`✗ ${check.name} check FAILED:`);
        for (const e of errors)
            console.error("  " + e);
        anyFailed = true;
    }
    else {
        console.log(check.onSuccess());
    }
}
process.exit(anyFailed ? 1 : 0);
//# sourceMappingURL=run-contract-checks.js.map