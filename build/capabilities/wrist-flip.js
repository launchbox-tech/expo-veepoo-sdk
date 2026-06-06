"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WristFlipCapability = void 0;
exports.normalizeWristFlipWakeSettings = normalizeWristFlipWakeSettings;
exports.validateWristFlipWakeSettings = validateWristFlipWakeSettings;
const deep_keys_1 = require("../shared/deep-keys");
const assertions_1 = require("../shared/assertions");
const primitives_1 = require("../shared/primitives");
// ── Normalizers ─────────────────────────────────────────────────────────────
function normalizeWristFlipWakeSettings(value) {
    const record = (0, primitives_1.isRecord)(value) ? value : {};
    const base = {
        enabled: (0, primitives_1.toBoolean)(record.enabled, false),
        start_hour: (0, primitives_1.toInt)(record.startHour ?? record.start_hour),
        start_minute: (0, primitives_1.toInt)(record.startMinute ?? record.start_minute),
        end_hour: (0, primitives_1.toInt)(record.endHour ?? record.end_hour),
        end_minute: (0, primitives_1.toInt)(record.endMinute ?? record.end_minute),
        sensitivity_level: (0, primitives_1.toInt)(record.sensitivityLevel ?? record.sensitivity_level, 5),
    };
    const sctw = record.supportsCustomTimeWindow ?? record.supports_custom_time_window;
    if (sctw !== undefined && sctw !== null) {
        base.supports_custom_time_window = (0, primitives_1.toBoolean)(sctw, false);
    }
    const dsl = record.defaultSensitivityLevel ?? record.default_sensitivity_level;
    if (dsl !== undefined && dsl !== null) {
        base.default_sensitivity_level = (0, primitives_1.toInt)(dsl);
    }
    return base;
}
// ── Validators ──────────────────────────────────────────────────────────────
function validateWristFlipWakeSettings(s) {
    (0, assertions_1.requireValidHour)(s.start_hour, "startHour");
    (0, assertions_1.requireValidMinute)(s.start_minute, "startMinute");
    (0, assertions_1.requireValidHour)(s.end_hour, "endHour");
    (0, assertions_1.requireValidMinute)(s.end_minute, "endMinute");
    (0, assertions_1.requireInRange)(s.sensitivity_level, "sensitivityLevel", 1, 10);
}
// ── Capability ──────────────────────────────────────────────────────────────
class WristFlipCapability {
    constructor(ctx) {
        this.ctx = ctx;
    }
    readWristFlipWakeSettings() {
        return this.ctx.invoke({
            invoke: () => this.ctx.native.readWristFlipWakeSettings(),
            normalize: normalizeWristFlipWakeSettings,
        });
    }
    setWristFlipWakeSettings(settings) {
        return this.ctx.invoke({
            validate: () => validateWristFlipWakeSettings(settings),
            invoke: () => this.ctx.native.setWristFlipWakeSettings((0, deep_keys_1.deepCamelKeys)(settings)),
        });
    }
}
exports.WristFlipCapability = WristFlipCapability;
//# sourceMappingURL=wrist-flip.js.map