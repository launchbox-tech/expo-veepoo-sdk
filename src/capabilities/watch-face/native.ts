import type { WatchFaceDialType, WatchFaceStyleSettings } from "../../types/index.js";

export interface WatchFaceNativeMethods {
  readWatchFaceStyle(options?: { dialType?: WatchFaceDialType } | null): Promise<unknown>;
  setWatchFaceStyle(settings: WatchFaceStyleSettings): Promise<void>;
}
