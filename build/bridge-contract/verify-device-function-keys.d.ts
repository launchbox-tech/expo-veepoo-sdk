export type PackageKeys = Map<string, Set<string>>;
export declare function extractIosPackageKeys(source: string): PackageKeys;
export declare function extractAndroidPackageKeys(source: string): PackageKeys;
/**
 * Fails when `updateFunctionsFromSupportData` stops handing the cache what
 * [deviceFunctionPackages] built.
 *
 * The keys above are read from the mapper's file, which is not where #210 was
 * filed. A helper that builds its own map bypasses both this check's real
 * subject and the executable one that runs the mapper, with the mapper sitting
 * correct and untouched beside it — the hole the #212 follow-up shipped and had
 * to close.
 */
export declare function verifyAndroidPackageEmitter(source: string): string[];
export type CacheRead = {
    file: string;
    packageName: string;
    key: string;
};
/**
 * Every `cachedDeviceFunctions["package"]…["key"]` read in one native source.
 *
 * Both platforms take the package into a local first and subscript that local
 * afterwards, so the two halves are matched by variable name: an assignment
 * binds the name to a package, and later subscripts of that name are reads of
 * it. Each function rebinds before it reads, so the latest binding is the right
 * one — no scope tracking needed, and a name read before any binding is simply
 * not a cache read.
 */
export declare function extractCacheReads(file: string, source: string): CacheRead[];
/**
 * Fails when native code reads a device-function key its own platform never
 * writes.
 *
 * This is the general shape of #210, and of the dead guards found while fixing
 * it: `cachedDeviceFunctions["pkg1"]?.get("weatherFunction")` where the writer
 * emits `package2` / `weather_function`. The lookup returns null forever, so
 * the guard's answer never depends on the band — fail-open for the weather and
 * contact checks, fail-CLOSED for the SOS ones, which rejected every call.
 *
 * Swept over whole directories rather than a list of files, because the next
 * one of these will be written in a file that does not exist yet.
 */
export declare function verifyCacheReads(repoRoot: string, emitted: Record<string, PackageKeys>): string[];
/**
 * Fails when the native layer emits a device-function key the declared types do
 * not have, or when the two platforms disagree on the spelling of one.
 *
 * Deliberately one-directional: the interfaces declare far more fields than
 * either platform reports today, and a declared-but-unemitted field is a gap,
 * not drift. Emitting a placeholder for it would recreate exactly the defect
 * this check exists to catch (#210).
 */
export declare function verifyDeviceFunctionKeysContract(repoRoot: string): string[];
//# sourceMappingURL=verify-device-function-keys.d.ts.map