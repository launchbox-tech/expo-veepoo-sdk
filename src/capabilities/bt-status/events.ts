import type { VeepooEventPayload } from '@/types/index';
import { isRecord } from '@/normalizers/primitives';
import { type PartialEventNormalizers } from '@/bridge/event-envelope';
import { normalizeDeviceBTState } from './normalizers';

export const EVENT_NORMALIZERS = {
  device_bt_state_changed: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return {
      ...p,
      state: normalizeDeviceBTState(p.state ?? p.btState),
      bt_switch_open: (p.btSwitchOpen ?? p.bt_switch_open) === true,
      media_switch_open: (p.mediaSwitchOpen ?? p.media_switch_open) === true,
    } as VeepooEventPayload['device_bt_state_changed'];
  },
} satisfies PartialEventNormalizers;
