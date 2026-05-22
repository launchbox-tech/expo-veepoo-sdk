jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { WatchFaceCapability } from '@/capabilities/watch-face';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

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
});
