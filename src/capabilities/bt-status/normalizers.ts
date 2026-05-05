import type { DeviceBTState, DeviceBTStatus } from "@/types/index";
import { isRecord, toBoolean } from "@/normalizers/primitives";

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
      is_bt_open: false,
      is_auto_connect: false,
      is_audio_open: false,
      has_pair_info: false,
      state: 'disconnected',
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
