import type { MusicData } from "@/types/index";

export function validateMusicData(data: MusicData): void {
  if (typeof data.name !== 'string' || data.name.trim().length === 0) {
    throw { code: 'INVALID_ARGUMENT', message: 'name is required' };
  }
  if (typeof data.artist !== 'string' || data.artist.trim().length === 0) {
    throw { code: 'INVALID_ARGUMENT', message: 'artist is required' };
  }
  if (!Number.isInteger(data.volume) || data.volume < 1 || data.volume > 100) {
    throw { code: 'INVALID_ARGUMENT', message: 'volume must be an integer between 1 and 100' };
  }
}
