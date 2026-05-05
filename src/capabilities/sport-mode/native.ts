import type { OperationStatus } from "@/types/index";

export interface SportModeNativeMethods {
  readSportMode(): Promise<unknown>;
  setSportMode(ordinal: number): Promise<OperationStatus>;
  stopSportMode(): Promise<OperationStatus>;
}
