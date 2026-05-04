import type { WristFlipWakeSettings } from "../../types/index.js";

export interface WristFlipNativeMethods {
  readWristFlipWakeSettings(): Promise<unknown>;
  setWristFlipWakeSettings(settings: WristFlipWakeSettings): Promise<void>;
}
