import { isRecord } from '@/normalizers/primitives';
import { type PartialEventNormalizers } from '@/bridge/event-envelope';
import { normalizeFindDeviceStatePayload } from './normalizers';

export const EVENT_NORMALIZERS = {
  find_device_state: (raw) => {
    const p = isRecord(raw) ? raw : {};
    return normalizeFindDeviceStatePayload(p);
  },
} satisfies PartialEventNormalizers;
