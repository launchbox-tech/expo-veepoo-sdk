jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { VeepooSDKRuntime } from '../../sdk/veepoo-sdk-runtime';
import { HealthConfig } from '../../sdk/device-settings/HealthConfig';
import { makeMockNative, type MockNative } from '../helpers/mock-native';
import type { AutoMeasureSetting, PersonalInfo, SedentaryReminderSettings, WomenHealthSettings } from '../../types/index';

describe('HealthConfig', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let healthConfig: HealthConfig;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    healthConfig = new HealthConfig(runtime);
  });

  // ── syncPersonalInfo ───────────────────────────────────────────────

  it('syncPersonalInfo delegates to native', async () => {
    const info: PersonalInfo = {
      sex: 1,
      height: 175,
      weight: 70,
      age: 30,
      stepAim: 8000,
      sleepAim: 480,
    };
    const result = await healthConfig.syncPersonalInfo(info);
    expect(native.syncPersonalInfo).toHaveBeenCalledWith(info);
    expect(result).toBe(true);
  });

  // ── readAutoMeasureSetting ─────────────────────────────────────────

  it('readAutoMeasureSetting delegates to native and returns normalized array', async () => {
    const raw: AutoMeasureSetting[] = [
      { type: 'heartRate', enabled: true, measureInterval: 30, currentStartMinute: 0, currentEndMinute: 1439 },
    ];
    native.readAutoMeasureSetting.mockResolvedValueOnce(raw);
    const result = await healthConfig.readAutoMeasureSetting();
    expect(native.readAutoMeasureSetting).toHaveBeenCalled();
    expect(Array.isArray(result)).toBe(true);
  });

  // ── modifyAutoMeasureSetting ───────────────────────────────────────

  it('modifyAutoMeasureSetting delegates to native (happy path)', async () => {
    const setting: Partial<AutoMeasureSetting> = { measureInterval: 30 };
    native.modifyAutoMeasureSetting.mockResolvedValueOnce([]);
    await healthConfig.modifyAutoMeasureSetting(setting);
    expect(native.modifyAutoMeasureSetting).toHaveBeenCalledWith(setting);
  });

  it('modifyAutoMeasureSetting throws INVALID_ARGUMENT for out-of-range interval', async () => {
    // measureInterval must be in range 1–120; 0 is invalid
    await expect(
      healthConfig.modifyAutoMeasureSetting({ measureInterval: 0 }),
    ).rejects.toMatchObject({ code: 'INVALID_ARGUMENT' });
    expect(native.modifyAutoMeasureSetting).not.toHaveBeenCalled();
  });

  // ── readSedentaryReminder ─────────────────────────────────────────

  it('readSedentaryReminder delegates to native', async () => {
    native.readSedentaryReminder.mockResolvedValueOnce({
      startHour: 8,
      startMinute: 0,
      endHour: 20,
      endMinute: 0,
      thresholdMinutes: 60,
      enabled: 1,
    });
    const result = await healthConfig.readSedentaryReminder();
    expect(native.readSedentaryReminder).toHaveBeenCalled();
    expect(result.thresholdMinutes).toBe(60);
  });

  // ── setSedentaryReminder ──────────────────────────────────────────

  it('setSedentaryReminder delegates to native', async () => {
    const settings: SedentaryReminderSettings = {
      enabled: true,
      startHour: 8,
      startMinute: 0,
      endHour: 20,
      endMinute: 0,
      thresholdMinutes: 60,
    };
    await healthConfig.setSedentaryReminder(settings);
    expect(native.setSedentaryReminder).toHaveBeenCalledWith(settings);
  });

  it('setSedentaryReminder throws INVALID_ARGUMENT for invalid settings', async () => {
    // thresholdMinutes must be 30–240; 10 is invalid
    const invalid: SedentaryReminderSettings = {
      enabled: true,
      startHour: 8,
      startMinute: 0,
      endHour: 20,
      endMinute: 0,
      thresholdMinutes: 10,
    };
    await expect(
      healthConfig.setSedentaryReminder(invalid),
    ).rejects.toMatchObject({ code: 'INVALID_ARGUMENT' });
    expect(native.setSedentaryReminder).not.toHaveBeenCalled();
  });

  // ── readWomenHealthSettings ──────────────────────────────────────

  it('readWomenHealthSettings delegates to native', async () => {
    native.readWomenHealthSettings.mockResolvedValueOnce({
      status: 'none',
    });
    const result = await healthConfig.readWomenHealthSettings();
    expect(native.readWomenHealthSettings).toHaveBeenCalled();
    expect(result.status).toBe('none');
  });

  // ── setWomenHealthSettings ───────────────────────────────────────

  it('setWomenHealthSettings delegates to native', async () => {
    const settings: WomenHealthSettings = { status: 'none' };
    await healthConfig.setWomenHealthSettings(settings);
    expect(native.setWomenHealthSettings).toHaveBeenCalledWith(settings);
  });
});
