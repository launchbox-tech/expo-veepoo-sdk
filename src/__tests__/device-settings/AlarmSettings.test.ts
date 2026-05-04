jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { AlarmsCapability } from '../../capabilities/alarms/index';
import { VeepooSDKRuntime } from '../../sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '../helpers/mock-native';

describe('AlarmsCapability', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let alarmSettings: AlarmsCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    alarmSettings = new AlarmsCapability(runtime.createCapabilityContext());
  });

  // ── readAlarms ────────────────────────────────────────────────────────────

  it('readAlarms delegates to native and emits alarmData via emitLocal', async () => {
    const emitSpy = jest.spyOn(runtime, 'emitLocal');
    const alarms = [{ id: 1, hour: 7, minute: 30, repeat: [1, 2], enabled: true }];
    native.readAlarms.mockResolvedValueOnce(alarms);

    const result = await alarmSettings.readAlarms();

    expect(native.readAlarms).toHaveBeenCalledTimes(1);
    expect(result).toEqual(alarms);
    expect(emitSpy).toHaveBeenCalledWith(
      'alarmData',
      expect.objectContaining({ alarms }),
    );
  });

  // ── setAlarm ──────────────────────────────────────────────────────────────

  it('setAlarm delegates to native (happy path)', async () => {
    const alarm = { id: 1, hour: 8, minute: 0, repeat: [1, 2, 3], enabled: true };

    const result = await alarmSettings.setAlarm(alarm);

    expect(native.setAlarm).toHaveBeenCalledWith(alarm);
    expect(result).toBe('success');
  });

  // ── deleteAlarm ───────────────────────────────────────────────────────────

  it('deleteAlarm delegates to native (happy path)', async () => {
    const result = await alarmSettings.deleteAlarm(1);

    expect(native.deleteAlarm).toHaveBeenCalledWith(1);
    expect(result).toBe('success');
  });

  // ── readHeartRateAlarm ────────────────────────────────────────────────────

  it('readHeartRateAlarm delegates to native, normalizes, emits heartRateAlarmData', async () => {
    const emitSpy = jest.spyOn(runtime, 'emitLocal');

    const result = await alarmSettings.readHeartRateAlarm();

    expect(native.readHeartRateAlarm).toHaveBeenCalledTimes(1);
    expect(result.highThreshold).toBe(120);
    expect(result.lowThreshold).toBe(60);
    expect(result.enabled).toBe(true);
    expect(emitSpy).toHaveBeenCalledWith(
      'heartRateAlarmData',
      expect.objectContaining({
        data: expect.objectContaining({ highThreshold: 120, lowThreshold: 60, enabled: true }),
      }),
    );
  });

  // ── setHeartRateAlarm ─────────────────────────────────────────────────────

  it('setHeartRateAlarm delegates to native and emits heartRateAlarmData', async () => {
    const emitSpy = jest.spyOn(runtime, 'emitLocal');
    const alarm = { enabled: true, highThreshold: 120, lowThreshold: 50 };

    const result = await alarmSettings.setHeartRateAlarm(alarm);

    expect(native.setHeartRateAlarm).toHaveBeenCalledWith(alarm);
    expect(result).toBe('success');
    expect(emitSpy).toHaveBeenCalledWith(
      'heartRateAlarmData',
      expect.objectContaining({ data: alarm }),
    );
  });

  // ── setAlarm validation ───────────────────────────────────────────────────

  it('setAlarm throws INVALID_ARGUMENT for a bad alarm id (out of range)', async () => {
    const badAlarm = { id: 0, hour: 8, minute: 0, repeat: [1], enabled: true };

    await expect(alarmSettings.setAlarm(badAlarm)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.setAlarm).not.toHaveBeenCalled();
  });

  // ── deleteAlarm validation ────────────────────────────────────────────────

  it('deleteAlarm throws INVALID_ARGUMENT for bad id (out of range)', async () => {
    await expect(alarmSettings.deleteAlarm(0)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.deleteAlarm).not.toHaveBeenCalled();
  });

  // ── setHeartRateAlarm validation ──────────────────────────────────────────

  it('setHeartRateAlarm throws INVALID_ARGUMENT when highThreshold <= lowThreshold', async () => {
    await expect(
      alarmSettings.setHeartRateAlarm({ enabled: true, highThreshold: 80, lowThreshold: 100 }),
    ).rejects.toMatchObject({ code: 'INVALID_ARGUMENT' });
    expect(native.setHeartRateAlarm).not.toHaveBeenCalled();
  });
});
