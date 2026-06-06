"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeSleepDataList = normalizeSleepDataList;
const primitives_1 = require("../../shared/primitives");
function normalizeSleepRecord(value) {
    if (Array.isArray(value.items) && (0, primitives_1.isRecord)(value.summary)) {
        return {
            date: (0, primitives_1.toStringValue)(value.date),
            items: value.items.map((item) => {
                const record = (0, primitives_1.isRecord)(item) ? item : {};
                return {
                    date: (0, primitives_1.toStringValue)(record.date),
                    sleep_time: (0, primitives_1.toStringValue)(record.sleepTime ?? record.sleep_time),
                    wake_time: (0, primitives_1.toStringValue)(record.wakeTime ?? record.wake_time),
                    deep_sleep_minutes: (0, primitives_1.toInt)(record.deepSleepMinutes ?? record.deep_sleep_minutes),
                    light_sleep_minutes: (0, primitives_1.toInt)(record.lightSleepMinutes ?? record.light_sleep_minutes),
                    total_sleep_minutes: (0, primitives_1.toInt)(record.totalSleepMinutes ?? record.total_sleep_minutes),
                    sleep_quality: (0, primitives_1.toInt)(record.sleepQuality ?? record.sleep_quality),
                    sleep_line: (0, primitives_1.toStringValue)(record.sleepLine ?? record.sleep_line),
                    wake_up_count: (0, primitives_1.toInt)(record.wakeUpCount ?? record.wake_up_count),
                };
            }),
            summary: {
                total_deep_sleep_minutes: (0, primitives_1.toInt)(value.summary.totalDeepSleepMinutes ?? value.summary.total_deep_sleep_minutes),
                total_light_sleep_minutes: (0, primitives_1.toInt)(value.summary.totalLightSleepMinutes ?? value.summary.total_light_sleep_minutes),
                total_sleep_minutes: (0, primitives_1.toInt)(value.summary.totalSleepMinutes ?? value.summary.total_sleep_minutes),
                average_sleep_quality: (0, primitives_1.toInt)(value.summary.averageSleepQuality ?? value.summary.average_sleep_quality),
                total_wake_up_count: (0, primitives_1.toInt)(value.summary.totalWakeUpCount ?? value.summary.total_wake_up_count),
            },
        };
    }
    const sleep_time = (0, primitives_1.toStringValue)(value.SLEEP_TIME ?? value.sleepTime ?? value.sleep_time);
    const wake_time = (0, primitives_1.toStringValue)(value.WAKE_TIME ?? value.wakeTime ?? value.wake_time);
    if (!sleep_time && !wake_time)
        return null;
    const deep_sleep_minutes = Math.trunc(((0, primitives_1.toNumber)(value.DEEP_HOUR) ?? 0) * 60);
    const light_sleep_minutes = Math.trunc(((0, primitives_1.toNumber)(value.LIGHT_HOUR) ?? 0) * 60);
    const total_sleep_minutes = (0, primitives_1.toInt)(value.totalSleepMinutes ?? value.total_sleep_minutes, -1) >= 0
        ? (0, primitives_1.toInt)(value.totalSleepMinutes ?? value.total_sleep_minutes)
        : Math.trunc(((0, primitives_1.toNumber)(value.SLE_HOUR) ?? 0) * 60 + ((0, primitives_1.toNumber)(value.SLE_MINUTE) ?? 0));
    const sleep_quality = (0, primitives_1.toInt)(value.SLEEP_LEVEL ?? value.sleepQuality ?? value.sleep_quality);
    const wake_up_count = (0, primitives_1.toInt)(value.WakeUpTime ?? value.wakeUpCount ?? value.wake_up_count);
    const date = (0, primitives_1.toStringValue)(value.date || (wake_time ? wake_time.slice(0, 10) : ''));
    return {
        date,
        items: [
            {
                date,
                sleep_time,
                wake_time,
                deep_sleep_minutes,
                light_sleep_minutes,
                total_sleep_minutes,
                sleep_quality,
                sleep_line: (0, primitives_1.toStringValue)(value.SLE_LINE ?? value.sleepLine ?? value.sleep_line),
                wake_up_count,
            },
        ],
        summary: {
            total_deep_sleep_minutes: deep_sleep_minutes,
            total_light_sleep_minutes: light_sleep_minutes,
            total_sleep_minutes,
            average_sleep_quality: sleep_quality,
            total_wake_up_count: wake_up_count,
        },
    };
}
function normalizeSleepDataList(value) {
    if (!Array.isArray(value)) {
        if ((0, primitives_1.isRecord)(value)) {
            const single = normalizeSleepRecord(value);
            return single ? [single] : [];
        }
        return [];
    }
    return value
        .map((item) => ((0, primitives_1.isRecord)(item) ? normalizeSleepRecord(item) : null))
        .filter((item) => item !== null);
}
//# sourceMappingURL=normalizers.js.map