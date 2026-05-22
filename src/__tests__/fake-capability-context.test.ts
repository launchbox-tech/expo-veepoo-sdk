jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { AlarmsCapability } from '@/capabilities/alarms/index';
import { makeFakeCapabilityContext, findEmission } from './helpers/fake-capability-context';

describe('makeFakeCapabilityContext', () => {
  it('drives a capability end-to-end: validate → native → normalize → emit', async () => {
    const ctx = makeFakeCapabilityContext({ connectedDeviceId: 'AA:BB:CC' });
    const alarms = new AlarmsCapability(ctx);

    const result = await alarms.readHeartRateAlarm();

    expect(ctx.native.readHeartRateAlarm).toHaveBeenCalledTimes(1);
    expect(result.high_threshold).toBe(120);
    expect(result.low_threshold).toBe(60);
    expect(result.enabled).toBe(true);

    const emitted = findEmission(ctx, 'heart_rate_alarm_data');
    expect(emitted).toMatchObject({
      device_id: 'AA:BB:CC',
      data: expect.objectContaining({
        high_threshold: 120,
        low_threshold: 60,
        enabled: true,
      }),
    });
  });

  it('surfaces validator errors as VeepooError without calling native', async () => {
    const ctx = makeFakeCapabilityContext();
    const alarms = new AlarmsCapability(ctx);

    await expect(
      alarms.setHeartRateAlarm({
        enabled: true,
        highThreshold: 80,
        lowThreshold: 100,
      }),
    ).rejects.toMatchObject({ code: 'INVALID_ARGUMENT' });

    expect(ctx.native.setHeartRateAlarm).not.toHaveBeenCalled();
    expect(ctx.spies.emittedEvents).toEqual([]);
  });

  it('maps native rejections through the same pipeline as the runtime', async () => {
    const ctx = makeFakeCapabilityContext();
    ctx.native.readHeartRateAlarm.mockRejectedValueOnce(new Error('boom'));
    const alarms = new AlarmsCapability(ctx);

    await expect(alarms.readHeartRateAlarm()).rejects.toMatchObject({
      code: 'OPERATION_FAILED',
      message: 'boom',
    });
  });

  it('records emit / emitDeviceEvent / log on the spies sidecar', async () => {
    const ctx = makeFakeCapabilityContext({ connectedDeviceId: 'XX:YY' });
    const alarms = new AlarmsCapability(ctx);

    await alarms.readHeartRateAlarm();

    expect(ctx.spies.emit).not.toHaveBeenCalled();
    expect(ctx.spies.emitDeviceEvent).toHaveBeenCalledTimes(1);
    expect(ctx.spies.emittedEvents).toHaveLength(1);
  });
});
