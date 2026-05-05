jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { WorldClockCapability } from '@/capabilities/world-clock/index';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

describe('WorldClockCapability', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let worldClock: WorldClockCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    worldClock = new WorldClockCapability(runtime.createCapabilityContext());
  });

  // ── readWorldClock ────────────────────────────────────────────────────────

  it('readWorldClock returns normalized array', async () => {
    native.readWorldClock.mockResolvedValueOnce([
      { timezoneOffsetMinutes: 345, cityName: 'Kathmandu', dstOffset: 0 },
      { timezone_offset_minutes: 480, city_name: 'Beijing' },
    ]);

    const result = await worldClock.readWorldClock();

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ timezone_offset_minutes: 345, city_name: 'Kathmandu', dst_offset: 0 });
    expect(result[1]).toEqual({ timezone_offset_minutes: 480, city_name: 'Beijing' });
  });

  it('readWorldClock returns empty array when native returns empty', async () => {
    native.readWorldClock.mockResolvedValueOnce([]);

    const result = await worldClock.readWorldClock();

    expect(result).toEqual([]);
  });

  // ── setWorldClock ─────────────────────────────────────────────────────────

  it('setWorldClock with valid 4 entries delegates to native with camelCase keys', async () => {
    const clocks = [
      { timezone_offset_minutes: 0, city_name: 'UTC' },
      { timezone_offset_minutes: 60, city_name: 'London' },
      { timezone_offset_minutes: 330, city_name: 'Mumbai' },
      { timezone_offset_minutes: 480, city_name: 'Beijing' },
    ];

    const result = await worldClock.setWorldClock(clocks);

    expect(native.setWorldClock).toHaveBeenCalledWith([
      { timezoneOffsetMinutes: 0, cityName: 'UTC' },
      { timezoneOffsetMinutes: 60, cityName: 'London' },
      { timezoneOffsetMinutes: 330, cityName: 'Mumbai' },
      { timezoneOffsetMinutes: 480, cityName: 'Beijing' },
    ]);
    expect(result).toBe('success');
  });

  it('setWorldClock with 5 entries rejects with INVALID_ARGUMENT', async () => {
    const clocks = Array.from({ length: 5 }, (_, i) => ({
      timezone_offset_minutes: i * 60,
      city_name: `City${i}`,
    }));

    await expect(worldClock.setWorldClock(clocks)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.setWorldClock).not.toHaveBeenCalled();
  });

  it('setWorldClock with out-of-range offset rejects with INVALID_ARGUMENT', async () => {
    const clocks = [{ timezone_offset_minutes: 1000, city_name: 'Invalid' }];

    await expect(worldClock.setWorldClock(clocks)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.setWorldClock).not.toHaveBeenCalled();
  });

  it('setWorldClock with empty city_name rejects with INVALID_ARGUMENT', async () => {
    const clocks = [{ timezone_offset_minutes: 0, city_name: '' }];

    await expect(worldClock.setWorldClock(clocks)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.setWorldClock).not.toHaveBeenCalled();
  });

  // ── CAPABILITY_UNSUPPORTED ────────────────────────────────────────────────

  it('native CAPABILITY_UNSUPPORTED is re-thrown', async () => {
    native.setWorldClock.mockRejectedValueOnce({ code: 'CAPABILITY_UNSUPPORTED', message: 'not supported' });

    await expect(
      worldClock.setWorldClock([{ timezone_offset_minutes: 0, city_name: 'UTC' }]),
    ).rejects.toMatchObject({ code: 'CAPABILITY_UNSUPPORTED' });
  });
});
