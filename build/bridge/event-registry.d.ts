import type { LogScope, VeepooEvent, VeepooEventPayload } from "../types/index";
import { type EventNormalizer } from "./event-envelope";
/**
 * Declarative event metadata. One `EventDef` per JS event holds everything the
 * bridge needs: the JS name, the native emitter name (omitted for JS-local
 * events), the log scope used by the runtime debug logger, and the normalizer
 * that converts the raw native payload to the public {@link VeepooEventPayload}.
 *
 * `EVENT_DEFINITIONS` is the single source of truth — every other event table
 * (`NATIVE_EMITTED_EVENTS`, `NATIVE_TO_JS_EVENT_MAP`, `EVENT_LOG_SCOPES`,
 * `EVENT_NORMALIZERS`, `ALL_VEEPOO_EVENTS`, `JS_LOCAL_ONLY_EVENTS`,
 * `JS_EXPOSED_NATIVE_EVENTS`) is derived from it.
 */
export interface EventDef<K extends VeepooEvent> {
    readonly jsName: K;
    /** Native camelCase emitter name. Omit for JS-local-only events. */
    readonly nativeName?: string;
    readonly logScope: LogScope;
    readonly normalize: EventNormalizer<K>;
}
export declare const EVENT_DEFINITIONS: {
    error: EventDef<"error">;
    device_found: EventDef<"device_found">;
    device_connected: EventDef<"device_connected">;
    device_disconnected: EventDef<"device_disconnected">;
    device_connect_status: EventDef<"device_connect_status">;
    device_ready: EventDef<"device_ready">;
    bluetooth_state_changed: EventDef<"bluetooth_state_changed">;
    device_function: EventDef<"device_function">;
    device_version: EventDef<"device_version">;
    password_data: EventDef<"password_data">;
    social_msg_data: EventDef<"social_msg_data">;
    read_origin_progress: EventDef<"read_origin_progress">;
    read_origin_complete: EventDef<"read_origin_complete">;
    origin_five_minute_data: EventDef<"origin_five_minute_data">;
    origin_half_hour_data: EventDef<"origin_half_hour_data">;
    sleep_data: EventDef<"sleep_data">;
    sport_step_data: EventDef<"sport_step_data">;
    heart_rate_test_result: EventDef<"heart_rate_test_result">;
    blood_pressure_test_result: EventDef<"blood_pressure_test_result">;
    blood_oxygen_test_result: EventDef<"blood_oxygen_test_result">;
    temperature_test_result: EventDef<"temperature_test_result">;
    stress_data: EventDef<"stress_data">;
    blood_glucose_data: EventDef<"blood_glucose_data">;
    hrv_test_result: EventDef<"hrv_test_result">;
    ecg_test_result: EventDef<"ecg_test_result">;
    fatigue_test_result: EventDef<"fatigue_test_result">;
    breathing_test_result: EventDef<"breathing_test_result">;
    body_composition_test_result: EventDef<"body_composition_test_result">;
    health_glance_test_result: EventDef<"health_glance_test_result">;
    battery_data: EventDef<"battery_data">;
    connection_status_changed: EventDef<"connection_status_changed">;
    origin_spo2_data: EventDef<"origin_spo2_data">;
    alarm_data: EventDef<"alarm_data">;
    heart_rate_alarm_data: EventDef<"heart_rate_alarm_data">;
    spo2_alarm_data: EventDef<"spo2_alarm_data">;
    device_switches_data: EventDef<"device_switches_data">;
    find_device_state: EventDef<"find_device_state">;
    firmware_dfu_progress: EventDef<"firmware_dfu_progress">;
    contacts_data: EventDef<"contacts_data">;
    sos_call_times_data: EventDef<"sos_call_times_data">;
    camera_shutter: EventDef<"camera_shutter">;
    music_remote_command: EventDef<"music_remote_command">;
    device_bt_state_changed: EventDef<"device_bt_state_changed">;
    device_sos_triggered: EventDef<"device_sos_triggered">;
    custom_settings_data: EventDef<"custom_settings_data">;
    health_remind_data: EventDef<"health_remind_data">;
    apnea_remind_data: EventDef<"apnea_remind_data">;
    sport_mode_data: EventDef<"sport_mode_data">;
    blood_analysis_test_result: EventDef<"blood_analysis_test_result">;
    gsr_test_result: EventDef<"gsr_test_result">;
    exercise_session_data: EventDef<"exercise_session_data">;
    exercise_read_complete: EventDef<"exercise_read_complete">;
    exercise_read_progress: EventDef<"exercise_read_progress">;
    accurate_sleep_data: EventDef<"accurate_sleep_data">;
    stored_temperature_data: EventDef<"stored_temperature_data">;
    stored_blood_glucose_data: EventDef<"stored_blood_glucose_data">;
    stored_hrv_data: EventDef<"stored_hrv_data">;
    stored_ecg_data: EventDef<"stored_ecg_data">;
    stored_body_composition_data: EventDef<"stored_body_composition_data">;
    ptt_test_result: EventDef<"ptt_test_result">;
    ptt_state_changed: EventDef<"ptt_state_changed">;
    sdk_initialized: EventDef<"sdk_initialized">;
    scan_started: EventDef<"scan_started">;
    scan_stopped: EventDef<"scan_stopped">;
};
/** Native (camelCase) event names emitted by iOS/Android. */
export declare const NATIVE_EMITTED_EVENTS: readonly string[];
/** Maps each native camelCase event name to the snake_case name exposed to JS consumers. */
export declare const NATIVE_TO_JS_EVENT_MAP: Readonly<Record<string, VeepooEvent>>;
/** Log scope per event — used when the runtime logs an `event.<name>` debug entry. */
export declare const EVENT_LOG_SCOPES: Readonly<Record<VeepooEvent, LogScope>>;
/** Inner-payload normalizers, keyed by JS event name. */
export declare const EVENT_NORMALIZERS: { [K in VeepooEvent]: EventNormalizer<K>; };
/** Events emitted from JS only (no native addListener call). */
export declare const JS_LOCAL_ONLY_EVENTS: readonly VeepooEvent[];
/** JS event names sourced from native emitters. */
export declare const JS_EXPOSED_NATIVE_EVENTS: readonly VeepooEvent[];
/** All JS event names (native-sourced + JS-local). */
export declare const ALL_VEEPOO_EVENTS: readonly VeepooEvent[];
/**
 * Apply the per-event inner-payload normalizer declared in {@link EVENT_DEFINITIONS}
 * and then run `deepSnakeKeys` so consumers always see snake_case keys (ADR 0004).
 */
export declare function normalizeEventPayload<K extends VeepooEvent>(event: K, payload: unknown): VeepooEventPayload[K];
//# sourceMappingURL=event-registry.d.ts.map