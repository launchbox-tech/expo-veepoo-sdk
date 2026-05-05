import type { VeepooEventPayload } from "@/types/events";

/**
 * Pure pipeline that wraps per-device deduplication for `readOriginProgress`
 * events, operating directly on the normalized payload rather than raw
 * primitives.
 *
 * Rules (identical to {@link OriginReadProgressFilter}, lifted to payload level):
 * - `payload.progress` is not an object → **pass** (return `true`), no state stored
 * - Non-finite `progress.progress` → **pass** (return `true`), no state stored
 * - `readState === "start"` → reset stored progress for the device, **pass**
 * - Equal progress → **suppress** (return `false`)
 * - Progress changed → update stored progress, **pass** (return `true`)
 *
 * No dependency on the runtime, state manager, logger, or event bus.
 */
export class OriginReadPipeline {
  private readonly lastProgress = new Map<string, number>();

  /**
   * Decide whether the event should be emitted.
   *
   * @param payload The already-normalized `readOriginProgress` payload.
   * @returns `true` if the event should be emitted, `false` if it should be suppressed.
   */
  shouldEmit(payload: VeepooEventPayload["readOriginProgress"]): boolean {
    const deviceId = payload.device_id;
    const progressField = payload.progress;

    // Pass-through: if the progress field is not an object, emit without
    // storing any state (normalization fallback or malformed payload).
    if (typeof progressField !== "object" || progressField === null) {
      return true;
    }

    const progress = progressField.progress;
    const readState = progressField.read_state;

    // Non-finite / non-number progress → pass, no state change.
    if (typeof progress !== "number" || !Number.isFinite(progress)) {
      return true;
    }

    // "start" resets the stored progress for this device and passes.
    if (readState === "start") {
      this.lastProgress.set(deviceId, progress);
      return true;
    }

    const last = this.lastProgress.get(deviceId);

    // Equal progress → suppress.
    if (last !== undefined && progress === last) {
      return false;
    }

    // Progress changed (or first occurrence) → update and pass.
    this.lastProgress.set(deviceId, progress);
    return true;
  }

  /**
   * Remove stored state for a device (call on disconnect so the next read
   * cycle starts fresh).
   */
  clearDevice(deviceId: string): void {
    this.lastProgress.delete(deviceId);
  }
}
