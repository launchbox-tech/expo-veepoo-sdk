import { readFileSync } from "fs";
import { join } from "path";

import {
  ANDROID_SOURCE_ROOT,
  collectAsyncFunctionOccurrences,
  diffSurface,
  extractAsyncFunctions,
  IOS_EXCLUDED_BASENAMES,
  IOS_SOURCE_ROOT,
} from "../bridge-contract/verify-native-async-surface";

const REPO_ROOT = join(__dirname, "..", "..");

interface SurfaceFixture {
  readonly description: string;
  readonly names: readonly string[];
}

const golden = JSON.parse(
  readFileSync(join(__dirname, "fixtures/native-async-surface.golden.json"), "utf8"),
) as SurfaceFixture;

const GOLDEN = [...golden.names].sort();

const iosOccurrences = collectAsyncFunctionOccurrences(
  join(REPO_ROOT, IOS_SOURCE_ROOT),
  [".swift"],
  IOS_EXCLUDED_BASENAMES,
);
const androidOccurrences = collectAsyncFunctionOccurrences(
  join(REPO_ROOT, ANDROID_SOURCE_ROOT),
  [".kt"],
);

describe("extractAsyncFunctions", () => {
  it("finds a single Swift-style declaration", () => {
    const src = `AsyncFunction("readBattery") { (promise: Promise) in foo() }`;
    expect(extractAsyncFunctions(src)).toEqual([{ name: "readBattery" }]);
  });

  it("finds a single Kotlin-style declaration", () => {
    const src = `AsyncFunction("startScan") { options: Map<String, Any?>?, promise: Promise -> }`;
    expect(extractAsyncFunctions(src)).toEqual([{ name: "startScan" }]);
  });

  it("returns the names in source order", () => {
    const src = `
      AsyncFunction("a") {}
      AsyncFunction("b") {}
      AsyncFunction("c") {}
    `;
    expect(extractAsyncFunctions(src).map(o => o.name)).toEqual(["a", "b", "c"]);
  });

  it("treats Swift-style string-interpolation names as their raw literal", () => {
    // Native code currently never builds AsyncFunction names from interpolations,
    // so the regex doesn't try to evaluate them — pinning the behaviour stops a
    // future drift from being mistaken for a real surface change.
    const src = `AsyncFunction("\${prefix}Test") {}`;
    expect(extractAsyncFunctions(src).map(o => o.name)).toEqual(["${prefix}Test"]);
  });
});

describe("iOS AsyncFunction surface", () => {
  it("declares every name in the golden fixture", () => {
    const { missing } = diffSurface("ios", iosOccurrences, GOLDEN);
    expect(missing).toEqual([]);
  });

  it("declares no name beyond the golden fixture", () => {
    const { extra } = diffSurface("ios", iosOccurrences, GOLDEN);
    expect(extra).toEqual([]);
  });

  it("declares each name in exactly one .swift file", () => {
    const { duplicates } = diffSurface("ios", iosOccurrences, GOLDEN);
    expect(duplicates).toEqual([]);
  });
});

describe("Android AsyncFunction surface", () => {
  it("declares every name in the golden fixture", () => {
    const { missing } = diffSurface("android", androidOccurrences, GOLDEN);
    expect(missing).toEqual([]);
  });

  it("declares no name beyond the golden fixture", () => {
    const { extra } = diffSurface("android", androidOccurrences, GOLDEN);
    expect(extra).toEqual([]);
  });

  it("declares each name in exactly one .kt file", () => {
    const { duplicates } = diffSurface("android", androidOccurrences, GOLDEN);
    expect(duplicates).toEqual([]);
  });
});

describe("cross-platform parity", () => {
  it("iOS and Android expose exactly the same AsyncFunction set", () => {
    const ios = [...new Set(iosOccurrences.map(o => o.name))].sort();
    const android = [...new Set(androidOccurrences.map(o => o.name))].sort();
    const onlyIos = ios.filter(n => !android.includes(n));
    const onlyAndroid = android.filter(n => !ios.includes(n));
    expect({ onlyIos, onlyAndroid }).toEqual({ onlyIos: [], onlyAndroid: [] });
  });
});
