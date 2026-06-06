"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SportStepsCapability = void 0;
exports.normalizeSportStepData = normalizeSportStepData;
const primitives_1 = require("../shared/primitives");
// ── Normalizers ─────────────────────────────────────────────────────────────
function normalizeSportStepData(value) {
    const record = (0, primitives_1.isRecord)(value) ? value : {};
    return {
        date: (0, primitives_1.toStringValue)(record.date),
        step_count: (0, primitives_1.toInt)(record.stepCount ?? record.step_count ?? record.step),
        distance: (0, primitives_1.toNumber)(record.distance ?? record.dis) ?? 0,
        calories: (0, primitives_1.toNumber)(record.calories ?? record.kcal ?? record.cal) ?? 0,
    };
}
// ── Capability ──────────────────────────────────────────────────────────────
class SportStepsCapability {
    constructor(ctx) {
        this.ctx = ctx;
    }
    readSportStepData(date) {
        return this.ctx.invoke({
            invoke: () => this.ctx.native.readSportStepData(date),
            normalize: normalizeSportStepData,
            afterSuccess: (result) => {
                this.ctx.log("debug", "read", "read.sport.result", "Sport step data received", {
                    data: result,
                });
            },
        });
    }
}
exports.SportStepsCapability = SportStepsCapability;
//# sourceMappingURL=sport-steps.js.map