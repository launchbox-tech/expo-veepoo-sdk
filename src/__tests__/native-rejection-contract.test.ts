import { join } from "path";

import { verifyNativeRejectionContract } from "../bridge-contract/verify-native-rejection-contract.js";

const repoRoot = join(__dirname, "..", "..");

describe("Native rejection bridge contract (#83)", () => {
  it("allowedNativeRejectCodes matches live native .reject( scan", () => {
    expect(verifyNativeRejectionContract(repoRoot)).toEqual([]);
  });
});
