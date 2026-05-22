import { validateWeatherData, validateWeatherSettings } from '@/capabilities/weather/validators';
import { expectInvalidArgument } from '@/__tests__/helpers/expect-invalid-argument';

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
