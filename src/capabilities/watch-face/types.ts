/** Dial / watch-face category from vendor screen-style APIs (`EUIFromType` / `VPDeviceDialType`). */
export type WatchFaceDialType = 'default' | 'market' | 'photo';

/** Current watch face selection from the Band (read). */
export interface WatchFaceStyle {
  dial_type: WatchFaceDialType;
  /** Style slot index (vendor-specific). */
  screen_index: number;
  /** Native read includes this flag; omitted after normalization if unknown. */
  operation_success?: boolean;
}

/** Arguments for `setWatchFaceStyle`. */
export interface WatchFaceStyleSettings {
  screen_index: number;
  dial_type?: WatchFaceDialType;
}
