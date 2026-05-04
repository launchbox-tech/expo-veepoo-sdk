import type { DeviceBTState, DeviceBTStatus } from "../../types/index.js";
import { isRecord, toBoolean } from "../../normalizers/primitives.js";

const BT_STATE_MAP: Record<number, DeviceBTState> = {
  0: 'disconnected',
  1: 'connected',
  2: 'pairing',
};

export function normalizeDeviceBTState(value: unknown): DeviceBTState {
  if (typeof value === 'number') return BT_STATE_MAP[value] ?? 'disconnected';
  if (typeof value === 'string') {
    if (value === 'connected') return 'connected';
    if (value === 'pairing') return 'pairing';
  }
  return 'disconnected';
}

export function normalizeDeviceBTStatus(value: unknown): DeviceBTStatus {
  if (!isRecord(value)) {
    return {
      isBTOpen: false,
      isAutoConnect: false,
      isAudioOpen: false,
      hasPairInfo: false,
      state: 'disconnected',
    };
  }
  return {
    isBTOpen: toBoolean(value.isBTOpen),
    isAutoConnect: toBoolean(value.isAutoCon ?? value.isAutoConnect),
    isAudioOpen: toBoolean(value.isAudioOpen),
    hasPairInfo: toBoolean(value.isHavePairInfo ?? value.hasPairInfo),
    state: normalizeDeviceBTState(value.status ?? value.state),
  };
}
