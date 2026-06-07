"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeOriginDataList = normalizeOriginDataList;
exports.normalizeHalfHourData = normalizeHalfHourData;
exports.normalizeReadOriginProgressPayload = normalizeReadOriginProgressPayload;
exports.normalizeSpo2OriginData = normalizeSpo2OriginData;
const primitives_1 = require("../../shared/primitives");
function normalizeOriginItem(value) {
    const rawBloodGlucose = (0, primitives_1.toNumber)(value.bloodGlucose ?? value.glucose);
    return {
        time: (0, primitives_1.toStringValue)(value.time),
        heart_value: (0, primitives_1.toInt)(value.heartValue ?? value.heart_value),
        step_value: (0, primitives_1.toInt)(value.stepValue ?? value.step_value),
        cal_value: (0, primitives_1.toNumber)(value.calValue ?? value.cal_value) ?? 0,
        dis_value: (0, primitives_1.toNumber)(value.disValue ?? value.dis_value) ?? 0,
        sport_value: (0, primitives_1.toInt)(value.sportValue ?? value.sport_value),
        systolic: (0, primitives_1.toInt)(value.systolic ?? value.highValue),
        diastolic: (0, primitives_1.toInt)(value.diastolic ?? value.lowValue),
        spo2_value: (0, primitives_1.toInt)(value.spo2Value ?? value.spo2_value),
        temp_value: (0, primitives_1.toNumber)(value.tempValue ?? value.temp_value) ?? 0,
        stress_value: (0, primitives_1.toInt)(value.stressValue ?? value.stress_value ?? value.stress ?? value.pressure),
        met: (0, primitives_1.toNumber)(value.met) ?? 0,
        oxygens: Array.isArray(value.oxygens) ? value.oxygens.map((item) => (0, primitives_1.toInt)(item)) : undefined,
        ppgs: Array.isArray(value.ppgs) ? value.ppgs.map((item) => (0, primitives_1.toInt)(item)) : undefined,
        ecgs: Array.isArray(value.ecgs) ? value.ecgs.map((item) => (0, primitives_1.toInt)(item)) : undefined,
        res_rates: Array.isArray(value.resRates ?? value.res_rates) ? (value.resRates ?? value.res_rates).map((item) => (0, primitives_1.toInt)(item)) : undefined,
        sleep_states: Array.isArray(value.sleepStates ?? value.sleep_states)
            ? (value.sleepStates ?? value.sleep_states).map((item) => (0, primitives_1.toInt)(item))
            : undefined,
        apnea_results: Array.isArray(value.apneaResults ?? value.apnea_results)
            ? (value.apneaResults ?? value.apnea_results).map((item) => (0, primitives_1.toInt)(item))
            : undefined,
        hypoxia_times: Array.isArray(value.hypoxiaTimes ?? value.hypoxia_times)
            ? (value.hypoxiaTimes ?? value.hypoxia_times).map((item) => (0, primitives_1.toInt)(item))
            : undefined,
        cardiac_loads: Array.isArray(value.cardiacLoads ?? value.cardiac_loads)
            ? (value.cardiacLoads ?? value.cardiac_loads).map((item) => (0, primitives_1.toInt)(item))
            : undefined,
        blood_glucose: rawBloodGlucose === undefined ? undefined : rawBloodGlucose,
    };
}
function normalizeOriginDataList(value) {
    if (!Array.isArray(value))
        return [];
    const normalized = [];
    for (const item of value) {
        if ((0, primitives_1.isRecord)(item))
            normalized.push(normalizeOriginItem(item));
    }
    return normalized.sort((a, b) => a.time.localeCompare(b.time));
}
function normalizeHalfHourData(value) {
    const record = (0, primitives_1.isRecord)(value) ? value : {};
    return {
        time: (0, primitives_1.toStringValue)(record.time),
        heart_value: (0, primitives_1.toInt)(record.heartValue ?? record.heart_value),
        sport_value: (0, primitives_1.toInt)(record.sportValue ?? record.sport_value),
        step_value: (0, primitives_1.toInt)(record.stepValue ?? record.step_value),
        cal_value: (0, primitives_1.toNumber)(record.calValue ?? record.cal_value) ?? 0,
        dis_value: (0, primitives_1.toNumber)(record.disValue ?? record.dis_value) ?? 0,
        diastolic: (0, primitives_1.toInt)(record.diastolic),
        systolic: (0, primitives_1.toInt)(record.systolic),
        spo2_value: (0, primitives_1.toInt)(record.spo2Value ?? record.spo2_value),
        temp_value: (0, primitives_1.toNumber)(record.tempValue ?? record.temp_value),
        stress_value: (0, primitives_1.toInt)(record.stressValue ?? record.stress_value),
        met: (0, primitives_1.toNumber)(record.met),
    };
}
/**
 * Bespoke envelope for the `read_origin_progress` event: the inner payload
 * lives under `progress` and carries camelCase keys that need clamping and
 * sane defaults. Returns the original envelope with the normalized `progress`.
 */
function normalizeReadOriginProgressPayload(value) {
    if (!(0, primitives_1.isRecord)(value) || !(0, primitives_1.isRecord)(value.progress)) {
        return value;
    }
    const progress = value.progress;
    const normalized = {
        read_state: typeof progress.readState === 'string'
            ? progress.readState
            : 'idle',
        total_days: typeof progress.totalDays === 'number' && Number.isFinite(progress.totalDays)
            ? Math.max(1, Math.trunc(progress.totalDays))
            : 1,
        current_day: typeof progress.currentDay === 'number' && Number.isFinite(progress.currentDay)
            ? Math.max(1, Math.trunc(progress.currentDay))
            : 1,
        progress: typeof progress.progress === 'number' && Number.isFinite(progress.progress)
            ? Math.trunc((0, primitives_1.clamp)(progress.progress <= 1 ? progress.progress * 100 : progress.progress, 0, 100))
            : 0,
    };
    return { ...value, progress: normalized };
}
function normalizeSpo2OriginData(value) {
    const record = (0, primitives_1.isRecord)(value) ? value : {};
    return {
        time: (0, primitives_1.toStringValue)(record.time),
        date: (0, primitives_1.toStringValue)(record.date),
        heart_value: (0, primitives_1.toInt)(record.heartValue ?? record.heart_value),
        value: (0, primitives_1.toInt)(record.value),
        rate: (0, primitives_1.toInt)(record.rate),
        is_hypoxia: (0, primitives_1.toInt)(record.isHypoxia ?? record.is_hypoxia),
        cardiac_load: (0, primitives_1.toInt)(record.cardiacLoad ?? record.cardiac_load),
        temp1: (0, primitives_1.toInt)(record.temp1),
        sport_value: (0, primitives_1.toInt)(record.sportValue ?? record.sport_value),
        apnea_result: (0, primitives_1.toInt)(record.apneaResult ?? record.apnea_result),
        hypoxia_time: (0, primitives_1.toInt)(record.hypoxiaTime ?? record.hypoxia_time),
        hypopnea: (0, primitives_1.toInt)(record.hypopnea),
        step_value: (0, primitives_1.toInt)(record.stepValue ?? record.step_value),
        all_pack_number: (0, primitives_1.toInt)(record.allPackNumber ?? record.all_pack_number),
        current_pack_number: (0, primitives_1.toInt)(record.currentPackNumber ?? record.current_pack_number),
    };
}
//# sourceMappingURL=normalizers.js.map