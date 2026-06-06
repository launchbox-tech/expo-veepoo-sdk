"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeBluetoothStatus = exports.normalizePermissionsResult = void 0;
exports.normalizePasswordData = normalizePasswordData;
const primitives_1 = require("../../shared/primitives");
var normalizers_1 = require("../../capabilities/band-discovery/normalizers");
Object.defineProperty(exports, "normalizePermissionsResult", { enumerable: true, get: function () { return normalizers_1.normalizePermissionsResult; } });
Object.defineProperty(exports, "normalizeBluetoothStatus", { enumerable: true, get: function () { return normalizers_1.normalizeBluetoothStatus; } });
function normalizePasswordData(value) {
    const record = (0, primitives_1.isRecord)(value) ? value : {};
    const rawStatus = record.status ??
        record.rawStatus ??
        record.mStatus ??
        record.result ??
        'UNKNOWN';
    let status = 'UNKNOWN';
    if (typeof rawStatus === 'string') {
        const normalized = rawStatus.toUpperCase();
        if (normalized.includes('CHECK_SUCCESS'))
            status = 'CHECK_SUCCESS';
        else if (normalized.includes('CHECK_FAIL'))
            status = 'CHECK_FAIL';
        else if (normalized.includes('NOT_SET'))
            status = 'NOT_SET';
        else if (normalized.includes('SUCCESS'))
            status = 'SUCCESS';
        else if (normalized.includes('FAIL'))
            status = 'FAILED';
    }
    return {
        status,
        password: (0, primitives_1.toStringValue)(record.password ?? record.pwd),
        device_number: (0, primitives_1.toStringValue)(record.deviceNumber ?? record.device_number),
        device_version: (0, primitives_1.toStringValue)(record.deviceVersion ?? record.device_version),
        device_test_version: (0, primitives_1.toStringValue)(record.deviceTestVersion ?? record.device_test_version),
        is_have_drink_data: (record.isHaveDrinkData ?? record.is_have_drink_data) === undefined ? undefined : (0, primitives_1.toBoolean)(record.isHaveDrinkData ?? record.is_have_drink_data),
        is_open_night_turn_wrist: (record.isOpenNightTurnWrist ?? record.isOpenNightTurnWriste ?? record.is_open_night_turn_wrist) === undefined
            ? undefined
            : (0, primitives_1.normalizeFunctionStatus)(record.isOpenNightTurnWrist ?? record.isOpenNightTurnWriste ?? record.is_open_night_turn_wrist),
        find_phone_function: (record.findPhoneFunction ?? record.find_phone_function) === undefined
            ? undefined
            : (0, primitives_1.normalizeFunctionStatus)(record.findPhoneFunction ?? record.find_phone_function),
        wear_detect_function: (record.wearDetectFunction ?? record.wear_detect_function) === undefined
            ? undefined
            : (0, primitives_1.normalizeFunctionStatus)(record.wearDetectFunction ?? record.wear_detect_function),
    };
}
//# sourceMappingURL=normalizers.js.map