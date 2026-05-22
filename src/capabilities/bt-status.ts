import type { CapabilityContext } from "@/capabilities/shared/context";
import { isRecord, toBoolean } from "@/shared/primitives";

// ── Types ────────────────────────────────────────────────────────────────────

/** Band's classic Bluetooth connection state (used in `deviceBTStateChanged` event). */
export type DeviceBTState = "disconnected" | "connected" | "pairing";

/**
 * Band's classic Bluetooth status returned by `readDeviceBTStatus`.
 * Classic BT is the secondary radio used for phone-call audio forwarding.
 */
export interface DeviceBTStatus {
  /** Whether the Band's classic BT radio is on. */
  is_bt_open: boolean;
  /** Whether the Band auto-reconnects classic BT. */
  is_auto_connect: boolean;
  /** Whether multimedia audio is routed through the Band. */
  is_audio_open: boolean;
  /** Whether pairing info exists on the Band. */
  has_pair_info: boolean;
  /** Current connection state. */
  state: DeviceBTState;
}

// ── Native methods ──────────────────────────────────────────────────────────

export interface BtStatusNativeMethods {
  readDeviceBTStatus(): Promise<unknown>;
  setDeviceBTSwitch(open: boolean): Promise<void>;
}

// ── Normalizers ─────────────────────────────────────────────────────────────

const BT_STATE_MAP: Record<number, DeviceBTState> = {
  0: "disconnected",
  1: "connected",
  2: "pairing",
};

export function normalizeDeviceBTState(value: unknown): DeviceBTState {
  if (typeof value === "number") return BT_STATE_MAP[value] ?? "disconnected";
  if (typeof value === "string") {
    if (value === "connected") return "connected";
    if (value === "pairing") return "pairing";
  }
  return "disconnected";
}

export function normalizeDeviceBTStatus(value: unknown): DeviceBTStatus {
  if (!isRecord(value)) {
    return {
      is_bt_open: false,
      is_auto_connect: false,
      is_audio_open: false,
      has_pair_info: false,
      state: "disconnected",
    };
  }
  return {
    is_bt_open: toBoolean(value.isBTOpen ?? value.is_bt_open),
    is_auto_connect: toBoolean(value.isAutoCon ?? value.isAutoConnect ?? value.is_auto_connect),
    is_audio_open: toBoolean(value.isAudioOpen ?? value.is_audio_open),
    has_pair_info: toBoolean(value.isHavePairInfo ?? value.hasPairInfo ?? value.has_pair_info),
    state: normalizeDeviceBTState(value.status ?? value.state),
  };
}

// ── Capability ──────────────────────────────────────────────────────────────

export class BtStatusCapability {
  constructor(private readonly ctx: CapabilityContext<BtStatusNativeMethods>) {}

  readDeviceBTStatus(): Promise<DeviceBTStatus> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.readDeviceBTStatus(),
      normalize: normalizeDeviceBTStatus,
    });
  }

  setDeviceBTSwitch(open: boolean): Promise<void> {
    return this.ctx.invoke({
      invoke: () => this.ctx.native.setDeviceBTSwitch(open),
    });
  }
}
