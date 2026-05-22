import type {
  ConnectionStatus,
  VeepooEvent,
  VeepooEventPayload,
} from "@/types/index";
import type { OriginReadPipeline } from "@/bridge/origin-read-pipeline";
import type { VeepooSdkState } from "./veepoo-sdk-state";

/**
 * Pure reducer for native-event → SDK-state side effects.
 *
 * `VeepooSDKRuntime.emitLocal` used to inline this as a chain of
 * `if (event === "…")` branches over normalized payloads; pulling it
 * out makes the state transitions independently testable without
 * spinning up an EventBus, NativeVeepooSDK, or logger.
 *
 * The reducer is **fire-and-forget**: it mutates `state` (and clears
 * `originReadPipeline` device entries on disconnect) but does not
 * return anything. The caller decides what to do with the event after
 * the reducer has run (typically: log + bus.emit).
 */
export interface ReducerContext {
  state: VeepooSdkState;
  originReadPipeline: OriginReadPipeline;
}

type StateReducer<K extends VeepooEvent> = (
  payload: VeepooEventPayload[K],
  ctx: ReducerContext,
) => void;

type StateReducers = Partial<{ [K in VeepooEvent]: StateReducer<K> }>;

const REDUCERS = {
  bluetooth_state_changed: (payload, { state }) => {
    if (typeof payload.is_scanning === "boolean") {
      state.setScanning(payload.is_scanning);
    }
  },
  device_connected: (payload, { state }) => {
    state.onDeviceConnected(payload.device_id ?? "");
  },
  device_disconnected: (payload, { state, originReadPipeline }) => {
    state.onDeviceDisconnected(payload.device_id);
    if (payload.device_id) {
      originReadPipeline.clearDevice(payload.device_id);
    }
  },
  device_connect_status: (payload, { state }) => {
    applyConnectionStatusChanged(payload, state);
  },
  connection_status_changed: (payload, { state }) => {
    applyConnectionStatusChanged(payload, state);
  },
} satisfies StateReducers;

function applyConnectionStatusChanged(
  payload: { device_id?: string; status?: ConnectionStatus },
  state: VeepooSdkState,
): void {
  if (payload.status) {
    state.onConnectionStatusChanged(payload.device_id, payload.status);
  }
}

/**
 * Applies state side-effects for `event`+`payload`. No-op for events
 * that do not affect SDK state. Pure with respect to the rest of the
 * world: depends only on `state` and `originReadPipeline`.
 */
export function applyStateEvent<K extends VeepooEvent>(
  event: K,
  payload: VeepooEventPayload[K],
  ctx: ReducerContext,
): void {
  const reducer = (REDUCERS as Record<string, StateReducer<K> | undefined>)[event];
  reducer?.(payload, ctx);
}
