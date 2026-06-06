import type { WomenHealthSettings } from "../../types/index";
export interface WomenHealthNativeMethods {
    readWomenHealthSettings(): Promise<unknown>;
    setWomenHealthSettings(settings: WomenHealthSettings): Promise<void>;
}
//# sourceMappingURL=native.d.ts.map