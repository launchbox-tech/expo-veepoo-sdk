import type { CapabilityContext } from "../../capabilities/shared/context";
import type { SessionNativeMethods } from "./native";
import type { ConnectOptions, ConnectionStatus, OperationStatus, PasswordData, RestorationState } from "../../types/index";
export declare class SessionCapability {
    private readonly ctx;
    constructor(ctx: CapabilityContext<SessionNativeMethods>);
    connect(deviceId: string, options?: ConnectOptions): Promise<void>;
    disconnect(deviceId?: string): Promise<void>;
    /**
     * [RESTORATION] Whether iOS armed CoreBluetooth state restoration, and whether
     * this launch was one iOS started to resume BLE work. Never throws — a failure
     * to read it must not block session start, so it degrades to "unsupported".
     */
    getRestorationState(): Promise<RestorationState>;
    getConnectionStatus(deviceId?: string): Promise<ConnectionStatus>;
    verifyPassword(password?: string, is24Hour?: boolean): Promise<PasswordData>;
    renameDevice(name: string): Promise<OperationStatus>;
    isConnectionConfirmEnabled(): Promise<boolean>;
    setConnectionConfirmEnabled(enabled: boolean): Promise<OperationStatus>;
    setConnectionConfirmTimeout(seconds: number): Promise<OperationStatus>;
}
//# sourceMappingURL=index.d.ts.map