/** Kotlin `VeepooSDKConstants.kt` event string literals (excludes TAG). */
export declare function extractKotlinNativeEvents(source: string): Set<string>;
/** Swift event-constants file: `= "eventName"` string literals only. */
export declare function extractSwiftNativeEvents(swiftHeader: string): Set<string>;
/**
 * Until #194 the event constants lived inside VeepooSDK.swift and the
 * verifier had to slice the top of the file. They now live in their own
 * VeepooEvents.swift, but we keep this helper so older callers that still
 * pass the whole module file see the same behaviour: take everything up to
 * the permission-delegate marker if present, otherwise the whole file.
 */
export declare function sliceSwiftEventsHeader(swiftSource: string): string;
export declare function setDiff(a: Set<string>, b: Set<string>): {
    onlyA: string[];
    onlyB: string[];
};
export declare function verifyVeepooEventsContract(repoRoot: string): string[];
//# sourceMappingURL=verify-veepoo-events.d.ts.map