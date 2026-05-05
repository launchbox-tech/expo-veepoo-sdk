import { validateDeviceId, validateConnectOptions, validatePersonalInfo } from '@/capabilities/session/validators';
import { validateAutoMeasureSetting } from '@/capabilities/auto-measure/validators';
import { validateAlarm, validateDeleteAlarm, validateHeartRateAlarm } from '@/capabilities/alarms/validators';
import { validateSocialMsgData } from '@/capabilities/social-msg/validators';
import { validateScreenLightDurationSeconds, validateScreenLightSettings } from '@/capabilities/screen-light/validators';
import { validateSedentaryReminderSettings } from '@/capabilities/sedentary-reminder/validators';
import { validateWristFlipWakeSettings } from '@/capabilities/wrist-flip/validators';
import { validateWomenHealthSettings } from '@/capabilities/women-health/validators';
import { validateFirmwareDfuFilePath } from '@/capabilities/dfu/validators';
import { validateReadWatchFaceStyleOptions, validateWatchFaceStyleSettings } from '@/capabilities/watch-face/validators';
import { validateDeviceTime } from '@/capabilities/device-time/validators';
import { validateWeatherSettings, validateWeatherData } from '@/capabilities/weather/validators';
import { validateNewContact, validateContactId } from '@/capabilities/contacts/validators';
import { validateSosCallTimes } from '@/capabilities/sos/validators';
import { validateMusicData } from '@/capabilities/music/validators';
import { validateGPSAndTimezoneData } from '@/capabilities/gps-timezone/validators';

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
      () => validateConnectOptions({ time_setting: { year: 2024, month: 1, day: 1, hour: 24, minute: 0, second: 0 } }),
      'timeSetting.hour',
    );
  });

  it('throws when timeSetting.minute is out of range', () => {
    expectInvalidArgument(
      () => validateConnectOptions({ time_setting: { year: 2024, month: 1, day: 1, hour: 0, minute: 60, second: 0 } }),
      'timeSetting.minute',
    );
  });

  it('throws when timeSetting.month is out of range', () => {
    expectInvalidArgument(
      () => validateConnectOptions({ time_setting: { year: 2024, month: 13, day: 1, hour: 0, minute: 0, second: 0 } }),
      'timeSetting.month',
    );
  });

  it('passes for valid timeSetting', () => {
    expect(() =>
      validateConnectOptions({ time_setting: { year: 2024, month: 6, day: 15, hour: 10, minute: 30, second: 0 } })
    ).not.toThrow();
  });
});

describe('validatePersonalInfo', () => {
  const valid = { sex: 1 as 0 | 1, height: 170, weight: 70, age: 30, step_aim: 8000, sleep_aim: 480 };

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

  it('throws for step_aim below range', () => {
    expectInvalidArgument(() => validatePersonalInfo({ ...valid, step_aim: 0 }), 'stepAim');
  });

  it('throws for step_aim above range', () => {
    expectInvalidArgument(() => validatePersonalInfo({ ...valid, step_aim: 100_001 }), 'stepAim');
  });

  it('passes for sleep_aim = 0', () => {
    expect(() => validatePersonalInfo({ ...valid, sleep_aim: 0 })).not.toThrow();
  });

  it('throws for sleep_aim above 1440', () => {
    expectInvalidArgument(() => validatePersonalInfo({ ...valid, sleep_aim: 1_441 }), 'sleepAim');
  });
});

describe('validateAutoMeasureSetting', () => {
  it('passes for empty partial', () => {
    expect(() => validateAutoMeasureSetting({})).not.toThrow();
  });

  it('throws for measure_interval below 1', () => {
    expectInvalidArgument(() => validateAutoMeasureSetting({ measure_interval: 0 }), 'measureInterval');
  });

  it('throws for measure_interval above 120', () => {
    expectInvalidArgument(() => validateAutoMeasureSetting({ measure_interval: 121 }), 'measureInterval');
  });

  it('passes for valid measure_interval', () => {
    expect(() => validateAutoMeasureSetting({ measure_interval: 30 })).not.toThrow();
  });

  it('throws for current_start_minute above 1439', () => {
    expectInvalidArgument(() => validateAutoMeasureSetting({ current_start_minute: 1440 }), 'currentStartMinute');
  });

  it('throws for current_end_minute above 1439', () => {
    expectInvalidArgument(() => validateAutoMeasureSetting({ current_end_minute: 1440 }), 'currentEndMinute');
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
  const valid = { enabled: true, high_threshold: 120, low_threshold: 50 };

  it('passes for a valid alarm', () => {
    expect(() => validateHeartRateAlarm(valid)).not.toThrow();
  });

  it('passes when enabled is false', () => {
    expect(() => validateHeartRateAlarm({ ...valid, enabled: false })).not.toThrow();
  });

  it('throws for highThreshold of 0', () => {
    expectInvalidArgument(() => validateHeartRateAlarm({ ...valid, high_threshold: 0 }), 'highThreshold');
  });

  it('throws for highThreshold of 301', () => {
    expectInvalidArgument(() => validateHeartRateAlarm({ ...valid, high_threshold: 301 }), 'highThreshold');
  });

  it('throws for lowThreshold of 0', () => {
    expectInvalidArgument(() => validateHeartRateAlarm({ ...valid, low_threshold: 0 }), 'lowThreshold');
  });

  it('throws for lowThreshold of 301', () => {
    expectInvalidArgument(() => validateHeartRateAlarm({ ...valid, low_threshold: 301 }), 'lowThreshold');
  });

  it('throws when lowThreshold equals highThreshold', () => {
    expectInvalidArgument(() => validateHeartRateAlarm({ ...valid, high_threshold: 100, low_threshold: 100 }), 'highThreshold');
  });

  it('throws when lowThreshold is greater than highThreshold', () => {
    expectInvalidArgument(() => validateHeartRateAlarm({ ...valid, high_threshold: 50, low_threshold: 120 }), 'highThreshold');
  });

  it('passes at boundary values 1 and 300', () => {
    expect(() => validateHeartRateAlarm({ enabled: true, high_threshold: 300, low_threshold: 1 })).not.toThrow();
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
    night_start_hour: 22,
    night_start_minute: 0,
    night_end_hour: 7,
    night_end_minute: 0,
    night_level: 2,
    day_level: 4,
    auto_adjust: false,
    max_level: 5,
  };

  it('passes for a typical schedule', () => {
    expect(() => validateScreenLightSettings(valid)).not.toThrow();
  });

  it('throws when maxLevel out of range', () => {
    expectInvalidArgument(() => validateScreenLightSettings({ ...valid, max_level: 0 }), 'maxLevel');
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
    start_hour: 9,
    start_minute: 0,
    end_hour: 18,
    end_minute: 0,
    threshold_minutes: 60,
    enabled: true,
  };

  it('passes for typical window', () => {
    expect(() => validateSedentaryReminderSettings(valid)).not.toThrow();
  });

  it('throws when threshold below vendor minimum', () => {
    expectInvalidArgument(
      () => validateSedentaryReminderSettings({ ...valid, threshold_minutes: 20 }),
      'thresholdMinutes',
    );
  });
});

describe('validateReadWatchFaceStyleOptions', () => {
  it('allows undefined', () => {
    expect(() => validateReadWatchFaceStyleOptions(undefined)).not.toThrow();
  });

  it('allows valid dialType', () => {
    expect(() => validateReadWatchFaceStyleOptions({ dial_type: 'market' })).not.toThrow();
  });

  it('rejects invalid dialType', () => {
    expectInvalidArgument(() => validateReadWatchFaceStyleOptions({ dial_type: 'x' as any }), 'dialType');
  });
});

describe('validateWatchFaceStyleSettings', () => {
  it('requires screenIndex in range', () => {
    expect(() => validateWatchFaceStyleSettings({ screen_index: 0 })).not.toThrow();
    expectInvalidArgument(() => validateWatchFaceStyleSettings({ screen_index: -1 }), 'screenIndex');
    expectInvalidArgument(
      () => validateWatchFaceStyleSettings({ screen_index: 66_000 }),
      'screenIndex',
    );
  });

  it('validates optional dialType', () => {
    expectInvalidArgument(
      () => validateWatchFaceStyleSettings({ screen_index: 0, dial_type: 'oops' as any }),
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
    start_hour: 22,
    start_minute: 0,
    end_hour: 8,
    end_minute: 0,
    sensitivity_level: 5,
  };

  it('passes for typical night window', () => {
    expect(() => validateWristFlipWakeSettings(valid)).not.toThrow();
  });

  it('throws when sensitivity out of range', () => {
    expectInvalidArgument(
      () => validateWristFlipWakeSettings({ ...valid, sensitivity_level: 11 }),
      'sensitivityLevel',
    );
  });
});

describe('validateWomenHealthSettings', () => {
  it('passes for menstrual with required fields', () => {
    expect(() =>
      validateWomenHealthSettings({
        status: 'menstrual',
        last_menstrual_date: '2026-04-01',
        menstrual_length_days: 5,
        menstrual_cycle_days: 28,
      }),
    ).not.toThrow();
  });

  it('requires expectedDeliveryDate for pregnancy', () => {
    expectInvalidArgument(
      () =>
        validateWomenHealthSettings({
          status: 'pregnancy',
          last_menstrual_date: '2026-04-01',
        }),
      'expectedDeliveryDate',
    );
  });

  it('throws for bad date format', () => {
    expectInvalidArgument(
      () =>
        validateWomenHealthSettings({
          status: 'menstrual',
          last_menstrual_date: '04-01-2026',
          menstrual_length_days: 5,
          menstrual_cycle_days: 28,
        }),
      'lastMenstrualDate',
    );
  });
});

describe('validateWeatherSettings', () => {

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

  const validHourly = [{
    time: '2026-05-02 12:00',
    temp_c: 20,
    temp_f: 68,
    weather_state: 5,
    uv_index: 3,
    wind_level: '3-5',
    visibility_m: 10000,
  }];

  const validDaily = [{
    date: '2026-05-02',
    max_temp_c: 25,
    min_temp_c: 15,
    max_temp_f: 77,
    min_temp_f: 59,
    weather_state_day: 0,
    weather_state_night: 0,
  }];

  const validData = {
    city_name: 'Kathmandu',
    crc: 42,
    hourly: validHourly,
    daily: validDaily,
  };

  it('passes for a valid weather payload', () => {
    expect(() => validateWeatherData(validData)).not.toThrow();
  });

  it('throws when cityName is empty', () => {
    expectInvalidArgument(() => validateWeatherData({ ...validData, city_name: '' }), 'cityName');
  });

  it('throws when cityName is missing', () => {
    expectInvalidArgument(() => validateWeatherData({ ...validData, city_name: '   ' }), 'cityName');
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
    const bad = [{ ...validHourly[0], weather_state: 200 }];
    expectInvalidArgument(() => validateWeatherData({ ...validData, hourly: bad }), 'hourly[0].weatherState');
  });

  it('throws for invalid daily date format', () => {
    const bad = [{ ...validDaily[0], date: '02-05-2026' }];
    expectInvalidArgument(() => validateWeatherData({ ...validData, daily: bad }), 'daily[0].date');
  });

  it('throws for weatherStateDay out of range in daily', () => {
    const bad = [{ ...validDaily[0], weather_state_day: 999 }];
    expectInvalidArgument(() => validateWeatherData({ ...validData, daily: bad }), 'daily[0].weatherStateDay');
  });

  it('throws for negative visibilityM', () => {
    const bad = [{ ...validHourly[0], visibility_m: -1 }];
    expectInvalidArgument(() => validateWeatherData({ ...validData, hourly: bad }), 'hourly[0].visibilityM');
  });
});

describe('validateNewContact', () => {

  it('passes for a valid contact', () => {
    expect(() => validateNewContact({ name: 'Alice', phone_number: '+1234567890' })).not.toThrow();
  });

  it('passes with isSOS true', () => {
    expect(() => validateNewContact({ name: 'Bob', phone_number: '555-1234', is_sos: true })).not.toThrow();
  });

  it('throws for empty name', () => {
    expectInvalidArgument(() => validateNewContact({ name: '', phone_number: '123' }), 'name');
  });

  it('throws for whitespace-only name', () => {
    expectInvalidArgument(() => validateNewContact({ name: '   ', phone_number: '123' }), 'name');
  });

  it('throws when name exceeds 20 bytes', () => {
    expectInvalidArgument(() => validateNewContact({ name: 'A'.repeat(21), phone_number: '123' }), 'name');
  });

  it('throws for empty phoneNumber', () => {
    expectInvalidArgument(() => validateNewContact({ name: 'Alice', phone_number: '' }), 'phoneNumber');
  });

  it('throws when phoneNumber exceeds 20 characters', () => {
    expectInvalidArgument(() => validateNewContact({ name: 'Alice', phone_number: '1'.repeat(21) }), 'phoneNumber');
  });
});

describe('validateContactId', () => {

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

describe('validateMusicData', () => {
  const valid = { name: 'Song', artist: 'Artist', isPlaying: true, volume: 50 };

  it('passes for a valid payload', () => {
    expect(() => validateMusicData(valid)).not.toThrow();
  });

  it('passes with optional appId and album', () => {
    expect(() => validateMusicData({ ...valid, appId: 'com.app', album: 'Album' })).not.toThrow();
  });

  it('passes for volume 1', () => {
    expect(() => validateMusicData({ ...valid, volume: 1 })).not.toThrow();
  });

  it('passes for volume 100', () => {
    expect(() => validateMusicData({ ...valid, volume: 100 })).not.toThrow();
  });

  it('throws for empty name', () => {
    expectInvalidArgument(() => validateMusicData({ ...valid, name: '' }), 'name');
  });

  it('throws for whitespace-only name', () => {
    expectInvalidArgument(() => validateMusicData({ ...valid, name: '   ' }), 'name');
  });

  it('throws for empty artist', () => {
    expectInvalidArgument(() => validateMusicData({ ...valid, artist: '' }), 'artist');
  });

  it('throws for volume 0', () => {
    expectInvalidArgument(() => validateMusicData({ ...valid, volume: 0 }), 'volume');
  });

  it('throws for volume 101', () => {
    expectInvalidArgument(() => validateMusicData({ ...valid, volume: 101 }), 'volume');
  });

  it('throws for non-integer volume', () => {
    expectInvalidArgument(() => validateMusicData({ ...valid, volume: 50.5 }), 'volume');
  });
});

describe('validateGPSAndTimezoneData', () => {
  const valid = { latitude: 39.904987, longitude: 116.405289, timezone_offset_minutes: 480 };

  it('accepts valid GPS data', () => {
    expect(() => validateGPSAndTimezoneData(valid)).not.toThrow();
  });

  it('accepts valid GPS data with altitude', () => {
    expect(() => validateGPSAndTimezoneData({ ...valid, altitude: 50 })).not.toThrow();
  });

  it('throws for latitude out of range (> 90)', () => {
    expectInvalidArgument(() => validateGPSAndTimezoneData({ ...valid, latitude: 91 }), 'latitude');
  });

  it('throws for latitude out of range (< -90)', () => {
    expectInvalidArgument(() => validateGPSAndTimezoneData({ ...valid, latitude: -91 }), 'latitude');
  });

  it('throws for longitude out of range (> 180)', () => {
    expectInvalidArgument(() => validateGPSAndTimezoneData({ ...valid, longitude: 181 }), 'longitude');
  });

  it('throws for longitude out of range (< -180)', () => {
    expectInvalidArgument(() => validateGPSAndTimezoneData({ ...valid, longitude: -181 }), 'longitude');
  });

  it('throws for NaN latitude', () => {
    expectInvalidArgument(() => validateGPSAndTimezoneData({ ...valid, latitude: NaN }), 'latitude');
  });

  it('throws for non-finite altitude', () => {
    expectInvalidArgument(() => validateGPSAndTimezoneData({ ...valid, altitude: Infinity }), 'altitude');
  });

  it('throws for non-multiple-of-15 timezone_offset_minutes', () => {
    expectInvalidArgument(() => validateGPSAndTimezoneData({ ...valid, timezone_offset_minutes: 481 }), 'timezoneOffsetMinutes');
  });

  it('throws for non-integer timezone_offset_minutes', () => {
    expectInvalidArgument(() => validateGPSAndTimezoneData({ ...valid, timezone_offset_minutes: 480.5 }), 'timezoneOffsetMinutes');
  });
});
