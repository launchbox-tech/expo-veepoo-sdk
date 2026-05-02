import { join } from "path";

import {
  extractKotlinNativeEvents,
  extractSwiftNativeEvents,
  extractTsVeepooEventPayloadKeys,
  extractVeepooSDKListenerEvents,
  setDiff,
  sliceSwiftEventsHeader,
  verifyVeepooEventsContract,
} from "../bridge-contract/verify-veepoo-events.js";

const repoRoot = join(__dirname, "..", "..");

describe("VeepooEvent bridge contract", () => {
  it("repo satisfies contract (native + VeepooEventPayload keys)", () => {
    expect(verifyVeepooEventsContract(repoRoot)).toEqual([]);
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

  it("extractTsVeepooEventPayloadKeys reads top-level keys from VeepooEventPayload", () => {
    const src = `
export type VeepooEventPayload = {
  deviceFound: { x: number };
  deviceConnected: {
    deviceId: string;
  };
  error: Error;
};
export type VeepooEvent = keyof VeepooEventPayload;
`;
    expect([...extractTsVeepooEventPayloadKeys(src)].sort()).toEqual([
      "deviceConnected",
      "deviceFound",
      "error",
    ]);
  });

  it("extractVeepooSDKListenerEvents reads VeepooEvent array block", () => {
    const src = `
const events: VeepooEvent[] = [
  "deviceFound",
  "error",
];
other();
`;
    expect([...extractVeepooSDKListenerEvents(src)].sort()).toEqual([
      "deviceFound",
      "error",
    ]);
  });
});
