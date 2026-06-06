import type { CapabilityContext } from "../capabilities/shared/context";
/** Dial / watch-face category from vendor screen-style APIs (`EUIFromType` / `VPDeviceDialType`). */
export type WatchFaceDialType = "default" | "market" | "photo";
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
export interface WatchFaceNativeMethods {
    readWatchFaceStyle(options?: {
        dialType?: WatchFaceDialType;
    } | null): Promise<unknown>;
    setWatchFaceStyle(settings: WatchFaceStyleSettings): Promise<void>;
}
export declare function normalizeWatchFaceStyle(value: unknown): WatchFaceStyle;
/** Optional filter for read; native may still return a unified snapshot (Android). */
export declare function validateReadWatchFaceStyleOptions(options?: {
    dial_type?: WatchFaceDialType;
}): void;
/** Vendor slot index; cap loosely — some Bands expose large enumerations. */
export declare function validateWatchFaceStyleSettings(s: WatchFaceStyleSettings): void;
export declare class WatchFaceCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<WatchFaceNativeMethods>);
    readWatchFaceStyle(options?: {
        dial_type?: WatchFaceDialType;
    }): Promise<WatchFaceStyle>;
    setWatchFaceStyle(settings: WatchFaceStyleSettings): Promise<void>;
}
//# sourceMappingURL=watch-face.d.ts.map