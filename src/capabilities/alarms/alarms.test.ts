jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { AlarmsCapability } from '@/capabilities/alarms/index';
import {
  makeFakeCapabilityContext,
  findEmission,
  type FakeCapabilityContext,
} from '@/__tests__/helpers/fake-capability-context';

describe('AlarmsCapability', () => {
  let ctx: FakeCapabilityContext;
  let alarmSettings: AlarmsCapability;

  beforeEach(() => {
    ctx = makeFakeCapabilityContext();
    alarmSettings = new AlarmsCapability(ctx);
  });

  // ── readAlarms ────────────────────────────────────────────────────────────

  it('readAlarms delegates to native and emits alarm_data', async () => {
    const alarms = [{ id: 1, hour: 7, minute: 30, repeat: [1, 2], enabled: true }];
    ctx.native.readAlarms.mockResolvedValueOnce(alarms);

    const result = await alarmSettings.readAlarms();

    expect(ctx.native.readAlarms).toHaveBeenCalledTimes(1);
    expect(result).toEqual(alarms);
    expect(findEmission(ctx, 'alarm_data')).toMatchObject({ alarms });
  });

  // ── setAlarm ──────────────────────────────────────────────────────────────

  it('setAlarm delegates to native (happy path)', async () => {
    const alarm = { id: 1, hour: 8, minute: 0, repeat: [1, 2, 3], enabled: true };

    const result = await alarmSettings.setAlarm(alarm);

    expect(ctx.native.setAlarm).toHaveBeenCalledWith(alarm);
    expect(result).toBe('success');
  });

  // ── deleteAlarm ───────────────────────────────────────────────────────────

  it('deleteAlarm delegates to native (happy path)', async () => {
    const result = await alarmSettings.deleteAlarm(1);

    expect(ctx.native.deleteAlarm).toHaveBeenCalledWith(1);
    expect(result).toBe('success');
  });

  // ── readHeartRateAlarm ────────────────────────────────────────────────────

  it('readHeartRateAlarm delegates, normalizes, emits heart_rate_alarm_data', async () => {
    const result = await alarmSettings.readHeartRateAlarm();

    expect(ctx.native.readHeartRateAlarm).toHaveBeenCalledTimes(1);
    expect(result.high_threshold).toBe(120);
    expect(result.low_threshold).toBe(60);
    expect(result.enabled).toBe(true);
    expect(findEmission(ctx, 'heart_rate_alarm_data')).toMatchObject({
      data: expect.objectContaining({
        high_threshold: 120,
        low_threshold: 60,
        enabled: true,
      }),
    });
  });

  // ── setHeartRateAlarm ─────────────────────────────────────────────────────

  it('setHeartRateAlarm delegates and emits heart_rate_alarm_data', async () => {
    const alarm = { enabled: true, high_threshold: 120, low_threshold: 50 };

    const result = await alarmSettings.setHeartRateAlarm(alarm);

    expect(ctx.native.setHeartRateAlarm).toHaveBeenCalledWith({
      enabled: true,
      highThreshold: 120,
      lowThreshold: 50,
    });
    expect(result).toBe('success');
    expect(findEmission(ctx, 'heart_rate_alarm_data')).toMatchObject({
      data: alarm,
    });
  });

  // ── Validation (every set* method) ────────────────────────────────────────

  it.each([
    {
      name: 'setAlarm rejects bad alarm id (out of range)',
      run: () =>
        alarmSettings.setAlarm({ id: 0, hour: 8, minute: 0, repeat: [1], enabled: true }),
      nativeMethod: 'setAlarm' as const,
    },
    {
      name: 'deleteAlarm rejects bad id (out of range)',
      run: () => alarmSettings.deleteAlarm(0),
      nativeMethod: 'deleteAlarm' as const,
    },
    {
      name: 'setHeartRateAlarm rejects highThreshold <= lowThreshold',
      run: () =>
        alarmSettings.setHeartRateAlarm({
          enabled: true,
          highThreshold: 80,
          lowThreshold: 100,
        }),
      nativeMethod: 'setHeartRateAlarm' as const,
    },
    {
      name: 'setSpo2Alarm rejects low_threshold: 0',
      run: () => alarmSettings.setSpo2Alarm({ enabled: true, low_threshold: 0 }),
      nativeMethod: 'setSpo2Alarm' as const,
    },
    {
      name: 'setSpo2Alarm rejects low_threshold: 100',
      run: () => alarmSettings.setSpo2Alarm({ enabled: true, low_threshold: 100 }),
      nativeMethod: 'setSpo2Alarm' as const,
    },
  ])('$name → INVALID_ARGUMENT, no native call', async ({ run, nativeMethod }) => {
    await expect(run()).rejects.toMatchObject({ code: 'INVALID_ARGUMENT' });
    expect(ctx.native[nativeMethod]).not.toHaveBeenCalled();
  });

  // ── readSpo2Alarm ─────────────────────────────────────────────────────────

  it('readSpo2Alarm normalizes and emits spo2_alarm_data', async () => {
    const result = await alarmSettings.readSpo2Alarm();

    expect(ctx.native.readSpo2Alarm).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ enabled: false, low_threshold: 90 });
    expect(findEmission(ctx, 'spo2_alarm_data')).toMatchObject({
      data: expect.objectContaining({ enabled: false, low_threshold: 90 }),
    });
  });

  // ── setSpo2Alarm ──────────────────────────────────────────────────────────

  it('setSpo2Alarm delegates and emits spo2_alarm_data', async () => {
    const alarm = { enabled: true, low_threshold: 85 };

    const result = await alarmSettings.setSpo2Alarm(alarm);

    expect(ctx.native.setSpo2Alarm).toHaveBeenCalledWith({
      enabled: true,
      lowThreshold: 85,
    });
    expect(result).toBe('success');
    expect(findEmission(ctx, 'spo2_alarm_data')).toMatchObject({ data: alarm });
  });
});
