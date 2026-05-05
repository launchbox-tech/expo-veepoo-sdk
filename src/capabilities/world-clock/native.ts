import type { OperationStatus, WorldClockEntry } from "@/types/index";

export interface WorldClockNativeMethods {
  readWorldClock(): Promise<unknown>;
  setWorldClock(clocks: WorldClockEntry[]): Promise<OperationStatus>;
}
