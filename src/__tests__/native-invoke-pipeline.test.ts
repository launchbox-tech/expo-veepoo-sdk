import { invokeNative } from "../bridge/native-invoke-pipeline.js";

describe("invokeNative", () => {
  it("runs validate, invoke, normalize, afterSuccess on happy path", async () => {
    const validate = jest.fn();
    const afterSuccess = jest.fn();
    const out = await invokeNative({
      validate,
      invoke: async () => ({ x: 1 }),
      normalize: (raw: unknown) => ({ y: (raw as { x: number }).x * 2 }),
      fallbackCode: "UNKNOWN",
      throwMapped: () => {
        throw new Error("unexpected");
      },
      afterSuccess,
    });
    expect(validate).toHaveBeenCalled();
    expect(out).toEqual({ y: 2 });
    expect(afterSuccess).toHaveBeenCalledWith({ y: 2 });
  });

  it("throwMapped receives native errors", async () => {
    const throwMapped = jest.fn((e: unknown) => {
      throw e;
    });
    await expect(
      invokeNative({
        invoke: async () => {
          throw Object.assign(new Error("n"), { code: "SDK_NOT_INITIALIZED" });
        },
        fallbackCode: "UNKNOWN",
        throwMapped,
      }),
    ).rejects.toMatchObject({ code: "SDK_NOT_INITIALIZED" });
    expect(throwMapped).toHaveBeenCalledTimes(1);
  });

  it("recover swallows rejection", async () => {
    const out = await invokeNative({
      invoke: async () => {
        throw new Error("x");
      },
      fallbackCode: "UNKNOWN",
      recover: () => 42,
    });
    expect(out).toBe(42);
  });
});
