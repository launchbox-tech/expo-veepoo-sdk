"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorldClockCapability = void 0;
const deep_keys_1 = require("../shared/deep-keys");
const assertions_1 = require("../shared/assertions");
const primitives_1 = require("../shared/primitives");
// ── Normalizers ─────────────────────────────────────────────────────────────
function normalizeWorldClockEntry(item) {
    const entry = {
        timezone_offset_minutes: (0, primitives_1.toInt)(item.timezone_offset_minutes ?? item.timezoneOffsetMinutes, 0),
        city_name: typeof item.city_name === "string"
            ? item.city_name
            : typeof item.cityName === "string"
                ? item.cityName
                : "",
    };
    const dstRaw = item.dst_offset ?? item.dstOffset;
    if (dstRaw !== undefined && dstRaw !== null) {
        entry.dst_offset = (0, primitives_1.toInt)(dstRaw);
    }
    return entry;
}
function normalizeWorldClockList(value) {
    if (!Array.isArray(value))
        return [];
    const entries = [];
    for (const item of value) {
        if ((0, primitives_1.isRecord)(item))
            entries.push(normalizeWorldClockEntry(item));
    }
    return entries;
}
// ── Validators ──────────────────────────────────────────────────────────────
function validateWorldClockList(clocks) {
    if (clocks.length > 4) {
        throw { code: "INVALID_ARGUMENT", message: "Maximum 4 world clock entries allowed" };
    }
    for (const clock of clocks) {
        (0, assertions_1.requireInRange)(clock.timezone_offset_minutes, "timezone_offset_minutes", -720, 840);
        (0, assertions_1.requireNonEmptyString)(clock.city_name, "city_name");
    }
}
// ── Capability ──────────────────────────────────────────────────────────────
class WorldClockCapability {
    constructor(ctx) {
        this.ctx = ctx;
    }
    readWorldClock() {
        return this.ctx.invoke({
            invoke: () => this.ctx.native.readWorldClock(),
            normalize: normalizeWorldClockList,
        });
    }
    setWorldClock(clocks) {
        return this.ctx.invoke({
            validate: () => validateWorldClockList(clocks),
            invoke: () => this.ctx.native.setWorldClock(clocks.map((c) => (0, deep_keys_1.deepCamelKeys)(c))),
        });
    }
}
exports.WorldClockCapability = WorldClockCapability;
//# sourceMappingURL=world-clock.js.map