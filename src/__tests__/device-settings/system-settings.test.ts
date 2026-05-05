jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { LanguageCapability } from '@/capabilities/language/index';
import { DeviceTimeCapability } from '@/capabilities/device-time/index';
import { GpsTimezoneCapability } from '@/capabilities/gps-timezone/index';
import { BtStatusCapability } from '@/capabilities/bt-status/index';
import { WeatherCapability } from '@/capabilities/weather/index';
import { DfuCapability } from '@/capabilities/dfu/index';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

describe('SystemSettings (split capabilities)', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let language: LanguageCapability;
  let deviceTime: DeviceTimeCapability;
  let gpsTimezone: GpsTimezoneCapability;
  let btStatus: BtStatusCapability;
  let weather: WeatherCapability;
  let dfu: DfuCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    const ctx = runtime.createCapabilityContext();
    language = new LanguageCapability(ctx);
    deviceTime = new DeviceTimeCapability(ctx);
    gpsTimezone = new GpsTimezoneCapability(ctx);
    btStatus = new BtStatusCapability(ctx);
    weather = new WeatherCapability(ctx);
    dfu = new DfuCapability(ctx);
  });

  // ── setLanguage ───────────────────────────────────────────────────────────

  it('setLanguage delegates to native (happy path)', async () => {
    const result = await language.setLanguage('en');

    expect(native.setLanguage).toHaveBeenCalledWith('en');
    expect(result).toBe(true);
  });

  // ── setDeviceTime ─────────────────────────────────────────────────────────

  it('setDeviceTime(date) calls native with decomposed date object', async () => {
    const date = new Date('2024-01-15T10:30:45');

    await deviceTime.setDeviceTime(date);

    expect(native.setDeviceTime).toHaveBeenCalledWith({
      year: 2024,
      month: 1,
      day: 15,
      hour: date.getHours(),
      minute: 30,
      second: 45,
    });
  });

  it('setDeviceTime() (no args) calls native with undefined', async () => {
    await deviceTime.setDeviceTime();

    expect(native.setDeviceTime).toHaveBeenCalledWith(undefined);
  });

  // ── setDeviceGPSAndTimezone ───────────────────────────────────────────────

  it('setDeviceGPSAndTimezone delegates to native (happy path)', async () => {
    const data = {
      latitude: 27.7172,
      longitude: 85.3240,
      altitude: 1300,
      timezoneOffsetMinutes: 345,
    };

    await gpsTimezone.setDeviceGPSAndTimezone(data);

    expect(native.setDeviceGPSAndTimezone).toHaveBeenCalledWith(data);
  });

  // ── readDeviceBTStatus ────────────────────────────────────────────────────

  it('readDeviceBTStatus delegates to native (happy path)', async () => {
    const raw = { btState: 1, classicBtEnabled: true };
    native.readDeviceBTStatus.mockResolvedValueOnce(raw);

    await btStatus.readDeviceBTStatus();

    expect(native.readDeviceBTStatus).toHaveBeenCalledTimes(1);
  });

  // ── setDeviceBTSwitch ─────────────────────────────────────────────────────

  it('setDeviceBTSwitch(true) delegates to native', async () => {
    await btStatus.setDeviceBTSwitch(true);

    expect(native.setDeviceBTSwitch).toHaveBeenCalledWith(true);
  });

  // ── readWeatherSettings ───────────────────────────────────────────────────

  it('readWeatherSettings delegates to native (happy path)', async () => {
    const raw = { unit: 'C', crc: 42 };
    native.readWeatherSettings.mockResolvedValueOnce(raw);

    await weather.readWeatherSettings();

    expect(native.readWeatherSettings).toHaveBeenCalledTimes(1);
  });

  // ── setWeatherSettings ────────────────────────────────────────────────────

  it('setWeatherSettings delegates to native (happy path)', async () => {
    const settings = { unit: 'C' as const, crc: 0 };

    await weather.setWeatherSettings(settings);

    expect(native.setWeatherSettings).toHaveBeenCalledWith(settings);
  });

  // ── pushWeatherData ───────────────────────────────────────────────────────

  it('pushWeatherData delegates to native (happy path)', async () => {
    const data = {
      cityName: 'Kathmandu',
      crc: 1,
      hourly: [
        {
          time: '2024-01-15 10:00',
          weatherState: 1,
          uvIndex: 3,
          visibilityM: 10000,
        },
      ],
      daily: [
        {
          date: '2024-01-15',
          weatherStateDay: 1,
          weatherStateNight: 2,
        },
      ],
    };

    await weather.pushWeatherData(data);

    expect(native.pushWeatherData).toHaveBeenCalledWith(data);
  });

  // ── startLocalFirmwareDfu ─────────────────────────────────────────────────

  it('startLocalFirmwareDfu delegates to native (happy path)', async () => {
    await dfu.startLocalFirmwareDfu('/path/to/firmware.bin');

    expect(native.startLocalFirmwareDfu).toHaveBeenCalledWith('/path/to/firmware.bin');
  });

  it('startLocalFirmwareDfu("") throws INVALID_ARGUMENT', async () => {
    await expect(dfu.startLocalFirmwareDfu('')).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.startLocalFirmwareDfu).not.toHaveBeenCalled();
  });
});
