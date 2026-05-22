/** Track metadata pushed to the Band display via `pushMusicData`. Android only. */
export interface MusicData {
  /** Optional music app identifier (vendor `musicAppId`). */
  app_id?: string;
  album?: string;
  name: string;
  artist: string;
  is_playing: boolean;
  /** Volume level 1–100 (vendor `musicVoiceLevel`). */
  volume: number;
}

/** Remote command emitted when the Band sends a music control action (`musicRemoteCommand` event). Android only. */
export type MusicRemoteCommand = 'next' | 'previous' | 'pause_play';
