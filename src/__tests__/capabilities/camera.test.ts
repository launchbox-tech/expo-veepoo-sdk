jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { CameraCapability } from '@/capabilities/camera';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

describe('CameraCapability', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let camera: CameraCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    camera = new CameraCapability(runtime.createCapabilityContext());
  });

  it('enterCameraMode delegates to native', async () => {
    await camera.enterCameraMode();

    expect(native.enterCameraMode).toHaveBeenCalledTimes(1);
  });

  it('exitCameraMode delegates to native', async () => {
    await camera.exitCameraMode();

    expect(native.exitCameraMode).toHaveBeenCalledTimes(1);
  });
});
