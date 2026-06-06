"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeAlarmList = normalizeAlarmList;
exports.normalizeHeartRateAlarm = normalizeHeartRateAlarm;
exports.normalizeSpo2Alarm = normalizeSpo2Alarm;
const primitives_1 = require("../../shared/primitives");
function repeatStringToWeekdays(repeatStr) {
    const days = [];
    for (let i = 0; i < 7; i++) {
        if (repeatStr[i] === '1')
            days.push(7 - i);
    }
    return days.sort((a, b) => a - b);
}
function normalizeAlarmList(value) {
    if (!Array.isArray(value))
        return [];
    return value
        .filter((item) => (0, primitives_1.isRecord)(item))
        .map((item) => {
        const repeatRaw = typeof item.repeat === 'string' ? item.repeat : '0000000';
        const repeat = Array.isArray(item.repeat)
            ? item.repeat
            : repeatStringToWeekdays(repeatRaw);
        const alarm = {
            id: (0, primitives_1.toInt)(item.id, 0),
            enabled: (0, primitives_1.toBoolean)(item.enabled, false),
            hour: (0, primitives_1.toInt)(item.hour, 0),
            minute: (0, primitives_1.toInt)(item.minute, 0),
            repeat,
        };
        if (item.scene !== undefined && item.scene !== null) {
            alarm.scene = (0, primitives_1.toInt)(item.scene);
        }
        if (typeof item.text === 'string' && item.text.length > 0) {
            alarm.text = item.text;
        }
        if (item.type === 'normal' || item.type === 'text') {
            alarm.type = item.type;
        }
        return alarm;
    });
}
function normalizeHeartRateAlarm(value) {
    const record = (0, primitives_1.isRecord)(value) ? value : {};
    return {
        enabled: (0, primitives_1.toBoolean)(record.enabled, false),
        high_threshold: (0, primitives_1.toInt)(record.highThreshold ?? record.high_threshold),
        low_threshold: (0, primitives_1.toInt)(record.lowThreshold ?? record.low_threshold),
    };
}
function normalizeSpo2Alarm(value) {
    const record = (0, primitives_1.isRecord)(value) ? value : {};
    return {
        enabled: (0, primitives_1.toBoolean)(record.enabled, false),
        low_threshold: (0, primitives_1.toInt)(record.lowThreshold ?? record.low_threshold),
    };
}
//# sourceMappingURL=normalizers.js.map