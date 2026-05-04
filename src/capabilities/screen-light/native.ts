import type { ScreenLightSettings } from "../../types/index.js";

export interface ScreenLightNativeMethods {
  readScreenLightSettings(): Promise<unknown>;
  setScreenLightSettings(settings: ScreenLightSettings): Promise<void>;
  readScreenLightDuration(): Promise<unknown>;
  setScreenLightDuration(seconds: number): Promise<void>;
}
