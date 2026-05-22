jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { CameraCapability, normalizeCameraShutterStatus } from '@/capabilities/camera';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

describe('normalizeCameraShutterStatus', () => {
  it('maps "canTake" → "canTake"', () => {
    expect(normalizeCameraShutterStatus('canTake')).toBe('canTake');
  });

  it('maps Android ECameraStatus "TAKEPHOTO_CAN" → "canTake"', () => {
    expect(normalizeCameraShutterStatus('TAKEPHOTO_CAN')).toBe('canTake');
  });

  it('maps "cannotTake" → "cannotTake"', () => {
    expect(normalizeCameraShutterStatus('cannotTake')).toBe('cannotTake');
  });

  it('maps "TAKEPHOTO_CAN_NOT" → "cannotTake"', () => {
    expect(normalizeCameraShutterStatus('TAKEPHOTO_CAN_NOT')).toBe('cannotTake');
  });

  it('maps unknown string → "cannotTake"', () => {
    expect(normalizeCameraShutterStatus('UNKNOWN')).toBe('cannotTake');
  });

  it('maps null → "cannotTake"', () => {
    expect(normalizeCameraShutterStatus(null)).toBe('cannotTake');
  });
});

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
