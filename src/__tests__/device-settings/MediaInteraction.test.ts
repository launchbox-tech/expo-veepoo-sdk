jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { MediaInteraction } from '../../sdk/device-settings/MediaInteraction';
import { VeepooSDKRuntime } from '../../sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '../helpers/mock-native';

describe('MediaInteraction', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let mediaInteraction: MediaInteraction;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    mediaInteraction = new MediaInteraction(runtime);
  });

  // ── startFindDevice ────────────────────────────────────────────────────────

  it('startFindDevice delegates to native (happy path)', async () => {
    await mediaInteraction.startFindDevice();

    expect(native.startFindDevice).toHaveBeenCalledTimes(1);
  });

  // ── stopFindDevice ─────────────────────────────────────────────────────────

  it('stopFindDevice delegates to native (happy path)', async () => {
    await mediaInteraction.stopFindDevice();

    expect(native.stopFindDevice).toHaveBeenCalledTimes(1);
  });

  // ── enterCameraMode ────────────────────────────────────────────────────────

  it('enterCameraMode delegates to native (happy path)', async () => {
    await mediaInteraction.enterCameraMode();

    expect(native.enterCameraMode).toHaveBeenCalledTimes(1);
  });

  // ── exitCameraMode ─────────────────────────────────────────────────────────

  it('exitCameraMode delegates to native (happy path)', async () => {
    await mediaInteraction.exitCameraMode();

    expect(native.exitCameraMode).toHaveBeenCalledTimes(1);
  });

  // ── setMusicControlEnabled ─────────────────────────────────────────────────

  it('setMusicControlEnabled(true) delegates to native', async () => {
    await mediaInteraction.setMusicControlEnabled(true);

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

    await mediaInteraction.pushMusicData(data);

    expect(native.pushMusicData).toHaveBeenCalledWith(data);
  });

  it('pushMusicData throws INVALID_ARGUMENT for empty name', async () => {
    const data = {
      name: '',
      artist: 'Queen',
      isPlaying: true,
      volume: 75,
    };

    await expect(mediaInteraction.pushMusicData(data)).rejects.toMatchObject({
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

    await expect(mediaInteraction.pushMusicData(data)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.pushMusicData).not.toHaveBeenCalled();
  });
});
