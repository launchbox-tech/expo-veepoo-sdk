import type { VeepooEvent, VeepooEventPayload } from '@/types/index';
import { isRecord } from '@/normalizers/primitives';

/**
 * Every native-emitted event arrives as an `event envelope` — a record with
 * device/session-scoped keys (e.g. `deviceId`) plus a single `inner payload`
 * field that holds the capability-specific value. The bridge owns envelope
 * handling; capabilities own their inner-payload normalizers. See CONTEXT.md
 * for the canonical definitions.
 */
export type EventNormalizer<K extends VeepooEvent> = (raw: unknown) => VeepooEventPayload[K];

/** Map of `Partial<EVENT_NORMALIZERS>` — what each capability exports as its slice. */
export type PartialEventNormalizers = Partial<{ [K in VeepooEvent]: EventNormalizer<K> }>;

/** Identity normalizer for events whose envelope needs no value-level rewriting. */
export const passthrough = <K extends VeepooEvent>(): EventNormalizer<K> =>
  (raw) => raw as VeepooEventPayload[K];

/**
 * Spread the envelope, replace one inner-payload field with its normalized
 * shape. `fallbackKey` lets a few events tolerate native sending the inner
 * payload under either of two camelCase keys.
 */
export function wrapInner<K extends VeepooEvent>(
  field: string,
  normalize: (raw: unknown) => unknown,
  options?: { fallbackKey?: string },
): EventNormalizer<K> {
  return (raw) => {
    const p = isRecord(raw) ? raw : {};
    const primary = (p as Record<string, unknown>)[field];
    const value =
      options?.fallbackKey !== undefined && primary === undefined
        ? (p as Record<string, unknown>)[options.fallbackKey]
        : primary;
    return { ...p, [field]: normalize(value) } as VeepooEventPayload[K];
  };
}
