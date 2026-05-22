import {
  normalizeBluetoothStatus,
  normalizePasswordData,
  normalizePermissionsResult,
} from './normalizers';

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

// ── Additional normalizePermissionsResult coverage ────────────────────────────

describe('normalizePermissionsResult (additional string cases)', () => {
  it('normalizes "restricted" string', () => {
    expect(normalizePermissionsResult('restricted')).toEqual({
      granted: false,
      status: 'restricted',
      can_ask_again: false,
    });
  });

  it('normalizes "never_ask_again" string', () => {
    expect(normalizePermissionsResult('never_ask_again')).toEqual({
      granted: false,
      status: 'never_ask_again',
      can_ask_again: false,
    });
  });

  it('normalizes "poweredoff" string (case-insensitive)', () => {
    expect(normalizePermissionsResult('poweredoff')).toEqual({
      granted: false,
      status: 'powered_off',
      can_ask_again: false,
    });
  });

  it('normalizes "powered_off" string', () => {
    expect(normalizePermissionsResult('powered_off')).toEqual({
      granted: false,
      status: 'powered_off',
      can_ask_again: false,
    });
  });

  it('normalizes "unknown" string', () => {
    expect(normalizePermissionsResult('unknown')).toEqual({
      granted: false,
      status: 'unknown',
      can_ask_again: true,
    });
  });

  it('defaults to denied for unrecognized strings', () => {
    expect(normalizePermissionsResult('something_else')).toEqual({
      granted: false,
      status: 'denied',
      can_ask_again: true,
    });
  });

  it('normalizes boolean true to granted', () => {
    expect(normalizePermissionsResult(true)).toEqual({
      granted: true,
      status: 'granted',
      can_ask_again: false,
    });
  });

  it('normalizes boolean false to denied', () => {
    expect(normalizePermissionsResult(false)).toEqual({
      granted: false,
      status: 'denied',
      can_ask_again: true,
    });
  });

  it('returns unknown for null / non-object non-string non-boolean', () => {
    expect(normalizePermissionsResult(null)).toEqual({
      granted: false,
      status: 'unknown',
      can_ask_again: true,
    });
  });
});

// ── Additional normalizeBluetoothStatus coverage ──────────────────────────────

describe('normalizeBluetoothStatus (additional cases)', () => {
  it('handles string state and authorization values via valueMap', () => {
    const result = normalizeBluetoothStatus({
      state: 'poweredOff',
      authorization: 'notDetermined',
      isScanning: false,
      pendingScanStart: false,
    }) as any;
    expect(result.state).toBe('powered_off');
    expect(result.authorization).toBe('not_determined');
  });

  it('passes through unknown string state as-is', () => {
    const result = normalizeBluetoothStatus({
      state: 'someCustomState',
      authorization: 'allowedAlways',
    }) as any;
    expect(result.state).toBe('someCustomState');
    expect(result.authorization).toBe('allowed_always');
  });

  it('uses stateName/authorizationName when provided', () => {
    const result = normalizeBluetoothStatus({
      state: 5,
      authorization: 3,
      stateName: 'PoweredOn',
      authorizationName: 'AllowedAlways',
      isScanning: true,
      pendingScanStart: true,
    }) as any;
    expect(result.state_name).toBe('PoweredOn');
    expect(result.authorization_name).toBe('AllowedAlways');
    expect(result.is_scanning).toBe(true);
    expect(result.pending_scan_start).toBe(true);
  });

  it('returns raw value for non-record input', () => {
    expect(normalizeBluetoothStatus('raw_string')).toBe('raw_string');
    expect(normalizeBluetoothStatus(42)).toBe(42);
    expect(normalizeBluetoothStatus(null)).toBe(null);
  });
});

// ── normalizePasswordData coverage ───────────────────────────────────────────

describe('normalizePasswordData', () => {
  it('returns UNKNOWN status for empty record', () => {
    const result = normalizePasswordData({});
    expect(result.status).toBe('UNKNOWN');
  });

  it('maps CHECK_SUCCESS status', () => {
    const result = normalizePasswordData({ status: 'CHECK_SUCCESS' });
    expect(result.status).toBe('CHECK_SUCCESS');
  });

  it('maps CHECK_FAIL status', () => {
    const result = normalizePasswordData({ status: 'CHECK_FAIL' });
    expect(result.status).toBe('CHECK_FAIL');
  });

  it('maps NOT_SET status', () => {
    const result = normalizePasswordData({ status: 'NOT_SET' });
    expect(result.status).toBe('NOT_SET');
  });

  it('maps SUCCESS (without CHECK_ prefix) to SUCCESS', () => {
    const result = normalizePasswordData({ status: 'SUCCESS' });
    expect(result.status).toBe('SUCCESS');
  });

  it('maps FAIL (without CHECK_ prefix) to FAILED', () => {
    const result = normalizePasswordData({ status: 'FAIL' });
    expect(result.status).toBe('FAILED');
  });

  it('reads rawStatus, mStatus, result aliases', () => {
    expect(normalizePasswordData({ rawStatus: 'CHECK_SUCCESS' }).status).toBe('CHECK_SUCCESS');
    expect(normalizePasswordData({ mStatus: 'NOT_SET' }).status).toBe('NOT_SET');
    expect(normalizePasswordData({ result: 'CHECK_FAIL' }).status).toBe('CHECK_FAIL');
  });

  it('normalizes optional fields', () => {
    const result = normalizePasswordData({
      status: 'CHECK_SUCCESS',
      password: '123456',
      deviceNumber: 'D001',
      deviceVersion: '1.0',
      deviceTestVersion: '0.1',
      isHaveDrinkData: true,
      isOpenNightTurnWrist: 1,
      findPhoneFunction: 0,
      wearDetectFunction: 2,
    });
    expect(result.password).toBe('123456');
    expect(result.device_number).toBe('D001');
    expect(result.device_version).toBe('1.0');
    expect(result.device_test_version).toBe('0.1');
    expect(result.is_have_drink_data).toBe(true);
    expect(result.is_open_night_turn_wrist).toBe('support');
    expect(result.find_phone_function).toBe('unsupported');
    expect(result.wear_detect_function).toBe('open');
  });

  it('leaves optional fields undefined when absent', () => {
    const result = normalizePasswordData({ status: 'CHECK_SUCCESS' });
    expect(result.is_have_drink_data).toBeUndefined();
    expect(result.is_open_night_turn_wrist).toBeUndefined();
    expect(result.find_phone_function).toBeUndefined();
    expect(result.wear_detect_function).toBeUndefined();
  });

  it('handles non-record input gracefully', () => {
    const result = normalizePasswordData(null);
    expect(result.status).toBe('UNKNOWN');
    expect(result.password).toBe('');
  });
});
