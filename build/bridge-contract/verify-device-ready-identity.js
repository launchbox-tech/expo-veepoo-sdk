"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXPECTED_IDENTITY_EMISSION_COUNT = exports.EXPECTED_EMISSION_COUNT = void 0;
exports.findEmittingSources = findEmittingSources;
exports.extractDeviceReadyEmissions = extractDeviceReadyEmissions;
exports.verifyDeviceReadyIdentityContract = verifyDeviceReadyIdentityContract;
exports.verifyDeviceReadyPayloads = verifyDeviceReadyPayloads;
const fs_1 = require("fs");
const path_1 = require("path");
const native_source_1 = require("./native-source");
/**
 * Where the iOS module's Swift lives. Every file in it is scanned rather than
 * an allowlist of the two that emit `DEVICE_READY` today: "every mac-publishing
 * emission site is covered" (#218) has to hold for the third one somebody adds
 * next year, and an allowlist would let it through silently.
 */
const IOS_SOURCE_DIR = "ios/VeepooSDK";
/**
 * The emission call itself. Also the discovery filter, so a file is scanned iff
 * it really emits — VeepooSDK.swift names DEVICE_READY in its `Events(...)`
 * declaration list without emitting it, and a looser match would drag it in.
 */
const SEND_DEVICE_READY = /sendEvent\(\s*DEVICE_READY\s*,\s*\[/;
/** Repo-relative paths of the iOS sources that emit `DEVICE_READY`. */
function findEmittingSources(repoRoot) {
    return (0, fs_1.readdirSync)((0, path_1.join)(repoRoot, IOS_SOURCE_DIR))
        .filter((name) => name.endsWith(".swift"))
        .map((name) => `${IOS_SOURCE_DIR}/${name}`)
        .filter((path) => SEND_DEVICE_READY.test((0, fs_1.readFileSync)((0, path_1.join)(repoRoot, path), "utf8")))
        .sort();
}
/**
 * Every `DEVICE_READY` emission in the sources above, including the simulator
 * stubs. A drop below this means an emission site was renamed or removed and
 * the check is no longer reading what it thinks it is.
 */
exports.EXPECTED_EMISSION_COUNT = 4;
/** How many of those emissions publish device identity (`mac`). */
exports.EXPECTED_IDENTITY_EMISSION_COUNT = 2;
/**
 * What an accepted `mac`/`uuid` value looks like. Keyed on the type and its
 * payload accessors rather than on the local variable the emission sites happen
 * to bind — renaming `let identity` is not a contract breach and must not fail
 * CI with a message about UUIDs.
 */
const ROUTED_VALUE = /\b(?:VeepooDeviceIdentity|macPayload|uuidPayload)\b/;
/**
 * Pulls each `sendEvent(DEVICE_READY, [...])` dictionary literal out of a Swift
 * source. Bracket-balanced from the `[` that opens the payload so a nested
 * literal (`"data": [...]`) cannot end the span early.
 */
function extractDeviceReadyEmissions(source, file) {
    const emissions = [];
    const call = new RegExp(SEND_DEVICE_READY.source, "g");
    for (let match = call.exec(source); match; match = call.exec(source)) {
        const open = match.index + match[0].length - 1;
        let depth = 0;
        let close = -1;
        for (let i = open; i < source.length; i += 1) {
            const char = source[i];
            if (char === "[")
                depth += 1;
            else if (char === "]") {
                depth -= 1;
                if (depth === 0) {
                    close = i;
                    break;
                }
            }
        }
        if (close === -1) {
            throw new Error(`${file}: unterminated DEVICE_READY payload literal at offset ${match.index}`);
        }
        const body = source.slice(open + 1, close);
        const keys = new Map();
        for (const pair of body.matchAll(/"([A-Za-z0-9_]+)"\s*:\s*([^,\n]+)/g)) {
            const key = pair[1];
            const value = pair[2];
            if (key && value)
                keys.set(key, value.trim());
        }
        emissions.push({
            file,
            line: source.slice(0, match.index).split("\n").length,
            keys,
        });
    }
    return emissions;
}
/**
 * #218: `deviceAddress` holds the CBPeripheral UUID until password verification
 * settles it, so publishing it straight into a field named `mac` makes the
 * event lie roughly 40% of the time. Every identity-carrying emission must
 * route the address through `VeepooDeviceIdentity`, which sorts it into `mac`
 * or `uuid`, and must publish both fields so a consumer can tell them apart.
 */
function verifyDeviceReadyIdentityContract(repoRoot) {
    const emissions = findEmittingSources(repoRoot).flatMap((file) => extractDeviceReadyEmissions((0, fs_1.readFileSync)((0, path_1.join)(repoRoot, file), "utf8"), file));
    return [
        ...verifyDeviceReadyPayloads(emissions),
        ...verifyIdentityHelper(repoRoot),
        ...verifyJsPayloadType(repoRoot),
    ];
}
/**
 * The other half of "do not hand-copy the payload shape" (#218): the Swift
 * emits an explicit null for an unknown identity, so the TS type has to admit
 * one. A `mac?: string` that silently drops `| null` is how the JS boundary
 * drifts back out of step with the emission.
 */
function verifyJsPayloadType(repoRoot) {
    const path = "src/types/events.ts";
    const source = (0, fs_1.readFileSync)((0, path_1.join)(repoRoot, path), "utf8");
    const block = /device_ready:\s*\{([^}]*)\}/.exec(source)?.[1];
    if (block === undefined) {
        return [`${path}: no device_ready payload type found — this check cannot see what JS declares`];
    }
    const errors = [];
    for (const field of ["mac", "uuid"]) {
        const declared = new RegExp(`\\b${field}\\?:([^;]*);`).exec(block)?.[1]?.trim();
        if (declared === undefined) {
            errors.push(`${path}: device_ready declares no optional \`${field}\`, but the Swift emission publishes it`);
        }
        else if (!/\bnull\b/.test(declared)) {
            errors.push(`${path}: device_ready declares \`${field}?: ${declared}\` — the Swift publishes NSNull for an ` +
                "unknown identity, so the type must admit null");
        }
    }
    return errors;
}
/** The payload half of the contract, over already-parsed emissions. */
function verifyDeviceReadyPayloads(emissions) {
    const errors = [];
    if (emissions.length < exports.EXPECTED_EMISSION_COUNT) {
        errors.push(`found ${emissions.length} DEVICE_READY emissions, expected at least ${exports.EXPECTED_EMISSION_COUNT} — ` +
            "an emission site moved out of the parsed files, so this check no longer covers it");
    }
    const identityEmissions = emissions.filter((e) => e.keys.has("mac"));
    if (identityEmissions.length < exports.EXPECTED_IDENTITY_EMISSION_COUNT) {
        errors.push(`found ${identityEmissions.length} DEVICE_READY emissions publishing "mac", expected at least ` +
            `${exports.EXPECTED_IDENTITY_EMISSION_COUNT} — every mac-publishing site must be covered, including the ` +
            "one the app does not reach today");
    }
    for (const emission of identityEmissions) {
        const at = `${emission.file}:${emission.line}`;
        for (const field of ["mac", "uuid"]) {
            const value = emission.keys.get(field);
            if (value === undefined) {
                errors.push(`${at}: DEVICE_READY publishes "mac" without "uuid" — an unsettled address has nowhere honest to go`);
                continue;
            }
            if (/deviceAddress/.test(value)) {
                errors.push(`${at}: "${field}" is assigned \`${value}\` — the raw deviceAddress is a CBPeripheral UUID until ` +
                    "verification settles it (#218); route it through VeepooDeviceIdentity");
            }
            else if (!ROUTED_VALUE.test(value)) {
                errors.push(`${at}: "${field}" is assigned \`${value}\` — expected a VeepooDeviceIdentity-derived value ` +
                    "(one of its payload accessors)");
            }
        }
    }
    return errors;
}
/**
 * The helper itself has one property worth fencing: it must decide on the
 * *shape* of the address. Device traces contain readies whose `deviceId` is
 * itself the hardware MAC, so a `mac == deviceId` rule would null out good
 * values — the difference between the fix and a fresh regression.
 */
function verifyIdentityHelper(repoRoot) {
    const path = native_source_1.NATIVE_SOURCES.iosDeviceIdentity;
    let source;
    try {
        source = (0, fs_1.readFileSync)((0, path_1.join)(repoRoot, path), "utf8");
    }
    catch {
        return [`${path}: missing — DEVICE_READY has no identity helper to route through`];
    }
    const errors = [];
    if (!source.includes("UUID(uuidString:")) {
        errors.push(`${path}: no UUID(uuidString:) parse — the split must key on the address's UUID shape`);
    }
    if (/\bdeviceId\b/.test(source)) {
        errors.push(`${path}: mentions deviceId — the split must not compare the address against the scan id ` +
            "(traces contain readies where deviceId IS the hardware MAC)");
    }
    return errors;
}
//# sourceMappingURL=verify-device-ready-identity.js.map