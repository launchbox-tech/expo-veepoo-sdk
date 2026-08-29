"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXPECTED_IDENTITY_EMISSION_COUNT = exports.EXPECTED_EMISSION_COUNT = void 0;
exports.extractDeviceReadyEmissions = extractDeviceReadyEmissions;
exports.verifyDeviceReadyIdentityContract = verifyDeviceReadyIdentityContract;
exports.verifyEmissions = verifyEmissions;
const fs_1 = require("fs");
const path_1 = require("path");
const native_source_1 = require("./native-source");
/**
 * The iOS files that emit `DEVICE_READY`. Both are parsed: #218's regression
 * reached JS from one of them, but the other publishes the same field from the
 * `verifyPassword` export the app happens not to call today.
 */
const EMITTING_SOURCES = [
    native_source_1.NATIVE_SOURCES.iosConnect,
    native_source_1.NATIVE_SOURCES.iosConnectionHelpers,
];
/**
 * Every `DEVICE_READY` emission in the sources above, including the simulator
 * stubs. A drop below this means an emission site was renamed or removed and
 * the check is no longer reading what it thinks it is.
 */
exports.EXPECTED_EMISSION_COUNT = 4;
/** How many of those emissions publish device identity (`mac`). */
exports.EXPECTED_IDENTITY_EMISSION_COUNT = 2;
/**
 * Pulls each `sendEvent(DEVICE_READY, [...])` dictionary literal out of a Swift
 * source. Bracket-balanced from the `[` that opens the payload so a nested
 * literal (`"data": [...]`) cannot end the span early.
 */
function extractDeviceReadyEmissions(source, file) {
    const emissions = [];
    const call = /sendEvent\(\s*DEVICE_READY\s*,\s*\[/g;
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
    const emissions = EMITTING_SOURCES.flatMap((file) => extractDeviceReadyEmissions((0, fs_1.readFileSync)((0, path_1.join)(repoRoot, file), "utf8"), file));
    return [...verifyEmissions(emissions), ...verifyIdentityHelper(repoRoot)];
}
/** The payload half of the contract, over already-parsed emissions. */
function verifyEmissions(emissions) {
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
            else if (!/\bidentity\b/.test(value)) {
                errors.push(`${at}: "${field}" is assigned \`${value}\` — expected a VeepooDeviceIdentity-derived value`);
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