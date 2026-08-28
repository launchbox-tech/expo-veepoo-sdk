"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePackage3 = normalizePackage3;
const declared_keys_1 = require("../declared-keys");
const nested_1 = require("./nested");
const primitives_1 = require("../../../shared/primitives");
function normalizePackage3(record) {
    if ((0, primitives_1.isRecord)(record.package3)) {
        return (0, nested_1.readDeclaredFields)(record.package3, declared_keys_1.PACKAGE3_FIELDS);
    }
    return {
        big_data_tran_type: (0, primitives_1.toInt)(record.bitDataTranType ?? record.bigDataTranType),
        watch_ui_server_count: (0, primitives_1.toInt)(record.watchUiServerCount),
        watch_ui_custom_count: (0, primitives_1.toInt)(record.watchUiCoustomCount ?? record.watchUiCustomCount),
        temperature_function: (0, primitives_1.normalizeFunctionStatus)(record.temperatureFunction),
        temperature_type: (0, primitives_1.toInt)(record.temptureType ?? record.temperatureType),
        cpu_type: (0, primitives_1.toInt)(record.cpuType),
        stress_function: (0, primitives_1.normalizeFunctionStatus)(record.stress),
        music_style: (0, primitives_1.toInt)(record.musicStyle),
        find_device_by_phone_function: (0, primitives_1.normalizeFunctionStatus)(record.findDeviceByPhone ?? record.findDeviceByPhoneFunction),
        agps_function: (0, primitives_1.normalizeFunctionStatus)(record.agps),
        blood_glucose_tag: (0, primitives_1.toInt)(record.bloodGlucoseTag),
        blood_glucose: (0, primitives_1.normalizeFunctionStatus)(record.bloodGlucose),
        blood_glucose_adjusting: (0, primitives_1.normalizeFunctionStatus)(record.bloodGlucoseAdjusting),
        blood_component: (0, primitives_1.normalizeFunctionStatus)(record.bloodComponent),
        body_component: (0, primitives_1.normalizeFunctionStatus)(record.bodyComponent),
    };
}
//# sourceMappingURL=package3.js.map