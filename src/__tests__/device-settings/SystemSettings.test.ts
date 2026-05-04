jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { SystemSettings } from '../../sdk/device-settings/SystemSettings';
import { VeepooSDKRuntime } from '../../sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '../helpers/mock-native';

describe('SystemSettings', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let systemSettings: SystemSettings;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    systemSettings = new SystemSettings(runtime);
  });

  // ── setLanguage ───────────────────────────────────────────────────────────

  it('setLanguage delegates to native (happy path)', async () => {
    const result = await systemSettings.setLanguage('en');

    expect(native.setLanguage).toHaveBeenCalledWith('en');
    expect(result).toBe(true);
  });

  // ── setDeviceTime ─────────────────────────────────────────────────────────

  it('setDeviceTime(date) calls native with decomposed date object', async () => {
    const date = new Date('2024-01-15T10:30:45');

    await systemSettings.setDeviceTime(date);

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
    await systemSettings.setDeviceTime();

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

    await systemSettings.setDeviceGPSAndTimezone(data);

    expect(native.setDeviceGPSAndTimezone).toHaveBeenCalledWith(data);
  });

  // ── readDeviceBTStatus ────────────────────────────────────────────────────

  it('readDeviceBTStatus delegates to native (happy path)', async () => {
    const raw = { btState: 1, classicBtEnabled: true };
    native.readDeviceBTStatus.mockResolvedValueOnce(raw);

    await systemSettings.readDeviceBTStatus();

    expect(native.readDeviceBTStatus).toHaveBeenCalledTimes(1);
  });

  // ── setDeviceBTSwitch ─────────────────────────────────────────────────────

  it('setDeviceBTSwitch(true) delegates to native', async () => {
    await systemSettings.setDeviceBTSwitch(true);

    expect(native.setDeviceBTSwitch).toHaveBeenCalledWith(true);
  });

  // ── readWeatherSettings ───────────────────────────────────────────────────

  it('readWeatherSettings delegates to native (happy path)', async () => {
    const raw = { unit: 'C', crc: 42 };
    native.readWeatherSettings.mockResolvedValueOnce(raw);

    await systemSettings.readWeatherSettings();

    expect(native.readWeatherSettings).toHaveBeenCalledTimes(1);
  });

  // ── setWeatherSettings ────────────────────────────────────────────────────

  it('setWeatherSettings delegates to native (happy path)', async () => {
    const settings = { unit: 'C' as const, crc: 0 };

    await systemSettings.setWeatherSettings(settings);

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

    await systemSettings.pushWeatherData(data);

    expect(native.pushWeatherData).toHaveBeenCalledWith(data);
  });

  // ── startLocalFirmwareDfu ─────────────────────────────────────────────────

  it('startLocalFirmwareDfu delegates to native (happy path)', async () => {
    await systemSettings.startLocalFirmwareDfu('/path/to/firmware.bin');

    expect(native.startLocalFirmwareDfu).toHaveBeenCalledWith('/path/to/firmware.bin');
  });

  it('startLocalFirmwareDfu("") throws INVALID_ARGUMENT', async () => {
    await expect(systemSettings.startLocalFirmwareDfu('')).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.startLocalFirmwareDfu).not.toHaveBeenCalled();
  });
});
