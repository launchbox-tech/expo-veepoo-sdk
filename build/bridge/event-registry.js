"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_VEEPOO_EVENTS = exports.JS_EXPOSED_NATIVE_EVENTS = exports.JS_LOCAL_ONLY_EVENTS = exports.EVENT_NORMALIZERS = exports.EVENT_LOG_SCOPES = exports.NATIVE_TO_JS_EVENT_MAP = exports.NATIVE_EMITTED_EVENTS = exports.EVENT_DEFINITIONS = void 0;
exports.normalizeEventPayload = normalizeEventPayload;
const deep_keys_1 = require("../shared/deep-keys");
const primitives_1 = require("../shared/primitives");
const event_envelope_1 = require("./event-envelope");
// ── Capability normalizers (functions only; events are declared below) ─────
const normalizers_1 = require("../capabilities/alarms/normalizers");
const battery_1 = require("../capabilities/battery");
const bt_status_1 = require("../capabilities/bt-status");
const camera_1 = require("../capabilities/camera");
const normalizers_2 = require("../capabilities/contacts/normalizers");
const index_1 = require("../capabilities/device-functions/normalizers/index");
const device_version_1 = require("../capabilities/device-version");
const dfu_1 = require("../capabilities/dfu");
const find_device_1 = require("../capabilities/find-device");
const historical_query_1 = require("../capabilities/historical-query");
const music_1 = require("../capabilities/music");
const normalizers_3 = require("../capabilities/origin-data/normalizers");
const registry_1 = require("../capabilities/realtime-tests/registry");
const normalizers_4 = require("../capabilities/session/normalizers");
const normalizers_5 = require("../capabilities/sleep-data/normalizers");
const social_msg_1 = require("../capabilities/social-msg");
const sos_1 = require("../capabilities/sos");
const sport_steps_1 = require("../capabilities/sport-steps");
function defineEvent(def) {
    return def;
}
function emptyPayload() {
    return () => ({});
}
// ── Single source of truth ────────────────────────────────────────────────
const EVENT_DEFINITIONS_CORE = {
    // ── scan / discovery ─────────────────────────────────────────────────
    device_found: defineEvent({
        jsName: "device_found",
        nativeName: "deviceFound",
        logScope: "scan",
        normalize: (0, event_envelope_1.passthrough)(),
    }),
    scan_started: defineEvent({
        jsName: "scan_started",
        logScope: "scan",
        normalize: emptyPayload(),
    }),
    scan_stopped: defineEvent({
        jsName: "scan_stopped",
        logScope: "scan",
        normalize: emptyPayload(),
    }),
    // ── bluetooth ────────────────────────────────────────────────────────
    bluetooth_state_changed: defineEvent({
        jsName: "bluetooth_state_changed",
        nativeName: "bluetoothStateChanged",
        logScope: "bluetooth",
        normalize: (raw) => {
            const p = (0, primitives_1.isRecord)(raw) ? raw : {};
            return (0, normalizers_4.normalizeBluetoothStatus)(p);
        },
    }),
    // ── connection / session ─────────────────────────────────────────────
    device_connected: defineEvent({
        jsName: "device_connected",
        nativeName: "deviceConnected",
        logScope: "connection",
        normalize: (0, event_envelope_1.passthrough)(),
    }),
    device_disconnected: defineEvent({
        jsName: "device_disconnected",
        nativeName: "deviceDisconnected",
        logScope: "connection",
        normalize: (0, event_envelope_1.passthrough)(),
    }),
    device_connect_status: defineEvent({
        jsName: "device_connect_status",
        nativeName: "deviceConnectStatus",
        logScope: "connection",
        normalize: (0, event_envelope_1.passthrough)(),
    }),
    device_ready: defineEvent({
        jsName: "device_ready",
        nativeName: "deviceReady",
        logScope: "connection",
        normalize: (0, event_envelope_1.passthrough)(),
    }),
    connection_status_changed: defineEvent({
        jsName: "connection_status_changed",
        nativeName: "connectionStatusChanged",
        logScope: "connection",
        normalize: (0, event_envelope_1.passthrough)(),
    }),
    connect_pending: defineEvent({
        jsName: "connect_pending",
        nativeName: "connectPending",
        logScope: "connection",
        normalize: (0, event_envelope_1.passthrough)(),
    }),
    password_data: defineEvent({
        jsName: "password_data",
        nativeName: "passwordData",
        logScope: "device",
        normalize: (0, event_envelope_1.wrapInner)("data", normalizers_4.normalizePasswordData),
    }),
    // ── origin / historical reads ────────────────────────────────────────
    read_origin_progress: defineEvent({
        jsName: "read_origin_progress",
        nativeName: "readOriginProgress",
        logScope: "read",
        normalize: (raw) => (0, normalizers_3.normalizeReadOriginProgressPayload)(raw),
    }),
    read_origin_complete: defineEvent({
        jsName: "read_origin_complete",
        nativeName: "readOriginComplete",
        logScope: "read",
        normalize: (0, event_envelope_1.passthrough)(),
    }),
    origin_five_minute_data: defineEvent({
        jsName: "origin_five_minute_data",
        nativeName: "originFiveMinuteData",
        logScope: "read",
        normalize: (0, event_envelope_1.wrapInner)("data", (raw) => (0, normalizers_3.normalizeOriginDataList)([raw])[0]),
    }),
    origin_half_hour_data: defineEvent({
        jsName: "origin_half_hour_data",
        nativeName: "originHalfHourData",
        logScope: "read",
        normalize: (0, event_envelope_1.wrapInner)("data", normalizers_3.normalizeHalfHourData),
    }),
    origin_spo2_data: defineEvent({
        jsName: "origin_spo2_data",
        nativeName: "originSpo2Data",
        logScope: "device",
        normalize: (0, event_envelope_1.wrapInner)("data", normalizers_3.normalizeSpo2OriginData),
    }),
    sleep_data: defineEvent({
        jsName: "sleep_data",
        nativeName: "sleepData",
        logScope: "read",
        normalize: (0, event_envelope_1.wrapInner)("data", (raw) => (0, normalizers_5.normalizeSleepDataList)(raw)[0]),
    }),
    accurate_sleep_data: defineEvent({
        jsName: "accurate_sleep_data",
        nativeName: "accurateSleepData",
        logScope: "device",
        normalize: (0, event_envelope_1.passthrough)(),
    }),
    sport_step_data: defineEvent({
        jsName: "sport_step_data",
        nativeName: "sportStepData",
        logScope: "read",
        normalize: (0, event_envelope_1.wrapInner)("data", sport_steps_1.normalizeSportStepData),
    }),
    exercise_session_data: defineEvent({
        jsName: "exercise_session_data",
        nativeName: "exerciseSessionData",
        logScope: "device",
        // Sport `type` VALUE arrives camelCase from the native tables —
        // deepSnakeKeys only rewrites keys (ADR 0013).
        normalize: (0, event_envelope_1.wrapInner)("session", historical_query_1.normalizeExerciseSessionInner),
    }),
    exercise_read_complete: defineEvent({
        jsName: "exercise_read_complete",
        nativeName: "exerciseReadComplete",
        logScope: "read",
        normalize: (0, event_envelope_1.passthrough)(),
    }),
    exercise_read_progress: defineEvent({
        jsName: "exercise_read_progress",
        nativeName: "exerciseReadProgress",
        logScope: "read",
        normalize: (0, event_envelope_1.passthrough)(),
    }),
    stored_temperature_data: defineEvent({
        jsName: "stored_temperature_data",
        nativeName: "storedTemperatureData",
        logScope: "device",
        normalize: (0, event_envelope_1.passthrough)(),
    }),
    stored_blood_glucose_data: defineEvent({
        jsName: "stored_blood_glucose_data",
        nativeName: "storedBloodGlucoseData",
        logScope: "device",
        normalize: (0, event_envelope_1.passthrough)(),
    }),
    stored_hrv_data: defineEvent({
        jsName: "stored_hrv_data",
        nativeName: "storedHrvData",
        logScope: "device",
        normalize: (0, event_envelope_1.passthrough)(),
    }),
    stored_ecg_data: defineEvent({
        jsName: "stored_ecg_data",
        nativeName: "storedEcgData",
        logScope: "device",
        normalize: (0, event_envelope_1.passthrough)(),
    }),
    stored_body_composition_data: defineEvent({
        jsName: "stored_body_composition_data",
        nativeName: "storedBodyCompositionData",
        logScope: "device",
        normalize: (0, event_envelope_1.passthrough)(),
    }),
    // ── realtime tests ───────────────────────────────────────────────────
    // The 14 *_test_result / stress_data / blood_glucose_data event defs are
    // derived from REALTIME_TEST_DEFINITIONS — see `realtimeTestEventDefs` below
    // and the spread into EVENT_DEFINITIONS that follows this object.
    ptt_state_changed: defineEvent({
        jsName: "ptt_state_changed",
        nativeName: "pttStateChanged",
        logScope: "device",
        normalize: (0, event_envelope_1.passthrough)(),
    }),
    // ── alarms ───────────────────────────────────────────────────────────
    alarm_data: defineEvent({
        jsName: "alarm_data",
        nativeName: "alarmData",
        logScope: "device",
        normalize: (0, event_envelope_1.wrapInner)("alarms", normalizers_1.normalizeAlarmList, { fallbackKey: "data" }),
    }),
    heart_rate_alarm_data: defineEvent({
        jsName: "heart_rate_alarm_data",
        logScope: "device",
        normalize: (0, event_envelope_1.wrapInner)("data", normalizers_1.normalizeHeartRateAlarm),
    }),
    spo2_alarm_data: defineEvent({
        jsName: "spo2_alarm_data",
        logScope: "device",
        normalize: (0, event_envelope_1.passthrough)(),
    }),
    // ── device metadata / settings ───────────────────────────────────────
    battery_data: defineEvent({
        jsName: "battery_data",
        nativeName: "batteryData",
        logScope: "device",
        normalize: (0, event_envelope_1.wrapInner)("data", battery_1.normalizeBatteryInfo),
    }),
    device_version: defineEvent({
        jsName: "device_version",
        nativeName: "deviceVersion",
        logScope: "device",
        normalize: (0, event_envelope_1.wrapInner)("version", device_version_1.normalizeDeviceVersion),
    }),
    device_function: defineEvent({
        jsName: "device_function",
        nativeName: "deviceFunction",
        logScope: "device",
        normalize: (raw) => {
            const p = (0, primitives_1.isRecord)(raw) ? raw : {};
            return {
                ...p,
                data: (0, index_1.normalizeDeviceFunctions)(p.data ?? p.functions),
                functions: (0, index_1.normalizeDeviceFunctions)(p.functions ?? p.data),
            };
        },
    }),
    device_bt_state_changed: defineEvent({
        jsName: "device_bt_state_changed",
        nativeName: "deviceBTStateChanged",
        logScope: "device",
        normalize: (raw) => {
            const p = (0, primitives_1.isRecord)(raw) ? raw : {};
            return {
                ...p,
                state: (0, bt_status_1.normalizeDeviceBTState)(p.state ?? p.btState),
                bt_switch_open: (p.btSwitchOpen ?? p.bt_switch_open) === true,
                media_switch_open: (p.mediaSwitchOpen ?? p.media_switch_open) === true,
            };
        },
    }),
    device_switches_data: defineEvent({
        jsName: "device_switches_data",
        logScope: "device",
        normalize: (0, event_envelope_1.passthrough)(),
    }),
    find_device_state: defineEvent({
        jsName: "find_device_state",
        nativeName: "findDeviceState",
        logScope: "device",
        normalize: (raw) => {
            const p = (0, primitives_1.isRecord)(raw) ? raw : {};
            return (0, find_device_1.normalizeFindDeviceStatePayload)(p);
        },
    }),
    firmware_dfu_progress: defineEvent({
        jsName: "firmware_dfu_progress",
        nativeName: "firmwareDfuProgress",
        logScope: "device",
        normalize: (raw) => (0, dfu_1.normalizeFirmwareDfuProgress)(raw),
    }),
    contacts_data: defineEvent({
        jsName: "contacts_data",
        nativeName: "contactsData",
        logScope: "device",
        normalize: (0, event_envelope_1.wrapInner)("contacts", normalizers_2.normalizeContactList, { fallbackKey: "data" }),
    }),
    sos_call_times_data: defineEvent({
        jsName: "sos_call_times_data",
        nativeName: "sosCallTimesData",
        logScope: "device",
        normalize: (0, event_envelope_1.wrapInner)("data", sos_1.normalizeSosCallTimesSettings),
    }),
    device_sos_triggered: defineEvent({
        jsName: "device_sos_triggered",
        nativeName: "deviceSosTriggered",
        logScope: "device",
        normalize: (0, event_envelope_1.passthrough)(),
    }),
    camera_shutter: defineEvent({
        jsName: "camera_shutter",
        nativeName: "cameraShutter",
        logScope: "device",
        normalize: (0, event_envelope_1.wrapInner)("status", camera_1.normalizeCameraShutterStatus),
    }),
    music_remote_command: defineEvent({
        jsName: "music_remote_command",
        nativeName: "musicRemoteCommand",
        logScope: "device",
        normalize: (0, event_envelope_1.wrapInner)("command", music_1.normalizeMusicRemoteCommand),
    }),
    social_msg_data: defineEvent({
        jsName: "social_msg_data",
        nativeName: "socialMsgData",
        logScope: "device",
        normalize: (0, event_envelope_1.wrapInner)("data", social_msg_1.normalizeSocialMsgData),
    }),
    sport_mode_data: defineEvent({
        jsName: "sport_mode_data",
        nativeName: "sportModeData",
        logScope: "device",
        normalize: (raw) => {
            const p = (0, primitives_1.isRecord)(raw) ? raw : {};
            const rawMode = p.mode;
            // Native sends camelCase e.g. "outdoorRun"; TypeScript SportMode is snake_case "outdoor_run"
            const mode = typeof rawMode === "string" && rawMode !== "" && rawMode !== "common"
                ? rawMode.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)
                : null;
            return { ...p, mode };
        },
    }),
    // ── orphan payload types declared in types/events.ts ────────────────
    custom_settings_data: defineEvent({
        jsName: "custom_settings_data",
        nativeName: "customSettingsData",
        logScope: "device",
        normalize: (0, event_envelope_1.passthrough)(),
    }),
    health_remind_data: defineEvent({
        jsName: "health_remind_data",
        nativeName: "healthRemindData",
        logScope: "device",
        normalize: (0, event_envelope_1.passthrough)(),
    }),
    apnea_remind_data: defineEvent({
        jsName: "apnea_remind_data",
        nativeName: "apneaRemindData",
        logScope: "device",
        normalize: (0, event_envelope_1.passthrough)(),
    }),
    // ── SDK lifecycle ────────────────────────────────────────────────────
    error: defineEvent({
        jsName: "error",
        nativeName: "error",
        logScope: "sdk",
        normalize: (0, event_envelope_1.passthrough)(),
    }),
    sdk_initialized: defineEvent({
        jsName: "sdk_initialized",
        logScope: "sdk",
        normalize: emptyPayload(),
    }),
};
const REALTIME_TEST_EVENT_DEFINITIONS = Object.fromEntries(Object.values(registry_1.REALTIME_TEST_DEFINITIONS).map((row) => {
    const def = defineEvent({
        jsName: row.event,
        nativeName: (0, registry_1.eventNameToNative)(row.event),
        logScope: row.logScope,
        normalize: (0, event_envelope_1.wrapInner)(row.eventField, row.normalize),
    });
    return [row.event, def];
}));
exports.EVENT_DEFINITIONS = {
    ...EVENT_DEFINITIONS_CORE,
    ...REALTIME_TEST_EVENT_DEFINITIONS,
};
const allDefs = Object.values(exports.EVENT_DEFINITIONS);
const nativeDefs = allDefs.filter((d) => typeof d.nativeName === "string");
/** Native (camelCase) event names emitted by iOS/Android. */
exports.NATIVE_EMITTED_EVENTS = nativeDefs.map((d) => d.nativeName);
/** Maps each native camelCase event name to the snake_case name exposed to JS consumers. */
exports.NATIVE_TO_JS_EVENT_MAP = Object.fromEntries(nativeDefs.map((d) => [d.nativeName, d.jsName]));
/** Log scope per event — used when the runtime logs an `event.<name>` debug entry. */
exports.EVENT_LOG_SCOPES = Object.fromEntries(allDefs.map((d) => [d.jsName, d.logScope]));
/** Inner-payload normalizers, keyed by JS event name. */
exports.EVENT_NORMALIZERS = Object.fromEntries(allDefs.map((d) => [d.jsName, d.normalize]));
/** Events emitted from JS only (no native addListener call). */
exports.JS_LOCAL_ONLY_EVENTS = allDefs
    .filter((d) => d.nativeName === undefined)
    .map((d) => d.jsName);
/** JS event names sourced from native emitters. */
exports.JS_EXPOSED_NATIVE_EVENTS = nativeDefs.map((d) => d.jsName);
/** All JS event names (native-sourced + JS-local). */
exports.ALL_VEEPOO_EVENTS = allDefs.map((d) => d.jsName);
/**
 * Apply the per-event inner-payload normalizer declared in {@link EVENT_DEFINITIONS}
 * and then run `deepSnakeKeys` so consumers always see snake_case keys (ADR 0004).
 */
function normalizeEventPayload(event, payload) {
    return (0, deep_keys_1.deepSnakeKeys)(exports.EVENT_NORMALIZERS[event](payload));
}
//# sourceMappingURL=event-registry.js.map