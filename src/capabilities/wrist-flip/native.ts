import type { WristFlipWakeSettings } from "@/types/index";

export interface WristFlipNativeMethods {
  readWristFlipWakeSettings(): Promise<unknown>;
  setWristFlipWakeSettings(settings: WristFlipWakeSettings): Promise<void>;
}
