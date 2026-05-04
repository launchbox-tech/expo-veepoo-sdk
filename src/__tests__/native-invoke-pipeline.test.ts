import { invokeOrThrow, invokeWithRecovery } from "../bridge/native-invoke-pipeline.js";
import type { VeepooError } from "../types/errors.js";

describe("invokeOrThrow", () => {
  it("happy path — validate called, normalize applied, afterSuccess called, result returned", async () => {
    const validate = jest.fn();
    const afterSuccess = jest.fn();
    const out = await invokeOrThrow({
      validate,
      invoke: async () => ({ x: 1 }),
      normalize: (raw: unknown) => ({ y: (raw as { x: number }).x * 2 }),
      mapError: () => ({ code: "UNKNOWN", message: "unexpected" } as VeepooError),
      afterSuccess,
    });
    expect(validate).toHaveBeenCalled();
    expect(out).toEqual({ y: 2 });
    expect(afterSuccess).toHaveBeenCalledWith({ y: 2 });
  });

  it("error path — thrown value is the exact VeepooError object returned by mapError", async () => {
    const expectedError: VeepooError = { code: "OPERATION_FAILED", message: "native fail" } as VeepooError;
    const mapError = jest.fn(() => expectedError);

    let thrownError: unknown;
    try {
      await invokeOrThrow({
        invoke: async () => {
          throw new Error("native error");
        },
        mapError,
      });
    } catch (e) {
      thrownError = e;
    }

    expect(mapError).toHaveBeenCalledTimes(1);
    expect(thrownError).toBe(expectedError);
  });

  it("validate throws — invoke is never called", async () => {
    const invoke = jest.fn(async () => "should not run");
    await expect(
      invokeOrThrow({
        validate: () => {
          throw Object.assign(new Error("bad input"), { code: "INVALID_PARAMETER" });
        },
        invoke,
        mapError: () => ({ code: "UNKNOWN", message: "unexpected" } as VeepooError),
      }),
    ).rejects.toMatchObject({ code: "INVALID_PARAMETER" });
    expect(invoke).not.toHaveBeenCalled();
  });
});

describe("invokeWithRecovery", () => {
  it("happy path — result returned normally", async () => {
    const out = await invokeWithRecovery({
      invoke: async () => ({ x: 42 }),
      normalize: (raw: unknown) => (raw as { x: number }).x,
      recover: () => -1,
    });
    expect(out).toBe(42);
  });

  it("error path — recover called, fallback returned, no exception thrown", async () => {
    const recover = jest.fn((_err: unknown) => 99);
    const out = await invokeWithRecovery({
      invoke: async () => {
        throw new Error("transient failure");
      },
      recover,
    });
    expect(recover).toHaveBeenCalledTimes(1);
    expect(out).toBe(99);
  });
});
