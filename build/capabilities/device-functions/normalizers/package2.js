"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePackage2 = normalizePackage2;
const declared_keys_1 = require("../declared-keys");
const nested_1 = require("./nested");
const primitives_1 = require("../../../shared/primitives");
function normalizePackage2(record) {
    if ((0, primitives_1.isRecord)(record.package2)) {
        return (0, nested_1.readDeclaredFields)(record.package2, declared_keys_1.PACKAGE2_FIELDS);
    }
    return {
        count_down: (0, primitives_1.normalizeFunctionStatus)(record.CountDown ?? record.countDown),
        sport_model_function: (0, primitives_1.normalizeFunctionStatus)(record.SportModel ?? record.sportModel),
        hid_function: (0, primitives_1.normalizeFunctionStatus)(record.hidFuction ?? record.hidFunction),
        screen_style_function: (0, primitives_1.normalizeFunctionStatus)(record.screenStyleFunction),
        breath_function: (0, primitives_1.normalizeFunctionStatus)(record.beathFunction ?? record.breathFunction),
        hrv_function: (0, primitives_1.normalizeFunctionStatus)(record.hrvFunction),
        weather_function: (0, primitives_1.normalizeFunctionStatus)(record.weatherFunction),
        screen_light_time: (0, primitives_1.normalizeFunctionStatus)(record.screenLightTime),
        precision_sleep: (0, primitives_1.normalizeFunctionStatus)(record.precisionSleep),
        ecg_function: (0, primitives_1.normalizeFunctionStatus)(record.ecg),
        mult_sport_mode: (0, primitives_1.normalizeFunctionStatus)(record.multSportModel),
        low_power: (0, primitives_1.normalizeFunctionStatus)(record.lowPower),
        sleep_tag: (0, primitives_1.toInt)(record.sleepTag),
        watch_data_day_number: (0, primitives_1.toInt)(record.WathcDay ?? record.wathcDay),
        contact_msg_length: (0, primitives_1.toInt)(record.contactMsgLength),
        all_msg_length: (0, primitives_1.toInt)(record.allMsgLength),
        sport_model_day: (0, primitives_1.toInt)(record.sportmodelday),
        screenstyle: (0, primitives_1.toInt)(record.screenstyle),
        weather_style: (0, primitives_1.toInt)(record.weatherStyle),
        origin_protocol_version: (0, primitives_1.toInt)(record.originProtcolVersion),
        ecg_type: (0, primitives_1.toInt)(record.ecgType),
    };
}
//# sourceMappingURL=package2.js.map