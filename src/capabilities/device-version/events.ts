import { wrapInner, type PartialEventNormalizers } from '@/bridge/event-envelope';
import { normalizeDeviceVersion } from './normalizers';

export const EVENT_NORMALIZERS = {
  device_version: wrapInner('version', normalizeDeviceVersion),
} satisfies PartialEventNormalizers;
