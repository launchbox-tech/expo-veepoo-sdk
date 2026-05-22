import type { VeepooEventPayload } from '@/types/index';
import { isRecord } from '@/shared/primitives';
import { passthrough, wrapInner, type PartialEventNormalizers } from '@/bridge/event-envelope';
import { normalizeBluetoothStatus, normalizePasswordData } from './normalizers';

export const EVENT_NORMALIZERS = {
  device_connected: passthrough<'device_connected'>(),
  device_disconnected: passthrough<'device_disconnected'>(),
  device_connect_status: passthrough<'device_connect_status'>(),
  device_ready: passthrough<'device_ready'>(),
  connection_status_changed: passthrough<'connection_status_changed'>(),
  password_data: wrapInner('data', normalizePasswordData),
  bluetooth_state_changed: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return normalizeBluetoothStatus(p) as VeepooEventPayload['bluetooth_state_changed'];
  },
} satisfies PartialEventNormalizers;
