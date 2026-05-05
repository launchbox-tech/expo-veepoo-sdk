import { normalizeAlarmList, normalizeHeartRateAlarm } from '@/capabilities/alarms/normalizers';
import { normalizeBluetoothStatus, normalizePermissionsResult } from '@/capabilities/session/normalizers';
import { normalizeCameraShutterStatus } from '@/capabilities/camera/normalizers';
import { normalizeDeviceBTState, normalizeDeviceBTStatus } from '@/capabilities/bt-status/normalizers';
import { normalizeEventPayload, normalizeReadOriginProgressPayload } from '@/bridge/event-normalizer';
import { normalizeMusicRemoteCommand } from '@/capabilities/music/normalizers';
import { normalizeScreenLightDuration, normalizeScreenLightSettings } from '@/capabilities/screen-light/normalizers';
import { normalizeSedentaryReminderSettings } from '@/capabilities/sedentary-reminder/normalizers';
import { normalizeWristFlipWakeSettings } from '@/capabilities/wrist-flip/normalizers';
import { normalizeWomenHealthSettings } from '@/capabilities/women-health/normalizers';
import { normalizeWatchFaceStyle } from '@/capabilities/watch-face/normalizers';
import { normalizeContactList } from '@/capabilities/contacts/normalizers';
import { normalizeSosCallTimesSettings } from '@/capabilities/sos/normalizers';
import { normalizeWeatherSettings } from '@/capabilities/weather/normalizers';

describe('normalizeAlarmList', () => {
  it('returns empty array for non-array input', () => {
    expect(normalizeAlarmList(null)).toEqual([]);
    expect(normalizeAlarmList(undefined)).toEqual([]);
    expect(normalizeAlarmList({})).toEqual([]);
  });

  it('converts repeat binary string "0000011" to [1, 2]', () => {
    const result = normalizeAlarmList([{ id: 1, enabled: 1, hour: 7, minute: 30, repeat: '0000011' }]);
    expect(result[0].repeat).toEqual([1, 2]);
  });

  it('converts "0000000" to [] (one-shot)', () => {
    const result = normalizeAlarmList([{ id: 1, enabled: 1, hour: 7, minute: 30, repeat: '0000000' }]);
    expect(result[0].repeat).toEqual([]);
  });

  it('converts "1111111" to [1,2,3,4,5,6,7]', () => {
    const result = normalizeAlarmList([{ id: 1, enabled: 1, hour: 7, minute: 30, repeat: '1111111' }]);
    expect(result[0].repeat).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('passes through scene and text when present', () => {
    const result = normalizeAlarmList([
      { id: 2, enabled: true, hour: 8, minute: 0, repeat: '0000000', scene: 5, text: 'wake up' },
    ]);
    expect(result[0].scene).toBe(5);
    expect(result[0].text).toBe('wake up');
  });

  it('defaults scene and text to undefined when absent', () => {
    const result = normalizeAlarmList([{ id: 1, enabled: true, hour: 7, minute: 0, repeat: '0000000' }]);
    expect(result[0].scene).toBeUndefined();
    expect(result[0].text).toBeUndefined();
  });

  it('passes through an already-decoded repeat array unchanged', () => {
    const result = normalizeAlarmList([{ id: 1, enabled: true, hour: 7, minute: 0, repeat: [1, 5] }]);
    expect(result[0].repeat).toEqual([1, 5]);
  });
});

describe('normalizePermissionsResult', () => {
  it('normalizes legacy string payloads', () => {
    expect(normalizePermissionsResult('granted')).toEqual({
      granted: true,
      status: 'granted',
      can_ask_again: false,
    });

    expect(normalizePermissionsResult('denied')).toEqual({
      granted: false,
      status: 'denied',
      can_ask_again: true,
    });
  });

  it('preserves structured payloads', () => {
    expect(
      normalizePermissionsResult({
        granted: false,
        status: 'never_ask_again',
        canAskAgain: false,
      })
    ).toEqual({
      granted: false,
      status: 'never_ask_again',
      can_ask_again: false,
    });
  });
});

describe('normalizeBluetoothStatus', () => {
  it('normalizes numeric iOS payloads into typed strings', () => {
    expect(
      normalizeBluetoothStatus({
        state: 5,
        authorization: 3,
        isScanning: true,
        pendingScanStart: false,
      })
    ).toEqual({
      state: 'powered_on',
      state_name: 'powered_on',
      authorization: 'allowed_always',
      authorization_name: 'allowed_always',
      is_scanning: true,
      pending_scan_start: false,
    });
  });
});

describe('normalizeReadOriginProgressPayload', () => {
  it('converts progress to an integer percentage', () => {
    expect(
      normalizeReadOriginProgressPayload({
        device_id: 'd1',
        progress: {
          readState: 'reading',
          totalDays: 3,
          currentDay: 2,
          progress: 0.6789,
        },
      })
    ).toEqual({
      device_id: 'd1',
      progress: {
        read_state: 'reading',
        total_days: 3,
        current_day: 2,
        progress: 67,
      },
    });
  });

  it('converts a completed fractional progress to 100', () => {
    expect(
      normalizeReadOriginProgressPayload({
        device_id: 'd1',
        progress: {
          readState: 'complete',
          totalDays: 1,
          currentDay: 1,
          progress: 1.0,
        },
      })
    ).toEqual({
      device_id: 'd1',
      progress: {
        read_state: 'complete',
        total_days: 1,
        current_day: 1,
        progress: 100,
      },
    });
  });

  it('clamps percent-style values to 100', () => {
    expect(
      normalizeReadOriginProgressPayload({
        device_id: 'd1',
        progress: {
          readState: 'complete',
          totalDays: 1,
          currentDay: 1,
          progress: 120,
        },
      })
    ).toEqual({
      device_id: 'd1',
      progress: {
        read_state: 'complete',
        total_days: 1,
        current_day: 1,
        progress: 100,
      },
    });
  });
});

describe('normalizeEventPayload', () => {
  it('returns non-object payloads unchanged', () => {
    expect(normalizeEventPayload('deviceFound', null)).toBeNull();
    expect(normalizeEventPayload('deviceFound', 42)).toBe(42);
    expect(normalizeEventPayload('deviceFound', 'str')).toBe('str');
  });

  it('returns pass-through events with snake_case keys', () => {
    const payload = { deviceId: 'x', timestamp: 1 };
    const expected = { device_id: 'x', timestamp: 1 };
    expect(normalizeEventPayload('deviceFound', payload)).toEqual(expected);
    expect(normalizeEventPayload('deviceConnected', payload)).toEqual(expected);
    expect(normalizeEventPayload('deviceDisconnected', payload)).toEqual(expected);
    expect(normalizeEventPayload('deviceReady', payload)).toEqual(expected);
    expect(normalizeEventPayload('readOriginComplete', payload)).toEqual(expected);
    expect(normalizeEventPayload('error', payload)).toEqual(expected);
  });

  it('deviceConnectStatus: passes through raw payload with snake_case keys', () => {
    const raw = { deviceId: 'd1', status: 'connected', code: 0 };
    expect(normalizeEventPayload('deviceConnectStatus', raw)).toEqual({ device_id: 'd1', status: 'connected', code: 0 });
  });

  it('connectionStatusChanged: passes through raw payload with snake_case keys', () => {
    const raw = { deviceId: 'd1', status: 'disconnected' };
    expect(normalizeEventPayload('connectionStatusChanged', raw)).toEqual({ device_id: 'd1', status: 'disconnected' });
  });

  it('deviceSosTriggered: passes through raw payload with snake_case keys', () => {
    const raw = { deviceId: 'd1' };
    expect(normalizeEventPayload('deviceSosTriggered', raw)).toEqual({ device_id: 'd1' });
  });

  it('customSettingsData: passes through raw payload with snake_case keys', () => {
    const raw = { deviceId: 'd1', data: { wristOnBright: true } };
    expect(normalizeEventPayload('customSettingsData', raw)).toEqual({ device_id: 'd1', data: { wrist_on_bright: true } });
  });

  it('healthRemindData: passes through raw payload with snake_case keys', () => {
    const raw = { deviceId: 'd1', data: { drinkEnabled: true } };
    expect(normalizeEventPayload('healthRemindData', raw)).toEqual({ device_id: 'd1', data: { drink_enabled: true } });
  });

  it('apneaRemindData: passes through raw payload with snake_case keys', () => {
    const raw = { deviceId: 'd1', data: { enabled: true, threshold: 10 } };
    expect(normalizeEventPayload('apneaRemindData', raw)).toEqual({ device_id: 'd1', data: { enabled: true, threshold: 10 } });
  });

  it('sportModeData: passes through raw payload with snake_case keys', () => {
    const raw = { deviceId: 'd1', mode: 'walking' };
    expect(normalizeEventPayload('sportModeData', raw)).toEqual({ device_id: 'd1', mode: 'walking' });
  });

  it('bloodAnalysisTestResult: passes through raw payload with snake_case keys', () => {
    const raw = {
      deviceId: 'd1',
      result: { state: 'over', progress: 100, values: null },
    };
    expect(normalizeEventPayload('bloodAnalysisTestResult', raw)).toEqual({ device_id: 'd1', result: { state: 'over', progress: 100, values: null } });
  });

  it('gsrTestResult: passes through raw payload with snake_case keys', () => {
    const raw = {
      deviceId: 'd1',
      result: { state: 'over', progress: 100, emotionLevel: 5, skinMoisture: 60, snsActivation: 40, cortisolValue: null },
    };
    const result = normalizeEventPayload('gsrTestResult', raw) as any;
    expect(result.device_id).toBe('d1');
    expect(result.result.state).toBe('over');
  });

  it('exerciseSessionData: passes through raw payload with snake_case keys', () => {
    const raw = { deviceId: 'd1', session: { type: 'running', beginTime: '2024-01-01 08:00:00', endTime: '2024-01-01 09:00:00', totalSteps: 6000, totalDistance: 5000, totalCalories: 400, totalTime: 3600, averageHeartRate: 145, averagePace: 360, pauseCount: 0, pauseTotalTime: 0, minuteData: [] } };
    const result = normalizeEventPayload('exerciseSessionData', raw) as any;
    expect(result.device_id).toBe('d1');
  });

  it('accurateSleepData: passes through raw payload with snake_case keys', () => {
    const raw = { deviceId: 'd1', date: '2024-01-01', data: { sleepTime: '2024-01-01 22:00:00', wakeTime: '2024-01-02 06:00:00' } };
    const result = normalizeEventPayload('accurateSleepData', raw) as any;
    expect(result.device_id).toBe('d1');
  });

  it('storedTemperatureData: passes through raw payload with snake_case keys', () => {
    const raw = { deviceId: 'd1', data: { timestamp: '2024-01-01 08:00', temperature: 36.5 } };
    const result = normalizeEventPayload('storedTemperatureData', raw) as any;
    expect(result.device_id).toBe('d1');
  });

  it('storedBloodGlucoseData: passes through raw payload with snake_case keys', () => {
    const raw = { deviceId: 'd1', data: { timestamp: '2024-01-01 08:00', bloodGlucose: 5.4, level: 'normal' } };
    const result = normalizeEventPayload('storedBloodGlucoseData', raw) as any;
    expect(result.device_id).toBe('d1');
  });

  it('storedHrvData: passes through raw payload with snake_case keys', () => {
    const raw = { deviceId: 'd1', data: { timestamp: '2024-01-01 08:00', hrv: 42, rrIntervals: [820, 830, 810] } };
    const result = normalizeEventPayload('storedHrvData', raw) as any;
    expect(result.device_id).toBe('d1');
  });

  it('storedEcgData: passes through raw payload with snake_case keys', () => {
    const raw = { deviceId: 'd1', data: { timestamp: '2024-01-01 08:00:00', duration: 30, aveHeart: 72, aveHrv: 40, aveResRate: 16, filterSignals: [100, 200, 150] } };
    const result = normalizeEventPayload('storedEcgData', raw) as any;
    expect(result.device_id).toBe('d1');
  });

  it('storedBodyCompositionData: passes through raw payload with snake_case keys', () => {
    const raw = { deviceId: 'd1', data: { timestamp: '2024-01-01 08:00:00', bmi: 22.5 } };
    const result = normalizeEventPayload('storedBodyCompositionData', raw) as any;
    expect(result.device_id).toBe('d1');
  });

  it('pttTestResult: passes through raw payload with snake_case keys', () => {
    const raw = { deviceId: 'd1', result: { heartRate: 72, hrv: 45, qtInterval: 380, signalQuality: 100, progress: 50 } };
    const result = normalizeEventPayload('pttTestResult', raw) as any;
    expect(result.device_id).toBe('d1');
  });

  it('pttStateChanged: passes through raw payload with snake_case keys', () => {
    const raw = { deviceId: 'd1', state: 'active' };
    expect(normalizeEventPayload('pttStateChanged', raw)).toEqual({ device_id: 'd1', state: 'active' });
  });

  it('bluetoothStateChanged: normalizes numeric state and authorization', () => {
    const result = normalizeEventPayload('bluetoothStateChanged', {
      state: 5, authorization: 3, isScanning: false, pendingScanStart: false,
    }) as any;
    expect(result.state).toBe('powered_on');
    expect(result.authorization).toBe('allowed_always');
    expect(result.is_scanning).toBe(false);
  });

  it('bluetoothStateChanged: converts camelCase string state/auth values to snake_case', () => {
    const result = normalizeEventPayload('bluetoothStateChanged', {
      state: 'poweredOff', authorization: 'notDetermined', isScanning: false, pendingScanStart: false,
    }) as any;
    expect(result.state).toBe('powered_off');
    expect(result.authorization).toBe('not_determined');
    expect(result.is_scanning).toBe(false);
    expect(result.pending_scan_start).toBe(false);
  });

  it('readOriginProgress: converts decimal progress to integer percentage', () => {
    const result = normalizeEventPayload('readOriginProgress', {
      device_id: 'd1',
      progress: { readState: 'reading', totalDays: 3, currentDay: 2, progress: 0.5 },
    }) as any;
    expect(result.progress.progress).toBe(50);
    expect(result.progress.read_state).toBe('reading');
  });

  it('deviceFunction: normalizes data and functions fields', () => {
    const result = normalizeEventPayload('deviceFunction', {
      deviceId: 'd1',
      data: { Bp: 1 },
      functions: undefined,
    }) as any;
    expect(result.data).toBeDefined();
    expect(result.functions).toBeDefined();
    expect(result.data.package1.blood_pressure).toBe('support');
  });

  it('deviceVersion: normalizes version sub-object', () => {
    const result = normalizeEventPayload('deviceVersion', {
      deviceId: 'd1',
      version: { hardwareVersion: 'hw1', firmwareVersion: 'fw2' },
    }) as any;
    expect(result.version.hardware_version).toBe('hw1');
    expect(result.version.firmware_version).toBe('fw2');
  });

  it('passwordData: normalizes status to uppercase enum', () => {
    const result = normalizeEventPayload('passwordData', {
      deviceId: 'd1',
      data: { status: 'check_success' },
    }) as any;
    expect(result.data.status).toBe('CHECK_SUCCESS');
  });

  it('socialMsgData: normalizes function status for each key', () => {
    const result = normalizeEventPayload('socialMsgData', {
      deviceId: 'd1',
      data: { phone: 1, sms: 0 },
    }) as any;
    expect(result.data.phone).toBe('support');
    expect(result.data.sms).toBe('unsupported');
  });

  it('heartRateTestResult: normalizes state from rawState', () => {
    const result = normalizeEventPayload('heartRateTestResult', {
      deviceId: 'd1',
      result: { rawState: 1 },
    }) as any;
    expect(result.result.state).toBe('testing');
  });

  it('bloodPressureTestResult: normalizes state and pressure values', () => {
    const result = normalizeEventPayload('bloodPressureTestResult', {
      deviceId: 'd1',
      result: { rawState: 4, systolic: 120, diastolic: 80 },
    }) as any;
    expect(result.result.state).toBe('over');
    expect(result.result.systolic).toBe(120);
    expect(result.result.diastolic).toBe(80);
  });

  it('bloodOxygenTestResult: normalizes oxygenValue alias to value', () => {
    const result = normalizeEventPayload('bloodOxygenTestResult', {
      deviceId: 'd1',
      result: { rawState: 4, oxygenValue: 98 },
    }) as any;
    expect(result.result.state).toBe('over');
    expect(result.result.value).toBe(98);
  });

  it('temperatureTestResult: normalizes tempValue alias to value', () => {
    const result = normalizeEventPayload('temperatureTestResult', {
      deviceId: 'd1',
      result: { rawState: 4, tempValue: 36.8 },
    }) as any;
    expect(result.result.state).toBe('over');
    expect(result.result.value).toBeCloseTo(36.8);
  });

  it('stressData: normalizes stress value', () => {
    const result = normalizeEventPayload('stressData', {
      deviceId: 'd1',
      data: { stress: 42, timestamp: 1000 },
    }) as any;
    expect(result.data.stress).toBe(42);
    expect(result.data.timestamp).toBe(1000);
  });

  it('bloodGlucoseData: normalizes bloodGlucose alias to glucose', () => {
    const result = normalizeEventPayload('bloodGlucoseData', {
      deviceId: 'd1',
      data: { bloodGlucose: 5.5 },
    }) as any;
    expect(result.data.glucose).toBeCloseTo(5.5);
  });

  it('hrvTestResult: normalizes value from hrv alias', () => {
    const result = normalizeEventPayload('hrvTestResult', {
      deviceId: 'd1',
      result: { rawState: 'testing', hrv: 55, progress: 10 },
    }) as any;
    expect(result.result.state).toBe('testing');
    expect(result.result.value).toBe(55);
    expect(result.result.progress).toBe(10);
  });

  it('ecgTestResult: normalizes waveform array', () => {
    const result = normalizeEventPayload('ecgTestResult', {
      deviceId: 'd1',
      result: { state: 'testing', progress: 50, heartRate: 72, waveform: [1, 2, 3] },
    }) as any;
    expect(result.result.heart_rate).toBe(72);
    expect(result.result.waveform).toEqual([1, 2, 3]);
  });

  it('batteryData: normalizes level and chargeState', () => {
    const result = normalizeEventPayload('batteryData', {
      deviceId: 'd1',
      data: { level: 75, state: 0 },
    }) as any;
    expect(result.data.level).toBe(75);
    expect(result.data.charge_state).toBe('normal');
  });

  it('sleepData: normalizes single sleep record', () => {
    const result = normalizeEventPayload('sleepData', {
      deviceId: 'd1',
      data: { SLEEP_TIME: '22:00', WAKE_TIME: '06:00' },
    }) as any;
    expect(result.data).toBeDefined();
    expect(result.data).not.toBeNull();
  });

  it('sportStepData: normalizes step alias to step_count', () => {
    const result = normalizeEventPayload('sportStepData', {
      deviceId: 'd1',
      data: { step: 5000 },
    }) as any;
    expect(result.data.step_count).toBe(5000);
  });

  it('originHalfHourData: normalizes half-hour item', () => {
    const result = normalizeEventPayload('originHalfHourData', {
      deviceId: 'd1',
      data: { time: '12:00', heartValue: 70 },
    }) as any;
    expect(result.data.heart_value).toBe(70);
    expect(result.data.time).toBe('12:00');
  });

  it('originFiveMinuteData: normalizes origin data item', () => {
    const result = normalizeEventPayload('originFiveMinuteData', {
      deviceId: 'd1',
      data: { time: '12:00', heartValue: 72 },
    }) as any;
    expect(result.data).toBeDefined();
    expect(result.data.heart_value).toBe(72);
  });

  it('alarmData: normalizes alarm list and converts repeat string', () => {
    const result = normalizeEventPayload('alarmData', {
      deviceId: 'd1',
      alarms: [{ id: 1, enabled: 1, hour: 7, minute: 30, repeat: '0000011' }],
    }) as any;
    expect(result.device_id).toBe('d1');
    expect(result.alarms[0].repeat).toEqual([1, 2]);
    expect(result.alarms[0].hour).toBe(7);
  });

  it('originSpo2Data: normalizes spo2 origin fields', () => {
    const result = normalizeEventPayload('originSpo2Data', {
      deviceId: 'd1',
      data: {
        time: '08:00',
        date: '2024-01-01',
        heartValue: 68,
        value: 98,
        rate: 15,
        isHypoxia: 0,
        cardiacLoad: 5,
        temp1: 36,
        sportValue: 0,
        apneaResult: 0,
        hypoxiaTime: 0,
        hypopnea: 0,
        stepValue: 100,
        allPackNumber: 10,
        currentPackNumber: 1,
      },
    }) as any;
    expect(result.device_id).toBe('d1');
    expect(result.data.time).toBe('08:00');
    expect(result.data.heart_value).toBe(68);
    expect(result.data.value).toBe(98);
    expect(result.data.all_pack_number).toBe(10);
    expect(result.data.current_pack_number).toBe(1);
  });

  it('heartRateAlarmData: normalizes enabled and thresholds', () => {
    const result = normalizeEventPayload('heartRateAlarmData', {
      deviceId: 'd1',
      data: { enabled: 1, highThreshold: 120, lowThreshold: 50 },
    }) as any;
    expect(result.device_id).toBe('d1');
    expect(result.data.enabled).toBe(true);
    expect(result.data.high_threshold).toBe(120);
    expect(result.data.low_threshold).toBe(50);
  });

  it('findDeviceState: normalizes phase and raw_state', () => {
    const result = normalizeEventPayload('findDeviceState', {
      deviceId: 'd1',
      phase: 'searching',
      rawState: 1,
    }) as any;
    expect(result.device_id).toBe('d1');
    expect(result.phase).toBe('searching');
    expect(result.raw_state).toBe(1);
  });

  it('findDeviceState: unknown phase becomes unsupported', () => {
    const result = normalizeEventPayload('findDeviceState', {
      deviceId: 'd1',
      phase: 'nope',
    }) as any;
    expect(result.phase).toBe('unsupported');
  });

  it('contactsData: normalizes contact list', () => {
    const result = normalizeEventPayload('contactsData', {
      deviceId: 'd1',
      contacts: [{ contactID: 1, name: 'Alice', phoneNumber: '+1234', isSOS: true }],
    }) as any;
    expect(result.device_id).toBe('d1');
    expect(result.contacts[0].name).toBe('Alice');
    expect(result.contacts[0].phone_number).toBe('+1234');
    expect(result.contacts[0].is_sos).toBe(true);
  });

  it('sosCallTimesData: normalizes SOS call times', () => {
    const result = normalizeEventPayload('sosCallTimesData', {
      deviceId: 'd1',
      data: { times: 3, minTimes: 1, maxTimes: 9 },
    }) as any;
    expect(result.device_id).toBe('d1');
    expect(result.data.times).toBe(3);
    expect(result.data.min_times).toBe(1);
    expect(result.data.max_times).toBe(9);
  });

  it('fatigueTestResult: normalizes fatigue level alias', () => {
    const result = normalizeEventPayload('fatigueTestResult', {
      deviceId: 'd1',
      result: { rawState: 'over', fatigueLevel: 2, progress: 100 },
    }) as any;
    expect(result.result.state).toBe('over');
    expect(result.result.level).toBe(2);
    expect(result.result.progress).toBe(100);
  });

  it('breathingTestResult: normalizes breathing rate alias', () => {
    const result = normalizeEventPayload('breathingTestResult', {
      deviceId: 'd1',
      result: { rawState: 'testing', breathingRate: 18, progress: 50 },
    }) as any;
    expect(result.result.state).toBe('testing');
    expect(result.result.rate).toBe(18);
    expect(result.result.progress).toBe(50);
  });
});

describe('normalizeHeartRateAlarm', () => {
  it('coerces numeric enabled to boolean', () => {
    expect(normalizeHeartRateAlarm({ enabled: 1, highThreshold: 120, lowThreshold: 50 }).enabled).toBe(true);
    expect(normalizeHeartRateAlarm({ enabled: 0, highThreshold: 120, lowThreshold: 50 }).enabled).toBe(false);
  });

  it('coerces string thresholds to integers', () => {
    const result = normalizeHeartRateAlarm({ enabled: true, highThreshold: '120', lowThreshold: '50.9' });
    expect(result.high_threshold).toBe(120);
    expect(result.low_threshold).toBe(50);
  });

  it('defaults missing fields to false / 0', () => {
    const result = normalizeHeartRateAlarm({});
    expect(result.enabled).toBe(false);
    expect(result.high_threshold).toBe(0);
    expect(result.low_threshold).toBe(0);
  });

  it('defaults all fields for non-object input', () => {
    const result = normalizeHeartRateAlarm(null);
    expect(result.enabled).toBe(false);
    expect(result.high_threshold).toBe(0);
    expect(result.low_threshold).toBe(0);
  });
});

describe('normalizeScreenLightSettings', () => {
  it('coerces numeric fields', () => {
    const r = normalizeScreenLightSettings({
      nightStartHour: '22',
      nightStartMinute: 0,
      nightEndHour: 7,
      nightEndMinute: 0,
      nightLevel: 2,
      dayLevel: 4,
      autoAdjust: 1,
      maxLevel: 5,
    });
    expect(r.night_start_hour).toBe(22);
    expect(r.auto_adjust).toBe(true);
    expect(r.max_level).toBe(5);
  });
});

describe('normalizeScreenLightDuration', () => {
  it('parses duration fields', () => {
    const r = normalizeScreenLightDuration({
      currentSeconds: 10,
      minSeconds: 5,
      maxSeconds: 60,
      recommendSeconds: 10,
    });
    expect(r.current_seconds).toBe(10);
    expect(r.recommend_seconds).toBe(10);
  });
});

describe('normalizeSedentaryReminderSettings', () => {
  it('coerces fields from native map', () => {
    const r = normalizeSedentaryReminderSettings({
      startHour: 8,
      startMinute: 30,
      endHour: 20,
      endMinute: 15,
      thresholdMinutes: 45,
      enabled: 1,
    });
    expect(r.start_hour).toBe(8);
    expect(r.threshold_minutes).toBe(45);
    expect(r.enabled).toBe(true);
  });
});

describe('normalizeEventPayload bodyCompositionTestResult', () => {
  it('normalizes result and nested composition', () => {
    const result = normalizeEventPayload('bodyCompositionTestResult', {
      deviceId: 'd1',
      result: {
        state: 'complete',
        progress: 100,
        rawState: 5,
        isEnd: true,
        composition: { bmi: '22.5', bodyFatPercentage: 18.2, fatMassKg: 12.3 },
      },
    }) as any;
    expect(result.device_id).toBe('d1');
    expect(result.result.composition?.bmi).toBe(22.5);
    expect(result.result.composition?.body_fat_percentage).toBe(18.2);
  });
});

describe('normalizeEventPayload firmwareDfuProgress', () => {
  it('normalizes state and progress', () => {
    const result = normalizeEventPayload('firmwareDfuProgress', {
      deviceId: 'ab',
      progress: '50',
      state: 'updating',
    }) as any;
    expect(result.device_id).toBe('ab');
    expect(result.progress).toBe(50);
    expect(result.state).toBe('updating');
  });

  it('maps unknown state to unknown', () => {
    const result = normalizeEventPayload('firmwareDfuProgress', {
      deviceId: 'x',
      progress: 2,
      state: 'bogus',
    }) as { state: string };
    expect(result.state).toBe('unknown');
  });
});

describe('normalizeWatchFaceStyle', () => {
  it('maps dialType and screenIndex', () => {
    const r = normalizeWatchFaceStyle({
      dialType: 'MARKET',
      screenIndex: 4,
      operationSuccess: true,
    });
    expect(r.dial_type).toBe('market');
    expect(r.screen_index).toBe(4);
    expect(r.operation_success).toBe(true);
  });

  it('defaults unknown dial to default and omits operation_success when absent', () => {
    const r = normalizeWatchFaceStyle({ screenIndex: 1 });
    expect(r.dial_type).toBe('default');
    expect(r.screen_index).toBe(1);
    expect(r.operation_success).toBeUndefined();
  });
});

describe('normalizeWristFlipWakeSettings', () => {
  it('coerces fields and optional flags', () => {
    const r = normalizeWristFlipWakeSettings({
      enabled: 0,
      startHour: 21,
      startMinute: 30,
      endHour: 7,
      endMinute: 0,
      sensitivityLevel: 3,
      supportsCustomTimeWindow: true,
      defaultSensitivityLevel: 5,
    });
    expect(r.enabled).toBe(false);
    expect(r.sensitivity_level).toBe(3);
    expect(r.supports_custom_time_window).toBe(true);
    expect(r.default_sensitivity_level).toBe(5);
  });
});

describe('normalizeWomenHealthSettings', () => {
  it('maps vendor aliases and optional fields', () => {
    const r = normalizeWomenHealthSettings({
      status: 'MENES',
      menstrualLengthDays: 5,
      menstrualCycleDays: 28,
      lastMenstrualDate: '2026-04-01',
      expectedDeliveryDate: '2026-12-01',
      babyBirthday: '2025-06-15',
      babySex: 'man',
      currentMenstrualDays: 3,
      operationStatus: 'READ_SUCCESS',
    });
    expect(r.status).toBe('menstrual');
    expect(r.menstrual_length_days).toBe(5);
    expect(r.menstrual_cycle_days).toBe(28);
    expect(r.last_menstrual_date).toBe('2026-04-01');
    expect(r.expected_delivery_date).toBe('2026-12-01');
    expect(r.baby_birthday).toBe('2025-06-15');
    expect(r.baby_sex).toBe('male');
    expect(r.current_menstrual_days).toBe(3);
    expect(r.operation_status).toBe('READ_SUCCESS');
  });

  it('defaults unknown status to none', () => {
    const r = normalizeWomenHealthSettings({ status: 'weird' });
    expect(r.status).toBe('none');
  });
});

describe('normalizeWeatherSettings', () => {

  it('normalizes a valid weather settings object', () => {
    const r = normalizeWeatherSettings({ isOpen: true, unit: 'C', crc: 99 });
    expect(r.is_open).toBe(true);
    expect(r.unit).toBe('C');
    expect(r.crc).toBe(99);
  });

  it('normalizes Fahrenheit unit', () => {
    const r = normalizeWeatherSettings({ isOpen: false, unit: 'f', crc: 0 });
    expect(r.unit).toBe('F');
    expect(r.is_open).toBe(false);
  });

  it('defaults to C for unknown unit', () => {
    const r = normalizeWeatherSettings({ isOpen: true, unit: 'X', crc: 0 });
    expect(r.unit).toBe('C');
  });

  it('returns safe defaults for empty object', () => {
    const r = normalizeWeatherSettings({});
    expect(r.is_open).toBe(false);
    expect(r.unit).toBe('C');
    expect(r.crc).toBe(0);
  });

  it('returns safe defaults for non-object input', () => {
    const r = normalizeWeatherSettings(null);
    expect(r.is_open).toBe(false);
    expect(r.unit).toBe('C');
    expect(r.crc).toBe(0);
  });
});

describe('normalizeContactList', () => {
  it('returns empty array for non-array input', () => {
    expect(normalizeContactList(null)).toEqual([]);
    expect(normalizeContactList(undefined)).toEqual([]);
    expect(normalizeContactList({})).toEqual([]);
  });

  it('normalizes a standard Android-shaped contact (name + phoneNumber)', () => {
    const raw = [{ contactID: 1, name: 'Alice', phoneNumber: '+1234567890', isSettingSOS: true, isSupportSOS: true }];
    const result = normalizeContactList(raw);
    expect(result).toHaveLength(1);
    expect(result[0].contact_id).toBe(1);
    expect(result[0].name).toBe('Alice');
    expect(result[0].phone_number).toBe('+1234567890');
    expect(result[0].is_sos).toBe(true);
    expect(result[0].is_support_sos).toBe(true);
  });

  it('normalizes an iOS-shaped contact (nickName field)', () => {
    const raw = [{ contactID: 2, nickName: 'Bob', phoneNumber: '555-0100', isSOS: false }];
    const result = normalizeContactList(raw);
    expect(result[0].name).toBe('Bob');
    expect(result[0].is_sos).toBe(false);
    expect(result[0].is_support_sos).toBeUndefined();
  });

  it('drops entries that have no name or phone', () => {
    const raw = [{ contactID: 3 }];
    expect(normalizeContactList(raw)).toHaveLength(0);
  });

  it('handles mixed valid and invalid entries', () => {
    const raw = [
      { contactID: 1, name: 'Alice', phoneNumber: '123' },
      null,
      { contactID: 2, name: 'Bob', phoneNumber: '456' },
    ];
    expect(normalizeContactList(raw)).toHaveLength(2);
  });
});

describe('normalizeSosCallTimesSettings', () => {
  it('normalizes a well-formed payload', () => {
    const r = normalizeSosCallTimesSettings({ times: 3, minTimes: 1, maxTimes: 9 });
    expect(r.times).toBe(3);
    expect(r.min_times).toBe(1);
    expect(r.max_times).toBe(9);
  });

  it('returns zeros for non-object input', () => {
    const r = normalizeSosCallTimesSettings(null);
    expect(r.times).toBe(0);
    expect(r.min_times).toBe(0);
    expect(r.max_times).toBe(0);
  });

  it('coerces string numbers', () => {
    const r = normalizeSosCallTimesSettings({ times: '5', minTimes: '1', maxTimes: '9' });
    expect(r.times).toBe(5);
  });
});

describe('normalizeCameraShutterStatus', () => {
  it('maps "canTake" → "canTake"', () => {
    expect(normalizeCameraShutterStatus('canTake')).toBe('canTake');
  });

  it('maps Android ECameraStatus "TAKEPHOTO_CAN" → "canTake"', () => {
    expect(normalizeCameraShutterStatus('TAKEPHOTO_CAN')).toBe('canTake');
  });

  it('maps "cannotTake" → "cannotTake"', () => {
    expect(normalizeCameraShutterStatus('cannotTake')).toBe('cannotTake');
  });

  it('maps "TAKEPHOTO_CAN_NOT" → "cannotTake"', () => {
    expect(normalizeCameraShutterStatus('TAKEPHOTO_CAN_NOT')).toBe('cannotTake');
  });

  it('maps unknown string → "cannotTake"', () => {
    expect(normalizeCameraShutterStatus('UNKNOWN')).toBe('cannotTake');
  });

  it('maps null → "cannotTake"', () => {
    expect(normalizeCameraShutterStatus(null)).toBe('cannotTake');
  });
});

describe('normalizeMusicRemoteCommand', () => {
  it('maps "next" → "next"', () => {
    expect(normalizeMusicRemoteCommand('next')).toBe('next');
  });

  it('maps "previous" → "previous"', () => {
    expect(normalizeMusicRemoteCommand('previous')).toBe('previous');
  });

  it('maps "pausePlay" → "pause_play"', () => {
    expect(normalizeMusicRemoteCommand('pausePlay')).toBe('pause_play');
  });

  it('maps unknown string → "pause_play"', () => {
    expect(normalizeMusicRemoteCommand('UNKNOWN')).toBe('pause_play');
  });

  it('maps null → "pause_play"', () => {
    expect(normalizeMusicRemoteCommand(null)).toBe('pause_play');
  });
});

describe('normalizeEventPayload — cameraShutter', () => {
  it('normalizes canTake status', () => {
    const r = normalizeEventPayload('cameraShutter', { deviceId: 'd1', status: 'TAKEPHOTO_CAN' }) as any;
    expect(r.status).toBe('canTake');
    expect(r.device_id).toBe('d1');
  });

  it('normalizes cannotTake status', () => {
    const r = normalizeEventPayload('cameraShutter', { deviceId: 'd1', status: 'TAKEPHOTO_CAN_NOT' }) as any;
    expect(r.status).toBe('cannotTake');
  });
});

describe('normalizeEventPayload — musicRemoteCommand', () => {
  it('normalizes next command', () => {
    const r = normalizeEventPayload('musicRemoteCommand', { deviceId: 'd1', command: 'next' }) as any;
    expect(r.command).toBe('next');
  });

  it('normalizes previous command', () => {
    const r = normalizeEventPayload('musicRemoteCommand', { deviceId: 'd1', command: 'previous' }) as any;
    expect(r.command).toBe('previous');
  });

  it('normalizes pausePlay command', () => {
    const r = normalizeEventPayload('musicRemoteCommand', { deviceId: 'd1', command: 'pausePlay' }) as any;
    expect(r.command).toBe('pause_play');
  });
});

describe('normalizeDeviceBTState', () => {
  it('maps 0 to disconnected', () => {
    expect(normalizeDeviceBTState(0)).toBe('disconnected');
  });
  it('maps 1 to connected', () => {
    expect(normalizeDeviceBTState(1)).toBe('connected');
  });
  it('maps 2 to pairing', () => {
    expect(normalizeDeviceBTState(2)).toBe('pairing');
  });
  it('maps string "connected" to connected', () => {
    expect(normalizeDeviceBTState('connected')).toBe('connected');
  });
  it('maps string "pairing" to pairing', () => {
    expect(normalizeDeviceBTState('pairing')).toBe('pairing');
  });
  it('falls back to disconnected for unknown', () => {
    expect(normalizeDeviceBTState(99)).toBe('disconnected');
    expect(normalizeDeviceBTState(undefined)).toBe('disconnected');
  });
});

describe('normalizeDeviceBTStatus', () => {
  it('normalizes a full Android BTInfo record', () => {
    const result = normalizeDeviceBTStatus({
      isBTOpen: true,
      isAutoCon: true,
      isAudioOpen: false,
      isHavePairInfo: true,
      status: 1,
    });
    expect(result).toEqual({
      is_bt_open: true,
      is_auto_connect: true,
      is_audio_open: false,
      has_pair_info: true,
      state: 'connected',
    });
  });

  it('handles missing/undefined fields gracefully', () => {
    const result = normalizeDeviceBTStatus({});
    expect(result.is_bt_open).toBe(false);
    expect(result.is_auto_connect).toBe(false);
    expect(result.is_audio_open).toBe(false);
    expect(result.has_pair_info).toBe(false);
    expect(result.state).toBe('disconnected');
  });

  it('handles non-object input', () => {
    const result = normalizeDeviceBTStatus(null);
    expect(result.is_bt_open).toBe(false);
    expect(result.state).toBe('disconnected');
  });
});

describe('normalizeEventPayload — deviceBTStateChanged', () => {
  it('normalizes numeric state', () => {
    const r = normalizeEventPayload('deviceBTStateChanged', {
      deviceId: 'd1', state: 1, btSwitchOpen: true, mediaSwitchOpen: false,
    }) as any;
    expect(r.state).toBe('connected');
    expect(r.bt_switch_open).toBe(true);
    expect(r.media_switch_open).toBe(false);
  });

  it('normalizes string state via btState fallback', () => {
    const r = normalizeEventPayload('deviceBTStateChanged', {
      deviceId: 'd1', btState: 'pairing', btSwitchOpen: false, mediaSwitchOpen: false,
    }) as any;
    expect(r.state).toBe('pairing');
  });
});
