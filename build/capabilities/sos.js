"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SosCapability = void 0;
exports.normalizeSosCallTimesSettings = normalizeSosCallTimesSettings;
exports.validateSosCallTimes = validateSosCallTimes;
const primitives_1 = require("../shared/primitives");
// ── Normalizers ─────────────────────────────────────────────────────────────
function normalizeSosCallTimesSettings(value) {
    const record = (0, primitives_1.isRecord)(value) ? value : {};
    return {
        times: (0, primitives_1.toInt)(record.times),
        min_times: (0, primitives_1.toInt)(record.minTimes ?? record.min_times),
        max_times: (0, primitives_1.toInt)(record.maxTimes ?? record.max_times),
    };
}
// ── Validators ──────────────────────────────────────────────────────────────
function validateSosCallTimes(times) {
    if (!Number.isInteger(times) || times < 1) {
        throw { code: "INVALID_ARGUMENT", message: "times must be a positive integer" };
    }
}
// ── Capability ──────────────────────────────────────────────────────────────
class SosCapability {
    constructor(ctx) {
        this.ctx = ctx;
    }
    readSosCallTimes() {
        return this.ctx.invoke({
            invoke: () => this.ctx.native.readSosCallTimes(),
            normalize: normalizeSosCallTimesSettings,
            afterSuccess: (data) => this.ctx.emitDeviceEvent("sos_call_times_data", { data }),
        });
    }
    setSosCallTimes(times) {
        return this.ctx.invoke({
            validate: () => validateSosCallTimes(times),
            invoke: () => this.ctx.native.setSosCallTimes(times),
        });
    }
}
exports.SosCapability = SosCapability;
//# sourceMappingURL=sos.js.map