import { normalizeMusicRemoteCommand } from './music';

describe('normalizeMusicRemoteCommand', () => {
  it('maps "next" → "next"', () => {
    expect(normalizeMusicRemoteCommand('next')).toBe('next');
  });

  it('maps "previous" → "previous"', () => {
    expect(normalizeMusicRemoteCommand('previous')).toBe('previous');
  });

  it('maps "pausePlay" → "pause_play"', () => {
    expect(normalizeMusicRemoteCommand('pausePlay')).toBe('pause_play');
  });

  it('maps unknown string → "pause_play"', () => {
    expect(normalizeMusicRemoteCommand('UNKNOWN')).toBe('pause_play');
  });

  it('maps null → "pause_play"', () => {
    expect(normalizeMusicRemoteCommand(null)).toBe('pause_play');
  });
});
