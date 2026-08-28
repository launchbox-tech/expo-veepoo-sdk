"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialMsgCapability = exports.SOCIAL_MSG_CHANNELS = void 0;
exports.normalizeSocialMsgData = normalizeSocialMsgData;
const deep_keys_1 = require("../shared/deep-keys");
const primitives_1 = require("../shared/primitives");
// ── Normalizers ─────────────────────────────────────────────────────────────
/**
 * The social-message channels this module bridges. The vendor reports 26; these
 * 13 are the ones both native emitters produce, and a contract check holds the
 * three lists in agreement.
 */
exports.SOCIAL_MSG_CHANNELS = [
    "phone",
    "sms",
    "wechat",
    "qq",
    "facebook",
    "twitter",
    "instagram",
    "linkedin",
    "whatsapp",
    "line",
    "skype",
    "email",
    "other",
];
function normalizeSocialMsgData(value) {
    const record = typeof value === "object" && value !== null ? value : {};
    return Object.fromEntries(exports.SOCIAL_MSG_CHANNELS.map((key) => [key, (0, primitives_1.normalizeFunctionStatus)(record[key])]));
}
// ── Validators ──────────────────────────────────────────────────────────────
const VALID_FUNCTION_STATUSES = new Set([
    "unsupported",
    "support",
    "open",
    "close",
    "unknown",
]);
function validateSocialMsgData(data) {
    const keys = Object.keys(data);
    if (keys.length === 0) {
        throw { code: "INVALID_ARGUMENT", message: "data must contain at least one channel" };
    }
    for (const key of keys) {
        const value = data[key];
        if (!VALID_FUNCTION_STATUSES.has(value)) {
            throw { code: "INVALID_ARGUMENT", message: `${key} must be a valid FunctionStatus` };
        }
    }
}
// ── Capability ──────────────────────────────────────────────────────────────
class SocialMsgCapability {
    constructor(ctx) {
        this.ctx = ctx;
    }
    readSocialMsgData() {
        return this.ctx.invoke({
            invoke: () => this.ctx.native.readSocialMsgData(),
            normalize: normalizeSocialMsgData,
            afterSuccess: (result) => {
                this.ctx.log("debug", "device", "device.social.read", "Social message settings received", {
                    data: result,
                });
            },
        });
    }
    writeSocialMsgData(data) {
        return this.ctx.invoke({
            validate: () => validateSocialMsgData(data),
            invoke: () => this.ctx.native.writeSocialMsgData((0, deep_keys_1.deepCamelKeys)(data)),
        });
    }
}
exports.SocialMsgCapability = SocialMsgCapability;
//# sourceMappingURL=social-msg.js.map