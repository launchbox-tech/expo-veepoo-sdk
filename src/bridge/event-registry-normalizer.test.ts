import { normalizeEventPayload } from './event-registry';

describe('normalizeEventPayload', () => {
  it('returns non-object payloads unchanged', () => {
    expect(normalizeEventPayload('device_found', null)).toBeNull();
    expect(normalizeEventPayload('device_found', 42)).toBe(42);
    expect(normalizeEventPayload('device_found', 'str')).toBe('str');
  });

  it('returns pass-through events with snake_case keys', () => {
    const payload = { deviceId: 'x', timestamp: 1 };
    const expected = { device_id: 'x', timestamp: 1 };
    expect(normalizeEventPayload('device_found', payload)).toEqual(expected);
    expect(normalizeEventPayload('device_connected', payload)).toEqual(expected);
    expect(normalizeEventPayload('device_disconnected', payload)).toEqual(expected);
    expect(normalizeEventPayload('device_ready', payload)).toEqual(expected);
    expect(normalizeEventPayload('read_origin_complete', payload)).toEqual(expected);
    expect(normalizeEventPayload('error', payload)).toEqual(expected);
  });

  it('deviceConnectStatus: passes through raw payload with snake_case keys', () => {
    const raw = { deviceId: 'd1', status: 'connected', code: 0 };
    expect(normalizeEventPayload('device_connect_status', raw)).toEqual({ device_id: 'd1', status: 'connected', code: 0 });
  });

  it('connectionStatusChanged: passes through raw payload with snake_case keys', () => {
    const raw = { deviceId: 'd1', status: 'disconnected' };
    expect(normalizeEventPayload('connection_status_changed', raw)).toEqual({ device_id: 'd1', status: 'disconnected' });
  });

  it('deviceSosTriggered: passes through raw payload with snake_case keys', () => {
    const raw = { deviceId: 'd1' };
    expect(normalizeEventPayload('device_sos_triggered', raw)).toEqual({ device_id: 'd1' });
  });

  it('customSettingsData: passes through raw payload with snake_case keys', () => {
    const raw = { deviceId: 'd1', data: { wristOnBright: true } };
    expect(normalizeEventPayload('custom_settings_data', raw)).toEqual({ device_id: 'd1', data: { wrist_on_bright: true } });
  });

  it('healthRemindData: passes through raw payload with snake_case keys', () => {
    const raw = { deviceId: 'd1', data: { drinkEnabled: true } };
    expect(normalizeEventPayload('health_remind_data', raw)).toEqual({ device_id: 'd1', data: { drink_enabled: true } });
  });

  it('apneaRemindData: passes through raw payload with snake_case keys', () => {
    const raw = { deviceId: 'd1', data: { enabled: true, threshold: 10 } };
    expect(normalizeEventPayload('apnea_remind_data', raw)).toEqual({ device_id: 'd1', data: { enabled: true, threshold: 10 } });
  });

  it('sportModeData: passes through raw payload with snake_case keys', () => {
    const raw = { deviceId: 'd1', mode: 'walking' };
    expect(normalizeEventPayload('sport_mode_data', raw)).toEqual({ device_id: 'd1', mode: 'walking' });
  });

  it('bloodAnalysisTestResult: passes through raw payload with snake_case keys', () => {
    const raw = {
      deviceId: 'd1',
      result: { state: 'over', progress: 100, values: null },
    };
    expect(normalizeEventPayload('blood_analysis_test_result', raw)).toEqual({ device_id: 'd1', result: { state: 'over', progress: 100, values: null } });
  });

  it('gsrTestResult: passes through raw payload with snake_case keys', () => {
    const raw = {
      deviceId: 'd1',
      result: { state: 'over', progress: 100, emotionLevel: 5, skinMoisture: 60, snsActivation: 40, cortisolValue: null },
    };
    const result = normalizeEventPayload('gsr_test_result', raw) as any;
    expect(result.device_id).toBe('d1');
    expect(result.result.state).toBe('over');
  });

  it('exerciseSessionData: passes through raw payload with snake_case keys', () => {
    const raw = { deviceId: 'd1', session: { type: 'running', beginTime: '2024-01-01 08:00:00', endTime: '2024-01-01 09:00:00', totalSteps: 6000, totalDistance: 5000, totalCalories: 400, totalTime: 3600, averageHeartRate: 145, averagePace: 360, pauseCount: 0, pauseTotalTime: 0, minuteData: [] } };
    const result = normalizeEventPayload('exercise_session_data', raw) as any;
    expect(result.device_id).toBe('d1');
  });

  it('accurateSleepData: passes through raw payload with snake_case keys', () => {
    const raw = { deviceId: 'd1', date: '2024-01-01', data: { sleepTime: '2024-01-01 22:00:00', wakeTime: '2024-01-02 06:00:00' } };
    const result = normalizeEventPayload('accurate_sleep_data', raw) as any;
    expect(result.device_id).toBe('d1');
  });

  it('storedTemperatureData: passes through raw payload with snake_case keys', () => {
    const raw = { deviceId: 'd1', data: { timestamp: '2024-01-01 08:00', temperature: 36.5 } };
    const result = normalizeEventPayload('stored_temperature_data', raw) as any;
    expect(result.device_id).toBe('d1');
  });

  it('storedBloodGlucoseData: passes through raw payload with snake_case keys', () => {
    const raw = { deviceId: 'd1', data: { timestamp: '2024-01-01 08:00', bloodGlucose: 5.4, level: 'normal' } };
    const result = normalizeEventPayload('stored_blood_glucose_data', raw) as any;
    expect(result.device_id).toBe('d1');
  });

  it('storedHrvData: passes through raw payload with snake_case keys', () => {
    const raw = { deviceId: 'd1', data: { timestamp: '2024-01-01 08:00', hrv: 42, rrIntervals: [820, 830, 810] } };
    const result = normalizeEventPayload('stored_hrv_data', raw) as any;
    expect(result.device_id).toBe('d1');
  });

  it('storedEcgData: passes through raw payload with snake_case keys', () => {
    const raw = { deviceId: 'd1', data: { timestamp: '2024-01-01 08:00:00', duration: 30, aveHeart: 72, aveHrv: 40, aveResRate: 16, filterSignals: [100, 200, 150] } };
    const result = normalizeEventPayload('stored_ecg_data', raw) as any;
    expect(result.device_id).toBe('d1');
  });

  it('storedBodyCompositionData: passes through raw payload with snake_case keys', () => {
    const raw = { deviceId: 'd1', data: { timestamp: '2024-01-01 08:00:00', bmi: 22.5 } };
    const result = normalizeEventPayload('stored_body_composition_data', raw) as any;
    expect(result.device_id).toBe('d1');
  });

  it('pttTestResult: passes through raw payload with snake_case keys', () => {
    const raw = { deviceId: 'd1', result: { heartRate: 72, hrv: 45, qtInterval: 380, signalQuality: 100, progress: 50 } };
    const result = normalizeEventPayload('ptt_test_result', raw) as any;
    expect(result.device_id).toBe('d1');
  });

  it('pttStateChanged: passes through raw payload with snake_case keys', () => {
    const raw = { deviceId: 'd1', state: 'active' };
    expect(normalizeEventPayload('ptt_state_changed', raw)).toEqual({ device_id: 'd1', state: 'active' });
  });

  it('bluetoothStateChanged: normalizes numeric state and authorization', () => {
    const result = normalizeEventPayload('bluetooth_state_changed', {
      state: 5, authorization: 3, isScanning: false, pendingScanStart: false,
    }) as any;
    expect(result.state).toBe('powered_on');
    expect(result.authorization).toBe('allowed_always');
    expect(result.is_scanning).toBe(false);
  });

  it('bluetoothStateChanged: converts camelCase string state/auth values to snake_case', () => {
    const result = normalizeEventPayload('bluetooth_state_changed', {
      state: 'poweredOff', authorization: 'notDetermined', isScanning: false, pendingScanStart: false,
    }) as any;
    expect(result.state).toBe('powered_off');
    expect(result.authorization).toBe('not_determined');
    expect(result.is_scanning).toBe(false);
    expect(result.pending_scan_start).toBe(false);
  });

  it('readOriginProgress: converts decimal progress to integer percentage', () => {
    const result = normalizeEventPayload('read_origin_progress', {
      device_id: 'd1',
      progress: { readState: 'reading', totalDays: 3, currentDay: 2, progress: 0.5 },
    }) as any;
    expect(result.progress.progress).toBe(50);
    expect(result.progress.read_state).toBe('reading');
  });

  it('deviceFunction: normalizes data and functions fields', () => {
    const result = normalizeEventPayload('device_function', {
      deviceId: 'd1',
      data: { Bp: 1 },
      functions: undefined,
    }) as any;
    expect(result.data).toBeDefined();
    expect(result.functions).toBeDefined();
    expect(result.data.package1.blood_pressure).toBe('support');
  });

  it('deviceVersion: normalizes version sub-object', () => {
    const result = normalizeEventPayload('device_version', {
      deviceId: 'd1',
      version: { hardwareVersion: 'hw1', firmwareVersion: 'fw2' },
    }) as any;
    expect(result.version.hardware_version).toBe('hw1');
    expect(result.version.firmware_version).toBe('fw2');
  });

  it('passwordData: normalizes status to uppercase enum', () => {
    const result = normalizeEventPayload('password_data', {
      deviceId: 'd1',
      data: { status: 'check_success' },
    }) as any;
    expect(result.data.status).toBe('CHECK_SUCCESS');
  });

  it('passwordData: keeps the numeric rawStatus that status collapses', () => {
    // 1 and 6 both mean SUCCESS; only 6 means the band also synced its clock.
    const verified = normalizeEventPayload('password_data', {
      deviceId: 'd1',
      data: { status: 'SUCCESS', rawStatus: 1 },
    }) as any;
    const verifiedAndSynced = normalizeEventPayload('password_data', {
      deviceId: 'd1',
      data: { status: 'SUCCESS', rawStatus: 6 },
    }) as any;
    expect(verified.data.status).toBe('SUCCESS');
    expect(verifiedAndSynced.data.status).toBe('SUCCESS');
    expect(verified.data.raw_status).toBe(1);
    expect(verifiedAndSynced.data.raw_status).toBe(6);
  });

  it('passwordData: omits raw_status when native sent no number', () => {
    const result = normalizeEventPayload('password_data', {
      deviceId: 'd1',
      data: { status: 'SUCCESS' },
    }) as any;
    expect(result.data.raw_status).toBeUndefined();
  });

  it('socialMsgData: normalizes function status for each key', () => {
    const result = normalizeEventPayload('social_msg_data', {
      deviceId: 'd1',
      data: { phone: 1, sms: 0 },
    }) as any;
    expect(result.data.phone).toBe('support');
    expect(result.data.sms).toBe('unsupported');
  });

  it('heartRateTestResult: normalizes state from rawState', () => {
    const result = normalizeEventPayload('heart_rate_test_result', {
      deviceId: 'd1',
      result: { rawState: 1 },
    }) as any;
    expect(result.result.state).toBe('testing');
  });

  it('bloodPressureTestResult: normalizes state and pressure values', () => {
    const result = normalizeEventPayload('blood_pressure_test_result', {
      deviceId: 'd1',
      result: { rawState: 4, systolic: 120, diastolic: 80 },
    }) as any;
    expect(result.result.state).toBe('over');
    expect(result.result.systolic).toBe(120);
    expect(result.result.diastolic).toBe(80);
  });

  it('bloodOxygenTestResult: normalizes oxygenValue alias to value', () => {
    const result = normalizeEventPayload('blood_oxygen_test_result', {
      deviceId: 'd1',
      result: { rawState: 4, oxygenValue: 98 },
    }) as any;
    expect(result.result.state).toBe('over');
    expect(result.result.value).toBe(98);
  });

  it('temperatureTestResult: normalizes tempValue alias to value', () => {
    const result = normalizeEventPayload('temperature_test_result', {
      deviceId: 'd1',
      result: { rawState: 4, tempValue: 36.8 },
    }) as any;
    expect(result.result.state).toBe('over');
    expect(result.result.value).toBeCloseTo(36.8);
  });

  it('stressData: normalizes stress value', () => {
    const result = normalizeEventPayload('stress_data', {
      deviceId: 'd1',
      data: { stress: 42, timestamp: 1000 },
    }) as any;
    expect(result.data.stress).toBe(42);
    expect(result.data.timestamp).toBe(1000);
  });

  it('bloodGlucoseData: normalizes bloodGlucose alias to glucose', () => {
    const result = normalizeEventPayload('blood_glucose_data', {
      deviceId: 'd1',
      data: { bloodGlucose: 5.5 },
    }) as any;
    expect(result.data.glucose).toBeCloseTo(5.5);
  });

  it('hrvTestResult: normalizes value from hrv alias', () => {
    const result = normalizeEventPayload('hrv_test_result', {
      deviceId: 'd1',
      result: { rawState: 'testing', hrv: 55, progress: 10 },
    }) as any;
    expect(result.result.state).toBe('testing');
    expect(result.result.value).toBe(55);
    expect(result.result.progress).toBe(10);
  });

  it('ecgTestResult: normalizes waveform array', () => {
    const result = normalizeEventPayload('ecg_test_result', {
      deviceId: 'd1',
      result: { state: 'testing', progress: 50, heartRate: 72, waveform: [1, 2, 3] },
    }) as any;
    expect(result.result.heart_rate).toBe(72);
    expect(result.result.waveform).toEqual([1, 2, 3]);
  });

  it('batteryData: normalizes level and chargeState', () => {
    const result = normalizeEventPayload('battery_data', {
      deviceId: 'd1',
      data: { level: 75, state: 0 },
    }) as any;
    expect(result.data.level).toBe(75);
    expect(result.data.charge_state).toBe('normal');
  });

  it('sleepData: normalizes single sleep record', () => {
    const result = normalizeEventPayload('sleep_data', {
      deviceId: 'd1',
      data: { SLEEP_TIME: '22:00', WAKE_TIME: '06:00' },
    }) as any;
    expect(result.data).toBeDefined();
    expect(result.data).not.toBeNull();
  });

  it('sportStepData: normalizes step alias to step_count', () => {
    const result = normalizeEventPayload('sport_step_data', {
      deviceId: 'd1',
      data: { step: 5000 },
    }) as any;
    expect(result.data.step_count).toBe(5000);
  });

  it('originHalfHourData: normalizes half-hour item', () => {
    const result = normalizeEventPayload('origin_half_hour_data', {
      deviceId: 'd1',
      data: { time: '12:00', heartValue: 70 },
    }) as any;
    expect(result.data.heart_value).toBe(70);
    expect(result.data.time).toBe('12:00');
  });

  it('originFiveMinuteData: normalizes origin data item', () => {
    const result = normalizeEventPayload('origin_five_minute_data', {
      deviceId: 'd1',
      data: { time: '12:00', heartValue: 72 },
    }) as any;
    expect(result.data).toBeDefined();
    expect(result.data.heart_value).toBe(72);
  });

  it('alarmData: normalizes alarm list and converts repeat string', () => {
    const result = normalizeEventPayload('alarm_data', {
      deviceId: 'd1',
      alarms: [{ id: 1, enabled: 1, hour: 7, minute: 30, repeat: '0000011' }],
    }) as any;
    expect(result.device_id).toBe('d1');
    expect(result.alarms[0].repeat).toEqual([1, 2]);
    expect(result.alarms[0].hour).toBe(7);
  });

  it('originSpo2Data: normalizes spo2 origin fields', () => {
    const result = normalizeEventPayload('origin_spo2_data', {
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
    const result = normalizeEventPayload('heart_rate_alarm_data', {
      deviceId: 'd1',
      data: { enabled: 1, highThreshold: 120, lowThreshold: 50 },
    }) as any;
    expect(result.device_id).toBe('d1');
    expect(result.data.enabled).toBe(true);
    expect(result.data.high_threshold).toBe(120);
    expect(result.data.low_threshold).toBe(50);
  });

  it('findDeviceState: normalizes phase and raw_state', () => {
    const result = normalizeEventPayload('find_device_state', {
      deviceId: 'd1',
      phase: 'searching',
      rawState: 1,
    }) as any;
    expect(result.device_id).toBe('d1');
    expect(result.phase).toBe('searching');
    expect(result.raw_state).toBe(1);
  });

  it('findDeviceState: unknown phase becomes unsupported', () => {
    const result = normalizeEventPayload('find_device_state', {
      deviceId: 'd1',
      phase: 'nope',
    }) as any;
    expect(result.phase).toBe('unsupported');
  });

  it('contactsData: normalizes contact list', () => {
    const result = normalizeEventPayload('contacts_data', {
      deviceId: 'd1',
      contacts: [{ contactID: 1, name: 'Alice', phoneNumber: '+1234', isSOS: true }],
    }) as any;
    expect(result.device_id).toBe('d1');
    expect(result.contacts[0].name).toBe('Alice');
    expect(result.contacts[0].phone_number).toBe('+1234');
    expect(result.contacts[0].is_sos).toBe(true);
  });

  it('sosCallTimesData: normalizes SOS call times', () => {
    const result = normalizeEventPayload('sos_call_times_data', {
      deviceId: 'd1',
      data: { times: 3, minTimes: 1, maxTimes: 9 },
    }) as any;
    expect(result.device_id).toBe('d1');
    expect(result.data.times).toBe(3);
    expect(result.data.min_times).toBe(1);
    expect(result.data.max_times).toBe(9);
  });

  it('fatigueTestResult: normalizes fatigue level alias', () => {
    const result = normalizeEventPayload('fatigue_test_result', {
      deviceId: 'd1',
      result: { rawState: 'over', fatigueLevel: 2, progress: 100 },
    }) as any;
    expect(result.result.state).toBe('over');
    expect(result.result.level).toBe(2);
    expect(result.result.progress).toBe(100);
  });

  it('breathingTestResult: normalizes breathing rate alias', () => {
    const result = normalizeEventPayload('breathing_test_result', {
      deviceId: 'd1',
      result: { rawState: 'testing', breathingRate: 18, progress: 50 },
    }) as any;
    expect(result.result.state).toBe('testing');
    expect(result.result.rate).toBe(18);
    expect(result.result.progress).toBe(50);
  });
});

describe('normalizeEventPayload bodyCompositionTestResult', () => {
  it('normalizes result and nested composition', () => {
    const result = normalizeEventPayload('body_composition_test_result', {
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
    const result = normalizeEventPayload('firmware_dfu_progress', {
      deviceId: 'ab',
      progress: '50',
      state: 'updating',
    }) as any;
    expect(result.device_id).toBe('ab');
    expect(result.progress).toBe(50);
    expect(result.state).toBe('updating');
  });

  it('maps unknown state to unknown', () => {
    const result = normalizeEventPayload('firmware_dfu_progress', {
      deviceId: 'x',
      progress: 2,
      state: 'bogus',
    }) as { state: string };
    expect(result.state).toBe('unknown');
  });
});

describe('normalizeEventPayload — cameraShutter', () => {
  it('normalizes canTake status', () => {
    const r = normalizeEventPayload('camera_shutter', { deviceId: 'd1', status: 'TAKEPHOTO_CAN' }) as any;
    expect(r.status).toBe('canTake');
    expect(r.device_id).toBe('d1');
  });

  it('normalizes cannotTake status', () => {
    const r = normalizeEventPayload('camera_shutter', { deviceId: 'd1', status: 'TAKEPHOTO_CAN_NOT' }) as any;
    expect(r.status).toBe('cannotTake');
  });
});

describe('normalizeEventPayload — musicRemoteCommand', () => {
  it('normalizes next command', () => {
    const r = normalizeEventPayload('music_remote_command', { deviceId: 'd1', command: 'next' }) as any;
    expect(r.command).toBe('next');
  });

  it('normalizes previous command', () => {
    const r = normalizeEventPayload('music_remote_command', { deviceId: 'd1', command: 'previous' }) as any;
    expect(r.command).toBe('previous');
  });

  it('normalizes pausePlay command', () => {
    const r = normalizeEventPayload('music_remote_command', { deviceId: 'd1', command: 'pausePlay' }) as any;
    expect(r.command).toBe('pause_play');
  });
});

describe('normalizeEventPayload — device_bt_state_changed', () => {
  it('normalizes numeric state', () => {
    const r = normalizeEventPayload('device_bt_state_changed', {
      deviceId: 'd1', state: 1, btSwitchOpen: true, mediaSwitchOpen: false,
    }) as any;
    expect(r.state).toBe('connected');
    expect(r.bt_switch_open).toBe(true);
    expect(r.media_switch_open).toBe(false);
  });

  it('normalizes string state via btState fallback', () => {
    const r = normalizeEventPayload('device_bt_state_changed', {
      deviceId: 'd1', btState: 'pairing', btSwitchOpen: false, mediaSwitchOpen: false,
    }) as any;
    expect(r.state).toBe('pairing');
  });
});
