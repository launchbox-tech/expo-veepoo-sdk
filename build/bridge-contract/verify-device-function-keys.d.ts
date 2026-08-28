export type PackageKeys = Map<string, Set<string>>;
export declare function extractIosPackageKeys(source: string): PackageKeys;
export declare function extractAndroidPackageKeys(source: string): PackageKeys;
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