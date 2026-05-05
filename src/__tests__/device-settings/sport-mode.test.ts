jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { SportModeCapability } from '@/capabilities/sport-mode/index';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

describe('SportModeCapability', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let sportMode: SportModeCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    sportMode = new SportModeCapability(runtime.createCapabilityContext());
  });

  // ── setSportMode ──────────────────────────────────────────────────────────

  it('setSportMode("outdoor_run") sends ordinal 1 to native', async () => {
    const result = await sportMode.setSportMode('outdoor_run');

    expect(native.setSportMode).toHaveBeenCalledWith(1);
    expect(result).toBe('success');
  });

  it('setSportMode("swimming") sends ordinal 12 to native', async () => {
    await sportMode.setSportMode('swimming');

    expect(native.setSportMode).toHaveBeenCalledWith(12);
  });

  // ── stopSportMode ─────────────────────────────────────────────────────────

  it('stopSportMode() sends ordinal 0 to native', async () => {
    const result = await sportMode.stopSportMode();

    expect(native.stopSportMode).toHaveBeenCalledTimes(1);
    expect(result).toBe('success');
  });

  // ── readSportMode ─────────────────────────────────────────────────────────

  it('readSportMode normalizes camelCase native response correctly', async () => {
    native.readSportMode.mockResolvedValueOnce({ sportMode: 1, isActive: true });

    const result = await sportMode.readSportMode();

    expect(result).toEqual({ mode: 'outdoor_run', is_active: true });
  });

  it('readSportMode normalizes ordinal 0 to { mode: null, is_active: false }', async () => {
    native.readSportMode.mockResolvedValueOnce({ sportMode: 0, isActive: false });

    const result = await sportMode.readSportMode();

    expect(result).toEqual({ mode: null, is_active: false });
  });

  it('readSportMode emits sport_mode_data with mode from result', async () => {
    const emitSpy = jest.spyOn(runtime, 'emitLocal');
    native.readSportMode.mockResolvedValueOnce({ sportMode: 2, isActive: true });

    await sportMode.readSportMode();

    expect(emitSpy).toHaveBeenCalledWith(
      'sport_mode_data',
      expect.objectContaining({ mode: 'outdoor_walk' }),
    );
  });

  // ── CAPABILITY_UNSUPPORTED ────────────────────────────────────────────────

  it('native rejection CAPABILITY_UNSUPPORTED is re-thrown', async () => {
    native.setSportMode.mockRejectedValueOnce({ code: 'CAPABILITY_UNSUPPORTED', message: 'not supported' });

    await expect(sportMode.setSportMode('outdoor_run')).rejects.toMatchObject({
      code: 'CAPABILITY_UNSUPPORTED',
    });
  });

  // ── validation ────────────────────────────────────────────────────────────

  it('setSportMode with an invalid mode string throws INVALID_ARGUMENT before calling native', async () => {
    await expect(sportMode.setSportMode('not_a_valid_mode' as never)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.setSportMode).not.toHaveBeenCalled();
  });

  it('setSportMode("common") throws INVALID_ARGUMENT (use stopSportMode instead)', async () => {
    await expect(sportMode.setSportMode('common' as never)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.setSportMode).not.toHaveBeenCalled();
  });
});
