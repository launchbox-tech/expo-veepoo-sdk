import {
  validateDeviceId,
  validateConnectOptions,
  validatePersonalInfo,
  validateAutoMeasureSetting,
  validateAlarm,
  validateDeleteAlarm,
  validateSocialMsgData,
  validateHeartRateAlarm,
  validateScreenLightDurationSeconds,
  validateScreenLightSettings,
  validateSedentaryReminderSettings,
  validateWristFlipWakeSettings,
  validateWomenHealthSettings,
  validateFirmwareDfuFilePath,
  validateReadWatchFaceStyleOptions,
  validateWatchFaceStyleSettings,
  validateDeviceTime,
} from '../../validators/index';

function expectInvalidArgument(fn: () => void, fieldHint?: string): void {
  let thrown: unknown;
  try {
    fn();
  } catch (e) {
    thrown = e;
  }
  expect(thrown).toBeDefined();
  expect((thrown as any).code).toBe('INVALID_ARGUMENT');
  if (fieldHint) {
    expect((thrown as any).message).toContain(fieldHint);
  }
}

describe('validateDeviceId', () => {
  it('throws INVALID_ARGUMENT for empty string', () => {
    expectInvalidArgument(() => validateDeviceId(''), 'deviceId');
  });

  it('throws INVALID_ARGUMENT for whitespace-only string', () => {
    expectInvalidArgument(() => validateDeviceId('   '), 'deviceId');
  });

  it('throws INVALID_ARGUMENT for non-string values', () => {
    expectInvalidArgument(() => validateDeviceId(null as any), 'deviceId');
    expectInvalidArgument(() => validateDeviceId(undefined as any), 'deviceId');
    expectInvalidArgument(() => validateDeviceId(42 as any), 'deviceId');
  });

  it('passes for a valid device id', () => {
    expect(() => validateDeviceId('AA:BB:CC:DD:EE:FF')).not.toThrow();
  });
});

describe('validateConnectOptions', () => {
  it('passes for an empty options object', () => {
    expect(() => validateConnectOptions({})).not.toThrow();
  });

  it('throws when password is an empty string', () => {
    expectInvalidArgument(() => validateConnectOptions({ password: '' }), 'options.password');
  });

  it('passes when password is a valid string', () => {
    expect(() => validateConnectOptions({ password: '1234' })).not.toThrow();
  });

  it('throws when timeSetting.hour is out of range', () => {
    expectInvalidArgument(
      () => validateConnectOptions({ timeSetting: { year: 2024, month: 1, day: 1, hour: 24, minute: 0, second: 0 } }),
      'timeSetting.hour',
    );
  });

  it('throws when timeSetting.minute is out of range', () => {
    expectInvalidArgument(
      () => validateConnectOptions({ timeSetting: { year: 2024, month: 1, day: 1, hour: 0, minute: 60, second: 0 } }),
      'timeSetting.minute',
    );
  });

  it('throws when timeSetting.month is out of range', () => {
    expectInvalidArgument(
      () => validateConnectOptions({ timeSetting: { year: 2024, month: 13, day: 1, hour: 0, minute: 0, second: 0 } }),
      'timeSetting.month',
    );
  });

  it('passes for valid timeSetting', () => {
    expect(() =>
      validateConnectOptions({ timeSetting: { year: 2024, month: 6, day: 15, hour: 10, minute: 30, second: 0 } })
    ).not.toThrow();
  });
});

describe('validatePersonalInfo', () => {
  const valid = { sex: 1 as 0 | 1, height: 170, weight: 70, age: 30, stepAim: 8000, sleepAim: 480 };

  it('passes for valid info', () => {
    expect(() => validatePersonalInfo(valid)).not.toThrow();
  });

  it('throws for invalid sex', () => {
    expectInvalidArgument(() => validatePersonalInfo({ ...valid, sex: 2 as any }), 'sex');
  });

  it('throws for height below range and names the field', () => {
    expectInvalidArgument(() => validatePersonalInfo({ ...valid, height: -5 }), 'height');
  });

  it('throws for height above range', () => {
    expectInvalidArgument(() => validatePersonalInfo({ ...valid, height: 301 }), 'height');
  });

  it('throws for weight below range', () => {
    expectInvalidArgument(() => validatePersonalInfo({ ...valid, weight: 0 }), 'weight');
  });

  it('throws for weight above range', () => {
    expectInvalidArgument(() => validatePersonalInfo({ ...valid, weight: 501 }), 'weight');
  });

  it('throws for age below range', () => {
    expectInvalidArgument(() => validatePersonalInfo({ ...valid, age: 0 }), 'age');
  });

  it('throws for age above range', () => {
    expectInvalidArgument(() => validatePersonalInfo({ ...valid, age: 121 }), 'age');
  });

  it('throws for stepAim below range', () => {
    expectInvalidArgument(() => validatePersonalInfo({ ...valid, stepAim: 0 }), 'stepAim');
  });

  it('throws for stepAim above range', () => {
    expectInvalidArgument(() => validatePersonalInfo({ ...valid, stepAim: 100_001 }), 'stepAim');
  });

  it('passes for sleepAim = 0', () => {
    expect(() => validatePersonalInfo({ ...valid, sleepAim: 0 })).not.toThrow();
  });

  it('throws for sleepAim above 1440', () => {
    expectInvalidArgument(() => validatePersonalInfo({ ...valid, sleepAim: 1_441 }), 'sleepAim');
  });
});

describe('validateAutoMeasureSetting', () => {
  it('passes for empty partial', () => {
    expect(() => validateAutoMeasureSetting({})).not.toThrow();
  });

  it('throws for measureInterval below 1', () => {
    expectInvalidArgument(() => validateAutoMeasureSetting({ measureInterval: 0 }), 'measureInterval');
  });

  it('throws for measureInterval above 120', () => {
    expectInvalidArgument(() => validateAutoMeasureSetting({ measureInterval: 121 }), 'measureInterval');
  });

  it('passes for valid measureInterval', () => {
    expect(() => validateAutoMeasureSetting({ measureInterval: 30 })).not.toThrow();
  });

  it('throws for currentStartMinute above 1439', () => {
    expectInvalidArgument(() => validateAutoMeasureSetting({ currentStartMinute: 1440 }), 'currentStartMinute');
  });

  it('throws for currentEndMinute above 1439', () => {
    expectInvalidArgument(() => validateAutoMeasureSetting({ currentEndMinute: 1440 }), 'currentEndMinute');
  });
});

describe('validateAlarm', () => {
  const valid = { id: 1, enabled: true, hour: 7, minute: 30, repeat: [1, 2, 3, 4, 5] };

  it('passes for valid alarm', () => {
    expect(() => validateAlarm(valid)).not.toThrow();
  });

  it('passes for empty repeat (one-shot)', () => {
    expect(() => validateAlarm({ ...valid, repeat: [] })).not.toThrow();
  });

  it('passes for text of exactly 60 bytes', () => {
    expect(() => validateAlarm({ ...valid, text: 'a'.repeat(60) })).not.toThrow();
  });

  it('throws for id out of range', () => {
    expectInvalidArgument(() => validateAlarm({ ...valid, id: 0 }), 'id');
    expectInvalidArgument(() => validateAlarm({ ...valid, id: 21 }), 'id');
  });

  it('throws for hour out of range', () => {
    expectInvalidArgument(() => validateAlarm({ ...valid, hour: 24 }), 'hour');
    expectInvalidArgument(() => validateAlarm({ ...valid, hour: -1 }), 'hour');
  });

  it('throws for minute out of range', () => {
    expectInvalidArgument(() => validateAlarm({ ...valid, minute: 60 }), 'minute');
    expectInvalidArgument(() => validateAlarm({ ...valid, minute: -1 }), 'minute');
  });

  it('throws for invalid repeat element', () => {
    expectInvalidArgument(() => validateAlarm({ ...valid, repeat: [0] }), 'repeat element');
    expectInvalidArgument(() => validateAlarm({ ...valid, repeat: [8] }), 'repeat element');
  });

  it('throws for scene out of range', () => {
    expectInvalidArgument(() => validateAlarm({ ...valid, scene: 21 }), 'scene');
    expectInvalidArgument(() => validateAlarm({ ...valid, scene: -1 }), 'scene');
  });

  it('passes for scene at boundaries', () => {
    expect(() => validateAlarm({ ...valid, scene: 0 })).not.toThrow();
    expect(() => validateAlarm({ ...valid, scene: 20 })).not.toThrow();
  });

  it('throws for text exceeding 60 bytes', () => {
    expectInvalidArgument(() => validateAlarm({ ...valid, text: 'a'.repeat(61) }), 'text');
  });
});

describe('validateDeleteAlarm', () => {
  it('passes for valid alarmId', () => {
    expect(() => validateDeleteAlarm(1)).not.toThrow();
    expect(() => validateDeleteAlarm(20)).not.toThrow();
  });

  it('throws for alarmId out of range', () => {
    expectInvalidArgument(() => validateDeleteAlarm(0), 'alarmId');
    expectInvalidArgument(() => validateDeleteAlarm(21), 'alarmId');
  });
});

describe('validateSocialMsgData', () => {
  it('throws INVALID_ARGUMENT for empty object', () => {
    expectInvalidArgument(() => validateSocialMsgData({}));
  });

  it('passes for a single valid channel', () => {
    expect(() => validateSocialMsgData({ whatsapp: 'open' })).not.toThrow();
  });

  it('passes for multiple valid channels', () => {
    expect(() => validateSocialMsgData({ whatsapp: 'open', instagram: 'close' })).not.toThrow();
  });

  it('throws INVALID_ARGUMENT for an invalid FunctionStatus value', () => {
    expectInvalidArgument(() => validateSocialMsgData({ whatsapp: 'badvalue' as any }), 'whatsapp');
  });

  it('throws when one channel is invalid even if others are valid', () => {
    expectInvalidArgument(() => validateSocialMsgData({ phone: 'open', sms: 'invalid' as any }), 'sms');
  });

  it('passes for all valid FunctionStatus literals', () => {
    expect(() => validateSocialMsgData({ phone: 'unsupported' })).not.toThrow();
    expect(() => validateSocialMsgData({ sms: 'support' })).not.toThrow();
    expect(() => validateSocialMsgData({ wechat: 'open' })).not.toThrow();
    expect(() => validateSocialMsgData({ qq: 'close' })).not.toThrow();
    expect(() => validateSocialMsgData({ facebook: 'unknown' })).not.toThrow();
  });

  it('passes for all 13 channel keys with valid values', () => {
    expect(() =>
      validateSocialMsgData({
        phone: 'open',
        sms: 'open',
        wechat: 'close',
        qq: 'close',
        facebook: 'open',
        twitter: 'open',
        instagram: 'close',
        linkedin: 'open',
        whatsapp: 'open',
        line: 'close',
        skype: 'open',
        email: 'open',
        other: 'close',
      })
    ).not.toThrow();
  });
});

describe('validateHeartRateAlarm', () => {
  const valid = { enabled: true, highThreshold: 120, lowThreshold: 50 };

  it('passes for a valid alarm', () => {
    expect(() => validateHeartRateAlarm(valid)).not.toThrow();
  });

  it('passes when enabled is false', () => {
    expect(() => validateHeartRateAlarm({ ...valid, enabled: false })).not.toThrow();
  });

  it('throws for highThreshold of 0', () => {
    expectInvalidArgument(() => validateHeartRateAlarm({ ...valid, highThreshold: 0 }), 'highThreshold');
  });

  it('throws for highThreshold of 301', () => {
    expectInvalidArgument(() => validateHeartRateAlarm({ ...valid, highThreshold: 301 }), 'highThreshold');
  });

  it('throws for lowThreshold of 0', () => {
    expectInvalidArgument(() => validateHeartRateAlarm({ ...valid, lowThreshold: 0 }), 'lowThreshold');
  });

  it('throws for lowThreshold of 301', () => {
    expectInvalidArgument(() => validateHeartRateAlarm({ ...valid, lowThreshold: 301 }), 'lowThreshold');
  });

  it('throws when lowThreshold equals highThreshold', () => {
    expectInvalidArgument(() => validateHeartRateAlarm({ ...valid, highThreshold: 100, lowThreshold: 100 }), 'highThreshold');
  });

  it('throws when lowThreshold is greater than highThreshold', () => {
    expectInvalidArgument(() => validateHeartRateAlarm({ ...valid, highThreshold: 50, lowThreshold: 120 }), 'highThreshold');
  });

  it('passes at boundary values 1 and 300', () => {
    expect(() => validateHeartRateAlarm({ enabled: true, highThreshold: 300, lowThreshold: 1 })).not.toThrow();
  });
});

describe('validateDeviceTime', () => {
  it('passes for undefined', () => {
    expect(() => validateDeviceTime(undefined)).not.toThrow();
  });

  it('passes for a valid Date', () => {
    expect(() => validateDeviceTime(new Date())).not.toThrow();
  });

  it('throws INVALID_ARGUMENT for an invalid Date', () => {
    expectInvalidArgument(() => validateDeviceTime(new Date('invalid')));
  });

  it('throws INVALID_ARGUMENT for a string', () => {
    expectInvalidArgument(() => validateDeviceTime('2024-01-01' as any));
  });

  it('throws INVALID_ARGUMENT for a number', () => {
    expectInvalidArgument(() => validateDeviceTime(1234567890 as any));
  });
});

describe('validateScreenLightSettings', () => {
  const valid = {
    nightStartHour: 22,
    nightStartMinute: 0,
    nightEndHour: 7,
    nightEndMinute: 0,
    nightLevel: 2,
    dayLevel: 4,
    autoAdjust: false,
    maxLevel: 5,
  };

  it('passes for a typical schedule', () => {
    expect(() => validateScreenLightSettings(valid)).not.toThrow();
  });

  it('throws when maxLevel out of range', () => {
    expectInvalidArgument(() => validateScreenLightSettings({ ...valid, maxLevel: 0 }), 'maxLevel');
  });
});

describe('validateScreenLightDurationSeconds', () => {
  it('passes for in-range seconds', () => {
    expect(() => validateScreenLightDurationSeconds(10)).not.toThrow();
  });

  it('throws for zero', () => {
    expectInvalidArgument(() => validateScreenLightDurationSeconds(0), 'seconds');
  });
});

describe('validateSedentaryReminderSettings', () => {
  const valid = {
    startHour: 9,
    startMinute: 0,
    endHour: 18,
    endMinute: 0,
    thresholdMinutes: 60,
    enabled: true,
  };

  it('passes for typical window', () => {
    expect(() => validateSedentaryReminderSettings(valid)).not.toThrow();
  });

  it('throws when threshold below vendor minimum', () => {
    expectInvalidArgument(
      () => validateSedentaryReminderSettings({ ...valid, thresholdMinutes: 20 }),
      'thresholdMinutes',
    );
  });
});

describe('validateReadWatchFaceStyleOptions', () => {
  it('allows undefined', () => {
    expect(() => validateReadWatchFaceStyleOptions(undefined)).not.toThrow();
  });

  it('allows valid dialType', () => {
    expect(() => validateReadWatchFaceStyleOptions({ dialType: 'market' })).not.toThrow();
  });

  it('rejects invalid dialType', () => {
    expectInvalidArgument(() => validateReadWatchFaceStyleOptions({ dialType: 'x' as any }), 'dialType');
  });
});

describe('validateWatchFaceStyleSettings', () => {
  it('requires screenIndex in range', () => {
    expect(() => validateWatchFaceStyleSettings({ screenIndex: 0 })).not.toThrow();
    expectInvalidArgument(() => validateWatchFaceStyleSettings({ screenIndex: -1 }), 'screenIndex');
    expectInvalidArgument(
      () => validateWatchFaceStyleSettings({ screenIndex: 66_000 }),
      'screenIndex',
    );
  });

  it('validates optional dialType', () => {
    expectInvalidArgument(
      () => validateWatchFaceStyleSettings({ screenIndex: 0, dialType: 'oops' as any }),
      'dialType',
    );
  });
});

describe('validateFirmwareDfuFilePath', () => {
  it('passes for non-empty path', () => {
    expect(() => validateFirmwareDfuFilePath('/tmp/f.bin')).not.toThrow();
  });

  it('throws for empty string', () => {
    expectInvalidArgument(() => validateFirmwareDfuFilePath(''), 'filePath');
  });
});

describe('validateWristFlipWakeSettings', () => {
  const valid = {
    enabled: true,
    startHour: 22,
    startMinute: 0,
    endHour: 8,
    endMinute: 0,
    sensitivityLevel: 5,
  };

  it('passes for typical night window', () => {
    expect(() => validateWristFlipWakeSettings(valid)).not.toThrow();
  });

  it('throws when sensitivity out of range', () => {
    expectInvalidArgument(
      () => validateWristFlipWakeSettings({ ...valid, sensitivityLevel: 11 }),
      'sensitivityLevel',
    );
  });
});

describe('validateWomenHealthSettings', () => {
  it('passes for menstrual with required fields', () => {
    expect(() =>
      validateWomenHealthSettings({
        status: 'menstrual',
        lastMenstrualDate: '2026-04-01',
        menstrualLengthDays: 5,
        menstrualCycleDays: 28,
      }),
    ).not.toThrow();
  });

  it('requires expectedDeliveryDate for pregnancy', () => {
    expectInvalidArgument(
      () =>
        validateWomenHealthSettings({
          status: 'pregnancy',
          lastMenstrualDate: '2026-04-01',
        }),
      'expectedDeliveryDate',
    );
  });

  it('throws for bad date format', () => {
    expectInvalidArgument(
      () =>
        validateWomenHealthSettings({
          status: 'menstrual',
          lastMenstrualDate: '04-01-2026',
          menstrualLengthDays: 5,
          menstrualCycleDays: 28,
        }),
      'lastMenstrualDate',
    );
  });
});

describe('validateWeatherSettings', () => {
  const { validateWeatherSettings } = require('../../validators/index');

  it('passes for valid Celsius settings', () => {
    expect(() => validateWeatherSettings({ isOpen: true, unit: 'C', crc: 0 })).not.toThrow();
  });

  it('passes for valid Fahrenheit settings', () => {
    expect(() => validateWeatherSettings({ isOpen: false, unit: 'F', crc: 12345 })).not.toThrow();
  });

  it('throws for invalid unit', () => {
    expectInvalidArgument(() => validateWeatherSettings({ isOpen: true, unit: 'K' as any, crc: 0 }), 'unit');
  });

  it('throws for negative crc', () => {
    expectInvalidArgument(() => validateWeatherSettings({ isOpen: true, unit: 'C', crc: -1 }), 'crc');
  });

  it('throws for non-integer crc', () => {
    expectInvalidArgument(() => validateWeatherSettings({ isOpen: true, unit: 'C', crc: 1.5 }), 'crc');
  });
});

describe('validateWeatherData', () => {
  const { validateWeatherData } = require('../../validators/index');

  const validHourly = [{
    time: '2026-05-02 12:00',
    tempC: 20,
    tempF: 68,
    weatherState: 5,
    uvIndex: 3,
    windLevel: '3-5',
    visibilityM: 10000,
  }];

  const validDaily = [{
    date: '2026-05-02',
    maxTempC: 25,
    minTempC: 15,
    maxTempF: 77,
    minTempF: 59,
    weatherStateDay: 0,
    weatherStateNight: 0,
  }];

  const validData = {
    cityName: 'Kathmandu',
    crc: 42,
    hourly: validHourly,
    daily: validDaily,
  };

  it('passes for a valid weather payload', () => {
    expect(() => validateWeatherData(validData)).not.toThrow();
  });

  it('throws when cityName is empty', () => {
    expectInvalidArgument(() => validateWeatherData({ ...validData, cityName: '' }), 'cityName');
  });

  it('throws when cityName is missing', () => {
    expectInvalidArgument(() => validateWeatherData({ ...validData, cityName: '   ' }), 'cityName');
  });

  it('throws for negative crc', () => {
    expectInvalidArgument(() => validateWeatherData({ ...validData, crc: -1 }), 'crc');
  });

  it('throws when hourly is empty array', () => {
    expectInvalidArgument(() => validateWeatherData({ ...validData, hourly: [] }), 'hourly');
  });

  it('throws when daily is empty array', () => {
    expectInvalidArgument(() => validateWeatherData({ ...validData, daily: [] }), 'daily');
  });

  it('throws for invalid hourly time format', () => {
    const bad = [{ ...validHourly[0], time: '2026-05-02' }];
    expectInvalidArgument(() => validateWeatherData({ ...validData, hourly: bad }), 'hourly[0].time');
  });

  it('throws for weatherState out of range in hourly', () => {
    const bad = [{ ...validHourly[0], weatherState: 200 }];
    expectInvalidArgument(() => validateWeatherData({ ...validData, hourly: bad }), 'hourly[0].weatherState');
  });

  it('throws for invalid daily date format', () => {
    const bad = [{ ...validDaily[0], date: '02-05-2026' }];
    expectInvalidArgument(() => validateWeatherData({ ...validData, daily: bad }), 'daily[0].date');
  });

  it('throws for weatherStateDay out of range in daily', () => {
    const bad = [{ ...validDaily[0], weatherStateDay: 999 }];
    expectInvalidArgument(() => validateWeatherData({ ...validData, daily: bad }), 'daily[0].weatherStateDay');
  });

  it('throws for negative visibilityM', () => {
    const bad = [{ ...validHourly[0], visibilityM: -1 }];
    expectInvalidArgument(() => validateWeatherData({ ...validData, hourly: bad }), 'hourly[0].visibilityM');
  });
});

describe('validateNewContact', () => {
  const { validateNewContact } = require('../../validators/index');

  it('passes for a valid contact', () => {
    expect(() => validateNewContact({ name: 'Alice', phoneNumber: '+1234567890' })).not.toThrow();
  });

  it('passes with isSOS true', () => {
    expect(() => validateNewContact({ name: 'Bob', phoneNumber: '555-1234', isSOS: true })).not.toThrow();
  });

  it('throws for empty name', () => {
    expectInvalidArgument(() => validateNewContact({ name: '', phoneNumber: '123' }), 'name');
  });

  it('throws for whitespace-only name', () => {
    expectInvalidArgument(() => validateNewContact({ name: '   ', phoneNumber: '123' }), 'name');
  });

  it('throws when name exceeds 20 bytes', () => {
    expectInvalidArgument(() => validateNewContact({ name: 'A'.repeat(21), phoneNumber: '123' }), 'name');
  });

  it('throws for empty phoneNumber', () => {
    expectInvalidArgument(() => validateNewContact({ name: 'Alice', phoneNumber: '' }), 'phoneNumber');
  });

  it('throws when phoneNumber exceeds 20 characters', () => {
    expectInvalidArgument(() => validateNewContact({ name: 'Alice', phoneNumber: '1'.repeat(21) }), 'phoneNumber');
  });
});

describe('validateContactId', () => {
  const { validateContactId } = require('../../validators/index');

  it('passes for zero', () => {
    expect(() => validateContactId(0)).not.toThrow();
  });

  it('passes for a positive integer', () => {
    expect(() => validateContactId(5)).not.toThrow();
  });

  it('throws for negative integer', () => {
    expectInvalidArgument(() => validateContactId(-1), 'contactId');
  });

  it('throws for non-integer', () => {
    expectInvalidArgument(() => validateContactId(1.5), 'contactId');
  });
});

describe('validateSosCallTimes', () => {
  const { validateSosCallTimes } = require('../../validators/index');

  it('passes for 1', () => {
    expect(() => validateSosCallTimes(1)).not.toThrow();
  });

  it('passes for 9', () => {
    expect(() => validateSosCallTimes(9)).not.toThrow();
  });

  it('throws for zero', () => {
    expectInvalidArgument(() => validateSosCallTimes(0), 'times');
  });

  it('throws for negative', () => {
    expectInvalidArgument(() => validateSosCallTimes(-1), 'times');
  });

  it('throws for non-integer', () => {
    expectInvalidArgument(() => validateSosCallTimes(2.5), 'times');
  });
});
