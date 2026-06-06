import type { VeepooEvent, VeepooEventPayload } from '../types/index';
/**
 * Every native-emitted event arrives as an `event envelope` — a record with
 * device/session-scoped keys (e.g. `deviceId`) plus a single `inner payload`
 * field that holds the capability-specific value. The bridge owns envelope
 * handling; capabilities own their inner-payload normalizers. See CONTEXT.md
 * for the canonical definitions.
 */
export type EventNormalizer<K extends VeepooEvent> = (raw: unknown) => VeepooEventPayload[K];
/** Identity normalizer for events whose envelope needs no value-level rewriting. */
export declare const passthrough: <K extends VeepooEvent>() => EventNormalizer<K>;
/**
 * Spread the envelope, replace one inner-payload field with its normalized
 * shape. `fallbackKey` lets a few events tolerate native sending the inner
 * payload under either of two camelCase keys.
 */
export declare function wrapInner<K extends VeepooEvent>(field: string, normalize: (raw: unknown) => unknown, options?: {
    fallbackKey?: string;
}): EventNormalizer<K>;
//# sourceMappingURL=event-envelope.d.ts.map