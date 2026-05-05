import type { EventSubscription } from "expo-modules-core";
import type { VeepooEvent, VeepooEventPayload } from "@/types/index";
import { NATIVE_EMITTED_EVENTS, NATIVE_TO_JS_EVENT_MAP } from "./veepoo-events-registry";

export type EventListener = (payload: unknown) => void;

export class EventBus {
  private readonly listeners: Map<VeepooEvent, Set<EventListener>> = new Map();
  private nativeSubscriptions: EventSubscription[] = [];
  private listenersSetup = false;

  constructor(
    private readonly onListenerError?: (
      error: unknown,
      event: VeepooEvent,
      payload: unknown,
    ) => void,
  ) {}

  setupEventListeners(
    native: Pick<{ addListener(event: string, listener: (payload: unknown) => void): EventSubscription }, "addListener">,
    onEvent: (event: VeepooEvent, payload: unknown) => void,
  ): void {
    if (this.listenersSetup) return;
    this.listenersSetup = true;

    NATIVE_EMITTED_EVENTS.forEach(nativeEvent => {
      const jsEvent = NATIVE_TO_JS_EVENT_MAP[nativeEvent] as VeepooEvent;
      const subscription = native.addListener(nativeEvent, (payload: unknown) => {
        onEvent(jsEvent, payload);
      });
      this.nativeSubscriptions.push(subscription);
    });
  }

  teardownNativeListeners(): void {
    this.nativeSubscriptions.forEach(sub => sub.remove());
    this.nativeSubscriptions = [];
    this.listenersSetup = false;
  }

  emit(event: VeepooEvent, payload: unknown): void {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return;
    eventListeners.forEach(listener => {
      try {
        listener(payload);
      } catch (e) {
        if (this.onListenerError) {
          this.onListenerError(e, event, payload);
        } else {
          console.error(`Error in event listener for ${event}:`, e);
        }
      }
    });
  }

  on<K extends VeepooEvent>(
    event: K,
    listener: (payload: VeepooEventPayload[K]) => void,
  ): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(listener as EventListener);
  }

  off<K extends VeepooEvent>(
    event: K,
    listener: (payload: VeepooEventPayload[K]) => void,
  ): void {
    this.listeners.get(event)?.delete(listener as EventListener);
  }

  once<K extends VeepooEvent>(
    event: K,
    listener: (payload: VeepooEventPayload[K]) => void,
  ): void {
    const wrapper: EventListener = payload => {
      this.listeners.get(event)?.delete(wrapper);
      (listener as EventListener)(payload);
    };
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(wrapper);
  }

  removeAllListeners(event?: VeepooEvent): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }
}
