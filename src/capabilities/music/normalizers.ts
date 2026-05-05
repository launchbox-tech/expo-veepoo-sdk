import type { MusicRemoteCommand } from "../../types/index.js";

/** Normalizes a music remote command string from native. */
export function normalizeMusicRemoteCommand(value: unknown): MusicRemoteCommand {
  const s = typeof value === 'string' ? value : '';
  if (s === 'next') return 'next';
  if (s === 'previous') return 'previous';
  if (s === 'pausePlay' || s === 'pause_play') return 'pause_play';
  return 'pause_play';
}
