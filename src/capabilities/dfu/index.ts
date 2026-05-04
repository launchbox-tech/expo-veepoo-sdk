import { invokeOrThrow } from "../../bridge/native-invoke-pipeline.js";
import type { ThrowingInvoke } from "../../bridge/native-invoke-pipeline.js";
import type { CapabilityContext } from "../shared/context.js";
import type { DfuNativeMethods } from "./native.js";
import { validateFirmwareDfuFilePath } from "./validators.js";

export class DfuCapability {
  constructor(private readonly ctx: CapabilityContext<DfuNativeMethods>) {}

  private call<T>(opts: Omit<ThrowingInvoke<T>, "mapError">): Promise<T> {
    return invokeOrThrow({ ...opts, mapError: (e) => this.ctx.mapError(e) });
  }

  /**
   * Local-file firmware DFU. Listen to `firmwareDfuProgress`. **High risk:** can brick a Band if misused.
   * Android: JL-platform Bands only (`VPOperateManager.isJLDevice`). iOS: `VPDFUOperation` local file path.
   */
  startLocalFirmwareDfu(filePath: string): Promise<void> {
    return this.call({
      validate: () => validateFirmwareDfuFilePath(filePath),
      invoke: () => this.ctx.native.startLocalFirmwareDfu(filePath.trim()),
    });
  }
}
