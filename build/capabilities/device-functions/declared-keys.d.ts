/**
 * The kind of value a declared package field carries: a {@link FunctionStatus}
 * or a plain number. Nested native payloads are read through these tables, so
 * a key that is not declared here never reaches JS under a lying cast.
 */
export type FieldKind = 'status' | 'number';
export declare const PACKAGE1_FIELDS: {
    readonly blood_pressure: "status";
    readonly drinking: "status";
    readonly sedentary_remind: "status";
    readonly heart_rate_warning: "status";
    readonly we_chat_sport: "status";
    readonly camera: "status";
    readonly fatigue: "status";
    readonly spo_h: "status";
    readonly spo2_h_adjustment: "status";
    readonly spo_h_breath_break: "status";
    readonly woman: "status";
    readonly alarm: "status";
    readonly new_calc_sport: "status";
    readonly ambulatory_bp_adjustment: "status";
    readonly screen_light: "status";
    readonly heart_rate_detect: "status";
    readonly night_turn_setting: "status";
    readonly text_alarm: "status";
    readonly temperature_function: "status";
};
export declare const PACKAGE2_FIELDS: {
    readonly count_down: "status";
    readonly sport_model_function: "status";
    readonly hid_function: "status";
    readonly screen_style_function: "status";
    readonly breath_function: "status";
    readonly hrv_function: "status";
    readonly weather_function: "status";
    readonly screen_light_time: "status";
    readonly precision_sleep: "status";
    readonly ecg_function: "status";
    readonly mult_sport_mode: "status";
    readonly low_power: "status";
    readonly sleep_tag: "number";
    readonly watch_data_day_number: "number";
    readonly contact_msg_length: "number";
    readonly all_msg_length: "number";
    readonly sport_model_day: "number";
    readonly screenstyle: "number";
    readonly weather_style: "number";
    readonly origin_protocol_version: "number";
    readonly ecg_type: "number";
};
export declare const PACKAGE3_FIELDS: {
    readonly big_data_tran_type: "number";
    readonly watch_ui_server_count: "number";
    readonly watch_ui_custom_count: "number";
    readonly temperature_function: "status";
    readonly temperature_type: "number";
    readonly cpu_type: "number";
    readonly stress_function: "status";
    readonly stress_type: "number";
    readonly contact_function: "status";
    readonly contact_type: "number";
    readonly music_style: "number";
    readonly find_device_by_phone_function: "status";
    readonly agps_function: "status";
    readonly blood_glucose_tag: "number";
    readonly blood_glucose: "status";
    readonly blood_glucose_adjusting: "status";
    readonly blood_glucose_multiple_adjusting: "status";
    readonly blood_glucose_risk_assessment: "status";
    readonly blood_component: "status";
    readonly body_component: "status";
};
/**
 * Every package the native layer is allowed to emit, keyed by the wrapper key
 * it arrives under. A package missing from here has no declared shape, so the
 * key contract check fails rather than letting an unreadable payload through.
 */
export declare const DECLARED_PACKAGE_FIELDS: {
    readonly package1: {
        readonly blood_pressure: "status";
        readonly drinking: "status";
        readonly sedentary_remind: "status";
        readonly heart_rate_warning: "status";
        readonly we_chat_sport: "status";
        readonly camera: "status";
        readonly fatigue: "status";
        readonly spo_h: "status";
        readonly spo2_h_adjustment: "status";
        readonly spo_h_breath_break: "status";
        readonly woman: "status";
        readonly alarm: "status";
        readonly new_calc_sport: "status";
        readonly ambulatory_bp_adjustment: "status";
        readonly screen_light: "status";
        readonly heart_rate_detect: "status";
        readonly night_turn_setting: "status";
        readonly text_alarm: "status";
        readonly temperature_function: "status";
    };
    readonly package2: {
        readonly count_down: "status";
        readonly sport_model_function: "status";
        readonly hid_function: "status";
        readonly screen_style_function: "status";
        readonly breath_function: "status";
        readonly hrv_function: "status";
        readonly weather_function: "status";
        readonly screen_light_time: "status";
        readonly precision_sleep: "status";
        readonly ecg_function: "status";
        readonly mult_sport_mode: "status";
        readonly low_power: "status";
        readonly sleep_tag: "number";
        readonly watch_data_day_number: "number";
        readonly contact_msg_length: "number";
        readonly all_msg_length: "number";
        readonly sport_model_day: "number";
        readonly screenstyle: "number";
        readonly weather_style: "number";
        readonly origin_protocol_version: "number";
        readonly ecg_type: "number";
    };
    readonly package3: {
        readonly big_data_tran_type: "number";
        readonly watch_ui_server_count: "number";
        readonly watch_ui_custom_count: "number";
        readonly temperature_function: "status";
        readonly temperature_type: "number";
        readonly cpu_type: "number";
        readonly stress_function: "status";
        readonly stress_type: "number";
        readonly contact_function: "status";
        readonly contact_type: "number";
        readonly music_style: "number";
        readonly find_device_by_phone_function: "status";
        readonly agps_function: "status";
        readonly blood_glucose_tag: "number";
        readonly blood_glucose: "status";
        readonly blood_glucose_adjusting: "status";
        readonly blood_glucose_multiple_adjusting: "status";
        readonly blood_glucose_risk_assessment: "status";
        readonly blood_component: "status";
        readonly body_component: "status";
    };
};
export type DeclaredPackageName = keyof typeof DECLARED_PACKAGE_FIELDS;
/** True when the native layer emitted a package the declared types cover. */
export declare function isDeclaredPackage(name: string): name is DeclaredPackageName;
//# sourceMappingURL=declared-keys.d.ts.map