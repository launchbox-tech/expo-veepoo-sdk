export interface SosNativeMethods {
  readSosCallTimes(): Promise<unknown>;
  setSosCallTimes(times: number): Promise<void>;
}
