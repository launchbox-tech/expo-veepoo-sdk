/**
 * AsyncFunction occurrences extracted from a single source file. `name` is the
 * string literal passed as the first argument; `file` is the path relative to
 * the searched root so failure messages stay short.
 */
export interface AsyncFunctionOccurrence {
    readonly name: string;
    readonly file: string;
}
/**
 * Extract every `AsyncFunction("name") { ... }` (or `AsyncFunction("name", ...)`)
 * occurrence from a Swift source file. The matcher is intentionally permissive
 * on whitespace and forgives a trailing `(` after the name. Same regex shape
 * used for Kotlin in `extractKotlinAsyncFunctions` — both languages spell the
 * Expo DSL the same way at the call site.
 */
export declare function extractAsyncFunctions(source: string): Array<{
    name: string;
}>;
/**
 * Walk a directory tree and collect AsyncFunction occurrences from files whose
 * extension is in `extensions`. `excludeBasenames` is checked against the
 * file's basename so the iOS simulator stub (which holds its own, narrower
 * AsyncFunction surface) can be left out.
 */
export declare function collectAsyncFunctionOccurrences(root: string, extensions: readonly string[], excludeBasenames?: ReadonlySet<string>): AsyncFunctionOccurrence[];
export interface SurfaceMismatch {
    readonly platform: "ios" | "android";
    readonly missing: readonly string[];
    readonly extra: readonly string[];
    readonly duplicates: ReadonlyArray<{
        name: string;
        files: readonly string[];
    }>;
}
/**
 * Compare a parsed AsyncFunction set against an `expectedNames` reference set
 * (typically the golden fixture in `src/__tests__/fixtures/`).
 *
 * - `missing`: names the reference set requires that the native files don't expose.
 * - `extra`: names the native files expose that the reference set doesn't know
 *   about (typically a method was renamed without updating the fixture).
 * - `duplicates`: same AsyncFunction name declared in more than one file.
 *   On iOS this would be a Swift compile error; on Android the Expo runtime
 *   takes whichever loaded last, which is exactly the silent breakage we want
 *   the test to flag.
 */
export declare function diffSurface(platform: "ios" | "android", occurrences: readonly AsyncFunctionOccurrence[], expectedNames: readonly string[]): SurfaceMismatch;
export declare const IOS_SOURCE_ROOT = "ios/VeepooSDK";
export declare const ANDROID_SOURCE_ROOT = "android/src/main/kotlin/expo/modules/veepoo";
//# sourceMappingURL=verify-native-async-surface.d.ts.map