"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DECLARED_PACKAGE_FIELDS = exports.PACKAGE3_FIELDS = exports.PACKAGE2_FIELDS = exports.PACKAGE1_FIELDS = void 0;
exports.isDeclaredPackage = isDeclaredPackage;
exports.PACKAGE1_FIELDS = {
    blood_pressure: 'status',
    drinking: 'status',
    sedentary_remind: 'status',
    heart_rate_warning: 'status',
    we_chat_sport: 'status',
    camera: 'status',
    fatigue: 'status',
    spo_h: 'status',
    spo2_h_adjustment: 'status',
    spo_h_breath_break: 'status',
    woman: 'status',
    alarm: 'status',
    new_calc_sport: 'status',
    ambulatory_bp_adjustment: 'status',
    screen_light: 'status',
    heart_rate_detect: 'status',
    night_turn_setting: 'status',
    text_alarm: 'status',
    temperature_function: 'status',
};
exports.PACKAGE2_FIELDS = {
    count_down: 'status',
    sport_model_function: 'status',
    hid_function: 'status',
    screen_style_function: 'status',
    breath_function: 'status',
    hrv_function: 'status',
    weather_function: 'status',
    screen_light_time: 'status',
    precision_sleep: 'status',
    ecg_function: 'status',
    mult_sport_mode: 'status',
    low_power: 'status',
    sleep_tag: 'number',
    watch_data_day_number: 'number',
    contact_msg_length: 'number',
    all_msg_length: 'number',
    sport_model_day: 'number',
    screenstyle: 'number',
    weather_style: 'number',
    origin_protocol_version: 'number',
    ecg_type: 'number',
};
exports.PACKAGE3_FIELDS = {
    big_data_tran_type: 'number',
    watch_ui_server_count: 'number',
    watch_ui_custom_count: 'number',
    temperature_function: 'status',
    temperature_type: 'number',
    cpu_type: 'number',
    stress_function: 'status',
    stress_type: 'number',
    contact_function: 'status',
    contact_type: 'number',
    music_style: 'number',
    find_device_by_phone_function: 'status',
    agps_function: 'status',
    blood_glucose_tag: 'number',
    blood_glucose: 'status',
    blood_glucose_adjusting: 'status',
    blood_glucose_multiple_adjusting: 'status',
    blood_glucose_risk_assessment: 'status',
    blood_component: 'status',
    body_component: 'status',
};
/**
 * Every package the native layer is allowed to emit, keyed by the wrapper key
 * it arrives under. A package missing from here has no declared shape, so the
 * key contract check fails rather than letting an unreadable payload through.
 */
exports.DECLARED_PACKAGE_FIELDS = {
    package1: exports.PACKAGE1_FIELDS,
    package2: exports.PACKAGE2_FIELDS,
    package3: exports.PACKAGE3_FIELDS,
};
/** True when the native layer emitted a package the declared types cover. */
function isDeclaredPackage(name) {
    return name in exports.DECLARED_PACKAGE_FIELDS;
}
//# sourceMappingURL=declared-keys.js.map