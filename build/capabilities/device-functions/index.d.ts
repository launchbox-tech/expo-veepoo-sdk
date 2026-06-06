import type { CapabilityContext } from "../../capabilities/shared/context";
import type { DeviceFunctionsNativeMethods } from "./native";
import type { DeviceFunctions } from "../../types/index";
export declare class DeviceFunctionsCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<DeviceFunctionsNativeMethods>);
    readDeviceFunctions(): Promise<DeviceFunctions>;
}
//# sourceMappingURL=index.d.ts.map