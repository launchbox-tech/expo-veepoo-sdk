"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalInfoCapability = void 0;
exports.validatePersonalInfo = validatePersonalInfo;
const deep_keys_1 = require("../shared/deep-keys");
const assertions_1 = require("../shared/assertions");
// ── Validators ──────────────────────────────────────────────────────────────
function validatePersonalInfo(info) {
    if (info.sex !== 0 && info.sex !== 1) {
        throw { code: "INVALID_ARGUMENT", message: "sex must be 0 or 1" };
    }
    (0, assertions_1.requireInRange)(info.height, "height", 50, 300);
    (0, assertions_1.requireInRange)(info.weight, "weight", 1, 500);
    (0, assertions_1.requireInRange)(info.age, "age", 1, 120);
    (0, assertions_1.requireInRange)(info.step_aim, "stepAim", 1, 100000);
    (0, assertions_1.requireInRange)(info.sleep_aim, "sleepAim", 0, 1440);
}
// ── Capability ──────────────────────────────────────────────────────────────
class PersonalInfoCapability {
    constructor(ctx) {
        this.ctx = ctx;
    }
    syncPersonalInfo(info) {
        return this.ctx.invoke({
            validate: () => validatePersonalInfo(info),
            invoke: () => this.ctx.native.syncPersonalInfo((0, deep_keys_1.deepCamelKeys)(info)),
        });
    }
}
exports.PersonalInfoCapability = PersonalInfoCapability;
//# sourceMappingURL=personal-info.js.map