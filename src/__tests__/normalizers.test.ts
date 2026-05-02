import {
  normalizeAlarmList,
  normalizeBluetoothStatus,
  normalizeEventPayload,
  normalizePermissionsResult,
  normalizeReadOriginProgressPayload,
} from '../normalizers';

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
      canAskAgain: false,
    });

    expect(normalizePermissionsResult('denied')).toEqual({
      granted: false,
      status: 'denied',
      canAskAgain: true,
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
      canAskAgain: false,
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
      state: 'poweredOn',
      stateName: 'poweredOn',
      authorization: 'allowedAlways',
      authorizationName: 'allowedAlways',
      isScanning: true,
      pendingScanStart: false,
    });
  });
});

describe('normalizeReadOriginProgressPayload', () => {
  it('converts progress to an integer percentage', () => {
    expect(
      normalizeReadOriginProgressPayload({
        deviceId: 'd1',
        progress: {
          readState: 'reading',
          totalDays: 3,
          currentDay: 2,
          progress: 0.6789,
        },
      })
    ).toEqual({
      deviceId: 'd1',
      progress: {
        readState: 'reading',
        totalDays: 3,
        currentDay: 2,
        progress: 67,
      },
    });
  });

  it('converts a completed fractional progress to 100', () => {
    expect(
      normalizeReadOriginProgressPayload({
        deviceId: 'd1',
        progress: {
          readState: 'complete',
          totalDays: 1,
          currentDay: 1,
          progress: 1.0,
        },
      })
    ).toEqual({
      deviceId: 'd1',
      progress: {
        readState: 'complete',
        totalDays: 1,
        currentDay: 1,
        progress: 100,
      },
    });
  });

  it('clamps percent-style values to 100', () => {
    expect(
      normalizeReadOriginProgressPayload({
        deviceId: 'd1',
        progress: {
          readState: 'complete',
          totalDays: 1,
          currentDay: 1,
          progress: 120,
        },
      })
    ).toEqual({
      deviceId: 'd1',
      progress: {
        readState: 'complete',
        totalDays: 1,
        currentDay: 1,
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

  it('returns pass-through events unchanged (reference equality)', () => {
    const payload = { deviceId: 'x', timestamp: 1 };
    expect(normalizeEventPayload('deviceFound', payload)).toBe(payload);
    expect(normalizeEventPayload('deviceConnected', payload)).toBe(payload);
    expect(normalizeEventPayload('deviceDisconnected', payload)).toBe(payload);
    expect(normalizeEventPayload('deviceReady', payload)).toBe(payload);
    expect(normalizeEventPayload('readOriginComplete', payload)).toBe(payload);
    expect(normalizeEventPayload('error', payload)).toBe(payload);
  });

  it('bluetoothStateChanged: normalizes numeric state and authorization', () => {
    const result = normalizeEventPayload('bluetoothStateChanged', {
      state: 5, authorization: 3, isScanning: false, pendingScanStart: false,
    }) as any;
    expect(result.state).toBe('poweredOn');
    expect(result.authorization).toBe('allowedAlways');
    expect(result.isScanning).toBe(false);
  });

  it('readOriginProgress: converts decimal progress to integer percentage', () => {
    const result = normalizeEventPayload('readOriginProgress', {
      deviceId: 'd1',
      progress: { readState: 'reading', totalDays: 3, currentDay: 2, progress: 0.5 },
    }) as any;
    expect(result.progress.progress).toBe(50);
    expect(result.progress.readState).toBe('reading');
  });

  it('deviceFunction: normalizes data and functions fields', () => {
    const result = normalizeEventPayload('deviceFunction', {
      deviceId: 'd1',
      data: { Bp: 1 },
      functions: undefined,
    }) as any;
    expect(result.data).toBeDefined();
    expect(result.functions).toBeDefined();
    expect(result.data.package1.bloodPressure).toBe('support');
  });

  it('deviceVersion: normalizes version sub-object', () => {
    const result = normalizeEventPayload('deviceVersion', {
      deviceId: 'd1',
      version: { hardwareVersion: 'hw1', firmwareVersion: 'fw2' },
    }) as any;
    expect(result.version.hardwareVersion).toBe('hw1');
    expect(result.version.firmwareVersion).toBe('fw2');
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

  it('batteryData: normalizes level and chargeState', () => {
    const result = normalizeEventPayload('batteryData', {
      deviceId: 'd1',
      data: { level: 75, state: 0 },
    }) as any;
    expect(result.data.level).toBe(75);
    expect(result.data.chargeState).toBe('normal');
  });

  it('sleepData: normalizes single sleep record', () => {
    const result = normalizeEventPayload('sleepData', {
      deviceId: 'd1',
      data: { SLEEP_TIME: '22:00', WAKE_TIME: '06:00' },
    }) as any;
    expect(result.data).toBeDefined();
    expect(result.data).not.toBeNull();
  });

  it('sportStepData: normalizes step alias to stepCount', () => {
    const result = normalizeEventPayload('sportStepData', {
      deviceId: 'd1',
      data: { step: 5000 },
    }) as any;
    expect(result.data.stepCount).toBe(5000);
  });

  it('originHalfHourData: normalizes half-hour item', () => {
    const result = normalizeEventPayload('originHalfHourData', {
      deviceId: 'd1',
      data: { time: '12:00', heartValue: 70 },
    }) as any;
    expect(result.data.heartValue).toBe(70);
    expect(result.data.time).toBe('12:00');
  });

  it('originFiveMinuteData: normalizes origin data item', () => {
    const result = normalizeEventPayload('originFiveMinuteData', {
      deviceId: 'd1',
      data: { time: '12:00', heartValue: 72 },
    }) as any;
    expect(result.data).toBeDefined();
    expect(result.data.heartValue).toBe(72);
  });

  it('alarmData: normalizes alarm list and converts repeat string', () => {
    const result = normalizeEventPayload('alarmData', {
      deviceId: 'd1',
      alarms: [{ id: 1, enabled: 1, hour: 7, minute: 30, repeat: '0000011' }],
    }) as any;
    expect(result.deviceId).toBe('d1');
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
    expect(result.deviceId).toBe('d1');
    expect(result.data.time).toBe('08:00');
    expect(result.data.heartValue).toBe(68);
    expect(result.data.value).toBe(98);
    expect(result.data.allPackNumber).toBe(10);
    expect(result.data.currentPackNumber).toBe(1);
  });
});
