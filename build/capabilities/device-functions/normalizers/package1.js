"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePackage1 = normalizePackage1;
const declared_keys_1 = require("../declared-keys");
const nested_1 = require("./nested");
const primitives_1 = require("../../../shared/primitives");
function normalizePackage1(record) {
    if ((0, primitives_1.isRecord)(record.package1)) {
        return (0, nested_1.readDeclaredFields)(record.package1, declared_keys_1.PACKAGE1_FIELDS);
    }
    return {
        blood_pressure: (0, primitives_1.normalizeFunctionStatus)(record.Bp ?? record.bp),
        drinking: (0, primitives_1.normalizeFunctionStatus)(record.Drink ?? record.drink),
        sedentary_remind: (0, primitives_1.normalizeFunctionStatus)(record.Longseat ?? record.longseat),
        heart_rate_warning: (0, primitives_1.normalizeFunctionStatus)(record.HeartWaring ?? record.heartWaring),
        we_chat_sport: (0, primitives_1.normalizeFunctionStatus)(record.WeChatSport ?? record.weChatSport),
        camera: (0, primitives_1.normalizeFunctionStatus)(record.Camera ?? record.camera),
        fatigue: (0, primitives_1.normalizeFunctionStatus)(record.Fatigue ?? record.fatigue),
        spo_h: (0, primitives_1.normalizeFunctionStatus)(record.SpoH ?? record.spoH),
        spo2_h_adjustment: (0, primitives_1.normalizeFunctionStatus)(record.SpoHAdjuster ?? record.spoHAdjuster),
        spo_h_breath_break: (0, primitives_1.normalizeFunctionStatus)(record.SpoHBreathBreak ?? record.spoHBreathBreak),
        woman: (0, primitives_1.normalizeFunctionStatus)(record.Woman ?? record.woman),
        alarm: (0, primitives_1.normalizeFunctionStatus)(record.Alarm2 ?? record.alarm2),
        new_calc_sport: (0, primitives_1.normalizeFunctionStatus)(record.newCalcSport),
        ambulatory_bp_adjustment: (0, primitives_1.normalizeFunctionStatus)(record.AngioAdjuster ?? record.angioAdjuster),
        screen_light: (0, primitives_1.normalizeFunctionStatus)(record.SreenLight ?? record.sreenLight),
        heart_rate_detect: (0, primitives_1.normalizeFunctionStatus)(record.HeartDetect ?? record.heartDetect),
        night_turn_setting: (0, primitives_1.normalizeFunctionStatus)(record.NightTurnSetting ?? record.nightTurnSetting),
        text_alarm: (0, primitives_1.normalizeFunctionStatus)(record.textAlarm),
        temperature_function: (0, primitives_1.normalizeFunctionStatus)(record.temperatureFunction),
    };
}
//# sourceMappingURL=package1.js.map