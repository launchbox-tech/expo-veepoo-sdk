import { join } from "path";

import {
  extractKotlinNativeEvents,
  extractSwiftNativeEvents,
  setDiff,
  sliceSwiftEventsHeader,
  verifyVeepooEventsContract,
} from "@/bridge-contract/verify-veepoo-events";
import {
  NATIVE_EMITTED_EVENTS,
  NATIVE_TO_JS_EVENT_MAP,
  JS_EXPOSED_NATIVE_EVENTS,
  JS_LOCAL_ONLY_EVENTS,
  ALL_VEEPOO_EVENTS,
} from "@/bridge/veepoo-events-registry";

const repoRoot = join(__dirname, "..", "..");

describe("VeepooEvent bridge contract", () => {
  it("repo satisfies contract (native + VeepooEventPayload keys)", () => {
    expect(verifyVeepooEventsContract(repoRoot)).toEqual([]);
  });

  it("registry: ALL_VEEPOO_EVENTS = JS_EXPOSED_NATIVE_EVENTS ∪ JS_LOCAL_ONLY_EVENTS", () => {
    const all = new Set(ALL_VEEPOO_EVENTS);
    const jsExposed = new Set(JS_EXPOSED_NATIVE_EVENTS);
    const jsOnly = new Set(JS_LOCAL_ONLY_EVENTS);
    // every native event maps to a JS snake_case name present in ALL_VEEPOO_EVENTS
    for (const e of NATIVE_EMITTED_EVENTS) {
      const jsName = NATIVE_TO_JS_EVENT_MAP[e];
      expect(all.has(jsName)).toBe(true);
    }
    for (const e of jsOnly) expect(all.has(e)).toBe(true);
    expect(all.size).toBe(jsExposed.size + jsOnly.size);
  });

  it("registry: no overlap between NATIVE_EMITTED_EVENTS and JS_LOCAL_ONLY_EVENTS", () => {
    const native = new Set(NATIVE_EMITTED_EVENTS);
    for (const e of JS_LOCAL_ONLY_EVENTS) {
      expect(native.has(e)).toBe(false);
    }
  });

  it("setDiff reports drift", () => {
    const { onlyA, onlyB } = setDiff(
      new Set(["a", "b"]),
      new Set(["b", "c"]),
    );
    expect(onlyA).toEqual(["a"]);
    expect(onlyB).toEqual(["c"]);
  });

  it("extractKotlinNativeEvents skips TAG", () => {
    const s = `
const val TAG = "VeepooSDKModule"
const val DEVICE_FOUND = "deviceFound"
`;
    expect([...extractKotlinNativeEvents(s)].sort()).toEqual(["deviceFound"]);
  });

  it("extractSwiftNativeEvents keeps camelCase event-like literals only", () => {
    const header = `
static let deviceFound = "deviceFound"
let X = "hrvTestResult"
= "not-an-event!"
`;
    expect([...extractSwiftNativeEvents(header)].sort()).toEqual([
      "deviceFound",
      "hrvTestResult",
    ]);
  });

  it("sliceSwiftEventsHeader stops at permission MARK", () => {
    const src = `let A = "deviceFound"
// MARK: - 权限
enum ConnectionState { case idle }`;
    expect(sliceSwiftEventsHeader(src)).toBe(`let A = "deviceFound"
`);
  });
});
