/**
 * Pure per-device deduplication filter for `readOriginProgress` events.
 *
 * Rules (mirroring the logic previously embedded in `VeepooSDKRuntime.emitLocal`):
 * - `readState === "start"` → reset stored progress and **pass** (return `true`)
 * - Equal progress → **suppress** (return `false`)
 * - Increasing or decreasing progress → **pass** (return `true`)
 * - Non-finite / non-number `progress` → **pass** (return `true`, no state change)
 *
 * No dependency on the runtime, state manager, or native module.
 */
export class OriginReadProgressFilter {
  private readonly lastProgressByDevice = new Map<string, number>();

  /**
   * Decide whether the event should be emitted.
   *
   * @param deviceId  The device the event belongs to (use a stable fallback such as
   *                  `"__default__"` when the payload carries no deviceId).
   * @param readState The `readState` field from the progress payload, if present.
   * @param progress  The numeric progress value from the payload.
   * @returns `true` if the event should be emitted, `false` if it should be suppressed.
   */
  shouldEmit(
    deviceId: string,
    readState: string | undefined,
    progress: number,
  ): boolean {
    if (typeof progress !== "number" || !Number.isFinite(progress)) {
      return true;
    }

    if (readState === "start") {
      this.lastProgressByDevice.set(deviceId, progress);
      return true;
    }

    const last = this.lastProgressByDevice.get(deviceId);

    if (last !== undefined && progress === last) {
      return false;
    }

    this.lastProgressByDevice.set(deviceId, progress);
    return true;
  }

  /**
   * Remove stored state for a device (call on disconnect so the next read
   * cycle starts fresh).
   */
  clearDevice(deviceId: string): void {
    this.lastProgressByDevice.delete(deviceId);
  }
}
