import type { FieldKind } from '../declared-keys';
/**
 * Reads a nested native package (`{ package2: { … } }`) through the declared
 * field table.
 *
 * Only declared keys are kept: a native key that no interface declares used to
 * be spread through verbatim behind a cast, which is how twelve camelCase keys
 * reached JS under names nothing could read (#210). An absent field stays
 * absent — never defaulted to `0` or `'unknown'` — so callers can still tell
 * "the band did not report it" from a real value.
 */
export declare function readDeclaredFields<T>(nested: Record<string, unknown>, fields: Readonly<Record<string, FieldKind>>): T;
//# sourceMappingURL=nested.d.ts.map