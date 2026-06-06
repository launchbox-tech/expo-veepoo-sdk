export interface OriginData {
    time: string;
    heart_value: number;
    step_value: number;
    cal_value: number;
    dis_value: number;
    sport_value: number;
    systolic: number;
    diastolic: number;
    spo2_value: number;
    temp_value: number;
    stress_value: number;
    met: number;
    oxygens?: number[];
    ppgs?: number[];
    ecgs?: number[];
    res_rates?: number[];
    sleep_states?: number[];
    apnea_results?: number[];
    hypoxia_times?: number[];
    cardiac_loads?: number[];
    blood_glucose?: number;
}
export interface HalfHourData {
    time: string;
    heart_value?: number;
    sport_value?: number;
    step_value?: number;
    cal_value?: number;
    dis_value?: number;
    diastolic?: number;
    systolic?: number;
    spo2_value?: number;
    temp_value?: number;
    stress_value?: number;
    met?: number;
}
export interface Spo2OriginData {
    time: string;
    date: string;
    heart_value: number;
    value: number;
    rate: number;
    is_hypoxia: number;
    cardiac_load: number;
    temp1: number;
    sport_value: number;
    apnea_result: number;
    hypoxia_time: number;
    hypopnea: number;
    step_value: number;
    all_pack_number: number;
    current_pack_number: number;
}
export type ReadState = 'idle' | 'start' | 'reading' | 'complete' | 'invalid';
export interface ReadOriginProgress {
    read_state: ReadState;
    total_days: number;
    current_day: number;
    progress: number;
}
//# sourceMappingURL=types.d.ts.map