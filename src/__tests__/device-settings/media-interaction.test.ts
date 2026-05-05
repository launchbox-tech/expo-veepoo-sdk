jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { FindDeviceCapability } from '@/capabilities/find-device/index';
import { CameraCapability } from '@/capabilities/camera/index';
import { MusicCapability } from '@/capabilities/music/index';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

describe('MediaInteraction (split capabilities)', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let findDevice: FindDeviceCapability;
  let camera: CameraCapability;
  let music: MusicCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    const ctx = runtime.createCapabilityContext();
    findDevice = new FindDeviceCapability(ctx);
    camera = new CameraCapability(ctx);
    music = new MusicCapability(ctx);
  });

  // ── startFindDevice ────────────────────────────────────────────────────────

  it('startFindDevice delegates to native (happy path)', async () => {
    await findDevice.startFindDevice();

    expect(native.startFindDevice).toHaveBeenCalledTimes(1);
  });

  // ── stopFindDevice ─────────────────────────────────────────────────────────

  it('stopFindDevice delegates to native (happy path)', async () => {
    await findDevice.stopFindDevice();

    expect(native.stopFindDevice).toHaveBeenCalledTimes(1);
  });

  // ── enterCameraMode ────────────────────────────────────────────────────────

  it('enterCameraMode delegates to native (happy path)', async () => {
    await camera.enterCameraMode();

    expect(native.enterCameraMode).toHaveBeenCalledTimes(1);
  });

  // ── exitCameraMode ─────────────────────────────────────────────────────────

  it('exitCameraMode delegates to native (happy path)', async () => {
    await camera.exitCameraMode();

    expect(native.exitCameraMode).toHaveBeenCalledTimes(1);
  });

  // ── setMusicControlEnabled ─────────────────────────────────────────────────

  it('setMusicControlEnabled(true) delegates to native', async () => {
    await music.setMusicControlEnabled(true);

    expect(native.setMusicControlEnabled).toHaveBeenCalledWith(true);
  });

  // ── pushMusicData ──────────────────────────────────────────────────────────

  it('pushMusicData delegates to native with valid data (happy path)', async () => {
    const data = {
      name: 'Bohemian Rhapsody',
      artist: 'Queen',
      isPlaying: true,
      volume: 75,
    };

    await music.pushMusicData(data);

    expect(native.pushMusicData).toHaveBeenCalledWith(data);
  });

  it('pushMusicData throws INVALID_ARGUMENT for empty name', async () => {
    const data = {
      name: '',
      artist: 'Queen',
      isPlaying: true,
      volume: 75,
    };

    await expect(music.pushMusicData(data)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.pushMusicData).not.toHaveBeenCalled();
  });

  it('pushMusicData throws INVALID_ARGUMENT for empty artist', async () => {
    const data = {
      name: 'Bohemian Rhapsody',
      artist: '',
      isPlaying: true,
      volume: 75,
    };

    await expect(music.pushMusicData(data)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.pushMusicData).not.toHaveBeenCalled();
  });
});
