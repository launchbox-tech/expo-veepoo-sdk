export type FunctionStatus = 'unsupported' | 'support' | 'open' | 'close' | 'unknown';
export interface DeviceFunctionPackage1 {
    blood_pressure?: FunctionStatus;
    drinking?: FunctionStatus;
    sedentary_remind?: FunctionStatus;
    heart_rate_warning?: FunctionStatus;
    we_chat_sport?: FunctionStatus;
    camera?: FunctionStatus;
    fatigue?: FunctionStatus;
    spo_h?: FunctionStatus;
    spo2_h_adjustment?: FunctionStatus;
    spo_h_breath_break?: FunctionStatus;
    woman?: FunctionStatus;
    alarm?: FunctionStatus;
    new_calc_sport?: FunctionStatus;
    ambulatory_bp_adjustment?: FunctionStatus;
    screen_light?: FunctionStatus;
    heart_rate_detect?: FunctionStatus;
    night_turn_setting?: FunctionStatus;
    text_alarm?: FunctionStatus;
    temperature_function?: FunctionStatus;
}
export interface DeviceFunctionPackage2 {
    count_down?: FunctionStatus;
    sport_model_function?: FunctionStatus;
    hid_function?: FunctionStatus;
    screen_style_function?: FunctionStatus;
    breath_function?: FunctionStatus;
    hrv_function?: FunctionStatus;
    weather_function?: FunctionStatus;
    screen_light_time?: FunctionStatus;
    precision_sleep?: FunctionStatus;
    ecg_function?: FunctionStatus;
    mult_sport_mode?: FunctionStatus;
    low_power?: FunctionStatus;
    sleep_tag?: number;
    watch_data_day_number?: number;
    contact_msg_length?: number;
    all_msg_length?: number;
    sport_model_day?: number;
    screenstyle?: number;
    weather_style?: number;
    origin_protocol_version?: number;
    ecg_type?: number;
}
export interface DeviceFunctionPackage3 {
    big_data_tran_type?: number;
    watch_ui_server_count?: number;
    watch_ui_custom_count?: number;
    temperature_function?: FunctionStatus;
    temperature_type?: number;
    cpu_type?: number;
    stress_function?: FunctionStatus;
    stress_type?: number;
    contact_function?: FunctionStatus;
    contact_type?: number;
    music_style?: number;
    find_device_by_phone_function?: FunctionStatus;
    agps_function?: FunctionStatus;
    blood_glucose_tag?: number;
    blood_glucose?: FunctionStatus;
    blood_glucose_adjusting?: FunctionStatus;
    blood_glucose_multiple_adjusting?: FunctionStatus;
    blood_glucose_risk_assessment?: FunctionStatus;
    blood_component?: FunctionStatus;
    body_component?: FunctionStatus;
}
export interface DeviceFunctionPackage4 {
    blood_component?: FunctionStatus;
    blood_component_single_calibration?: FunctionStatus;
    body_component?: FunctionStatus;
    world_clock?: FunctionStatus;
    auto_measure?: FunctionStatus;
    temperature_alarm?: FunctionStatus;
    wallet?: FunctionStatus;
    postcard?: FunctionStatus;
    game_setting?: FunctionStatus;
    ai_qa?: FunctionStatus;
    ai_dial?: FunctionStatus;
    distance_calorie_goal?: FunctionStatus;
    video_dial?: FunctionStatus;
    photo_album?: FunctionStatus;
    mini_checkup?: FunctionStatus;
}
export interface DeviceFunctionPackage5 {
    text_image_push: FunctionStatus;
}
export interface DeviceFunctions {
    package1?: DeviceFunctionPackage1;
    package2?: DeviceFunctionPackage2;
    package3?: DeviceFunctionPackage3;
    package4?: DeviceFunctionPackage4;
    package5?: DeviceFunctionPackage5;
}
//# sourceMappingURL=types.d.ts.map