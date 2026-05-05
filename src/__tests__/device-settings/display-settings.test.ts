jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { ScreenLightCapability } from '../../capabilities/screen-light/index';
import { WristFlipCapability } from '../../capabilities/wrist-flip/index';
import { WatchFaceCapability } from '../../capabilities/watch-face/index';
import { VeepooSDKRuntime } from '../../sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '../helpers/mock-native';

describe('DisplaySettings (split capabilities)', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let screenLight: ScreenLightCapability;
  let wristFlip: WristFlipCapability;
  let displaySettings: WatchFaceCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    const ctx = runtime.createCapabilityContext();
    screenLight = new ScreenLightCapability(ctx);
    wristFlip = new WristFlipCapability(ctx);
    displaySettings = new WatchFaceCapability(ctx);
  });

  // ── readScreenLightSettings ───────────────────────────────────────────────

  it('readScreenLightSettings delegates to native (happy path)', async () => {
    const raw = {
      nightStartHour: 22,
      nightStartMinute: 0,
      nightEndHour: 6,
      nightEndMinute: 0,
      nightLevel: 2,
      dayLevel: 8,
      autoAdjust: true,
      maxLevel: 10,
    };
    native.readScreenLightSettings.mockResolvedValueOnce(raw);

    const result = await screenLight.readScreenLightSettings();

    expect(native.readScreenLightSettings).toHaveBeenCalledTimes(1);
    expect(result.night_start_hour).toBe(22);
    expect(result.day_level).toBe(8);
    expect(result.auto_adjust).toBe(true);
  });

  // ── setScreenLightSettings ────────────────────────────────────────────────

  it('setScreenLightSettings delegates to native (happy path)', async () => {
    const settings = {
      night_start_hour: 22,
      night_start_minute: 0,
      night_end_hour: 6,
      night_end_minute: 0,
      night_level: 2,
      day_level: 8,
      auto_adjust: false,
      max_level: 10,
    };

    await screenLight.setScreenLightSettings(settings);

    expect(native.setScreenLightSettings).toHaveBeenCalledWith({
      nightStartHour: 22,
      nightStartMinute: 0,
      nightEndHour: 6,
      nightEndMinute: 0,
      nightLevel: 2,
      dayLevel: 8,
      autoAdjust: false,
      maxLevel: 10,
    });
  });

  // ── readScreenLightDuration ───────────────────────────────────────────────

  it('readScreenLightDuration delegates to native (happy path)', async () => {
    const raw = { currentSeconds: 30, minSeconds: 5, maxSeconds: 600 };
    native.readScreenLightDuration.mockResolvedValueOnce(raw);

    const result = await screenLight.readScreenLightDuration();

    expect(native.readScreenLightDuration).toHaveBeenCalledTimes(1);
    expect(result.current_seconds).toBe(30);
    expect(result.min_seconds).toBe(5);
    expect(result.max_seconds).toBe(600);
  });

  // ── setScreenLightDuration ────────────────────────────────────────────────

  it('setScreenLightDuration(30) delegates to native (happy path)', async () => {
    await screenLight.setScreenLightDuration(30);

    expect(native.setScreenLightDuration).toHaveBeenCalledWith(30);
  });

  it('setScreenLightDuration(0) throws INVALID_ARGUMENT', async () => {
    await expect(screenLight.setScreenLightDuration(0)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.setScreenLightDuration).not.toHaveBeenCalled();
  });

  it('setScreenLightDuration(601) throws INVALID_ARGUMENT', async () => {
    await expect(screenLight.setScreenLightDuration(601)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.setScreenLightDuration).not.toHaveBeenCalled();
  });

  // ── readWristFlipWakeSettings ─────────────────────────────────────────────

  it('readWristFlipWakeSettings delegates to native (happy path)', async () => {
    const raw = {
      enabled: true,
      startHour: 8,
      startMinute: 0,
      endHour: 22,
      endMinute: 0,
      sensitivityLevel: 5,
    };
    native.readWristFlipWakeSettings.mockResolvedValueOnce(raw);

    const result = await wristFlip.readWristFlipWakeSettings();

    expect(native.readWristFlipWakeSettings).toHaveBeenCalledTimes(1);
    expect(result.enabled).toBe(true);
    expect(result.sensitivity_level).toBe(5);
  });

  // ── setWristFlipWakeSettings ──────────────────────────────────────────────

  it('setWristFlipWakeSettings delegates to native (happy path)', async () => {
    const settings = {
      enabled: true,
      start_hour: 8,
      start_minute: 0,
      end_hour: 22,
      end_minute: 0,
      sensitivity_level: 5,
    };

    await wristFlip.setWristFlipWakeSettings(settings);

    expect(native.setWristFlipWakeSettings).toHaveBeenCalledWith({
      enabled: true,
      startHour: 8,
      startMinute: 0,
      endHour: 22,
      endMinute: 0,
      sensitivityLevel: 5,
    });
  });

  // ── readWatchFaceStyle ────────────────────────────────────────────────────

  it('readWatchFaceStyle delegates to native and returns normalized shape', async () => {
    native.readWatchFaceStyle.mockResolvedValueOnce({
      dialType: 'default',
      screenIndex: 3,
      operationSuccess: true,
    });

    const result = await displaySettings.readWatchFaceStyle();

    expect(native.readWatchFaceStyle).toHaveBeenCalledWith(null);
    expect(result.dial_type).toBe('default');
    expect(result.screen_index).toBe(3);
    expect(result.operation_success).toBe(true);
  });

  it('readWatchFaceStyle passes dial_type to native when provided', async () => {
    native.readWatchFaceStyle.mockResolvedValueOnce({
      dialType: 'market',
      screenIndex: 0,
      operationSuccess: true,
    });

    await displaySettings.readWatchFaceStyle({ dial_type: 'market' });

    expect(native.readWatchFaceStyle).toHaveBeenCalledWith({ dialType: 'market' });
  });

  // ── setWatchFaceStyle ─────────────────────────────────────────────────────

  it('setWatchFaceStyle delegates to native (happy path)', async () => {
    await displaySettings.setWatchFaceStyle({ screen_index: 2 });

    expect(native.setWatchFaceStyle).toHaveBeenCalledWith({ screenIndex: 2, dialType: 'default' });
  });

  it('setWatchFaceStyle forwards explicit dial_type to native', async () => {
    await displaySettings.setWatchFaceStyle({ screen_index: 1, dial_type: 'photo' });

    expect(native.setWatchFaceStyle).toHaveBeenCalledWith({ screenIndex: 1, dialType: 'photo' });
  });
});
