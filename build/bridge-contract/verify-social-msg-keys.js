"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractIosSocialMsgKeys = extractIosSocialMsgKeys;
exports.extractAndroidSocialMsgChannels = extractAndroidSocialMsgChannels;
exports.extractAndroidSocialMsgKeys = extractAndroidSocialMsgKeys;
exports.verifySocialMsgKeysContract = verifySocialMsgKeysContract;
const fs_1 = require("fs");
const path_1 = require("path");
const social_msg_1 = require("../capabilities/social-msg");
const native_source_1 = require("./native-source");
const SWIFT_PATH = native_source_1.NATIVE_SOURCES.iosReadHelpers;
const KOTLIN_PATH = native_source_1.NATIVE_SOURCES.androidFunctionStatus;
/**
 * iOS seeds every channel as "unsupported", then overwrites each from the ANCS
 * bytes. Both halves are extracted: a channel that is seeded but never assigned
 * reports a constant "unsupported" — the same silent-constant defect as #212,
 * just reached a different way.
 */
function extractIosSocialMsgKeys(source) {
    const body = (0, native_source_1.sliceBody)(source, "func parseSocialMsgData(", 
    // The function's own final `return result`, on its own line — NOT the
    // early `guard … else { return result }`, which precedes the assignments.
    "\n    return result\n", "iOS parseSocialMsgData");
    const seedLiteral = (0, native_source_1.sliceBody)(body, "var result:", "guard ancsData.count", "iOS seed literal");
    return {
        seeded: [...seedLiteral.matchAll(/"([^"]+)"\s*:/g)].map((match) => match[1]),
        assigned: [...body.matchAll(/\bresult\["([^"]+)"\]\s*=/g)].map((match) => match[1]),
    };
}
/**
 * Android builds the same channels in one `mapOf(...)`, each entry of the shape
 * `"key" to converter(data.field)`.
 *
 * The converter and field are captured, not just the key: #212 was a converter
 * that could not read the vendor's enum and answered a constant, so a check
 * that only collected keys would have watched it happen.
 */
function extractAndroidSocialMsgChannels(source) {
    const body = (0, native_source_1.sliceBody)(source, "fun socialMsgStatusMap(", "\n}", "Android socialMsgStatusMap");
    return [...body.matchAll(/"([^"]+)"\s+to\s+(\w+)\(\s*data\.(\w+)\s*\)/g)].map((match) => ({
        key: match[1],
        converter: match[2],
        field: match[3],
    }));
}
function extractAndroidSocialMsgKeys(source) {
    return extractAndroidSocialMsgChannels(source).map((channel) => channel.key);
}
/**
 * Fails when the social-message channel names drift between the two native
 * emitters and the JS list that reads them.
 *
 * Keys only. The platforms legitimately differ on VALUES — iOS decodes ANCS
 * bytes and never reports "support", while Android maps the vendor enum and
 * can report "support" or "unknown". All are valid `FunctionStatus`.
 *
 * The vendor struct carries 26 channels and both platforms bridge 13; that
 * asymmetry is deliberate scope, so the vendor is not part of the comparison.
 */
function verifySocialMsgKeysContract(repoRoot) {
    const errors = [];
    const expected = [...social_msg_1.SOCIAL_MSG_CHANNELS].sort();
    const ios = extractIosSocialMsgKeys((0, fs_1.readFileSync)((0, path_1.join)(repoRoot, SWIFT_PATH), "utf8"));
    const android = extractAndroidSocialMsgChannels((0, fs_1.readFileSync)((0, path_1.join)(repoRoot, KOTLIN_PATH), "utf8"));
    const sources = [
        ["iOS seed", SWIFT_PATH, ios.seeded],
        ["iOS ANCS decode", SWIFT_PATH, ios.assigned],
        ["Android", KOTLIN_PATH, android.map((channel) => channel.key)],
    ];
    for (const [platform, path, keys] of sources) {
        const missing = expected.filter((key) => !keys.includes(key));
        const extra = [...keys].sort().filter((key) => !expected.includes(key));
        if (missing.length || extra.length) {
            errors.push(`${platform} social-message channels disagree with SOCIAL_MSG_CHANNELS — ` +
                `missing: [${missing.join(", ")}], unexpected: [${extra.join(", ")}] (${path})`);
        }
    }
    // Every vendor field is an EFunctionStatus, so every channel must go through
    // the enum-aware converter — and through a field of its own. A literal, a
    // Boolean/Number/String converter, or two channels sharing one field all
    // produce a value that does not track what the band said, which is #212.
    const seenFields = new Map();
    for (const { key, converter, field } of android) {
        if (converter !== "toFunctionStatus") {
            errors.push(`Android reads ${key} through ${converter}(), not toFunctionStatus() — every ` +
                `FunctionSocailMsgData field is an EFunctionStatus, and a converter that cannot ` +
                `read the enum returns a constant (${KOTLIN_PATH})`);
        }
        const claimed = seenFields.get(field);
        if (claimed) {
            errors.push(`Android reads data.${field} for both ${claimed} and ${key} — one of them reports the ` +
                `wrong channel's setting (${KOTLIN_PATH})`);
        }
        else {
            seenFields.set(field, key);
        }
    }
    return errors;
}
//# sourceMappingURL=verify-social-msg-keys.js.map