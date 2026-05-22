jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { WeatherCapability } from '@/capabilities/weather/index';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

describe('WeatherCapability', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let weather: WeatherCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    weather = new WeatherCapability(runtime.createCapabilityContext());
  });

  it('readWeatherSettings delegates to native', async () => {
    native.readWeatherSettings.mockResolvedValueOnce({ unit: 'C', crc: 42 });

    await weather.readWeatherSettings();

    expect(native.readWeatherSettings).toHaveBeenCalledTimes(1);
  });

  it('setWeatherSettings delegates to native', async () => {
    await weather.setWeatherSettings({ unit: 'C', crc: 0 });

    expect(native.setWeatherSettings).toHaveBeenCalledWith({ unit: 'C', crc: 0 });
  });

  const validHourly = [{
    time: '2024-01-15 10:00',
    weather_state: 1,
    uv_index: 3,
    visibility_m: 10000,
  }];
  const validDaily = [{
    date: '2024-01-15',
    weather_state_day: 1,
    weather_state_night: 2,
  }];
  const validData = {
    city_name: 'Kathmandu',
    crc: 1,
    hourly: validHourly,
    daily: validDaily,
  };

  it('pushWeatherData converts snake_case to camelCase for native', async () => {
    await weather.pushWeatherData(validData);

    expect(native.pushWeatherData).toHaveBeenCalledWith({
      cityName: 'Kathmandu',
      crc: 1,
      hourly: [{ time: '2024-01-15 10:00', weatherState: 1, uvIndex: 3, visibilityM: 10000 }],
      daily: [{ date: '2024-01-15', weatherStateDay: 1, weatherStateNight: 2 }],
    });
  });

  it.each([
    { name: 'unit other than C/F', settings: { unit: 'K' as never, crc: 0 } },
    { name: 'negative crc', settings: { unit: 'C' as const, crc: -1 } },
    { name: 'non-integer crc', settings: { unit: 'C' as const, crc: 1.5 } },
  ])('setWeatherSettings rejects $name → INVALID_ARGUMENT, no native call', async ({ settings }) => {
    await expect(weather.setWeatherSettings(settings)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.setWeatherSettings).not.toHaveBeenCalled();
  });

  it.each([
    { name: 'empty city_name', data: { ...validData, city_name: '' } },
    { name: 'whitespace-only city_name', data: { ...validData, city_name: '   ' } },
    { name: 'negative crc', data: { ...validData, crc: -1 } },
    { name: 'empty hourly array', data: { ...validData, hourly: [] } },
    { name: 'empty daily array', data: { ...validData, daily: [] } },
    {
      name: 'invalid hourly time format',
      data: { ...validData, hourly: [{ ...validHourly[0], time: '2024-01-15' }] },
    },
    {
      name: 'weather_state out of range in hourly',
      data: { ...validData, hourly: [{ ...validHourly[0], weather_state: 200 }] },
    },
    {
      name: 'invalid daily date format',
      data: { ...validData, daily: [{ ...validDaily[0], date: '15-01-2024' }] },
    },
    {
      name: 'weather_state_day out of range in daily',
      data: { ...validData, daily: [{ ...validDaily[0], weather_state_day: 999 }] },
    },
    {
      name: 'negative visibility_m in hourly',
      data: { ...validData, hourly: [{ ...validHourly[0], visibility_m: -1 }] },
    },
  ])('pushWeatherData rejects $name → INVALID_ARGUMENT, no native call', async ({ data }) => {
    await expect(weather.pushWeatherData(data)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.pushWeatherData).not.toHaveBeenCalled();
  });
});
