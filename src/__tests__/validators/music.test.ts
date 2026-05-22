import { validateMusicData } from '@/capabilities/music';
import { expectInvalidArgument } from '@/__tests__/helpers/expect-invalid-argument';

describe('validateMusicData', () => {
  const valid = { name: 'Song', artist: 'Artist', isPlaying: true, volume: 50 };

  it('passes for a valid payload', () => {
    expect(() => validateMusicData(valid)).not.toThrow();
  });

  it('passes with optional appId and album', () => {
    expect(() => validateMusicData({ ...valid, appId: 'com.app', album: 'Album' })).not.toThrow();
  });

  it('passes for volume 1', () => {
    expect(() => validateMusicData({ ...valid, volume: 1 })).not.toThrow();
  });

  it('passes for volume 100', () => {
    expect(() => validateMusicData({ ...valid, volume: 100 })).not.toThrow();
  });

  it('throws for empty name', () => {
    expectInvalidArgument(() => validateMusicData({ ...valid, name: '' }), 'name');
  });

  it('throws for whitespace-only name', () => {
    expectInvalidArgument(() => validateMusicData({ ...valid, name: '   ' }), 'name');
  });

  it('throws for empty artist', () => {
    expectInvalidArgument(() => validateMusicData({ ...valid, artist: '' }), 'artist');
  });

  it('throws for volume 0', () => {
    expectInvalidArgument(() => validateMusicData({ ...valid, volume: 0 }), 'volume');
  });

  it('throws for volume 101', () => {
    expectInvalidArgument(() => validateMusicData({ ...valid, volume: 101 }), 'volume');
  });

  it('throws for non-integer volume', () => {
    expectInvalidArgument(() => validateMusicData({ ...valid, volume: 50.5 }), 'volume');
  });
});
