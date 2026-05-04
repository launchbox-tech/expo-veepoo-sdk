import type { WomenHealthSettings } from "../../types/index.js";

export interface WomenHealthNativeMethods {
  readWomenHealthSettings(): Promise<unknown>;
  setWomenHealthSettings(settings: WomenHealthSettings): Promise<void>;
}
