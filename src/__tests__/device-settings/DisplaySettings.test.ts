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
    expect(result.nightStartHour).toBe(22);
    expect(result.dayLevel).toBe(8);
    expect(result.autoAdjust).toBe(true);
  });

  // ── setScreenLightSettings ────────────────────────────────────────────────

  it('setScreenLightSettings delegates to native (happy path)', async () => {
    const settings = {
      nightStartHour: 22,
      nightStartMinute: 0,
      nightEndHour: 6,
      nightEndMinute: 0,
      nightLevel: 2,
      dayLevel: 8,
      autoAdjust: false,
      maxLevel: 10,
    };

    await screenLight.setScreenLightSettings(settings);

    expect(native.setScreenLightSettings).toHaveBeenCalledWith(settings);
  });

  // ── readScreenLightDuration ───────────────────────────────────────────────

  it('readScreenLightDuration delegates to native (happy path)', async () => {
    const raw = { currentSeconds: 30, minSeconds: 5, maxSeconds: 600 };
    native.readScreenLightDuration.mockResolvedValueOnce(raw);

    const result = await screenLight.readScreenLightDuration();

    expect(native.readScreenLightDuration).toHaveBeenCalledTimes(1);
    expect(result.currentSeconds).toBe(30);
    expect(result.minSeconds).toBe(5);
    expect(result.maxSeconds).toBe(600);
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
    expect(result.sensitivityLevel).toBe(5);
  });

  // ── setWristFlipWakeSettings ──────────────────────────────────────────────

  it('setWristFlipWakeSettings delegates to native (happy path)', async () => {
    const settings = {
      enabled: true,
      startHour: 8,
      startMinute: 0,
      endHour: 22,
      endMinute: 0,
      sensitivityLevel: 5,
    };

    await wristFlip.setWristFlipWakeSettings(settings);

    expect(native.setWristFlipWakeSettings).toHaveBeenCalledWith(settings);
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
    expect(result.dialType).toBe('default');
    expect(result.screenIndex).toBe(3);
    expect(result.operationSuccess).toBe(true);
  });

  it('readWatchFaceStyle passes dialType to native when provided', async () => {
    native.readWatchFaceStyle.mockResolvedValueOnce({
      dialType: 'market',
      screenIndex: 0,
      operationSuccess: true,
    });

    await displaySettings.readWatchFaceStyle({ dialType: 'market' });

    expect(native.readWatchFaceStyle).toHaveBeenCalledWith({ dialType: 'market' });
  });

  // ── setWatchFaceStyle ─────────────────────────────────────────────────────

  it('setWatchFaceStyle delegates to native (happy path)', async () => {
    await displaySettings.setWatchFaceStyle({ screenIndex: 2 });

    expect(native.setWatchFaceStyle).toHaveBeenCalledWith({ screenIndex: 2, dialType: 'default' });
  });

  it('setWatchFaceStyle forwards explicit dialType to native', async () => {
    await displaySettings.setWatchFaceStyle({ screenIndex: 1, dialType: 'photo' });

    expect(native.setWatchFaceStyle).toHaveBeenCalledWith({ screenIndex: 1, dialType: 'photo' });
  });
});
