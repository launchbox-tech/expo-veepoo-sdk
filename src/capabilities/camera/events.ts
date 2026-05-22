import { wrapInner, type PartialEventNormalizers } from '@/bridge/event-envelope';
import { normalizeCameraShutterStatus } from './normalizers';

export const EVENT_NORMALIZERS = {
  camera_shutter: wrapInner('status', normalizeCameraShutterStatus),
} satisfies PartialEventNormalizers;
