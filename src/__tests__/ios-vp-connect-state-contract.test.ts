import { readFileSync } from "fs";
import { join } from "path";

const source = readFileSync(
  join(__dirname, "..", "..", "ios", "VeepooSDK", "VeepooSDKModule+ConnectionHelpers.swift"),
  "utf8",
);

describe("iOS VPBleConnectStateChangeBlock contract", () => {
  it("publishes VPDeviceConnectStateVerifyPasswordSuccess (3) as ready, not error", () => {
    // VPDeviceConnectState and DeviceConnectState have different enum layouts:
    // raw 3 in this callback is verify-password success, not BleConnectFailed.
    expect(source).toMatch(/case 3:\s*(?:\/\/[^\n]*\s*)+status = "ready"/);
  });
});
