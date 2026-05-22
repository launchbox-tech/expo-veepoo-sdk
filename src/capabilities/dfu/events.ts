import { type PartialEventNormalizers } from '@/bridge/event-envelope';
import { normalizeFirmwareDfuProgress } from './normalizers';

export const EVENT_NORMALIZERS = {
  firmware_dfu_progress: (raw) => normalizeFirmwareDfuProgress(raw),
} satisfies PartialEventNormalizers;
