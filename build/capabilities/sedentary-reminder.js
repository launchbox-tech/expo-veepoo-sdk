"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SedentaryReminderCapability = void 0;
exports.normalizeSedentaryReminderSettings = normalizeSedentaryReminderSettings;
const deep_keys_1 = require("../shared/deep-keys");
const assertions_1 = require("../shared/assertions");
const primitives_1 = require("../shared/primitives");
// ── Normalizers ─────────────────────────────────────────────────────────────
function normalizeSedentaryReminderSettings(value) {
    const record = (0, primitives_1.isRecord)(value) ? value : {};
    return {
        start_hour: (0, primitives_1.toInt)(record.startHour ?? record.start_hour),
        start_minute: (0, primitives_1.toInt)(record.startMinute ?? record.start_minute),
        end_hour: (0, primitives_1.toInt)(record.endHour ?? record.end_hour),
        end_minute: (0, primitives_1.toInt)(record.endMinute ?? record.end_minute),
        threshold_minutes: (0, primitives_1.toInt)(record.thresholdMinutes ?? record.threshold_minutes, 60),
        enabled: (0, primitives_1.toBoolean)(record.enabled, false),
    };
}
// ── Validators ──────────────────────────────────────────────────────────────
/** Vendor long-sit gate is 30–240 minutes (iOS `longSeatGateValue`). */
function validateSedentaryReminderSettings(s) {
    (0, assertions_1.requireValidHour)(s.start_hour, "startHour");
    (0, assertions_1.requireValidMinute)(s.start_minute, "startMinute");
    (0, assertions_1.requireValidHour)(s.end_hour, "endHour");
    (0, assertions_1.requireValidMinute)(s.end_minute, "endMinute");
    (0, assertions_1.requireInRange)(s.threshold_minutes, "thresholdMinutes", 30, 240);
}
// ── Capability ──────────────────────────────────────────────────────────────
class SedentaryReminderCapability {
    constructor(ctx) {
        this.ctx = ctx;
    }
    readSedentaryReminder() {
        return this.ctx.invoke({
            invoke: () => this.ctx.native.readSedentaryReminder(),
            normalize: normalizeSedentaryReminderSettings,
        });
    }
    setSedentaryReminder(settings) {
        return this.ctx.invoke({
            validate: () => validateSedentaryReminderSettings(settings),
            invoke: () => this.ctx.native.setSedentaryReminder((0, deep_keys_1.deepCamelKeys)(settings)),
        });
    }
}
exports.SedentaryReminderCapability = SedentaryReminderCapability;
//# sourceMappingURL=sedentary-reminder.js.map