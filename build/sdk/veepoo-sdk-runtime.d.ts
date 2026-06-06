import type { LogListener, VeepooEvent, VeepooEventPayload } from "../types/index";
import type { NativeVeepooSDKInterface } from "../native-veepoo-sdk";
import { VeepooSdkState } from "./veepoo-sdk-state";
import type { CapabilityContext } from "../capabilities/shared/context";
/**
 * Shared **Session** / scan / init state (`state`), logging, and wiring between
 * the native module, `EventBus`, and domain subsystems.
 */
export declare class VeepooSDKRuntime {
    readonly native: NativeVeepooSDKInterface;
    readonly state: VeepooSdkState;
    private readonly originReadPipeline;
    private readonly bus;
    private logEnabled;
    private logger;
    constructor(native: NativeVeepooSDKInterface);
    private getPlatform;
    private log;
    private setupEventListeners;
    emitLocal(event: VeepooEvent, payload: unknown): void;
    private getPayloadDeviceId;
    private handleError;
    setLogEnabled(enabled: boolean): void;
    isLogEnabled(): boolean;
    setLogger(logger: LogListener | null): void;
    on<K extends VeepooEvent>(event: K, listener: (payload: VeepooEventPayload[K]) => void): void;
    off<K extends VeepooEvent>(event: K, listener: (payload: VeepooEventPayload[K]) => void): void;
    once<K extends VeepooEvent>(event: K, listener: (payload: VeepooEventPayload[K]) => void): void;
    removeAllListeners(event?: VeepooEvent): void;
    private teardownNativeListeners;
    private resetAfterDestroy;
    init(): Promise<void>;
    destroy(): void;
    createCapabilityContext(): CapabilityContext<NativeVeepooSDKInterface>;
}
//# sourceMappingURL=veepoo-sdk-runtime.d.ts.map