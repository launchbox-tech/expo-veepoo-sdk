"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WatchFaceCapability = void 0;
exports.normalizeWatchFaceStyle = normalizeWatchFaceStyle;
const deep_keys_1 = require("../shared/deep-keys");
const assertions_1 = require("../shared/assertions");
const primitives_1 = require("../shared/primitives");
// ── Normalizers ─────────────────────────────────────────────────────────────
function normalizeWatchFaceStyle(value) {
    const record = (0, primitives_1.isRecord)(value) ? value : {};
    const raw = String((0, primitives_1.toStringValue)(record.dialType ?? record.dial_type, "default")).toLowerCase();
    const dial_type = raw === "market" || raw === "photo" ? raw : "default";
    const op = record.operationSuccess ?? record.operation_success;
    return {
        dial_type,
        screen_index: (0, primitives_1.toInt)(record.screenIndex ?? record.screen_index),
        ...(typeof op === "boolean" ? { operation_success: op } : {}),
    };
}
// ── Validators ──────────────────────────────────────────────────────────────
const WATCH_FACE_DIAL_TYPES = new Set(["default", "market", "photo"]);
function requireWatchFaceDialType(value, field) {
    if (typeof value !== "string" || !WATCH_FACE_DIAL_TYPES.has(value)) {
        throw { code: "INVALID_ARGUMENT", message: `${field} must be 'default', 'market', or 'photo'` };
    }
}
/** Optional filter for read; native may still return a unified snapshot (Android). */
function validateReadWatchFaceStyleOptions(options) {
    if (options?.dial_type !== undefined) {
        requireWatchFaceDialType(options.dial_type, "dialType");
    }
}
/** Vendor slot index; cap loosely — some Bands expose large enumerations. */
function validateWatchFaceStyleSettings(s) {
    (0, assertions_1.requireInRange)(s.screen_index, "screenIndex", 0, 65535);
    if (s.dial_type !== undefined) {
        requireWatchFaceDialType(s.dial_type, "dialType");
    }
}
// ── Capability ──────────────────────────────────────────────────────────────
class WatchFaceCapability {
    constructor(ctx) {
        this.ctx = ctx;
    }
    readWatchFaceStyle(options) {
        return this.ctx.invoke({
            validate: () => validateReadWatchFaceStyleOptions(options),
            invoke: () => this.ctx.native.readWatchFaceStyle(options?.dial_type != null ? { dialType: options.dial_type } : null),
            normalize: normalizeWatchFaceStyle,
        });
    }
    setWatchFaceStyle(settings) {
        return this.ctx.invoke({
            validate: () => validateWatchFaceStyleSettings(settings),
            invoke: () => this.ctx.native.setWatchFaceStyle((0, deep_keys_1.deepCamelKeys)({
                screen_index: settings.screen_index,
                dial_type: settings.dial_type ?? "default",
            })),
        });
    }
}
exports.WatchFaceCapability = WatchFaceCapability;
//# sourceMappingURL=watch-face.js.map