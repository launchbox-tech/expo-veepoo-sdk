jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { WatchFaceCapability, normalizeWatchFaceStyle } from '@/capabilities/watch-face';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

describe('normalizeWatchFaceStyle', () => {
  it('maps dialType and screenIndex', () => {
    const r = normalizeWatchFaceStyle({
      dialType: 'MARKET',
      screenIndex: 4,
      operationSuccess: true,
    });
    expect(r.dial_type).toBe('market');
    expect(r.screen_index).toBe(4);
    expect(r.operation_success).toBe(true);
  });

  it('defaults unknown dial to default and omits operation_success when absent', () => {
    const r = normalizeWatchFaceStyle({ screenIndex: 1 });
    expect(r.dial_type).toBe('default');
    expect(r.screen_index).toBe(1);
    expect(r.operation_success).toBeUndefined();
  });
});

describe('WatchFaceCapability', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let watchFace: WatchFaceCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    watchFace = new WatchFaceCapability(runtime.createCapabilityContext());
  });

  it('readWatchFaceStyle() (no args) calls native with null and returns normalized shape', async () => {
    native.readWatchFaceStyle.mockResolvedValueOnce({
      dialType: 'default',
      screenIndex: 3,
      operationSuccess: true,
    });

    const result = await watchFace.readWatchFaceStyle();

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

    await watchFace.readWatchFaceStyle({ dial_type: 'market' });

    expect(native.readWatchFaceStyle).toHaveBeenCalledWith({ dialType: 'market' });
  });

  it('setWatchFaceStyle defaults dial_type to "default" when omitted', async () => {
    await watchFace.setWatchFaceStyle({ screen_index: 2 });

    expect(native.setWatchFaceStyle).toHaveBeenCalledWith({ screenIndex: 2, dialType: 'default' });
  });

  it('setWatchFaceStyle forwards explicit dial_type to native', async () => {
    await watchFace.setWatchFaceStyle({ screen_index: 1, dial_type: 'photo' });

    expect(native.setWatchFaceStyle).toHaveBeenCalledWith({ screenIndex: 1, dialType: 'photo' });
  });

  it.each([
    {
      name: 'readWatchFaceStyle rejects invalid dial_type',
      run: (w: WatchFaceCapability) =>
        w.readWatchFaceStyle({ dial_type: 'x' as never }),
      nativeMethod: 'readWatchFaceStyle' as const,
    },
    {
      name: 'setWatchFaceStyle rejects screen_index < 0',
      run: (w: WatchFaceCapability) => w.setWatchFaceStyle({ screen_index: -1 }),
      nativeMethod: 'setWatchFaceStyle' as const,
    },
    {
      name: 'setWatchFaceStyle rejects screen_index above range',
      run: (w: WatchFaceCapability) => w.setWatchFaceStyle({ screen_index: 66_000 }),
      nativeMethod: 'setWatchFaceStyle' as const,
    },
    {
      name: 'setWatchFaceStyle rejects invalid dial_type',
      run: (w: WatchFaceCapability) =>
        w.setWatchFaceStyle({ screen_index: 0, dial_type: 'oops' as never }),
      nativeMethod: 'setWatchFaceStyle' as const,
    },
  ])('$name → INVALID_ARGUMENT, no native call', async ({ run, nativeMethod }) => {
    await expect(run(watchFace)).rejects.toMatchObject({ code: 'INVALID_ARGUMENT' });
    expect(native[nativeMethod]).not.toHaveBeenCalled();
  });
});
