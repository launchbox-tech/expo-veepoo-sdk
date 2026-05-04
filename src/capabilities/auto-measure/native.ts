import type { AutoMeasureSetting } from "../../types/index.js";

export interface AutoMeasureNativeMethods {
  readAutoMeasureSetting(): Promise<unknown>;
  modifyAutoMeasureSetting(setting: Partial<AutoMeasureSetting>): Promise<unknown>;
}
