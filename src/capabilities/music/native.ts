import type { MusicData } from "../../types/index.js";

export interface MusicNativeMethods {
  setMusicControlEnabled(enabled: boolean): Promise<void>;
  pushMusicData(data: MusicData): Promise<void>;
}
