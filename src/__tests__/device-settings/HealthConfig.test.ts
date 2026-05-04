jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { VeepooSDKRuntime } from '../../sdk/veepoo-sdk-runtime';
import { PersonalInfoCapability } from '../../capabilities/personal-info/index';
import { AutoMeasureCapability } from '../../capabilities/auto-measure/index';
import { SedentaryReminderCapability } from '../../capabilities/sedentary-reminder/index';
import { WomenHealthCapability } from '../../capabilities/women-health/index';
import { makeMockNative, type MockNative } from '../helpers/mock-native';
import type { AutoMeasureSetting, PersonalInfo, SedentaryReminderSettings, WomenHealthSettings } from '../../types/index';

describe('HealthConfig (split capabilities)', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let personalInfo: PersonalInfoCapability;
  let autoMeasure: AutoMeasureCapability;
  let sedentaryReminder: SedentaryReminderCapability;
  let womenHealth: WomenHealthCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    const ctx = runtime.createCapabilityContext();
    personalInfo = new PersonalInfoCapability(ctx);
    autoMeasure = new AutoMeasureCapability(ctx);
    sedentaryReminder = new SedentaryReminderCapability(ctx);
    womenHealth = new WomenHealthCapability(ctx);
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
    const result = await personalInfo.syncPersonalInfo(info);
    expect(native.syncPersonalInfo).toHaveBeenCalledWith(info);
    expect(result).toBe(true);
  });

  // ── readAutoMeasureSetting ─────────────────────────────────────────

  it('readAutoMeasureSetting delegates to native and returns normalized array', async () => {
    const raw: AutoMeasureSetting[] = [
      { type: 'heartRate', enabled: true, measureInterval: 30, currentStartMinute: 0, currentEndMinute: 1439 },
    ];
    native.readAutoMeasureSetting.mockResolvedValueOnce(raw);
    const result = await autoMeasure.readAutoMeasureSetting();
    expect(native.readAutoMeasureSetting).toHaveBeenCalled();
    expect(Array.isArray(result)).toBe(true);
  });

  // ── modifyAutoMeasureSetting ───────────────────────────────────────

  it('modifyAutoMeasureSetting delegates to native (happy path)', async () => {
    const setting: Partial<AutoMeasureSetting> = { measureInterval: 30 };
    native.modifyAutoMeasureSetting.mockResolvedValueOnce([]);
    await autoMeasure.modifyAutoMeasureSetting(setting);
    expect(native.modifyAutoMeasureSetting).toHaveBeenCalledWith(setting);
  });

  it('modifyAutoMeasureSetting throws INVALID_ARGUMENT for out-of-range interval', async () => {
    // measureInterval must be in range 1–120; 0 is invalid
    await expect(
      autoMeasure.modifyAutoMeasureSetting({ measureInterval: 0 }),
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
    const result = await sedentaryReminder.readSedentaryReminder();
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
    await sedentaryReminder.setSedentaryReminder(settings);
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
      sedentaryReminder.setSedentaryReminder(invalid),
    ).rejects.toMatchObject({ code: 'INVALID_ARGUMENT' });
    expect(native.setSedentaryReminder).not.toHaveBeenCalled();
  });

  // ── readWomenHealthSettings ──────────────────────────────────────

  it('readWomenHealthSettings delegates to native', async () => {
    native.readWomenHealthSettings.mockResolvedValueOnce({
      status: 'none',
    });
    const result = await womenHealth.readWomenHealthSettings();
    expect(native.readWomenHealthSettings).toHaveBeenCalled();
    expect(result.status).toBe('none');
  });

  // ── setWomenHealthSettings ───────────────────────────────────────

  it('setWomenHealthSettings delegates to native', async () => {
    const settings: WomenHealthSettings = { status: 'none' };
    await womenHealth.setWomenHealthSettings(settings);
    expect(native.setWomenHealthSettings).toHaveBeenCalledWith(settings);
  });
});
