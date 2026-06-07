"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ANDROID_SOURCE_ROOT = exports.IOS_SOURCE_ROOT = exports.IOS_EXCLUDED_BASENAMES = void 0;
exports.extractAsyncFunctions = extractAsyncFunctions;
exports.collectAsyncFunctionOccurrences = collectAsyncFunctionOccurrences;
exports.diffSurface = diffSurface;
const fs_1 = require("fs");
const path_1 = require("path");
/**
 * Extract every `AsyncFunction("name") { ... }` (or `AsyncFunction("name", ...)`)
 * occurrence from a Swift source file. The matcher is intentionally permissive
 * on whitespace and forgives a trailing `(` after the name. Same regex shape
 * used for Kotlin in `extractKotlinAsyncFunctions` — both languages spell the
 * Expo DSL the same way at the call site.
 */
function extractAsyncFunctions(source) {
    const out = [];
    const re = /\bAsyncFunction\s*\(\s*"([^"]+)"/g;
    let match;
    while ((match = re.exec(source)) !== null) {
        const name = match[1];
        if (name)
            out.push({ name });
    }
    return out;
}
/** True if `path` is one of the file names we should not include in the surface. */
function shouldSkip(path, excludeBasenames) {
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
function collectAsyncFunctionOccurrences(root, extensions, excludeBasenames = new Set()) {
    const out = [];
    const stack = [root];
    while (stack.length > 0) {
        const dir = stack.pop();
        let entries;
        try {
            entries = (0, fs_1.readdirSync)(dir);
        }
        catch {
            continue;
        }
        for (const entry of entries) {
            const full = (0, path_1.join)(dir, entry);
            let st;
            try {
                st = (0, fs_1.statSync)(full);
            }
            catch {
                continue;
            }
            if (st.isDirectory()) {
                // Skip build outputs that may contain copies of source files.
                if (entry === "build" || entry === ".build" || entry === "node_modules")
                    continue;
                stack.push(full);
                continue;
            }
            if (!st.isFile())
                continue;
            if (!extensions.some(ext => entry.endsWith(ext)))
                continue;
            if (shouldSkip(full, excludeBasenames))
                continue;
            const source = (0, fs_1.readFileSync)(full, "utf8");
            for (const occ of extractAsyncFunctions(source)) {
                out.push({ name: occ.name, file: full.slice(root.length + 1) });
            }
        }
    }
    return out;
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
function diffSurface(platform, occurrences, expectedNames) {
    const expected = new Set(expectedNames);
    const seen = new Map();
    for (const occ of occurrences) {
        const files = seen.get(occ.name) ?? [];
        files.push(occ.file);
        seen.set(occ.name, files);
    }
    const actual = new Set(seen.keys());
    const missing = [...expected].filter(n => !actual.has(n)).sort();
    const extra = [...actual].filter(n => !expected.has(n)).sort();
    const duplicates = [];
    for (const [name, files] of seen.entries()) {
        if (files.length > 1)
            duplicates.push({ name, files: [...files].sort() });
    }
    duplicates.sort((a, b) => a.name.localeCompare(b.name));
    return { platform, missing, extra, duplicates };
}
/** The iOS simulator stub file is intentionally a narrower surface — exclude it. */
exports.IOS_EXCLUDED_BASENAMES = new Set([
    "VeepooSDKSimulator.swift",
]);
exports.IOS_SOURCE_ROOT = "ios/VeepooSDK";
exports.ANDROID_SOURCE_ROOT = "android/src/main/kotlin/expo/modules/veepoo";
//# sourceMappingURL=verify-native-async-surface.js.map