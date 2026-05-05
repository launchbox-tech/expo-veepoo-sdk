import { deepSnakeKeys, deepCamelKeys } from '@/normalizers/deep-keys';

describe('deepSnakeKeys', () => {
  describe('flat objects', () => {
    it('converts camelCase keys to snake_case', () => {
      expect(deepSnakeKeys({ deviceId: '123', heartValue: 72 })).toEqual({
        device_id: '123',
        heart_value: 72,
      });
    });

    it('leaves already-snake_case keys unchanged', () => {
      expect(deepSnakeKeys({ device_id: '123' })).toEqual({ device_id: '123' });
    });

    it('leaves single-word lowercase keys unchanged', () => {
      expect(deepSnakeKeys({ state: 'idle', progress: 0 })).toEqual({ state: 'idle', progress: 0 });
    });
  });

  describe('acronym sequences', () => {
    it('btSwitchOpen → bt_switch_open', () => {
      expect(deepSnakeKeys({ btSwitchOpen: true })).toEqual({ bt_switch_open: true });
    });

    it('isOadModel → is_oad_model', () => {
      expect(deepSnakeKeys({ isOadModel: false })).toEqual({ is_oad_model: false });
    });

    it('spo2Value → spo2_value (digit treated as lowercase boundary)', () => {
      expect(deepSnakeKeys({ spo2Value: 98 })).toEqual({ spo2_value: 98 });
    });

    it('is24Hour → is24_hour (digit before uppercase, no letter-digit split)', () => {
      expect(deepSnakeKeys({ is24Hour: true })).toEqual({ is24_hour: true });
    });

    it('deviceBTStateChanged → device_bt_state_changed', () => {
      expect(deepSnakeKeys({ deviceBTStateChanged: 'on' })).toEqual({
        device_bt_state_changed: 'on',
      });
    });

    it('mediaSwitchOpen → media_switch_open', () => {
      expect(deepSnakeKeys({ mediaSwitchOpen: true })).toEqual({ media_switch_open: true });
    });
  });

  describe('nested objects', () => {
    it('recursively converts keys in nested objects', () => {
      expect(
        deepSnakeKeys({ deviceId: '1', version: { firmwareVersion: '2.0', hardwareVersion: '1.0' } })
      ).toEqual({
        device_id: '1',
        version: { firmware_version: '2.0', hardware_version: '1.0' },
      });
    });

    it('handles multiple levels of nesting', () => {
      expect(deepSnakeKeys({ outerKey: { innerKey: { deepKey: 42 } } })).toEqual({
        outer_key: { inner_key: { deep_key: 42 } },
      });
    });
  });

  describe('arrays', () => {
    it('converts keys in objects inside arrays', () => {
      expect(deepSnakeKeys([{ deviceId: '1' }, { deviceId: '2' }])).toEqual([
        { device_id: '1' },
        { device_id: '2' },
      ]);
    });

    it('handles arrays nested inside objects', () => {
      expect(deepSnakeKeys({ sleepData: [{ sleepTime: 100 }] })).toEqual({
        sleep_data: [{ sleep_time: 100 }],
      });
    });

    it('passes through primitive arrays unchanged', () => {
      expect(deepSnakeKeys([1, 2, 3])).toEqual([1, 2, 3]);
      expect(deepSnakeKeys(['a', 'b'])).toEqual(['a', 'b']);
    });
  });

  describe('primitives and nullish values', () => {
    it('passes null through unchanged', () => {
      expect(deepSnakeKeys(null)).toBeNull();
    });

    it('passes undefined through unchanged', () => {
      expect(deepSnakeKeys(undefined)).toBeUndefined();
    });

    it('passes numbers through unchanged', () => {
      expect(deepSnakeKeys(42)).toBe(42);
    });

    it('passes strings through unchanged (does not convert string values)', () => {
      expect(deepSnakeKeys('poweredOff')).toBe('poweredOff');
    });

    it('passes booleans through unchanged', () => {
      expect(deepSnakeKeys(true)).toBe(true);
    });
  });

  describe('object with nullish values', () => {
    it('preserves null values in objects', () => {
      expect(deepSnakeKeys({ someKey: null })).toEqual({ some_key: null });
    });

    it('preserves undefined values in objects', () => {
      expect(deepSnakeKeys({ someKey: undefined })).toEqual({ some_key: undefined });
    });
  });
});

describe('deepCamelKeys', () => {
  describe('flat objects', () => {
    it('converts snake_case keys to camelCase', () => {
      expect(deepCamelKeys({ device_id: '123', heart_value: 72 })).toEqual({
        deviceId: '123',
        heartValue: 72,
      });
    });

    it('leaves already-camelCase keys unchanged', () => {
      expect(deepCamelKeys({ deviceId: '123' })).toEqual({ deviceId: '123' });
    });
  });

  describe('acronym roundtrips', () => {
    it('bt_switch_open → btSwitchOpen', () => {
      expect(deepCamelKeys({ bt_switch_open: true })).toEqual({ btSwitchOpen: true });
    });

    it('is_oad_model → isOadModel', () => {
      expect(deepCamelKeys({ is_oad_model: false })).toEqual({ isOadModel: false });
    });

    it('spo2_value → spo2Value', () => {
      expect(deepCamelKeys({ spo2_value: 98 })).toEqual({ spo2Value: 98 });
    });

    it('is24_hour → is24Hour', () => {
      expect(deepCamelKeys({ is24_hour: true })).toEqual({ is24Hour: true });
    });

    it('device_bt_state_changed → deviceBTStateChanged', () => {
      expect(deepCamelKeys({ device_bt_state_changed: 'on' })).toEqual({
        deviceBtStateChanged: 'on',
      });
    });
  });

  describe('nested objects and arrays', () => {
    it('recursively converts keys in nested objects', () => {
      expect(
        deepCamelKeys({ device_id: '1', version: { firmware_version: '2.0' } })
      ).toEqual({
        deviceId: '1',
        version: { firmwareVersion: '2.0' },
      });
    });

    it('converts keys in objects inside arrays', () => {
      expect(deepCamelKeys([{ device_id: '1' }, { device_id: '2' }])).toEqual([
        { deviceId: '1' },
        { deviceId: '2' },
      ]);
    });
  });

  describe('primitives and nullish values', () => {
    it('passes null through unchanged', () => {
      expect(deepCamelKeys(null)).toBeNull();
    });

    it('passes undefined through unchanged', () => {
      expect(deepCamelKeys(undefined)).toBeUndefined();
    });

    it('passes numbers through unchanged', () => {
      expect(deepCamelKeys(42)).toBe(42);
    });

    it('passes strings through unchanged', () => {
      expect(deepCamelKeys('device_id')).toBe('device_id');
    });
  });
});

describe('deepSnakeKeys / deepCamelKeys roundtrip', () => {
  it('snake → camel → snake is identity for standard camelCase objects', () => {
    const original = {
      deviceId: 'abc',
      heartValue: 72,
      version: { firmwareVersion: '1.0' },
      alarms: [{ alarmId: 1, isEnabled: true }],
    };
    expect(deepCamelKeys(deepSnakeKeys(original))).toEqual(original);
  });

  it('camel → snake → camel is identity for standard snake_case objects', () => {
    const original = {
      device_id: 'abc',
      heart_value: 72,
      version: { firmware_version: '1.0' },
      alarms: [{ alarm_id: 1, is_enabled: true }],
    };
    expect(deepSnakeKeys(deepCamelKeys(original))).toEqual(original);
  });
});
