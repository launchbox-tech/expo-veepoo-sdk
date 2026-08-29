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