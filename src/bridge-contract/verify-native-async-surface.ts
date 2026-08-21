import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

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
export function extractAsyncFunctions(
  source: string,
): Array<{ name: string }> {
  const out: Array<{ name: string }> = [];
  const re = /\bAsyncFunction\s*\(\s*"([^"]+)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source)) !== null) {
    const name = match[1];
    if (name) out.push({ name });
  }
  return out;
}

/** True if `path` is one of the file names we should not include in the surface. */
function shouldSkip(path: string, excludeBasenames: ReadonlySet<string>): boolean {
  const slash = path.lastIndexOf("/");
  const base = slash === -1 ? path : path.slice(slash + 1);
  return excludeBasenames.has(base);
}

/**
 * Walk a directory tree and collect AsyncFunction occurrences from files whose
 * extension is in `extensions`. `excludeBasenames` is checked against the
 * file's basename so the iOS simulator stub (which holds its own, narrower
 * AsyncFunction surface) can be left out.
 */
export function collectAsyncFunctionOccurrences(
  root: string,
  extensions: readonly string[],
  excludeBasenames: ReadonlySet<string> = new Set(),
): AsyncFunctionOccurrence[] {
  const out: AsyncFunctionOccurrence[] = [];
  const stack: string[] = [root];
  while (stack.length > 0) {
    const dir = stack.pop()!;
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = join(dir, entry);
      let st;
      try {
        st = statSync(full);
      } catch {
        continue;
      }
      if (st.isDirectory()) {
        // Skip build outputs that may contain copies of source files.
        if (entry === "build" || entry === ".build" || entry === "node_modules") continue;
        stack.push(full);
        continue;
      }
      if (!st.isFile()) continue;
      if (!extensions.some(ext => entry.endsWith(ext))) continue;
      if (shouldSkip(full, excludeBasenames)) continue;
      const source = readFileSync(full, "utf8");
      for (const occ of extractAsyncFunctions(source)) {
        out.push({ name: occ.name, file: full.slice(root.length + 1) });
      }
    }
  }
  return out;
}

export interface SurfaceMismatch {
  readonly platform: "ios" | "android";
  readonly missing: readonly string[];
  readonly extra: readonly string[];
  readonly duplicates: ReadonlyArray<{ name: string; files: readonly string[] }>;
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
export function diffSurface(
  platform: "ios" | "android",
  occurrences: readonly AsyncFunctionOccurrence[],
  expectedNames: readonly string[],
): SurfaceMismatch {
  const expected = new Set<string>(expectedNames);

  const seen = new Map<string, string[]>();
  for (const occ of occurrences) {
    const files = seen.get(occ.name) ?? [];
    files.push(occ.file);
    seen.set(occ.name, files);
  }

  const actual = new Set(seen.keys());
  const missing = [...expected].filter(n => !actual.has(n)).sort();
  const extra = [...actual].filter(n => !expected.has(n)).sort();
  const duplicates: Array<{ name: string; files: string[] }> = [];
  for (const [name, files] of seen.entries()) {
    if (files.length > 1) duplicates.push({ name, files: [...files].sort() });
  }
  duplicates.sort((a, b) => a.name.localeCompare(b.name));

  return { platform, missing, extra, duplicates };
}

export const IOS_SOURCE_ROOT = "ios/VeepooSDK";
export const ANDROID_SOURCE_ROOT =
  "android/src/main/kotlin/expo/modules/veepoo";
