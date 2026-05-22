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

  const validMusic = { name: 'Song', artist: 'Artist', isPlaying: true, volume: 50 };

  it.each([
    { name: 'empty name', input: { ...validMusic, name: '' } },
    { name: 'whitespace-only name', input: { ...validMusic, name: '   ' } },
    { name: 'empty artist', input: { ...validMusic, artist: '' } },
    { name: 'volume 0', input: { ...validMusic, volume: 0 } },
    { name: 'volume 101', input: { ...validMusic, volume: 101 } },
    { name: 'non-integer volume', input: { ...validMusic, volume: 50.5 } },
  ])('pushMusicData rejects $name → INVALID_ARGUMENT, no native call', async ({ input }) => {
    await expect(music.pushMusicData(input)).rejects.toMatchObject({
      code: 'INVALID_ARGUMENT',
    });
    expect(native.pushMusicData).not.toHaveBeenCalled();
  });
});
