import {
  NATIVE_ASYNC_METHOD_NAMES,
  NATIVE_ASYNC_REGISTRY_INTEGRITY,
} from "../bridge-contract/async-native-method-registry";

describe("NATIVE_ASYNC_METHOD_NAMES (#84)", () => {
  it("compile-time integrity export is true", () => {
    expect(NATIVE_ASYNC_REGISTRY_INTEGRITY).toBe(true);
  });

  it("has one entry per Expo AsyncFunction on the native module (50)", () => {
    expect(NATIVE_ASYNC_METHOD_NAMES.length).toBe(50);
    expect(new Set(NATIVE_ASYNC_METHOD_NAMES).size).toBe(50);
  });
});
