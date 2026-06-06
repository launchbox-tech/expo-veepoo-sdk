"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoricalQueryCapability = void 0;
// ── Capability ──────────────────────────────────────────────────────────────
class HistoricalQueryCapability {
    constructor(ctx) {
        this.ctx = ctx;
    }
    readDeviceAllData() {
        return this.ctx.invoke({
            invoke: () => this.ctx.native.readDeviceAllData(),
        });
    }
    startReadOriginData() {
        this.ctx.log("info", "read", "read.origin.start", "Starting origin data read", {});
        return this.ctx.invoke({
            invoke: () => this.ctx.native.startReadOriginData(),
        });
    }
}
exports.HistoricalQueryCapability = HistoricalQueryCapability;
//# sourceMappingURL=historical-query.js.map