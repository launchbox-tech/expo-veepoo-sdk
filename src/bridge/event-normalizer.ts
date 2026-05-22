import type { VeepooEvent, VeepooEventPayload } from "@/types/index";
import { deepSnakeKeys } from "@/shared/deep-keys";
import { EVENT_NORMALIZERS } from "./event-registry";

// Re-exported so existing tests can still reach the helper.
export { normalizeReadOriginProgressPayload } from "@/capabilities/origin-data/normalizers";

/**
 * Apply the per-event inner-payload normalizer (declared once in
 * {@link EVENT_DEFINITIONS}) and then run `deepSnakeKeys` so consumers always
 * see snake_case keys (ADR 0004).
 */
export function normalizeEventPayload<K extends VeepooEvent>(
  event: K,
  payload: unknown,
): VeepooEventPayload[K] {
  return deepSnakeKeys(EVENT_NORMALIZERS[event](payload)) as VeepooEventPayload[K];
}
