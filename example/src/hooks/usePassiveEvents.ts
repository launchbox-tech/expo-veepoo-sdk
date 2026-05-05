import { useIsSessionReady } from '@gaozh1024/expo-veepoo-sdk';
import { useSDKEvent } from './useSDKEvent';

function clipJson(payload: unknown, max = 160): string {
  try {
    const s = JSON.stringify(payload);
    return s.length > max ? `${s.slice(0, max)}…` : s;
  } catch {
    return String(payload);
  }
}

/**
 * Subscribes to all remaining SDK events that don't have dedicated UI.
 * Routes each event to `labLog` via the provided `appendLog` callback.
 */
export function usePassiveEvents(
  appendLog: (line: string) => void,
): void {
  const isReady = useIsSessionReady();

  function log(name: string, payload: unknown) {
    appendLog(`${name} ${clipJson(payload)}`);
  }

  useSDKEvent('device_connected', p => log('device_connected', p), isReady);
  useSDKEvent('device_version', p => log('device_version', p), isReady);
  useSDKEvent('device_function', p => log('device_function', p), isReady);
  useSDKEvent('password_data', p => log('password_data', p), isReady);
  useSDKEvent('device_bt_state_changed', p => log('device_bt_state_changed', p), isReady);
  useSDKEvent('device_sos_triggered', p => log('device_sos_triggered', p), isReady);
  useSDKEvent('custom_settings_data', p => log('custom_settings_data', p), isReady);
  useSDKEvent('health_remind_data', p => log('health_remind_data', p), isReady);
  useSDKEvent('apnea_remind_data', p => log('apnea_remind_data', p), isReady);
  useSDKEvent('sport_mode_data', p => log('sport_mode_data', p), isReady);
  useSDKEvent('origin_five_minute_data', p => log('origin_five_minute_data', p), isReady);
  useSDKEvent('origin_half_hour_data', p => log('origin_half_hour_data', p), isReady);
  useSDKEvent('origin_spo2_data', p => log('origin_spo2_data', p), isReady);
  useSDKEvent('stored_temperature_data', p => log('stored_temperature_data', p), isReady);
  useSDKEvent('stored_blood_glucose_data', p => log('stored_blood_glucose_data', p), isReady);
  useSDKEvent('stored_hrv_data', p => log('stored_hrv_data', p), isReady);
  useSDKEvent('stored_ecg_data', p => log('stored_ecg_data', p), isReady);
  useSDKEvent('stored_body_composition_data', p => log('stored_body_composition_data', p), isReady);
  useSDKEvent('accurate_sleep_data', p => log('accurate_sleep_data', p), isReady);
  useSDKEvent('exercise_session_data', p => log('exercise_session_data', p), isReady);
  useSDKEvent('ptt_test_result', p => log('ptt_test_result', p), isReady);
  useSDKEvent('ptt_state_changed', p => log('ptt_state_changed', p), isReady);
  useSDKEvent('gsr_test_result', p => log('gsr_test_result', p), isReady);
}
