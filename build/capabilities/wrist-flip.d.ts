import type { CapabilityContext } from "../capabilities/shared/context";
/** Raise-to-wake / wrist-flip screen. Vendor `NightTurnWristSetting` / `VPDeviceRaiseHandModel`. */
export interface WristFlipWakeSettings {
    enabled: boolean;
    start_hour: number;
    start_minute: number;
    end_hour: number;
    end_minute: number;
    /** Sensitivity 1–10 (`level` / `sensitive`); 0 on read may mean not supported. */
    sensitivity_level: number;
    /** Android read: `isSupportCustomSettingTime`. */
    supports_custom_time_window?: boolean;
    /** Vendor default sensitivity when non-zero. */
    default_sensitivity_level?: number;
}
export interface WristFlipNativeMethods {
    readWristFlipWakeSettings(): Promise<unknown>;
    setWristFlipWakeSettings(settings: WristFlipWakeSettings): Promise<void>;
}
export declare function normalizeWristFlipWakeSettings(value: unknown): WristFlipWakeSettings;
export declare class WristFlipCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<WristFlipNativeMethods>);
    readWristFlipWakeSettings(): Promise<WristFlipWakeSettings>;
    setWristFlipWakeSettings(settings: WristFlipWakeSettings): Promise<void>;
}
//# sourceMappingURL=wrist-flip.d.ts.map