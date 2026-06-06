import type { CapabilityContext } from "../../capabilities/shared/context";
import type { SessionNativeMethods } from "./native";
import type { ConnectOptions, ConnectionStatus, OperationStatus, PasswordData } from "../../types/index";
export declare class SessionCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<SessionNativeMethods>);
    connect(deviceId: string, options?: ConnectOptions): Promise<void>;
    disconnect(deviceId?: string): Promise<void>;
    getConnectionStatus(deviceId?: string): Promise<ConnectionStatus>;
    verifyPassword(password?: string, is24Hour?: boolean): Promise<PasswordData>;
    renameDevice(name: string): Promise<OperationStatus>;
    isConnectionConfirmEnabled(): Promise<boolean>;
    setConnectionConfirmEnabled(enabled: boolean): Promise<OperationStatus>;
    setConnectionConfirmTimeout(seconds: number): Promise<OperationStatus>;
}
//# sourceMappingURL=index.d.ts.map