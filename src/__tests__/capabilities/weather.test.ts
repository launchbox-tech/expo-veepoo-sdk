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

  it('pushWeatherData converts snake_case to camelCase for native', async () => {
    await weather.pushWeatherData({
      city_name: 'Kathmandu',
      crc: 1,
      hourly: [
        { time: '2024-01-15 10:00', weather_state: 1, uv_index: 3, visibility_m: 10000 },
      ],
      daily: [
        { date: '2024-01-15', weather_state_day: 1, weather_state_night: 2 },
      ],
    });

    expect(native.pushWeatherData).toHaveBeenCalledWith({
      cityName: 'Kathmandu',
      crc: 1,
      hourly: [{ time: '2024-01-15 10:00', weatherState: 1, uvIndex: 3, visibilityM: 10000 }],
      daily: [{ date: '2024-01-15', weatherStateDay: 1, weatherStateNight: 2 }],
    });
  });
});
