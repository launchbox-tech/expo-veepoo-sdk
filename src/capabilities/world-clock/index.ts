import { invokeOrThrow } from "@/bridge/native-invoke-pipeline";
import type { ThrowingInvoke } from "@/bridge/native-invoke-pipeline";
import type { CapabilityContext } from "@/capabilities/shared/context";
import type { WorldClockNativeMethods } from "./native";
import { normalizeWorldClockList } from "./normalizers";
import { validateWorldClockList } from "./validators";
import type { WorldClockEntry, OperationStatus } from "@/types/index";
import { deepCamelKeys } from "@/normalizers/deep-keys";

export class WorldClockCapability {
  constructor(private readonly ctx: CapabilityContext<WorldClockNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  readWorldClock(): Promise<WorldClockEntry[]> {
    return this.call({
      invoke: () => this.ctx.native.readWorldClock(),
      normalize: normalizeWorldClockList,
    });
  }

  setWorldClock(clocks: WorldClockEntry[]): Promise<OperationStatus> {
    return this.call({
      validate: () => validateWorldClockList(clocks),
      invoke: () => this.ctx.native.setWorldClock(clocks.map((c) => deepCamelKeys(c) as WorldClockEntry)),
    });
  }
}
