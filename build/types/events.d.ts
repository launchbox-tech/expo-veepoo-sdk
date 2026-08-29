import type { VeepooDevice, ConnectionStatus, BluetoothStatus, PasswordData } from './connection';
import type { BatteryInfo } from '../capabilities/battery';
import type { CameraShutterStatus } from '../capabilities/camera';
import type { DeviceAlarm, HeartRateAlarm, Spo2Alarm } from '../capabilities/alarms/types';
import type { DeviceBTState } from '../capabilities/bt-status';
import type { DeviceContact } from '../capabilities/contacts/types';
import type { DeviceFunctions } from '../capabilities/device-functions/types';
import type { DeviceVersion } from '../capabilities/device-version';
import type { DeviceSwitches } from '../capabilities/device-switches';
import type { FindDevicePhase } from '../capabilities/find-device';
import type { MusicRemoteCommand } from '../capabilities/music';
import type { SocialMsgData } from '../capabilities/social-msg';
import type { SosCallTimesSettings } from '../capabilities/sos';
import type { SportMode } from '../capabilities/sport-mode/types';
import type { AccurateSleepSession, SleepData } from '../capabilities/sleep-data/types';
import type { SportStepData } from '../capabilities/sport-steps';
import type { HalfHourData, OriginData, Spo2OriginData, ReadOriginProgress } from '../capabilities/origin-data/types';
import type { ExerciseReadProgress, ExerciseSession, StoredTemperatureData, StoredBloodGlucoseData, StoredHrvData, StoredEcgData, StoredBodyCompositionData } from '../capabilities/historical-query';
import type { BloodGlucoseData, StressData, BloodAnalysisTestResult, BloodOxygenTestResult, GsrTestResult, PttTestResult, PttState, BloodPressureTestResult, BodyCompositionTestResult, BreathingTestResult, EcgTestResult, FatigueTestResult, HealthGlanceResult, HeartRateTestResult, HrvTestResult, TemperatureTestResult } from '../capabilities/realtime-tests/types';
import type { VeepooError } from './errors';
import type { BloodGlucoseUnit, SkinTone, TemperatureUnit } from './settings';
/** Generic key/value bag used by the `custom_settings_data` payload. */
export interface CustomSettingData {
    [key: string]: string | number | boolean;
}
/** Generic device-scoped envelope (public API only — kept for compat). */
export interface DeviceData {
    device_id: string;
    data: unknown;
}
/** Reminder type passed to `readHealthReminder` / `setHealthReminder`. */
export type HealthReminderType = 'sedentary' | 'drink_water' | 'look_far_away' | 'sport' | 'take_medicine' | 'read' | 'trip' | 'wash_hands';
export interface HealthReminder {
    type: HealthReminderType;
    start_hour: number;
    start_minute: number;
    end_hour: number;
    end_minute: number;
    /** Reminder interval in minutes. */
    interval: number;
    enabled: boolean;
}
/** SpO2 apnea alert settings. iOS only — Android rejects with CAPABILITY_UNSUPPORTED. Event-only payload. */
export interface ApneaRemindSettings {
    enabled: boolean;
    /** SpO2 threshold (%) below which the apnea alert fires. */
    threshold: number;
}
/**
 * User preference bag pushed to the Band via `setCustomSettings`. Composed
 * from cross-cutting unit conventions declared in `types/settings.ts`.
 */
export type CustomSettings = {
    temperature_unit: TemperatureUnit;
    blood_glucose_unit: BloodGlucoseUnit;
    skin_tone: SkinTone;
};
/** Normalized DFU / OTA progress (`firmware_dfu_progress` event). */
export type FirmwareDfuState = 'file_not_exist' | 'start' | 'updating' | 'success' | 'failure' | 'prepared' | 'reboot' | 'reconnecting' | 'dfu_lang_connect_success' | 'dfu_lang_connect_failed' | 'unknown';
export type FirmwareDfuProgress = {
    device_id: string;
    /** 0–100 */
    progress: number;
    state: FirmwareDfuState;
    message?: string;
};
/**
 * Single source of truth for SDK events: each key is an event name, value is its listener payload.
 * {@link VeepooEvent} is `keyof VeepooEventPayload`.
 */
export type VeepooEventPayload = {
    device_found: {
        device: VeepooDevice;
        timestamp: number;
    };
    device_connected: {
        device_id: string;
        device_version?: string;
        device_number?: string;
        is_oad_model?: boolean;
    };
    device_disconnected: {
        device_id: string;
    };
    device_connect_status: {
        device_id: string;
        status: ConnectionStatus;
        code?: number;
    };
    device_ready: {
        device_id: string;
        is_oad_model?: boolean;
        mac?: string | null;
        uuid?: string | null;
        raw_status?: number;
    };
    bluetooth_state_changed: BluetoothStatus;
    device_function: {
        device_id: string;
        functions?: DeviceFunctions;
        data?: DeviceFunctions;
    };
    device_version: {
        device_id: string;
        version: DeviceVersion;
    };
    password_data: {
        device_id: string;
        data: PasswordData;
    };
    social_msg_data: {
        device_id: string;
        data: SocialMsgData;
    };
    read_origin_progress: {
        device_id: string;
        progress: ReadOriginProgress;
    };
    read_origin_complete: {
        device_id: string;
        success: boolean;
    };
    origin_five_minute_data: {
        device_id: string;
        data: OriginData;
    };
    origin_half_hour_data: {
        device_id: string;
        data: HalfHourData;
    };
    sleep_data: {
        device_id: string;
        date: string;
        data: SleepData;
    };
    sport_step_data: {
        device_id: string;
        date: string;
        data: SportStepData;
    };
    heart_rate_test_result: {
        device_id: string;
        result: HeartRateTestResult;
    };
    blood_pressure_test_result: {
        device_id: string;
        result: BloodPressureTestResult;
    };
    blood_oxygen_test_result: {
        device_id: string;
        result: BloodOxygenTestResult;
    };
    temperature_test_result: {
        device_id: string;
        result: TemperatureTestResult;
    };
    stress_data: {
        device_id: string;
        data: StressData;
    };
    blood_glucose_data: {
        device_id: string;
        data: BloodGlucoseData;
    };
    hrv_test_result: {
        device_id: string;
        result: HrvTestResult;
    };
    ecg_test_result: {
        device_id: string;
        result: EcgTestResult;
    };
    fatigue_test_result: {
        device_id: string;
        result: FatigueTestResult;
    };
    breathing_test_result: {
        device_id: string;
        result: BreathingTestResult;
    };
    body_composition_test_result: {
        device_id: string;
        result: BodyCompositionTestResult;
    };
    health_glance_test_result: {
        device_id: string;
        result: HealthGlanceResult;
    };
    battery_data: {
        device_id: string;
        data: BatteryInfo;
    };
    connection_status_changed: {
        device_id: string;
        status: ConnectionStatus;
    };
    /**
     * [PENDING-CONNECT] A connect issued with `hold_pending` is now waiting on
     * CoreBluetooth with NO application-level timeout — it settles only when the
     * band comes back in range, or when something cancels it. Distinct from
     * `connecting`, which implies an attempt that will time out on its own.
     */
    connect_pending: {
        device_id: string;
    };
    origin_spo2_data: {
        device_id: string;
        data: Spo2OriginData;
    };
    alarm_data: {
        device_id: string;
        alarms: DeviceAlarm[];
    };
    heart_rate_alarm_data: {
        device_id: string;
        data: HeartRateAlarm;
    };
    spo2_alarm_data: {
        device_id: string;
        data: Spo2Alarm;
    };
    device_switches_data: {
        device_id: string;
        switches: DeviceSwitches;
    };
    find_device_state: {
        device_id: string;
        phase: FindDevicePhase;
        raw_state?: number;
    };
    firmware_dfu_progress: FirmwareDfuProgress;
    contacts_data: {
        device_id: string;
        contacts: DeviceContact[];
    };
    sos_call_times_data: {
        device_id: string;
        data: SosCallTimesSettings;
    };
    /** Fired when the Band triggers a camera photo action. Cross-platform. */
    camera_shutter: {
        device_id: string;
        status: CameraShutterStatus;
    };
    /** Fired when the Band sends a music remote command. Android only. */
    music_remote_command: {
        device_id: string;
        command: MusicRemoteCommand;
    };
    /** Fired when the Band's classic BT state changes. */
    device_bt_state_changed: {
        device_id: string;
        state: DeviceBTState;
        bt_switch_open: boolean;
        media_switch_open: boolean;
    };
    /** Fired when the Band triggers its hardware SOS button. iOS only — no vendor Android callback documented. */
    device_sos_triggered: {
        device_id: string;
    };
    custom_settings_data: {
        device_id: string;
        data: CustomSettings;
    };
    health_remind_data: {
        device_id: string;
        data: HealthReminder;
    };
    /** iOS only — emitted on read response. Android vendor has no equivalent. */
    apnea_remind_data: {
        device_id: string;
        data: ApneaRemindSettings;
    };
    /** Fired when the Band finishes/stops a sport session. Android: SportModelStateData; iOS: deviceSportDidFinishBlock. */
    sport_mode_data: {
        device_id: string;
        mode: SportMode | null;
    };
    blood_analysis_test_result: {
        device_id: string;
        result: BloodAnalysisTestResult;
    };
    /** GSR (Galvanic Skin Response) test. Android only — iOS rejects CAPABILITY_UNSUPPORTED. */
    gsr_test_result: {
        device_id: string;
        result: GsrTestResult;
    };
    /** Emitted once per session as exercise history syncs from Band. */
    exercise_session_data: {
        device_id: string;
        session: ExerciseSession;
    };
    /** Emitted once when the exercise-history read finishes (ADR 0015 — never
     * signalled via `read_origin_complete`). `success: false` = vendor aborted
     * (invalid state) — the collector rejects instead of resolving.
     *
     * The three diagnostic fields are iOS-only (the Android emit does not carry
     * them) and are the ONLY signal that says which of the two native read paths
     * ran — a bounded, CRC-addressed `sport-api` read or the unbounded `start-db`
     * sweep. `block_outcomes` also names the per-round coverage, so a slow read is
     * attributable without an instrumented build (rayu.ai #467). */
    exercise_read_complete: {
        device_id: string;
        success: boolean;
        /** Sessions the native side emitted — cross-checks the collected count. */
        sessions_emitted?: number;
        /** `"sport-api"` (bounded, CRC-addressed) or `"start-db"` (full sweep). */
        read_path?: string;
        /** Comma-joined trace, e.g.
         * `"sport-crc:ok[1/2/3],r1:2 sessions, satisfied 2/3,r2:1 sessions, satisfied 3/3"`. */
        block_outcomes?: string;
        /** Device address the vendor DB was keyed on. */
        table_id?: string;
    };
    /** Streams during an exercise-history read — drives host progress bars and
     * re-arms the collector's stall watchdog (a slow transfer is not a dead one). */
    exercise_read_progress: {
        device_id: string;
        progress: ExerciseReadProgress;
    };
    /** Emitted per accurate sleep session (one per night). Gate: sleepType > 0 (iOS) / isSupportPreciseSleep (Android). */
    accurate_sleep_data: {
        device_id: string;
        date: string;
        data: AccurateSleepSession;
    };
    /** Emitted per stored temperature record. Prerequisite: call startReadOriginData first. */
    stored_temperature_data: {
        device_id: string;
        data: StoredTemperatureData;
    };
    /** Emitted per stored blood glucose record. Prerequisite: call startReadOriginData first. */
    stored_blood_glucose_data: {
        device_id: string;
        data: StoredBloodGlucoseData;
    };
    /** Emitted per stored HRV record. Prerequisite: call startReadOriginData first. */
    stored_hrv_data: {
        device_id: string;
        data: StoredHrvData;
    };
    /** Emitted per stored offline ECG record. Prerequisite: call startReadOriginData first. */
    stored_ecg_data: {
        device_id: string;
        data: StoredEcgData;
    };
    /** Emitted per stored body composition record. Prerequisite: call startReadOriginData first. */
    stored_body_composition_data: {
        device_id: string;
        data: StoredBodyCompositionData;
    };
    /** Fired on each PTT measurement update. iOS only. */
    ptt_test_result: {
        device_id: string;
        result: PttTestResult;
    };
    /** Fired when device autonomously enters or exits PTT mode. iOS only. */
    ptt_state_changed: {
        device_id: string;
        state: PttState;
    };
    error: VeepooError;
    sdk_initialized: Record<never, never>;
    scan_started: Record<never, never>;
    scan_stopped: Record<never, never>;
};
export type VeepooEvent = keyof VeepooEventPayload;
//# sourceMappingURL=events.d.ts.map