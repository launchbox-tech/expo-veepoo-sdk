"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatteryCapability = void 0;
exports.normalizeBatteryInfo = normalizeBatteryInfo;
const primitives_1 = require("../shared/primitives");
// ── Normalizers ─────────────────────────────────────────────────────────────
function normalizeBatteryInfo(value) {
    const record = (0, primitives_1.isRecord)(value) ? value : {};
    const state = (0, primitives_1.toInt)(record.state);
    const charge_state = state === 0 ? "normal"
        : state === 1 ? "charging"
            : state === 2 ? "low_pressure"
                : state === 3 ? "full"
                    : undefined;
    return {
        level: (0, primitives_1.toInt)(record.level, (0, primitives_1.toInt)(record.percent)),
        percent: (0, primitives_1.toInt)(record.percent, (0, primitives_1.toInt)(record.level)),
        power_model: (0, primitives_1.toInt)(record.powerModel ?? record.power_model),
        state,
        bat: (0, primitives_1.toInt)(record.bat),
        is_percent: (0, primitives_1.toBoolean)(record.isPercent ?? record.is_percent, true),
        is_low_battery: (0, primitives_1.toBoolean)(record.isLowBattery ?? record.is_low_battery),
        charge_state,
    };
}
// ── Capability ──────────────────────────────────────────────────────────────
class BatteryCapability {
    constructor(ctx) {
        this.ctx = ctx;
    }
    readBattery() {
        this.ctx.log("debug", "device", "battery.read.start", "Reading battery info", {});
        return this.ctx.invoke({
            invoke: () => this.ctx.native.readBattery(),
            normalize: normalizeBatteryInfo,
            afterSuccess: (result) => {
                this.ctx.log("debug", "device", "battery.read.result", "Battery info received", {
                    data: result,
                });
            },
        });
    }
}
exports.BatteryCapability = BatteryCapability;
//# sourceMappingURL=battery.js.map