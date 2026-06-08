"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeHeartRateTestResult = normalizeHeartRateTestResult;
exports.normalizeBloodPressureTestResult = normalizeBloodPressureTestResult;
exports.normalizeBloodOxygenTestResult = normalizeBloodOxygenTestResult;
exports.normalizeTemperatureTestResult = normalizeTemperatureTestResult;
exports.normalizeHrvTestResult = normalizeHrvTestResult;
exports.normalizeEcgTestResult = normalizeEcgTestResult;
exports.normalizeFatigueTestResult = normalizeFatigueTestResult;
exports.normalizeBreathingTestResult = normalizeBreathingTestResult;
exports.normalizeBodyCompositionTestResult = normalizeBodyCompositionTestResult;
exports.normalizeHealthGlanceResult = normalizeHealthGlanceResult;
exports.normalizeStressData = normalizeStressData;
exports.normalizeBloodGlucoseData = normalizeBloodGlucoseData;
exports.normalizeGsrTestResult = normalizeGsrTestResult;
exports.normalizeBloodAnalysisTestResult = normalizeBloodAnalysisTestResult;
exports.normalizePttTestResult = normalizePttTestResult;
const primitives_1 = require("../../shared/primitives");
function normalizeHeartRateTestResult(value) {
    const record = (0, primitives_1.isRecord)(value) ? value : {};
    return {
        state: (0, primitives_1.normalizeTestState)(record.rawState ?? record.state),
        value: (0, primitives_1.toInt)(record.value),
        progress: (0, primitives_1.toInt)(record.progress),
    };
}
function normalizeBloodPressureTestResult(value) {
    const record = (0, primitives_1.isRecord)(value) ? value : {};
    return {
        state: (0, primitives_1.normalizeTestState)(record.rawState ?? record.state),
        systolic: (0, primitives_1.toInt)(record.systolic ?? record.highPressure),
        diastolic: (0, primitives_1.toInt)(record.diastolic ?? record.lowPressure),
        pulse: (0, primitives_1.toInt)(record.pulse),
        progress: (0, primitives_1.toInt)(record.progress),
    };
}
function normalizeBloodOxygenTestResult(value) {
    const record = (0, primitives_1.isRecord)(value) ? value : {};
    return {
        state: (0, primitives_1.normalizeTestState)(record.rawState ?? record.state),
        value: (0, primitives_1.toInt)(record.value ?? record.oxygenValue),
        rate: (0, primitives_1.toInt)(record.rate ?? record.rateValue),
        progress: (0, primitives_1.toInt)(record.progress),
    };
}
function normalizeTemperatureTestResult(value) {
    const record = (0, primitives_1.isRecord)(value) ? value : {};
    return {
        state: (0, primitives_1.normalizeTestState)(record.rawState ?? record.state),
        value: (0, primitives_1.toNumber)(record.value ?? record.tempValue),
        original_temp: (0, primitives_1.toNumber)(record.originalTemp ?? record.original_temp ?? record.originalTempValue),
        progress: (0, primitives_1.toInt)(record.progress),
        enable: typeof record.enable === 'boolean' ? record.enable : undefined,
    };
}
function normalizeWaveform(value) {
    if (!Array.isArray(value))
        return undefined;
    const out = [];
    for (const x of value) {
        const n = typeof x === 'number' ? x : (0, primitives_1.toInt)(x);
        if (n !== undefined)
            out.push(n);
    }
    return out.length ? out : undefined;
}
function normalizeHrvTestResult(value) {
    const record = (0, primitives_1.isRecord)(value) ? value : {};
    return {
        state: (0, primitives_1.normalizeTestState)(record.rawState ?? record.state),
        value: (0, primitives_1.toInt)(record.value ?? record.hrv),
        progress: (0, primitives_1.toInt)(record.progress),
        raw_state: typeof record.rawState === 'string' ? record.rawState : undefined,
    };
}
function normalizeEcgTestResult(value) {
    const record = (0, primitives_1.isRecord)(value) ? value : {};
    return {
        state: (0, primitives_1.normalizeTestState)(record.rawState ?? record.state),
        progress: (0, primitives_1.toInt)(record.progress),
        heart_rate: (0, primitives_1.toInt)(record.heartRate ?? record.hr),
        hrv: (0, primitives_1.toInt)(record.hrv),
        raw_state: typeof record.rawState === 'string' ? record.rawState : undefined,
        waveform: normalizeWaveform(record.waveform),
    };
}
function normalizeFatigueTestResult(value) {
    const record = (0, primitives_1.isRecord)(value) ? value : {};
    return {
        state: (0, primitives_1.normalizeTestState)(record.rawState ?? record.state),
        progress: (0, primitives_1.toInt)(record.progress),
        level: (0, primitives_1.toInt)(record.level ?? record.fatigueLevel),
        raw_state: typeof record.rawState === 'string' ? record.rawState : undefined,
    };
}
function normalizeBreathingTestResult(value) {
    const record = (0, primitives_1.isRecord)(value) ? value : {};
    return {
        state: (0, primitives_1.normalizeTestState)(record.rawState ?? record.state),
        progress: (0, primitives_1.toInt)(record.progress),
        rate: (0, primitives_1.toInt)(record.rate ?? record.breathingRate),
        raw_state: typeof record.rawState === 'string' ? record.rawState : undefined,
    };
}
function normalizeBodyCompositionMetrics(value) {
    if (!(0, primitives_1.isRecord)(value))
        return undefined;
    const r = value;
    const mt = r.measurementTime;
    const timeRec = (0, primitives_1.isRecord)(mt) ? mt : undefined;
    return {
        date: typeof r.date === 'string' ? r.date : undefined,
        test_time: typeof r.testTime === 'string' ? r.testTime : undefined,
        is_device_test: typeof r.isDeviceTest === 'boolean' ? r.isDeviceTest : undefined,
        stature_cm: (0, primitives_1.toInt)(r.statureCm ?? r.stature),
        weight_kg: (0, primitives_1.toInt)(r.weightKg ?? r.weight),
        gender: (0, primitives_1.toInt)(r.gender),
        bmi: (0, primitives_1.toNumber)(r.bmi),
        body_fat_percentage: (0, primitives_1.toNumber)(r.bodyFatPercentage),
        fat_mass_kg: (0, primitives_1.toNumber)(r.fatMassKg ?? r.fatMass),
        lean_body_mass_kg: (0, primitives_1.toNumber)(r.leanBodyMassKg ?? r.leanBodyMass),
        muscle_rate: (0, primitives_1.toNumber)(r.muscleRate),
        muscle_mass_kg: (0, primitives_1.toNumber)(r.muscleMassKg ?? r.muscleMass),
        subcutaneous_fat_percentage: (0, primitives_1.toNumber)(r.subcutaneousFatPercentage ?? r.subcutaneousFat),
        body_water_percentage: (0, primitives_1.toNumber)(r.bodyWaterPercentage ?? r.bodyMoisture),
        water_mass_kg: (0, primitives_1.toNumber)(r.waterMassKg ?? r.waterContent),
        skeletal_muscle_rate: (0, primitives_1.toNumber)(r.skeletalMuscleRate),
        bone_mass_kg: (0, primitives_1.toNumber)(r.boneMassKg ?? r.boneMass),
        protein_percentage: (0, primitives_1.toNumber)(r.proteinPercentage ?? r.proportionOfProtein),
        protein_mass_kg: (0, primitives_1.toNumber)(r.proteinMassKg ?? r.proteinAmount),
        basal_metabolic_rate_kcal: (0, primitives_1.toNumber)(r.basalMetabolicRateKcal ?? r.basalMetabolicRate),
        measurement_duration_seconds: (0, primitives_1.toInt)(r.measurementDurationSeconds ?? r.duration),
        source_id_type: (0, primitives_1.toInt)(r.sourceIdType ?? r.idType),
        measurement_time: timeRec ?
            {
                year: (0, primitives_1.toInt)(timeRec.year),
                month: (0, primitives_1.toInt)(timeRec.month),
                day: (0, primitives_1.toInt)(timeRec.day),
                hour: (0, primitives_1.toInt)(timeRec.hour),
                minute: (0, primitives_1.toInt)(timeRec.minute),
            }
            : undefined,
    };
}
function normalizeBodyCompositionTestResult(value) {
    const record = (0, primitives_1.isRecord)(value) ? value : {};
    const raw = record.rawState;
    return {
        state: (0, primitives_1.normalizeTestState)(record.state),
        progress: (0, primitives_1.toInt)(record.progress),
        lead: (0, primitives_1.toInt)(record.lead),
        raw_state: typeof raw === 'string' || typeof raw === 'number' ? raw : undefined,
        is_end: typeof record.isEnd === 'boolean' ? record.isEnd : undefined,
        composition: normalizeBodyCompositionMetrics(record.composition),
    };
}
function normalizeHealthGlanceResult(value) {
    const r = (0, primitives_1.isRecord)(value) ? value : {};
    const raw = r.rawState;
    const pos = (v) => {
        const n = (0, primitives_1.toNumber)(v);
        return typeof n === 'number' && n > 0 ? n : undefined;
    };
    return {
        state: (0, primitives_1.normalizeTestState)(r.state),
        progress: (0, primitives_1.toInt)(r.progress),
        raw_state: typeof raw === 'string' || typeof raw === 'number' ? raw : undefined,
        is_end: typeof r.isEnd === 'boolean' ? r.isEnd : undefined,
        heart_rate: pos(r.heartRate),
        blood_oxygen: pos(r.bloodOxygen),
        stress: pos(r.stress),
        hrv: pos(r.hrv),
        body_temperature: pos(r.bodyTemperature),
        systolic: pos(r.systolic),
        diastolic: pos(r.diastolic),
        blood_sugar: pos(r.bloodSugar),
        fatigue_level: pos(r.fatigueLevel),
    };
}
function normalizeStressData(value) {
    const record = (0, primitives_1.isRecord)(value) ? value : {};
    return {
        stress: (0, primitives_1.toInt)(record.stress ?? record.value),
        timestamp: (0, primitives_1.toInt)(record.timestamp, Date.now()),
        progress: (0, primitives_1.toInt)(record.progress),
        status: (0, primitives_1.toStringValue)(record.status || (0, primitives_1.normalizeTestState)(record.rawState ?? record.state)),
        is_end: typeof record.isEnd === 'boolean' ? record.isEnd : undefined,
    };
}
function normalizeBloodGlucoseData(value) {
    const record = (0, primitives_1.isRecord)(value) ? value : {};
    return {
        glucose: (0, primitives_1.toNumber)(record.glucose ?? record.bloodGlucose),
        progress: (0, primitives_1.toInt)(record.progress),
        level: record.level === undefined || typeof record.level === 'number' || typeof record.level === 'string'
            ? record.level
            : undefined,
        state: record.state === undefined
            ? (0, primitives_1.normalizeTestState)(record.rawState ?? record.status)
            : (0, primitives_1.normalizeTestState)(record.rawState ?? record.state),
        status: (0, primitives_1.toStringValue)(record.status),
        timestamp: (0, primitives_1.toInt)(record.timestamp, Date.now()),
        is_end: typeof record.isEnd === 'boolean' ? record.isEnd : undefined,
        error: (0, primitives_1.toStringValue)(record.error),
    };
}
function normalizeGsrTestResult(value) {
    const record = (0, primitives_1.isRecord)(value) ? value : {};
    const elRaw = record.emotionLevel ?? record.emotion_level;
    return {
        state: (0, primitives_1.normalizeTestState)(record.state),
        progress: (0, primitives_1.toInt)(record.progress) ?? 0,
        emotion_level: elRaw != null ? (0, primitives_1.toInt)(elRaw) : null,
        skin_moisture: (0, primitives_1.toNumber)(record.skinMoisture ?? record.skin_moisture) ?? null,
        sns_activation: (0, primitives_1.toNumber)(record.snsActivation ?? record.sns_activation) ?? null,
        cortisol_value: (0, primitives_1.toNumber)(record.cortisolValue ?? record.cortisol_value) ?? null,
    };
}
function normalizeBloodAnalysisValues(value) {
    if (!(0, primitives_1.isRecord)(value))
        return null;
    const r = value;
    return {
        uric_acid: (0, primitives_1.toNumber)(r.uricAcid ?? r.uric_acid) ?? 0,
        total_cholesterol: (0, primitives_1.toNumber)(r.totalCholesterol ?? r.total_cholesterol) ?? 0,
        triglyceride: (0, primitives_1.toNumber)(r.triglyceride) ?? 0,
        high_density_lipoprotein: (0, primitives_1.toNumber)(r.highDensityLipoprotein ?? r.high_density_lipoprotein) ?? 0,
        low_density_lipoprotein: (0, primitives_1.toNumber)(r.lowDensityLipoprotein ?? r.low_density_lipoprotein) ?? 0,
    };
}
function normalizeBloodAnalysisTestResult(value) {
    const record = (0, primitives_1.isRecord)(value) ? value : {};
    return {
        state: (0, primitives_1.normalizeTestState)(record.state),
        progress: (0, primitives_1.toInt)(record.progress) ?? 0,
        values: (0, primitives_1.isRecord)(record.values) ? normalizeBloodAnalysisValues(record.values) : null,
    };
}
function normalizePttTestResult(value) {
    const record = (0, primitives_1.isRecord)(value) ? value : {};
    return {
        heart_rate: (0, primitives_1.toInt)(record.heartRate ?? record.heart_rate) ?? 0,
        hrv: (0, primitives_1.toInt)(record.hrv) ?? 0,
        qt_interval: (0, primitives_1.toInt)(record.qtInterval ?? record.qt_interval) ?? 0,
        signal_quality: (0, primitives_1.toInt)(record.signalQuality ?? record.signal_quality) ?? 0,
        progress: (0, primitives_1.toInt)(record.progress) ?? 0,
    };
}
//# sourceMappingURL=normalizers.js.map