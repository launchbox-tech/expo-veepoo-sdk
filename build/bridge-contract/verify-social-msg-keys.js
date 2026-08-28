"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractIosSocialMsgKeys = extractIosSocialMsgKeys;
exports.extractAndroidSocialMsgKeys = extractAndroidSocialMsgKeys;
exports.verifySocialMsgKeysContract = verifySocialMsgKeysContract;
const fs_1 = require("fs");
const path_1 = require("path");
const social_msg_1 = require("../capabilities/social-msg");
const native_source_1 = require("./native-source");
const SWIFT_PATH = native_source_1.NATIVE_SOURCES.iosReadHelpers;
const KOTLIN_PATH = native_source_1.NATIVE_SOURCES.androidSocialMsgRead;
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
/** Android builds the same channels in one `mapOf(...)`. */
function extractAndroidSocialMsgKeys(source) {
    const body = (0, native_source_1.sliceBody)(source, "val result = mapOf(", "module.sendEvent(", "Android readSocialMsgData");
    return [...body.matchAll(/"([^"]+)"\s+to\b/g)].map((match) => match[1]);
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
    const sources = [
        ["iOS seed", SWIFT_PATH, ios.seeded],
        ["iOS ANCS decode", SWIFT_PATH, ios.assigned],
        [
            "Android",
            KOTLIN_PATH,
            extractAndroidSocialMsgKeys((0, fs_1.readFileSync)((0, path_1.join)(repoRoot, KOTLIN_PATH), "utf8")),
        ],
    ];
    for (const [platform, path, keys] of sources) {
        const missing = expected.filter((key) => !keys.includes(key));
        const extra = [...keys].sort().filter((key) => !expected.includes(key));
        if (missing.length || extra.length) {
            errors.push(`${platform} social-message channels disagree with SOCIAL_MSG_CHANNELS — ` +
                `missing: [${missing.join(", ")}], unexpected: [${extra.join(", ")}] (${path})`);
        }
    }
    return errors;
}
//# sourceMappingURL=verify-social-msg-keys.js.map