jest.mock('expo-modules-core', () => ({
  requireNativeModule: jest.fn().mockReturnValue({}),
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { MusicCapability } from '@/capabilities/music';
import { VeepooSDKRuntime } from '@/sdk/veepoo-sdk-runtime';
import { makeMockNative, type MockNative } from '@/__tests__/helpers/mock-native';

describe('MusicCapability', () => {
  let native: MockNative;
  let runtime: VeepooSDKRuntime;
  let music: MusicCapability;

  beforeEach(() => {
    native = makeMockNative();
    runtime = new VeepooSDKRuntime(native);
    music = new MusicCapability(runtime.createCapabilityContext());
  });

  it('setMusicControlEnabled(true) delegates to native', async () => {
    await music.setMusicControlEnabled(true);

    expect(native.setMusicControlEnabled).toHaveBeenCalledWith(true);
  });

  it('pushMusicData delegates to native with valid data', async () => {
    const data = {
      name: 'Bohemian Rhapsody',
      artist: 'Queen',
      isPlaying: true,
      volume: 75,
    };

    await music.pushMusicData(data);

    expect(native.pushMusicData).toHaveBeenCalledWith(data);
  });

  it('pushMusicData rejects empty name without calling native', async () => {
    await expect(
      music.pushMusicData({ name: '', artist: 'Queen', isPlaying: true, volume: 75 }),
    ).rejects.toMatchObject({ code: 'INVALID_ARGUMENT' });
    expect(native.pushMusicData).not.toHaveBeenCalled();
  });

  it('pushMusicData rejects empty artist without calling native', async () => {
    await expect(
      music.pushMusicData({ name: 'Bohemian Rhapsody', artist: '', isPlaying: true, volume: 75 }),
    ).rejects.toMatchObject({ code: 'INVALID_ARGUMENT' });
    expect(native.pushMusicData).not.toHaveBeenCalled();
  });
});
