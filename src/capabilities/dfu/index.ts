import type { CapabilityContext } from "@/capabilities/shared/context";
import type { DfuNativeMethods } from "./native";
import { validateFirmwareDfuFilePath } from "./validators";

export class DfuCapability {
  constructor(private readonly ctx: CapabilityContext<DfuNativeMethods>) {}

  /**
   * Local-file firmware DFU. Listen to `firmwareDfuProgress`. **High risk:** can brick a Band if misused.
   * Android: JL-platform Bands only (`VPOperateManager.isJLDevice`). iOS: `VPDFUOperation` local file path.
   */
  startLocalFirmwareDfu(filePath: string): Promise<void> {
    return this.ctx.invoke({
      validate: () => validateFirmwareDfuFilePath(filePath),
      invoke: () => this.ctx.native.startLocalFirmwareDfu(filePath.trim()),
    });
  }
}
