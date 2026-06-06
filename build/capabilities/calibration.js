"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalibrationCapability = void 0;
exports.validateBloodPressureCalibration = validateBloodPressureCalibration;
exports.validateBloodGlucoseCalibration = validateBloodGlucoseCalibration;
exports.validateBloodGlucoseRiskLevel = validateBloodGlucoseRiskLevel;
const assertions_1 = require("../shared/assertions");
// ── Validators ──────────────────────────────────────────────────────────────
function validateBloodPressureCalibration(systolic, diastolic) {
    (0, assertions_1.requireInRange)(systolic, "systolic", 60, 250);
    (0, assertions_1.requireInRange)(diastolic, "diastolic", 60, 250);
}
function validateBloodGlucoseCalibration(value) {
    (0, assertions_1.requireInRange)(value, "value", 2, 30);
}
function validateBloodGlucoseRiskLevel(config) {
    (0, assertions_1.requireInRange)(config.low, "low", 2, 30);
    (0, assertions_1.requireInRange)(config.high, "high", 2, 30);
    if (config.low >= config.high) {
        throw { code: "INVALID_ARGUMENT", message: "low must be less than high" };
    }
}
// ── Capability ──────────────────────────────────────────────────────────────
class CalibrationCapability {
    constructor(ctx) {
        this.ctx = ctx;
    }
    calibrateBloodPressure(systolic, diastolic) {
        return this.ctx.invoke({
            validate: () => validateBloodPressureCalibration(systolic, diastolic),
            invoke: () => this.ctx.native.calibrateBloodPressure(systolic, diastolic),
        });
    }
    calibrateBloodGlucose(value) {
        return this.ctx.invoke({
            validate: () => validateBloodGlucoseCalibration(value),
            invoke: () => this.ctx.native.calibrateBloodGlucose(value),
        });
    }
    setBloodGlucoseRiskLevel(config) {
        return this.ctx.invoke({
            validate: () => validateBloodGlucoseRiskLevel(config),
            invoke: () => this.ctx.native.setBloodGlucoseRiskLevel(config.low, config.high, config.unit),
        });
    }
}
exports.CalibrationCapability = CalibrationCapability;
//# sourceMappingURL=calibration.js.map