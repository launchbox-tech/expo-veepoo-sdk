jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { ScreenLightCapability } from '@/capabilities/screen-light/index';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

describe('ScreenLightCapability', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let screenLight: ScreenLightCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    screenLight = new ScreenLightCapability(runtime.createCapabilityContext());
  });

  it('readScreenLightSettings normalizes the camelCase native response', async () => {
    native.readScreenLightSettings.mockResolvedValueOnce({
      nightStartHour: 22,
      nightStartMinute: 0,
      nightEndHour: 6,
      nightEndMinute: 0,
      nightLevel: 2,
      dayLevel: 8,
      autoAdjust: true,
      maxLevel: 10,
    });

    const result = await screenLight.readScreenLightSettings();

    expect(native.readScreenLightSettings).toHaveBeenCalledTimes(1);
    expect(result.night_start_hour).toBe(22);
    expect(result.day_level).toBe(8);
    expect(result.auto_adjust).toBe(true);
  });

  it('setScreenLightSettings converts snake_case to camelCase for native', async () => {
    await screenLight.setScreenLightSettings({
      night_start_hour: 22,
      night_start_minute: 0,
      night_end_hour: 6,
      night_end_minute: 0,
      night_level: 2,
      day_level: 8,
      auto_adjust: false,
      max_level: 10,
    });

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

  it('readScreenLightDuration normalizes the camelCase native response', async () => {
    native.readScreenLightDuration.mockResolvedValueOnce({
      currentSeconds: 30,
      minSeconds: 5,
      maxSeconds: 600,
    });

    const result = await screenLight.readScreenLightDuration();

    expect(native.readScreenLightDuration).toHaveBeenCalledTimes(1);
    expect(result.current_seconds).toBe(30);
    expect(result.min_seconds).toBe(5);
    expect(result.max_seconds).toBe(600);
  });

  it('setScreenLightDuration(30) delegates to native', async () => {
    await screenLight.setScreenLightDuration(30);

    expect(native.setScreenLightDuration).toHaveBeenCalledWith(30);
  });

  it('setScreenLightDuration(0) throws INVALID_ARGUMENT without calling native', async () => {
    await expect(screenLight.setScreenLightDuration(0)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.setScreenLightDuration).not.toHaveBeenCalled();
  });

  it('setScreenLightDuration(601) throws INVALID_ARGUMENT without calling native', async () => {
    await expect(screenLight.setScreenLightDuration(601)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.setScreenLightDuration).not.toHaveBeenCalled();
  });

  it('setScreenLightSettings rejects max_level out of range without calling native', async () => {
    await expect(
      screenLight.setScreenLightSettings({
        night_start_hour: 22,
        night_start_minute: 0,
        night_end_hour: 7,
        night_end_minute: 0,
        night_level: 2,
        day_level: 4,
        auto_adjust: false,
        max_level: 0,
      }),
    ).rejects.toMatchObject({ code: 'INVALID_ARGUMENT' });
    expect(native.setScreenLightSettings).not.toHaveBeenCalled();
  });
});
