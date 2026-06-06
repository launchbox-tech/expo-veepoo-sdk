import type { EventSubscription } from "expo-modules-core";
import type { VeepooEvent, VeepooEventPayload } from "../types/index";
export type EventListener = (payload: unknown) => void;
export declare class EventBus {
    private readonly onListenerError;
    private readonly listeners;
    private nativeSubscriptions;
    private listenersSetup;
    constructor(onListenerError: (error: unknown, event: VeepooEvent, payload: unknown) => void);
    setupEventListeners(native: Pick<{
        addListener(event: string, listener: (payload: unknown) => void): EventSubscription;
    }, "addListener">, onEvent: (event: VeepooEvent, payload: unknown) => void): void;
    teardownNativeListeners(): void;
    emit(event: VeepooEvent, payload: unknown): void;
    on<K extends VeepooEvent>(event: K, listener: (payload: VeepooEventPayload[K]) => void): void;
    off<K extends VeepooEvent>(event: K, listener: (payload: VeepooEventPayload[K]) => void): void;
    once<K extends VeepooEvent>(event: K, listener: (payload: VeepooEventPayload[K]) => void): void;
    removeAllListeners(event?: VeepooEvent): void;
}
//# sourceMappingURL=event-bus.d.ts.map