import type { CapabilityContext } from "@/capabilities/shared/context";
import type { WorldClockNativeMethods } from "./native";
import { normalizeWorldClockList } from "./normalizers";
import { validateWorldClockList } from "./validators";
import type { WorldClockEntry, OperationStatus } from "@/types/index";
import { deepCamelKeys } from "@/normalizers/deep-keys";

export class WorldClockCapability {
  constructor(private readonly ctx: CapabilityContext<WorldClockNativeMethods>) {}

  readWorldClock(): Promise<WorldClockEntry[]> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readWorldClock(),
      normalize: normalizeWorldClockList,
    });
  }

  setWorldClock(clocks: WorldClockEntry[]): Promise<OperationStatus> {
    return this.ctx.invoke({
      validate: () => validateWorldClockList(clocks),
      invoke: () => this.ctx.native.setWorldClock(clocks.map((c) => deepCamelKeys(c) as WorldClockEntry)),
    });
  }
}
