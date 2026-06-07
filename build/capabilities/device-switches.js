"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceSwitchesCapability = void 0;
const primitives_1 = require("../shared/primitives");
// ── Normalizers ─────────────────────────────────────────────────────────────
const SWITCH_KEYS = [
    "auto_hr", "auto_bp", "auto_spo2", "auto_temperature", "auto_hrv",
    "auto_blood_glucose", "auto_ppg", "wear_detection", "disconnect_remind",
    "sos_remind", "auto_answer", "exercise_detection", "accurate_sleep",
    "ecg_normally_open", "met", "stress", "music_control",
];
const SWITCH_KEY_SET = new Set(SWITCH_KEYS);
/** Camel-case variant → snake_case switch key mapping. */
const CAMEL_TO_SWITCH = {
    autoHr: "auto_hr",
    autoHR: "auto_hr",
    autoBp: "auto_bp",
    autoBP: "auto_bp",
    autoSpo2: "auto_spo2",
    autoSPO2: "auto_spo2",
    autoTemperature: "auto_temperature",
    autoHrv: "auto_hrv",
    autoHRV: "auto_hrv",
    autoBloodGlucose: "auto_blood_glucose",
    autoPpg: "auto_ppg",
    autoPPG: "auto_ppg",
    wearDetection: "wear_detection",
    disconnectRemind: "disconnect_remind",
    sosRemind: "sos_remind",
    autoAnswer: "auto_answer",
    exerciseDetection: "exercise_detection",
    accurateSleep: "accurate_sleep",
    ecgNormallyOpen: "ecg_normally_open",
    met: "met",
    stress: "stress",
    musicControl: "music_control",
};
function normalizeDeviceSwitches(value) {
    const record = (0, primitives_1.isRecord)(value) ? value : {};
    // Start with all false
    const result = Object.fromEntries(SWITCH_KEYS.map((k) => [k, false]));
    for (const [rawKey, rawVal] of Object.entries(record)) {
        const snakeKey = (CAMEL_TO_SWITCH[rawKey] ?? rawKey);
        if (SWITCH_KEY_SET.has(snakeKey)) {
            result[snakeKey] = (0, primitives_1.toBoolean)(rawVal, false);
        }
    }
    return result;
}
// ── Validators ──────────────────────────────────────────────────────────────
const DEVICE_SWITCH_TYPES = new Set([
    "auto_hr", "auto_bp", "auto_spo2", "auto_temperature", "auto_hrv",
    "auto_blood_glucose", "auto_ppg", "wear_detection", "disconnect_remind",
    "sos_remind", "auto_answer", "exercise_detection", "accurate_sleep",
    "ecg_normally_open", "met", "stress", "music_control",
]);
function validateDeviceSwitchType(type) {
    if (typeof type !== "string" || !DEVICE_SWITCH_TYPES.has(type)) {
        throw { code: "INVALID_ARGUMENT", message: `Invalid device switch type: ${String(type)}` };
    }
}
// ── Capability ──────────────────────────────────────────────────────────────
class DeviceSwitchesCapability {
    constructor(ctx) {
        this.ctx = ctx;
    }
    readDeviceSwitches() {
        return this.ctx.invoke({
            invoke: () => this.ctx.native.readDeviceSwitches(),
            normalize: normalizeDeviceSwitches,
            afterSuccess: (switches) => this.ctx.emitDeviceEvent("device_switches_data", { switches }),
        });
    }
    setDeviceSwitch(type, enabled) {
        return this.ctx.invoke({
            validate: () => validateDeviceSwitchType(type),
            invoke: () => this.ctx.native.setDeviceSwitch(type, enabled),
        });
    }
}
exports.DeviceSwitchesCapability = DeviceSwitchesCapability;
//# sourceMappingURL=device-switches.js.map