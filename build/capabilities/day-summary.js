"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DaySummaryCapability = void 0;
exports.normalizeDaySummaryData = normalizeDaySummaryData;
const primitives_1 = require("../shared/primitives");
// ── Normalizers ─────────────────────────────────────────────────────────────
function normalizeDaySummaryData(value) {
    const record = (0, primitives_1.isRecord)(value) ? value : {};
    return {
        date: (0, primitives_1.toStringValue)(record.date),
        all_step: (0, primitives_1.toInt)(record.allStep ?? record.all_step),
        sport_list: Array.isArray(record.sportList ?? record.sport_list)
            ? (record.sportList ?? record.sport_list)
                .filter(primitives_1.isRecord)
                .map((item) => ({
                time: (0, primitives_1.toStringValue)(item.time),
                step: (0, primitives_1.toInt)(item.step),
                cal: (0, primitives_1.toNumber)(item.cal) ?? 0,
                dis: (0, primitives_1.toNumber)(item.dis) ?? 0,
            }))
            : [],
        rate_list: Array.isArray(record.rateList ?? record.rate_list)
            ? (record.rateList ?? record.rate_list)
                .filter(primitives_1.isRecord)
                .map((item) => ({
                time: (0, primitives_1.toStringValue)(item.time),
                rate: (0, primitives_1.toInt)(item.rate),
            }))
            : [],
        bp_list: Array.isArray(record.bpList ?? record.bp_list)
            ? (record.bpList ?? record.bp_list)
                .filter(primitives_1.isRecord)
                .map((item) => ({
                time: (0, primitives_1.toStringValue)(item.time),
                high: (0, primitives_1.toInt)(item.high),
                low: (0, primitives_1.toInt)(item.low),
            }))
            : [],
    };
}
// ── Capability ──────────────────────────────────────────────────────────────
class DaySummaryCapability {
    constructor(ctx) {
        this.ctx = ctx;
    }
    readDaySummaryData(dayOffset = 0) {
        return this.ctx.invoke({
            invoke: () => this.ctx.native.readDaySummaryData(dayOffset),
            normalize: normalizeDaySummaryData,
            afterSuccess: (result) => {
                this.ctx.log("debug", "read", "read.summary.result", "Day summary data received", {
                    data: { dayOffset, date: result.date },
                });
            },
        });
    }
}
exports.DaySummaryCapability = DaySummaryCapability;
//# sourceMappingURL=day-summary.js.map