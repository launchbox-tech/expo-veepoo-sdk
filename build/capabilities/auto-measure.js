"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoMeasureCapability = void 0;
exports.normalizeAutoMeasureSettings = normalizeAutoMeasureSettings;
exports.validateAutoMeasureSetting = validateAutoMeasureSetting;
const deep_keys_1 = require("../shared/deep-keys");
const assertions_1 = require("../shared/assertions");
const primitives_1 = require("../shared/primitives");
// ── Normalizers ─────────────────────────────────────────────────────────────
function normalizeAutoMeasureSettings(value) {
    if (!Array.isArray(value))
        return [];
    return value.filter(primitives_1.isRecord).map((item) => ({
        protocol_type: (0, primitives_1.toInt)(item.protocolType ?? item.protocol_type),
        fun_type: (0, primitives_1.toInt)(item.funType ?? item.fun_type),
        is_switch_open: (0, primitives_1.toBoolean)(item.isSwitchOpen ?? item.is_switch_open),
        step_unit: (0, primitives_1.toInt)(item.stepUnit ?? item.step_unit),
        is_slot_modify: (0, primitives_1.toBoolean)(item.isSlotModify ?? item.is_slot_modify),
        is_interval_modify: (0, primitives_1.toBoolean)(item.isIntervalModify ?? item.is_interval_modify),
        support_start_minute: (0, primitives_1.toInt)(item.supportStartMinute ?? item.support_start_minute),
        support_end_minute: (0, primitives_1.toInt)(item.supportEndMinute ?? item.support_end_minute),
        measure_interval: (0, primitives_1.toInt)(item.measureInterval ?? item.measure_interval),
        current_start_minute: (0, primitives_1.toInt)(item.currentStartMinute ?? item.current_start_minute),
        current_end_minute: (0, primitives_1.toInt)(item.currentEndMinute ?? item.current_end_minute),
    }));
}
// ── Validators ──────────────────────────────────────────────────────────────
function validateAutoMeasureSetting(setting) {
    if (setting.measure_interval !== undefined) {
        (0, assertions_1.requireInRange)(setting.measure_interval, "measureInterval", 1, 120);
    }
    if (setting.current_start_minute !== undefined) {
        (0, assertions_1.requireInRange)(setting.current_start_minute, "currentStartMinute", 0, 1439);
    }
    if (setting.current_end_minute !== undefined) {
        (0, assertions_1.requireInRange)(setting.current_end_minute, "currentEndMinute", 0, 1439);
    }
}
// ── Capability ──────────────────────────────────────────────────────────────
class AutoMeasureCapability {
    constructor(ctx) {
        this.ctx = ctx;
    }
    readAutoMeasureSetting() {
        return this.ctx.invoke({
            invoke: () => this.ctx.native.readAutoMeasureSetting(),
            normalize: normalizeAutoMeasureSettings,
            afterSuccess: (result) => {
                this.ctx.log("debug", "device", "autoMeasure.read", "Auto measure settings received", {
                    data: { count: result.length },
                });
            },
        });
    }
    modifyAutoMeasureSetting(setting) {
        return this.ctx.invoke({
            validate: () => {
                validateAutoMeasureSetting(setting);
                this.ctx.log("info", "device", "autoMeasure.modify.start", "Modifying auto measure settings", {
                    data: setting,
                });
            },
            invoke: () => this.ctx.native.modifyAutoMeasureSetting((0, deep_keys_1.deepCamelKeys)(setting)),
            normalize: normalizeAutoMeasureSettings,
            afterSuccess: (result) => {
                this.ctx.log("info", "device", "autoMeasure.modify.result", "Auto measure settings updated", {
                    data: { count: result.length },
                });
            },
        });
    }
}
exports.AutoMeasureCapability = AutoMeasureCapability;
//# sourceMappingURL=auto-measure.js.map