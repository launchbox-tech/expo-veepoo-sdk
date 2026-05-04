import { useCallback } from 'react';
import { useSDKEvent } from './useSDKEvent';
import type { AppState } from './appStateReducer';

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
  appState: AppState,
  appendLog: (line: string) => void,
): void {
  const isReady = appState === 'ready';

  const log = useCallback(
    (name: string, payload: unknown) => appendLog(`${name} ${clipJson(payload)}`),
    [appendLog],
  );

  useSDKEvent('deviceConnected', p => log('deviceConnected', p), isReady);
  useSDKEvent('deviceVersion', p => log('deviceVersion', p), isReady);
  useSDKEvent('deviceFunction', p => log('deviceFunction', p), isReady);
  useSDKEvent('passwordData', p => log('passwordData', p), isReady);
  useSDKEvent('deviceBTStateChanged', p => log('deviceBTStateChanged', p), isReady);
  useSDKEvent('deviceSosTriggered', p => log('deviceSosTriggered', p), isReady);
  useSDKEvent('customSettingsData', p => log('customSettingsData', p), isReady);
  useSDKEvent('healthRemindData', p => log('healthRemindData', p), isReady);
  useSDKEvent('apneaRemindData', p => log('apneaRemindData', p), isReady);
  useSDKEvent('sportModeData', p => log('sportModeData', p), isReady);
  useSDKEvent('originFiveMinuteData', p => log('originFiveMinuteData', p), isReady);
  useSDKEvent('originHalfHourData', p => log('originHalfHourData', p), isReady);
  useSDKEvent('originSpo2Data', p => log('originSpo2Data', p), isReady);
  useSDKEvent('storedTemperatureData', p => log('storedTemperatureData', p), isReady);
  useSDKEvent('storedBloodGlucoseData', p => log('storedBloodGlucoseData', p), isReady);
  useSDKEvent('storedHrvData', p => log('storedHrvData', p), isReady);
  useSDKEvent('storedEcgData', p => log('storedEcgData', p), isReady);
  useSDKEvent('storedBodyCompositionData', p => log('storedBodyCompositionData', p), isReady);
  useSDKEvent('accurateSleepData', p => log('accurateSleepData', p), isReady);
  useSDKEvent('exerciseSessionData', p => log('exerciseSessionData', p), isReady);
  useSDKEvent('pttTestResult', p => log('pttTestResult', p), isReady);
  useSDKEvent('pttStateChanged', p => log('pttStateChanged', p), isReady);
  useSDKEvent('gsrTestResult', p => log('gsrTestResult', p), isReady);
}
